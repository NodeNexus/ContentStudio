from crewai import LLM

llm = LLM(
    model="openai/mixtral-8x7b-32768",
    api_key="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",
    base_url="https://api.groq.com/openai/v1"
)

print(llm)
