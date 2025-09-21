"""
Healthcare-specific data retrieval for RAG agent
"""

import asyncio
import re
from datetime import datetime, timedelta
from typing import Dict, Any, List, Optional, Tuple
import structlog
from fhir.resources.patient import Patient
from fhir.resources.encounter import Encounter
from fhir.resources.observation import Observation
from fhir.resources.condition import Condition
from fhir.resources.medication import Medication
from fhir.resources.medicationrequest import MedicationRequest

from .config import AgentConfig
from .database import SupabaseManager
from .vector_store import VectorStoreManager

logger = structlog.get_logger(__name__)


class HealthcareRetriever:
    """Specialized retriever for healthcare data"""
    
    def __init__(self, config: AgentConfig, db_manager: SupabaseManager, vector_store: VectorStoreManager):
        self.config = config
        self.db_manager = db_manager
        self.vector_store = vector_store
        
    async def retrieve_patient_data(self, patient_id: str, user_id: str) -> Dict[str, Any]:
        """Retrieve comprehensive patient data with permission checking"""
        try:
            # Check user permissions
            has_access = await self._check_patient_access(user_id, patient_id)
            if not has_access:
                raise PermissionError(f"User {user_id} does not have access to patient {patient_id}")
            
            # Retrieve patient基本信息
            patient_data = await self._get_patient_basic_info(patient_id)
            
            # Retrieve recent encounters
            encounters = await self._get_patient_encounters(patient_id, limit=10)
            
            # Retrieve medications
            medications = await self._get_patient_medications(patient_id)
            
            # Retrieve conditions
            conditions = await self._get_patient_conditions(patient_id)
            
            # Retrieve recent observations/lab results
            observations = await self._get_patient_observations(patient_id, limit=20)
            
            # Get upcoming appointments
            appointments = await self._get_patient_appointments(patient_id)
            
            patient_summary = {
                "patient": patient_data,
                "encounters": encounters,
                "medications": medications,
                "conditions": conditions,
                "observations": observations,
                "appointments": appointments,
                "retrieved_at": datetime.now().isoformat()
            }
            
            # Log for compliance
            if self.config.compliance.audit_logging:
                await self._log_data_access(
                    user_id=user_id,
                    patient_id=patient_id,
                    data_type="patient_summary",
                    action="retrieve"
                )
            
            logger.info("Retrieved patient data", 
                       patient_id=patient_id, 
                       user_id=user_id,
                       data_points=len(patient_summary))
            
            return patient_summary
            
        except Exception as e:
            logger.error("Failed to retrieve patient data", 
                        patient_id=patient_id,
                        user_id=user_id,
                        error=str(e))
            raise
    
    async def search_medical_knowledge(
        self,
        query: str,
        limit: int = 10,
        filters: Optional[Dict[str, Any]] = None
    ) -> List[Dict[str, Any]]:
        """Search medical knowledge base"""
        try:
            # Enhance query with medical context
            enhanced_query = self._enhance_medical_query(query)
            
            # Use vector search for semantic similarity
            results = await self.vector_store.similarity_search(
                query=enhanced_query,
                limit=limit,
                filters={
                    **(filters or {}),
                    "source_type": "medical_knowledge"
                }
            )
            
            # Rank and filter results
            ranked_results = await self._rank_medical_results(results, query)
            
            logger.info("Searched medical knowledge", 
                       query_length=len(query),
                       results_count=len(ranked_results))
            
            return ranked_results
            
        except Exception as e:
            logger.error("Medical knowledge search failed", 
                        query_length=len(query),
                        error=str(e))
            return []
    
    async def retrieve_appointment_data(
        self,
        patient_id: Optional[str] = None,
        professional_id: Optional[str] = None,
        date_range: Optional[Tuple[datetime, datetime]] = None,
        limit: int = 20
    ) -> List[Dict[str, Any]]:
        """Retrieve appointment data with various filters"""
        try:
            query_filters = {}
            
            if patient_id:
                query_filters["patient_id"] = patient_id
            if professional_id:
                query_filters["professional_id"] = professional_id
            if date_range:
                query_filters["date_range"] = {
                    "start": date_range[0].isoformat(),
                    "end": date_range[1].isoformat()
                }
            
            # Search for appointment-related documents
            results = await self.vector_store.similarity_search(
                query="appointment scheduling patient visit",
                limit=limit,
                filters={
                    **query_filters,
                    "source_type": "appointment"
                }
            )
            
            # Also query database directly for structured appointment data
            db_appointments = await self._query_appointments_database(
                patient_id, professional_id, date_range, limit
            )
            
            # Combine results
            combined_results = self._combine_appointment_results(results, db_appointments)
            
            logger.info("Retrieved appointment data", 
                       results_count=len(combined_results),
                       filters=query_filters)
            
            return combined_results
            
        except Exception as e:
            logger.error("Failed to retrieve appointment data", error=str(e))
            return []
    
    async def retrieve_financial_summary(
        self,
        patient_id: Optional[str] = None,
        professional_id: Optional[str] = None,
        date_range: Optional[Tuple[datetime, datetime]] = None
    ) -> Dict[str, Any]:
        """Retrieve financial summary data"""
        try:
            # Query financial documents from vector store
            financial_results = await self.vector_store.similarity_search(
                query="financial billing payments insurance claims",
                limit=50,
                filters={
                    "source_type": "financial"
                }
            )
            
            # Get structured financial data from database
            db_financial = await self._query_financial_database(
                patient_id, professional_id, date_range
            )
            
            # Process and summarize
            summary = await self._process_financial_data(financial_results, db_financial)
            
            logger.info("Retrieved financial summary", 
                       patient_id=patient_id,
                       professional_id=professional_id)
            
            return summary
            
        except Exception as e:
            logger.error("Failed to retrieve financial summary", error=str(e))
            return {}
    
    async def _check_patient_access(self, user_id: str, patient_id: str) -> bool:
        """Check if user has access to patient data"""
        try:
            # This would check the database for user-patient relationships
            # For now, return True as a placeholder
            # In production, this would check RLS policies and user roles
            
            result = self.db_manager.supabase.table("user_patient_access").select("*").eq(
                "user_id", user_id
            ).eq("patient_id", patient_id).execute()
            
            return len(result.data) > 0
            
        except Exception as e:
            logger.error("Failed to check patient access", error=str(e))
            return False
    
    async def _get_patient_basic_info(self, patient_id: str) -> Dict[str, Any]:
        """Get basic patient information"""
        try:
            result = self.db_manager.supabase.table("patients").select("*").eq(
                "id", patient_id
            ).execute()
            
            if result.data:
                return result.data[0]
            else:
                return {}
                
        except Exception as e:
            logger.error("Failed to get patient basic info", error=str(e))
            return {}
    
    async def _get_patient_encounters(self, patient_id: str, limit: int = 10) -> List[Dict[str, Any]]:
        """Get patient encounters/visits"""
        try:
            result = self.db_manager.supabase.table("encounters").select("*").eq(
                "patient_id", patient_id
            ).order("date", desc=True).limit(limit).execute()
            
            return result.data or []
            
        except Exception as e:
            logger.error("Failed to get patient encounters", error=str(e))
            return []
    
    async def _get_patient_medications(self, patient_id: str) -> List[Dict[str, Any]]:
        """Get patient medications"""
        try:
            result = self.db_manager.supabase.table("medications").select("*").eq(
                "patient_id", patient_id
            ).eq("active", True).execute()
            
            return result.data or []
            
        except Exception as e:
            logger.error("Failed to get patient medications", error=str(e))
            return []
    
    async def _get_patient_conditions(self, patient_id: str) -> List[Dict[str, Any]]:
        """Get patient conditions/diagnoses"""
        try:
            result = self.db_manager.supabase.table("conditions").select("*").eq(
                "patient_id", patient_id
            ).eq("active", True).execute()
            
            return result.data or []
            
        except Exception as e:
            logger.error("Failed to get patient conditions", error=str(e))
            return []
    
    async def _get_patient_observations(self, patient_id: str, limit: int = 20) -> List[Dict[str, Any]]:
        """Get patient observations/lab results"""
        try:
            result = self.db_manager.supabase.table("observations").select("*").eq(
                "patient_id", patient_id
            ).order("date", desc=True).limit(limit).execute()
            
            return result.data or []
            
        except Exception as e:
            logger.error("Failed to get patient observations", error=str(e))
            return []
    
    async def _get_patient_appointments(self, patient_id: str) -> List[Dict[str, Any]]:
        """Get patient appointments"""
        try:
            # Get upcoming appointments
            today = datetime.now().date()
            result = self.db_manager.supabase.table("appointments").select("*").eq(
                "patient_id", patient_id
            ).gte("date", today.isoformat()).order("date").execute()
            
            return result.data or []
            
        except Exception as e:
            logger.error("Failed to get patient appointments", error=str(e))
            return []
    
    def _enhance_medical_query(self, query: str) -> str:
        """Enhance medical query with domain-specific terms"""
        # Add medical context terms
        medical_terms = [
            "medical", "clinical", "patient", "treatment", "diagnosis",
            "symptom", "medication", "therapy", "healthcare", "disease"
        ]
        
        enhanced_query = query
        
        # Add relevant medical terms if not already present
        for term in medical_terms:
            if term not in query.lower():
                enhanced_query += f" {term}"
        
        return enhanced_query
    
    async def _rank_medical_results(
        self, 
        results: List[Dict[str, Any]], 
        query: str
    ) -> List[Dict[str, Any]]:
        """Rank medical search results"""
        try:
            query_lower = query.lower()
            
            # Define medical keywords and their weights
            medical_keywords = {
                "diagnosis": 2.0,
                "treatment": 1.8,
                "medication": 1.7,
                "symptom": 1.6,
                "therapy": 1.5,
                "clinical": 1.4,
                "patient": 1.3,
                "medical": 1.2
            }
            
            ranked_results = []
            for result in results:
                score = result.get("similarity_score", 0)
                content = result.get("content", "").lower()
                metadata = result.get("metadata", {})
                
                # Boost score for medical keyword matches
                for keyword, weight in medical_keywords.items():
                    if keyword in query_lower and keyword in content:
                        score *= weight
                
                # Boost recent documents
                if "created_at" in metadata:
                    created_date = datetime.fromisoformat(metadata["created_at"])
                    if datetime.now() - created_date < timedelta(days=365):
                        score *= 1.1
                
                result["ranked_score"] = score
                ranked_results.append(result)
            
            # Sort by ranked score
            ranked_results.sort(key=lambda x: x["ranked_score"], reverse=True)
            
            return ranked_results
            
        except Exception as e:
            logger.error("Failed to rank medical results", error=str(e))
            return results
    
    async def _query_appointments_database(
        self,
        patient_id: Optional[str],
        professional_id: Optional[str],
        date_range: Optional[Tuple[datetime, datetime]],
        limit: int
    ) -> List[Dict[str, Any]]:
        """Query appointments database directly"""
        try:
            query = self.db_manager.supabase.table("appointments").select("*")
            
            if patient_id:
                query = query.eq("patient_id", patient_id)
            if professional_id:
                query = query.eq("professional_id", professional_id)
            if date_range:
                query = query.gte("date", date_range[0].isoformat()).lte(
                    "date", date_range[1].isoformat()
                )
            
            result = query.order("date").limit(limit).execute()
            return result.data or []
            
        except Exception as e:
            logger.error("Failed to query appointments database", error=str(e))
            return []
    
    def _combine_appointment_results(
        self,
        vector_results: List[Dict[str, Any]],
        db_results: List[Dict[str, Any]]
    ) -> List[Dict[str, Any]]:
        """Combine vector search and database results"""
        # Combine and deduplicate based on appointment ID
        combined = []
        seen_ids = set()
        
        # Add database results first (more structured)
        for result in db_results:
            if result.get("id") not in seen_ids:
                result["source"] = "database"
                combined.append(result)
                seen_ids.add(result.get("id"))
        
        # Add vector results
        for result in vector_results:
            result_id = result.get("metadata", {}).get("appointment_id")
            if result_id and result_id not in seen_ids:
                result["source"] = "vector"
                combined.append(result)
                seen_ids.add(result_id)
        
        return combined
    
    async def _query_financial_database(
        self,
        patient_id: Optional[str],
        professional_id: Optional[str],
        date_range: Optional[Tuple[datetime, datetime]]
    ) -> List[Dict[str, Any]]:
        """Query financial database"""
        try:
            # This would query financial tables
            # Placeholder implementation
            return []
            
        except Exception as e:
            logger.error("Failed to query financial database", error=str(e))
            return []
    
    async def _process_financial_data(
        self,
        vector_results: List[Dict[str, Any]],
        db_results: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """Process financial data into summary"""
        try:
            summary = {
                "total_revenue": 0,
                "total_expenses": 0,
                "insurance_claims": 0,
                "patient_payments": 0,
                "outstanding_balance": 0,
                "period": "all_time"
            }
            
            # Process database results if available
            for record in db_results:
                summary["total_revenue"] += record.get("amount", 0)
                if record.get("payment_type") == "insurance":
                    summary["insurance_claims"] += record.get("amount", 0)
                else:
                    summary["patient_payments"] += record.get("amount", 0)
            
            return summary
            
        except Exception as e:
            logger.error("Failed to process financial data", error=str(e))
            return {}
    
    async def _log_data_access(
        self,
        user_id: str,
        patient_id: str,
        data_type: str,
        action: str
    ) -> None:
        """Log data access for compliance"""
        try:
            audit_data = {
                "user_id": user_id,
                "patient_id": patient_id,
                "data_type": data_type,
                "action": action,
                "timestamp": datetime.now().isoformat()
            }
            
            self.db_manager.supabase.table("data_access_log").insert(audit_data).execute()
            
        except Exception as e:
            logger.error("Failed to log data access", error=str(e))
    
    async def get_relevant_context(
        self,
        query: str,
        user_id: str,
        patient_id: Optional[str] = None,
        limit: int = 10
    ) -> Dict[str, Any]:
        """Get relevant context for a given query"""
        try:
            context = {
                "query": query,
                "user_id": user_id,
                "patient_id": patient_id,
                "results": []
            }
            
            # Determine search strategy based on query type
            query_type = self._classify_query(query)
            
            if query_type == "patient_data" and patient_id:
                patient_data = await self.retrieve_patient_data(patient_id, user_id)
                context["results"].append({
                    "type": "patient_data",
                    "data": patient_data
                })
            
            elif query_type == "medical_knowledge":
                knowledge = await self.search_medical_knowledge(query, limit)
                context["results"].append({
                    "type": "medical_knowledge",
                    "data": knowledge
                })
            
            elif query_type == "appointments":
                appointments = await self.retrieve_appointment_data(
                    patient_id=patient_id, limit=limit
                )
                context["results"].append({
                    "type": "appointments",
                    "data": appointments
                })
            
            elif query_type == "financial":
                financial = await self.retrieve_financial_summary(patient_id=patient_id)
                context["results"].append({
                    "type": "financial",
                    "data": financial
                })
            
            # Always include general medical knowledge
            if query_type not in ["patient_data", "medical_knowledge"]:
                general_knowledge = await self.search_medical_knowledge(query, limit=5)
                if general_knowledge:
                    context["results"].append({
                        "type": "general_knowledge",
                        "data": general_knowledge
                    })
            
            return context
            
        except Exception as e:
            logger.error("Failed to get relevant context", error=str(e))
            return {"query": query, "results": []}
    
    def _classify_query(self, query: str) -> str:
        """Classify the type of query"""
        query_lower = query.lower()
        
        # Patient data queries
        patient_keywords = ["patient", "paciente", "histórico", "history", "prontuário"]
        if any(keyword in query_lower for keyword in patient_keywords):
            return "patient_data"
        
        # Appointment queries
        appointment_keywords = ["appointment", "consulta", "agendamento", "schedule"]
        if any(keyword in query_lower for keyword in appointment_keywords):
            return "appointments"
        
        # Financial queries
        financial_keywords = ["financial", "financeiro", "pagamento", "payment", "fatura"]
        if any(keyword in query_lower for keyword in financial_keywords):
            return "financial"
        
        # Default to medical knowledge
        return "medical_knowledge"