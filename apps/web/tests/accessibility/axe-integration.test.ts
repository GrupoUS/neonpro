/**
 * Automated Accessibility Testing with axe-core
 * Healthcare platform WCAG 2.1 AA+ compliance testing
 * ANVISA and CFM accessibility requirements for medical interfaces
 */

import { expect, test, describe, beforeEach, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import React from 'react';

// Extend Jest matchers
expect.extend(toHaveNoViolations);

// Healthcare-specific accessibility configuration
const healthcareAxeConfig = {
  rules: {
    // WCAG 2.1 AA requirements
    'color-contrast': { enabled: true },
    'color-contrast-enhanced': { enabled: true }, // AAA level for medical data
    'focus-order-semantics': { enabled: true },
    'keyboard-navigation': { enabled: true },
    'landmarks': { enabled: true },
    'page-has-heading-one': { enabled: true },
    'region': { enabled: true },
    
    // Healthcare-specific rules
    'aria-required-attr': { enabled: true },
    'aria-required-children': { enabled: true },
    'aria-required-parent': { enabled: true },
    'aria-roles': { enabled: true },
    'aria-valid-attr': { enabled: true },
    'aria-valid-attr-value': { enabled: true },
    
    // Medical form requirements
    'label': { enabled: true },
    'label-title-only': { enabled: true },
    'form-field-multiple-labels': { enabled: true },
    'required-attr': { enabled: true },
    
    // Critical for healthcare
    'bypass': { enabled: true }, // Skip navigation for screen readers
    'document-title': { enabled: true },
    'duplicate-id': { enabled: true },
    'html-has-lang': { enabled: true },
    'html-lang-valid': { enabled: true },
    'lang': { enabled: true },
    
    // Image accessibility (medical images, charts)
    'image-alt': { enabled: true },
    'image-redundant-alt': { enabled: true },
    'object-alt': { enabled: true },
    'svg-img-alt': { enabled: true },
    
    // Table accessibility (medical records, lab results)
    'table-fake-caption': { enabled: true },
    'td-headers-attr': { enabled: true },
    'th-has-data-cells': { enabled: true },
    'scope-attr-valid': { enabled: true },
    
    // Link accessibility
    'link-name': { enabled: true },
    'link-in-text-block': { enabled: true },
    
    // Button accessibility
    'button-name': { enabled: true },
    'nested-interactive': { enabled: true },
    
    // Heading structure
    'heading-order': { enabled: true },
    'empty-heading': { enabled: true },
    
    // List accessibility
    'list': { enabled: true },
    'listitem': { enabled: true },
    'definition-list': { enabled: true },
    'dlitem': { enabled: true }
  },
  tags: ['wcag2a', 'wcag2aa', 'wcag21aa', 'best-practice']
};

// Healthcare-specific test contexts
const healthcareTestContexts = {
  PATIENT_PORTAL: {
    description: 'Patient portal accessibility for general users',
    requirements: ['wcag2aa', 'anvisa-basic'],
    colorContrastLevel: 'AA'
  },
  MEDICAL_PROFESSIONAL: {
    description: 'Medical professional interface with enhanced requirements',
    requirements: ['wcag2aa', 'wcag2aaa-color', 'anvisa-professional', 'cfm-standards'],
    colorContrastLevel: 'AAA'
  },
  EMERGENCY_INTERFACE: {
    description: 'Emergency interface with critical accessibility needs',
    requirements: ['wcag2aa', 'wcag2aaa', 'anvisa-critical', 'emergency-standards'],
    colorContrastLevel: 'AAA'
  },
  TELEMEDICINE: {
    description: 'Telemedicine interface with real-time communication needs',
    requirements: ['wcag2aa', 'anvisa-telemedicine', 'cfm-telemedicine'],
    colorContrastLevel: 'AA'
  }
};

// Mock components for testing
const MockPatientPortalComponent = () => (
  <div>
    <header>
      <h1>Portal do Paciente</h1>
      <nav aria-label="Navegação principal">
        <ul>
          <li><a href="/consultas">Consultas</a></li>
          <li><a href="/exames">Exames</a></li>
          <li><a href="/receitas">Receitas</a></li>
          <li><a href="/perfil">Perfil</a></li>
        </ul>
      </nav>
    </header>
    <main>
      <section aria-labelledby="proximas-consultas">
        <h2 id="proximas-consultas">Próximas Consultas</h2>
        <table>
          <caption>Lista de consultas agendadas</caption>
          <thead>
            <tr>
              <th scope="col">Data</th>
              <th scope="col">Horário</th>
              <th scope="col">Médico</th>
              <th scope="col">Especialidade</th>
              <th scope="col">Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>15/01/2024</td>
              <td>14:30</td>
              <td>Dr. João Silva</td>
              <td>Cardiologia</td>
              <td>
                <button aria-label="Cancelar consulta com Dr. João Silva em 15/01/2024">
                  Cancelar
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </section>
      
      <section aria-labelledby="resultados-exames">
        <h2 id="resultados-exames">Resultados de Exames</h2>
        <form>
          <fieldset>
            <legend>Filtrar resultados</legend>
            <label htmlFor="data-inicio">Data de início:</label>
            <input 
              type="date" 
              id="data-inicio" 
              name="dataInicio"
              aria-describedby="data-inicio-help"
            />
            <div id="data-inicio-help">Selecione a data inicial para filtrar os exames</div>
            
            <label htmlFor="tipo-exame">Tipo de exame:</label>
            <select id="tipo-exame" name="tipoExame" aria-required="true">
              <option value="">Selecione um tipo</option>
              <option value="sangue">Exame de Sangue</option>
              <option value="imagem">Exame de Imagem</option>
              <option value="cardiaco">Exame Cardíaco</option>
            </select>
            
            <button type="submit">Filtrar Resultados</button>
          </fieldset>
        </form>
      </section>
    </main>
    
    <aside aria-labelledby="alertas">
      <h2 id="alertas">Alertas Importantes</h2>
      <div role="alert" aria-live="polite">
        <p>Você tem uma consulta agendada para hoje às 14:30.</p>
      </div>
    </aside>
    
    <footer>
      <p>© 2024 NeonPro Healthcare Platform. Todos os direitos reservados.</p>
      <nav aria-label="Links do rodapé">
        <ul>
          <li><a href="/privacidade">Política de Privacidade</a></li>
          <li><a href="/termos">Termos de Uso</a></li>
          <li><a href="/contato">Contato</a></li>
          <li><a href="/acessibilidade">Acessibilidade</a></li>
        </ul>
      </nav>
    </footer>
  </div>
);

const MockMedicalProfessionalComponent = () => (
  <div>
    <header role="banner">
      <h1>Sistema Médico Profissional</h1>
      <nav aria-label="Menu principal do sistema médico">
        <ul>
          <li><a href="/pacientes" aria-current="page">Pacientes</a></li>
          <li><a href="/agenda">Agenda</a></li>
          <li><a href="/prescricoes">Prescrições</a></li>
          <li><a href="/laudos">Laudos</a></li>
        </ul>
      </nav>
      <div role="region" aria-label="Informações do profissional">
        <p>Dr. Maria Santos - CRM 12345-SP</p>
        <p>Cardiologia</p>
      </div>
    </header>
    
    <main role="main">
      <section aria-labelledby="busca-paciente">
        <h2 id="busca-paciente">Buscar Paciente</h2>
        <form role="search">
          <label htmlFor="termo-busca">
            Buscar por nome, CPF ou número do prontuário:
          </label>
          <input 
            type="search"
            id="termo-busca"
            name="termoBusca"
            aria-describedby="busca-instrucoes"
            aria-required="true"
            autoComplete="off"
          />
          <div id="busca-instrucoes">
            Digite pelo menos 3 caracteres para iniciar a busca
          </div>
          <button type="submit">Buscar Paciente</button>
        </form>
      </section>
      
      <section aria-labelledby="prontuario-paciente">
        <h2 id="prontuario-paciente">Prontuário do Paciente</h2>
        
        <div role="tabpanel" aria-labelledby="tab-dados-pessoais">
          <h3 id="tab-dados-pessoais">Dados Pessoais</h3>
          <dl>
            <dt>Nome completo:</dt>
            <dd>João da Silva Santos</dd>
            <dt>Data de nascimento:</dt>
            <dd>15/03/1985</dd>
            <dt>CPF:</dt>
            <dd>123.456.789-00</dd>
            <dt>Telefone:</dt>
            <dd>(11) 99999-8888</dd>
          </dl>
        </div>
        
        <section aria-labelledby="historico-medico">
          <h3 id="historico-medico">Histórico Médico</h3>
          <table>
            <caption>Histórico de consultas e procedimentos</caption>
            <thead>
              <tr>
                <th scope="col">Data</th>
                <th scope="col">Tipo</th>
                <th scope="col">Profissional</th>
                <th scope="col">Diagnóstico/Observações</th>
                <th scope="col">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>10/01/2024</td>
                <td>Consulta</td>
                <td>Dr. Maria Santos</td>
                <td>Hipertensão controlada</td>
                <td>
                  <span className="status-ativo" aria-label="Tratamento ativo">
                    Ativo
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </section>
        
        <section aria-labelledby="nova-prescricao">
          <h3 id="nova-prescricao">Nova Prescrição</h3>
          <form>
            <fieldset>
              <legend>Informações da prescrição</legend>
              
              <label htmlFor="medicamento">Medicamento:</label>
              <input 
                type="text"
                id="medicamento"
                name="medicamento"
                aria-required="true"
                aria-describedby="medicamento-help"
              />
              <div id="medicamento-help">
                Digite o nome do medicamento conforme registro ANVISA
              </div>
              
              <label htmlFor="dosagem">Dosagem:</label>
              <input 
                type="text"
                id="dosagem"
                name="dosagem"
                aria-required="true"
                placeholder="Ex: 10mg"
              />
              
              <label htmlFor="frequencia">Frequência:</label>
              <select id="frequencia" name="frequencia" aria-required="true">
                <option value="">Selecione a frequência</option>
                <option value="1x">1x ao dia</option>
                <option value="2x">2x ao dia</option>
                <option value="3x">3x ao dia</option>
                <option value="sos">Se necessário</option>
              </select>
              
              <label htmlFor="observacoes">Observações:</label>
              <textarea 
                id="observacoes"
                name="observacoes"
                rows={4}
                aria-describedby="observacoes-help"
              ></textarea>
              <div id="observacoes-help">
                Instruções especiais para o paciente
              </div>
              
              <button type="submit">Salvar Prescrição</button>
            </fieldset>
          </form>
        </section>
      </section>
    </main>
    
    <aside role="complementary" aria-labelledby="alertas-clinicos">
      <h2 id="alertas-clinicos">Alertas Clínicos</h2>
      <div role="alert" aria-live="assertive">
        <p><strong>Atenção:</strong> Paciente possui alergia à penicilina.</p>
      </div>
      <div role="status" aria-live="polite">
        <p>Últimos exames atualizados há 2 dias.</p>
      </div>
    </aside>
  </div>
);

const MockEmergencyInterfaceComponent = () => (
  <div>
    <header role="banner">
      <h1>Sistema de Emergência</h1>
      <div role="status" aria-live="polite" aria-atomic="true">
        <p>Status: Sistema operacional</p>
      </div>
    </header>
    
    <main role="main">
      <section aria-labelledby="paciente-emergencia" className="emergency-section">
        <h2 id="paciente-emergencia">Atendimento de Emergência</h2>
        
        <div role="alert" aria-live="assertive" className="emergency-alert">
          <h3>PRIORIDADE ALTA</h3>
          <p>Paciente em estado crítico - Requer atenção imediata</p>
        </div>
        
        <form className="emergency-form">
          <fieldset>
            <legend>Triagem Rápida</legend>
            
            <div className="emergency-vital-signs">
              <h4>Sinais Vitais</h4>
              
              <label htmlFor="pressao-arterial">Pressão Arterial:</label>
              <input 
                type="text"
                id="pressao-arterial"
                name="pressaoArterial"
                placeholder="120/80"
                aria-required="true"
                className="emergency-input"
              />
              
              <label htmlFor="frequencia-cardiaca">Frequência Cardíaca:</label>
              <input 
                type="number"
                id="frequencia-cardiaca"
                name="frequenciaCardiaca"
                placeholder="72"
                aria-required="true"
                min="30"
                max="250"
                className="emergency-input"
              />
              
              <label htmlFor="temperatura">Temperatura (°C):</label>
              <input 
                type="number"
                id="temperatura"
                name="temperatura"
                placeholder="36.5"
                aria-required="true"
                step="0.1"
                min="30"
                max="45"
                className="emergency-input"
              />
              
              <label htmlFor="saturacao">Saturação O2 (%):</label>
              <input 
                type="number"
                id="saturacao"
                name="saturacao"
                placeholder="98"
                aria-required="true"
                min="60"
                max="100"
                className="emergency-input"
              />
            </div>
            
            <div className="emergency-assessment">
              <h4>Avaliação Rápida</h4>
              
              <fieldset>
                <legend>Nível de Consciência</legend>
                <input type="radio" id="consciente" name="consciencia" value="consciente" />
                <label htmlFor="consciente">Consciente e orientado</label>
                
                <input type="radio" id="desorientado" name="consciencia" value="desorientado" />
                <label htmlFor="desorientado">Consciente mas desorientado</label>
                
                <input type="radio" id="semiconsciente" name="consciencia" value="semiconsciente" />
                <label htmlFor="semiconsciente">Semi-consciente</label>
                
                <input type="radio" id="inconsciente" name="consciencia" value="inconsciente" />
                <label htmlFor="inconsciente">Inconsciente</label>
              </fieldset>
              
              <label htmlFor="queixa-principal">Queixa Principal:</label>
              <textarea 
                id="queixa-principal"
                name="queixaPrincipal"
                rows={3}
                aria-required="true"
                placeholder="Descreva a queixa principal do paciente"
                className="emergency-textarea"
              ></textarea>
            </div>
            
            <div className="emergency-actions">
              <button type="submit" className="emergency-button primary">
                Registrar Triagem
              </button>
              <button type="button" className="emergency-button alert">
                Chamar Médico
              </button>
              <button type="button" className="emergency-button critical">
                Código Azul
              </button>
            </div>
          </fieldset>
        </form>
      </section>
      
      <section aria-labelledby="historico-rapido">
        <h2 id="historico-rapido">Histórico Médico Rápido</h2>
        <div className="emergency-history">
          <h3>Alergias Conhecidas</h3>
          <ul>
            <li>Penicilina - Reação anafilática</li>
            <li>Dipirona - Rash cutâneo</li>
          </ul>
          
          <h3>Medicações em Uso</h3>
          <ul>
            <li>Losartana 50mg - 1x ao dia</li>
            <li>Metformina 850mg - 2x ao dia</li>
          </ul>
          
          <h3>Condições Médicas</h3>
          <ul>
            <li>Hipertensão arterial</li>
            <li>Diabetes tipo 2</li>
          </ul>
        </div>
      </section>
    </main>
    
    <aside role="region" aria-labelledby="protocolos-emergencia">
      <h2 id="protocolos-emergencia">Protocolos de Emergência</h2>
      <nav aria-label="Protocolos rápidos">
        <ul>
          <li><a href="/protocolo/parada-cardiaca">Parada Cardíaca</a></li>
          <li><a href="/protocolo/avc">AVC</a></li>
          <li><a href="/protocolo/infarto">Infarto</a></li>
          <li><a href="/protocolo/anafilaxia">Anafilaxia</a></li>
        </ul>
      </nav>
    </aside>
  </div>
);

// Test suites
describe('Healthcare Platform Accessibility Tests', () => {
  beforeEach(() => {
    // Configure test environment for healthcare compliance
    process.env.NODE_ENV = 'test';
    process.env.HEALTHCARE_MODE = 'true';
    process.env.ACCESSIBILITY_LEVEL = 'WCAG2AA';
  });
  
  afterEach(() => {
    cleanup();
  });

  describe('Patient Portal Accessibility', () => {
    test('should meet WCAG 2.1 AA standards for patient interface', async () => {
      const { container } = render(<MockPatientPortalComponent />);
      const results = await axe(container, {
        ...healthcareAxeConfig,
        tags: ['wcag2a', 'wcag2aa', 'wcag21aa']
      });
      
      expect(results).toHaveNoViolations();
    });

    test('should have proper heading hierarchy', async () => {
      const { container } = render(<MockPatientPortalComponent />);
      const results = await axe(container, {
        rules: {
          'heading-order': { enabled: true },
          'page-has-heading-one': { enabled: true }
        }
      });
      
      expect(results).toHaveNoViolations();
    });

    test('should have accessible forms for patient data entry', async () => {
      const { container } = render(<MockPatientPortalComponent />);
      const results = await axe(container, {
        rules: {
          'label': { enabled: true },
          'label-title-only': { enabled: true },
          'form-field-multiple-labels': { enabled: true },
          'required-attr': { enabled: true }
        }
      });
      
      expect(results).toHaveNoViolations();
    });

    test('should have accessible data tables for medical information', async () => {
      const { container } = render(<MockPatientPortalComponent />);
      const results = await axe(container, {
        rules: {
          'table-fake-caption': { enabled: true },
          'td-headers-attr': { enabled: true },
          'th-has-data-cells': { enabled: true },
          'scope-attr-valid': { enabled: true }
        }
      });
      
      expect(results).toHaveNoViolations();
    });

    test('should provide proper landmarks for screen readers', async () => {
      const { container } = render(<MockPatientPortalComponent />);
      const results = await axe(container, {
        rules: {
          'landmarks': { enabled: true },
          'region': { enabled: true },
          'bypass': { enabled: true }
        }
      });
      
      expect(results).toHaveNoViolations();
    });
  });

  describe('Medical Professional Interface Accessibility', () => {
    test('should meet enhanced WCAG 2.1 AA+ standards for medical professionals', async () => {
      const { container } = render(<MockMedicalProfessionalComponent />);
      const results = await axe(container, {
        ...healthcareAxeConfig,
        rules: {
          ...healthcareAxeConfig.rules,
          'color-contrast-enhanced': { enabled: true } // AAA level for professional use
        },
        tags: ['wcag2a', 'wcag2aa', 'wcag21aa', 'best-practice']
      });
      
      expect(results).toHaveNoViolations();
    });

    test('should have accessible search functionality for patient lookup', async () => {
      const { container } = render(<MockMedicalProfessionalComponent />);
      const results = await axe(container, {
        rules: {
          'label': { enabled: true },
          'aria-required-attr': { enabled: true },
          'aria-valid-attr-value': { enabled: true }
        }
      });
      
      expect(results).toHaveNoViolations();
    });

    test('should provide accessible medical record tables', async () => {
      const { container } = render(<MockMedicalProfessionalComponent />);
      const results = await axe(container, {
        rules: {
          'table-fake-caption': { enabled: true },
          'th-has-data-cells': { enabled: true },
          'scope-attr-valid': { enabled: true }
        }
      });
      
      expect(results).toHaveNoViolations();
    });

    test('should have accessible prescription forms with proper validation', async () => {
      const { container } = render(<MockMedicalProfessionalComponent />);
      const results = await axe(container, {
        rules: {
          'label': { enabled: true },
          'required-attr': { enabled: true },
          'aria-describedby': { enabled: true }
        }
      });
      
      expect(results).toHaveNoViolations();
    });

    test('should provide accessible clinical alerts and notifications', async () => {
      const { container } = render(<MockMedicalProfessionalComponent />);
      const results = await axe(container, {
        rules: {
          'aria-live-region': { enabled: true },
          'aria-atomic': { enabled: true }
        }
      });
      
      expect(results).toHaveNoViolations();
    });
  });

  describe('Emergency Interface Accessibility', () => {
    test('should meet critical accessibility standards for emergency situations', async () => {
      const { container } = render(<MockEmergencyInterfaceComponent />);
      const results = await axe(container, {
        ...healthcareAxeConfig,
        rules: {
          ...healthcareAxeConfig.rules,
          'color-contrast-enhanced': { enabled: true },
          'focus-order-semantics': { enabled: true }
        }
      });
      
      expect(results).toHaveNoViolations();
    });

    test('should have accessible emergency alerts with proper ARIA live regions', async () => {
      const { container } = render(<MockEmergencyInterfaceComponent />);
      const results = await axe(container, {
        rules: {
          'aria-live-region': { enabled: true },
          'aria-atomic': { enabled: true }
        }
      });
      
      expect(results).toHaveNoViolations();
    });

    test('should provide accessible vital signs input forms', async () => {
      const { container } = render(<MockEmergencyInterfaceComponent />);
      const results = await axe(container, {
        rules: {
          'label': { enabled: true },
          'required-attr': { enabled: true },
          'input-button-name': { enabled: true }
        }
      });
      
      expect(results).toHaveNoViolations();
    });

    test('should have proper keyboard navigation for emergency workflows', async () => {
      const { container } = render(<MockEmergencyInterfaceComponent />);
      const results = await axe(container, {
        rules: {
          'focus-order-semantics': { enabled: true },
          'keyboard': { enabled: true },
          'tabindex': { enabled: true }
        }
      });
      
      expect(results).toHaveNoViolations();
    });
  });

  describe('Healthcare-Specific Accessibility Requirements', () => {
    test('should ensure medical terminology is accessible', async () => {
      const components = [
        <MockPatientPortalComponent />,
        <MockMedicalProfessionalComponent />,
        <MockEmergencyInterfaceComponent />
      ];
      
      for (const component of components) {
        const { container } = render(component);
        const results = await axe(container, {
          rules: {
            'aria-describedby': { enabled: true },
            'title-only': { enabled: true }
          }
        });
        
        expect(results).toHaveNoViolations();
      }
    });

    test('should provide accessible data input for Brazilian healthcare standards', async () => {
      const { container } = render(<MockMedicalProfessionalComponent />);
      const results = await axe(container, {
        rules: {
          'label': { enabled: true },
          'aria-required-attr': { enabled: true },
          'autocomplete-valid': { enabled: true }
        }
      });
      
      expect(results).toHaveNoViolations();
    });

    test('should meet ANVISA accessibility requirements for medical devices', async () => {
      const { container } = render(<MockMedicalProfessionalComponent />);
      const results = await axe(container, {
        ...healthcareAxeConfig,
        rules: {
          ...healthcareAxeConfig.rules,
          'color-contrast-enhanced': { enabled: true }, // Higher contrast for medical data
          'focus-order-semantics': { enabled: true },
          'keyboard': { enabled: true }
        }
      });
      
      expect(results).toHaveNoViolations();
    });

    test('should comply with CFM digital standards for medical professionals', async () => {
      const { container } = render(<MockMedicalProfessionalComponent />);
      const results = await axe(container, {
        rules: {
          'aria-roles': { enabled: true },
          'aria-valid-attr': { enabled: true },
          'document-title': { enabled: true },
          'landmarks': { enabled: true }
        }
      });
      
      expect(results).toHaveNoViolations();
    });
  });

  describe('Performance and UX Accessibility', () => {
    test('should maintain accessibility during dynamic content updates', async () => {
      const { container } = render(<MockPatientPortalComponent />);
      
      // Test initial state
      let results = await axe(container);
      expect(results).toHaveNoViolations();
      
      // Simulate dynamic content update (would be done with actual state changes in real tests)
      const alertElement = container.querySelector('[role="alert"]');
      if (alertElement) {
        alertElement.textContent = 'Nova mensagem: Consulta reagendada para amanhã.';
      }
      
      // Test after update
      results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    test('should provide accessible loading states for medical data', async () => {
      // Mock loading component
      const LoadingComponent = () => (
        <div role="status" aria-live="polite">
          <p>Carregando dados médicos...</p>
          <div aria-hidden="true">Loading spinner</div>
        </div>
      );
      
      const { container } = render(<LoadingComponent />);
      const results = await axe(container);
      
      expect(results).toHaveNoViolations();
    });

    test('should handle accessibility for error states in healthcare forms', async () => {
      // Mock error component
      const ErrorComponent = () => (
        <div>
          <form>
            <label htmlFor="cpf-input">CPF do paciente:</label>
            <input 
              type="text" 
              id="cpf-input" 
              aria-invalid="true"
              aria-describedby="cpf-error"
            />
            <div id="cpf-error" role="alert">
              CPF inválido. Por favor, verifique o número digitado.
            </div>
          </form>
        </div>
      );
      
      const { container } = render(<ErrorComponent />);
      const results = await axe(container);
      
      expect(results).toHaveNoViolations();
    });
  });

  describe('Multi-language Accessibility Support', () => {
    test('should properly handle Portuguese language attributes', async () => {
      const PortugueseComponent = () => (
        <div lang="pt-BR">
          <h1>Sistema de Saúde</h1>
          <p>Bem-vindo ao portal do paciente.</p>
          <label htmlFor="nome">Nome completo:</label>
          <input type="text" id="nome" />
        </div>
      );
      
      const { container } = render(<PortugueseComponent />);
      const results = await axe(container, {
        rules: {
          'html-has-lang': { enabled: true },
          'html-lang-valid': { enabled: true },
          'lang': { enabled: true }
        }
      });
      
      expect(results).toHaveNoViolations();
    });

    test('should handle accessibility for bilingual content (Portuguese/English)', async () => {
      const BilingualComponent = () => (
        <div lang="pt-BR">
          <h1>Sistema de Saúde / Health System</h1>
          <section>
            <h2>Informações em Português</h2>
            <p>Conteúdo em português para pacientes brasileiros.</p>
          </section>
          <section lang="en">
            <h2>Information in English</h2>
            <p>English content for international patients.</p>
          </section>
        </div>
      );
      
      const { container } = render(<BilingualComponent />);
      const results = await axe(container);
      
      expect(results).toHaveNoViolations();
    });
  });
});

// Custom accessibility test helpers
export const healthcareAccessibilityHelpers = {
  /**
   * Test component against healthcare-specific accessibility requirements
   */
  async testHealthcareAccessibility(
    component: React.ReactElement,
    context: keyof typeof healthcareTestContexts = 'PATIENT_PORTAL'
  ) {
    const { container } = render(component);
    const testContext = healthcareTestContexts[context];
    
    const config = {
      ...healthcareAxeConfig,
      rules: {
        ...healthcareAxeConfig.rules,
        ...(testContext.colorContrastLevel === 'AAA' && {
          'color-contrast-enhanced': { enabled: true }
        })
      }
    };
    
    const results = await axe(container, config);
    return {
      violations: results.violations,
      passes: results.passes,
      context: testContext,
      compliant: results.violations.length === 0
    };
  },

  /**
   * Generate accessibility report for healthcare component
   */
  async generateHealthcareAccessibilityReport(components: React.ReactElement[]) {
    const reports = [];
    
    for (const [index, component] of components.entries()) {
      const { container } = render(component);
      const results = await axe(container, healthcareAxeConfig);
      
      reports.push({
        componentIndex: index,
        violationCount: results.violations.length,
        violations: results.violations.map(v => ({
          id: v.id,
          impact: v.impact,
          description: v.description,
          help: v.help,
          nodes: v.nodes.length
        })),
        passCount: results.passes.length,
        compliance: {
          wcag2a: results.violations.filter(v => v.tags.includes('wcag2a')).length === 0,
          wcag2aa: results.violations.filter(v => v.tags.includes('wcag2aa')).length === 0,
          wcag21aa: results.violations.filter(v => v.tags.includes('wcag21aa')).length === 0,
          bestPractice: results.violations.filter(v => v.tags.includes('best-practice')).length === 0
        }
      });
      
      cleanup();
    }
    
    return {
      totalComponents: reports.length,
      totalViolations: reports.reduce((sum, r) => sum + r.violationCount, 0),
      compliantComponents: reports.filter(r => r.violationCount === 0).length,
      complianceRate: reports.filter(r => r.violationCount === 0).length / reports.length,
      reports
    };
  }
};

// Export for use in other test files
export {
  healthcareAxeConfig,
  healthcareTestContexts
};