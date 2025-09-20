"""
Healthcare Data Service for NeonPro AG-UI RAG Agent
Provides Supabase integration with UI/UX optimized data formatting
"""

import asyncio
import json
from datetime import datetime, timedelta
from typing import Dict, Any, List, Optional, Tuple
from supabase import create_client, Client
from agent_config import AgentConfig
import logging

logger = logging.getLogger(__name__)

class HealthcareDataService:
    """Service for healthcare data queries with UI/UX optimization"""
    
    def __init__(self, config: AgentConfig):
        self.config = config
        self.supabase: Client = create_client(
            config.SUPABASE_URL,
            config.SUPABASE_SERVICE_KEY
        )
        
    async def query_upcoming_appointments(self, user_context: Dict[str, Any], limit: int = 10) -> Dict[str, Any]:
        """Query upcoming appointments with mobile-responsive formatting"""
        try:
            # Calculate date range (next 30 days)
            today = datetime.now().date()
            end_date = today + timedelta(days=30)
            
            # Query appointments from Supabase
            result = self.supabase.table('appointments').select(
                'id, datetime, client_id, status, type, notes, clients(id, name, phone)'
            ).gte(
                'datetime', today.isoformat()
            ).lte(
                'datetime', end_date.isoformat()
            ).eq(
                'domain', user_context.get('domain', 'default')
            ).order(
                'datetime', desc=False
            ).limit(limit).execute()
            
            appointments = result.data if result.data else []
            
            # Format for UI/UX - mobile-first responsive design
            formatted_appointments = []
            for apt in appointments:
                client = apt.get('clients', {})
                formatted_appointments.append({
                    'id': apt['id'],
                    'datetime': apt['datetime'],
                    'clientName': client.get('name', 'Cliente não identificado'),
                    'clientPhone': self._mask_phone(client.get('phone', '')),
                    'status': apt['status'],
                    'type': apt['type'],
                    'displayTime': self._format_display_time(apt['datetime']),
                    'displayDate': self._format_display_date(apt['datetime']),
                    'statusBadge': self._get_status_badge(apt['status']),
                    'actionButtons': self._get_appointment_actions(apt['id'], apt['status'])
                })
            
            return {
                'type': 'appointments_list',
                'title': 'Próximos Agendamentos',
                'count': len(formatted_appointments),
                'data': formatted_appointments,
                'summary': f"Encontrados {len(formatted_appointments)} agendamentos nos próximos 30 dias",
                'mobileOptimized': True,
                'accessibility': {
                    'ariaLabel': f"Lista de {len(formatted_appointments)} próximos agendamentos",
                    'description': 'Agendamentos organizados por data e hora com ações disponíveis'
                }
            }
            
        except Exception as e:
            logger.error(f"Error querying appointments: {e}")
            return self._create_error_response(
                'Erro ao buscar agendamentos',
                'Tente novamente em alguns momentos'
            )
    
    async def query_clients_by_name(self, name_query: str, user_context: Dict[str, Any], limit: int = 20) -> Dict[str, Any]:
        """Query clients by name with LGPD compliance and responsive formatting"""
        try:
            # Query clients from Supabase with proper filtering
            result = self.supabase.table('clients').select(
                'id, name, phone, email, created_at, last_appointment_date'
            ).ilike(
                'name', f'%{name_query}%'
            ).eq(
                'domain', user_context.get('domain', 'default')
            ).order(
                'name', desc=False
            ).limit(limit).execute()
            
            clients = result.data if result.data else []
            
            # Format for UI/UX with LGPD compliance
            formatted_clients = []
            user_role = user_context.get('role', 'receptionist')
            
            for client in clients:
                # Role-based data masking for LGPD compliance
                client_data = {
                    'id': client['id'],
                    'name': client['name'],
                    'phone': self._mask_phone_by_role(client.get('phone', ''), user_role),
                    'email': self._mask_email_by_role(client.get('email', ''), user_role),
                    'memberSince': self._format_display_date(client.get('created_at')),
                    'lastAppointment': self._format_display_date(client.get('last_appointment_date')),
                    'actionButtons': self._get_client_actions(client['id'], user_role)
                }
                
                formatted_clients.append(client_data)
            
            return {
                'type': 'clients_list',
                'title': f'Clientes encontrados para "{name_query}"',
                'count': len(formatted_clients),
                'data': formatted_clients,
                'summary': f"Encontrados {len(formatted_clients)} clientes",
                'mobileOptimized': True,
                'lgpdCompliant': True,
                'userRole': user_role,
                'accessibility': {
                    'ariaLabel': f"Lista de {len(formatted_clients)} clientes encontrados",
                    'description': f'Resultados da busca por "{name_query}" com informações adequadas ao seu perfil'
                }
            }
            
        except Exception as e:
            logger.error(f"Error querying clients: {e}")
            return self._create_error_response(
                'Erro ao buscar clientes',
                'Verifique o nome e tente novamente'
            )
    
    async def query_financial_summary(self, user_context: Dict[str, Any], period_days: int = 30) -> Dict[str, Any]:
        """Query financial summary with role-based access control"""
        try:
            user_role = user_context.get('role', 'receptionist')
            
            # Check if user has permission for financial data
            if user_role not in ['admin', 'doctor', 'manager']:
                return self._create_access_denied_response(
                    'Acesso negado',
                    'Você não tem permissão para visualizar dados financeiros'
                )
            
            # Calculate date range
            end_date = datetime.now().date()
            start_date = end_date - timedelta(days=period_days)
            
            # Query financial data from Supabase
            result = self.supabase.table('financial_records').select(
                'amount, type, status, created_at, payment_method'
            ).gte(
                'created_at', start_date.isoformat()
            ).lte(
                'created_at', end_date.isoformat()
            ).eq(
                'domain', user_context.get('domain', 'default')
            ).execute()
            
            records = result.data if result.data else []
            
            # Calculate summary statistics
            total_revenue = sum(r['amount'] for r in records if r['type'] == 'payment' and r['status'] == 'completed')
            pending_payments = sum(r['amount'] for r in records if r['status'] == 'pending')
            completed_transactions = len([r for r in records if r['status'] == 'completed'])
            
            # Payment method breakdown
            payment_methods = {}
            for record in records:
                if record['status'] == 'completed':
                    method = record.get('payment_method', 'Não informado')
                    payment_methods[method] = payment_methods.get(method, 0) + record['amount']
            
            return {
                'type': 'financial_summary',
                'title': f'Resumo Financeiro - Últimos {period_days} dias',
                'data': {
                    'totalRevenue': {
                        'value': total_revenue,
                        'formatted': f'R$ {total_revenue:,.2f}'.replace(',', 'X').replace('.', ',').replace('X', '.'),
                        'icon': 'TrendingUp',
                        'color': 'success'
                    },
                    'pendingPayments': {
                        'value': pending_payments,
                        'formatted': f'R$ {pending_payments:,.2f}'.replace(',', 'X').replace('.', ',').replace('X', '.'),
                        'icon': 'Clock',
                        'color': 'warning'
                    },
                    'completedTransactions': {
                        'value': completed_transactions,
                        'formatted': f'{completed_transactions} transações',
                        'icon': 'CheckCircle',
                        'color': 'success'
                    },
                    'paymentMethods': payment_methods
                },
                'mobileOptimized': True,
                'userRole': user_role,
                'accessibility': {
                    'ariaLabel': f'Resumo financeiro dos últimos {period_days} dias',
                    'description': 'Dados financeiros com receita total, pagamentos pendentes e métodos de pagamento'
                }
            }
            
        except Exception as e:
            logger.error(f"Error querying financial summary: {e}")
            return self._create_error_response(
                'Erro ao buscar dados financeiros',
                'Tente novamente em alguns momentos'
            )
    
    def _mask_phone(self, phone: str) -> str:
        """Mask phone number for LGPD compliance"""
        if not phone or len(phone) < 8:
            return phone
        return f"{phone[:2]}***{phone[-2:]}"
    
    def _mask_phone_by_role(self, phone: str, role: str) -> str:
        """Mask phone based on user role"""
        if role in ['admin', 'doctor']:
            return phone  # Full access
        return self._mask_phone(phone)
    
    def _mask_email_by_role(self, email: str, role: str) -> str:
        """Mask email based on user role"""
        if role in ['admin', 'doctor']:
            return email  # Full access
        if '@' in email:
            local, domain = email.split('@', 1)
            return f"{local[:2]}***@{domain}"
        return email
    
    def _format_display_time(self, datetime_str: str) -> str:
        """Format time for display (Brazilian format)"""
        try:
            dt = datetime.fromisoformat(datetime_str.replace('Z', '+00:00'))
            return dt.strftime('%H:%M')
        except:
            return datetime_str
    
    def _format_display_date(self, datetime_str: str) -> str:
        """Format date for display (Brazilian format)"""
        if not datetime_str:
            return 'Não informado'
        try:
            dt = datetime.fromisoformat(datetime_str.replace('Z', '+00:00'))
            return dt.strftime('%d/%m/%Y')
        except:
            return datetime_str
    
    def _get_status_badge(self, status: str) -> Dict[str, str]:
        """Get status badge configuration for UI"""
        status_config = {
            'scheduled': {'label': 'Agendado', 'color': 'blue', 'icon': 'Calendar'},
            'confirmed': {'label': 'Confirmado', 'color': 'green', 'icon': 'CheckCircle'},
            'completed': {'label': 'Realizado', 'color': 'gray', 'icon': 'Check'},
            'cancelled': {'label': 'Cancelado', 'color': 'red', 'icon': 'X'},
            'no_show': {'label': 'Faltou', 'color': 'orange', 'icon': 'AlertCircle'}
        }
        return status_config.get(status, {'label': status, 'color': 'gray', 'icon': 'Info'})
    
    def _get_appointment_actions(self, appointment_id: str, status: str) -> List[Dict[str, Any]]:
        """Get context-aware action buttons for appointments"""
        actions = []
        
        if status in ['scheduled', 'confirmed']:
            actions.extend([
                {
                    'id': 'confirm',
                    'label': 'Confirmar',
                    'icon': 'CheckCircle',
                    'variant': 'default',
                    'action': {
                        'type': 'api_call',
                        'endpoint': f'/api/appointments/{appointment_id}/confirm'
                    }
                },
                {
                    'id': 'reschedule',
                    'label': 'Reagendar',
                    'icon': 'Calendar',
                    'variant': 'outline',
                    'action': {
                        'type': 'navigate',
                        'destination': f'/appointments/{appointment_id}/reschedule'
                    }
                }
            ])
        
        actions.append({
            'id': 'view_details',
            'label': 'Ver Detalhes',
            'icon': 'Eye',
            'variant': 'ghost',
            'action': {
                'type': 'navigate',
                'destination': f'/appointments/{appointment_id}'
            }
        })
        
        return actions
    
    def _get_client_actions(self, client_id: str, user_role: str) -> List[Dict[str, Any]]:
        """Get role-based action buttons for clients"""
        actions = [
            {
                'id': 'view_profile',
                'label': 'Ver Perfil',
                'icon': 'User',
                'variant': 'default',
                'action': {
                    'type': 'navigate',
                    'destination': f'/clients/{client_id}'
                }
            }
        ]
        
        if user_role in ['admin', 'doctor', 'nurse']:
            actions.extend([
                {
                    'id': 'schedule_appointment',
                    'label': 'Agendar',
                    'icon': 'Calendar',
                    'variant': 'outline',
                    'action': {
                        'type': 'navigate',
                        'destination': f'/appointments/new?client_id={client_id}'
                    }
                },
                {
                    'id': 'view_history',
                    'label': 'Histórico',
                    'icon': 'History',
                    'variant': 'ghost',
                    'action': {
                        'type': 'navigate',
                        'destination': f'/clients/{client_id}/history'
                    }
                }
            ])
        
        return actions
    
    def _create_error_response(self, title: str, message: str) -> Dict[str, Any]:
        """Create standardized error response for UI"""
        return {
            'type': 'error',
            'title': title,
            'message': message,
            'icon': 'AlertCircle',
            'color': 'error',
            'actions': [
                {
                    'id': 'retry',
                    'label': 'Tentar Novamente',
                    'icon': 'RefreshCw',
                    'variant': 'default',
                    'action': {
                        'type': 'retry_query'
                    }
                },
                {
                    'id': 'contact_support',
                    'label': 'Contatar Suporte',
                    'icon': 'HelpCircle',
                    'variant': 'outline',
                    'action': {
                        'type': 'navigate',
                        'destination': '/support'
                    }
                }
            ],
            'accessibility': {
                'ariaLabel': f'Erro: {title}',
                'description': message
            }
        }
    
    def _create_access_denied_response(self, title: str, message: str) -> Dict[str, Any]:
        """Create standardized access denied response for UI"""
        return {
            'type': 'access_denied',
            'title': title,
            'message': message,
            'icon': 'Shield',
            'color': 'warning',
            'actions': [
                {
                    'id': 'contact_admin',
                    'label': 'Solicitar Acesso',
                    'icon': 'Mail',
                    'variant': 'default',
                    'action': {
                        'type': 'navigate',
                        'destination': '/access-request'
                    }
                }
            ],
            'accessibility': {
                'ariaLabel': f'Acesso negado: {title}',
                'description': message
            }
        }
