from fastapi import FastAPI
from app.database import engine
from app.models import Base
from app.api import auth, ingestion, ai

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="WikiSmart Edu",
    description="Intelligent Educational Platform powered by Groq and Gemini",
    version="1.0.0"
)

app.include_router(auth.router)
app.include_router(ingestion.router)
app.include_router(ai.router)

@app.get("/")
def root():
    return {"message": "WikiSmart Edu API is fully modular and running!"}