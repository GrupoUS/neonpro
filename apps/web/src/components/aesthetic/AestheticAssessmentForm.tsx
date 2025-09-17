'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@neonpro/ui';
import { AlertTriangle, FileText, Upload, User } from 'lucide-react';
import React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { type AestheticAssessmentData } from '../pdf/AestheticReportPDF';
import PDFExportButtons from '../pdf/PDFExportButtons';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { Badge } from '../ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../ui/form';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';

// Schema de validação para o formulário de avaliação estética
const aestheticAssessmentSchema = z.object({
  // Dados básicos do paciente
  patientData: z.object({
    name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
    age: z.number().min(16, 'Idade mínima 16 anos').max(100, 'Idade máxima 100 anos'),
    skinType: z.enum(['1', '2', '3', '4', '5', '6'], {
      required_error: 'Selecione o fototipo de pele',
    }),
    gender: z.enum(['masculino', 'feminino', 'outro'], {
      required_error: 'Selecione o gênero',
    }),
  }),

  // Dados da análise estética
  skinAnalysis: z.object({
    primaryConcerns: z.array(z.string()).min(1, 'Selecione pelo menos uma preocupação'),
    skinCondition: z.enum(['seca', 'oleosa', 'mista', 'sensivel', 'normal']),
    acnePresent: z.boolean(),
    melasmaPresent: z.boolean(),
    wrinklesPresent: z.boolean(),
    sunDamage: z.enum(['nenhum', 'leve', 'moderado', 'severo']),
  }),

  // Histórico e contraindicações
  medicalHistory: z.object({
    isPregnant: z.boolean(),
    isBreastfeeding: z.boolean(),
    hasDiabetes: z.boolean(),
    hasAutoimmune: z.boolean(),
    currentMedications: z.string(),
    allergies: z.string(),
    previousTreatments: z.string(),
  }),

  // Estilo de vida
  lifestyle: z.object({
    sunExposure: z.enum(['baixa', 'moderada', 'alta']),
    smoking: z.boolean(),
    alcoholConsumption: z.enum(['nenhum', 'social', 'moderado', 'frequente']),
    exerciseFrequency: z.enum(['sedentario', 'leve', 'moderado', 'intenso']),
  }),

  // Consentimento LGPD
  lgpdConsent: z.object({
    dataProcessing: z.boolean().refine(val => val === true, {
      message: 'Consentimento obrigatório para processamento de dados',
    }),
    imageAnalysis: z.boolean(),
    marketingCommunication: z.boolean(),
  }),
});

type AestheticAssessmentForm = z.infer<typeof aestheticAssessmentSchema>;

interface AestheticAssessmentFormProps {
  onSubmit: (data: AestheticAssessmentForm) => Promise<void>;
  isLoading?: boolean;
  defaultValues?: Partial<AestheticAssessmentForm>;
}

export function AestheticAssessmentForm({
  onSubmit,
  isLoading = false,
  defaultValues,
}: AestheticAssessmentFormProps) {
  const form = useForm<AestheticAssessmentForm>({
    resolver: zodResolver(aestheticAssessmentSchema),
    defaultValues: {
      patientData: {
        name: '',
        age: 25,
        skinType: undefined,
        gender: undefined,
      },
      skinAnalysis: {
        primaryConcerns: [],
        skinCondition: 'normal',
        acnePresent: false,
        melasmaPresent: false,
        wrinklesPresent: false,
        sunDamage: 'nenhum',
      },
      medicalHistory: {
        isPregnant: false,
        isBreastfeeding: false,
        hasDiabetes: false,
        hasAutoimmune: false,
        currentMedications: '',
        allergies: '',
        previousTreatments: '',
      },
      lifestyle: {
        sunExposure: 'moderada',
        smoking: false,
        alcoholConsumption: 'nenhum',
        exerciseFrequency: 'moderado',
      },
      lgpdConsent: {
        dataProcessing: false,
        imageAnalysis: false,
        marketingCommunication: false,
      },
      ...defaultValues,
    },
  });

  const skinConcerns = [
    'Acne',
    'Melasma',
    'Rugas finas',
    'Rugas profundas',
    'Manchas solares',
    'Poros dilatados',
    'Flacidez',
    'Olheiras',
    'Cicatrizes de acne',
    'Rosácea',
    'Hiperpigmentação',
    'Textura irregular',
  ];

  const handleConcernToggle = (concern: string) => {
    const currentConcerns = form.getValues('skinAnalysis.primaryConcerns');
    const updatedConcerns = currentConcerns.includes(concern)
      ? currentConcerns.filter(c => c !== concern)
      : [...currentConcerns, concern];

    form.setValue('skinAnalysis.primaryConcerns', updatedConcerns);
  };

  return (
    <div className='max-w-4xl mx-auto space-y-6'>
      {/* Cabeçalho */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <FileText className='h-6 w-6' />
            Avaliação Estética Profissional
          </CardTitle>
          <CardDescription>
            Formulário completo para análise personalizada e recomendações de tratamentos estéticos
          </CardDescription>
        </CardHeader>
      </Card>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
          {/* Dados do Paciente */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <User className='h-5 w-5' />
                Dados do Paciente
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <FormField
                  control={form.control}
                  name='patientData.name'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome Completo *</FormLabel>
                      <FormControl>
                        <Input placeholder='Nome do paciente' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='patientData.age'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Idade *</FormLabel>
                      <FormControl>
                        <Input
                          type='number'
                          min='16'
                          max='100'
                          {...field}
                          onChange={e => field.onChange(parseInt(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <FormField
                  control={form.control}
                  name='patientData.skinType'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fototipo de Pele *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder='Selecione o fototipo' />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value='1'>I - Muito clara, sempre queima</SelectItem>
                          <SelectItem value='2'>II - Clara, queima facilmente</SelectItem>
                          <SelectItem value='3'>
                            III - Morena clara, bronzeia gradualmente
                          </SelectItem>
                          <SelectItem value='4'>IV - Morena, bronzeia facilmente</SelectItem>
                          <SelectItem value='5'>V - Morena escura, raramente queima</SelectItem>
                          <SelectItem value='6'>VI - Negra, nunca queima</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='patientData.gender'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Gênero *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder='Selecione o gênero' />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value='feminino'>Feminino</SelectItem>
                          <SelectItem value='masculino'>Masculino</SelectItem>
                          <SelectItem value='outro'>Outro</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Upload de Foto */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Upload className='h-5 w-5' />
                Análise Fotográfica
              </CardTitle>
              <CardDescription>
                Faça upload de fotos para análise IA da pele (opcional, mas recomendado)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className='border-2 border-dashed border-gray-300 rounded-lg p-6 text-center'>
                <Upload className='mx-auto h-12 w-12 text-gray-400' />
                <div className='mt-4'>
                  <Button type='button' variant='outline'>
                    Selecionar Fotos
                  </Button>
                  <p className='mt-2 text-sm text-gray-500'>
                    Formatos aceitos: JPG, PNG. Máximo 5 fotos de 10MB cada.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Análise da Pele */}
          <Card>
            <CardHeader>
              <CardTitle>Análise da Pele</CardTitle>
              <CardDescription>
                Identifique as principais preocupações e características da pele
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-6'>
              {/* Preocupações Principais */}
              <FormField
                control={form.control}
                name='skinAnalysis.primaryConcerns'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Preocupações Principais *</FormLabel>
                    <FormDescription>
                      Selecione todas as preocupações que se aplicam ao paciente
                    </FormDescription>
                    <div className='grid grid-cols-2 md:grid-cols-3 gap-2 mt-2'>
                      {skinConcerns.map(concern => (
                        <Badge
                          key={concern}
                          variant={field.value.includes(concern) ? 'default' : 'outline'}
                          className='cursor-pointer justify-center p-2 h-auto'
                          onClick={() => handleConcernToggle(concern)}
                        >
                          {concern}
                        </Badge>
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <FormField
                  control={form.control}
                  name='skinAnalysis.skinCondition'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de Pele</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder='Selecione o tipo' />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value='seca'>Seca</SelectItem>
                          <SelectItem value='oleosa'>Oleosa</SelectItem>
                          <SelectItem value='mista'>Mista</SelectItem>
                          <SelectItem value='sensivel'>Sensível</SelectItem>
                          <SelectItem value='normal'>Normal</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='skinAnalysis.sunDamage'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Danos Solares</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder='Nível de danos' />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value='nenhum'>Nenhum</SelectItem>
                          <SelectItem value='leve'>Leve</SelectItem>
                          <SelectItem value='moderado'>Moderado</SelectItem>
                          <SelectItem value='severo'>Severo</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Condições Específicas */}
              <div className='space-y-3'>
                <FormLabel>Condições Específicas</FormLabel>
                <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                  <FormField
                    control={form.control}
                    name='skinAnalysis.acnePresent'
                    render={({ field }) => (
                      <FormItem className='flex flex-row items-center space-x-3 space-y-0'>
                        <FormControl>
                          <input
                            type='checkbox'
                            checked={field.value}
                            onChange={field.onChange}
                            className='rounded border-gray-300'
                          />
                        </FormControl>
                        <FormLabel className='text-sm font-normal'>
                          Acne presente
                        </FormLabel>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='skinAnalysis.melasmaPresent'
                    render={({ field }) => (
                      <FormItem className='flex flex-row items-center space-x-3 space-y-0'>
                        <FormControl>
                          <input
                            type='checkbox'
                            checked={field.value}
                            onChange={field.onChange}
                            className='rounded border-gray-300'
                          />
                        </FormControl>
                        <FormLabel className='text-sm font-normal'>
                          Melasma presente
                        </FormLabel>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='skinAnalysis.wrinklesPresent'
                    render={({ field }) => (
                      <FormItem className='flex flex-row items-center space-x-3 space-y-0'>
                        <FormControl>
                          <input
                            type='checkbox'
                            checked={field.value}
                            onChange={field.onChange}
                            className='rounded border-gray-300'
                          />
                        </FormControl>
                        <FormLabel className='text-sm font-normal'>
                          Rugas presentes
                        </FormLabel>
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Button
            type='submit'
            className='w-full'
            disabled={isLoading}
            size='lg'
          >
            {isLoading ? 'Processando...' : 'Continuar para Análise da Pele'}
          </Button>

          {/* Seção de Exportação PDF */}
          {(() => {
            const formData = form.getValues();
            const hasBasicData = formData.patientData.name
              && formData.patientData.age
              && formData.patientData.skinType
              && formData.patientData.gender;

            if (hasBasicData) {
              // Converter dados do formulário para o formato do PDF
              const pdfData: AestheticAssessmentData = {
                patientData: {
                  ...formData.patientData,
                  skinType: formData.patientData.skinType as any,
                  gender: formData.patientData.gender as any,
                },
                skinAnalysis: {
                  ...formData.skinAnalysis,
                  skinCondition: formData.skinAnalysis.skinCondition as any,
                  sunDamage: formData.skinAnalysis.sunDamage as any,
                },
                medicalHistory: formData.medicalHistory,
                lifestyle: {
                  ...formData.lifestyle,
                  sunExposure: formData.lifestyle.sunExposure as any,
                  alcoholConsumption: formData.lifestyle.alcoholConsumption as any,
                  exerciseFrequency: formData.lifestyle.exerciseFrequency as any,
                },
                lgpdConsent: formData.lgpdConsent,
              };

              return (
                <Card>
                  <CardHeader>
                    <CardTitle className='flex items-center gap-2'>
                      <FileText className='h-5 w-5' />
                      Exportar Relatório PDF
                    </CardTitle>
                    <CardDescription>
                      Gere um relatório profissional com os dados preenchidos
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <PDFExportButtons
                      assessmentData={pdfData}
                      variant='outline'
                      size='default'
                      showPreview={true}
                      className=''
                    />
                  </CardContent>
                </Card>
              );
            }
            return null;
          })()}
        </form>
      </Form>
    </div>
  );
}
