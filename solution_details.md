# Project Details & Technical Decisions

This document outlines the architectural decisions, assumptions, trade-offs, and future production improvements for the NovaMaint Intelligent Maintenance Agent.

## 1. Assumptions Made

- **Category Scope:** Maintenance issues fall predominantly into four distinct buckets (Electrical, Mechanical, Sensor, Unknown). It is assumed the LLM has enough general world knowledge to map complaints into these buckets without needing a fine-tuned vector database (RAG) of specific factory manuals.
- **Language:** The current agent assumes all inputs will be provided in English.
- **Scale:** The current prototype uses SQLite assuming a low-concurrency environment (e.g., a single facility submitting a few dozen complaints a day).
- **LLM Speed:** We assume `< 2 second` latency is acceptable for complaint submission, as it waits synchronously for the LLM to process and structure the output via LangChain.

## 2. Trade-offs Considered

### FastAPI vs. Next.js API Routes
**Decision:** FastAPI (Python) backend with an independent React frontend, rather than a monolithic Next.js app.
**Why:** The AI ecosystem (LangChain, Pydantic structured outputs, vector DB integrations) is significantly more mature and robust in Python than in JavaScript. This split allows the Python backend to excel at AI reasoning while React excels at the UI.

### Pydantic Structured Output vs. Standard LLM Parsing
**Decision:** Using Gemini's tool-calling/structured output features via LangChain + Pydantic's `BaseModel` and `Literal` types, instead of prompting the LLM to "return JSON" and parsing it manually with Regex/JSON.loads.
**Why:** It dramatically reduces the hallucination rate. By enforcing a `Literal["High", "Medium", "Low"]` schema at the Pydantic level, the LLM is constrained to valid states, eliminating edge cases where the model might return "Urgent" instead of "High".

### SQLite vs. Postgres
**Decision:** SQLite.
**Why:** For an evaluation/prototype build, avoiding external dependencies (like needing a Dockerized Postgres container) makes setup significantly easier for reviewers while still fulfilling the "SQL Database" requirement.

## 3. Improvements for Production

If this agent were deployed to a high-volume, enterprise production environment, we would implement the following improvements:

1. **Agentic Workflows (Tool Use):** Switch from a single-pass LLM call to an autonomous agent (e.g., using LangGraph). Provide the agent with tools to query historical databases (to check for repeat breakdowns of the same machine) and trigger notification APIs (e.g., PagerDuty for High Priority issues).
2. **Retrieval-Augmented Generation (RAG):** Load equipment manuals into a vector database (e.g., Pinecone or pgvector). When a complaint is submitted, the agent would search the manuals to append suggested troubleshooting steps to its JSON output.
3. **Database Migration:** Replace SQLite with PostgreSQL (using SQLAlchemy) to support horizontal scaling and concurrent writes.
4. **Asynchronous Processing:** The `POST /api/complaints` route is currently synchronous. In production, the API should return a `202 Accepted` immediately and process the LLM call asynchronously via a message queue (Celery/RabbitMQ), pushing the result to the frontend via WebSockets.
5. **Authentication & Multi-Tenancy:** Secure the API with JWTs and map maintenance logs to specific factories and user IDs.
