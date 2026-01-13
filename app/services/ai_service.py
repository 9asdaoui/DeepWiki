import os
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

class AIService:
    def __init__(self):
        self.client = Groq(api_key=os.getenv("GROQ_API_KEY"))
        self.model = "llama-3.3-70b-versatile"

    def summarize_text(self, text: str, lang_code: str):
        """
        Summarizes text strictly in the provided language code.
        """
        lang_map = {
            "en": "English",
            "fr": "French",
            "ar": "Arabic",
            "es": "Spanish"
        }
        language_name = lang_map.get(lang_code, lang_code)

        system_prompt = (
            f"### ROLE\n"
            f"You are a Senior Academic Content Synthesizer. Your mission is to facilitate autonomous learning by "
            f"transforming complex Wikipedia articles into high-density, structured educational summaries.\n\n"
            f"### OBJECTIVE\n"
            f"Synthesize the provided text into a logically structured summary in {language_name}.\n\n"
            f"### OUTPUT CONSTRAINTS\n"
            f"- **Language**: You MUST output exclusively in {language_name}.\n"
            f"- **Zero Meta-Talk**: Do NOT include any introductory remarks (e.g., 'Here is the summary').\n"
            f"- **Direct Entry**: Start the summary immediately with the first sentence."
        )

        try:
            completion = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": text}
                ],
                temperature=0.1,
                max_tokens=1000,
            )
            return completion.choices[0].message.content.strip()
        except Exception as e:
            return f"Error with Groq: {str(e)}"

ai_service = AIService()