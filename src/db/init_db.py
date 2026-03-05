import os
import sqlite3
import logging

logger = logging.getLogger(__name__)

# Use /tmp for Vercel serverless environment (read-only filesystem except /tmp)
if os.environ.get("VERCEL"):
    DB_PATH = "/tmp/maintenance.db"
    logger.info("Running on Vercel: Using /tmp/maintenance.db for SQLite")
else:
    DB_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "maintenance.db"))

def init_db():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS maintenance_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            issue_category TEXT,
            priority TEXT,
            original_complaint TEXT,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    conn.commit()
    conn.close()

if __name__ == "__main__":
    init_db()
    print(f"Database initialized at {DB_PATH}")
