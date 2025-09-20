"""
TLS 1.3 Configuration for AG-UI Protocol
Healthcare-compliant secure communication configuration
"""

import os
import ssl
from typing import Dict, Any, Optional
from pathlib import Path

class TLSConfig:
    """TLS 1.3 configuration for AG-UI Protocol security"""
    
    # TLS 1.3 mandatory configuration
    MIN_VERSION = ssl.TLSVersion.TLSv1_3
    MAX_VERSION = ssl.TLSVersion.TLSv1_3
    
    # Healthcare-compliant cipher suites with Perfect Forward Secrecy
    CIPHER_SUITES = [
        'TLS_AES_256_GCM_SHA384',
        'TLS_CHACHA20_POLY1305_SHA256', 
        'TLS_AES_128_GCM_SHA256'
    ]
    
    # Elliptic curves for ECDHE key exchange
    ECDH_CURVES = ['prime256v1', 'secp384r1', 'secp521r1']
    
    # Certificate paths
    CERT_PATH = os.getenv("AGENT_SSL_CERT_PATH", "certs/server.crt")
    KEY_PATH = os.getenv("AGENT_SSL_KEY_PATH", "certs/server.key")
    CA_PATH = os.getenv("AGENT_SSL_CA_PATH", "certs/ca.crt")
    
    # Security settings
    REQUIRE_CLIENT_CERT = os.getenv("AGENT_REQUIRE_CLIENT_CERT", "false").lower() == "true"
    
    @classmethod
    def get_ssl_context(cls) -> ssl.SSLContext:
        """Create SSL context with TLS 1.3 configuration"""
        
        context = ssl.create_default_context(ssl.Purpose.CLIENT_AUTH)
        
        # Enforce TLS 1.3 only
        context.minimum_version = cls.MIN_VERSION
        context.maximum_version = cls.MAX_VERSION
        
        # Set cipher suites
        context.set_ciphers(':'.join(cls.CIPHER_SUITES))
        
        # Enable Perfect Forward Secrecy
        context.options |= ssl.OP_NO_COMPRESSION
        context.options |= ssl.OP_CIPHER_SERVER_PREFERENCE
        
        # Set elliptic curves
        context.set_ecdh_curves(cls.ECDH_CURVES)
        
        # Load certificates
        cls._load_certificates(context)
        
        # Client certificate validation (mutual TLS)
        if cls.REQUIRE_CLIENT_CERT:
            context.verify_mode = ssl.CERT_REQUIRED
            context.load_verify_locations(cafile=cls.CA_PATH)
        else:
            context.verify_mode = ssl.CERT_NONE
        
        return context
    
    @classmethod
    def _load_certificates(cls, context: ssl.SSLContext) -> None:
        """Load SSL certificates"""
        
        cert_path = Path(cls.CERT_PATH)
        key_path = Path(cls.KEY_PATH)
        
        if not cert_path.exists():
            raise FileNotFoundError(f"SSL certificate not found: {cls.CERT_PATH}")
        
        if not key_path.exists():
            raise FileNotFoundError(f"SSL private key not found: {cls.KEY_PATH}")
        
        try:
            context.load_cert_chain(
                certfile=cls.CERT_PATH,
                keyfile=cls.KEY_PATH
            )
        except ssl.SSLError as e:
            raise RuntimeError(f"Failed to load SSL certificates: {e}")
        
        # Load CA certificate if available
        ca_path = Path(cls.CA_PATH)
        if ca_path.exists():
            try:
                context.load_verify_locations(cafile=cls.CA_PATH)
            except ssl.SSLError as e:
                raise RuntimeError(f"Failed to load CA certificate: {e}")
    
    @classmethod
    def get_uvicorn_ssl_config(cls) -> Dict[str, Any]:
        """Get SSL configuration for uvicorn"""
        
        return {
            "ssl_version": cls.MIN_VERSION,
            "certfile": cls.CERT_PATH,
            "keyfile": cls.KEY_PATH,
            "ca_certs": cls.CA_PATH if Path(cls.CA_PATH).exists() else None,
            "ssl_ciphers": ':'.join(cls.CIPHER_SUITES),
        }
    
    @classmethod
    def validate_configuration(cls) -> bool:
        """Validate TLS configuration"""
        
        # Check certificate files
        cert_path = Path(cls.CERT_PATH)
        key_path = Path(cls.KEY_PATH)
        
        if not cert_path.exists():
            raise FileNotFoundError(f"SSL certificate not found: {cls.CERT_PATH}")
        
        if not key_path.exists():
            raise FileNotFoundError(f"SSL private key not found: {cls.KEY_PATH}")
        
        # Validate certificate chain
        try:
            context = cls.get_ssl_context()
            
            # Test certificate loading
            test_cert = context.load_cert_chain(cls.CERT_PATH, cls.KEY_PATH)
            
        except Exception as e:
            raise RuntimeError(f"TLS configuration validation failed: {e}")
        
        return True
    
    @classmethod
    def get_security_headers(cls) -> Dict[str, str]:
        """Get security headers for HTTPS responses"""
        
        return {
            # HSTS with 2 years max-age, include subdomains, and preload
            'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
            
            # Prevent MIME type sniffing
            'X-Content-Type-Options': 'nosniff',
            
            # Prevent clickjacking
            'X-Frame-Options': 'DENY',
            
            # XSS protection
            'X-XSS-Protection': '1; mode=block',
            
            # Referrer policy
            'Referrer-Policy': 'strict-origin-when-cross-origin',
            
            # Permission policy for healthcare applications
            'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=()',
            
            # Healthcare compliance headers
            'X-LGPD-Compliant': 'true',
            'X-Healthcare-Security': 'TLSv1.3',
            'X-Agent-Security': 'encrypted',
        }
    
    @classmethod
    def get_middleware_config(cls) -> Dict[str, Any]:
        """Get middleware configuration for security"""
        
        return {
            "cors_origins": [
                "https://localhost:3000",
                "https://127.0.0.1:3000", 
                "https://neonpro.com",
                "https://api.neonpro.com"
            ],
            "cors_allow_credentials": True,
            "cors_allow_methods": ["GET", "POST", "OPTIONS"],
            "cors_allow_headers": ["Content-Type", "Authorization", "X-Request-ID"],
            
            # Security headers middleware
            "security_headers": cls.get_security_headers(),
            
            # Rate limiting
            "rate_limit_requests": 100,
            "rate_limit_window": 60,  # seconds
            
            # Request timeout
            "request_timeout": 30,  # seconds
        }

def create_tls_context() -> ssl.SSLContext:
    """Factory function to create TLS context"""
    return TLSConfig.get_ssl_context()

def get_tls_config() -> Dict[str, Any]:
    """Factory function to get TLS configuration"""
    return TLSConfig.get_uvicorn_ssl_config()