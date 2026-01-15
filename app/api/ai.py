from fastapi import APIRouter, Query, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.services.ingestion import ingestion_service
from app.services.ai_service import ai_service
from app.services.gemini_service import gemini_service
from app.services.export import export_service
from app.api.deps import get_current_user
from app.models.user import User
from app.models.article import Article
from app.models.quiz_attempt import QuizAttempt
from app.database import get_db
from app.schemas.article import ArticleHistory
from app.schemas.quiz import QuizSubmission, QuizResult, QuizAttemptOut
from typing import List
import json

router = APIRouter(
    prefix="/ai",
    tags=["AI Processing"]
)

@router.get("/summarize")
def summarize_wiki(
    url: str = Query(..., examples=["https://en.wikipedia.org/wiki/Artificial_intelligence"]),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    print(f"User {current_user.email} is requesting a summary.")
    
    wiki_data = ingestion_service.fetch_wikipedia_data(url)
    if "error" in wiki_data: return wiki_data
    
    lang_code = wiki_data.get("language", "en")
    text = wiki_data["sections"].get("Introduction", "")
    
    summary = ai_service.summarize_text(text, lang_code=lang_code)
    
    article = Article(
        url=url,
        title=wiki_data["title"],
        action="summary",
        owner_id=current_user.id
    )
    db.add(article)
    db.commit()
    db.refresh(article)
    
    return {"title": wiki_data["title"], "summary": summary, "article_id": article.id}

@router.get("/translate")
def translate_wiki(
    url: str = Query(..., examples=["https://en.wikipedia.org/wiki/Artificial_intelligence"]),
    target_lang: str = Query("French"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    wiki_data = ingestion_service.fetch_wikipedia_data(url)
    if "error" in wiki_data: return wiki_data

    text = wiki_data["sections"].get("Introduction", "")
    translation = gemini_service.translate_text(text, target_lang)
    
    article = Article(
        url=url,
        title=wiki_data["title"],
        action="translation",
        owner_id=current_user.id
    )
    db.add(article)
    db.commit()
    db.refresh(article)
    
    return {"original_title": wiki_data["title"], "translation": translation, "article_id": article.id}

@router.get("/quiz")
def generate_quiz(
    url: str = Query(..., examples=["https://en.wikipedia.org/wiki/Artificial_intelligence"]),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    wiki_data = ingestion_service.fetch_wikipedia_data(url)
    if "error" in wiki_data: return wiki_data

    text = wiki_data["sections"].get("Introduction", "")
    lang_code = wiki_data.get("language", "en")
    
    quiz = gemini_service.generate_quiz(text, lang_code)
    
    article = Article(
        url=url,
        title=wiki_data["title"],
        action="quiz",
        owner_id=current_user.id
    )
    db.add(article)
    db.commit()
    db.refresh(article)
    
    return {"title": wiki_data["title"], "quiz": quiz, "article_id": article.id}

@router.get("/debug-models")
def list_models():
    return {"gemini_models": gemini_service.list_available_models()}

@router.post("/quiz/submit", response_model=QuizResult)
def submit_quiz(
    submission: QuizSubmission,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    article = db.query(Article).filter(Article.id == submission.article_id).first()
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")
    
    wiki_data = ingestion_service.fetch_wikipedia_data(article.url)
    text = wiki_data["sections"].get("Introduction", "")
    lang_code = wiki_data.get("language", "en")
    
    quiz_data = gemini_service.generate_quiz(text, lang_code)
    correct_answers = {q["question"]: q["answer"] for q in quiz_data.get("quiz", [])}
    
    correct_count = 0
    for answer in submission.answers:
        if correct_answers.get(answer.question) == answer.user_answer:
            correct_count += 1
    
    total_questions = len(submission.answers)
    score = (correct_count / total_questions * 100) if total_questions > 0 else 0
    
    quiz_attempt = QuizAttempt(
        user_id=current_user.id,
        article_id=submission.article_id,
        score=score
    )
    db.add(quiz_attempt)
    db.commit()
    db.refresh(quiz_attempt)
    
    status_text = "Excellent" if score >= 80 else "Good" if score >= 60 else "Needs Improvement"
    
    return QuizResult(
        score=score,
        total_questions=total_questions,
        correct_answers=correct_count,
        submitted_at=quiz_attempt.submitted_at,
        status=status_text
    )

@router.get("/history", response_model=List[ArticleHistory])
def get_user_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    articles = db.query(Article).filter(Article.owner_id == current_user.id).order_by(Article.created_at.desc()).all()
    return articles

@router.get("/quiz/history", response_model=List[QuizAttemptOut])
def get_quiz_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    attempts = db.query(QuizAttempt).filter(QuizAttempt.user_id == current_user.id).order_by(QuizAttempt.submitted_at.desc()).all()
    return attempts

@router.get("/export/{article_id}/{format}")
def export_article(
    article_id: int,
    format: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    article = db.query(Article).filter(
        Article.id == article_id,
        Article.owner_id == current_user.id
    ).first()
    
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")
    
    wiki_data = ingestion_service.fetch_wikipedia_data(article.url)
    text = wiki_data["sections"].get("Introduction", "")
    
    if article.action == "summary":
        content = ai_service.summarize_text(text, "en")
    elif article.action == "translation":
        content = gemini_service.translate_text(text, "French")
    else:
        content = text
    
    if format == "txt":
        buffer = export_service.export_to_txt(article.title, content)
        return StreamingResponse(
            buffer,
            media_type="text/plain",
            headers={"Content-Disposition": f"attachment; filename={article.title}.txt"}
        )
    elif format == "pdf":
        buffer = export_service.export_to_pdf(article.title, content)
        return StreamingResponse(
            buffer,
            media_type="application/pdf",
            headers={"Content-Disposition": f"attachment; filename={article.title}.pdf"}
        )
    else:
        raise HTTPException(status_code=400, detail="Invalid format. Use 'txt' or 'pdf'")

@router.get("/admin/stats")
def get_admin_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.email != "admin@deepwiki.com":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    total_users = db.query(User).count()
    total_articles = db.query(Article).count()
    total_summaries = db.query(Article).filter(Article.action == "summary").count()
    total_translations = db.query(Article).filter(Article.action == "translation").count()
    
    avg_score = db.query(func.avg(QuizAttempt.score)).scalar() or 0
    
    return {
        "total_users": total_users,
        "total_articles": total_articles,
        "total_summaries": total_summaries,
        "total_translations": total_translations,
        "average_quiz_score": round(avg_score, 2),
        "total_quiz_attempts": db.query(QuizAttempt).count()
    }
