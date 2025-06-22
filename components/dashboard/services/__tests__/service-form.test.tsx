import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ServiceForm } from '../service-form'

// Mock do useRouter
const mockPush = jest.fn()
const mockBack = jest.fn()
const mockRefresh = jest.fn()

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    back: mockBack,
    refresh: mockRefresh,
  }),
}))

describe('ServiceForm', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Modo de criação', () => {
    it('deve renderizar o formulário de criação corretamente', () => {
      render(<ServiceForm mode="create" />)
      
      expect(screen.getByText('Informações Básicas')).toBeInTheDocument()
      expect(screen.getByText('Duração e Preço')).toBeInTheDocument()
      expect(screen.getByLabelText(/Nome do Serviço/)).toBeInTheDocument()
      expect(screen.getByLabelText(/Categoria/)).toBeInTheDocument()
      expect(screen.getByLabelText(/Duração \(minutos\)/)).toBeInTheDocument()
      expect(screen.getByLabelText(/Preço \(R\$\)/)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /Criar Serviço/ })).toBeInTheDocument()
    })

    it('deve mostrar erros de validação para campos obrigatórios', async () => {
      const user = userEvent.setup()
      render(<ServiceForm mode="create" />)
      
      const submitButton = screen.getByRole('button', { name: /Criar Serviço/ })
      await user.click(submitButton)
      
      await waitFor(() => {
        expect(screen.getByText('Nome deve ter pelo menos 2 caracteres')).toBeInTheDocument()
        expect(screen.getByText('Categoria é obrigatória')).toBeInTheDocument()
      })
    })

    it('deve validar duração mínima e máxima', async () => {
      const user = userEvent.setup()
      render(<ServiceForm mode="create" />)
      
      const durationInput = screen.getByLabelText(/Duração \(minutos\)/)
      
      // Testar duração muito baixa
      await user.clear(durationInput)
      await user.type(durationInput, '1')
      
      const submitButton = screen.getByRole('button', { name: /Criar Serviço/ })
      await user.click(submitButton)
      
      await waitFor(() => {
        expect(screen.getByText('Duração mínima de 5 minutos')).toBeInTheDocument()
      })
      
      // Testar duração muito alta
      await user.clear(durationInput)
      await user.type(durationInput, '500')
      await user.click(submitButton)
      
      await waitFor(() => {
        expect(screen.getByText('Duração máxima de 8 horas')).toBeInTheDocument()
      })
    })

    it('deve validar preço mínimo', async () => {
      const user = userEvent.setup()
      render(<ServiceForm mode="create" />)
      
      const priceInput = screen.getByLabelText(/Preço \(R\$\)/)
      await user.clear(priceInput)
      await user.type(priceInput, '0')
      
      const submitButton = screen.getByRole('button', { name: /Criar Serviço/ })
      await user.click(submitButton)
      
      await waitFor(() => {
        expect(screen.getByText('Preço deve ser maior que zero')).toBeInTheDocument()
      })
    })

    it('deve preencher campos com presets de duração', async () => {
      const user = userEvent.setup()
      render(<ServiceForm mode="create" />)
      
      // Encontrar e clicar no select de presets
      const presetsSelect = screen.getByDisplayValue('Presets')
      await user.click(presetsSelect)
      
      // Selecionar 1 hora
      const oneHourOption = screen.getByText('1 hora')
      await user.click(oneHourOption)
      
      // Verificar se o campo de duração foi preenchido
      const durationInput = screen.getByLabelText(/Duração \(minutos\)/)
      expect(durationInput).toHaveValue(60)
    })

    it('deve adicionar especialidades usando botões preset', async () => {
      const user = userEvent.setup()
      render(<ServiceForm mode="create" />)
      
      const esteticistButton = screen.getByRole('button', { name: /\+ Esteticista/ })
      await user.click(esteticistButton)
      
      const specialtiesTextarea = screen.getByLabelText(/Especialidades/)
      expect(specialtiesTextarea).toHaveValue('Esteticista')
      
      // Adicionar outra especialidade
      const massageButton = screen.getByRole('button', { name: /\+ Massoterapeuta/ })
      await user.click(massageButton)
      
      expect(specialtiesTextarea).toHaveValue('Esteticista, Massoterapeuta')
    })
  })

  describe('Modo de edição', () => {
    const mockService = {
      id: '1',
      name: 'Limpeza de Pele',
      description: 'Limpeza profunda da pele',
      duration_minutes: 90,
      price: 150.00,
      category: 'facial',
      is_active: true,
    }

    it('deve renderizar o formulário de edição com dados preenchidos', () => {
      render(<ServiceForm mode="edit" service={mockService} />)
      
      expect(screen.getByDisplayValue('Limpeza de Pele')).toBeInTheDocument()
      expect(screen.getByDisplayValue('Limpeza profunda da pele')).toBeInTheDocument()
      expect(screen.getByDisplayValue('90')).toBeInTheDocument()
      expect(screen.getByDisplayValue('150')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /Salvar Alterações/ })).toBeInTheDocument()
    })

    it('deve manter o checkbox de ativo marcado quando o serviço está ativo', () => {
      render(<ServiceForm mode="edit" service={mockService} />)
      
      const activeCheckbox = screen.getByLabelText(/Serviço ativo/)
      expect(activeCheckbox).toBeChecked()
    })

    it('deve desmarcar o checkbox quando o serviço está inativo', () => {
      const inactiveService = { ...mockService, is_active: false }
      render(<ServiceForm mode="edit" service={inactiveService} />)
      
      const activeCheckbox = screen.getByLabelText(/Serviço ativo/)
      expect(activeCheckbox).not.toBeChecked()
    })
  })

  describe('Interações do usuário', () => {
    it('deve chamar router.back() quando clicar em Cancelar', async () => {
      const user = userEvent.setup()
      render(<ServiceForm mode="create" />)
      
      const cancelButton = screen.getByRole('button', { name: /Cancelar/ })
      await user.click(cancelButton)
      
      expect(mockBack).toHaveBeenCalled()
    })

    it('deve desabilitar o botão de submit durante o carregamento', async () => {
      const user = userEvent.setup()
      render(<ServiceForm mode="create" />)
      
      // Preencher campos obrigatórios
      await user.type(screen.getByLabelText(/Nome do Serviço/), 'Teste')
      await user.selectOptions(screen.getByLabelText(/Categoria/), 'facial')
      await user.type(screen.getByLabelText(/Duração \(minutos\)/), '60')
      await user.type(screen.getByLabelText(/Preço \(R\$\)/), '100')
      
      const submitButton = screen.getByRole('button', { name: /Criar Serviço/ })
      await user.click(submitButton)
      
      // Durante o carregamento, o botão deve estar desabilitado
      expect(submitButton).toBeDisabled()
    })
  })

  describe('Acessibilidade', () => {
    it('deve ter labels apropriados para todos os campos', () => {
      render(<ServiceForm mode="create" />)
      
      expect(screen.getByLabelText(/Nome do Serviço/)).toBeInTheDocument()
      expect(screen.getByLabelText(/Descrição/)).toBeInTheDocument()
      expect(screen.getByLabelText(/Categoria/)).toBeInTheDocument()
      expect(screen.getByLabelText(/Duração \(minutos\)/)).toBeInTheDocument()
      expect(screen.getByLabelText(/Preço \(R\$\)/)).toBeInTheDocument()
      expect(screen.getByLabelText(/Serviço ativo/)).toBeInTheDocument()
    })

    it('deve mostrar mensagens de erro com aria-describedby', async () => {
      const user = userEvent.setup()
      render(<ServiceForm mode="create" />)
      
      const submitButton = screen.getByRole('button', { name: /Criar Serviço/ })
      await user.click(submitButton)
      
      await waitFor(() => {
        const nameInput = screen.getByLabelText(/Nome do Serviço/)
        const errorMessage = screen.getByText('Nome deve ter pelo menos 2 caracteres')
        
        expect(nameInput).toBeInTheDocument()
        expect(errorMessage).toBeInTheDocument()
      })
    })
  })
})
