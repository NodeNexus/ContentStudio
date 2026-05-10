"""
Streamlit UI for Multi-Agent Content Studio
Deploy this to Hugging Face Spaces for easy demo
"""

import streamlit as st
import json
from datetime import datetime
from crewai import Agent, Task, Crew
from langchain_openai import ChatOpenAI

# ============================================
# PAGE SETUP
# ============================================

st.set_page_config(
    page_title="🎬 Content Studio",
    page_icon="🎬",
    layout="wide",
    initial_sidebar_state="expanded"
)

st.title("🎬 Multi-Agent Content Studio")
st.markdown("*AI agents working together to create content across all platforms*")

# ============================================
# SIDEBAR CONFIGURATION
# ============================================

with st.sidebar:
    st.header("⚙️ Configuration")
    
    api_provider = st.selectbox(
        "Select API Provider",
        ["Groq (Free & Fast)", "Hugging Face", "AMD Cloud"]
    )
    
    api_key = st.text_input("API Key", type="password")
    
    model_choice = st.selectbox(
        "Select Model",
        ["Mixtral 8x7B (Groq)", "Qwen-7B (HF)", "Llama 2 (HF)"]
    )
    
    st.markdown("---")
    st.markdown("### 📊 Content Types")
    include_blog = st.checkbox("📝 Blog Post", value=True)
    include_social = st.checkbox("📱 Social Media", value=True)
    include_email = st.checkbox("✉️ Email Newsletter", value=True)
    include_video = st.checkbox("🎥 Video Script", value=True)

# ============================================
# MAIN CONTENT AREA
# ============================================

col1, col2 = st.columns([2, 1])

with col1:
    st.subheader("📝 Enter Your Topic")
    topic = st.text_area(
        "What topic do you want content for?",
        placeholder="e.g., 'How AI Agents are Transforming Business'",
        height=100
    )

with col2:
    st.subheader("🎯 Content Goals")
    target_audience = st.selectbox(
        "Target Audience",
        ["Tech Professionals", "Business Leaders", "Students", "General Public"]
    )
    tone = st.selectbox(
        "Tone",
        ["Professional", "Casual", "Educational", "Entertaining"]
    )

# ============================================
# GENERATE BUTTON
# ============================================

if st.button("🚀 Generate Content Package", use_container_width=True):
    if not topic:
        st.error("Please enter a topic!")
    elif not api_key:
        st.error("Please provide an API key!")
    else:
        st.info("⏳ Generating content... This may take 2-3 minutes")
        
        # Initialize LLM based on selection
        if api_provider == "Groq (Free & Fast)":
            llm = ChatOpenAI(
                model_name="mixtral-8x7b-32768",
                api_key=api_key,
                base_url="https://api.groq.com/openai/v1"
            )
        else:
            st.warning("Other providers coming soon! Use Groq for now.")
            llm = ChatOpenAI(
                model_name="mixtral-8x7b-32768",
                api_key=api_key,
                base_url="https://api.groq.com/openai/v1"
            )
        
        # Create agents
        research_agent = Agent(
            role="Research Analyst",
            goal="Research and analyze topics deeply",
            backstory="Expert researcher who finds accurate information",
            llm=llm
        )
        
        blog_agent = Agent(
            role="Blog Writer",
            goal="Write engaging blog posts",
            backstory="Expert blog writer",
            llm=llm
        )
        
        social_agent = Agent(
            role="Social Media Specialist",
            goal="Create platform-specific posts",
            backstory="Social media expert",
            llm=llm
        )
        
        email_agent = Agent(
            role="Email Marketing Expert",
            goal="Write compelling emails",
            backstory="Email marketing expert",
            llm=llm
        )
        
        video_agent = Agent(
            role="Video Script Writer",
            goal="Write video scripts",
            backstory="Video script expert",
            llm=llm
        )
        
        # Create tasks based on selections
        tasks = []
        
        research_task = Task(
            description=f"Research: {topic}. Audience: {target_audience}. Tone: {tone}",
            agent=research_agent,
            expected_output="Research findings"
        )
        tasks.append(research_task)
        
        if include_blog:
            blog_task = Task(
                description=f"Write 1500-word blog about: {topic}",
                agent=blog_agent,
                expected_output="Complete blog post"
            )
            tasks.append(blog_task)
        
        if include_social:
            social_task = Task(
                description=f"Create social posts about: {topic}",
                agent=social_agent,
                expected_output="4 platform-specific posts"
            )
            tasks.append(social_task)
        
        if include_email:
            email_task = Task(
                description=f"Write 3-email series about: {topic}",
                agent=email_agent,
                expected_output="3 complete emails"
            )
            tasks.append(email_task)
        
        if include_video:
            video_task = Task(
                description=f"Write video script about: {topic}",
                agent=video_agent,
                expected_output="5-minute video script"
            )
            tasks.append(video_task)
        
        # Create crew
        crew = Crew(
            agents=[research_agent, blog_agent, social_agent, email_agent, video_agent],
            tasks=tasks,
            verbose=True
        )
        
        try:
            # Run the crew
            result = crew.kickoff(inputs={"topic": topic})
            
            # Display results
            st.success("✅ Content Generated Successfully!")
            
            # Display content in tabs
            tabs = st.tabs(["📝 Blog", "📱 Social", "✉️ Email", "🎥 Video", "📊 Raw Output"])
            
            with tabs[0]:
                st.markdown("### Blog Post")
                st.text_area("Blog Content", result, height=400)
            
            with tabs[1]:
                st.markdown("### Social Media Posts")
                st.text_area("Social Content", result, height=400)
            
            with tabs[2]:
                st.markdown("### Email Newsletter")
                st.text_area("Email Content", result, height=400)
            
            with tabs[3]:
                st.markdown("### Video Script")
                st.text_area("Video Script", result, height=400)
            
            with tabs[4]:
                st.markdown("### Raw Output")
                st.json({"topic": topic, "output": result})
            
            # Download button
            st.download_button(
                label="📥 Download Content Package (JSON)",
                data=json.dumps({"topic": topic, "generated_at": datetime.now().isoformat(), "content": result}, indent=2),
                file_name=f"content_{topic.replace(' ', '_')}.json",
                mime="application/json"
            )
        
        except Exception as e:
            st.error(f"❌ Error generating content: {str(e)}")
            st.info("💡 Tips: Check your API key, make sure you have internet, and try a simpler topic.")

# ============================================
# FOOTER
# ============================================

st.markdown("---")
st.markdown("""
### 🏆 AMD Developer Hackathon Project
**Multi-Agent Content Studio** - AI agents collaborating to generate content across platforms

Built with: CrewAI • LangChain • Groq • Hugging Face

🔗 [GitHub](https://github.com) • 📚 [Docs](https://docs.crewai.com) • 💬 [Discord](https://discord.gg)
""")
