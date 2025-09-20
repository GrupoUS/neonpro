#!/bin/bash

# Setup Python Virtual Environment for ottomator-agents
# This script sets up the Python environment for the AI agent backend

set -e  # Exit on any error

# Configuration
VENV_DIR="venv"
PYTHON_VERSION="3.11"
REQUIREMENTS_FILE="requirements.txt"

echo "🐍 Setting up Python virtual environment for ottomator-agents..."

# Check if Python 3.11+ is available
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.11+ first."
    exit 1
fi

PYTHON_CMD=$(command -v python3)
PYTHON_ACTUAL_VERSION=$($PYTHON_CMD --version 2>&1 | cut -d' ' -f2)

echo "📋 Found Python version: $PYTHON_ACTUAL_VERSION"

# Check Python version
if ! $PYTHON_CMD -c "import sys; exit(0 if sys.version_info >= (3, 11) else 1)"; then
    echo "❌ Python 3.11+ is required. Current version: $PYTHON_ACTUAL_VERSION"
    exit 1
fi

# Create virtual environment if it doesn't exist
if [ ! -d "$VENV_DIR" ]; then
    echo "📦 Creating virtual environment..."
    $PYTHON_CMD -m venv $VENV_DIR
else
    echo "✅ Virtual environment already exists"
fi

# Activate virtual environment
echo "🔧 Activating virtual environment..."
source $VENV_DIR/bin/activate

# Upgrade pip
echo "⬆️  Upgrading pip..."
pip install --upgrade pip

# Install requirements
if [ -f "$REQUIREMENTS_FILE" ]; then
    echo "📋 Installing Python dependencies from $REQUIREMENTS_FILE..."
    pip install -r $REQUIREMENTS_FILE
else
    echo "❌ Requirements file not found: $REQUIREMENTS_FILE"
    exit 1
fi

# Install additional healthcare-specific dependencies
echo "🏥 Installing healthcare-specific dependencies..."
pip install --upgrade \
    python-jose[cryptography] \
    passlib[bcrypt] \
    python-multipart \
    aiofiles \
    pytest \
    pytest-asyncio

# Verify installation
echo "✅ Verifying installation..."
python -c "
import sys
print(f'Python version: {sys.version}')

try:
    import openai
    print('✅ OpenAI library installed')
except ImportError:
    print('❌ OpenAI library not found')

try:
    import fastapi
    print('✅ FastAPI library installed')
except ImportError:
    print('❌ FastAPI library not found')

try:
    import supabase
    print('✅ Supabase library installed')
except ImportError:
    print('❌ Supabase library not found')

try:
    import langchain
    print('✅ LangChain library installed')
except ImportError:
    print('❌ LangChain library not found')
"

# Create activation script for easy use
cat > activate.sh << 'EOF'
#!/bin/bash
# Activate the ottomator-agents Python virtual environment
source venv/bin/activate
echo "🐍 Python virtual environment activated"
echo "📍 Location: $(pwd)/venv"
echo "🏥 NeonPro ottomator-agents environment ready"
EOF

chmod +x activate.sh

echo ""
echo "🎉 Python virtual environment setup complete!"
echo ""
echo "📝 To activate the environment:"
echo "   cd $(pwd)"
echo "   source venv/bin/activate"
echo ""
echo "💡 Or use the convenience script:"
echo "   ./activate.sh"
echo ""
echo "🔍 To verify the setup:"
echo "   python --version"
echo "   pip list"
echo ""
echo "🏥 Healthcare AI Agent environment is ready!"