# Code Review Checklist - NeonPro

> **Objetivo**: Garantir qualidade, segurança e conformidade regulatória em todas as mudanças de código.

## 🔍 Checklist Geral de Code Review

### 1. Funcionalidade

#### Lógica de Negócio

- [ ] O código implementa corretamente os requisitos especificados
- [ ] A lógica de negócio está clara e bem estruturada
- [ ] Casos extremos (edge cases) são tratados adequadamente
- [ ] Validações de entrada estão implementadas
- [ ] Tratamento de erros está presente e apropriado

#### Performance

- [ ] Não há loops desnecessários ou ineficientes
- [ ] Consultas ao banco de dados são otimizadas
- [ ] Uso de memória é adequado
- [ ] Não há vazamentos de memória potenciais
- [ ] Operações assíncronas são utilizadas quando apropriado

### 2. Qualidade do Código

#### Estrutura e Organização

- [ ] Código segue os padrões de arquitetura definidos
- [ ] Funções/métodos têm tamanho apropriado (< 50 linhas)
- [ ] Classes têm responsabilidade única
- [ ] Não há duplicação de código
- [ ] Estrutura de pastas segue o source-tree definido

#### Nomenclatura e Legibilidade

- [ ] Nomes de variáveis são descritivos e claros
- [ ] Nomes de funções expressam claramente sua finalidade
- [ ] Constantes são nomeadas em UPPER_CASE
- [ ] Comentários explicam o "porquê", não o "como"
- [ ] Código é auto-documentado

#### Padrões de Codificação

- [ ] Segue as convenções do TypeScript/JavaScript
- [ ] Indentação consistente (2 espaços)
- [ ] Uso correto de tipos TypeScript
- [ ] Imports organizados e otimizados
- [ ] ESLint e Prettier aplicados

### 3. Segurança

#### Proteção de Dados

- [ ] Dados sensíveis não são expostos em logs
- [ ] Senhas e tokens não estão hardcoded
- [ ] Validação de entrada previne injeção de código
- [ ] Autenticação e autorização implementadas corretamente
- [ ] Criptografia aplicada a dados sensíveis

#### Vulnerabilidades Comuns

- [ ] Prevenção contra XSS (Cross-Site Scripting)
- [ ] Proteção contra CSRF (Cross-Site Request Forgery)
- [ ] Validação de tipos e sanitização de dados
- [ ] Rate limiting implementado onde necessário
- [ ] Headers de segurança configurados

### 4. Testes

#### Cobertura de Testes

- [ ] Testes unitários cobrem funcionalidades críticas
- [ ] Testes de integração validam fluxos completos
- [ ] Testes E2E cobrem cenários de usuário
- [ ] Cobertura de código ≥ 80%
- [ ] Testes são determinísticos (não flaky)

#### Qualidade dos Testes

- [ ] Testes são legíveis e bem estruturados
- [ ] Mocks e stubs são utilizados apropriadamente
- [ ] Testes validam comportamentos, não implementação
- [ ] Casos de erro são testados
- [ ] Testes de performance quando necessário

## 🏥 Checklist Específico para Saúde

### 1. LGPD (Lei Geral de Proteção de Dados)

#### Proteção de Dados Pessoais

- [ ] Dados pessoais são identificados e classificados
- [ ] Consentimento é coletado quando necessário
- [ ] Dados são minimizados (apenas o necessário)
- [ ] Retenção de dados segue políticas definidas
- [ ] Direitos do titular são respeitados

#### Segurança da Informação

- [ ] Criptografia em trânsito (HTTPS/TLS)
- [ ] Criptografia em repouso para dados sensíveis
- [ ] Controle de acesso baseado em funções
- [ ] Logs de auditoria implementados
- [ ] Backup e recuperação de dados

### 2. ANVISA (Agência Nacional de Vigilância Sanitária)

#### Classificação de Software Médico

- [ ] Funcionalidade não interfere em decisões médicas críticas
- [ ] Classificação de risco documentada
- [ ] Validação de algoritmos médicos
- [ ] Rastreabilidade de mudanças
- [ ] Controle de versão rigoroso

#### Gestão de Qualidade

- [ ] Documentação técnica atualizada
- [ ] Procedimentos de teste documentados
- [ ] Gestão de riscos implementada
- [ ] Controle de mudanças formal
- [ ] Validação de requisitos

### 3. CFM (Conselho Federal de Medicina)

#### Prontuário Eletrônico

- [ ] Integridade dos dados médicos
- [ ] Assinatura digital implementada
- [ ] Histórico de alterações preservado
- [ ] Backup e arquivamento seguros
- [ ] Acesso controlado por perfil médico

#### Telemedicina

- [ ] Identificação segura de pacientes
- [ ] Consentimento informado documentado
- [ ] Privacidade em consultas remotas
- [ ] Armazenamento seguro de consultas
- [ ] Prescrição eletrônica conforme

## 🔧 Ferramentas Automáticas

### DeepSource

- [ ] Todas as issues críticas resolvidas
- [ ] Issues de segurança endereçadas
- [ ] Code smells principais corrigidos
- [ ] Métricas de qualidade mantidas

### CodeRabbit

- [ ] Feedback de IA revisado e aplicado
- [ ] Sugestões de melhoria consideradas
- [ ] Padrões de código validados
- [ ] Potenciais bugs identificados

### SonarQube (se aplicável)

- [ ] Quality Gate passou
- [ ] Vulnerabilidades de segurança zeradas
- [ ] Code coverage mantido
- [ ] Duplicação de código minimizada

## 📋 Processo de Aprovação

### Critérios Mínimos

- [ ] Todos os testes automatizados passando
- [ ] Checklist de code review completo
- [ ] Aprovação de pelo menos 1 reviewer
- [ ] Ferramentas automáticas validadas
- [ ] Documentação atualizada

### Critérios para Mudanças Críticas

- [ ] Aprovação de 2+ reviewers
- [ ] Aprovação do tech lead
- [ ] Testes de regressão executados
- [ ] Plano de rollback documentado
- [ ] Validação de compliance

### Critérios para Mudanças de Saúde

- [ ] Revisão por especialista em regulamentação
- [ ] Validação de compliance LGPD/ANVISA/CFM
- [ ] Testes de segurança específicos
- [ ] Documentação regulatória atualizada
- [ ] Aprovação do responsável técnico

## 🚀 Pós-Merge

### Monitoramento

- [ ] Métricas de performance monitoradas
- [ ] Logs de erro verificados
- [ ] Alertas configurados
- [ ] Rollback testado

### Documentação

- [ ] Changelog atualizado
- [ ] Documentação técnica revisada
- [ ] Knowledge base atualizada
- [ ] Treinamento da equipe (se necessário)

---

**Nota**: Este checklist deve ser adaptado conforme a complexidade e criticidade da mudança. Para mudanças menores, alguns itens podem ser opcionais, mas os relacionados à segurança e compliance são sempre obrigatórios.
