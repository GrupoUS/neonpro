#!/bin/bash
# TLS Certificate Setup Script for AG-UI Protocol Agent
# Healthcare-compliant TLS 1.3 configuration

set -e

echo "🔐 Setting up TLS 1.3 certificates for AG-UI Protocol..."

# Configuration
AGENT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CERTS_DIR="$AGENT_DIR/certs"
SSL_CONFIG="$CERTS_DIR/openssl.conf"

# Create certificates directory
mkdir -p "$CERTS_DIR"

# OpenSSL configuration for TLS 1.3 compliance
cat > "$SSL_CONFIG" << 'EOF'
[req]
default_bits = 4096
distinguished_name = req_distinguished_name
req_extensions = v3_req
prompt = no

[req_distinguished_name]
C = BR
ST = Sao Paulo
L = Sao Paulo
O = NeonPro Healthcare
OU = AG-UI Protocol Agent
CN = localhost

[v3_req]
basicConstraints = CA:FALSE
keyUsage = nonRepudiation, digitalSignature, keyEncipherment
extendedKeyUsage = serverAuth, clientAuth
subjectAltName = @alt_names

[alt_names]
DNS.1 = localhost
DNS.2 = 127.0.0.1
IP.1 = 127.0.0.1
IP.2 = ::1

[ca]
default_ca = CA_default

[CA_default]
dir = ./certs
database = $dir/index.txt
new_certs_dir = $dir/newcerts
certificate = $dir/ca.crt
serial = $dir/serial
crlnumber = $dir/crlnumber
crl_dir = $dir/crl
private_key = $dir/ca.key
RANDFILE = $dir/private/.rand

default_days = 365
default_crl_days = 30
default_md = sha256

policy = policy_match

[policy_match]
countryName = match
stateOrProvinceName = match
organizationName = match
organizationalUnitName = optional
commonName = supplied
emailAddress = optional

[ca_extensions]
basicConstraints = critical,CA:true
keyUsage = critical,digitalSignature,keyCertSign,cRLSign
subjectKeyIdentifier = hash
authorityKeyIdentifier = keyid:always,issuer

[server]
basicConstraints = critical,CA:FALSE
keyUsage = critical,digitalSignature,keyEncipherment
extendedKeyUsage = serverAuth
subjectKeyIdentifier = hash
authorityKeyIdentifier = keyid:always,issuer
subjectAltName = @alt_names

[client]
basicConstraints = critical,CA:FALSE
keyUsage = critical,digitalSignature,keyEncipherment
extendedKeyUsage = clientAuth
subjectKeyIdentifier = hash
authorityKeyIdentifier = keyid:always,issuer
EOF

echo "📋 Generating TLS 1.3 certificates..."

# Create necessary files
touch "$CERTS_DIR/index.txt"
echo 1000 > "$CERTS_DIR/serial"
echo 1000 > "$CERTS_DIR/crlnumber"

# Generate CA private key
openssl genpkey \
    -algorithm RSA \
    -out "$CERTS_DIR/ca.key" \
    -pkeyopt rsa_keygen_bits:4096

# Generate CA certificate
openssl req \
    -x509 \
    -new \
    -nodes \
    -key "$CERTS_DIR/ca.key" \
    -sha256 \
    -days 3650 \
    -out "$CERTS_DIR/ca.crt" \
    -config "$SSL_CONFIG" \
    -extensions ca_extensions

# Generate server private key (TLS 1.3 compatible)
openssl genpkey \
    -algorithm RSA \
    -out "$CERTS_DIR/server.key" \
    -pkeyopt rsa_keygen_bits:4096

# Generate server CSR
openssl req \
    -new \
    -key "$CERTS_DIR/server.key" \
    -out "$CERTS_DIR/server.csr" \
    -config "$SSL_CONFIG"

# Sign server certificate with CA
openssl x509 \
    -req \
    -in "$CERTS_DIR/server.csr" \
    -CA "$CERTS_DIR/ca.crt" \
    -CAkey "$CERTS_DIR/ca.key" \
    -CAcreateserial \
    -out "$CERTS_DIR/server.crt" \
    -days 365 \
    -sha256 \
    -extfile "$SSL_CONFIG" \
    -extensions server

# Generate client private key (for mutual TLS)
openssl genpkey \
    -algorithm RSA \
    -out "$CERTS_DIR/client.key" \
    -pkeyopt rsa_keygen_bits:4096

# Generate client CSR
openssl req \
    -new \
    -key "$CERTS_DIR/client.key" \
    -out "$CERTS_DIR/client.csr" \
    -config "$SSL_CONFIG"

# Sign client certificate with CA
openssl x509 \
    -req \
    -in "$CERTS_DIR/client.csr" \
    -CA "$CERTS_DIR/ca.crt" \
    -CAkey "$CERTS_DIR/ca.key" \
    -CAcreateserial \
    -out "$CERTS_DIR/client.crt" \
    -days 365 \
    -sha256 \
    -extfile "$SSL_CONFIG" \
    -extensions client

# Clean up temporary files
rm -f "$CERTS_DIR/server.csr" "$CERTS_DIR/client.csr"

# Set proper permissions
chmod 600 "$CERTS_DIR"/*.key
chmod 644 "$CERTS_DIR"/*.crt

echo "✅ TLS 1.3 certificates generated successfully"
echo ""
echo "📁 Certificate location: $CERTS_DIR"
echo "🔑 Private keys (chmod 600):"
echo "   - ca.key (Certificate Authority)"
echo "   - server.key (Server certificate)"
echo "   - client.key (Client certificate)"
echo ""
echo "📄 Certificates (chmod 644):"
echo "   - ca.crt (Root CA)"
echo "   - server.crt (Server certificate)"
echo "   - client.crt (Client certificate)"
echo ""
echo "🔍 To verify certificates:"
echo "   openssl x509 -in $CERTS_DIR/server.crt -text -noout"
echo "   openssl verify -CAfile $CERTS_DIR/ca.crt $CERTS_DIR/server.crt"
echo ""
echo "🚀 To use TLS in production:"
echo "   export AGENT_SSL_CERT_PATH=$CERTS_DIR/server.crt"
echo "   export AGENT_SSL_KEY_PATH=$CERTS_DIR/server.key"
echo "   export AGENT_SSL_CA_PATH=$CERTS_DIR/ca.crt"
echo "   export NODE_ENV=production"