from fastapi import FastAPI, Query
from requests.sessions import Session
from app.services.ingestion import ingestion_service
from app.services.ai_service import ai_service


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
    
    text_to_summarize = wiki_data["sections"].get("Introduction", "")
    
    summary = ai_service.summarize_text(text_to_summarize)
    
    return {
        "title": wiki_data["title"],
        "summary": summary
    }