"""
Authentication Router
====================

Gestão de autenticação e autorização integrada com Supabase Auth
Compliance LGPD com auditoria completa de acessos
"""

from typing import Any, Dict, Optional
from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException, status, Request, Response
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, EmailStr, Field

from utils.auth import (
    verify_token,
    create_access_token,
    get_current_user,
    get_current_active_user,
    authenticate_user,
    register_user,
    validate_session,
)
from utils.lgpd import log_access_event, get_consent_status, record_consent
from utils.database import get_db_connection
from services.auth.supabase_client import supabase_client
from services.auth.session_manager import SessionManager
from middleware.audit import audit_log

import logging

logger = logging.getLogger(__name__)

router = APIRouter()
security = HTTPBearer()

# Pydantic models
class LoginRequest(BaseModel):
    """Login request model"""
    email: EmailStr = Field(..., description="Email do usuário")
    password: str = Field(..., min_length=8, description="Senha do usuário")
    clinic_id: Optional[str] = Field(None, description="ID da clínica (opcional)")
    remember_me: bool = Field(False, description="Manter logado")

class LoginResponse(BaseModel):
    """Login response model"""
    access_token: str = Field(..., description="JWT token de acesso")
    refresh_token: str = Field(..., description="Token de refresh")
    token_type: str = Field("bearer", description="Tipo do token")
    expires_in: int = Field(..., description="Tempo de expiração em segundos")
    user: Dict[str, Any] = Field(..., description="Dados do usuário")
    clinic: Optional[Dict[str, Any]] = Field(None, description="Dados da clínica")
    permissions: list[str] = Field(..., description="Permissões do usuário")

class RegisterRequest(BaseModel):
    """Registration request model"""
    email: EmailStr = Field(..., description="Email do usuário")
    password: str = Field(..., min_length=8, description="Senha do usuário")
    confirm_password: str = Field(..., min_length=8, description="Confirmação da senha")
    full_name: str = Field(..., min_length=2, max_length=100, description="Nome completo")
    clinic_name: str = Field(..., min_length=2, max_length=100, description="Nome da clínica")
    phone: str = Field(..., description="Telefone de contato")
    cnpj: Optional[str] = Field(None, description="CNPJ da clínica")
    consent_lgpd: bool = Field(..., description="Consentimento LGPD obrigatório")
    consent_marketing: bool = Field(False, description="Consentimento para marketing")

class RefreshTokenRequest(BaseModel):
    """Refresh token request model"""
    refresh_token: str = Field(..., description="Token de refresh")

class PasswordResetRequest(BaseModel):
    """Password reset request model"""
    email: EmailStr = Field(..., description="Email do usuário")

class PasswordUpdateRequest(BaseModel):
    """Password update request model"""
    current_password: str = Field(..., description="Senha atual")
    new_password: str = Field(..., min_length=8, description="Nova senha")
    confirm_password: str = Field(..., min_length=8, description="Confirmação da nova senha")

class LogoutRequest(BaseModel):
    """Logout request model"""
    everywhere: bool = Field(False, description="Logout de todos os dispositivos")

@router.post("/login", response_model=LoginResponse, summary="Login do usuário")
async def login(
    request: LoginRequest,
    req: Request,
    response: Response,
) -> LoginResponse:
    """
    Autenticação do usuário com Supabase Auth
    
    - Valida credenciais
    - Gera tokens JWT
    - Registra evento de acesso (LGPD)
    - Retorna dados do usuário e permissões
    """
    try:
        # Validar credenciais
        auth_result = await authenticate_user(request.email, request.password)
        if not auth_result.get("success"):
            await audit_log(
                req,
                action="login_failed",
                resource_type="auth",
                details={"email": request.email, "reason": "invalid_credentials"}
            )
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Email ou senha inválidos"
            )
        
        user = auth_result["user"]
        session = auth_result["session"]
        
        # Verificar se usuário está ativo
        if not user.get("email_confirmed_at"):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Email não confirmado. Verifique sua caixa de entrada."
            )
        
        # Buscar dados da clínica se especificada
        clinic_data = None
        if request.clinic_id:
            async with get_db_connection() as db:
                clinic_data = await db.clinic.find_unique(
                    where={"id": request.clinic_id},
                    include={"subscription": True}
                )
        
        # Buscar permissões do usuário
        permissions = await get_user_permissions(user["id"], request.clinic_id)
        
        # Configurar sessão
        session_manager = SessionManager()
        await session_manager.create_session(
            user_id=user["id"],
            device_info=req.headers.get("user-agent", "unknown"),
            ip_address=req.client.host,
            clinic_id=request.clinic_id,
            remember_me=request.remember_me
        )
        
        # Log de acesso LGPD
        await log_access_event(
            user_id=user["id"],
            event_type="login",
            ip_address=req.client.host,
            user_agent=req.headers.get("user-agent"),
            clinic_id=request.clinic_id
        )
        
        # Configurar cookies seguros
        if request.remember_me:
            response.set_cookie(
                key="refresh_token",
                value=session["refresh_token"],
                max_age=30 * 24 * 60 * 60,  # 30 dias
                httponly=True,
                secure=True,
                samesite="strict"
            )
        
        await audit_log(
            req,
            action="login_success",
            resource_type="auth",
            resource_id=user["id"],
            details={"clinic_id": request.clinic_id}
        )
        
        return LoginResponse(
            access_token=session["access_token"],
            refresh_token=session["refresh_token"],
            token_type="bearer",
            expires_in=session["expires_in"],
            user={
                "id": user["id"],
                "email": user["email"],
                "full_name": user.get("user_metadata", {}).get("full_name"),
                "avatar_url": user.get("user_metadata", {}).get("avatar_url"),
                "role": user.get("app_metadata", {}).get("role", "user"),
                "email_confirmed": bool(user.get("email_confirmed_at")),
                "last_sign_in": user.get("last_sign_in_at"),
            },
            clinic=clinic_data,
            permissions=permissions
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Login error: {e}", exc_info=True)
        await audit_log(
            req,
            action="login_error",
            resource_type="auth",
            details={"email": request.email, "error": str(e)}
        )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro interno do servidor"
        )

@router.post("/register", response_model=Dict[str, Any], summary="Registro de novo usuário")
async def register(
    request: RegisterRequest,
    req: Request,
) -> Dict[str, Any]:
    """
    Registro de novo usuário e clínica
    
    - Valida dados de entrada
    - Cria usuário no Supabase Auth
    - Cria clínica no banco de dados
    - Registra consentimentos LGPD
    - Envia email de confirmação
    """
    try:
        # Validar senhas
        if request.password != request.confirm_password:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Senhas não coincidem"
            )
        
        # Validar consentimento LGPD obrigatório
        if not request.consent_lgpd:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Consentimento LGPD é obrigatório"
            )
        
        # Registrar usuário
        registration_result = await register_user(
            email=request.email,
            password=request.password,
            full_name=request.full_name,
            clinic_name=request.clinic_name,
            phone=request.phone,
            cnpj=request.cnpj
        )
        
        if not registration_result.get("success"):
            await audit_log(
                req,
                action="registration_failed",
                resource_type="auth",
                details={
                    "email": request.email,
                    "reason": registration_result.get("error")
                }
            )
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=registration_result.get("error", "Erro no registro")
            )
        
        user = registration_result["user"]
        clinic = registration_result["clinic"]
        
        # Registrar consentimentos LGPD
        await record_consent(
            user_id=user["id"],
            consent_type="data_processing",
            granted=True,
            ip_address=req.client.host,
            user_agent=req.headers.get("user-agent")
        )
        
        if request.consent_marketing:
            await record_consent(
                user_id=user["id"],
                consent_type="marketing",
                granted=True,
                ip_address=req.client.host,
                user_agent=req.headers.get("user-agent")
            )
        
        await audit_log(
            req,
            action="registration_success",
            resource_type="auth",
            resource_id=user["id"],
            details={"clinic_id": clinic["id"], "email": request.email}
        )
        
        return {
            "success": True,
            "message": "Usuário registrado com sucesso. Verifique seu email para confirmar a conta.",
            "user_id": user["id"],
            "clinic_id": clinic["id"],
            "email_sent": True
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Registration error: {e}", exc_info=True)
        await audit_log(
            req,
            action="registration_error",
            resource_type="auth",
            details={"email": request.email, "error": str(e)}
        )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro interno do servidor"
        )

@router.post("/refresh", response_model=LoginResponse, summary="Refresh do token")
async def refresh_token(
    request: RefreshTokenRequest,
    req: Request,
) -> LoginResponse:
    """
    Renovação do token de acesso usando refresh token
    """
    try:
        # Validar e renovar token
        refresh_result = await supabase_client.auth.refresh_session(request.refresh_token)
        
        if not refresh_result.get("session"):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Refresh token inválido"
            )
        
        session = refresh_result["session"]
        user = refresh_result["user"]
        
        # Buscar permissões atualizadas
        permissions = await get_user_permissions(user["id"])
        
        await audit_log(
            req,
            action="token_refresh",
            resource_type="auth",
            resource_id=user["id"]
        )
        
        return LoginResponse(
            access_token=session["access_token"],
            refresh_token=session["refresh_token"],
            token_type="bearer",
            expires_in=session["expires_in"],
            user={
                "id": user["id"],
                "email": user["email"],
                "full_name": user.get("user_metadata", {}).get("full_name"),
                "avatar_url": user.get("user_metadata", {}).get("avatar_url"),
                "role": user.get("app_metadata", {}).get("role", "user"),
            },
            permissions=permissions
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Token refresh error: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro interno do servidor"
        )

@router.post("/logout", summary="Logout do usuário")
async def logout(
    request: LogoutRequest,
    req: Request,
    response: Response,
    current_user: Dict[str, Any] = Depends(get_current_active_user),
) -> Dict[str, Any]:
    """
    Logout do usuário com invalidação de sessões
    """
    try:
        session_manager = SessionManager()
        
        if request.everywhere:
            # Logout de todos os dispositivos
            await session_manager.invalidate_all_sessions(current_user["id"])
        else:
            # Logout apenas da sessão atual
            token = req.headers.get("authorization", "").replace("Bearer ", "")
            await session_manager.invalidate_session(token)
        
        # Remover cookies
        response.delete_cookie("refresh_token")
        
        # Log de acesso LGPD
        await log_access_event(
            user_id=current_user["id"],
            event_type="logout",
            ip_address=req.client.host,
            user_agent=req.headers.get("user-agent")
        )
        
        await audit_log(
            req,
            action="logout",
            resource_type="auth",
            resource_id=current_user["id"],
            details={"everywhere": request.everywhere}
        )
        
        return {
            "success": True,
            "message": "Logout realizado com sucesso"
        }
        
    except Exception as e:
        logger.error(f"Logout error: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro interno do servidor"
        )

@router.get("/me", response_model=Dict[str, Any], summary="Dados do usuário atual")
async def get_current_user_data(
    req: Request,
    current_user: Dict[str, Any] = Depends(get_current_active_user),
) -> Dict[str, Any]:
    """
    Retorna dados do usuário logado
    """
    try:
        # Buscar dados completos do usuário
        async with get_db_connection() as db:
            user_profile = await db.userProfile.find_unique(
                where={"user_id": current_user["id"]},
                include={
                    "clinic": True,
                    "permissions": True,
                    "sessions": {
                        "where": {"is_active": True},
                        "orderBy": {"last_activity": "desc"}
                    }
                }
            )
        
        # Buscar status de consentimentos LGPD
        consent_status = await get_consent_status(current_user["id"])
        
        await audit_log(
            req,
            action="profile_access",
            resource_type="user",
            resource_id=current_user["id"]
        )
        
        return {
            "user": current_user,
            "profile": user_profile,
            "consent_status": consent_status,
            "active_sessions": len(user_profile.get("sessions", [])) if user_profile else 0
        }
        
    except Exception as e:
        logger.error(f"Get user data error: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro interno do servidor"
        )

# Utility functions
async def get_user_permissions(user_id: str, clinic_id: Optional[str] = None) -> list[str]:
    """Buscar permissões do usuário"""
    try:
        async with get_db_connection() as db:
            user_profile = await db.userProfile.find_unique(
                where={"user_id": user_id},
                include={"permissions": True, "roles": True}
            )
            
            if not user_profile:
                return ["user"]
            
            permissions = []
            
            # Permissões diretas
            if user_profile.get("permissions"):
                permissions.extend([p["permission"] for p in user_profile["permissions"]])
            
            # Permissões de roles
            if user_profile.get("roles"):
                for role in user_profile["roles"]:
                    if role.get("clinic_id") == clinic_id or not clinic_id:
                        permissions.extend(role.get("permissions", []))
            
            return list(set(permissions))
            
    except Exception as e:
        logger.error(f"Get permissions error: {e}", exc_info=True)
        return ["user"]