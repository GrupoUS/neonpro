# NeonPro AI Agent Service

Serviço de agente de IA para integração com dados de saúde, utilizando protocolo AG-UI e ottomator-agents.

## Funcionalidades

- Busca de pacientes por nome
- Consulta de agendamentos
- Acesso a dados financeiros
- Interface WebSocket em tempo real
- Suporte a LGPD (Lei Geral de Proteção de Dados)
- Integração com Supabase

## Tecnologias Utilizadas

- **FastAPI**: Framework web assíncrono
- **LangChain**: Framework para aplicações de IA
- **OpenAI/Anthropic**: Modelos de linguagem
- **Supabase**: Banco de dados PostgreSQL
- **WebSocket**: Comunicação em tempo real

## Configuração

1. Copie o arquivo de variáveis de ambiente:

   ```bash
   cp .env.example .env
   ```

2. Preencha as variáveis de ambiente necessárias:
   - `SUPABASE_URL`: URL do seu projeto Supabase
   - `SUPABASE_SERVICE_ROLE_KEY`: Chave de serviço do Supabase
   - `OPENAI_API_KEY`: Chave da API da OpenAI
   - `ANTHROPIC_API_KEY`: Chave da API da Anthropic
   - `JWT_SECRET`: Segredo para JWT

## Instalação

1. Instale as dependências:

   ```bash
   pip install -r requirements.txt
   ```

2. Execute o serviço:
   ```bash
   python main.py
   ```

Ou utilize Docker:

```bash
docker-compose up --build
```

## Endpoints da API

### WebSocket

- `ws://localhost:8001/ws/agent` - Endpoint principal do AG-UI

### REST API

- `GET /health` - Verificação de saúde
- `POST /api/agent/query` - Processar queries
- `GET /api/agent/capabilities` - Obter capacidades do agente

## Mensagens do AG-UI Protocol

### Query Message

```json
{
  "type": "query",
  "query": "Buscar pacientes com nome João Silva",
  "context": {
    "user_id": "user-123",
    "clinic_id": "clinic-456"
  }
}
```

### Data Response

```json
{
  "type": "data_response",
  "data_type": "clients",
  "data": [...],
  "count": 5,
  "timestamp": "2024-01-01T00:00:00Z"
}
```

## Estrutura do Projeto

```
services/ai-agent/
├── main.py              # Entry point da aplicação
├── config.py            # Configurações
├── requirements.txt    # Dependências Python
├── docker-compose.yml   # Configuração Docker
├── Dockerfile          # Imagem Docker
├── services/           # Serviços da aplicação
│   ├── agent_service.py    # Lógica do agente de IA
│   ├── database_service.py # Acesso ao banco de dados
│   └── websocket_manager.py # Gerenciador de WebSocket
└── tests/              # Testes (a ser implementado)
```

## Desenvolvimento

Para executar em modo de desenvolvimento:

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8001
```

## Testes

Execute os testes com:

```bash
pytest
```

## LGPD e Compliance

O serviço implementa:

- Validação de consentimento LGPD
- Log de auditoria para acesso a dados
- Criptografia de dados em trânsito
- Políticas de retenção de dados

## Licença

Este projeto é parte do NeonPro Healthcare Platform.
