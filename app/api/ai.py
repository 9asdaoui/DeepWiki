from fastapi import APIRouter, Query
from app.services.ingestion import ingestion_service
from app.services.ai_service import ai_service
from app.services.gemini_service import gemini_service

router = APIRouter(
    prefix="/ai",
    tags=["AI Processing"]
)

@router.get("/summarize")
def summarize_wiki(
    url: str = Query(..., examples=["https://en.wikipedia.org/wiki/Artificial_intelligence"])
):
    wiki_data = ingestion_service.fetch_wikipedia_data(url)
    if "error" in wiki_data: return wiki_data
    
    lang_code = wiki_data.get("language", "en")
    text = wiki_data["sections"].get("Introduction", "")
    
    summary = ai_service.summarize_text(text, lang_code=lang_code)
    return {"title": wiki_data["title"], "summary": summary}

@router.get("/translate")
def translate_wiki(
    url: str = Query(..., examples=["https://en.wikipedia.org/wiki/Artificial_intelligence"]),
    target_lang: str = Query("French")
):
    wiki_data = ingestion_service.fetch_wikipedia_data(url)
    if "error" in wiki_data: return wiki_data

    text = wiki_data["sections"].get("Introduction", "")
    translation = gemini_service.translate_text(text, target_lang)
    return {"original_title": wiki_data["title"], "translation": translation}

@router.get("/quiz")
def generate_quiz(
    url: str = Query(..., examples=["https://en.wikipedia.org/wiki/Artificial_intelligence"])
):
    wiki_data = ingestion_service.fetch_wikipedia_data(url)
    if "error" in wiki_data: return wiki_data

    text = wiki_data["sections"].get("Introduction", "")
    lang_code = wiki_data.get("language", "en")
    
    quiz = gemini_service.generate_quiz(text, lang_code)
    return {"title": wiki_data["title"], "quiz": quiz}

@router.get("/debug-models")
def list_models():
    return {"gemini_models": gemini_service.list_available_models()}
