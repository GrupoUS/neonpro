#!/bin/bash

# NeonPro Brand Assets Installation Script
# Installs PNG assets from user's local path to the correct web app location

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Script info
echo -e "${BLUE}🎨 ============================================${NC}"
echo -e "${BLUE}   NeonPro Brand Assets Installation${NC}"
echo -e "${BLUE}============================================${NC}"

# Check if source file is provided
if [ $# -eq 0 ]; then
    echo -e "${RED}❌ Erro: Caminho do arquivo PNG não fornecido${NC}"
    echo ""
    echo -e "${YELLOW}Uso:${NC}"
    echo "  $0 <caminho-para-simboloneonpro.png> [caminho-para-iconeneonpro.png]"
    echo ""
    echo -e "${YELLOW}Exemplo:${NC}"
    echo "  $0 \"C:\\Users\\Admin\\OneDrive\\GRUPOUS\\IA\\NEONPRO\\Imagens\\simboloneonpro.png\""
    echo ""
    exit 1
fi

SOURCE_LOGO="$1"
SOURCE_ICON="$2"

# Target directories
TARGET_DIR="apps/web/public/brand"
TARGET_LOGO="$TARGET_DIR/simboloneonpro.png"
TARGET_ICON="$TARGET_DIR/iconeneonpro.png"

# Create target directory if it doesn't exist
mkdir -p "$TARGET_DIR"

echo -e "${BLUE}📁 Diretório de destino: $TARGET_DIR${NC}"

# Function to install logo
install_logo() {
    local source="$1"
    local target="$2"
    local name="$3"
    
    echo -e "${YELLOW}📋 Instalando $name...${NC}"
    
    # Check if source file exists
    if [ ! -f "$source" ]; then
        echo -e "${RED}❌ Arquivo não encontrado: $source${NC}"
        return 1
    fi
    
    # Copy file
    cp "$source" "$target"
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ $name instalado com sucesso!${NC}"
        echo -e "${BLUE}   📍 Localização: $target${NC}"
        
        # Show file info
        if command -v file &> /dev/null; then
            file_info=$(file "$target")
            echo -e "${BLUE}   📊 Info: $file_info${NC}"
        fi
        
        # Show file size
        if command -v du &> /dev/null; then
            file_size=$(du -h "$target" | cut -f1)
            echo -e "${BLUE}   📏 Tamanho: $file_size${NC}"
        fi
        
        return 0
    else
        echo -e "${RED}❌ Erro ao copiar $name${NC}"
        return 1
    fi
}

# Install main logo
echo -e "${YELLOW}🎯 Instalando logo principal...${NC}"
if install_logo "$SOURCE_LOGO" "$TARGET_LOGO" "Logo Principal"; then
    LOGO_INSTALLED=true
else
    LOGO_INSTALLED=false
fi

# Install AI icon if provided
if [ -n "$SOURCE_ICON" ]; then
    echo ""
    echo -e "${YELLOW}🤖 Instalando ícone AI...${NC}"
    if install_logo "$SOURCE_ICON" "$TARGET_ICON" "Ícone AI"; then
        ICON_INSTALLED=true
    else
        ICON_INSTALLED=false
    fi
else
    echo -e "${YELLOW}ℹ️  Ícone AI não fornecido - usando fallback SVG${NC}"
    ICON_INSTALLED="skipped"
fi

# Summary
echo ""
echo -e "${BLUE}📊 ============================================${NC}"
echo -e "${BLUE}   RESUMO DA INSTALAÇÃO${NC}"
echo -e "${BLUE}============================================${NC}"

if [ "$LOGO_INSTALLED" = true ]; then
    echo -e "${GREEN}✅ Logo Principal: Instalado${NC}"
else
    echo -e "${RED}❌ Logo Principal: Falhou${NC}"
fi

if [ "$ICON_INSTALLED" = true ]; then
    echo -e "${GREEN}✅ Ícone AI: Instalado${NC}"
elif [ "$ICON_INSTALLED" = "skipped" ]; then
    echo -e "${YELLOW}⏭️  Ícone AI: Pulado (usando SVG)${NC}"
else
    echo -e "${RED}❌ Ícone AI: Falhou${NC}"
fi

# Next steps
echo ""
echo -e "${BLUE}🚀 PRÓXIMOS PASSOS:${NC}"
echo -e "${YELLOW}1.${NC} Reinicie o servidor de desenvolvimento:"
echo "   ${BLUE}bun run dev${NC}"
echo ""
echo -e "${YELLOW}2.${NC} Verifique os seguintes locais:"
echo "   • Página de login (logo principal)"
echo "   • Sidebar (logo pequeno)"
echo "   • Chat AI (ícone AI)"
echo ""
echo -e "${YELLOW}3.${NC} Se necessário, force refresh (Ctrl+F5)"

# Check if dev server is running
if pgrep -f "vite" > /dev/null; then
    echo ""
    echo -e "${GREEN}ℹ️  Servidor de desenvolvimento detectado - as mudanças devem aparecer automaticamente${NC}"
fi

echo ""
echo -e "${GREEN}🎉 Instalação concluída!${NC}"
