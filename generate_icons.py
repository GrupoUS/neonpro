#!/usr/bin/env python3
"""
Script para gerar todos os tamanhos de ícone necessários para o NeonPro
"""

import os
import sys
from pathlib import Path

# Tenta diferentes métodos de conversão
conversion_method = None

try:
    from PIL import Image
    import cairosvg
    conversion_method = "cairosvg"
    print("✅ Usando cairosvg + PIL para conversão")
except ImportError:
    try:
        from PIL import Image
        conversion_method = "pillow"
        print("⚠️ cairosvg não encontrado, usando apenas PIL")
    except ImportError:
        print("❌ PIL/Pillow não encontrado. Instalando...")
        os.system(f"{sys.executable} -m pip install Pillow cairosvg")
        
        try:
            from PIL import Image
            import cairosvg
            conversion_method = "cairosvg"
            print("✅ Dependências instaladas com sucesso!")
        except ImportError:
            print("❌ Erro ao instalar dependências")
            sys.exit(1)

# Tamanhos necessários para PWA
sizes = [72, 96, 128, 144, 152, 192, 384, 512]

# Caminhos
svg_path = Path("public/neonpro-icon.svg")
icons_dir = Path("public/icons")
public_dir = Path("public")

# Criar diretório de ícones se não existir
icons_dir.mkdir(exist_ok=True)

def svg_to_png(svg_path, png_path, size):
    """Converte SVG para PNG no tamanho especificado"""
    if conversion_method == "cairosvg":
        # Usa cairosvg para melhor qualidade
        cairosvg.svg2png(
            url=str(svg_path),
            write_to=str(png_path),
            output_width=size,
            output_height=size
        )
    else:
        print(f"⚠️ Conversão manual necessária para {png_path}")
        # Cria um placeholder
        img = Image.new('RGBA', (size, size), (10, 22, 40, 255))
        img.save(png_path)

def create_favicon():
    """Cria favicon.ico com múltiplos tamanhos"""
    try:
        # Carrega a imagem de 256x256 primeiro
        if not (public_dir / "icon-256x256.png").exists():
            svg_to_png(svg_path, public_dir / "icon-256x256.png", 256)
        
        img_256 = Image.open(public_dir / "icon-256x256.png")
        
        # Cria versões menores
        favicon_sizes = [(16, 16), (32, 32), (48, 48)]
        favicon_images = []
        
        for size in favicon_sizes:
            resized = img_256.resize(size, Image.Resampling.LANCZOS)
            favicon_images.append(resized)
        
        # Salva como favicon.ico
        favicon_images[0].save(
            public_dir / "favicon.ico",
            format="ICO",
            sizes=favicon_sizes,
            append_images=favicon_images[1:]
        )
        print("✅ favicon.ico criado com sucesso!")
    except Exception as e:
        print(f"❌ Erro ao criar favicon.ico: {e}")

# Gerar todos os tamanhos de ícone
print("\n🎨 Gerando ícones...")
for size in sizes:
    png_path = icons_dir / f"icon-{size}x{size}.png"
    print(f"  Gerando {size}x{size}...")
    svg_to_png(svg_path, png_path, size)

# Copiar icon-192x192.png para a raiz do public
print("\n📋 Copiando ícone principal...")
svg_to_png(svg_path, public_dir / "icon-192x192.png", 192)

# Criar favicon.ico
print("\n🔧 Criando favicon.ico...")
create_favicon()

# Atualizar logos placeholder
print("\n🔄 Atualizando logos placeholder...")
svg_to_png(svg_path, public_dir / "placeholder-logo.png", 512)

print("\n✅ Todos os ícones foram gerados com sucesso!")
print("\n📝 Próximos passos:")
print("1. Verificar se os ícones foram gerados corretamente")
print("2. Atualizar o layout.tsx para incluir o favicon")
print("3. Testar a aplicação PWA")