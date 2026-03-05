import os
import sys
import sqlite3
import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel
from dotenv import load_dotenv

load_dotenv()

# Ensure project root is on path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", ".."))

from src.module_a.service import MaintenanceService
from src.db.init_db import DB_PATH, init_db

logger = logging.getLogger(__name__)

# --- Pydantic request/response models ---

class ComplaintRequest(BaseModel):
    complaint: str

class ComplaintResponse(BaseModel):
    id: int
    issue_category: str
    priority: str
    original_complaint: str

class StatsResponse(BaseModel):
    total: int
    by_category: dict
    by_priority: dict

# --- App lifecycle ---

@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield

app = FastAPI(title="AI Maintenance System", lifespan=lifespan)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Service singleton ---
_service = None

def get_service() -> MaintenanceService:
    global _service
    if _service is None:
        _service = MaintenanceService()
    return _service

# --- Helper to query DB ---

def _get_all_logs():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute("SELECT id, issue_category, priority, original_complaint, timestamp FROM maintenance_logs ORDER BY id DESC")
    rows = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return rows

# --- API Endpoints ---

@app.post("/api/complaints", response_model=ComplaintResponse)
async def submit_complaint(req: ComplaintRequest):
    if not req.complaint.strip():
        raise HTTPException(status_code=400, detail="Complaint text cannot be empty")
    
    service = get_service()
    result = service.process_and_store_complaint(req.complaint)
    log = result["log"]
    
    return ComplaintResponse(
        id=result["id"],
        issue_category=log.issue_category,
        priority=log.priority,
        original_complaint=log.original_complaint,
    )

@app.get("/api/complaints")
async def list_complaints():
    rows = _get_all_logs()
    return {"complaints": rows}

@app.get("/api/stats", response_model=StatsResponse)
async def get_stats():
    rows = _get_all_logs()
    total = len(rows)
    
    by_category = {}
    by_priority = {}
    for row in rows:
        cat = row["issue_category"]
        pri = row["priority"]
        by_category[cat] = by_category.get(cat, 0) + 1
        by_priority[pri] = by_priority.get(pri, 0) + 1
    
    return StatsResponse(total=total, by_category=by_category, by_priority=by_priority)

# --- Static file serving (built React app) ---

DIST_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "frontend", "dist")

@app.get("/")
async def serve_index():
    return FileResponse(os.path.join(DIST_DIR, "index.html"))

# Mount assets directory
if os.path.isdir(os.path.join(DIST_DIR, "assets")):
    app.mount("/assets", StaticFiles(directory=os.path.join(DIST_DIR, "assets")), name="assets")

# Catch-all for SPA client-side routing (must be last)
@app.get("/{full_path:path}")
async def serve_spa(full_path: str):
    file_path = os.path.join(DIST_DIR, full_path)
    if os.path.isfile(file_path):
        return FileResponse(file_path)
    return FileResponse(os.path.join(DIST_DIR, "index.html"))

# --- Run with: python -m src.api.server ---

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("src.api.server:app", host="0.0.0.0", port=8000, reload=True)

