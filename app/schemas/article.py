from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class ArticleBase(BaseModel):
    url: str
    title: str
    action: str

class ArticleCreate(ArticleBase):
    owner_id: int

class ArticleOut(ArticleBase):
    id: int
    created_at: datetime
    owner_id: int

    class Config:
        from_attributes = True

class ArticleHistory(BaseModel):
    id: int
    title: str
    action: str
    created_at: datetime

    class Config:
        from_attributes = True
