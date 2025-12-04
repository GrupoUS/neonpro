/**
 * Patient Edit Modal Component
 * Modal for editing patient information with validation
 * Reuses form patterns from PatientRegistrationWizard
 */

import { useUpdatePatient } from '@/hooks/usePatients';
import type { Database } from '@/integrations/supabase/types';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@neonpro/ui';
import { Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

type PatientRow = Database['public']['Tables']['patients']['Row'];

interface PatientEditModalProps {
  patient: PatientRow;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Form validation schema
const editPatientSchema = z.object({
  // Personal Information
  full_name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  preferred_name: z.string().optional(),
  birth_date: z.string().optional(),
  gender: z.string().optional(),

  // Contact
  phone_primary: z.string().optional(),
  phone_secondary: z.string().optional(),
  email: z.string().email('Email inválido').optional().or(z.literal('')),

  // Address
  address_line1: z.string().optional(),
  address_line2: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  postal_code: z.string().optional(),

  // Emergency Contact
  emergency_contact_name: z.string().optional(),
  emergency_contact_phone: z.string().optional(),
  emergency_contact_relationship: z.string().optional(),

  // Medical
  blood_type: z.string().optional(),
  insurance_provider: z.string().optional(),
  insurance_number: z.string().optional(),

  // Notes
  patient_notes: z.string().optional(),
});

type EditPatientFormData = z.infer<typeof editPatientSchema>;

export function PatientEditModal({ patient, open, onOpenChange }: PatientEditModalProps) {
  const updatePatient = useUpdatePatient();

  const form = useForm<EditPatientFormData>({
    resolver: zodResolver(editPatientSchema),
    defaultValues: {
      full_name: patient.full_name,
      preferred_name: patient.preferred_name || '',
      birth_date: patient.birth_date || '',
      gender: patient.gender || '',
      phone_primary: patient.phone_primary || '',
      phone_secondary: patient.phone_secondary || '',
      email: patient.email || '',
      address_line1: patient.address_line1 || '',
      address_line2: patient.address_line2 || '',
      city: patient.city || '',
      state: patient.state || '',
      postal_code: patient.postal_code || '',
      emergency_contact_name: patient.emergency_contact_name || '',
      emergency_contact_phone: patient.emergency_contact_phone || '',
      emergency_contact_relationship: patient.emergency_contact_relationship || '',
      blood_type: patient.blood_type || '',
      insurance_provider: patient.insurance_provider || '',
      insurance_number: patient.insurance_number || '',
      patient_notes: patient.patient_notes || '',
    },
  });

  const onSubmit = async (data: EditPatientFormData) => {
    try {
      await updatePatient.mutateAsync({
        id: patient.id,
        ...data,
      });
      onOpenChange(false);
      form.reset();
    } catch (error) {
      console.error('Error updating patient:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-3xl max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle>Editar Paciente</DialogTitle>
          <DialogDescription>
            Atualize as informações do paciente. Campos sensíveis (CPF, RG) não podem ser editados.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
            <Tabs defaultValue='personal' className='w-full'>
              <TabsList className='grid w-full grid-cols-4'>
                <TabsTrigger value='personal'>Pessoal</TabsTrigger>
                <TabsTrigger value='contact'>Contato</TabsTrigger>
                <TabsTrigger value='medical'>Médico</TabsTrigger>
                <TabsTrigger value='notes'>Observações</TabsTrigger>
              </TabsList>

              {/* Personal Information Tab */}
              <TabsContent value='personal' className='space-y-4'>
                <FormField
                  control={form.control}
                  name='full_name'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome Completo *</FormLabel>
                      <FormControl>
                        <Input placeholder='Nome completo do paciente' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='preferred_name'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome Preferido</FormLabel>
                      <FormControl>
                        <Input placeholder='Como prefere ser chamado' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className='grid grid-cols-2 gap-4'>
                  <FormField
                    control={form.control}
                    name='birth_date'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Data de Nascimento</FormLabel>
                        <FormControl>
                          <Input type='date' {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='gender'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Gênero</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder='Selecione' />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value='male'>Masculino</SelectItem>
                            <SelectItem value='female'>Feminino</SelectItem>
                            <SelectItem value='non-binary'>Não-binário</SelectItem>
                            <SelectItem value='prefer-not-to-say'>Prefiro não dizer</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </TabsContent>

              {/* Contact Information Tab */}
              <TabsContent value='contact' className='space-y-4'>
                <div className='grid grid-cols-2 gap-4'>
                  <FormField
                    control={form.control}
                    name='phone_primary'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Telefone Principal</FormLabel>
                        <FormControl>
                          <Input placeholder='(00) 00000-0000' {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='phone_secondary'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Telefone Secundário</FormLabel>
                        <FormControl>
                          <Input placeholder='(00) 00000-0000' {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name='email'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type='email' placeholder='email@exemplo.com' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className='space-y-4'>
                  <h4 className='font-medium text-sm'>Endereço</h4>

                  <FormField
                    control={form.control}
                    name='address_line1'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Rua/Avenida</FormLabel>
                        <FormControl>
                          <Input placeholder='Rua, número' {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='address_line2'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Complemento</FormLabel>
                        <FormControl>
                          <Input placeholder='Apartamento, bloco, etc.' {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className='grid grid-cols-3 gap-4'>
                    <FormField
                      control={form.control}
                      name='city'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Cidade</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name='state'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Estado</FormLabel>
                          <FormControl>
                            <Input placeholder='SP' maxLength={2} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name='postal_code'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>CEP</FormLabel>
                          <FormControl>
                            <Input placeholder='00000-000' {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <div className='space-y-4'>
                  <h4 className='font-medium text-sm'>Contato de Emergência</h4>

                  <FormField
                    control={form.control}
                    name='emergency_contact_name'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome</FormLabel>
                        <FormControl>
                          <Input placeholder='Nome do contato' {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className='grid grid-cols-2 gap-4'>
                    <FormField
                      control={form.control}
                      name='emergency_contact_phone'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Telefone</FormLabel>
                          <FormControl>
                            <Input placeholder='(00) 00000-0000' {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name='emergency_contact_relationship'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Relação</FormLabel>
                          <FormControl>
                            <Input placeholder='Pai, mãe, cônjuge, etc.' {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </TabsContent>

              {/* Medical Information Tab */}
              <TabsContent value='medical' className='space-y-4'>
                <FormField
                  control={form.control}
                  name='blood_type'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo Sanguíneo</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder='Selecione' />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value='A+'>A+</SelectItem>
                          <SelectItem value='A-'>A-</SelectItem>
                          <SelectItem value='B+'>B+</SelectItem>
                          <SelectItem value='B-'>B-</SelectItem>
                          <SelectItem value='AB+'>AB+</SelectItem>
                          <SelectItem value='AB-'>AB-</SelectItem>
                          <SelectItem value='O+'>O+</SelectItem>
                          <SelectItem value='O-'>O-</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className='space-y-4'>
                  <h4 className='font-medium text-sm'>Informações de Convênio</h4>

                  <FormField
                    control={form.control}
                    name='insurance_provider'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Operadora</FormLabel>
                        <FormControl>
                          <Input placeholder='Nome do convênio' {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='insurance_number'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Número da Carteirinha</FormLabel>
                        <FormControl>
                          <Input placeholder='Número do plano' {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </TabsContent>

              {/* Notes Tab */}
              <TabsContent value='notes' className='space-y-4'>
                <FormField
                  control={form.control}
                  name='patient_notes'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Observações sobre o Paciente</FormLabel>
                      <FormControl>
                        <textarea
                          className='w-full min-h-[200px] p-3 text-sm border rounded-md'
                          placeholder='Anotações relevantes sobre o paciente...'
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>
            </Tabs>

            <DialogFooter>
              <Button
                type='button'
                variant='outline'
                onClick={() => onOpenChange(false)}
                disabled={updatePatient.isPending}
              >
                Cancelar
              </Button>
              <Button type='submit' disabled={updatePatient.isPending}>
                {updatePatient.isPending && (
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                )}
                Salvar Alterações
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
