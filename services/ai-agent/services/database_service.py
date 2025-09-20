"""
Database service for accessing NeonPro healthcare data
"""

import logging
from typing import Dict, List, Optional, Any
from datetime import datetime, timedelta
import asyncio
from supabase import create_client, Client
from supabase.lib.client_options import ClientOptions

logger = logging.getLogger(__name__)


class DatabaseService:
    """Service for database operations with Supabase"""
    
    def __init__(self, supabase_url: str, supabase_key: str):
        self.supabase_url = supabase_url
        self.supabase_key = supabase_key
        self.client: Client = create_client(supabase_url, supabase_key)
        self._cache = {}
        self._cache_ttl = 300  # 5 minutes
        
    async def health_check(self) -> bool:
        """Check database connection"""
        try:
            # Simple health check
            response = self.client.from_('patients').select('count', count='exact').limit(1).execute()
            return True
        except Exception as e:
            logger.error(f"Database health check failed: {e}")
            raise
    
    async def search_patients(
        self, 
        name: str, 
        limit: int = 10,
        context: Optional[Dict] = None
    ) -> List[Dict]:
        """Search patients by name"""
        cache_key = f"patients_{name}_{limit}"
        
        # Check cache first
        if cache_key in self._cache:
            cached_data, timestamp = self._cache[cache_key]
            if datetime.now() - timestamp < timedelta(seconds=self._cache_ttl):
                return cached_data
        
        try:
            # Search in patients table
            query = (
                self.client
                .from_('patients')
                .select(`
                    id, 
                    full_name, 
                    email, 
                    phone, 
                    cpf, 
                    birth_date,
                    clinic_id,
                    lgpd_consent_given,
                    created_at,
                    updated_at
                `)
                .ilike('full_name', f'%{name}%')
                .limit(limit)
            )
            
            # Apply clinic filter if in context
            if context and context.get('clinic_id'):
                query = query.eq('clinic_id', context['clinic_id'])
            
            response = query.execute()
            
            if response.data:
                # Cache the result
                self._cache[cache_key] = (response.data, datetime.now())
                return response.data
            else:
                return []
                
        except Exception as e:
            logger.error(f"Error searching patients: {e}")
            raise
    
    async def get_patient_appointments(
        self, 
        patient_id: str,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None
    ) -> List[Dict]:
        """Get appointments for a patient"""
        try:
            query = (
                self.client
                .from_('appointments')
                .select(`
                    id,
                    patient_id,
                    professional_id,
                    service_id,
                    clinic_id,
                    scheduled_at,
                    duration_minutes,
                    status,
                    notes,
                    created_at,
                    updated_at
                `)
                .eq('patient_id', patient_id)
            )
            
            # Apply date filters
            if start_date:
                query = query.gte('scheduled_at', start_date.isoformat())
            if end_date:
                query = query.lte('scheduled_at', end_date.isoformat())
            
            response = query.execute()
            return response.data or []
            
        except Exception as e:
            logger.error(f"Error getting patient appointments: {e}")
            raise
    
    async def get_financial_transactions(
        self,
        patient_id: Optional[str] = None,
        clinic_id: Optional[str] = None,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None
    ) -> List[Dict]:
        """Get financial transactions"""
        try:
            query = (
                self.client
                .from_('financial_transactions')
                .select(`
                    id,
                    clinic_id,
                    patient_id,
                    amount,
                    currency,
                    description,
                    transaction_type,
                    status,
                    payment_method,
                    created_at,
                    updated_at
                `)
            )
            
            # Apply filters
            if patient_id:
                query = query.eq('patient_id', patient_id)
            if clinic_id:
                query = query.eq('clinic_id', clinic_id)
            if start_date:
                query = query.gte('created_at', start_date.isoformat())
            if end_date:
                query = query.lte('created_at', end_date.isoformat())
            
            response = query.execute()
            return response.data or []
            
        except Exception as e:
            logger.error(f"Error getting financial transactions: {e}")
            raise
    
    async def get_professional_info(self, professional_id: str) -> Optional[Dict]:
        """Get professional information"""
        try:
            response = (
                self.client
                .from_('professionals')
                .select('*')
                .eq('id', professional_id)
                .single()
                .execute()
            )
            
            return response.data if response.data else None
            
        except Exception as e:
            logger.error(f"Error getting professional info: {e}")
            return None
    
    async def get_service_info(self, service_id: str) -> Optional[Dict]:
        """Get service information"""
        try:
            response = (
                self.client
                .from_('services')
                .select('*')
                .eq('id', service_id)
                .single()
                .execute()
            )
            
            return response.data if response.data else None
            
        except Exception as e:
            logger.error(f"Error getting service info: {e}")
            return None
    
    async def create_audit_log(
        self,
        user_id: str,
        action: str,
        resource_type: str,
        resource_id: str,
        details: Dict,
        ip_address: Optional[str] = None
    ) -> bool:
        """Create audit log entry for LGPD compliance"""
        try:
            audit_data = {
                'user_id': user_id,
                'action': action,
                'resource_type': resource_type,
                'resource_id': resource_id,
                'details': details,
                'ip_address': ip_address or 'unknown',
                'created_at': datetime.now().isoformat()
            }
            
            response = (
                self.client
                .from_('audit_logs')
                .insert(audit_data)
                .execute()
            )
            
            return True
            
        except Exception as e:
            logger.error(f"Error creating audit log: {e}")
            return False
    
    async def check_lgpd_consent(self, patient_id: str) -> bool:
        """Check if patient has given LGPD consent"""
        try:
            response = (
                self.client
                .from_('patients')
                .select('lgpd_consent_given')
                .eq('id', patient_id)
                .single()
                .execute()
            )
            
            return response.data.get('lgpd_consent_given', False) if response.data else False
            
        except Exception as e:
            logger.error(f"Error checking LGPD consent: {e}")
            return False
    
    def clear_cache(self):
        """Clear the database cache"""
        self._cache.clear()
    
    async def get_patient_statistics(self, patient_id: str) -> Dict:
        """Get patient statistics"""
        try:
            # Get appointment statistics
            appointments = await self.get_patient_appointments(patient_id)
            
            # Get financial statistics
            transactions = await self.get_financial_transactions(patient_id=patient_id)
            
            stats = {
                'total_appointments': len(appointments),
                'completed_appointments': len([a for a in appointments if a.get('status') == 'completed']),
                'upcoming_appointments': len([a for a in appointments if a.get('status') == 'scheduled']),
                'total_spent': sum(t.get('amount', 0) for t in transactions if t.get('status') == 'completed'),
                'pending_payments': sum(t.get('amount', 0) for t in transactions if t.get('status') == 'pending')
            }
            
            return stats
            
        except Exception as e:
            logger.error(f"Error getting patient statistics: {e}")
            return {}