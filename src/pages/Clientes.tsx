import React, { useState } from 'react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import PatientList from '@/components/patients/PatientList';
import PatientForm from '@/components/patients/PatientForm';
import { usePatients } from '@/hooks/usePatients';
import type { Paciente, CreatePacienteData, UpdatePacienteData } from '@/types/patient';

const Clientes: React.FC = () => {
  const { patients, loading, error, createPatient, updatePatient, deletePatient } = usePatients();
  
  const [showPatientForm, setShowPatientForm] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Paciente | null>(null);
  const [deletingPatientId, setDeletingPatientId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleNewPatient = () => {
    setEditingPatient(null);
    setShowPatientForm(true);
  };

  const handleEditPatient = (patient: Paciente) => {
    setEditingPatient(patient);
    setShowPatientForm(true);
  };

  const handleDeletePatient = (patientId: string) => {
    setDeletingPatientId(patientId);
  };

  const confirmDeletePatient = async () => {
    if (!deletingPatientId) return;

    try {
      const success = await deletePatient(deletingPatientId);
      if (success) {
        toast.success('Paciente excluído com sucesso!');
      } else {
        toast.error('Erro ao excluir paciente. Tente novamente.');
      }
    } catch (err) {
      console.error('Error deleting patient:', err);
      toast.error('Erro ao excluir paciente. Tente novamente.');
    } finally {
      setDeletingPatientId(null);
    }
  };

  const handleSubmitPatient = async (data: CreatePacienteData | UpdatePacienteData) => {
    setIsSubmitting(true);
    
    try {
      let result: Paciente | null = null;

      if (editingPatient) {
        // Update existing patient
        result = await updatePatient(data as UpdatePacienteData);
        if (result) {
          toast.success('Paciente atualizado com sucesso!');
        }
      } else {
        // Create new patient
        result = await createPatient(data as CreatePacienteData);
        if (result) {
          toast.success('Paciente cadastrado com sucesso!');
        }
      }

      if (result) {
        setShowPatientForm(false);
        setEditingPatient(null);
      } else {
        toast.error('Erro ao salvar paciente. Tente novamente.');
      }
    } catch (err) {
      console.error('Error submitting patient:', err);
      toast.error('Erro ao salvar paciente. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelForm = () => {
    setShowPatientForm(false);
    setEditingPatient(null);
  };

  const deletingPatient = deletingPatientId 
    ? patients.find(p => p.id === deletingPatientId)
    : null;

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center py-8">
          <p className="text-red-600 mb-4">Erro ao carregar pacientes: {error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <PatientList
        patients={patients}
        loading={loading}
        onEdit={handleEditPatient}
        onDelete={handleDeletePatient}
        onNewPatient={handleNewPatient}
      />

      {/* Patient Form Dialog */}
      <Dialog open={showPatientForm} onOpenChange={setShowPatientForm}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingPatient ? 'Editar Paciente' : 'Novo Paciente'}
            </DialogTitle>
            <DialogDescription>
              {editingPatient 
                ? 'Atualize as informações do paciente selecionado.' 
                : 'Preencha os dados para cadastrar um novo paciente.'
              }
            </DialogDescription>
          </DialogHeader>
          <PatientForm
            patient={editingPatient || undefined}
            onSubmit={handleSubmitPatient}
            onCancel={handleCancelForm}
            isSubmitting={isSubmitting}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog 
        open={!!deletingPatientId} 
        onOpenChange={() => setDeletingPatientId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o paciente{' '}
              <strong>{deletingPatient?.nome}</strong>?
              <br />
              <br />
              Esta ação não pode ser desfeita e todos os dados relacionados 
              ao paciente serão removidos permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDeletePatient}
              className="bg-red-600 hover:bg-red-700"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Clientes;
