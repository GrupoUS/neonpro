"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { 
  FileText, 
  Shield, 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  User, 
  Edit, 
  Eye, 
  Download, 
  Send, 
  UserCheck, 
  Calendar, 
  Hash, 
  Lock, 
  Unlock, 
  Plus, 
  X, 
  Search, 
  Filter, 
  MoreVertical, 
  Copy, 
  RefreshCw, 
  AlertCircle, 
  Info, 
  Scale, 
  Gavel, 
  BookOpen, 
  Users, 
  Database, 
  Settings, 
  Star, 
  Heart, 
  Brain, 
  Activity, 
  Stethoscope, 
  Pill, 
  Syringe, 
  Microscope, 
  Camera, 
  Video, 
  Mic, 
  MapPin, 
  Phone, 
  Mail, 
  Globe, 
  Smartphone, 
  Wifi, 
  Bluetooth, 
  Fingerprint, 
  CreditCard, 
  DollarSign, 
  Building, 
  Home, 
  Car, 
  Plane, 
  Ship, 
  Train, 
  Truck, 
  Bus, 
  Bike, 
  Walk
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Types
interface ConsentForm {
  id: string;
  title: string;
  description: string;
  version: string;
  type: string;
  category: string;
  isActive: boolean;
  isRequired: boolean;
  content: FormContent;
  legalBasis: LegalBasis[];
  dataCategories: string[];
  retentionPeriod: number;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  approvedBy?: string;
  approvedAt?: Date;
  expiresAt?: Date;
  metadata: Record<string, any>;
}

interface FormContent {
  sections: FormSection[];
  fields: FormField[];
  validationRules: ValidationRule[];
  styling: Record<string, any>;
}

interface FormSection {
  id: string;
  title: string;
  description?: string;
  order: number;
  isRequired: boolean;
  fields: string[];
}

interface FormField {
  id: string;
  name: string;
  label: string;
  type: string;
  isRequired: boolean;
  placeholder?: string;
  helpText?: string;
  options?: FieldOption[];
  validation?: ValidationRule[];
  defaultValue?: any;
  order: number;
  sectionId: string;
  metadata: Record<string, any>;
}

interface FieldOption {
  value: string;
  label: string;
  description?: string;
  isDefault?: boolean;
}

interface ValidationRule {
  type: string;
  value?: any;
  message: string;
  isActive: boolean;
}

interface LegalBasis {
  type: string;
  description: string;
  article?: string;
  isRequired: boolean;
}

interface ConsentResponse {
  id: string;
  formId: string;
  patientId: string;
  responses: Record<string, any>;
  consentGiven: boolean;
  consentMethod: string;
  ipAddress: string;
  userAgent: string;
  timestamp: Date;
  isActive: boolean;
  withdrawnAt?: Date;
  withdrawalReason?: string;
  digitalSignatureId?: string;
  witnessId?: string;
  metadata: Record<string, any>;
}

interface ConsentFormProps {
  patientId: string;
  clinicId: string;
  formId?: string;
  mode?: 'view' | 'fill' | 'edit' | 'create';
  onSubmit?: (response: ConsentResponse) => void;
  onSave?: (form: ConsentForm) => void;
  allowWithdrawal?: boolean;
  requireDigitalSignature?: boolean;
}

const FORM_TYPES = [
  { 
    value: 'treatment_consent', 
    label: 'Consentimento de Tratamento', 
    icon: <Stethoscope className="w-4 h-4" />, 
    color: 'bg-blue-100 text-blue-800',
    description: 'Autorização para procedimentos médicos'
  },
  { 
    value: 'data_processing', 
    label: 'Processamento de Dados', 
    icon: <Database className="w-4 h-4" />, 
    color: 'bg-green-100 text-green-800',
    description: 'Consentimento LGPD para dados pessoais'
  },
  { 
    value: 'research_participation', 
    label: 'Participação em Pesquisa', 
    icon: <Microscope className="w-4 h-4" />, 
    color: 'bg-purple-100 text-purple-800',
    description: 'Autorização para estudos clínicos'
  },
  { 
    value: 'image_recording', 
    label: 'Gravação de Imagens', 
    icon: <Camera className="w-4 h-4" />, 
    color: 'bg-orange-100 text-orange-800',
    description: 'Autorização para fotos e vídeos'
  },
  { 
    value: 'telemedicine', 
    label: 'Telemedicina', 
    icon: <Video className="w-4 h-4" />, 
    color: 'bg-indigo-100 text-indigo-800',
    description: 'Consentimento para consultas remotas'
  },
  { 
    value: 'emergency_contact', 
    label: 'Contato de Emergência', 
    icon: <Phone className="w-4 h-4" />, 
    color: 'bg-red-100 text-red-800',
    description: 'Autorização para contatos de emergência'
  }
];

const FIELD_TYPES = [
  { value: 'text', label: 'Texto', icon: <FileText className="w-4 h-4" /> },
  { value: 'textarea', label: 'Texto Longo', icon: <FileText className="w-4 h-4" /> },
  { value: 'select', label: 'Seleção', icon: <Filter className="w-4 h-4" /> },
  { value: 'radio', label: 'Opção Única', icon: <CheckCircle className="w-4 h-4" /> },
  { value: 'checkbox', label: 'Múltipla Escolha', icon: <CheckCircle className="w-4 h-4" /> },
  { value: 'date', label: 'Data', icon: <Calendar className="w-4 h-4" /> },
  { value: 'email', label: 'Email', icon: <Mail className="w-4 h-4" /> },
  { value: 'phone', label: 'Telefone', icon: <Phone className="w-4 h-4" /> },
  { value: 'number', label: 'Número', icon: <Hash className="w-4 h-4" /> },
  { value: 'signature', label: 'Assinatura', icon: <Edit className="w-4 h-4" /> },
  { value: 'consent', label: 'Consentimento', icon: <Shield className="w-4 h-4" /> }
];

const DATA_CATEGORIES = [
  { value: 'personal_data', label: 'Dados Pessoais', icon: <User className="w-4 h-4" /> },
  { value: 'health_data', label: 'Dados de Saúde', icon: <Heart className="w-4 h-4" /> },
  { value: 'biometric_data', label: 'Dados Biométricos', icon: <Fingerprint className="w-4 h-4" /> },
  { value: 'genetic_data', label: 'Dados Genéticos', icon: <Brain className="w-4 h-4" /> },
  { value: 'location_data', label: 'Dados de Localização', icon: <MapPin className="w-4 h-4" /> },
  { value: 'contact_data', label: 'Dados de Contato', icon: <Phone className="w-4 h-4" /> },
  { value: 'financial_data', label: 'Dados Financeiros', icon: <DollarSign className="w-4 h-4" /> },
  { value: 'behavioral_data', label: 'Dados Comportamentais', icon: <Activity className="w-4 h-4" /> }
];

const LEGAL_BASIS_TYPES = [
  { 
    value: 'consent', 
    label: 'Consentimento', 
    icon: <CheckCircle className="w-4 h-4" />, 
    article: 'Art. 7º, I',
    description: 'Mediante consentimento do titular'
  },
  { 
    value: 'legal_obligation', 
    label: 'Obrigação Legal', 
    icon: <Gavel className="w-4 h-4" />, 
    article: 'Art. 7º, II',
    description: 'Para cumprimento de obrigação legal'
  },
  { 
    value: 'public_interest', 
    label: 'Interesse Público', 
    icon: <Users className="w-4 h-4" />, 
    article: 'Art. 7º, III',
    description: 'Para execução de políticas públicas'
  },
  { 
    value: 'vital_interests', 
    label: 'Proteção da Vida', 
    icon: <Heart className="w-4 h-4" />, 
    article: 'Art. 7º, IV',
    description: 'Para proteção da vida ou incolumidade física'
  },
  { 
    value: 'legitimate_interest', 
    label: 'Interesse Legítimo', 
    icon: <Scale className="w-4 h-4" />, 
    article: 'Art. 7º, IX',
    description: 'Para atender interesses legítimos'
  },
  { 
    value: 'health_protection', 
    label: 'Proteção da Saúde', 
    icon: <Shield className="w-4 h-4" />, 
    article: 'Art. 11, II',
    description: 'Para proteção da saúde (dados sensíveis)'
  }
];

const CONSENT_METHODS = [
  { value: 'digital_signature', label: 'Assinatura Digital', icon: <Edit className="w-4 h-4" /> },
  { value: 'electronic_consent', label: 'Consentimento Eletrônico', icon: <Smartphone className="w-4 h-4" /> },
  { value: 'verbal_consent', label: 'Consentimento Verbal', icon: <Mic className="w-4 h-4" /> },
  { value: 'written_consent', label: 'Consentimento Escrito', icon: <FileText className="w-4 h-4" /> }
];

export function ConsentForm({ 
  patientId, 
  clinicId, 
  formId, 
  mode = 'view', 
  onSubmit, 
  onSave,
  allowWithdrawal = true,
  requireDigitalSignature = false
}: ConsentFormProps) {
  const [forms, setForms] = useState<ConsentForm[]>([]);
  const [responses, setResponses] = useState<ConsentResponse[]>([]);
  const [currentForm, setCurrentForm] = useState<ConsentForm | null>(null);
  const [currentResponse, setCurrentResponse] = useState<ConsentResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showFormBuilder, setShowFormBuilder] = useState(false);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');
  const [selectedTab, setSelectedTab] = useState('forms');

  // Form builder state
  const [newForm, setNewForm] = useState<Partial<ConsentForm>>({
    title: '',
    description: '',
    type: '',
    category: 'medical',
    isActive: true,
    isRequired: false,
    content: {
      sections: [],
      fields: [],
      validationRules: [],
      styling: {}
    },
    legalBasis: [],
    dataCategories: [],
    retentionPeriod: 5,
    metadata: {}
  });
  const [newSection, setNewSection] = useState({
    title: '',
    description: '',
    isRequired: false
  });
  const [newField, setNewField] = useState({
    name: '',
    label: '',
    type: 'text',
    isRequired: false,
    placeholder: '',
    helpText: '',
    options: [] as FieldOption[],
    sectionId: ''
  });
  const [newOption, setNewOption] = useState({
    value: '',
    label: '',
    description: ''
  });

  // Load forms and responses
  useEffect(() => {
    loadForms();
    loadResponses();
    if (formId) {
      loadForm(formId);
    }
  }, [formId, patientId]);

  const loadForms = async () => {
    try {
      // Mock data - replace with actual API call
      const mockForms: ConsentForm[] = [
        {
          id: '1',
          title: 'Termo de Consentimento para Tratamento Médico',
          description: 'Autorização para realização de procedimentos médicos e tratamentos',
          version: '1.0',
          type: 'treatment_consent',
          category: 'medical',
          isActive: true,
          isRequired: true,
          content: {
            sections: [
              {
                id: 'section1',
                title: 'Informações do Paciente',
                description: 'Dados pessoais do paciente',
                order: 1,
                isRequired: true,
                fields: ['patient_name', 'patient_cpf', 'patient_birth']
              },
              {
                id: 'section2',
                title: 'Consentimento para Tratamento',
                description: 'Autorização para procedimentos médicos',
                order: 2,
                isRequired: true,
                fields: ['treatment_consent', 'emergency_consent']
              }
            ],
            fields: [
              {
                id: 'patient_name',
                name: 'patient_name',
                label: 'Nome Completo',
                type: 'text',
                isRequired: true,
                placeholder: 'Digite seu nome completo',
                helpText: 'Nome conforme documento de identidade',
                order: 1,
                sectionId: 'section1',
                metadata: {}
              },
              {
                id: 'patient_cpf',
                name: 'patient_cpf',
                label: 'CPF',
                type: 'text',
                isRequired: true,
                placeholder: '000.000.000-00',
                helpText: 'Documento de identificação',
                order: 2,
                sectionId: 'section1',
                metadata: {}
              },
              {
                id: 'treatment_consent',
                name: 'treatment_consent',
                label: 'Consentimento para Tratamento',
                type: 'consent',
                isRequired: true,
                helpText: 'Autorizo a realização dos procedimentos médicos necessários',
                order: 3,
                sectionId: 'section2',
                metadata: {}
              }
            ],
            validationRules: [],
            styling: {}
          },
          legalBasis: [
            {
              type: 'consent',
              description: 'Consentimento do titular para tratamento médico',
              article: 'Art. 7º, I da LGPD',
              isRequired: true
            }
          ],
          dataCategories: ['personal_data', 'health_data'],
          retentionPeriod: 20,
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01'),
          createdBy: 'admin',
          approvedBy: 'dr-silva',
          approvedAt: new Date('2024-01-01'),
          metadata: {}
        }
      ];
      
      setForms(mockForms);
    } catch (error) {
      console.error('Erro ao carregar formulários:', error);
    }
  };

  const loadResponses = async () => {
    try {
      // Mock data - replace with actual API call
      const mockResponses: ConsentResponse[] = [
        {
          id: '1',
          formId: '1',
          patientId,
          responses: {
            patient_name: 'Maria Santos',
            patient_cpf: '123.456.789-00',
            treatment_consent: true
          },
          consentGiven: true,
          consentMethod: 'digital_signature',
          ipAddress: '192.168.1.100',
          userAgent: 'Mozilla/5.0...',
          timestamp: new Date('2024-01-15T10:30:00'),
          isActive: true,
          digitalSignatureId: 'sig_123456',
          metadata: {}
        }
      ];
      
      setResponses(mockResponses);
    } catch (error) {
      console.error('Erro ao carregar respostas:', error);
    }
  };

  const loadForm = async (id: string) => {
    const form = forms.find(f => f.id === id);
    if (form) {
      setCurrentForm(form);
      // Initialize form data with default values
      const initialData: Record<string, any> = {};
      form.content.fields.forEach(field => {
        if (field.defaultValue !== undefined) {
          initialData[field.name] = field.defaultValue;
        }
      });
      setFormData(initialData);
    }
  };

  const validateField = (field: FormField, value: any): string | null => {
    if (field.isRequired && (!value || value === '')) {
      return `${field.label} é obrigatório`;
    }

    if (field.validation) {
      for (const rule of field.validation) {
        if (!rule.isActive) continue;

        switch (rule.type) {
          case 'minLength':
            if (value && value.length < rule.value) {
              return rule.message;
            }
            break;
          case 'maxLength':
            if (value && value.length > rule.value) {
              return rule.message;
            }
            break;
          case 'pattern':
            if (value && !new RegExp(rule.value).test(value)) {
              return rule.message;
            }
            break;
          case 'email':
            if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
              return rule.message;
            }
            break;
          case 'cpf':
            if (value && !/^\d{3}\.\d{3}\.\d{3}-\d{2}$/.test(value)) {
              return rule.message;
            }
            break;
        }
      }
    }

    return null;
  };

  const validateForm = (): boolean => {
    if (!currentForm) return false;

    const errors: Record<string, string> = {};
    let isValid = true;

    currentForm.content.fields.forEach(field => {
      const error = validateField(field, formData[field.name]);
      if (error) {
        errors[field.name] = error;
        isValid = false;
      }
    });

    setValidationErrors(errors);
    return isValid;
  };

  const handleFieldChange = (fieldName: string, value: any) => {
    setFormData(prev => ({ ...prev, [fieldName]: value }));
    
    // Clear validation error for this field
    if (validationErrors[fieldName]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[fieldName];
        return newErrors;
      });
    }
  };

  const handleSubmit = async () => {
    if (!currentForm || !validateForm()) return;

    setIsLoading(true);
    try {
      const response: ConsentResponse = {
        id: crypto.randomUUID(),
        formId: currentForm.id,
        patientId,
        responses: formData,
        consentGiven: true,
        consentMethod: requireDigitalSignature ? 'digital_signature' : 'electronic_consent',
        ipAddress: '192.168.1.100',
        userAgent: navigator.userAgent,
        timestamp: new Date(),
        isActive: true,
        metadata: {
          formVersion: currentForm.version,
          clinicId
        }
      };

      setResponses(prev => [...prev, response]);
      setCurrentResponse(response);
      onSubmit?.(response);
      
      // Reset form
      setFormData({});
      setValidationErrors({});
    } catch (error) {
      console.error('Erro ao enviar formulário:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const withdrawConsent = async (responseId: string, reason: string) => {
    try {
      setResponses(prev => prev.map(response => 
        response.id === responseId 
          ? { 
              ...response, 
              isActive: false, 
              withdrawnAt: new Date(), 
              withdrawalReason: reason 
            }
          : response
      ));
    } catch (error) {
      console.error('Erro ao retirar consentimento:', error);
    }
  };

  const addSection = () => {
    if (!newSection.title) return;

    const section: FormSection = {
      id: crypto.randomUUID(),
      title: newSection.title,
      description: newSection.description,
      order: (newForm.content?.sections.length || 0) + 1,
      isRequired: newSection.isRequired,
      fields: []
    };

    setNewForm(prev => ({
      ...prev,
      content: {
        ...prev.content!,
        sections: [...(prev.content?.sections || []), section]
      }
    }));

    setNewSection({ title: '', description: '', isRequired: false });
  };

  const addField = () => {
    if (!newField.name || !newField.label || !newField.sectionId) return;

    const field: FormField = {
      id: crypto.randomUUID(),
      name: newField.name,
      label: newField.label,
      type: newField.type,
      isRequired: newField.isRequired,
      placeholder: newField.placeholder,
      helpText: newField.helpText,
      options: newField.options,
      order: (newForm.content?.fields.length || 0) + 1,
      sectionId: newField.sectionId,
      metadata: {}
    };

    setNewForm(prev => ({
      ...prev,
      content: {
        ...prev.content!,
        fields: [...(prev.content?.fields || []), field]
      }
    }));

    // Add field to section
    setNewForm(prev => ({
      ...prev,
      content: {
        ...prev.content!,
        sections: prev.content!.sections.map(section => 
          section.id === newField.sectionId
            ? { ...section, fields: [...section.fields, field.id] }
            : section
        )
      }
    }));

    setNewField({
      name: '',
      label: '',
      type: 'text',
      isRequired: false,
      placeholder: '',
      helpText: '',
      options: [],
      sectionId: ''
    });
  };

  const addOption = () => {
    if (!newOption.value || !newOption.label) return;

    const option: FieldOption = {
      value: newOption.value,
      label: newOption.label,
      description: newOption.description
    };

    setNewField(prev => ({
      ...prev,
      options: [...prev.options, option]
    }));

    setNewOption({ value: '', label: '', description: '' });
  };

  const saveForm = async () => {
    if (!newForm.title || !newForm.type) return;

    try {
      const form: ConsentForm = {
        id: crypto.randomUUID(),
        title: newForm.title!,
        description: newForm.description!,
        version: '1.0',
        type: newForm.type!,
        category: newForm.category!,
        isActive: newForm.isActive!,
        isRequired: newForm.isRequired!,
        content: newForm.content!,
        legalBasis: newForm.legalBasis!,
        dataCategories: newForm.dataCategories!,
        retentionPeriod: newForm.retentionPeriod!,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'current-user',
        metadata: newForm.metadata!
      };

      setForms(prev => [...prev, form]);
      onSave?.(form);
      
      setShowFormBuilder(false);
      setNewForm({
        title: '',
        description: '',
        type: '',
        category: 'medical',
        isActive: true,
        isRequired: false,
        content: {
          sections: [],
          fields: [],
          validationRules: [],
          styling: {}
        },
        legalBasis: [],
        dataCategories: [],
        retentionPeriod: 5,
        metadata: {}
      });
    } catch (error) {
      console.error('Erro ao salvar formulário:', error);
    }
  };

  const renderField = (field: FormField) => {
    const value = formData[field.name] || '';
    const error = validationErrors[field.name];

    const baseProps = {
      id: field.name,
      value,
      onChange: (e: any) => handleFieldChange(field.name, e.target ? e.target.value : e),
      placeholder: field.placeholder,
      className: error ? 'border-red-500' : ''
    };

    switch (field.type) {
      case 'text':
      case 'email':
      case 'phone':
      case 'number':
        return <Input {...baseProps} type={field.type === 'number' ? 'number' : 'text'} />;
      
      case 'textarea':
        return <Textarea {...baseProps} rows={3} />;
      
      case 'date':
        return <Input {...baseProps} type="date" />;
      
      case 'select':
        return (
          <Select value={value} onValueChange={(val) => handleFieldChange(field.name, val)}>
            <SelectTrigger className={error ? 'border-red-500' : ''}>
              <SelectValue placeholder={field.placeholder} />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      
      case 'radio':
        return (
          <RadioGroup value={value} onValueChange={(val) => handleFieldChange(field.name, val)}>
            {field.options?.map(option => (
              <div key={option.value} className="flex items-center space-x-2">
                <RadioGroupItem value={option.value} id={`${field.name}_${option.value}`} />
                <Label htmlFor={`${field.name}_${option.value}`}>{option.label}</Label>
              </div>
            ))}
          </RadioGroup>
        );
      
      case 'checkbox':
        if (field.options && field.options.length > 1) {
          // Multiple checkboxes
          const selectedValues = Array.isArray(value) ? value : [];
          return (
            <div className="space-y-2">
              {field.options.map(option => (
                <div key={option.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`${field.name}_${option.value}`}
                    checked={selectedValues.includes(option.value)}
                    onCheckedChange={(checked) => {
                      const newValues = checked
                        ? [...selectedValues, option.value]
                        : selectedValues.filter(v => v !== option.value);
                      handleFieldChange(field.name, newValues);
                    }}
                  />
                  <Label htmlFor={`${field.name}_${option.value}`}>{option.label}</Label>
                </div>
              ))}
            </div>
          );
        } else {
          // Single checkbox
          return (
            <div className="flex items-center space-x-2">
              <Checkbox
                id={field.name}
                checked={!!value}
                onCheckedChange={(checked) => handleFieldChange(field.name, checked)}
              />
              <Label htmlFor={field.name}>{field.label}</Label>
            </div>
          );
        }
      
      case 'consent':
        return (
          <div className="space-y-4">
            <div className="p-4 border rounded-lg bg-blue-50">
              <div className="flex items-start space-x-3">
                <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-900">Consentimento Necessário</h4>
                  <p className="text-sm text-blue-700 mt-1">
                    {field.helpText || 'Sua autorização é necessária para prosseguir.'}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id={field.name}
                checked={!!value}
                onCheckedChange={(checked) => handleFieldChange(field.name, checked)}
                className={error ? 'border-red-500' : ''}
              />
              <Label htmlFor={field.name} className="text-sm">
                Eu concordo e autorizo conforme descrito acima
              </Label>
            </div>
          </div>
        );
      
      default:
        return <Input {...baseProps} />;
    }
  };

  const getFormTypeInfo = (type: string) => {
    return FORM_TYPES.find(t => t.value === type) || FORM_TYPES[0];
  };

  const getDataCategoryInfo = (category: string) => {
    return DATA_CATEGORIES.find(c => c.value === category) || DATA_CATEGORIES[0];
  };

  const getLegalBasisInfo = (type: string) => {
    return LEGAL_BASIS_TYPES.find(b => b.value === type) || LEGAL_BASIS_TYPES[0];
  };

  const filteredForms = forms.filter(form => {
    const matchesSearch = form.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         form.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = !filterType || form.type === filterType;
    return matchesSearch && matchesType;
  });

  if (mode === 'fill' && currentForm) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{currentForm.title}</h1>
          <p className="text-gray-600">{currentForm.description}</p>
          {currentForm.isRequired && (
            <Badge className="mt-2 bg-red-100 text-red-800">
              <AlertTriangle className="w-3 h-3 mr-1" />
              Obrigatório
            </Badge>
          )}
        </div>

        <Card>
          <CardContent className="p-6">
            <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="space-y-6">
              {currentForm.content.sections.map(section => (
                <div key={section.id} className="space-y-4">
                  <div className="border-b pb-2">
                    <h2 className="text-xl font-semibold text-gray-900">{section.title}</h2>
                    {section.description && (
                      <p className="text-gray-600 mt-1">{section.description}</p>
                    )}
                  </div>
                  
                  {currentForm.content.fields
                    .filter(field => field.sectionId === section.id)
                    .sort((a, b) => a.order - b.order)
                    .map(field => (
                      <div key={field.id} className="space-y-2">
                        {field.type !== 'consent' && field.type !== 'checkbox' && (
                          <Label htmlFor={field.name} className="flex items-center space-x-1">
                            <span>{field.label}</span>
                            {field.isRequired && <span className="text-red-500">*</span>}
                          </Label>
                        )}
                        
                        {renderField(field)}
                        
                        {field.helpText && field.type !== 'consent' && (
                          <p className="text-sm text-gray-500">{field.helpText}</p>
                        )}
                        
                        {validationErrors[field.name] && (
                          <p className="text-sm text-red-600 flex items-center space-x-1">
                            <AlertCircle className="w-4 h-4" />
                            <span>{validationErrors[field.name]}</span>
                          </p>
                        )}
                      </div>
                    ))
                  }
                </div>
              ))}
              
              <div className="flex items-center justify-between pt-6 border-t">
                <div className="text-sm text-gray-500">
                  <p>Versão: {currentForm.version}</p>
                  <p>Retenção: {currentForm.retentionPeriod} anos</p>
                </div>
                
                <div className="flex items-center space-x-4">
                  <Button type="button" variant="outline">
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? (
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <CheckCircle className="w-4 h-4 mr-2" />
                    )}
                    Enviar Consentimento
                  </Button>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Formulários de Consentimento</h2>
          <p className="text-gray-600">Gerencie consentimentos e termos de autorização</p>
        </div>
        <div className="flex items-center space-x-2">
          <Dialog open={showFormBuilder} onOpenChange={setShowFormBuilder}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Novo Formulário
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Criar Formulário de Consentimento</DialogTitle>
                <DialogDescription>
                  Configure um novo formulário de consentimento personalizado
                </DialogDescription>
              </DialogHeader>
              
              {/* Form Builder Content - This would be a complex form builder interface */}
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="formTitle">Título do Formulário *</Label>
                    <Input
                      id="formTitle"
                      value={newForm.title}
                      onChange={(e) => setNewForm(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Ex: Termo de Consentimento para Cirurgia"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="formType">Tipo de Formulário *</Label>
                    <Select
                      value={newForm.type}
                      onValueChange={(value) => setNewForm(prev => ({ ...prev, type: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        {FORM_TYPES.map(type => (
                          <SelectItem key={type.value} value={type.value}>
                            <div className="flex items-center space-x-2">
                              {type.icon}
                              <span>{type.label}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="formDescription">Descrição</Label>
                  <Textarea
                    id="formDescription"
                    value={newForm.description}
                    onChange={(e) => setNewForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Descreva o propósito e contexto do formulário"
                    rows={3}
                  />
                </div>

                <div className="flex items-center justify-end space-x-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowFormBuilder(false)}
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={saveForm}
                    disabled={!newForm.title || !newForm.type}
                  >
                    Salvar Formulário
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex items-center space-x-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Buscar formulários..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filtrar por tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Todos os tipos</SelectItem>
            {FORM_TYPES.map(type => (
              <SelectItem key={type.value} value={type.value}>
                <div className="flex items-center space-x-2">
                  {type.icon}
                  <span>{type.label}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList>
          <TabsTrigger value="forms">Formulários</TabsTrigger>
          <TabsTrigger value="responses">Respostas</TabsTrigger>
          <TabsTrigger value="analytics">Análises</TabsTrigger>
        </TabsList>
        
        <TabsContent value="forms" className="space-y-4">
          {filteredForms.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Nenhum formulário encontrado
                </h3>
                <p className="text-gray-600 mb-4">
                  {searchTerm || filterType ? 'Tente ajustar os filtros de busca' : 'Crie seu primeiro formulário de consentimento'}
                </p>
                <Button onClick={() => setShowFormBuilder(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Criar Formulário
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredForms.map((form) => {
                const typeInfo = getFormTypeInfo(form.type);
                return (
                  <Card key={form.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg">{form.title}</CardTitle>
                          <CardDescription className="mt-1">
                            {form.description}
                          </CardDescription>
                        </div>
                        <Badge className={typeInfo.color}>
                          <div className="flex items-center space-x-1">
                            {typeInfo.icon}
                            <span className="text-xs">{typeInfo.label}</span>
                          </div>
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Versão:</span>
                          <span className="font-medium">{form.version}</span>
                        </div>
                        
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Status:</span>
                          <Badge className={form.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                            {form.isActive ? 'Ativo' : 'Inativo'}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Campos:</span>
                          <span className="font-medium">{form.content.fields.length}</span>
                        </div>
                        
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Retenção:</span>
                          <span className="font-medium">{form.retentionPeriod} anos</span>
                        </div>
                        
                        {form.dataCategories.length > 0 && (
                          <div className="space-y-1">
                            <span className="text-sm text-gray-600">Dados:</span>
                            <div className="flex flex-wrap gap-1">
                              {form.dataCategories.slice(0, 2).map(category => {
                                const categoryInfo = getDataCategoryInfo(category);
                                return (
                                  <Badge key={category} variant="outline" className="text-xs">
                                    {categoryInfo.icon}
                                    <span className="ml-1">{categoryInfo.label}</span>
                                  </Badge>
                                );
                              })}
                              {form.dataCategories.length > 2 && (
                                <Badge variant="outline" className="text-xs">
                                  +{form.dataCategories.length - 2}
                                </Badge>
                              )}
                            </div>
                          </div>
                        )}
                        
                        <div className="flex items-center justify-between pt-2 border-t">
                          <div className="text-xs text-gray-500">
                            {format(form.updatedAt, 'dd/MM/yyyy', { locale: ptBR })}
                          </div>
                          <div className="flex items-center space-x-1">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => loadForm(form.id)}
                            >
                              <Eye className="w-3 h-3" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setCurrentForm(form);
                                setSelectedTab('responses');
                              }}
                            >
                              <FileText className="w-3 h-3" />
                            </Button>
                            <Button variant="outline" size="sm">
                              <MoreVertical className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="responses" className="space-y-4">
          {responses.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <CheckCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Nenhuma resposta encontrada
                </h3>
                <p className="text-gray-600">
                  As respostas dos formulários aparecerão aqui
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {responses.map((response) => {
                const form = forms.find(f => f.id === response.formId);
                const typeInfo = form ? getFormTypeInfo(form.type) : null;
                return (
                  <Card key={response.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">
                            {form?.title || 'Formulário não encontrado'}
                          </CardTitle>
                          <CardDescription>
                            Respondido em {format(response.timestamp, 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                          </CardDescription>
                        </div>
                        <div className="flex items-center space-x-2">
                          {typeInfo && (
                            <Badge className={typeInfo.color}>
                              <div className="flex items-center space-x-1">
                                {typeInfo.icon}
                                <span>{typeInfo.label}</span>
                              </div>
                            </Badge>
                          )}
                          <Badge className={response.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                            {response.isActive ? 'Ativo' : 'Retirado'}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">Método:</span>
                            <div className="font-medium">
                              {CONSENT_METHODS.find(m => m.value === response.consentMethod)?.label || response.consentMethod}
                            </div>
                          </div>
                          <div>
                            <span className="text-gray-600">IP:</span>
                            <div className="font-medium">{response.ipAddress}</div>
                          </div>
                          <div>
                            <span className="text-gray-600">Consentimento:</span>
                            <div className={`font-medium ${response.consentGiven ? 'text-green-600' : 'text-red-600'}`}>
                              {response.consentGiven ? 'Concedido' : 'Negado'}
                            </div>
                          </div>
                        </div>
                        
                        {response.withdrawnAt && (
                          <Alert>
                            <AlertTriangle className="w-4 h-4" />
                            <AlertDescription>
                              <strong>Consentimento retirado</strong> em {format(response.withdrawnAt, 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                              {response.withdrawalReason && (
                                <span className="block mt-1">Motivo: {response.withdrawalReason}</span>
                              )}
                            </AlertDescription>
                          </Alert>
                        )}
                        
                        <div className="flex items-center justify-end space-x-2">
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4 mr-1" />
                            Ver Detalhes
                          </Button>
                          <Button variant="outline" size="sm">
                            <Download className="w-4 h-4 mr-1" />
                            Exportar
                          </Button>
                          {response.isActive && allowWithdrawal && (
                            <Button variant="outline" size="sm" className="text-red-600">
                              <X className="w-4 h-4 mr-1" />
                              Retirar
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <FileText className="w-8 h-8 text-blue-600" />
                  <div>
                    <div className="text-2xl font-bold">{forms.length}</div>
                    <div className="text-sm text-gray-600">Formulários</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                  <div>
                    <div className="text-2xl font-bold">{responses.filter(r => r.isActive).length}</div>
                    <div className="text-sm text-gray-600">Consentimentos Ativos</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <X className="w-8 h-8 text-red-600" />
                  <div>
                    <div className="text-2xl font-bold">{responses.filter(r => !r.isActive).length}</div>
                    <div className="text-sm text-gray-600">Consentimentos Retirados</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <Shield className="w-8 h-8 text-purple-600" />
                  <div>
                    <div className="text-2xl font-bold">
                      {responses.filter(r => r.consentMethod === 'digital_signature').length}
                    </div>
                    <div className="text-sm text-gray-600">Assinaturas Digitais</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}