# Prompt Enhancement Workflow

## Description

Enhance prompts with layered reasoning, validation gates, and constitutional compliance for NeonPro healthcare platform.

## Category

Optimization

## Complexity

Medium

## MCP Tools Required

- None (static analysis workflow)

## Execution Flow

### Phase 1: Analysis

1. **Explicit Requirements Extraction**
   - Identify stated goals, constraints, and success criteria
   - Extract specific technical requirements
   - Map out user scenarios and use cases
   - Generate structured explicit requirements analysis

2. **Implicit Requirements Inference**
   - Identify unstated assumptions and dependencies
   - Infer scalability and maintainability needs
   - Detect potential edge cases and error conditions
   - Generate implicit requirements mapping with confidence levels

### Phase 2: Enhancement

1. **Layered Reasoning Application**
   - **Input Validation**: Add explicit input validation and error handling
   - **Output Validation**: Define clear output contracts and validation gates
   - **Progressive Refinement**: Structure prompt with iterative refinement steps
   - **Context Awareness**: Incorporate environmental and system context
   - Generate enhanced prompt with layered reasoning structure

2. **Validation Gates Integration**
   - **Pre-Execution Gates**: Add checks before main execution
     - Input validation
     - Environment check
     - Dependency verification
   - **In-Execution Gates**: Add checks during execution
     - Progress validation
     - Error boundary check
     - Resource monitoring
   - **Post-Execution Gates**: Add checks after execution
     - Output validation
     - Quality assurance
     - Compliance check
   - Generate prompt with comprehensive validation gate structure

### Phase 3: Constitutional Compliance

1. **KISS/YAGNI Principles Application**
   - Remove unnecessary complexity and abstractions
   - Verify all components serve essential purposes
   - Ensure prompt is clear and unambiguous
   - Generate simplified prompt with essential components only

2. **Test-First Development Enforcement**
   - Ensure all requirements are testable
   - Define clear success criteria
   - Include error handling and edge case testing
   - Generate prompt with test-first development structure

3. **Healthcare Compliance Application**
   - Ensure data privacy and protection requirements (LGPD)
   - Include healthcare regulatory considerations (ANVISA)
   - Follow medical ethics and professional standards (CFM)
   - Generate prompt with healthcare compliance validation

### Phase 4: Optimization

1. **Performance Optimization**
   - Remove redundant instructions and checks
   - Improve readability and maintainability
   - Structure prompt for easy modification and extension
   - Generate optimized prompt with improved performance characteristics

2. **Documentation Enhancement**
   - Add clear comments and explanations
   - Include practical usage examples
   - Add common issues and solutions
   - Generate well-documented prompt with usage guidance

### Phase 5: Validation

1. **Quality Assessment**
   - **Completeness**: All requirements addressed
   - **Clarity**: Instructions are clear and unambiguous
   - **Testability**: Success criteria are measurable
   - **Maintainability**: Prompt is easy to understand and modify
   - **Efficiency**: No unnecessary complexity or redundancy
   - Generate quality assessment report with improvement recommendations

2. **Compliance Validation**
   - **Constitutional Compliance**: Follows all NeonPro constitutional principles
   - **Healthcare Compliance**: Meets healthcare regulatory requirements
   - **Technical Compliance**: Follows technical standards and best practices
   - Generate compliance validation report with certification status

## Input Parameters

- **original_prompt**: The original prompt to be enhanced
- **enhancement_level**: Level of enhancement (basic, standard, comprehensive)
- **compliance_requirements**: Specific compliance requirements (constitutional, healthcare, both)
- **optimization_focus**: Focus area for optimization (performance, maintainability, both)

## Output Requirements

- **enhanced_prompt**: The enhanced prompt with layered reasoning and validation gates
- **enhancement_report**: List of specific improvements made
- **quality_metrics**: Before/after quality comparison
- **compliance_status**: Constitutional and regulatory compliance status
- **recommendations**: Further improvement suggestions

## Quality Criteria

- **Functional**:
  - **Completeness**: All requirements fully addressed
  - **Correctness**: Logic and reasoning are sound
  - **Effectiveness**: Prompt achieves intended goals

- **Non-Functional**:
  - **Clarity**: Instructions are clear and unambiguous
  - **Maintainability**: Prompt is easy to understand and modify
  - **Efficiency**: No unnecessary complexity or redundancy
  - **Scalability**: Prompt can handle increased complexity

- **Compliance**:
  - **Constitutional**: Follows NeonPro constitutional principles
  - **Healthcare**: Meets healthcare regulatory requirements
  - **Technical**: Follows technical standards and best practices

## Enhancement Patterns

- **Layered Reasoning**:
  - **Input Layer**: Validate and preprocess inputs
  - **Logic Layer**: Execute core reasoning and processing
  - **Output Layer**: Validate and format outputs
  - **Error Layer**: Handle errors and edge cases gracefully

- **Validation Gates**:
  - **Gate 0 - Input**: Validate input format and completeness
  - **Gate 1 - Environment**: Check environment and dependencies
  - **Gate 2 - Execution**: Monitor execution progress and resource usage
  - **Gate 3 - Output**: Validate output quality and compliance
  - **Gate 4 - Cleanup**: Ensure proper cleanup and resource release

- **Constitutional Integration**:
  - **Simplicity Gate**: Remove unnecessary complexity
  - **Testing Gate**: Ensure testable requirements and validation
  - **Compliance Gate**: Verify healthcare and regulatory compliance
  - **Architecture Gate**: Follow established patterns and standards

## Validation Gates

- **Pre-Enhancement**:
  - **Input Validation**: Original prompt is complete and understandable (Critical)
  - **Requirements Analysis**: All requirements identified and categorized (Critical)

- **Post-Enhancement**:
  - **Quality Assessment**: Enhanced prompt meets all quality criteria (Critical)
  - **Compliance Validation**: Enhanced prompt passes all compliance checks (Critical)
  - **Performance Validation**: Enhanced prompt is efficient and maintainable (Optional)

## Error Handling

- **Invalid Input**:
  - **Detection**: Original prompt is incomplete or malformed
  - **Action**: Reject with specific error details and improvement suggestions

- **Enhancement Failure**:
  - **Detection**: Unable to apply enhancement patterns effectively
  - **Action**: Provide partial enhancement with explanation of limitations

- **Validation Failure**:
  - **Detection**: Enhanced prompt fails quality or compliance checks
  - **Action**: Provide detailed failure report with specific improvement recommendations

## Success Criteria

- **Enhancement Quality**: Prompt is significantly improved in clarity, structure, and effectiveness
- **Validation Comprehensive**: All validation gates pass with appropriate checks
- **Compliance Complete**: Enhanced prompt meets all constitutional and regulatory requirements
- **Documentation Adequate**: Enhanced prompt is well-documented with usage guidance
- **Maintainability Achieved**: Enhanced prompt is easy to understand, modify, and extend

## Constitutional Compliance

- **KISS/YAGNI**: Enhanced prompt is simple and necessary, no over-engineering
- **Test-First**: All requirements have corresponding test definitions and validation
- **Architecture**: Enhanced prompt follows established patterns and boundaries
- **Healthcare**: LGPD/ANVISA/CFM compliance integrated into all requirements
- **Observability**: Enhanced prompt includes monitoring and logging requirements

## Integration Points

- **Archon**: Potential integration for prompt persistence and knowledge management
- **Serena**: Code analysis and validation for prompt quality and compliance
- **Desktop Commander**: File system operations for prompt documentation and management
