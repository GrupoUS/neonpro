"""
NeonPro FastAPI Core Application
===============================

Sistema de gestão para clínicas de estética multiprofissionais brasileiras
Foco em gerenciamento de pacientes e inteligência financeira através de IA

Características:
- Sistema não médico (sem CFM, telemedicina)
- Foco em procedimentos estéticos e wellness
- Compliance: LGPD + ANVISA (produtos estéticos)
- Multi-profissional: Esteticistas, dermatologistas estéticos, terapeutas

Tech Stack:
- FastAPI (Python 3.11+)
- Prisma ORM (PostgreSQL via Supabase)
- Supabase Database + Auth + Edge Functions
- IA para otimização de agendamento e analytics
- Vercel Edge Functions deployment
"""

import os
import logging
from contextlib import asynccontextmanager
from typing import Any, Dict

from fastapi import FastAPI, Request, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.responses import JSONResponse
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.openapi.docs import get_swagger_ui_html
from fastapi.openapi.utils import get_openapi

import uvicorn
from prometheus_fastapi_instrumentator import Instrumentator

# Import routers
from routers.auth import router as auth_router
from routers.clinics import router as clinics_router
from routers.patients import router as patients_router
from routers.professionals import router as professionals_router
from routers.appointments import router as appointments_router
from routers.services import router as services_router
from routers.analytics import router as analytics_router
from routers.compliance import router as compliance_router

# Import middleware and utilities
from middleware.security import SecurityMiddleware
from middleware.audit import AuditMiddleware
from middleware.rate_limiting import RateLimitMiddleware
from middleware.lgpd import LGPDMiddleware
from utils.database import database_manager
from utils.auth import verify_token
from utils.logging import setup_logging
from utils.health import health_check_startup, health_check_shutdown

# Environment configuration
ENVIRONMENT = os.getenv("FASTAPI_ENV", "development")
DATABASE_URL = os.getenv("DATABASE_URL")
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

# Logging configuration
setup_logging(level=logging.INFO if ENVIRONMENT == "production" else logging.DEBUG)
logger = logging.getLogger(__name__)

# Security
security = HTTPBearer(auto_error=False)

@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application lifespan manager
    Handles startup and shutdown events
    """
    # Startup
    logger.info("🚀 NeonPro API Starting...")
    
    # Initialize database connection
    await database_manager.connect()
    logger.info("✅ Database connected")
    
    # Initialize health checks
    await health_check_startup()
    logger.info("✅ Health checks initialized")
    
    # Initialize AI services
    try:
        from services.ai.scheduling_optimizer import SchedulingOptimizer
        await SchedulingOptimizer.initialize()
        logger.info("✅ AI scheduling optimizer initialized")
    except Exception as e:
        logger.warning(f"⚠️ AI services initialization failed: {e}")
    
    logger.info("🎯 NeonPro API Ready!")
    
    yield
    
    # Shutdown
    logger.info("🛑 NeonPro API Shutting down...")
    
    # Close database connection
    await database_manager.disconnect()
    logger.info("✅ Database disconnected")
    
    # Cleanup health checks
    await health_check_shutdown()
    logger.info("✅ Health checks cleaned up")
    
    logger.info("👋 NeonPro API Stopped")

# FastAPI application instance
app = FastAPI(
    title="NeonPro API",
    description="""
    ## 🏥 NeonPro - Sistema de Gestão para Clínicas Estéticas
    
    Sistema completo para gerenciamento de clínicas de estética multiprofissionais brasileiras,
    focado em gerenciamento de pacientes e inteligência financeira através de IA.
    
    ### 🎯 Características Principais
    
    - **Gerenciamento de Pacientes**: Cadastro, histórico, agendamentos, fotos antes/depois
    - **Inteligência Financeira**: Analytics, predição de receita, otimização de preços
    - **IA para Otimização**: Agendamento inteligente, redução de no-show, analytics preditivos
    - **Compliance Brasileiro**: LGPD + ANVISA (produtos estéticos) - não médico
    - **Multi-profissional**: Esteticistas, dermatologistas estéticos, terapeutas
    
    ### 🔐 Segurança & Compliance
    
    - Autenticação JWT com Supabase Auth
    - LGPD compliance automatizado
    - ANVISA compliance para produtos estéticos
    - Auditoria completa de acessos
    - Criptografia end-to-end para dados sensíveis
    
    ### 🤖 IA & Analytics
    
    - Otimização inteligente de agendamento
    - Predição de no-show
    - Analytics preditivos de receita
    - Segmentação de pacientes
    - Recomendações de tratamentos
    """,
    version="1.0.0",
    terms_of_service="https://neonpro.com.br/termos",
    contact={
        "name": "NeonPro Support",
        "url": "https://neonpro.com.br/suporte",
        "email": "suporte@neonpro.com.br",
    },
    license_info={
        "name": "Proprietary",
        "url": "https://neonpro.com.br/licenca",
    },
    openapi_tags=[
        {"name": "auth", "description": "Autenticação e autorização"},
        {"name": "clinics", "description": "Gestão de clínicas"},
        {"name": "patients", "description": "Gestão de pacientes"},
        {"name": "professionals", "description": "Gestão de profissionais"},
        {"name": "appointments", "description": "Gestão de agendamentos"},
        {"name": "services", "description": "Gestão de serviços"},
        {"name": "analytics", "description": "Analytics e relatórios"},
        {"name": "compliance", "description": "Compliance LGPD/ANVISA"},
        {"name": "health", "description": "Health checks"},
    ],
    docs_url="/docs" if ENVIRONMENT != "production" else None,
    redoc_url="/redoc" if ENVIRONMENT != "production" else None,
    lifespan=lifespan,
)

# Trust proxy headers (Vercel)
app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=["*"] if ENVIRONMENT == "development" else ["*.vercel.app", "neonpro.com.br"]
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001", 
        "https://*.vercel.app",
        "https://neonpro.com.br",
        "https://app.neonpro.com.br"
    ] if ENVIRONMENT == "production" else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["X-Request-ID", "X-RateLimit-Remaining"],
)

# Security middleware
app.add_middleware(SecurityMiddleware)

# Audit middleware (LGPD compliance)
app.add_middleware(AuditMiddleware)

# LGPD compliance middleware
app.add_middleware(LGPDMiddleware)

# Rate limiting middleware
app.add_middleware(RateLimitMiddleware)

# Gzip compression
app.add_middleware(GZipMiddleware, minimum_size=1000)

# Prometheus instrumentation
if ENVIRONMENT == "production":
    instrumentator = Instrumentator()
    instrumentator.instrument(app).expose(app)

# Exception handlers
@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    """Handle HTTP exceptions with proper logging"""
    logger.warning(f"HTTP {exc.status_code}: {exc.detail} - {request.url}")
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": exc.detail,
            "status_code": exc.status_code,
            "path": str(request.url.path),
            "method": request.method,
        }
    )

@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    """Handle general exceptions with proper logging"""
    logger.error(f"Unhandled exception: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal server error",
            "status_code": 500,
            "path": str(request.url.path),
            "method": request.method,
        }
    )

# Root endpoint
@app.get("/", response_model=Dict[str, Any])
async def root():
    """
    Root endpoint - API information
    """
    return {
        "name": "NeonPro API",
        "version": "1.0.0",
        "description": "Sistema de gestão para clínicas de estética multiprofissionais brasileiras",
        "status": "healthy",
        "environment": ENVIRONMENT,
        "features": [
            "Gerenciamento de pacientes",
            "Inteligência financeira",
            "IA para otimização",
            "Compliance LGPD + ANVISA",
            "Multi-profissional"
        ],
        "docs": "/docs" if ENVIRONMENT != "production" else None,
    }

# Health check endpoint
@app.get("/health", response_model=Dict[str, Any])
async def health_check():
    """
    Health check endpoint for monitoring
    """
    try:
        # Check database connection
        db_status = await database_manager.health_check()
        
        # Check external services
        services_status = {
            "database": db_status,
            "supabase": bool(SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY),
        }
        
        # Overall health
        is_healthy = all(services_status.values())
        
        return {
            "status": "healthy" if is_healthy else "unhealthy",
            "timestamp": __import__("datetime").datetime.utcnow().isoformat(),
            "version": "1.0.0",
            "environment": ENVIRONMENT,
            "services": services_status,
            "uptime": "calculated_in_middleware",  # Will be calculated by middleware
        }
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        return JSONResponse(
            status_code=503,
            content={
                "status": "unhealthy",
                "error": str(e),
                "timestamp": __import__("datetime").datetime.utcnow().isoformat(),
            }
        )

# Include routers
app.include_router(auth_router, prefix="/api/v1/auth", tags=["auth"])
app.include_router(clinics_router, prefix="/api/v1/clinics", tags=["clinics"])
app.include_router(patients_router, prefix="/api/v1/patients", tags=["patients"])
app.include_router(professionals_router, prefix="/api/v1/professionals", tags=["professionals"])
app.include_router(appointments_router, prefix="/api/v1/appointments", tags=["appointments"])
app.include_router(services_router, prefix="/api/v1/services", tags=["services"])
app.include_router(analytics_router, prefix="/api/v1/analytics", tags=["analytics"])
app.include_router(compliance_router, prefix="/api/v1/compliance", tags=["compliance"])

# Custom OpenAPI schema
def custom_openapi():
    """Custom OpenAPI schema with security schemes"""
    if app.openapi_schema:
        return app.openapi_schema
    
    openapi_schema = get_openapi(
        title=app.title,
        version=app.version,
        description=app.description,
        routes=app.routes,
    )
    
    # Add security schemes
    openapi_schema["components"]["securitySchemes"] = {
        "BearerAuth": {
            "type": "http",
            "scheme": "bearer",
            "bearerFormat": "JWT",
            "description": "JWT token from Supabase Auth"
        }
    }
    
    # Add global security
    openapi_schema["security"] = [{"BearerAuth": []}]
    
    app.openapi_schema = openapi_schema
    return app.openapi_schema

app.openapi = custom_openapi

# Development server
if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True if ENVIRONMENT == "development" else False,
        log_level="info",
        access_log=True,
    )