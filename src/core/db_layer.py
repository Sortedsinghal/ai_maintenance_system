import sqlite3
import logging
import os
from contextlib import contextmanager
from typing import Optional

from src.core.models import MaintenanceLog
from src.db.init_db import DB_PATH

logger = logging.getLogger(__name__)

class MaintenanceDatabase:
    def __init__(self, db_path: str = DB_PATH):
        self.db_path = db_path
        
    @contextmanager
    def get_connection(self):
        """Context manager for database connections."""
        conn = sqlite3.connect(self.db_path)
        try:
            yield conn
        finally:
            conn.close()

    def save_log(self, log: MaintenanceLog) -> Optional[int]:
        """
        Executes an INSERT statement to save the record in the maintenance_logs table.
        Returns the inserted row ID.
        """
        try:
            with self.get_connection() as conn:
                cursor = conn.cursor()
                cursor.execute(
                    """
                    INSERT INTO maintenance_logs (issue_category, priority, original_complaint)
                    VALUES (?, ?, ?)
                    """,
                    (log.issue_category, log.priority, log.original_complaint)
                )
                conn.commit()
                inserted_id = cursor.lastrowid
                logger.info(f"Saved log with ID {inserted_id} to database.")
                return inserted_id
        except sqlite3.Error as e:
            logger.error(f"Database error during save_log: {e}")
            raise
