"""
Multi-Agent Content Studio
A system where multiple AI agents collaborate to generate content for different platforms
"""

from crewai import Agent, Task, Crew, LLM
import json
import sys
from datetime import datetime

# Fix for printing emojis in Windows terminal
if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8")

# Initialize the LLM
# Using Groq (free, fast) - you can swap this for other providers
llm = LLM(
    model="llama-3.3-70b-versatile",  # Free Groq model
    api_key="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",  # Get from groq.com
    base_url="https://api.groq.com/openai/v1"
)

# ============================================
# DEFINE YOUR AGENTS
# ============================================

research_agent = Agent(
    role="Research Analyst",
    goal="Research and analyze topics deeply to provide accurate, comprehensive information",
    backstory="You are an expert researcher who digs into topics and finds the most relevant, accurate information.",
    llm=llm,
    verbose=True
)

blog_writer_agent = Agent(
    role="Blog Writer",
    goal="Write engaging, SEO-friendly blog posts that inform and captivate readers",
    backstory="You are an expert blog writer who creates compelling content that ranks well and engages readers.",
    llm=llm,
    verbose=True
)

social_media_agent = Agent(
    role="Social Media Specialist",
    goal="Create catchy, platform-specific social media posts that drive engagement",
    backstory="You are a social media expert who crafts posts that go viral and drive engagement across all platforms.",
    llm=llm,
    verbose=True
)

email_agent = Agent(
    role="Email Marketing Expert",
    goal="Write compelling email newsletters that convert readers into engaged subscribers",
    backstory="You are an email marketing expert who writes subject lines and content that people actually open and read.",
    llm=llm,
    verbose=True
)

video_script_agent = Agent(
    role="Video Script Writer",
    goal="Write engaging, structured video scripts for YouTube and TikTok",
    backstory="You are a video script writer who understands pacing, hooks, and what keeps viewers watching.",
    llm=llm,
    verbose=True
)

# ============================================
# DEFINE YOUR TASKS
# ============================================

research_task = Task(
    description="Research and gather comprehensive information about: {topic}. Find key insights, statistics, and interesting angles.",
    agent=research_agent,
    expected_output="A detailed research report with key findings, statistics, and insights"
)

blog_task = Task(
    description="Based on the research, write a 1500-word blog post about: {topic}. Make it engaging, well-structured, and SEO-optimized.",
    agent=blog_writer_agent,
    expected_output="A complete blog post with title, sections, and engaging content"
)

social_task = Task(
    description="Create social media posts for: LinkedIn (professional), Twitter (witty), Instagram (visual), TikTok (trendy). Based on: {topic}",
    agent=social_media_agent,
    expected_output="4 different social media posts optimized for each platform"
)

email_task = Task(
    description="Write a 3-part email newsletter series about: {topic}. Include subject lines, engaging copy, and CTAs.",
    agent=email_agent,
    expected_output="3 complete emails ready to send to subscribers"
)

video_task = Task(
    description="Write a video script for a 5-minute YouTube video about: {topic}. Include hooks, sections, and visual cues.",
    agent=video_script_agent,
    expected_output="A complete, ready-to-film video script"
)

# ============================================
# CREATE THE CREW
# ============================================

content_crew = Crew(
    agents=[research_agent, blog_writer_agent, social_media_agent, email_agent, video_script_agent],
    tasks=[research_task, blog_task, social_task, email_task, video_task],
    verbose=True,
    max_iter=2
)

# ============================================
# RUN IT!
# ============================================

def generate_content_package(topic: str):
    """Generate a complete content package for a topic"""
    
    print(f"\n{'='*60}")
    print(f"🚀 CONTENT STUDIO: Generating content for '{topic}'")
    print(f"{'='*60}\n")
    
    # Run the crew
    result = content_crew.kickoff(inputs={"topic": topic})
    
    # Save results
    output = {
        "topic": topic,
        "generated_at": datetime.now().isoformat(),
        "content": result
    }
    
    # Save to file
    filename = f"content_{topic.replace(' ', '_')}.json"
    with open(filename, 'w', encoding='utf-8') as f:
        json.dump(output, f, indent=2)
    
    print(f"\n✅ Content package saved to {filename}")
    return result


if __name__ == "__main__":
    # Example: Generate content about AI Agents
    topic = "How AI Agents are Transforming Business Automation"
    generate_content_package(topic)
