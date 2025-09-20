#!/usr/bin/env python3
"""
AG-UI RAG Agent for NeonPro
Integrates with Supabase to provide conversational access to client, appointment, and financial data.
"""

import os
import asyncio
import json
from typing import Dict, Any, List, Optional
from datetime import datetime, timedelta

import uvicorn
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.responses import HTMLResponse
from pydantic import BaseModel

from ag_ui_protocol import AGUIProtocol, AGUIEvent
from supabase import create_client, Client

# Environment variables
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

app = FastAPI(title="NeonPro AI Agent", version="1.0.0")

# Initialize Supabase client
supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

# Initialize AG-UI Protocol
agui = AGUIProtocol()

class QueryRequest(BaseModel):
    query: str
    session_id: str
    context: Optional[Dict[str, Any]] = None

class AgentResponse(BaseModel):
    id: str
    type: str
    content: Dict[str, Any]
    actions: Optional[List[Dict[str, Any]]] = None

class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def send_personal_message(self, message: str, websocket: WebSocket):
        await websocket.send_text(message)

manager = ConnectionManager()

@app.get("/")
async def get():
    return {"message": "NeonPro AI Agent is running"}

@app.post("/api/ai/data-agent")
async def data_agent_endpoint(request: QueryRequest):
    """
    Process natural language queries and return structured responses.
    """
    try:
        # Parse user intent
        intent = await parse_user_intent(request.query)
        
        # Fetch data based on intent
        data = await fetch_data(intent)
        
        # Format response
        response = await format_response(data, intent)
        
        return {
            "success": True,
            "response": response.dict(),
            "actions": response.actions or []
        }
        
    except Exception as e:
        return {
            "success": False,
            "error": {
                "code": "PROCESSING_ERROR",
                "message": str(e)
            }
        }

async def parse_user_intent(query: str) -> Dict[str, Any]:
    """
    Parse natural language query to determine intent.
    """
    query_lower = query.lower()
    
    # Determine primary intent
    if "cliente" in query_lower or "paciente" in query_lower:
        primary = "clients"
    elif "agendamento" in query_lower or "consulta" in query_lower:
        primary = "appointments"
    elif "financeiro" in query_lower or "faturamento" in query_lower or "pagamento" in query_lower:
        primary = "finances"
    else:
        primary = "general"
    
    # Determine action
    if "próximo" in query_lower or "futuro" in query_lower:
        action = "list"
    elif "resumo" in query_lower or "total" in query_lower:
        action = "summary"
    else:
        action = "list"
    
    return {
        "primary": primary,
        "action": action,
        "query": query,
        "filters": extract_filters(query)
    }

def extract_filters(query: str) -> Dict[str, Any]:
    """
    Extract filters from the query.
    """
    filters = {}
    query_lower = query.lower()
    
    # Extract name filter
    if "da maria" in query_lower or "do joão" in query_lower:
        # Simple name extraction - in production, use NLP
        filters["name"] = query.split("da ")[-1].split("para")[0].strip()
    
    # Extract date filter
    if "amanhã" in query_lower:
        filters["date"] = (datetime.now() + timedelta(days=1)).strftime("%Y-%m-%d")
    elif "hoje" in query_lower:
        filters["date"] = datetime.now().strftime("%Y-%m-%d")
    
    return filters

async def fetch_data(intent: Dict[str, Any]) -> Dict[str, Any]:
    """
    Fetch data from Supabase based on intent.
    """
    primary = intent["primary"]
    filters = intent.get("filters", {})
    
    if primary == "clients":
        return await fetch_clients_data(filters)
    elif primary == "appointments":
        return await fetch_appointments_data(filters)
    elif primary == "finances":
        return await fetch_financial_data(filters)
    else:
        return {"error": "Unsupported query type"}

async def fetch_clients_data(filters: Dict[str, Any]) -> Dict[str, Any]:
    """
    Fetch client data from Supabase.
    """
    query = supabase.table("clients").select("*")
    
    if "name" in filters:
        query = query.ilike("name", f"%{filters['name']}%")
    
    result = query.execute()
    
    return {
        "type": "list",
        "title": "Clientes Encontrados",
        "data": result.data or [],
        "columns": [
            {"key": "name", "label": "Nome", "type": "text"},
            {"key": "email", "label": "Email", "type": "email"},
            {"key": "phone", "label": "Telefone", "type": "phone"}
        ]
    }

async def fetch_appointments_data(filters: Dict[str, Any]) -> Dict[str, Any]:
    """
    Fetch appointment data from Supabase.
    """
    query = supabase.table("appointments").select(`
        *,
        clients(name)
    `)
    
    if "date" in filters:
        query = query.gte("datetime", f"{filters['date']}T00:00:00")
        query = query.lt("datetime", f"{filters['date']}T23:59:59")
    
    # Order by datetime
    query = query.order("datetime")
    
    result = query.execute()
    
    # Format data with client names
    formatted_data = []
    for appt in result.data or []:
        formatted_data.append({
            "id": appt["id"],
            "datetime": appt["datetime"],
            "clientName": appt.get("clients", {}).get("name", "N/A"),
            "status": appt["status"],
            "type": appt["type"]
        })
    
    return {
        "type": "list",
        "title": "Agendamentos",
        "data": formatted_data,
        "columns": [
            {"key": "datetime", "label": "Data/Hora", "type": "datetime"},
            {"key": "clientName", "label": "Cliente", "type": "text"},
            {"key": "status", "label": "Status", "type": "badge"},
            {"key": "type", "label": "Tipo", "type": "text"}
        ],
        "actions": [
            {"id": "view-details", "label": "Ver Detalhes", "type": "button"}
        ]
    }

async def fetch_financial_data(filters: Dict[str, Any]) -> Dict[str, Any]:
    """
    Fetch financial data from Supabase.
    """
    # Calculate date range for last 30 days by default
    end_date = datetime.now()
    start_date = end_date - timedelta(days=30)
    
    query = supabase.table("financial_records").select("*")
    query = query.gte("date", start_date.strftime("%Y-%m-%d"))
    query = query.lte("date", end_date.strftime("%Y-%m-%d"))
    
    result = query.execute()
    
    # Calculate summary
    total_revenue = sum(r["amount"] for r in result.data if r["type"] == "revenue")
    total_expenses = sum(r["amount"] for r in result.data if r["type"] == "expense")
    
    return {
        "type": "summary",
        "title": "Resumo Financeiro",
        "data": result.data or [],
        "summary": {
            "totalRevenue": total_revenue,
            "totalExpenses": total_expenses,
            "netIncome": total_revenue - total_expenses,
            "period": "Últimos 30 dias"
        },
        "columns": [
            {"key": "date", "label": "Data", "type": "date"},
            {"key": "type", "label": "Tipo", "type": "badge"},
            {"key": "amount", "label": "Valor", "type": "currency"},
            {"key": "description", "label": "Descrição", "type": "text"}
        ]
    }

async def format_response(data: Dict[str, Any], intent: Dict[str, Any]) -> AgentResponse:
    """
    Format the response for the frontend.
    """
    return AgentResponse(
        id=f"resp_{datetime.now().timestamp()}",
        type=data.get("type", "text"),
        content=data,
        actions=data.get("actions")
    )

@app.websocket("/ws/ai/agent")
async def websocket_endpoint(websocket: WebSocket):
    """
    WebSocket endpoint for real-time communication with AG-UI protocol.
    """
    await manager.connect(websocket)
    try:
        while True:
            # Receive message from client
            data = await websocket.receive_text()
            message = json.loads(data)
            
            # Process message through AG-UI protocol
            event = AGUIEvent.from_dict(message)
            
            # Handle different event types
            if event.type == "userMessage":
                # Process user query
                request = QueryRequest(
                    query=event.payload.get("message", ""),
                    session_id=event.session_id
                )
                
                response = await data_agent_endpoint(request)
                
                # Send response back
                response_event = AGUIEvent(
                    type="agentMessage",
                    session_id=event.session_id,
                    payload=response
                )
                
                await manager.send_personal_message(
                    response_event.to_json(),
                    websocket
                )
            
    except WebSocketDisconnect:
        manager.disconnect(websocket)

if __name__ == "__main__":
    uvicorn.run(
        "agent:app",
        host="0.0.0.0",
        port=int(os.getenv("AI_AGENT_PORT", 8000)),
        reload=True
    )