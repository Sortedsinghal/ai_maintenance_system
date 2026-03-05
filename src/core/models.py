from typing import Literal
from pydantic import BaseModel, Field

class MaintenanceLog(BaseModel):
    issue_category: Literal["Electrical", "Mechanical", "Sensor", "Unknown"] = Field(
        description="The category of the maintenance issue."
    )
    priority: Literal["Low", "Medium", "High"] = Field(
        description="The priority level of the issue."
    )
    original_complaint: str = Field(
        description="The raw text input provided by the user."
    )
