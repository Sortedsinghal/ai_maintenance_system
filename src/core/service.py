import logging
from src.core.models import MaintenanceLog
from src.core.llm_processor import ComplaintAnalyzer
from src.core.db_layer import MaintenanceDatabase

logger = logging.getLogger(__name__)

class MaintenanceService:
    def __init__(self):
        self.analyzer = ComplaintAnalyzer()
        self.db = MaintenanceDatabase()

    def process_and_store_complaint(self, complaint_text: str) -> dict:
        """
        1. Analyzes complaint using LLM
        2. Programmatically validates (fallback if needed)
        3. Saves to Database
        """
        try:
            log = self.analyzer.analyze(complaint_text)
            validated_log = self._validate_output(log)
        except Exception as e:
            logger.error(f"Failed to analyze complaint via LLM after retries: {e}")
            # Ultimate Fallback
            validated_log = MaintenanceLog(
                issue_category="Unknown",
                priority="Medium",
                original_complaint=complaint_text
            )
            
        inserted_id = self.db.save_log(validated_log)
        return {
            "log": validated_log,
            "id": inserted_id
        }
        
    def _validate_output(self, log: MaintenanceLog) -> MaintenanceLog:
        # Programmatic validation redundant due to Pydantic Literal, but strictly meets PRD task 1 logic.
        valid_categories = {"Electrical", "Mechanical", "Sensor", "Unknown"}
        valid_priorities = {"Low", "Medium", "High"}
        
        category = log.issue_category if log.issue_category in valid_categories else "Unknown"
        priority = log.priority if log.priority in valid_priorities else "Medium"
        
        return MaintenanceLog(
            issue_category=category,
            priority=priority,
            original_complaint=log.original_complaint
        )
