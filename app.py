"""
Content Studio — Flask Web Application
Serves the frontend and exposes an API for CrewAI content generation.
Enhanced with: Authentication, DB History, and language support.
"""

import sys
import os
import json
import hashlib
from pathlib import Path
from datetime import datetime

# Fix emoji printing on Windows
if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8")

from flask import Flask, render_template, request, jsonify, redirect, url_for, flash
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager, UserMixin, login_user, login_required, logout_user, current_user
from werkzeug.security import generate_password_hash, check_password_hash
from crewai import Agent, Task, Crew, LLM

app = Flask(__name__)
app.config['SECRET_KEY'] = 'your-secret-key-123'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///contentstudio.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)
login_manager = LoginManager(app)
login_manager.login_view = 'login'

# ============================================
# DATABASE MODELS
# ============================================
class User(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(150), unique=True, nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)
    history = db.relationship('History', backref='user', lazy=True)

class History(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    topic = db.Column(db.String(200), nullable=False)
    audience = db.Column(db.String(100))
    tone = db.Column(db.String(100))
    content_json = db.Column(db.Text, nullable=False)
    generated_at = db.Column(db.DateTime, default=datetime.utcnow)

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

# Create tables
with app.app_context():
    db.create_all()

# ============================================
# LLM CONFIGURATION
# ============================================
llm = LLM(
    model="llama-3.3-70b-versatile",
    api_key="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",
    base_url="https://api.groq.com/openai/v1"
)

content_cache = {}

def cache_key(topic, audience, tone):
    raw = f"{topic}|{audience}|{tone}".lower().strip()
    return hashlib.md5(raw.encode()).hexdigest()

# ============================================
# AUTH ROUTES
# ============================================
@app.route("/login", methods=["GET", "POST"])
def login():
    if request.method == "POST":
        username = request.form.get("username")
        password = request.form.get("password")
        user = User.query.filter_by(username=username).first()
        if user and check_password_hash(user.password_hash, password):
            login_user(user)
            return redirect(url_for('index'))
        else:
            flash("Invalid username or password.", "error")
    return render_template("login.html")

@app.route("/register", methods=["GET", "POST"])
def register():
    if request.method == "POST":
        username = request.form.get("username")
        password = request.form.get("password")
        if User.query.filter_by(username=username).first():
            flash("Username already exists.", "error")
        else:
            new_user = User(username=username, password_hash=generate_password_hash(password))
            db.session.add(new_user)
            db.session.commit()
            login_user(new_user)
            return redirect(url_for('index'))
    return render_template("register.html")

@app.route("/logout")
@login_required
def logout():
    logout_user()
    return redirect(url_for('login'))

# ============================================
# APP ROUTES
# ============================================
@app.route("/")
@login_required
def index():
    return render_template("index.html", username=current_user.username)

@app.route("/api/health")
def health():
    return jsonify({"status": "ok", "version": "3.0.0"})

@app.route("/api/history", methods=["GET"])
@login_required
def get_history():
    histories = History.query.filter_by(user_id=current_user.id).order_by(History.generated_at.desc()).all()
    result = []
    for h in histories:
        try:
            data = json.loads(h.content_json)
            result.append(data)
        except:
            continue
    return jsonify(result)

@app.route("/api/history", methods=["DELETE"])
@login_required
def clear_history():
    History.query.filter_by(user_id=current_user.id).delete()
    db.session.commit()
    return jsonify({"status": "ok"})

@app.route("/api/generate", methods=["POST"])
@login_required
def generate():
    try:
        data = request.get_json()
        topic = data.get("topic", "").strip()
        if not topic:
            return jsonify({"error": "Topic is required"}), 400

        audience = data.get("audience", "General Public")
        tone = data.get("tone", "Professional")
        language = data.get("language", "English")
        word_count = data.get("word_count", 1500)
        include_blog = data.get("include_blog", True)
        include_social = data.get("include_social", True)
        include_email = data.get("include_email", True)
        include_video = data.get("include_video", True)

        ck = cache_key(topic, audience, tone)
        if ck in content_cache:
            cached = content_cache[ck].copy()
            cached["from_cache"] = True
            cached["generated_at"] = datetime.utcnow().isoformat()
            
            # Save to user history
            new_history = History(
                user_id=current_user.id,
                topic=topic,
                audience=audience,
                tone=tone,
                content_json=json.dumps(cached)
            )
            db.session.add(new_history)
            db.session.commit()
            return jsonify(cached)

        lang_instruction = f" Write all content in {language}." if language != "English" else ""

        research_agent = Agent(role="Research Analyst", goal=f"Research and analyze topics.{lang_instruction}", backstory="Expert researcher.", llm=llm)
        blog_agent = Agent(role="Blog Writer", goal=f"Write SEO-friendly blog posts.{lang_instruction}", backstory="Expert blog writer.", llm=llm)
        social_agent = Agent(role="Social Media Specialist", goal=f"Create catchy social media posts.{lang_instruction}", backstory="Social media expert.", llm=llm)
        email_agent = Agent(role="Email Marketing Expert", goal=f"Write newsletters.{lang_instruction}", backstory="Email marketing expert.", llm=llm)
        video_agent = Agent(role="Video Script Writer", goal=f"Write video scripts.{lang_instruction}", backstory="Video script writer.", llm=llm)

        agents_list = [research_agent]
        tasks = []

        tasks.append(Task(description=f"Research: {topic}. Audience: {audience}. Tone: {tone}.{lang_instruction}", agent=research_agent, expected_output="Research report"))

        if include_blog:
            agents_list.append(blog_agent)
            tasks.append(Task(description=f"Write {word_count}-word blog about: {topic}. Audience: {audience}. Tone: {tone}.{lang_instruction}", agent=blog_agent, expected_output="Blog post in markdown"))
        if include_social:
            agents_list.append(social_agent)
            tasks.append(Task(description=f"Create 4 social posts (LinkedIn, Twitter, IG, TikTok) for: {topic}. Audience: {audience}. Tone: {tone}.{lang_instruction}", agent=social_agent, expected_output="4 social posts"))
        if include_email:
            agents_list.append(email_agent)
            tasks.append(Task(description=f"Write 3 emails for: {topic}. Audience: {audience}. Tone: {tone}.{lang_instruction}", agent=email_agent, expected_output="3 emails"))
        if include_video:
            agents_list.append(video_agent)
            tasks.append(Task(description=f"Write 5-min video script for: {topic}. Audience: {audience}. Tone: {tone}.{lang_instruction}", agent=video_agent, expected_output="Video script"))

        crew = Crew(agents=agents_list, tasks=tasks, verbose=True, max_iter=2)
        result = crew.kickoff(inputs={"topic": topic})

        task_outputs = result.tasks_output if hasattr(result, 'tasks_output') else []
        content = {}
        task_index = 0

        content["research"] = str(task_outputs[task_index]) if task_index < len(task_outputs) else ""
        task_index += 1
        if include_blog: content["blog"] = str(task_outputs[task_index]) if task_index < len(task_outputs) else ""; task_index += 1
        if include_social: content["social"] = str(task_outputs[task_index]) if task_index < len(task_outputs) else ""; task_index += 1
        if include_email: content["email"] = str(task_outputs[task_index]) if task_index < len(task_outputs) else ""; task_index += 1
        if include_video: content["video"] = str(task_outputs[task_index]) if task_index < len(task_outputs) else ""; task_index += 1

        if not any(content.values()):
            raw = str(result)
            content = { "research": raw, "blog": raw if include_blog else "", "social": raw if include_social else "", "email": raw if include_email else "", "video": raw if include_video else "" }

        total_words = sum(len(v.split()) for v in content.values() if v)
        total_chars = sum(len(v) for v in content.values() if v)

        response_data = {
            "topic": topic, "generated_at": datetime.utcnow().isoformat(), "audience": audience, "tone": tone,
            "language": language, "word_count_target": word_count, "content": content,
            "stats": { "total_words": total_words, "total_characters": total_chars, "reading_time_minutes": max(1, total_words // 200), "agents_used": len(agents_list) },
            "from_cache": False
        }

        content_cache[ck] = response_data
        
        # Save to user history
        new_history = History(user_id=current_user.id, topic=topic, audience=audience, tone=tone, content_json=json.dumps(response_data))
        db.session.add(new_history)
        db.session.commit()

        return jsonify(response_data)

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)
