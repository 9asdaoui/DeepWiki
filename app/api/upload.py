from fastapi import APIRouter, UploadFile, File, Depends, HTTPException, Form
from sqlalchemy.orm import Session
from app.services.pdf_service import pdf_service
from app.services.ai_service import ai_service
from app.services.gemini_service import gemini_service
from app.api.deps import get_current_user
from app.models.user import User
from app.models.article import Article
from app.database import get_db
from typing import Optional

router = APIRouter(
    prefix="/upload",
    tags=["PDF Upload"]
)

@router.post("/pdf/summarize")
async def summarize_pdf(
    file: UploadFile = File(...),
    lang_code: str = Form("en"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not file.filename.endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are supported")
    
    content = await file.read()
    text = pdf_service.extract_text_from_pdf(content)
    
    if not text.strip():
        raise HTTPException(status_code=400, detail="No text could be extracted from the PDF")
    
    summary = ai_service.summarize_text(text[:5000], lang_code=lang_code)
    
    article = Article(
        url=f"uploaded:{file.filename}",
        title=file.filename,
        action="pdf_summary",
        owner_id=current_user.id
    )
    db.add(article)
    db.commit()
    db.refresh(article)
    
    return {
        "filename": file.filename,
        "summary": summary,
        "article_id": article.id,
        "text_length": len(text)
    }

@router.post("/pdf/translate")
async def translate_pdf(
    file: UploadFile = File(...),
    target_lang: str = Form("French"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not file.filename.endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are supported")
    
    content = await file.read()
    text = pdf_service.extract_text_from_pdf(content)
    
    if not text.strip():
        raise HTTPException(status_code=400, detail="No text could be extracted from the PDF")
    
    translation = gemini_service.translate_text(text[:5000], target_lang)
    
    article = Article(
        url=f"uploaded:{file.filename}",
        title=file.filename,
        action="pdf_translation",
        owner_id=current_user.id
    )
    db.add(article)
    db.commit()
    db.refresh(article)
    
    return {
        "filename": file.filename,
        "translation": translation,
        "article_id": article.id,
        "text_length": len(text)
    }

@router.post("/pdf/quiz")
async def generate_pdf_quiz(
    file: UploadFile = File(...),
    lang_code: str = Form("en"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not file.filename.endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are supported")
    
    content = await file.read()
    text = pdf_service.extract_text_from_pdf(content)
    
    if not text.strip():
        raise HTTPException(status_code=400, detail="No text could be extracted from the PDF")
    
    quiz = gemini_service.generate_quiz(text[:5000], lang_code)
    
    article = Article(
        url=f"uploaded:{file.filename}",
        title=file.filename,
        action="pdf_quiz",
        owner_id=current_user.id
    )
    db.add(article)
    db.commit()
    db.refresh(article)
    
    return {
        "filename": file.filename,
        "quiz": quiz,
        "article_id": article.id,
        "text_length": len(text)
    }
