"""
Main AI Agent service with RAG capabilities
"""

import asyncio
import json
import logging
from typing import Dict, List, Optional, Any
from datetime import datetime
import re
from enum import Enum

from langchain_openai import ChatOpenAI
from langchain_anthropic import ChatAnthropic
from langchain.prompts import ChatPromptTemplate
from langchain.schema import HumanMessage, SystemMessage, AIMessage
from langchain.chains import ConversationChain
from langchain.memory import ConversationBufferMemory

from .database_service import DatabaseService
from .websocket_manager import WebSocketManager

logger = logging.getLogger(__name__)


class QueryIntent(Enum):
    """Intent types for user queries"""
    CLIENT_SEARCH = "client_search"
    APPOINTMENT_QUERY = "appointment_query"
    FINANCIAL_QUERY = "financial_query"
    SCHEDULE_MANAGEMENT = "schedule_management"
    REPORT_GENERATION = "report_generation"
    UNKNOWN = "unknown"


class AgentService:
    """Main AI Agent service"""
    
    def __init__(
        self,
        db_service: DatabaseService,
        ws_manager: WebSocketManager,
        openai_api_key: str,
        anthropic_api_key: str
    ):
        self.db_service = db_service
        self.ws_manager = ws_manager
        
        # Initialize AI models
        self.openai_llm = ChatOpenAI(
            model="gpt-4-turbo-preview",
            openai_api_key=openai_api_key,
            temperature=0.1
        )
        
        self.anthropic_llm = ChatAnthropic(
            model="claude-3-sonnet-20240229",
            anthropic_api_key=anthropic_api_key,
            temperature=0.1
        )
        
        # Initialize conversation memory
        self.memory = ConversationBufferMemory(
            return_messages=True,
            memory_key="history",
            input_key="input"
        )
        
        # Initialize conversation chain
        self.conversation = ConversationChain(
            llm=self.openai_llm,
            memory=self.memory,
            verbose=True
        )
        
        # Brazilian healthcare patterns
        self.name_pattern = re.compile(r'[A-Z][a-z]+ [A-Z][a-z]+')
        self.cpf_pattern = re.compile(r'\d{3}\.?\d{3}\.?\d{3}-?\d{2}')
        self.date_pattern = re.compile(r'\d{1,2}/\d{1,2}/\d{4}')
        
    async def process_message(self, message: Dict) -> Dict:
        """Process incoming WebSocket message"""
        message_type = message.get('type')
        
        if message_type == 'query':
            return await self._process_query(message)
        elif message_type == 'action':
            return await self._process_action(message)
        elif message_type == 'feedback':
            return await self._process_feedback(message)
        else:
            return {
                'type': 'error',
                'message': f'Unknown message type: {message_type}',
                'timestamp': datetime.now().isoformat()
            }
    
    async def process_query(self, query: Dict) -> Dict:
        """Process REST API query"""
        try:
            user_query = query.get('query', '')
            context = query.get('context', {})
            
            # Parse intent and entities
            intent = self._detect_intent(user_query)
            entities = await self._extract_entities(user_query, intent)
            
            # Process based on intent
            if intent == QueryIntent.CLIENT_SEARCH:
                result = await self._handle_client_search(entities, context)
            elif intent == QueryIntent.APPOINTMENT_QUERY:
                result = await self._handle_appointment_query(entities, context)
            elif intent == QueryIntent.FINANCIAL_QUERY:
                result = await self._handle_financial_query(entities, context)
            elif intent == QueryIntent.SCHEDULE_MANAGEMENT:
                result = await self._handle_schedule_management(entities, context)
            elif intent == QueryIntent.REPORT_GENERATION:
                result = await self._handle_report_generation(entities, context)
            else:
                result = await self._handle_unknown_query(user_query)
            
            # Add to conversation memory
            self.memory.save_context(
                {"input": user_query},
                {"output": json.dumps(result, ensure_ascii=False)}
            )
            
            return result
            
        except Exception as e:
            logger.error(f"Error processing query: {e}")
            return {
                'type': 'error',
                'message': 'An error occurred while processing your request',
                'timestamp': datetime.now().isoformat()
            }
    
    def _detect_intent(self, text: str) -> QueryIntent:
        """Detect the intent of a user query"""
        text_lower = text.lower()
        
        # Client search patterns
        if any(word in text_lower for word in ['buscar', 'procurar', 'achar', 'paciente', 'cliente']):
            return QueryIntent.CLIENT_SEARCH
        
        # Appointment query patterns
        elif any(word in text_lower for word in ['consulta', 'agendamento', 'marcação', 'compromisso']):
            return QueryIntent.APPOINTMENT_QUERY
        
        # Financial query patterns
        elif any(word in text_lower for word in ['financeiro', 'pagamento', 'fatura', 'valor', 'dinheiro']):
            return QueryIntent.FINANCIAL_QUERY
        
        # Schedule management patterns
        elif any(word in text_lower for word in ['agenda', 'marcar', 'cancelar', 'remarcar']):
            return QueryIntent.SCHEDULE_MANAGEMENT
        
        # Report generation patterns
        elif any(word in text_lower for word in ['relatório', 'relatorio', 'resumo', 'relatório']):
            return QueryIntent.REPORT_GENERATION
        
        else:
            return QueryIntent.UNKNOWN
    
    async def _extract_entities(self, text: str, intent: QueryIntent) -> Dict[str, Any]:
        """Extract entities from user query"""
        entities = {}
        
        # Extract names
        names = self.name_pattern.findall(text)
        if names:
            entities['names'] = names
        
        # Extract CPF
        cpf_match = self.cpf_pattern.search(text)
        if cpf_match:
            entities['cpf'] = cpf_match.group()
        
        # Extract dates
        dates = self.date_pattern.findall(text)
        if dates:
            entities['dates'] = dates
        
        # Extract intent-specific entities
        if intent == QueryIntent.CLIENT_SEARCH:
            await self._extract_client_entities(text, entities)
        elif intent == QueryIntent.APPOINTMENT_QUERY:
            await self._extract_appointment_entities(text, entities)
        elif intent == QueryIntent.FINANCIAL_QUERY:
            await self._extract_financial_entities(text, entities)
        
        return entities
    
    async def _extract_client_entities(self, text: str, entities: Dict):
        """Extract entities specific to client search"""
        # Extract clinic information if mentioned
        if 'clínica' in text.lower():
            entities['search_in_clinic'] = True
        
        # Extract specific fields to search
        if 'email' in text.lower():
            entities['include_email'] = True
        if 'telefone' in text.lower():
            entities['include_phone'] = True
    
    async def _extract_appointment_entities(self, text: str, entities: Dict):
        """Extract entities specific to appointment queries"""
        text_lower = text.lower()
        
        # Extract appointment status
        if any(word in text_lower for word in ['próxima', 'futura', 'agenda']):
            entities['appointment_status'] = 'upcoming'
        elif any(word in text_lower for word in ['passada', 'anterior', 'histórico']):
            entities['appointment_status'] = 'past'
        elif any(word in text_lower for word in ['cancelada', 'cancelado']):
            entities['appointment_status'] = 'cancelled'
    
    async def _extract_financial_entities(self, text: str, entities: Dict):
        """Extract entities specific to financial queries"""
        text_lower = text.lower()
        
        # Extract transaction type
        if any(word in text_lower for word in ['pagamento', 'pago']):
            entities['transaction_type'] = 'payment'
        elif any(word in text_lower for word in ['fatura', 'cobrança']):
            entities['transaction_type'] = 'invoice'
        
        # Extract status
        if any(word in text_lower for word in ['pendente', 'aberto']):
            entities['status'] = 'pending'
        elif any(word in text_lower for word in ['pago', 'liquidado']):
            entities['status'] = 'paid'
    
    async def _handle_client_search(self, entities: Dict, context: Dict) -> Dict:
        """Handle client search requests"""
        names = entities.get('names', [])
        
        if not names:
            return {
                'type': 'response',
                'content': 'Por favor, forneça o nome do paciente que deseja buscar.',
                'timestamp': datetime.now().isoformat()
            }
        
        # Search for each name
        all_results = []
        for name in names:
            try:
                patients = await self.db_service.search_patients(
                    name=name,
                    limit=10,
                    context=context
                )
                all_results.extend(patients)
            except Exception as e:
                logger.error(f"Error searching patients: {e}")
        
        if not all_results:
            return {
                'type': 'response',
                'content': f'Nenhum paciente encontrado com os nomes: {", ".join(names)}',
                'timestamp': datetime.now().isoformat()
            }
        
        # Format results
        formatted_results = []
        for patient in all_results[:10]:  # Limit to 10 results
            formatted_patient = {
                'id': patient['id'],
                'name': patient['full_name'],
                'email': patient.get('email'),
                'phone': patient.get('phone'),
                'cpf': patient.get('cpf'),
                'birth_date': patient.get('birth_date'),
                'lgpd_consent': patient.get('lgpd_consent_given', False)
            }
            formatted_results.append(formatted_patient)
        
        return {
            'type': 'data_response',
            'data_type': 'clients',
            'data': formatted_results,
            'count': len(formatted_results),
            'timestamp': datetime.now().isoformat()
        }
    
    async def _handle_appointment_query(self, entities: Dict, context: Dict) -> Dict:
        """Handle appointment queries"""
        names = entities.get('names', [])
        
        if not names:
            return {
                'type': 'response',
                'content': 'Por favor, forneça o nome do paciente para buscar agendamentos.',
                'timestamp': datetime.now().isoformat()
            }
        
        # First find the patient
        patients = await self.db_service.search_patients(
            name=names[0],
            limit=1,
            context=context
        )
        
        if not patients:
            return {
                'type': 'response',
                'content': f'Paciente "{names[0]}" não encontrado.',
                'timestamp': datetime.now().isoformat()
            }
        
        patient = patients[0]
        
        # Get appointments
        appointments = await self.db_service.get_patient_appointments(patient['id'])
        
        if not appointments:
            return {
                'type': 'response',
                'content': f'Nenhum agendamento encontrado para {patient["full_name"]}.',
                'timestamp': datetime.now().isoformat()
            }
        
        # Format appointments with additional info
        formatted_appointments = []
        for apt in appointments:
            # Get professional and service info
            professional = await self.db_service.get_professional_info(apt['professional_id'])
            service = await self.db_service.get_service_info(apt['service_id'])
            
            formatted_apt = {
                'id': apt['id'],
                'scheduled_at': apt['scheduled_at'],
                'duration_minutes': apt['duration_minutes'],
                'status': apt['status'],
                'notes': apt.get('notes'),
                'professional': professional.get('full_name') if professional else 'Não informado',
                'service': service.get('name') if service else 'Não informado'
            }
            formatted_appointments.append(formatted_apt)
        
        return {
            'type': 'data_response',
            'data_type': 'appointments',
            'data': formatted_appointments,
            'patient_name': patient['full_name'],
            'count': len(formatted_appointments),
            'timestamp': datetime.now().isoformat()
        }
    
    async def _handle_financial_query(self, entities: Dict, context: Dict) -> Dict:
        """Handle financial queries"""
        names = entities.get('names', [])
        
        if not names:
            return {
                'type': 'response',
                'content': 'Por favor, forneça o nome do paciente para consultar dados financeiros.',
                'timestamp': datetime.now().isoformat()
            }
        
        # Find patient first
        patients = await self.db_service.search_patients(
            name=names[0],
            limit=1,
            context=context
        )
        
        if not patients:
            return {
                'type': 'response',
                'content': f'Paciente "{names[0]}" não encontrado.',
                'timestamp': datetime.now().isoformat()
            }
        
        patient = patients[0]
        
        # Get financial transactions
        transactions = await self.db_service.get_financial_transactions(
            patient_id=patient['id']
        )
        
        # Get patient statistics
        stats = await self.db_service.get_patient_statistics(patient['id'])
        
        return {
            'type': 'data_response',
            'data_type': 'financial',
            'data': transactions,
            'patient_name': patient['full_name'],
            'statistics': stats,
            'count': len(transactions),
            'timestamp': datetime.now().isoformat()
        }
    
    async def _handle_schedule_management(self, entities: Dict, context: Dict) -> Dict:
        """Handle schedule management requests"""
        return {
            'type': 'response',
            'content': 'Gerenciamento de agenda será implementado em breve.',
            'timestamp': datetime.now().isoformat()
        }
    
    async def _handle_report_generation(self, entities: Dict, context: Dict) -> Dict:
        """Handle report generation requests"""
        return {
            'type': 'response',
            'content': 'Geração de relatórios será implementada em breve.',
            'timestamp': datetime.now().isoformat()
        }
    
    async def _handle_unknown_query(self, query: str) -> Dict:
        """Handle unknown queries with conversation chain"""
        try:
            response = await self.conversation.arun(input=query)
            
            return {
                'type': 'response',
                'content': response,
                'timestamp': datetime.now().isoformat()
            }
        except Exception as e:
            logger.error(f"Error in conversation chain: {e}")
            
            return {
                'type': 'response',
                'content': 'Desculpe, não entendi sua pergunta. Por favor, tente perguntar sobre pacientes, agendamentos ou dados financeiros.',
                'timestamp': datetime.now().isoformat()
            }
    
    async def _process_action(self, message: Dict) -> Dict:
        """Process action requests"""
        action_type = message.get('action_type')
        
        if action_type == 'export_data':
            return await self._handle_export_data(message)
        elif action_type == 'navigate_to':
            return await self._handle_navigation(message)
        else:
            return {
                'type': 'error',
                'message': f'Unknown action type: {action_type}',
                'timestamp': datetime.now().isoformat()
            }
    
    async def _handle_export_data(self, message: Dict) -> Dict:
        """Handle data export requests"""
        # In a real implementation, this would generate and return export data
        return {
            'type': 'action_response',
            'action_type': 'export_data',
            'status': 'success',
            'message': 'Dados exportados com sucesso',
            'timestamp': datetime.now().isoformat()
        }
    
    async def _handle_navigation(self, message: Dict) -> Dict:
        """Handle navigation requests"""
        target = message.get('target')
        
        return {
            'type': 'action_response',
            'action_type': 'navigate_to',
            'target': target,
            'status': 'success',
            'timestamp': datetime.now().isoformat()
        }
    
    async def _process_feedback(self, message: Dict) -> Dict:
        """Process user feedback"""
        feedback_type = message.get('feedback_type')
        feedback_data = message.get('data', {})
        
        # Log feedback for improvement
        logger.info(f"Received feedback: {feedback_type} - {feedback_data}")
        
        return {
            'type': 'feedback_received',
            'feedback_type': feedback_type,
            'timestamp': datetime.now().isoformat()
        }