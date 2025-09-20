#!/bin/bash

# NeonPro Python Environment Setup Script
# Sets up Python virtual environment for AG-UI RAG Agent

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" &> /dev/null && pwd)"
AGENT_DIR="$SCRIPT_DIR/ag-ui-rag-agent"
VENV_DIR="$AGENT_DIR/venv"
REQUIREMENTS_FILE="$AGENT_DIR/requirements.txt"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log() {
    echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')] $1${NC}"
}

warn() {
    echo -e "${YELLOW}[$(date '+%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}"
}

error() {
    echo -e "${RED}[$(date '+%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}"
}

# Check Python version
check_python() {
    log "Checking Python installation..."
    
    if ! command -v python3 &> /dev/null; then
        error "Python 3 is not installed"
        echo "Please install Python 3.8+ using your system package manager:"
        echo "  Ubuntu/Debian: sudo apt update && sudo apt install python3 python3-pip python3-venv"
        echo "  CentOS/RHEL: sudo yum install python3 python3-pip"
        echo "  macOS: brew install python3"
        exit 1
    fi
    
    local python_version=$(python3 --version 2>&1 | awk '{print $2}')
    log "Found Python $python_version"
    
    # Check if version is 3.8+
    local major=$(echo $python_version | cut -d. -f1)
    local minor=$(echo $python_version | cut -d. -f2)
    
    if [[ $major -lt 3 ]] || [[ $major -eq 3 && $minor -lt 8 ]]; then
        error "Python 3.8+ is required, found $python_version"
        exit 1
    fi
}

# Check if venv module is available
check_venv() {
    log "Checking Python venv module..."
    
    if ! python3 -m venv --help &> /dev/null; then
        error "Python venv module is not available"
        echo "Please install the python3-venv package:"
        echo "  Ubuntu/Debian: sudo apt install python3.12-venv"
        echo "  CentOS/RHEL: sudo yum install python3-venv"
        echo "  macOS: Usually included with Python 3"
        echo ""
        echo "Alternative: Use virtualenv instead of venv:"
        echo "  pip3 install --user virtualenv"
        echo "  Then run: virtualenv $VENV_DIR"
        exit 1
    fi
}

# Create virtual environment
create_venv() {
    log "Creating Python virtual environment at $VENV_DIR..."
    
    if [[ -d "$VENV_DIR" ]]; then
        warn "Virtual environment already exists at $VENV_DIR"
        read -p "Remove and recreate? (y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            rm -rf "$VENV_DIR"
        else
            log "Using existing virtual environment"
            return 0
        fi
    fi
    
    python3 -m venv "$VENV_DIR"
    log "Virtual environment created successfully"
}

# Install requirements
install_requirements() {
    log "Installing Python dependencies..."
    
    if [[ ! -f "$REQUIREMENTS_FILE" ]]; then
        error "Requirements file not found at $REQUIREMENTS_FILE"
        exit 1
    fi
    
    # Activate virtual environment
    source "$VENV_DIR/bin/activate"
    
    # Upgrade pip
    pip install --upgrade pip
    
    # Install requirements
    pip install -r "$REQUIREMENTS_FILE"
    
    log "Dependencies installed successfully"
}

# Create activation script
create_activation_script() {
    local activate_script="$AGENT_DIR/activate.sh"
    
    log "Creating activation script at $activate_script..."
    
    cat > "$activate_script" << 'EOF'
#!/bin/bash

# NeonPro AG-UI RAG Agent Environment Activation Script

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" &> /dev/null && pwd)"
VENV_DIR="$SCRIPT_DIR/venv"

if [[ ! -d "$VENV_DIR" ]]; then
    echo "Error: Virtual environment not found at $VENV_DIR"
    echo "Please run setup-python-env.sh first"
    exit 1
fi

echo "Activating NeonPro AG-UI RAG Agent environment..."
source "$VENV_DIR/bin/activate"

# Set environment variables
export PYTHONPATH="$SCRIPT_DIR:$PYTHONPATH"
export AGENT_ENV="activated"

echo "Environment activated. Python path: $(which python)"
echo "To deactivate, run: deactivate"

# Change to agent directory
cd "$SCRIPT_DIR"

# Show help
echo ""
echo "Available commands:"
echo "  python main.py        - Start the AG-UI RAG agent"
echo "  python -m pytest      - Run tests (if available)"
echo "  pip list              - Show installed packages"
echo "  deactivate            - Exit the virtual environment"
EOF

    chmod +x "$activate_script"
    log "Activation script created"
}

# Create development scripts
create_dev_scripts() {
    log "Creating development scripts..."
    
    # Start script
    cat > "$AGENT_DIR/start.sh" << 'EOF'
#!/bin/bash

# Start NeonPro AG-UI RAG Agent

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" &> /dev/null && pwd)"

# Check if virtual environment exists
if [[ ! -d "$SCRIPT_DIR/venv" ]]; then
    echo "Error: Virtual environment not found"
    echo "Please run ../setup-python-env.sh first"
    exit 1
fi

# Activate environment
source "$SCRIPT_DIR/venv/bin/activate"

# Set environment variables
if [[ -f "$SCRIPT_DIR/.env" ]]; then
    export $(cat "$SCRIPT_DIR/.env" | grep -v '^#' | xargs)
fi

echo "Starting NeonPro AG-UI RAG Agent..."
python main.py
EOF

    # Install script
    cat > "$AGENT_DIR/install-deps.sh" << 'EOF'
#!/bin/bash

# Install/Update Python dependencies

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" &> /dev/null && pwd)"

if [[ ! -d "$SCRIPT_DIR/venv" ]]; then
    echo "Error: Virtual environment not found"
    echo "Please run ../setup-python-env.sh first"
    exit 1
fi

source "$SCRIPT_DIR/venv/bin/activate"

echo "Updating pip..."
pip install --upgrade pip

echo "Installing/updating dependencies..."
pip install -r requirements.txt

echo "Dependencies updated successfully"
EOF

    # Make scripts executable
    chmod +x "$AGENT_DIR/start.sh"
    chmod +x "$AGENT_DIR/install-deps.sh"
    
    log "Development scripts created"
}

# Main setup function
main() {
    log "Starting NeonPro Python environment setup..."
    
    check_python
    check_venv
    create_venv
    install_requirements
    create_activation_script
    create_dev_scripts
    
    log "Python environment setup completed successfully!"
    echo ""
    echo "Next steps:"
    echo "1. cd $AGENT_DIR"
    echo "2. source activate.sh"
    echo "3. python main.py"
    echo ""
    echo "Or use the start script:"
    echo "  $AGENT_DIR/start.sh"
}

# Handle command line arguments
case "${1:-}" in
    "check")
        check_python
        check_venv
        log "System requirements check passed"
        ;;
    "clean")
        if [[ -d "$VENV_DIR" ]]; then
            log "Removing virtual environment at $VENV_DIR"
            rm -rf "$VENV_DIR"
            log "Clean completed"
        else
            log "No virtual environment found to clean"
        fi
        ;;
    "")
        main
        ;;
    *)
        echo "Usage: $0 [check|clean]"
        echo "  check - Check system requirements only"
        echo "  clean - Remove existing virtual environment"
        echo "  (no args) - Full setup"
        exit 1
        ;;
esac