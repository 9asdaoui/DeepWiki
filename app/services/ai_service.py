import os
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

class AIService:
    def __init__(self):
        self.client = Groq(api_key=os.getenv("GROQ_API_KEY"))
        self.model = "llama-3.3-70b-versatile" 

    def summarize_text(self, text: str):
        """
        Summarizes text strictly. 
        No format choices, no filler, no talking.
        """

        system_prompt = (
            "You are a professional educational summarizer. "
            "Your only task is to provide a concise, clear summary of the text provided. "
            "Output ONLY the summary text itself. "
            "Do not include introductions like 'Here is a summary', do not repeat the user's request, "
            "do not add conversational filler, and do not explain your formatting. "
            "Just output the summarized content."
        )

        try:
            completion = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": text}
                ],
                temperature=0.1,
                max_tokens=600,
            )
            
            return completion.choices[0].message.content.strip()
        except Exception as e:
            return f"Error with Groq: {str(e)}"

ai_service = AIService()