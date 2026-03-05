import os
import logging
from tenacity import retry, stop_after_attempt, wait_exponential, retry_if_exception_type
from langchain_core.prompts import PromptTemplate
from langchain_google_genai import ChatGoogleGenerativeAI
from pydantic import ValidationError
from google.api_core.exceptions import GoogleAPIError

from src.core.models import MaintenanceLog

logger = logging.getLogger(__name__)

class ComplaintAnalyzer:
    def __init__(self, model_name: str = "gemini-2.5-flash", temperature: float = 0.0):
        # The LLM model
        self.llm = ChatGoogleGenerativeAI(
            model=model_name,
            temperature=temperature,
        )
        # Enforce structured output via Pydantic model
        self.structured_llm = self.llm.with_structured_output(MaintenanceLog)
        
        self.prompt = PromptTemplate.from_template(
            """
            You are an Intelligent Maintenance Agent triaging industrial equipment complaints.
            Analyze the following user complaint and extract the issue category and priority.
            
            Allowed values for issue_category: 'Electrical', 'Mechanical', 'Sensor', 'Unknown'
            Allowed values for priority: 'Low', 'Medium', 'High'
            
            Guidelines:
            - If the issue explicitly mentions wires, sparking, voltage, or electricity, use 'Electrical'.
            - If the issue is about belts, gears, grinding, or physical breaks, use 'Mechanical'.
            - If the issue is about probes, erratic readings, or measurements, use 'Sensor'.
            - If the issue is not clear, default to 'Unknown'.
            - For priority, consider safety risks ('High'), operational stops ('Medium'), or regular maintenance ('Low').
            - Set 'original_complaint' to the exact input text provided below.
            
            Complaint:
            {complaint}
            """
        )
        self.chain = self.prompt | self.structured_llm

    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=2, max=10),
        retry=retry_if_exception_type((GoogleAPIError, ValidationError)),
        reraise=True
    )
    def analyze(self, complaint_text: str) -> MaintenanceLog:
        """
        Analyzes the complaint text using the LLM with retry logic.
        Retries up to 3 times on API errors or validation errors.
        """
        logger.debug(f"Calling LLM for complaint: {complaint_text}")
        result = self.chain.invoke({"complaint": complaint_text})
        return result
