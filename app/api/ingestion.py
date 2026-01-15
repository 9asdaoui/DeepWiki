from fastapi import APIRouter, Query
from app.services.ingestion import ingestion_service

router = APIRouter(
    prefix="/ingest",
    tags=["Content Ingestion"]
)

@router.get("/wiki")
def ingest_wiki(
    url: str = Query(..., examples=["https://en.wikipedia.org/wiki/Artificial_intelligence"])
):
    return ingestion_service.fetch_wikipedia_data(url)
