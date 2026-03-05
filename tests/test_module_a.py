import pytest
from pydantic import ValidationError
from src.module_a.models import MaintenanceLog
from src.module_a.service import MaintenanceService

def test_maintenance_log_valid_creation():
    log = MaintenanceLog(
        issue_category="Electrical",
        priority="High",
        original_complaint="Sparks flying out of the engine."
    )
    assert log.issue_category == "Electrical"
    assert log.priority == "High"

def test_maintenance_log_invalid_category():
    with pytest.raises(ValidationError):
        MaintenanceLog(
            issue_category="Magic",
            priority="High",
            original_complaint="It broke."
        )

def test_service_validation_fallback(mocker):
    # Mock analyzer initialization to avoid API key requirements
    mocker.patch('src.module_a.service.ComplaintAnalyzer')
    
    # Service validation repairs invalid values to Unknown/Medium
    service = MaintenanceService()
    
    # We create a dummy log that bypassed pydantic somehow (e.g. LLM mock)
    # Using construct to bypass pydantic validation for testing the service fallback method
    invalid_log = MaintenanceLog.model_construct(
        issue_category="Spaceship",
        priority="Critical",
        original_complaint="Broken"
    )
    
    repaired_log = service._validate_output(invalid_log)
    assert repaired_log.issue_category == "Unknown"
    assert repaired_log.priority == "Medium"
    assert repaired_log.original_complaint == "Broken"

def test_service_validation_valid(mocker):
    mocker.patch('src.module_a.service.ComplaintAnalyzer')
    service = MaintenanceService()
    valid_log = MaintenanceLog(
        issue_category="Mechanical",
        priority="Low",
        original_complaint="Needs oil."
    )
    
    checked_log = service._validate_output(valid_log)
    assert checked_log.issue_category == "Mechanical"
    assert checked_log.priority == "Low"

def test_process_and_store_complaint_mocked(mocker):
    mocker.patch('src.module_a.service.ComplaintAnalyzer')
    service = MaintenanceService()
    
    # Mock LLM analyzer's analyze method
    service.analyzer.analyze.return_value = MaintenanceLog(
        issue_category="Sensor",
        priority="High",
        original_complaint="Probe error"
    )
    
    # Mock DB layer
    mock_save = mocker.patch.object(service.db, 'save_log')
    mock_save.return_value = 99
    
    result = service.process_and_store_complaint("Probe error")
    
    assert result["id"] == 99
    assert result["log"].issue_category == "Sensor"
    service.analyzer.analyze.assert_called_once_with("Probe error")
    mock_save.assert_called_once()
