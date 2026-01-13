from fastapi import FastAPI, Query
from requests.sessions import Session
from app.services.ingestion import ingestion_service
from app.services.ai_service import ai_service
from app.services.gemini_service import gemini_service



my_identified_session = Session()


app = FastAPI(title="DeepWiki Edu")

@app.get("/")
def read_root():
    return {"message": "DeepWiki Edu API is running in Docker!"}


@app.get("/ingest/wiki")
def ingest_wiki(url: str = Query(..., example="https://en.wikipedia.org/wiki/Artificial_intelligence")):

    data = ingestion_service.fetch_wikipedia_data(url)
    return data


@app.get("/summarize")
def summarize_wiki(
    url: str = Query(..., example="https://en.wikipedia.org/wiki/Artificial_intelligence")
):
    wiki_data = ingestion_service.fetch_wikipedia_data(url)
    
    if "error" in wiki_data:
        return wiki_data
    
    lang_code = wiki_data.get("language", "en")
    text_to_summarize = wiki_data["sections"].get("Introduction", "")
    
    summary = ai_service.summarize_text(text_to_summarize, lang_code=lang_code)
    
    return {
        "title": wiki_data["title"],
        "detected_language": lang_code,
        "summary": summary
    }

@app.get("/translate")
def translate_wiki(
    url: str = Query(..., example="https://en.wikipedia.org/wiki/Artificial_intelligence"),
    target_lang: str = Query("French", description="Language to translate into")
):
    wiki_data = ingestion_service.fetch_wikipedia_data(url)
    if "error" in wiki_data: return wiki_data

    text = wiki_data["sections"].get("Introduction", "")
    translated_text = gemini_service.translate_text(text, target_lang)
    
    return {
        "original_title": wiki_data["title"],
        "target_lang": target_lang,
        "translation": translated_text
    }

@app.get("/quiz")
def generate_quiz(
    url: str = Query(..., example="https://en.wikipedia.org/wiki/Artificial_intelligence")
):
    wiki_data = ingestion_service.fetch_wikipedia_data(url)
    if "error" in wiki_data: return wiki_data

    # Use the Introduction and maybe one more section for the quiz content
    text_content = wiki_data["sections"].get("Introduction", "")
    lang_code = wiki_data.get("language", "en")

    quiz_json = gemini_service.generate_quiz(text_content, lang_code)
    
    return {
        "title": wiki_data["title"],
        "quiz": quiz_json
    }

@app.get("/gemini-models")
def get_models():
    """Returns a list of models your API key is allowed to use."""
    return {"allowed_models": gemini_service.list_available_models()}