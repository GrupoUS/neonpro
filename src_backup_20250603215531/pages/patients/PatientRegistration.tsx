import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { CalendarIcon, Save, ArrowLeft } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabaseClient' // Importar supabase

export default function PatientRegistration() {
  const [birthDate, setBirthDate] = useState<Date | undefined>() // Permitir undefined
  const navigate = useNavigate() // Para redirecionamento
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    // Dados Pessoais
    nome: '',
    cpf: '',
    rg: '',
    email: '',
    telefone: '',
    celular: '',
    profissao: '',
    estadoCivil: '',
    
    // Endereço
    cep: '',
    endereco: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    estado: '',
    
    // Informações Médicas
    alergias: '',
    medicamentos: '',
    cirurgiasAnteriores: '',
    problemasSaude: '',
    gravidez: false,
    amamentacao: false,
    
    // Contato de Emergência
    nomeEmergencia: '',
    telefoneEmergencia: '',
    parentesco: '',
    
    // Observações
    observacoes: ''
  })

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => { // Adicionar async
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const patientData = {
      nome: formData.nome,
      cpf: formData.cpf,
      rg: formData.rg || null,
      email: formData.email || null,
      telefone: formData.telefone || null,
      celular: formData.celular,
      data_nascimento: birthDate ? format(birthDate, "yyyy-MM-dd") : null,
      profissao: formData.profissao || null,
      estado_civil: formData.estadoCivil || null,
      endereco: {
        cep: formData.cep || null,
        logradouro: formData.endereco || null,
        numero: formData.numero || null,
        complemento: formData.complemento || null,
        bairro: formData.bairro || null,
        cidade: formData.cidade || null,
        estado: formData.estado || null,
      },
      informacoes_medicas: {
        alergias: formData.alergias || null,
        medicamentos_em_uso: formData.medicamentos || null,
        cirurgias_previas: formData.cirurgiasAnteriores || null,
        condicoes_preexistentes: formData.problemasSaude || null,
        gestante: formData.gravidez,
        lactante: formData.amamentacao,
      },
      contato_emergencia: {
        nome: formData.nomeEmergencia || null,
        telefone: formData.telefoneEmergencia || null,
        parentesco: formData.parentesco || null,
      },
      observacoes: formData.observacoes || null,
    }

    try {
      const { error: supabaseError } = await supabase
        .from('pacientes')
        .insert([patientData])

      if (supabaseError) {
        throw supabaseError
      }

      alert('Paciente cadastrado com sucesso!')
      // Resetar formulário (opcional, dependendo da UX desejada)
      // setFormData({ ...initialState }) 
      // setBirthDate(undefined)
      navigate('/pacientes/lista') // Redirecionar para lista de pacientes

    } catch (err) { // Alterar tipo do erro
      console.error('Erro ao cadastrar paciente:', err)
      if (err instanceof Error) {
        setError(err.message)
        alert(`Erro ao cadastrar paciente: ${err.message}`)
      } else {
        const unknownErrorMessage = 'Ocorreu um erro desconhecido ao salvar o paciente.'
        setError(unknownErrorMessage)
        alert(unknownErrorMessage)
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Cadastro de Paciente</h1>
          <p className="text-gray-600 mt-2">Registre um novo paciente no sistema</p>
        </div>
        <Link to="/pacientes/lista">
          <Button variant="outline" className="flex items-center space-x-2">
            <ArrowLeft className="h-4 w-4" />
            <span>Voltar à Lista</span>
          </Button>
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Dados Pessoais */}
        <Card>
          <CardHeader>
            <CardTitle>Dados Pessoais</CardTitle>
            <CardDescription>Informações básicas do paciente</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome Completo *</Label>
                <Input
                  id="nome"
                  value={formData.nome}
                  onChange={(e) => handleInputChange('nome', e.target.value)}
                  placeholder="Digite o nome completo"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="cpf">CPF *</Label>
                <Input
                  id="cpf"
                  value={formData.cpf}
                  onChange={(e) => handleInputChange('cpf', e.target.value)}
                  placeholder="000.000.000-00"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="rg">RG</Label>
                <Input
                  id="rg"
                  value={formData.rg}
                  onChange={(e) => handleInputChange('rg', e.target.value)}
                  placeholder="00.000.000-0"
                />
              </div>
              
              <div className="space-y-2">
                <Label>Data de Nascimento *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !birthDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {birthDate ? format(birthDate, "dd/MM/yyyy", { locale: ptBR }) : "Selecione a data"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={birthDate}
                      onSelect={setBirthDate}
                      initialFocus
                      locale={ptBR}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="email@exemplo.com"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="telefone">Telefone</Label>
                <Input
                  id="telefone"
                  value={formData.telefone}
                  onChange={(e) => handleInputChange('telefone', e.target.value)}
                  placeholder="(11) 3000-0000"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="celular">Celular *</Label>
                <Input
                  id="celular"
                  value={formData.celular}
                  onChange={(e) => handleInputChange('celular', e.target.value)}
                  placeholder="(11) 90000-0000"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="profissao">Profissão</Label>
                <Input
                  id="profissao"
                  value={formData.profissao}
                  onChange={(e) => handleInputChange('profissao', e.target.value)}
                  placeholder="Digite a profissão"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="estadoCivil">Estado Civil</Label>
                <Select onValueChange={(value) => handleInputChange('estadoCivil', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o estado civil" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="solteiro">Solteiro(a)</SelectItem>
                    <SelectItem value="casado">Casado(a)</SelectItem>
                    <SelectItem value="divorciado">Divorciado(a)</SelectItem>
                    <SelectItem value="viuvo">Viúvo(a)</SelectItem>
                    <SelectItem value="uniao-estavel">União Estável</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Endereço */}
        <Card>
          <CardHeader>
            <CardTitle>Endereço</CardTitle>
            <CardDescription>Informações de localização do paciente</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cep">CEP</Label>
                <Input
                  id="cep"
                  value={formData.cep}
                  onChange={(e) => handleInputChange('cep', e.target.value)}
                  placeholder="00000-000"
                />
              </div>
              
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="endereco">Endereço</Label>
                <Input
                  id="endereco"
                  value={formData.endereco}
                  onChange={(e) => handleInputChange('endereco', e.target.value)}
                  placeholder="Rua, Avenida, etc."
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="numero">Número</Label>
                <Input
                  id="numero"
                  value={formData.numero}
                  onChange={(e) => handleInputChange('numero', e.target.value)}
                  placeholder="123"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="complemento">Complemento</Label>
                <Input
                  id="complemento"
                  value={formData.complemento}
                  onChange={(e) => handleInputChange('complemento', e.target.value)}
                  placeholder="Apto, Bloco, etc."
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="bairro">Bairro</Label>
                <Input
                  id="bairro"
                  value={formData.bairro}
                  onChange={(e) => handleInputChange('bairro', e.target.value)}
                  placeholder="Nome do bairro"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="cidade">Cidade</Label>
                <Input
                  id="cidade"
                  value={formData.cidade}
                  onChange={(e) => handleInputChange('cidade', e.target.value)}
                  placeholder="Nome da cidade"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="estado">Estado</Label>
                <Select onValueChange={(value) => handleInputChange('estado', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="UF" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SP">São Paulo</SelectItem>
                    <SelectItem value="RJ">Rio de Janeiro</SelectItem>
                    <SelectItem value="MG">Minas Gerais</SelectItem>
                    <SelectItem value="RS">Rio Grande do Sul</SelectItem>
                    {/* Adicionar outros estados conforme necessário */}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Informações Médicas */}
        <Card>
          <CardHeader>
            <CardTitle>Informações Médicas</CardTitle>
            <CardDescription>Histórico médico e condições de saúde</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="alergias">Alergias</Label>
                <Textarea
                  id="alergias"
                  value={formData.alergias}
                  onChange={(e) => handleInputChange('alergias', e.target.value)}
                  placeholder="Descreva alergias conhecidas"
                  rows={3}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="medicamentos">Medicamentos em Uso</Label>
                <Textarea
                  id="medicamentos"
                  value={formData.medicamentos}
                  onChange={(e) => handleInputChange('medicamentos', e.target.value)}
                  placeholder="Liste medicamentos atuais"
                  rows={3}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="cirurgiasAnteriores">Cirurgias Anteriores</Label>
                <Textarea
                  id="cirurgiasAnteriores"
                  value={formData.cirurgiasAnteriores}
                  onChange={(e) => handleInputChange('cirurgiasAnteriores', e.target.value)}
                  placeholder="Histórico de cirurgias"
                  rows={3}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="problemasSaude">Problemas de Saúde</Label>
                <Textarea
                  id="problemasSaude"
                  value={formData.problemasSaude}
                  onChange={(e) => handleInputChange('problemasSaude', e.target.value)}
                  placeholder="Condições médicas relevantes"
                  rows={3}
                />
              </div>
            </div>
            
            <div className="flex space-x-6">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="gravidez"
                  checked={formData.gravidez}
                  onCheckedChange={(checked) => handleInputChange('gravidez', checked as boolean)}
                />
                <Label htmlFor="gravidez">Gestante</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="amamentacao"
                  checked={formData.amamentacao}
                  onCheckedChange={(checked) => handleInputChange('amamentacao', checked as boolean)}
                />
                <Label htmlFor="amamentacao">Amamentando</Label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contato de Emergência */}
        <Card>
          <CardHeader>
            <CardTitle>Contato de Emergência</CardTitle>
            <CardDescription>Pessoa para contato em caso de emergência</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nomeEmergencia">Nome Completo</Label>
                <Input
                  id="nomeEmergencia"
                  value={formData.nomeEmergencia}
                  onChange={(e) => handleInputChange('nomeEmergencia', e.target.value)}
                  placeholder="Nome do contato"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="telefoneEmergencia">Telefone</Label>
                <Input
                  id="telefoneEmergencia"
                  value={formData.telefoneEmergencia}
                  onChange={(e) => handleInputChange('telefoneEmergencia', e.target.value)}
                  placeholder="(11) 90000-0000"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="parentesco">Parentesco</Label>
                <Input
                  id="parentesco"
                  value={formData.parentesco}
                  onChange={(e) => handleInputChange('parentesco', e.target.value)}
                  placeholder="Mãe, Pai, Cônjuge, etc."
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Observações */}
        <Card>
          <CardHeader>
            <CardTitle>Observações Gerais</CardTitle>
            <CardDescription>Informações adicionais sobre o paciente</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="observacoes">Observações</Label>
              <Textarea
                id="observacoes"
                value={formData.observacoes}
                onChange={(e) => handleInputChange('observacoes', e.target.value)}
                placeholder="Informações adicionais relevantes..."
                rows={4}
              />
            </div>
          </CardContent>
        </Card>

        {/* Botões de Ação e Feedback de Erro */}
        <div className="flex flex-col items-end space-y-4">
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <div className="flex space-x-4">
            <Link to="/pacientes/lista">
              <Button variant="outline" type="button" disabled={isLoading}>
                Cancelar
              </Button>
            </Link>
            <Button 
              type="submit" 
              className="bg-yellow-500 hover:bg-yellow-600 text-gray-900"
              disabled={isLoading}
            >
              <Save className="h-4 w-4 mr-2" />
              {isLoading ? 'Salvando...' : 'Salvar Paciente'}
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}
