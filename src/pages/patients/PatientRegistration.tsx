
import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import PatientForm from '@/components/patients/PatientForm';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

const PatientRegistration = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (patientData: any) => {
    if (!user) {
      toast.error('Usuário não autenticado');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('clients')
        .insert([{
          ...patientData,
          user_id: user.id
        }]);

      if (error) {
        console.error('Erro ao cadastrar paciente:', error);
        toast.error('Erro ao cadastrar paciente');
        return;
      }

      toast.success('Paciente cadastrado com sucesso!');
    } catch (error) {
      console.error('Erro ao cadastrar paciente:', error);
      toast.error('Erro inesperado ao cadastrar paciente');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Cadastro de Paciente</h1>
        <p className="text-muted-foreground mt-2">
          Preencha as informações do paciente para realizar o cadastro
        </p>
      </div>

      <PatientForm onSubmit={handleSubmit} loading={loading} />
    </div>
  );
};

export default PatientRegistration;
