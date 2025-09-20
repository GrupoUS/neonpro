"""
Tests for Database Service
"""

import pytest
from datetime import datetime
from unittest.mock import AsyncMock, MagicMock, patch
from services.database_service import DatabaseService


class TestDatabaseService:
    """Test cases for DatabaseService"""

    @pytest.mark.asyncio
    async def test_health_check_success(self, database_service):
        """Test successful health check"""
        # Mock the database response
        database_service.client.from_.return_value.select.return_value.count.return_value.limit.return_value.execute.return_value = MagicMock()
        
        result = await database_service.health_check()
        assert result is True

    @pytest.mark.asyncio
    async def test_health_check_failure(self, database_service):
        """Test health check failure"""
        # Mock database error
        database_service.client.from_.return_value.select.return_value.count.return_value.limit.return_value.execute.side_effect = Exception("Connection failed")
        
        with pytest.raises(Exception):
            await database_service.health_check()

    @pytest.mark.asyncio
    async def test_search_patients_success(self, database_service, sample_patients):
        """Test successful patient search"""
        # Mock database response
        mock_response = MagicMock()
        mock_response.data = sample_patients
        database_service.client.from_.return_value.select.return_value.ilike.return_value.limit.return_value.execute.return_value = mock_response
        
        result = await database_service.search_patients("João", limit=10)
        
        assert len(result) == 2
        assert result[0]["full_name"] == "João Silva"
        assert result[1]["full_name"] == "Maria Santos"

    @pytest.mark.asyncio
    async def test_search_patients_with_clinic_filter(self, database_service, sample_patients):
        """Test patient search with clinic filter"""
        mock_response = MagicMock()
        mock_response.data = [sample_patients[0]]  # Only one patient
        database_service.client.from_.return_value.select.return_value.ilike.return_value.limit.return_value.eq.return_value.execute.return_value = mock_response
        
        result = await database_service.search_patients(
            "João", 
            limit=10, 
            context={"clinic_id": "clinic_1"}
        )
        
        assert len(result) == 1
        assert result[0]["full_name"] == "João Silva"

    @pytest.mark.asyncio
    async def test_search_patients_empty_result(self, database_service):
        """Test patient search with no results"""
        mock_response = MagicMock()
        mock_response.data = []
        database_service.client.from_.return_value.select.return_value.ilike.return_value.limit.return_value.execute.return_value = mock_response
        
        result = await database_service.search_patients("Nonexistent")
        
        assert result == []

    @pytest.mark.asyncio
    async def test_search_patients_caching(self, database_service, sample_patients):
        """Test that patient search uses caching"""
        # Mock first call
        mock_response = MagicMock()
        mock_response.data = sample_patients
        database_service.client.from_.return_value.select.return_value.ilike.return_value.limit.return_value.execute.return_value = mock_response
        
        # First call should hit database
        result1 = await database_service.search_patients("João")
        
        # Second call should use cache
        result2 = await database_service.search_patients("João")
        
        assert result1 == result2
        # Verify database was called only once
        database_service.client.from_.assert_called_once()

    @pytest.mark.asyncio
    async def test_get_patient_appointments(self, database_service, sample_appointments):
        """Test getting patient appointments"""
        mock_response = MagicMock()
        mock_response.data = sample_appointments
        database_service.client.from_.return_value.select.return_value.eq.return_value.gte.return_value.lte.return_value.execute.return_value = mock_response
        
        result = await database_service.get_patient_appointments("pat_1")
        
        assert len(result) == 2
        assert result[0]["patient_id"] == "pat_1"
        assert result[1]["patient_id"] == "pat_2"  # This might be filtered in actual implementation

    @pytest.mark.asyncio
    async def test_get_patient_appointments_with_dates(self, database_service, sample_appointments):
        """Test getting patient appointments with date filters"""
        mock_response = MagicMock()
        mock_response.data = [sample_appointments[0]]  # Only one appointment
        database_service.client.from_.return_value.select.return_value.eq.return_value.gte.return_value.lte.return_value.execute.return_value = mock_response
        
        start_date = datetime(2024, 1, 10)
        end_date = datetime(2024, 1, 20)
        
        result = await database_service.get_patient_appointments(
            "pat_1", 
            start_date=start_date, 
            end_date=end_date
        )
        
        assert len(result) == 1

    @pytest.mark.asyncio
    async def test_get_financial_transactions(self, database_service, sample_transactions):
        """Test getting financial transactions"""
        mock_response = MagicMock()
        mock_response.data = sample_transactions
        database_service.client.from_.return_value.select.return_value.eq.return_value.gte.return_value.lte.return_value.execute.return_value = mock_response
        
        result = await database_service.get_financial_transactions(patient_id="pat_1")
        
        assert len(result) == 2
        assert result[0]["patient_id"] == "pat_1"

    @pytest.mark.asyncio
    async def test_get_professional_info(self, database_service):
        """Test getting professional information"""
        professional_data = {
            "id": "prof_1",
            "full_name": "Dr. João Silva",
            "specialty": "Dermatologia",
            "crm": "12345"
        }
        
        mock_response = MagicMock()
        mock_response.data = professional_data
        database_service.client.from_.return_value.select.return_value.eq.return_value.single.return_value.execute.return_value = mock_response
        
        result = await database_service.get_professional_info("prof_1")
        
        assert result["full_name"] == "Dr. João Silva"
        assert result["specialty"] == "Dermatologia"

    @pytest.mark.asyncio
    async def test_get_professional_info_not_found(self, database_service):
        """Test getting non-existent professional"""
        mock_response = MagicMock()
        mock_response.data = None
        database_service.client.from_.return_value.select.return_value.eq.return_value.single.return_value.execute.return_value = mock_response
        
        result = await database_service.get_professional_info("nonexistent")
        
        assert result is None

    @pytest.mark.asyncio
    async def test_create_audit_log(self, database_service):
        """Test creating audit log entry"""
        mock_response = MagicMock()
        mock_response.data = {"id": "log_1"}
        database_service.client.from_.return_value.insert.return_value.execute.return_value = mock_response
        
        result = await database_service.create_audit_log(
            user_id="user_1",
            action="view_patient",
            resource_type="patient",
            resource_id="pat_1",
            details={"query": "patient search"}
        )
        
        assert result is True

    @pytest.mark.asyncio
    async def test_check_lgpd_consent(self, database_service):
        """Test checking LGPD consent"""
        # Patient with consent
        mock_response = MagicMock()
        mock_response.data = {"lgpd_consent_given": True}
        database_service.client.from_.return_value.select.return_value.eq.return_value.single.return_value.execute.return_value = mock_response
        
        result = await database_service.check_lgpd_consent("pat_1")
        assert result is True
        
        # Patient without consent
        mock_response.data = {"lgpd_consent_given": False}
        result = await database_service.check_lgpd_consent("pat_2")
        assert result is False

    @pytest.mark.asyncio
    async def test_get_patient_statistics(self, database_service, sample_appointments, sample_transactions):
        """Test getting patient statistics"""
        # Mock appointments
        mock_appointments = MagicMock()
        mock_appointments.data = sample_appointments
        database_service.client.from_.return_value.select.return_value.eq.return_value.gte.return_value.lte.return_value.execute.return_value = mock_appointments
        
        # Mock transactions
        mock_transactions = MagicMock()
        mock_transactions.data = sample_transactions
        database_service.client.from_.return_value.select.return_value.eq.return_value.gte.return_value.lte.return_value.execute.return_value = mock_transactions
        
        result = await database_service.get_patient_statistics("pat_1")
        
        assert "total_appointments" in result
        assert "completed_appointments" in result
        assert "upcoming_appointments" in result
        assert "total_spent" in result
        assert "pending_payments" in result

    def test_clear_cache(self, database_service):
        """Test clearing cache"""
        # Add something to cache
        database_service._cache["test"] = ("data", datetime.now())
        
        database_service.clear_cache()
        
        assert len(database_service._cache) == 0