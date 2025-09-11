# Command: /research | /pesquisar

## Universal Description

**Ultimate Research & Knowledge Management System** - Multi-source intelligence gathering with
automated knowledge synthesis, progressive depth analysis, and comprehensive knowledge base
management for any domain or complexity.

## Purpose

Orchestrate comprehensive research operations with Context7 → Tavily → Exa intelligence chains,
automated knowledge synthesis, and intelligent knowledge base management, ensuring accurate,
current, and actionable insights with long-term knowledge preservation.

## Context Detection

- **Research Operations**: Topic investigation, technology evaluation, comparative analysis,
  validation studies
- **Knowledge Management**: Knowledge base creation, organization, retrieval, and maintenance
- **Intelligence Synthesis**: Multi-source validation, cross-reference analysis, expert insight
  compilation
- **Healthcare Compliance**: LGPD/ANVISA/CFM research and regulatory compliance validation
- **Technology Research**: Framework comparison, best practices, implementation patterns

## Auto-Activation Triggers

```yaml
bilingual_triggers:
  portuguese: [
    "pesquisar",
    "investigar",
    "estudar",
    "analisar",
    "validar",
    "comparar",
    "conhecimento",
  ]
  english: ["research", "investigate", "study", "analyze", "validate", "compare", "knowledge"]

research_triggers:
  - "Technology evaluation and comparison needed"
  - "Best practices research and validation required"
  - "Healthcare compliance research needed"
  - "Market analysis and competitive research"
  - "Academic research and scholarly analysis"

knowledge_triggers:
  - "Knowledge base creation and organization"
  - "Information retrieval and synthesis"
  - "Documentation creation and management"
  - "Learning material development"
  - "Knowledge gap identification and filling"

automatic_scenarios:
  - Complex decisions requiring research validation
  - New technology adoption evaluation
  - Compliance requirements research
  - Knowledge base development and maintenance
  - Research-driven documentation creation
```

## Research & Knowledge Execution Pattern

- **ALWAYS USE APEX Research**: [`.ruler/agents/apex-researcher.md`](/.ruler/agents/apex-researcher.md)

```bash
@apex-researcher "pesquisar [tecnologia/padrão/regulamentação]"
```

### 1. Research Strategy & Planning

```bash
# Determine research scope and knowledge management needs
RESEARCH_TOPIC="$1"
DEPTH_LEVEL="${2:-deep}"
SOURCE_STRATEGY="${3:-mixed}"
KNOWLEDGE_ACTION="${4:-synthesize}"

echo "🔍 Initializing research and knowledge management..."

# Assess research complexity and knowledge requirements
case $DEPTH_LEVEL in
    "surface"|"quick")
        RESEARCH_TIME="15-30min"
        SOURCES_COUNT="3-5"
        KNOWLEDGE_DEPTH="basic"
        ;;
    "deep"|"standard")
        RESEARCH_TIME="1-3hrs"
        SOURCES_COUNT="8-15"
        KNOWLEDGE_DEPTH="comprehensive"
        ;;
    "comprehensive"|"exhaustive")
        RESEARCH_TIME="4-8hrs"
        SOURCES_COUNT="20+"
        KNOWLEDGE_DEPTH="expert"
        ;;
esac
```

### 2. Multi-Source Intelligence Chain

```bash
echo "🧠 Executing MCP intelligence chain..."

# Phase 1: Context7 Technical Research
execute_context7_research() {
    echo "📚 Context7: Official documentation and technical research"
    # Technical documentation and library research
    # Framework best practices and implementation patterns
    # API documentation and integration guidelines
    # Official specifications and standards
}

# Phase 2: Tavily Real-Time Intelligence
execute_tavily_research() {
    echo "🌐 Tavily: Real-time web search and community insights"
    # Current information, trends, and real-time data
    # News, community discussions, expert opinions
    # Industry reports and market analysis
    # Recent developments and updates
}

# Phase 3: Exa Deep Intelligence (L5+ complexity)
execute_exa_research() {
    echo "🎯 Exa: Deep research and academic sources"
    # Academic papers and research publications
    # In-depth technical analysis and case studies
    # Historical context and evolution tracking
    # Expert interviews and authoritative sources
}

# Phase 4: Sequential Synthesis
execute_sequential_synthesis() {
    echo "🧩 Sequential Thinking: Multi-perspective analysis"
    # Critical evaluation and bias assessment
    # Pattern recognition and trend identification
    # Logical reasoning and conclusion formation
    # Knowledge organization and structuring
}
```

## Research Capabilities

### Technology Research

```yaml
technology_research:
  framework_analysis:
    - "React, Vue, Angular ecosystem comparison and evaluation"
    - "Backend framework assessment (Node.js, Python, Java, .NET)"
    - "Database technology selection and optimization"
    - "Cloud platform and service analysis and comparison"

  emerging_technologies:
    - "AI/ML frameworks and implementation patterns"
    - "Blockchain and distributed ledger technologies"
    - "Edge computing and IoT integration strategies"
    - "Quantum computing and future technology assessment"

  best_practices_research:
    - "Industry standards, conventions, and guidelines"
    - "Security best practices and compliance requirements"
    - "Performance optimization techniques and patterns"
    - "Scalability and architecture pattern analysis"

  neonpro_healthcare_specific:
    - "Healthcare technology stack optimization and integration"
    - "Supabase healthcare implementation patterns"
    - "Multi-tenant SaaS architecture for healthcare"
    - "LGPD compliance technical implementation requirements"
```

### Healthcare & Compliance Research

```yaml
healthcare_research:
  regulatory_compliance:
    - "LGPD (Lei Geral de Proteção de Dados) comprehensive requirements"
    - "ANVISA (National Health Surveillance) regulations and compliance"
    - "CFM (Federal Council of Medicine) digital health standards"
    - "International healthcare compliance (HIPAA, GDPR) comparison"

  medical_technology:
    - "Electronic health record systems and integration"
    - "Patient data security, privacy, and access controls"
    - "Medical device software standards and validation"
    - "Telemedicine platform requirements and regulations"

  audit_and_security:
    - "Healthcare data audit requirements and procedures"
    - "Patient consent management systems and workflows"
    - "Medical data encryption standards and implementation"
    - "Healthcare cybersecurity frameworks and best practices"
```

### Academic & Market Research

```yaml
academic_research:
  scholarly_analysis:
    - "Peer-reviewed journals and publication research"
    - "Conference proceedings and presentation analysis"
    - "Research thesis and dissertation comprehensive review"
    - "Expert opinions and thought leadership synthesis"

  methodology_focus:
    - "Research methodology and experimental design validation"
    - "Statistical analysis and data interpretation techniques"
    - "Literature review and meta-analysis approaches"
    - "Theoretical frameworks and conceptual model development"

market_research:
  competitive_analysis:
    - "Product feature comparison and competitive gap analysis"
    - "Market positioning and differentiation strategies"
    - "Pricing models and business strategy evaluation"
    - "User experience and design trend analysis"

  industry_trends:
    - "Market size, growth projections, and forecasting"
    - "Regulatory changes and compliance impact analysis"
    - "Consumer behavior and preference shift research"
    - "Innovation patterns and technology adoption cycles"
```

## Knowledge Management System

### Knowledge Operations

```yaml
knowledge_create:
  documentation_generation:
    - "Technical guides, tutorials, and implementation documentation"
    - "Best practices, methodologies, and standard procedures"
    - "Troubleshooting guides, FAQs, and problem-solution mapping"
    - "API documentation and integration guide generation"

  content_synthesis:
    - "Multi-source research compilation and synthesis"
    - "Expert interview integration and knowledge extraction"
    - "Community knowledge compilation and validation"
    - "Case study development and lessons learned documentation"

knowledge_retrieve:
  search_capabilities:
    - "Semantic search with natural language query processing"
    - "Faceted search with advanced filtering and categorization"
    - "Full-text search with relevance ranking and scoring"
    - "Tag-based and metadata-driven knowledge discovery"

  context_awareness:
    - "User role and permission-based result filtering"
    - "Project and domain-specific knowledge prioritization"
    - "Personalized recommendations and intelligent suggestions"
    - "Recent activity and search history integration"

knowledge_update:
  modification_strategies:
    append: "Add new information while preserving existing content"
    replace: "Substitute outdated information with current data"
    merge: "Intelligently combine multiple sources and perspectives"
    synthesize: "Create new knowledge from research findings"

  version_control:
    - "Change tracking and comprehensive history preservation"
    - "Rollback capability and recovery options"
    - "Collaborative editing and conflict resolution"
    - "Quality gate approval workflows and validation"

knowledge_organize:
  information_architecture:
    - "Hierarchical categorization and taxonomic classification"
    - "Cross-reference mapping and relationship definition"
    - "Search optimization and keyword integration"
    - "Learning pathway creation and optimization"

  quality_management:
    - "Accuracy validation and fact-checking processes"
    - "Completeness assessment and gap identification"
    - "Currency monitoring and update scheduling"
    - "User feedback integration and continuous improvement"
```

### Knowledge Formats & Structures

### Structured Knowledge

```yaml
structured_format:
  characteristics:
    - "Formal organization with clear hierarchical structure"
    - "Consistent formatting and comprehensive style guidelines"
    - "Machine-readable metadata and intelligent tagging"
    - "Comprehensive cross-referencing and link management"

  optimal_for:
    - "Technical documentation and detailed specifications"
    - "Compliance and regulatory guideline documentation"
    - "Standard operating procedures and workflow documentation"
    - "API documentation and integration reference materials"

  components:
    - "Executive summary with key insights and recommendations"
    - "Detailed sections with logical subsection organization"
    - "Practical examples, code snippets, and usage demonstrations"
    - "Comprehensive references and authoritative external links"
```

### Narrative Knowledge

```yaml
narrative_format:
  characteristics:
    - "Story-driven explanations with contextual background"
    - "Conversational tone with accessibility optimization"
    - "Real-world scenarios and practical examples"
    - "Progressive disclosure and optimized learning flow"

  optimal_for:
    - "Training materials, tutorials, and educational content"
    - "Onboarding documentation and orientation materials"
    - "Best practice sharing and detailed case studies"
    - "Cultural and organizational knowledge preservation"

  components:
    - "Engaging introduction with clear context setting"
    - "Step-by-step narrative progression with logical flow"
    - "Practical illustrations and real-world applications"
    - "Key takeaways and actionable implementation items"
```

### Reference Knowledge

```yaml
reference_format:
  characteristics:
    - "Quick-access facts with scannable organization"
    - "Concise explanations with search optimization"
    - "Frequently updated with current information"
    - "Cross-referenced with related topics and concepts"

  optimal_for:
    - "Quick reference guides and comprehensive cheat sheets"
    - "Troubleshooting and diagnostic procedure guides"
    - "Configuration and setup step-by-step procedures"
    - "Command references and syntax guide collections"

  components:
    - "Searchable index and comprehensive table of contents"
    - "Concise definitions with clear explanations"
    - "Code examples and command syntax demonstrations"
    - "Cross-references and related topic suggestions"
```

## Progressive Research & Knowledge Standards

### Surface Research & Basic Knowledge (L1-L3)

```yaml
research_scope: "Quick overview with essential facts and basic knowledge creation"
time_investment: "15-30 minutes"
sources_required: "3-5 high-quality and authoritative sources"
knowledge_depth: "Basic understanding with fundamental concepts"

deliverables:
  - "Executive summary with key findings and insights"
  - "Essential facts, figures, and basic knowledge base entries"
  - "Fundamental pros/cons analysis with decision factors"
  - "Next steps recommendations and knowledge gaps identification"

quality_standards: "≥8.5/10 accuracy with single-source verification"
knowledge_management: "Basic categorization with essential metadata"
```

### Deep Research & Standard Knowledge (L4-L6)

```yaml
research_scope: "Comprehensive analysis with detailed knowledge base development"
time_investment: "1-3 hours"
sources_required: "8-15 diverse and authoritative sources"
knowledge_depth: "Comprehensive understanding with practical applications"

deliverables:
  - "Detailed research report with methodology and comprehensive knowledge articles"
  - "Multi-perspective analysis with synthesized insights"
  - "Trend analysis and future implications with knowledge organization"
  - "Strategic recommendations with implementation guidance"

quality_standards: "≥9.0/10 accuracy with multi-source cross-validation"
knowledge_management: "Comprehensive organization with relationship mapping"
```

### Comprehensive Research & Expert Knowledge (L7-L10)

```yaml
research_scope: "Exhaustive expert-level analysis with comprehensive knowledge systems"
time_investment: "4-8+ hours"
sources_required: "20+ authoritative sources including primary research"
knowledge_depth: "Expert-level understanding with advanced knowledge architecture"

deliverables:
  - "Comprehensive research report with executive summary and complete knowledge base"
  - "Methodology documentation with source evaluation and quality assessment"
  - "Statistical validation and detailed analysis with knowledge graph development"
  - "Implementation roadmap and strategic planning with learning pathways"
  - "Risk assessment and mitigation strategies with knowledge governance"

quality_standards: "≥9.5/10 with academic-level rigor and peer validation"
knowledge_management: "Enterprise knowledge architecture with advanced analytics"
```

## Research & Knowledge Commands

### Research Commands

```bash
# Basic research operations
/research [topic]                           # Standard deep research
/research [topic] --depth=surface           # Quick research overview
/research [topic] --depth=comprehensive     # Exhaustive research
/research [topic] --sources=technical       # Technical documentation focus
/research [topic] --sources=academic        # Academic and scholarly focus
/research [topic] --healthcare               # Healthcare compliance focus

# Comparative analysis
/research compare "[option1]" "[option2]"   # Technology comparison
/research validate "[solution]"             # Solution validation
/research trends "[domain]"                 # Industry trends research
```

### Knowledge Management Commands

```bash
# Knowledge operations
/research knowledge create "[topic]"         # Create knowledge article
/research knowledge retrieve "[query]"      # Search knowledge base
/research knowledge update "[topic]"        # Update existing knowledge
/research knowledge organize "[domain]"     # Organize knowledge structure

# Knowledge formats
/research knowledge create "[topic]" --format=structured    # Formal documentation
/research knowledge create "[topic]" --format=narrative     # Tutorial format
/research knowledge create "[topic]" --format=reference     # Quick reference

# Knowledge maintenance
/research knowledge audit                    # Quality and accuracy audit
/research knowledge gaps                     # Identify knowledge gaps
/research knowledge sync                     # Synchronize with external sources
```

## MCP Integration

### Context7 (Technical Documentation)

```yaml
technical_research:
  - "Framework documentation and official API references"
  - "Best practice implementation patterns and guidelines"
  - "Configuration and setup documentation validation"
  - "Security standards and compliance requirement research"
```

### Tavily (Real-Time Intelligence)

```yaml
community_research:
  - "Current industry trends and community insights"
  - "Real-time news and development updates"
  - "Community discussions and expert opinion aggregation"
  - "Market analysis and competitive intelligence gathering"
```

### Exa (Deep Intelligence)

```yaml
advanced_research:
  - "Academic papers and peer-reviewed research analysis"
  - "In-depth technical analysis and comprehensive case studies"
  - "Expert interviews and authoritative source compilation"
  - "Historical context and technology evolution tracking"
```

### Sequential Thinking (Analysis & Synthesis)

```yaml
intelligent_synthesis:
  - "Multi-perspective analysis and critical evaluation"
  - "Pattern recognition and trend identification"
  - "Logical reasoning and conclusion formation"
  - "Knowledge organization and relationship mapping"
```

### Desktop Commander (Knowledge Management)

```yaml
knowledge_operations:
  - "Knowledge base file management and organization"
  - "Documentation generation and formatting"
  - "Search index creation and maintenance"
  - "Version control and backup management"
```

## Deliverables

### 1. Research Intelligence Report

```markdown
# Research Intelligence Report

## Executive Summary

- **Research Scope**: [Technology/Domain/Topic comprehensive coverage]
- **Complexity Level**: [L1-L10 with detailed assessment rationale]
- **Research Depth**: [Surface/Deep/Comprehensive with methodology]
- **Sources Validated**: [Count, types, and credibility assessment]
- **Key Recommendations**: [Top 3-5 actionable insights with rationale]

## Multi-Source Findings Analysis

### Context7 (Official Documentation Research)

- **Framework Capabilities**: [Detailed analysis of capabilities and limitations]
- **Official Best Practices**: [Verified implementation recommendations]
- **Security & Performance**: [Guidelines and optimization strategies]
- **Configuration & Setup**: [Step-by-step implementation guidance]

### Tavily (Community & Market Intelligence)

- **Industry Trends**: [Current practices and emerging patterns]
- **Community Solutions**: [Validated community-driven approaches]
- **Recent Developments**: [Latest updates and considerations]
- **Market Positioning**: [Competitive analysis and differentiation]

### Exa (Expert & Academic Intelligence) [L5+ Complexity]

- **Academic Research**: [Peer-reviewed findings and scholarly analysis]
- **Expert Insights**: [Authoritative recommendations and guidance]
- **Advanced Patterns**: [Enterprise implementation strategies]
- **Future Implications**: [Long-term trends and strategic considerations]

## Healthcare Compliance Analysis (When Applicable)

- **LGPD Requirements**: [Specific data protection and privacy obligations]
- **ANVISA Regulations**: [Health surveillance and safety requirements]
- **CFM Standards**: [Medical practice and digital health guidelines]
- **Security Implementation**: [Technical security and audit requirements]

## Knowledge Base Integration

- **Knowledge Articles Created**: [List of structured knowledge entries]
- **Knowledge Organization**: [Categorization and relationship mapping]
- **Learning Pathways**: [Recommended learning progression]
- **Knowledge Gaps**: [Identified areas for future research]

## Implementation & Decision Framework

1. **Primary Recommendation**: [Detailed approach with comprehensive rationale]
2. **Alternative Options**: [Backup strategies with trade-off analysis]
3. **Risk Assessment**: [Identified risks with mitigation strategies]
4. **Quality Considerations**: [Standards and validation requirements]
5. **Timeline & Resources**: [Implementation planning and resource requirements]

## Knowledge Management Outcomes

- **Knowledge Base Updates**: [New entries and organizational improvements]
- **Documentation Generated**: [Technical guides and reference materials]
- **Learning Materials**: [Training content and educational resources]
- **Quality Validation**: [Accuracy verification and peer review results]
```

### 2. Knowledge Base Architecture

```yaml
knowledge_structure:
  research_findings:
    - "Structured research reports with comprehensive analysis"
    - "Comparative analysis matrices with decision frameworks"
    - "Technology evaluation summaries with recommendations"
    - "Best practices compilations with implementation guidance"

  knowledge_articles:
    - "Technical documentation with step-by-step procedures"
    - "Troubleshooting guides with problem-solution mapping"
    - "Configuration references with examples and explanations"
    - "Learning materials with progressive skill development"

  knowledge_organization:
    - "Hierarchical categorization with tag-based organization"
    - "Cross-reference mapping with relationship definitions"
    - "Search optimization with keyword and metadata indexing"
    - "Version control with change tracking and audit trails"
```

### 3. Quality Validation Framework

```yaml
research_quality:
  source_validation:
    - "Authority and credibility assessment with scoring"
    - "Currency and relevance verification with timestamps"
    - "Bias detection and mitigation with multi-source validation"
    - "Factual accuracy verification with cross-referencing"

  synthesis_quality:
    - "Logical consistency and coherence validation"
    - "Completeness assessment with gap identification"
    - "Actionability and practical application verification"
    - "Constitutional compliance with multi-perspective analysis"

knowledge_quality:
  content_accuracy: "Factual correctness with verification processes"
  organization_effectiveness: "Logical structure with usability testing"
  accessibility_optimization: "Multi-audience accessibility with feedback integration"
  maintenance_sustainability: "Update processes with quality monitoring"
```

## Usage Examples

### Technology Research

```bash
# Framework comparison research with knowledge base creation
/research "React vs Vue vs Angular 2024" --depth=deep --sources=technical

# Healthcare technology compliance research
/research "LGPD compliance healthcare SaaS" --depth=comprehensive --healthcare

# Quick technology validation with knowledge entry
/research "Supabase RLS patterns" --depth=surface --knowledge=create
```

### Knowledge Management

```bash
# Create structured technical documentation
/research knowledge create "React Hooks Best Practices" --format=structured

# Organize existing research into knowledge base
/research knowledge organize "Frontend Development" --domain=healthcare

# Update knowledge with latest research findings
/research knowledge update "API Security Patterns" --source=research --merge
```

### Comprehensive Research & Knowledge Workflow

```bash
# Complete research-to-knowledge workflow
/research comprehensive-workflow "Healthcare AI Implementation" --depth=comprehensive --knowledge=full

# Research validation with knowledge synthesis
/research validate "Multi-tenant SaaS Architecture" --knowledge=synthesize --format=reference
```

## Bilingual Support

### Portuguese Research & Knowledge Commands

- **`/pesquisar`** - Pesquisa completa com gestão de conhecimento
- **`/investigar-tecnologia`** - Investigação tecnológica com documentação
- **`/validar-solução`** - Validação de solução com base de conhecimento
- **`/conhecimento`** - Gestão completa de base de conhecimento
- **`/síntese-inteligente`** - Síntese inteligente de múltiplas fontes

### English Research & Knowledge Commands

- **`/research`** - Complete research with knowledge management
- **`/investigate-technology`** - Technology investigation with documentation
- **`/validate-solution`** - Solution validation with knowledge base
- **`/knowledge`** - Complete knowledge base management
- **`/intelligent-synthesis`** - Multi-source intelligent synthesis

## Success Metrics

### Research Excellence

- **Information Accuracy**: ≥95% verified facts with multi-source validation
- **Source Quality**: Authoritative and current sources with credibility scoring
- **Analysis Depth**: Comprehensive coverage meeting specified depth requirements
- **Synthesis Quality**: Coherent and actionable insights with logical structure

### Knowledge Management Excellence

- **Knowledge Organization**: Logical structure with intuitive navigation
- **Content Accessibility**: Multi-audience optimization with usability validation
- **Knowledge Integration**: Seamless research-to-knowledge workflows
- **Quality Maintenance**: Continuous accuracy and relevance monitoring

### Healthcare Compliance Excellence

- **Regulatory Accuracy**: Complete LGPD/ANVISA/CFM compliance validation
- **Security Standards**: Comprehensive security requirement documentation
- **Audit Readiness**: Complete documentation with audit trail maintenance
- **Implementation Guidance**: Practical compliance implementation strategies

---

## Ready for Research & Knowledge Management

Ultimate research and knowledge management system activated. The system will:

✅ **Execute multi-source intelligence** with Context7 → Tavily → Exa → Sequential Thinking chains\
✅ **Generate comprehensive research** with progressive depth and quality standards\
✅ **Create and manage knowledge bases** with intelligent organization and retrieval\
✅ **Ensure healthcare compliance** with LGPD/ANVISA/CFM regulatory research\
✅ **Provide actionable insights** with implementation guidance and decision frameworks\
✅ **Maintain knowledge quality** with continuous validation and improvement processes

**Usage**: Type `/research` or `/pesquisar` for comprehensive research operations, or use specific
knowledge commands for knowledge base management.

The research and knowledge management system ensures every investigation produces high-quality,
actionable insights with long-term knowledge preservation and accessibility for optimal
decision-making and organizational learning.
