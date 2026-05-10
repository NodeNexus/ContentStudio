# 🚀 MULTI-AGENT CONTENT STUDIO - QUICK START

## ⏱️ 5-MINUTE SETUP

### STEP 1: Get Your API Key (2 minutes)
**Fastest option: Use Groq (FREE tier)**
1. Go to https://groq.com
2. Sign up (free)
3. Copy your API key

### STEP 2: Install Dependencies (2 minutes)
```bash
pip install -r requirements.txt
```

### STEP 3: Set Your API Key
Edit `content_studio.py` and find this line:
```python
api_key="your_groq_api_key_here",
```

Replace with your actual Groq API key:
```python
api_key="gsk_your_actual_key_here",
```

### STEP 4: Run It! (1 minute)
```bash
python content_studio.py
```

---

## 📊 WHAT YOU'LL GET

The script will generate:
- ✅ **Blog Post** (1500 words, SEO-optimized)
- ✅ **Social Media Posts** (LinkedIn, Twitter, Instagram, TikTok)
- ✅ **Email Newsletter** (3-part series)
- ✅ **Video Script** (5-minute YouTube video)

All saved to `content_[topic].json`

---

## 🎯 NEXT STEPS (For Hackathon)

### 1. **Test Different Topics**
```python
topic = "Building AI Agents with Open-Source Models"
generate_content_package(topic)
```

### 2. **Add Qwen Models** (For extra prize points!)
Replace the `llm` at the top with:
```python
from langchain_huggingface import HuggingFaceEndpoint

llm = HuggingFaceEndpoint(
    repo_id="Qwen/Qwen2-7B-Instruct",
    huggingfacehub_api_token="your_hf_token"
)
```

### 3. **Deploy to Hugging Face Space**
Create a simple interface and deploy:
- Make `content_studio.py` the backend
- Add a simple Streamlit frontend
- Deploy to Hugging Face Spaces

---

## 🔗 IMPORTANT LINKS

- **Groq API**: https://groq.com (free, fast LLM)
- **Hugging Face Models**: https://huggingface.co (free models)
- **CrewAI Docs**: https://docs.crewai.com
- **LangChain**: https://python.langchain.com

---

## 🆘 TROUBLESHOOTING

**"ImportError: No module named 'crewai'"**
→ Run: `pip install -r requirements.txt`

**"API Key Error"**
→ Make sure you replaced `your_groq_api_key_here` with actual key

**"Rate Limited"**
→ Use free Groq tier or switch to Hugging Face Inference API

---

## 💡 PRO TIPS

1. **Test locally first** before deploying to AMD Cloud
2. **Use Qwen models** - they're optimized for AMD GPUs + you get prize tokens
3. **Make the UI beautiful** - judges love good presentation
4. **Document your agents** - explain how each one works

Ready? Run it now! 🚀
