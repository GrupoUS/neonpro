'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { toast } from 'sonner'
import { 
  Save, 
  X, 
  Plus, 
  Trash2, 
  Upload, 
  FileText,
  Certificate,
  User,
  Briefcase,
  Star,
  Calendar,
  Phone,
  Mail,
  MapPin,
  Award,
  Stethoscope
} from 'lucide-react'
import { Professional, ProfessionalCredential, ProfessionalSpecialty, ProfessionalService, EmploymentStatus, ProfessionalStatus } from '@/lib/types/professional'
import { ProfessionalCreateSchema, ProfessionalUpdateSchema, CredentialCreateSchema, ServiceCreateSchema } from '@/lib/validations/professional'
import { 
  createProfessional, 
  updateProfessional, 
  getProfessional,
  createCredential,
  createService,
  getSpecialties
} from '@/lib/supabase/professionals'
import { z } from 'zod'

interface ProfessionalFormProps {
  professionalId?: string
  mode?: 'create' | 'edit'
}

interface CredentialFormData {
  credential_type: string
  credential_number: string
  issuing_authority: string
  issue_date: string
  expiry_date?: string
  description?: string
}

interface ServiceFormData {
  service_name: string
  service_type: string
  description?: string
  duration_minutes: number
  base_price?: number
  requires_certification: boolean
}

type ProfessionalFormData = z.infer<typeof ProfessionalCreateSchema>

const employmentStatusOptions = [
  { value: 'full_time', label: 'Tempo Integral' },
  { value: 'part_time', label: 'Meio Período' },
  { value: 'contractor', label: 'Contratado' },
  { value: 'locum_tenens', label: 'Substituto' },
  { value: 'retired', label: 'Aposentado' }
]

const professionalStatusOptions = [
  { value: 'active', label: 'Ativo' },
  { value: 'inactive', label: 'Inativo' },
  { value: 'suspended', label: 'Suspenso' },
  { value: 'pending_verification', label: 'Pendente Verificação' }
]

const credentialTypeOptions = [
  { value: 'license', label: 'Licença Profissional' },
  { value: 'certification', label: 'Certificação' },
  { value: 'board_certification', label: 'Certificação do Conselho' },
  { value: 'fellowship', label: 'Fellowship' },
  { value: 'residency', label: 'Residência' },
  { value: 'degree', label: 'Diploma' },
  { value: 'cme', label: 'Educação Médica Continuada' },
  { value: 'training', label: 'Treinamento' }
]

const serviceTypeOptions = [
  { value: 'consultation', label: 'Consulta' },
  { value: 'procedure', label: 'Procedimento' },
  { value: 'surgery', label: 'Cirurgia' },
  { value: 'diagnostic', label: 'Diagnóstico' },
  { value: 'therapy', label: 'Terapia' },
  { value: 'emergency', label: 'Emergência' },
  { value: 'telemedicine', label: 'Telemedicina' },
  { value: 'administrative', label: 'Administrativo' }
]

export default function ProfessionalForm({ professionalId, mode = 'create' }: ProfessionalFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [professional, setProfessional] = useState<Professional | null>(null)
  const [credentials, setCredentials] = useState<ProfessionalCredential[]>([])
  const [services, setServices] = useState<ProfessionalService[]>([])
  const [specialties, setSpecialties] = useState<ProfessionalSpecialty[]>([])
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([])
  const [showCredentialDialog, setShowCredentialDialog] = useState(false)
  const [showServiceDialog, setShowServiceDialog] = useState(false)
  const [profilePhoto, setProfilePhoto] = useState<File | null>(null)

  const form = useForm<ProfessionalFormData>({
    resolver: zodResolver(mode === 'create' ? ProfessionalCreateSchema : ProfessionalUpdateSchema),
    defaultValues: {
      given_name: '',
      family_name: '',
      email: '',
      phone_number: '',
      birth_date: '',
      license_number: '',
      qualification: '',
      employment_status: 'full_time',
      status: 'pending_verification',
      bio: '',
      address: {
        line: '',
        city: '',
        state: '',
        postal_code: '',
        country: 'BR'
      }
    }
  })

  const credentialForm = useForm<CredentialFormData>({
    resolver: zodResolver(CredentialCreateSchema.omit({ professional_id: true })),
    defaultValues: {
      credential_type: '',
      credential_number: '',
      issuing_authority: '',
      issue_date: '',
      expiry_date: '',
      description: ''
    }
  })

  const serviceForm = useForm<ServiceFormData>({
    resolver: zodResolver(ServiceCreateSchema.omit({ professional_id: true })),
    defaultValues: {
      service_name: '',
      service_type: '',
      description: '',
      duration_minutes: 60,
      base_price: 0,
      requires_certification: false
    }
  })

  useEffect(() => {
    loadSpecialties()
    if (mode === 'edit' && professionalId) {
      loadProfessional()
    }
  }, [mode, professionalId])

  const loadSpecialties = async () => {
    try {
      const data = await getSpecialties()
      setSpecialties(data)
    } catch (error) {
      console.error('Error loading specialties:', error)
      toast.error('Erro ao carregar especialidades')
    }
  }

  const loadProfessional = async () => {
    if (!professionalId) return

    try {
      setLoading(true)
      const data = await getProfessional(professionalId)
      setProfessional(data)
      
      // Populate form with professional data
      form.reset({
        given_name: data.given_name,
        family_name: data.family_name,
        email: data.email || '',
        phone_number: data.phone_number || '',
        birth_date: data.birth_date || '',
        license_number: data.license_number || '',
        qualification: data.qualification || '',
        employment_status: data.employment_status,
        status: data.status,
        bio: data.bio || '',
        address: data.address || {
          line: '',
          city: '',
          state: '',
          postal_code: '',
          country: 'BR'
        }
      })
      
    } catch (error) {
      console.error('Error loading professional:', error)
      toast.error('Erro ao carregar dados do profissional')
    } finally {
      setLoading(false)
    }
  }

  const onSubmit = async (data: ProfessionalFormData) => {
    try {
      setLoading(true)
      
      if (mode === 'create') {
        const newProfessional = await createProfessional(data)
        toast.success('Profissional cadastrado com sucesso!')
        router.push(`/dashboard/professionals/${newProfessional.id}`)
      } else if (mode === 'edit' && professionalId) {
        await updateProfessional(professionalId, data)
        toast.success('Profissional atualizado com sucesso!')
        router.push('/dashboard/professionals')
      }
    } catch (error) {
      console.error('Error saving professional:', error)
      toast.error('Erro ao salvar profissional')
    } finally {
      setLoading(false)
    }
  }

  const handleAddCredential = async (data: CredentialFormData) => {
    if (!professionalId && mode === 'edit') {
      toast.error('Salve o profissional primeiro antes de adicionar credenciais')
      return
    }

    try {
      setLoading(true)
      const credentialData = {
        ...data,
        professional_id: professionalId!
      }
      
      const newCredential = await createCredential(credentialData)
      setCredentials(prev => [...prev, newCredential])
      credentialForm.reset()
      setShowCredentialDialog(false)
      toast.success('Credencial adicionada com sucesso!')
    } catch (error) {
      console.error('Error adding credential:', error)
      toast.error('Erro ao adicionar credencial')
    } finally {
      setLoading(false)
    }
  }

  const handleAddService = async (data: ServiceFormData) => {
    if (!professionalId && mode === 'edit') {
      toast.error('Salve o profissional primeiro antes de adicionar serviços')
      return
    }

    try {
      setLoading(true)
      const serviceData = {
        ...data,
        professional_id: professionalId!
      }
      
      const newService = await createService(serviceData)
      setServices(prev => [...prev, newService])
      serviceForm.reset()
      setShowServiceDialog(false)
      toast.success('Serviço adicionado com sucesso!')
    } catch (error) {
      console.error('Error adding service:', error)
      toast.error('Erro ao adicionar serviço')
    } finally {
      setLoading(false)
    }
  }

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setProfilePhoto(file)
      toast.success('Foto selecionada com sucesso!')
    }
  }

  const handleSpecialtyToggle = (specialtyId: string) => {
    setSelectedSpecialties(prev => 
      prev.includes(specialtyId) 
        ? prev.filter(id => id !== specialtyId)
        : [...prev, specialtyId]
    )
  }

  return (
    <div className="flex-1 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            {mode === 'create' ? 'Cadastrar Profissional' : 'Editar Profissional'}
          </h2>
          <p className="text-muted-foreground">
            {mode === 'create' 
              ? 'Cadastre um novo profissional no sistema'
              : 'Edite as informações do profissional'
            }
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => router.back()}>
            <X className="mr-2 h-4 w-4" />
            Cancelar
          </Button>
          <Button 
            onClick={form.handleSubmit(onSubmit)}
            disabled={loading}
          >
            <Save className="mr-2 h-4 w-4" />
            {loading ? 'Salvando...' : 'Salvar'}
          </Button>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Tabs defaultValue="personal" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="personal">Pessoal</TabsTrigger>
              <TabsTrigger value="professional">Profissional</TabsTrigger>
              <TabsTrigger value="specialties">Especialidades</TabsTrigger>
              <TabsTrigger value="credentials">Credenciais</TabsTrigger>
              <TabsTrigger value="services">Serviços</TabsTrigger>
            </TabsList>

            {/* Personal Information Tab */}
            <TabsContent value="personal">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Informações Pessoais
                  </CardTitle>
                  <CardDescription>
                    Dados pessoais do profissional
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Profile Photo */}
                  <div className="space-y-2">
                    <Label>Foto de Perfil</Label>
                    <div className="flex items-center gap-4">
                      <div className="h-24 w-24 rounded-full bg-muted flex items-center justify-center">
                        {profilePhoto ? (
                          <img 
                            src={URL.createObjectURL(profilePhoto)} 
                            alt="Profile" 
                            className="h-24 w-24 rounded-full object-cover"
                          />
                        ) : (
                          <User className="h-12 w-12 text-muted-foreground" />
                        )}
                      </div>
                      <div>
                        <Input
                          id="photo"
                          type="file"
                          accept="image/*"
                          onChange={handlePhotoUpload}
                          className="hidden"
                        />
                        <Label htmlFor="photo" className="cursor-pointer">
                          <Button type="button" variant="outline" asChild>
                            <span>
                              <Upload className="mr-2 h-4 w-4" />
                              Selecionar Foto
                            </span>
                          </Button>
                        </Label>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="given_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome *</FormLabel>
                          <FormControl>
                            <Input placeholder="Nome do profissional" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="family_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Sobrenome *</FormLabel>
                          <FormControl>
                            <Input placeholder="Sobrenome do profissional" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email *</FormLabel>
                          <FormControl>
                            <Input 
                              type="email" 
                              placeholder="email@exemplo.com" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="phone_number"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Telefone</FormLabel>
                          <FormControl>
                            <Input placeholder="(11) 99999-9999" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="birth_date"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Data de Nascimento</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Address */}
                  <div className="space-y-4">
                    <h4 className="font-medium flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      Endereço
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="address.line"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Endereço</FormLabel>
                            <FormControl>
                              <Input placeholder="Rua, número, complemento" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="address.city"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Cidade</FormLabel>
                            <FormControl>
                              <Input placeholder="Cidade" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="address.state"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Estado</FormLabel>
                            <FormControl>
                              <Input placeholder="Estado" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="address.postal_code"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>CEP</FormLabel>
                            <FormControl>
                              <Input placeholder="00000-000" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <FormField
                    control={form.control}
                    name="bio"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Biografia</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Descrição sobre o profissional, experiência, especialidades..."
                            className="min-h-[100px]"
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          Informações que serão exibidas no perfil público do profissional
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            {/* Professional Information Tab */}
            <TabsContent value="professional">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Briefcase className="h-5 w-5" />
                    Informações Profissionais
                  </CardTitle>
                  <CardDescription>
                    Dados relacionados à atividade profissional
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="license_number"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Número da Licença</FormLabel>
                          <FormControl>
                            <Input placeholder="CRM, CRO, CREF, etc." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="qualification"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Qualificação Principal</FormLabel>
                          <FormControl>
                            <Input placeholder="Médico, Dentista, Fisioterapeuta, etc." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="employment_status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Status de Emprego</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione o status" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {employmentStatusOptions.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Status Profissional</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione o status" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {professionalStatusOptions.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Specialties Tab */}
            <TabsContent value="specialties">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="h-5 w-5" />
                    Especialidades
                  </CardTitle>
                  <CardDescription>
                    Selecione as especialidades do profissional
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {specialties.map((specialty) => (
                      <div 
                        key={specialty.id} 
                        className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-accent cursor-pointer"
                        onClick={() => handleSpecialtyToggle(specialty.id)}
                      >
                        <Checkbox 
                          checked={selectedSpecialties.includes(specialty.id)}
                          onChange={() => handleSpecialtyToggle(specialty.id)}
                        />
                        <div className="flex-1">
                          <div className="font-medium">{specialty.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {specialty.description}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Credentials Tab */}
            <TabsContent value="credentials">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Certificate className="h-5 w-5" />
                        Credenciais e Certificações
                      </CardTitle>
                      <CardDescription>
                        Gerencie as credenciais profissionais
                      </CardDescription>
                    </div>
                    <Dialog open={showCredentialDialog} onOpenChange={setShowCredentialDialog}>
                      <DialogTrigger asChild>
                        <Button variant="outline">
                          <Plus className="mr-2 h-4 w-4" />
                          Adicionar Credencial
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Nova Credencial</DialogTitle>
                          <DialogDescription>
                            Adicione uma nova credencial ou certificação
                          </DialogDescription>
                        </DialogHeader>
                        <Form {...credentialForm}>
                          <form onSubmit={credentialForm.handleSubmit(handleAddCredential)} className="space-y-4">
                            <FormField
                              control={credentialForm.control}
                              name="credential_type"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Tipo de Credencial</FormLabel>
                                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Selecione o tipo" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      {credentialTypeOptions.map((option) => (
                                        <SelectItem key={option.value} value={option.value}>
                                          {option.label}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={credentialForm.control}
                              name="credential_number"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Número da Credencial</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Número ou código da credencial" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={credentialForm.control}
                              name="issuing_authority"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Autoridade Emissora</FormLabel>
                                  <FormControl>
                                    <Input placeholder="CFM, CRO, Universidade, etc." {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <div className="grid grid-cols-2 gap-4">
                              <FormField
                                control={credentialForm.control}
                                name="issue_date"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Data de Emissão</FormLabel>
                                    <FormControl>
                                      <Input type="date" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              <FormField
                                control={credentialForm.control}
                                name="expiry_date"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Data de Expiração</FormLabel>
                                    <FormControl>
                                      <Input type="date" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>

                            <FormField
                              control={credentialForm.control}
                              name="description"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Descrição</FormLabel>
                                  <FormControl>
                                    <Textarea 
                                      placeholder="Detalhes sobre a credencial..."
                                      {...field} 
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </form>
                        </Form>
                        <DialogFooter>
                          <Button 
                            variant="outline" 
                            onClick={() => setShowCredentialDialog(false)}
                          >
                            Cancelar
                          </Button>
                          <Button 
                            onClick={credentialForm.handleSubmit(handleAddCredential)}
                            disabled={loading}
                          >
                            Adicionar
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent>
                  {credentials.length === 0 ? (
                    <div className="text-center py-8">
                      <Certificate className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">Nenhuma credencial cadastrada</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {credentials.map((credential) => (
                        <div key={credential.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <div className="font-medium">{credential.credential_type}</div>
                            <div className="text-sm text-muted-foreground">
                              {credential.credential_number} - {credential.issuing_authority}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Válida até: {credential.expiry_date ? new Date(credential.expiry_date).toLocaleDateString('pt-BR') : 'Sem expiração'}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={credential.verification_status === 'verified' ? 'default' : 'outline'}>
                              {credential.verification_status}
                            </Badge>
                            <Button variant="ghost" size="sm">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Services Tab */}
            <TabsContent value="services">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Stethoscope className="h-5 w-5" />
                        Serviços Oferecidos
                      </CardTitle>
                      <CardDescription>
                        Gerencie os serviços que o profissional oferece
                      </CardDescription>
                    </div>
                    <Dialog open={showServiceDialog} onOpenChange={setShowServiceDialog}>
                      <DialogTrigger asChild>
                        <Button variant="outline">
                          <Plus className="mr-2 h-4 w-4" />
                          Adicionar Serviço
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Novo Serviço</DialogTitle>
                          <DialogDescription>
                            Adicione um novo serviço oferecido pelo profissional
                          </DialogDescription>
                        </DialogHeader>
                        <Form {...serviceForm}>
                          <form onSubmit={serviceForm.handleSubmit(handleAddService)} className="space-y-4">
                            <FormField
                              control={serviceForm.control}
                              name="service_name"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Nome do Serviço</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Nome do serviço" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={serviceForm.control}
                              name="service_type"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Tipo de Serviço</FormLabel>
                                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Selecione o tipo" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      {serviceTypeOptions.map((option) => (
                                        <SelectItem key={option.value} value={option.value}>
                                          {option.label}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={serviceForm.control}
                              name="description"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Descrição</FormLabel>
                                  <FormControl>
                                    <Textarea 
                                      placeholder="Descrição do serviço..."
                                      {...field} 
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <div className="grid grid-cols-2 gap-4">
                              <FormField
                                control={serviceForm.control}
                                name="duration_minutes"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Duração (minutos)</FormLabel>
                                    <FormControl>
                                      <Input 
                                        type="number" 
                                        placeholder="60"
                                        {...field}
                                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              <FormField
                                control={serviceForm.control}
                                name="base_price"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Preço Base (R$)</FormLabel>
                                    <FormControl>
                                      <Input 
                                        type="number" 
                                        step="0.01"
                                        placeholder="0.00"
                                        {...field}
                                        onChange={(e) => field.onChange(parseFloat(e.target.value))}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>

                            <FormField
                              control={serviceForm.control}
                              name="requires_certification"
                              render={({ field }) => (
                                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value}
                                      onCheckedChange={field.onChange}
                                    />
                                  </FormControl>
                                  <div className="space-y-1 leading-none">
                                    <FormLabel>
                                      Requer Certificação Específica
                                    </FormLabel>
                                    <FormDescription>
                                      Marque se este serviço requer certificação específica
                                    </FormDescription>
                                  </div>
                                </FormItem>
                              )}
                            />
                          </form>
                        </Form>
                        <DialogFooter>
                          <Button 
                            variant="outline" 
                            onClick={() => setShowServiceDialog(false)}
                          >
                            Cancelar
                          </Button>
                          <Button 
                            onClick={serviceForm.handleSubmit(handleAddService)}
                            disabled={loading}
                          >
                            Adicionar
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent>
                  {services.length === 0 ? (
                    <div className="text-center py-8">
                      <Stethoscope className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">Nenhum serviço cadastrado</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {services.map((service) => (
                        <div key={service.id} className="p-4 border rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <div className="font-medium">{service.service_name}</div>
                            <Badge variant="outline">{service.service_type}</Badge>
                          </div>
                          <div className="text-sm text-muted-foreground mb-2">
                            {service.description}
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span>Duração: {service.duration_minutes}min</span>
                            <span className="font-medium">
                              R$ {service.base_price?.toFixed(2) || '0.00'}
                            </span>
                          </div>
                          {service.requires_certification && (
                            <Badge className="mt-2" variant="outline">
                              <Award className="mr-1 h-3 w-3" />
                              Requer Certificação
                            </Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </form>
      </Form>
    </div>
  )
}
