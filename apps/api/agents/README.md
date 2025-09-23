# NeonPro AG-UI RAG Agent Setup

This directory contains the Python-based AG-UI RAG agent for NeonPro's healthcare conversational AI system.

## Prerequisites

### System Requirements

- **Python 3.8+** (Python 3.11+ recommended)
- **python3-venv** package (for virtual environments)
- **pip** (Python package installer)
- **Node.js 18+** (for the main API server)

### Installing Python and Dependencies

#### Ubuntu/Debian

```bash
sudo apt update
sudo apt install python3 python3-pip python3-venv
```

#### CentOS/RHEL/Fedora

```bash
# CentOS/RHEL
sudo yum install python3 python3-pip python3-venv

# Fedora
sudo dnf install python3 python3-pip python3-venv
```

#### macOS

```bash
# Using Homebrew
brew install python3

# Or using MacPorts
sudo port install python311
```

#### Windows (WSL2)

```bash
# In WSL2 Ubuntu
sudo apt update
sudo apt install python3 python3-pip python3-venv
```

## Quick Setup

### Automated Setup

```bash
# Run the automated setup script
./setup-python-env.sh

# Or check requirements first
./setup-python-env.sh check
```

### Manual Setup

```bash
# 1. Create virtual environment
cd ag-ui-rag-agent
python3 -m venv venv

# 2. Activate virtual environment
source venv/bin/activate

# 3. Upgrade pip
pip install --upgrade pip

# 4. Install dependencies
pip install -r requirements.txt

# 5. Copy environment configuration
cp .env.example .env
# Edit .env with your configuration
```

## Configuration

### Environment Variables

Copy the environment template and configure:

```bash
cd ag-ui-rag-agent
cp .env.example .env
```

**Required Variables:**

- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_SERVICE_KEY` - Supabase service role key
- `OPENAI_API_KEY` - OpenAI API key for the LLM

**Optional Variables:**

- `AGENT_HOST` - Host to bind to (default: 127.0.0.1)
- `AGENT_PORT` - Port to listen on (default: 8000)
- `ANTHROPIC_API_KEY` - Anthropic Claude API key (if using Claude)

### Healthcare Compliance Settings

The agent includes healthcare compliance features:

- **LGPD Compliance**: `LGPD_COMPLIANCE=true`
- **Audit Logging**: `AUDIT_LOGGING=true`
- **CFM Certification**: `CFM_CERTIFIED=true`
- **ANVISA Approval**: `ANVISA_APPROVED=true`

## Running the Agent

### Using the Start Script

```bash
# Navigate to agent directory
cd ag-ui-rag-agent

# Start the agent
./start.sh
```

### Manual Activation

```bash
# Activate environment
source activate.sh

# Start the agent
python main.py
```

### Development Mode

```bash
# Activate environment
source venv/bin/activate

# Start with hot reloading (if using uvicorn)
uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

## Development

### Project Structure

```
ag-ui-rag-agent/
├── main.py              # Main application entry point
├── agent_config.py      # Configuration management
├── requirements.txt     # Python dependencies
├── .env.example        # Environment template
├── .env               # Your environment config (create from .env.example)
├── venv/              # Virtual environment (created by setup)
├── activate.sh        # Environment activation script
├── start.sh           # Agent start script
└── install-deps.sh    # Dependency installation script
```

### Installing New Dependencies

```bash
# Activate environment
source venv/bin/activate

# Install new package
pip install package-name

# Update requirements.txt
pip freeze > requirements.txt
```

### Testing

```bash
# Activate environment
source venv/bin/activate

# Run tests (if available)
python -m pytest

# Test agent health
curl http://127.0.0.1:8000/health
```

## Integration with NeonPro API

The AG-UI RAG agent integrates with the main NeonPro API through:

1. **AG-UI Protocol** - Event-based communication
2. **HTTP Endpoints** - RESTful API for agent queries
3. **WebSocket** - Real-time bidirectional communication

### API Endpoints

- `GET /health` - Health check
- `POST /agui` - AG-UI protocol endpoint
- `GET /status` - Agent status and metrics

### Connection to Frontend

The frontend connects through the main API server:

```typescript
// Frontend (React with CopilotKit)
import { HttpAgent } from '@ag-ui/client';

const agent = new HttpAgent({
  url: 'http://127.0.0.1:3004/api/ai/data-agent',
});
```

## Troubleshooting

### Common Issues

#### 1. Virtual Environment Creation Failed

```
Error: ensurepip is not available
```

**Solution:** Install python3-venv package

```bash
# Ubuntu/Debian
sudo apt install python3.12-venv

# Or use virtualenv as alternative
pip3 install --user virtualenv
virtualenv ag-ui-rag-agent/venv
```

#### 2. Permission Denied

```
Error: Permission denied
```

**Solution:** Make scripts executable

```bash
chmod +x setup-python-env.sh
chmod +x ag-ui-rag-agent/start.sh
```

#### 3. Port Already in Use

```
Error: Address already in use
```

**Solution:** Change port in `.env` file

```bash
AGENT_PORT=8001
```

#### 4. Import Errors

```
ModuleNotFoundError: No module named 'package'
```

**Solution:** Ensure virtual environment is activated and dependencies installed

```bash
source ag-ui-rag-agent/venv/bin/activate
pip install -r ag-ui-rag-agent/requirements.txt
```

### System Information

Check your system configuration:

```bash
# Python version
python3 --version

# Pip version
pip3 --version

# Available packages
pip list

# Virtual environment status
echo $VIRTUAL_ENV
```

## Healthcare Compliance

This agent is designed for healthcare applications and includes:

- **Data Encryption**: All data transmissions are encrypted
- **Audit Logging**: All queries and responses are logged
- **Access Control**: Role-based permissions for data access
- **LGPD Compliance**: Brazilian data protection compliance
- **CFM Standards**: Brazilian medical council compliance
- **ANVISA Approval**: Health surveillance agency standards

## Support

For setup issues or questions:

1. Check this README for common solutions
2. Review the main project documentation
3. Check the agent logs for specific errors
4. Ensure all prerequisites are properly installed

## License

This project is proprietary to NeonPro Healthcare Platform.
