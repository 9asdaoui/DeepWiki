Epics (Themes)
EPIC 1: Backend Infrastructure & Database (Foundation)
EPIC 2: Content Ingestion & Parsing (Wikipedia & PDF)
EPIC 3: AI Intelligence Layer (LLM Services)
EPIC 4: Security & User Management (Auth & FaceAPI)
EPIC 5: Frontend & Results Export (UI & Reports)
EPIC 6: Quality Assurance & DevOps (Tests & Docker)

📋 Sprint 1: "Core Logic & AI Engine" (Days 1 - 5)

Tasks for EPIC 1 (Infrastructure)
TASK-01: Initialize FastAPI project (Folder structure, Pydantic settings, and .env configuration).
TASK-02: Design DB Schema with SQLAlchemy (Users, Articles, QuizAttempts tables).
TASK-03: Setup PostgreSQL connection and initial migrations.


Tasks for EPIC 2 (Content Ingestion)
TASK-04: Implement Wikipedia Scraper (User-Agent header, urllib parsing for article IDs).
TASK-05: Implement PDF Text Extraction using LangChain.
TASK-06: Develop text preprocessing logic (Segmenting articles by "===" titles into a dictionary).


Tasks for EPIC 3 (AI Layer)
TASK-07: Integrate Groq API for Summary generation (Prompt tuning for Short/Medium formats).
TASK-08: Integrate Gemini API for Translation services (Multi-language support).
TASK-09: Integrate Gemini API for Quiz Generation (Strict JSON output: MCQs + Open questions).

📋 Sprint 2: "Security, UI & Deployment" (Days 6 - 10)

Tasks for EPIC 4 (Security)
TASK-10: Implement OAuth2 + JWT Authentication.
TASK-12: Create Admin Dashboard endpoints (User stats, total summaries, and downloads).


Tasks for EPIC 5 (Frontend & Export)
TASK-13: Build Frontend UI (Streamlit or React) for Article submission and Dashboard.
TASK-14: Implement "Personal History" view (Past scores and processed articles).
TASK-15: Develop Export Module (Generate downloadable PDF and TXT files).


Tasks for EPIC 6 (DevOps & QA)
TASK-16: Write Unit Tests with Pytest (Using Mocks for Groq and Gemini APIs).
TASK-17: Create Dockerfile and Docker Compose (Link FastAPI and PostgreSQL).
TASK-18: Final Bug Scrub and Documentation (README & API Swagger documentation).