from fastapi import FastAPI, Query
from requests.sessions import Session
from app.services.ingestion import ingestion_service


my_identified_session = Session()


app = FastAPI(title="DeepWiki Edu")

@app.get("/")
def read_root():
    return {"message": "DeepWiki Edu API is running in Docker!"}


@app.get("/ingest/wiki")
def ingest_wiki(url: str = Query(..., example="https://en.wikipedia.org/wiki/Artificial_intelligence")):

    data = ingestion_service.fetch_wikipedia_data(url)
    return data