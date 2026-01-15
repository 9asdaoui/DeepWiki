from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine
from app.models import Base
from app.api import auth, ingestion, ai, upload

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="WikiSmart Edu",
    description="Intelligent Educational Platform powered by Groq and Gemini",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:80"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(ingestion.router)
app.include_router(ai.router)
app.include_router(upload.router)

@app.get("/")
def root():
    return {"message": "WikiSmart Edu API is fully modular and running!"}