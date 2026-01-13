import os
import json
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

class GeminiService:
    def __init__(self):
        api_key = os.getenv("GOOGLE_API_KEY")
        genai.configure(api_key=api_key)
        
        # Using gemini-2.5-flash - the latest stable model available
        self.model_name = 'models/gemini-2.5-flash' 
        self.model = genai.GenerativeModel(self.model_name)

    def translate_text(self, text: str, target_lang: str):
        if not text: return "No text provided."
        
        prompt = (
            f"You are a professional translator. Translate this text into {target_lang}. "
            f"Output ONLY the translated text.\n\nText: {text}"
        )
        
        try:
            # We add a safety timeout and check
            response = self.model.generate_content(prompt)
            if response.text:
                return response.text.strip()
            else:
                return "Gemini returned an empty response (potentially blocked content)."
        except Exception as e:
            return f"Gemini Error: {str(e)}"
        

    def generate_quiz(self, text: str, lang_code: str):
        lang_map = {"en": "English", "fr": "French", "ar": "Arabic", "es": "Spanish"}
        language_name = lang_map.get(lang_code, lang_code)

        prompt = (
            f"Generate a 5-question MCQ quiz in {language_name} based on the text. "
            f"Return ONLY a JSON object with a 'quiz' key containing a list of questions, "
            f"each with 'question', 'options' (list of 4), and 'answer'.\n\n"
            f"Text: {text}"
        )

        try:
            response = self.model.generate_content(
                prompt,
                generation_config={"response_mime_type": "application/json"}
            )
            return json.loads(response.text)
        except Exception as e:
            return {"error": f"Quiz generation failed: {str(e)}"}

gemini_service = GeminiService()