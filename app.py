"""
Content Studio — Flask Web Application
Serves the frontend and exposes an API for CrewAI content generation.
Enhanced with: language support, word count targets, content history API,
health check, and improved error handling.
"""

import sys
import os
import json
import hashlib
from pathlib import Path

# Fix emoji printing on Windows
if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8")

from flask import Flask, render_template, request, jsonify, send_from_directory
from crewai import Agent, Task, Crew, LLM
from datetime import datetime

app = Flask(__name__)

# ============================================
# LLM CONFIGURATION
# ============================================

llm = LLM(
    model="llama-3.3-70b-versatile",
    api_key="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",
    base_url="https://api.groq.com/openai/v1"
)

# ============================================
# IN-MEMORY CACHE
# ============================================
content_cache = {}

def cache_key(topic, audience, tone):
    raw = f"{topic}|{audience}|{tone}".lower().strip()
    return hashlib.md5(raw.encode()).hexdigest()

# ============================================
# ROUTES
# ============================================

@app.route("/")
def index():
    return render_template("index.html")


@app.route("/api/health")
def health():
    """Health check endpoint."""
    return jsonify({
        "status": "ok",
        "timestamp": datetime.now().isoformat(),
        "model": "llama-3.3-70b-versatile",
        "version": "2.0.0"
    })


@app.route("/api/generate", methods=["POST"])
def generate():
    """Generate a content package using CrewAI agents."""
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

        # Check cache
        ck = cache_key(topic, audience, tone)
        if ck in content_cache:
            cached = content_cache[ck].copy()
            cached["from_cache"] = True
            cached["generated_at"] = datetime.now().isoformat()
            return jsonify(cached)

        lang_instruction = f" Write all content in {language}." if language != "English" else ""

        # --- Create agents ---
        research_agent = Agent(
            role="Research Analyst",
            goal=f"Research and analyze topics deeply to provide accurate, comprehensive information.{lang_instruction}",
            backstory="You are an expert researcher who digs into topics and finds the most relevant, accurate information.",
            llm=llm, verbose=True
        )
        blog_agent = Agent(
            role="Blog Writer",
            goal=f"Write engaging, SEO-friendly blog posts that inform and captivate readers.{lang_instruction}",
            backstory="You are an expert blog writer who creates compelling content that ranks well and engages readers.",
            llm=llm, verbose=True
        )
        social_agent = Agent(
            role="Social Media Specialist",
            goal=f"Create catchy, platform-specific social media posts that drive engagement.{lang_instruction}",
            backstory="You are a social media expert who crafts posts that go viral and drive engagement across all platforms.",
            llm=llm, verbose=True
        )
        email_agent = Agent(
            role="Email Marketing Expert",
            goal=f"Write compelling email newsletters that convert readers into engaged subscribers.{lang_instruction}",
            backstory="You are an email marketing expert who writes subject lines and content that people actually open and read.",
            llm=llm, verbose=True
        )
        video_agent = Agent(
            role="Video Script Writer",
            goal=f"Write engaging, structured video scripts for YouTube and TikTok.{lang_instruction}",
            backstory="You are a video script writer who understands pacing, hooks, and what keeps viewers watching.",
            llm=llm, verbose=True
        )

        # --- Create tasks ---
        agents_list = [research_agent]
        tasks = []

        research_task = Task(
            description=f"Research and gather comprehensive information about: {topic}. "
                        f"Target audience: {audience}. Tone: {tone}. "
                        f"Find key insights, statistics, and interesting angles.{lang_instruction}",
            agent=research_agent,
            expected_output="A detailed research report with key findings, statistics, and insights"
        )
        tasks.append(research_task)

        if include_blog:
            agents_list.append(blog_agent)
            tasks.append(Task(
                description=f"Based on the research, write a {word_count}-word blog post about: {topic}. "
                            f"Audience: {audience}. Tone: {tone}. "
                            f"Make it engaging, well-structured, and SEO-optimized. "
                            f"Use markdown formatting with headers (##), bold (**), bullet points, etc.{lang_instruction}",
                agent=blog_agent,
                expected_output=f"A complete {word_count}-word blog post with title, sections, and engaging content in markdown format"
            ))

        if include_social:
            agents_list.append(social_agent)
            tasks.append(Task(
                description=f"Create social media posts for LinkedIn (professional), Twitter/X (witty, under 280 chars), "
                            f"Instagram (visual with hashtags), TikTok (trendy) about: {topic}. "
                            f"Audience: {audience}. Tone: {tone}.{lang_instruction}",
                agent=social_agent,
                expected_output="4 different social media posts optimized for each platform with platform-specific formatting"
            ))

        if include_email:
            agents_list.append(email_agent)
            tasks.append(Task(
                description=f"Write a 3-part email newsletter series about: {topic}. "
                            f"Audience: {audience}. Tone: {tone}. "
                            f"Include compelling subject lines, engaging copy, and clear CTAs. "
                            f"Format each email clearly with Email 1, Email 2, Email 3 headers.{lang_instruction}",
                agent=email_agent,
                expected_output="3 complete emails with subject lines, body copy, and CTAs, ready to send"
            ))

        if include_video:
            agents_list.append(video_agent)
            tasks.append(Task(
                description=f"Write a video script for a 5-minute YouTube video about: {topic}. "
                            f"Audience: {audience}. Tone: {tone}. "
                            f"Include hooks (0-15s), main sections with timestamps, and visual cues in brackets [].{lang_instruction}",
                agent=video_agent,
                expected_output="A complete, ready-to-film video script with timestamps and visual cues"
            ))

        # --- Run the crew ---
        crew = Crew(agents=agents_list, tasks=tasks, verbose=True, max_iter=2)
        result = crew.kickoff(inputs={"topic": topic})

        # --- Parse results ---
        task_outputs = result.tasks_output if hasattr(result, 'tasks_output') else []
        content = {}
        task_index = 0

        content["research"] = str(task_outputs[task_index]) if task_index < len(task_outputs) else ""
        task_index += 1

        if include_blog:
            content["blog"] = str(task_outputs[task_index]) if task_index < len(task_outputs) else ""
            task_index += 1
        if include_social:
            content["social"] = str(task_outputs[task_index]) if task_index < len(task_outputs) else ""
            task_index += 1
        if include_email:
            content["email"] = str(task_outputs[task_index]) if task_index < len(task_outputs) else ""
            task_index += 1
        if include_video:
            content["video"] = str(task_outputs[task_index]) if task_index < len(task_outputs) else ""
            task_index += 1

        # Fallback: if parsing by tasks_output failed, use the raw result
        if not any(content.values()):
            raw = str(result)
            content = {
                "research": raw,
                "blog": raw if include_blog else "",
                "social": raw if include_social else "",
                "email": raw if include_email else "",
                "video": raw if include_video else "",
            }

        # Compute stats
        total_words = sum(len(v.split()) for v in content.values() if v)
        total_chars = sum(len(v) for v in content.values() if v)

        response_data = {
            "topic": topic,
            "generated_at": datetime.now().isoformat(),
            "audience": audience,
            "tone": tone,
            "language": language,
            "word_count_target": word_count,
            "content": content,
            "stats": {
                "total_words": total_words,
                "total_characters": total_chars,
                "reading_time_minutes": max(1, total_words // 200),
                "agents_used": len(agents_list),
                "content_types": sum([include_blog, include_social, include_email, include_video]),
            },
            "from_cache": False
        }

        # Cache it
        content_cache[ck] = response_data

        return jsonify(response_data)

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ============================================
# RUN
# ============================================

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)
