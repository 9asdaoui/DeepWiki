from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class QuizAnswer(BaseModel):
    question: str
    user_answer: str

class QuizSubmission(BaseModel):
    article_id: int
    answers: List[QuizAnswer]

class QuizResult(BaseModel):
    score: float
    total_questions: int
    correct_answers: int
    submitted_at: datetime
    status: str

    class Config:
        from_attributes = True

class QuizAttemptOut(BaseModel):
    id: int
    article_id: int
    score: float
    submitted_at: datetime

    class Config:
        from_attributes = True
