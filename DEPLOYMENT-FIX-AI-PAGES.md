# Correção de Deploy - AI Treatment Pages

## Problema Identificado

Erro durante o deploy no Vercel:

```
Error occurred prerendering page "/dashboard/treatments/ai".
Error: Event handlers cannot be passed to Client Component props.
```

## Causa do Problema

A página `/dashboard/treatments/ai/page.tsx` era um Server Component por padrão tentando passar event handlers (funções) como props para o componente `TreatmentRecommendations` que é um Client Component.

Em Next.js 13+ com App Router, Server Components não podem passar funções como props para Client Components.

## Solução Implementada

1. **Transformar página em Client Component**:

   - Adicionado `'use client'` no início do arquivo `page.tsx`
   - Permite o uso de event handlers e interatividade

2. **Mover metadata para layout**:
   - Criado arquivo `layout.tsx` como Server Component
   - Metadata exportada do layout ao invés da página
   - Mantém otimização de SEO

## Arquivos Modificados

- `/src/app/dashboard/treatments/ai/page.tsx` - Convertido para Client Component
- `/src/app/dashboard/treatments/ai/layout.tsx` - Criado para exportar metadata

## Resultado

✅ Event handlers podem ser passados normalmente
✅ Metadata ainda é processada pelo Next.js
✅ Deploy no Vercel deve funcionar corretamente

## Data: 2025-06-18
