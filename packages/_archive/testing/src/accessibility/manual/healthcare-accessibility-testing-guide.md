# Manual de Testes de Acessibilidade para Profissionais de Saúde

## 📋 Visão Geral

Este manual orienta profissionais de saúde na validação das funcionalidades de acessibilidade do sistema NeonPro, garantindo compliance com WCAG 2.1 AA e otimização para cenários médicos de emergência.

### 🎯 Objetivos dos Testes

- ✅ Validar acessibilidade em cenários de emergência médica
- ✅ Verificar terminologia médica em português brasileiro
- ✅ Testar navegação por teclado para profissionais com deficiência
- ✅ Validar contrast ratios para diferentes condições visuais
- ✅ Verificar compatibilidade com tecnologias assistivas

### 📊 Critérios de Aprovação

#### Sistema de Pontuação Unificado (0-10 escala)

**Pesos por Categoria:**
- **🚨 Emergência**: 25% (peso 2.5) - Funcionalidades críticas de emergência
- **🩺 Terminologia**: 20% (peso 2.0) - Termos médicos e pronúncia
- **⌨️ Navegação**: 20% (peso 2.0) - Acessibilidade via teclado
- **🎨 Contraste**: 15% (peso 1.5) - Ratios de contraste visual
- **🔗 Skip Links**: 10% (peso 1.0) - Enlaces de navegação rápida
- **📱 Responsividade**: 10% (peso 1.0) - Adaptação móvel e desktop

**Score Mínimo para Aprovação**: 8.5/10
- ✅ **APROVADO**: ≥8.5/10 (85%+)
- ⚠️ **ATENÇÃO**: 7.0-8.4/10 (70-84%)
- ❌ **REPROVADO**: <7.0/10 (<70%)

---

## 🚨 TESTE 1: Funcionalidades de Emergência

### Cenário: Ativação de Emergência via Teclado

**Pré-requisitos**: Sistema carregado, chat disponível

#### ✅ Teste 1.1: Atalho Ctrl+E

1. **Ação**: Pressione `Ctrl + E`
2. **Resultado esperado**:
   - Modo emergência ativa imediatamente
   - Botão de emergência aparece com foco
   - Screen reader anuncia: "Modo de emergência ativado via teclado"
3. **Validação**: ⬜ Passou ⬜ Falhou
4. **Notas**: _______________________

#### ✅ Teste 1.2: Atalho Alt+E (Alternativo)

1. **Ação**: Pressione `Alt + E`
2. **Resultado esperado**:
   - Modo emergência ativa
   - Anúncio: "Emergência médica ativada via teclado"
3. **Validação**: ⬜ Passou ⬜ Falhou

#### ✅ Teste 1.3: Botão de Emergência

1. **Ação**: Clique no botão vermelho de emergência
2. **Resultado esperado**:
   - Conexão imediata com médico
   - Anúncio: "Conectando com médico de plantão"
   - Botão pisca com alta visibilidade
3. **Validação**: ⬜ Passou ⬜ Falhou

#### ✅ Teste 1.4: Escape de Emergência

1. **Ação**: Pressione `Escape` no modo emergência
2. **Resultado esperado**:
   - Sai do modo emergência
   - Anúncio: "Saindo do modo de emergência"
3. **Validação**: ⬜ Passou ⬜ Falhou

**Score Emergência**: ___/4 ✅ Aprovado (4/4) ⚠️ Atenção (3/4) ❌ Reprovado (<3/4)

---

## 🩺 TESTE 2: Terminologia Médica Portuguesa

### Cenário: Validação de Termos com Leitores de Tela

**Pré-requisitos**: Screen reader ativo (NVDA, JAWS ou VoiceOver)

#### ✅ Teste 2.1: Termos de Emergência

1. **Teste cada termo**:
   - "emergência" → Pronúncia: "e-mer-gên-ci-a"
   - "médico" → Pronúncia: "mé-di-co"
   - "plantão" → Pronúncia: "plan-tão"

2. **Validação por termo**:
   - ⬜ emergência ⬜ médico ⬜ plantão

#### ✅ Teste 2.2: Termos de Procedimentos

1. **Teste cada termo**:
   - "botox" → Pronúncia: "bó-tocs"
   - "preenchimentos" → Pronúncia: "pre-en-chi-men-tos"
   - "procedimentos" → Pronúncia: "pro-ce-di-men-tos"

2. **Validação por termo**:
   - ⬜ botox ⬜ preenchimentos ⬜ procedimentos

#### ✅ Teste 2.3: Termos de Compliance

1. **Teste cada termo**:
   - "LGPD" → Pronúncia: "éle-gê-pê-dê"
   - "ANVISA" → Pronúncia: "an-vi-sa"
   - "CFM" → Pronúncia: "cê-efe-eme"

2. **Validação por termo**:
   - ⬜ LGPD ⬜ ANVISA ⬜ CFM

#### ✅ Teste 2.4: Termos Médicos Gerais

1. **Teste cada termo**:
   - "paciente" → Contexto médico claro
   - "consultas" → Contexto de agendamento
   - "tratamentos" → Contexto de procedimentos

2. **Validação por termo**:
   - ⬜ paciente ⬜ consultas ⬜ tratamentos

**Score Terminologia**: ___/12 ✅ Aprovado (≥11/12) ⚠️ Atenção (9-10/12) ❌ Reprovado (<9/12)

---

## ⌨️ TESTE 3: Navegação por Teclado

### Cenário: Uso Exclusivo do Teclado

**Pré-requisitos**: Mouse desconectado ou ignorado, usar apenas teclado

#### ✅ Teste 3.1: Atalhos Básicos

1. **Ctrl + M**: ⬜ Alterna reconhecimento de voz
2. **Ctrl + L**: ⬜ Limpa histórico do chat
3. **Ctrl + ?**: ⬜ Mostra ajuda de atalhos
4. **?** (simples): ⬜ Mostra menu de ajuda
5. **Tab**: ⬜ Navega entre elementos focáveis

**Validação**: ___/5 atalhos funcionais

#### ✅ Teste 3.2: Ordem de Tabulação (Tab Order)

1. **Sequência esperada**:
   1. Skip links (invisíveis até Tab)
   2. Elementos de emergência (prioridade alta)
   3. Campo de entrada de texto
   4. Botão enviar
   5. Controles de voz
   6. Botões de interface

2. **Validação da sequência**:
   - ⬜ Skip links aparecem com Tab
   - ⬜ Emergência tem prioridade
   - ⬜ Ordem lógica mantida
   - ⬜ Sem elementos inacessíveis

#### ✅ Teste 3.3: Elementos Focáveis

1. **Contagem mínima**: Pelo menos 6 elementos focáveis
2. **Indicadores de foco**: Visíveis em todos os elementos
3. **Contraste de foco**: 3:1 mínimo para indicadores

**Validação**: ⬜ ≥6 elementos ⬜ Foco visível ⬜ Contraste 3:1

#### ✅ Teste 3.4: Help Dialog (Ajuda de Atalhos)

1. **Abrir**: `Ctrl + ?` ou `?`
2. **Conteúdo esperado**:
   - Lista completa de 7 atalhos
   - Descrições em português
   - Prioridade de emergência destacada
   - Instruções de fechamento
3. **Fechar**: `Escape` ou botão ×

**Validação**: ⬜ Abre ⬜ Conteúdo completo ⬜ Fecha

**Score Navegação**: ___/13 ✅ Aprovado (≥12/13) ⚠️ Atenção (10-11/13) ❌ Reprovado (<10/13)

---

## 🎨 TESTE 4: Contraste de Cores e Visibilidade

### Cenário: Validação Visual para Diferentes Condições

#### ✅ Teste 4.1: Elementos de Emergência (Ratio 7:1)

1. **Elementos a testar**:
   - Botão de emergência vermelho
   - Badges de status de emergência
   - Alertas críticos
   - Textos de emergência

2. **Método de teste**:
   - Use ferramenta de contraste (ex: WebAIM)
   - Ou teste visual: texto deve ser claramente legível

**Validação**: ⬜ Todos os elementos ≥7:1

#### ✅ Teste 4.2: Interface Médica Normal (Ratio 4.5:1)

1. **Elementos a testar**:
   - Texto do chat
   - Labels de formulário
   - Botões secundários
   - Menu e navegação

**Validação**: ⬜ Todos os elementos ≥4.5:1

#### ✅ Teste 4.3: Indicadores de Foco (Ratio 3:1)

1. **Teste**: Tab pelos elementos e observe o contorno de foco
2. **Validação**: Contorno visível em todos os elementos focáveis

**Validação**: ⬜ Foco visível ⬜ Contraste ≥3:1

#### ✅ Teste 4.4: Teste de Daltonismo

1. **Ferramenta**: Use simulador de daltonismo ou filtros
2. **Validação**: Interface utilizável sem dependência apenas de cor

**Validação**: ⬜ Funcional para daltonismo

**Score Contraste**: ___/4 ✅ Aprovado (4/4) ⚠️ Atenção (3/4) ❌ Reprovado (<3/4)

---

## 🔗 TESTE 5: Skip Links e Navegação Rápida

### Cenário: Usuário com Leitor de Tela

#### ✅ Teste 5.1: Skip Links Implementados

1. **Pressione Tab** na primeira carga da página
2. **Links esperados** (devem aparecer):
   - "Pular para mensagens do chat" → #chat-messages
   - "Pular para entrada de mensagem" → #chat-input
   - "Pular para ações de emergência" → #emergency-actions (se emergência ativa)

3. **Validação por link**:
   - ⬜ Skip para mensagens
   - ⬜ Skip para entrada
   - ⬜ Skip para emergência (se aplicável)

#### ✅ Teste 5.2: Funcionamento dos Skips

1. **Teste cada skip link**: Pressione Enter
2. **Validação**: Foco move para o elemento correto

**Validação**: ⬜ Todos os skips funcionam

**Score Skip Links**: ___/4 ✅ Aprovado (4/4) ⚠️ Atenção (3/4) ❌ Reprovado (<3/4)

---

## 📱 TESTE 6: Acessibilidade Mobile

### Cenário: Teste em Dispositivo Móvel

#### ✅ Teste 6.1: Touch e Gestos

1. **Elementos tocáveis**: Mínimo 44px × 44px
2. **Gestos de acessibilidade**:
   - iOS: VoiceOver habilitado
   - Android: TalkBack habilitado

**Validação**: ⬜ Elementos adequados ⬜ Screen reader funcional

#### ✅ Teste 6.2: Orientação da Tela

1. **Teste**: Gire o dispositivo
2. **Validação**: Interface adaptada e funcional

**Validação**: ⬜ Portrait ⬜ Landscape

#### ✅ Teste 6.3: Zoom e Ampliação

1. **Teste**: Zoom até 200% e 400%
2. **Validação**: Conteúdo permanece acessível

**Validação**: ⬜ 200% ⬜ 400%

**Score Mobile**: ___/4 ✅ Aprovado (4/4) ⚠️ Atenção (3/4) ❌ Reprovado (<3/4)

---

## 📊 TESTE 7: Screen Readers Completos

### Cenário: Validação com Diferentes Screen Readers

#### ✅ Teste 7.1: NVDA (Windows)

1. **Funcionalidades**:
   - ⬜ Lê todos os elementos corretamente
   - ⬜ Anuncia mudanças de estado
   - ⬜ Pronuncia termos médicos corretamente
   - ⬜ Navega por regiões/landmarks

#### ✅ Teste 7.2: JAWS (Windows)

1. **Funcionalidades**:
   - ⬜ Compatibilidade total
   - ⬜ Shortcuts funcionais
   - ⬜ Formulários acessíveis

#### ✅ Teste 7.3: VoiceOver (Mac/iOS)

1. **Funcionalidades**:
   - ⬜ Rotor de navegação funcional
   - ⬜ Gestos de navegação
   - ⬜ Leitura contínua

#### ✅ Teste 7.4: TalkBack (Android)

1. **Funcionalidades**:
   - ⬜ Navegação por exploração
   - ⬜ Gestos globais
   - ⬜ Feedback tátil

**Score Screen Readers**: ___/12 ✅ Aprovado (≥10/12) ⚠️ Atenção (8-9/12) ❌ Reprovado (<8/12)

---

## 🏥 TESTE 8: Cenários Clínicos Reais

### Cenário: Simulação de Uso Real por Profissionais

#### ✅ Teste 8.1: Emergência - Médico com Deficiência Visual

**Situação**: Profissional cego precisa ativar emergência rapidamente

1. **Passos**:
   - Screen reader ligado
   - Sistema carregado
   - Ativação via `Ctrl + E`
   - Confirmação de conexão

2. **Critérios de sucesso**:
   - ⬜ Ativação em <3 segundos
   - ⬜ Feedback sonoro claro
   - ⬜ Confirmação de conexão

#### ✅ Teste 8.2: Consulta - Profissional com Deficiência Motora

**Situação**: Uso apenas do teclado para registrar consulta

1. **Passos**:
   - Navegação apenas por Tab
   - Preenchimento de dados
   - Busca de informações
   - Registro de procedimento

2. **Critérios de sucesso**:
   - ⬜ Acesso a todos os campos
   - ⬜ Navegação eficiente
   - ⬜ Ações executáveis por teclado

#### ✅ Teste 8.3: Análise - Profissional com Baixa Visão

**Situação**: Uso com zoom 400% e alto contraste

1. **Passos**:
   - Ativar zoom do navegador para 400%
   - Ativar alto contraste do SO
   - Navegar pela interface
   - Ler informações médicas

2. **Critérios de sucesso**:
   - ⬜ Interface utilizável em 400% zoom
   - ⬜ Alto contraste funcional
   - ⬜ Textos legíveis

**Score Cenários Clínicos**: ___/9 ✅ Aprovado (≥8/9) ⚠️ Atenção (6-7/9) ❌ Reprovado (<6/9)

---

## 📋 RESUMO DE RESULTADOS

### Pontuação por Categoria (Escala 0-10)

| Categoria            | Score Individual | Peso | Score Ponderado | Status |
| -------------------- | --------------- | ---- | --------------- | ------ |
| 🚨 Emergência        | ___/10          | 25%  | ___/2.5         | ✅⚠️❌  |
| 🩺 Terminologia      | ___/10          | 20%  | ___/2.0         | ✅⚠️❌  |
| ⌨️ Navegação          | ___/10          | 20%  | ___/2.0         | ✅⚠️❌  |
| 🎨 Contraste         | ___/10          | 15%  | ___/1.5         | ✅⚠️❌  |
| 🔗 Skip Links        | ___/10          | 10%  | ___/1.0         | ✅⚠️❌  |
| 📱 Responsividade    | ___/10          | 10%  | ___/1.0         | ✅⚠️❌  |

### Score Final: ___/10.0

**Critérios de Status por Categoria:**
- ✅ **BOM**: ≥8.5/10 na categoria
- ⚠️ **ATENÇÃO**: 7.0-8.4/10 na categoria  
- ❌ **CRÍTICO**: <7.0/10 na categoria

### Classificação Final

- **✅ APROVADO**: Score Final ≥8.5/10 (85%+)
- **⚠️ ATENÇÃO**: Score Final 7.0-8.4/10 (70-84%)
- **❌ REPROVADO**: Score Final <7.0/10 (<70%)

---

## 🔧 Ações Corretivas

### Se Score < 85%

#### Emergência (Crítico)

- [ ] Corrigir atalhos de teclado não funcionais
- [ ] Ajustar contraste de botões de emergência
- [ ] Melhorar anúncios de screen reader

#### Terminologia (Importante)

- [ ] Adicionar pronúncias faltantes
- [ ] Corrigir contextos médicos
- [ ] Atualizar componente MedicalTerm

#### Navegação (Importante)

- [ ] Corrigir ordem de tabulação
- [ ] Adicionar indicadores de foco faltantes
- [ ] Implementar atalhos ausentes

#### Contraste (Importante)

- [ ] Ajustar cores que não atendem ratios
- [ ] Melhorar indicadores de foco
- [ ] Testar com diferentes condições visuais

---

## 📞 Suporte

### Contatos para Dúvidas

- **Acessibilidade**: acessibilidade@neonpro.com.br
- **Suporte Técnico**: suporte@neonpro.com.br
- **Documentação**: docs.neonpro.com.br/accessibility

### Ferramentas Recomendadas

- **Contraste**: WebAIM Color Contrast Checker
- **Screen Reader**: NVDA (gratuito)
- **Teclado**: Desabilitar mouse temporariamente
- **Mobile**: Dispositivos reais + emuladores

---

**Versão**: 1.0.0\
**Última atualização**: Janeiro 2025\
**Compliance**: WCAG 2.1 AA Healthcare
