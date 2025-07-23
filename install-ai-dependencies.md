# Epic 4 - AI Dependencies Installation Guide

## 📦 Required Dependencies

### Core AI Libraries
```bash
pnpm add openai@^4.52.0
pnpm add @pinecone-database/pinecone@^2.2.2
pnpm add zod@^3.23.8
```

### Optional Enhanced Features (Phase 2)
```bash
pnpm add langchain@^0.2.0
pnpm add tiktoken@^1.0.0
pnpm add @anthropic-ai/sdk@^0.24.0
pnpm add cohere-ai@^7.10.0
```

## 🔧 Environment Variables Setup

Add to your `.env.local`:

```env
# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-4
OPENAI_MAX_TOKENS=4000

# Vector Database (Optional - for enhanced semantic search)
PINECONE_API_KEY=your_pinecone_key_here
PINECONE_ENVIRONMENT=your_pinecone_env_here
PINECONE_INDEX_NAME=neonpro-embeddings

# AI Feature Flags
ENABLE_AI_CHAT=true
ENABLE_PREDICTIVE_ANALYTICS=false
ENABLE_CROSS_FUNCTIONAL_SUGGESTIONS=false
ENABLE_PROCESS_AUTOMATION=false
```

## 🚀 Installation Commands

```bash
# Navigate to NeonPro directory
cd neonpro

# Install core AI dependencies
pnpm add openai zod

# Install optional vector database support
pnpm add @pinecone-database/pinecone

# Verify installation
pnpm build
```

## ✅ Post-Installation Steps

1. **Update AI Chat Engine**: Replace mock OpenAI implementation in `app/lib/ai/chat-engine.ts`
2. **Test API Endpoint**: Use `/api/ai/universal-chat` with proper authentication
3. **Configure Rate Limiting**: Implement usage quotas for AI features
4. **Enable Supabase pgvector**: For semantic search capabilities

## 🔍 Validation Commands

```bash
# Type check
pnpm tsc --noEmit

# Lint check
pnpm lint

# Test AI endpoint
curl -X POST http://localhost:3000/api/ai/universal-chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Olá, preciso de ajuda com agendamentos"}'
```

## 📋 Epic 4 Implementation Status

- ✅ Story 4.1: Universal AI Chat (API Ready)
- ⏳ Story 4.2: Cross-Functional Suggestions (Pending)
- ⏳ Story 4.3: Predictive Analytics (Pending)
- ⏳ Story 4.4: Process Automation (Pending)

Next: Install OpenAI dependency and update chat engine implementation.
