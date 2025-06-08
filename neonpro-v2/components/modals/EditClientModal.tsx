"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  X,
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  FileText,
  Save,
} from "lucide-react";
import {
  updateClienteSchema,
  type UpdateClienteFormData,
  transformApiDataToForm,
  transformFormDataToApi,
} from "@/lib/validations/cliente";
import { useClientes } from "@/hooks/use-clientes";
import { Cliente } from "@/lib/types/cliente";

interface EditClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  cliente: Cliente | null;
}

export function EditClientModal({
  isOpen,
  onClose,
  cliente,
}: EditClientModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { updateCliente } = useClientes();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<UpdateClienteFormData>({
    resolver: zodResolver(updateClienteSchema),
  });

  // Pre-populate form when cliente changes
  useEffect(() => {
    if (cliente && isOpen) {
      const formData = transformApiDataToForm(cliente);
      setValue("id", cliente.id);
      setValue("name", formData.name);
      setValue("email", formData.email);
      setValue("phone", formData.phone);
      setValue("birth_date", formData.birth_date);
      setValue("address", formData.address);
      setValue("notes", formData.notes);
      setValue("is_active", formData.is_active);
    }
  }, [cliente, isOpen, setValue]);

  const onSubmit = async (data: UpdateClienteFormData) => {
    if (!cliente) return;

    try {
      setIsSubmitting(true);
      const apiData = {
        id: cliente.id,
        ...transformFormDataToApi(data),
      };
      await updateCliente(apiData);
      onClose();
    } catch (error) {
      console.error("Erro ao atualizar cliente:", error);
      alert("Erro ao atualizar cliente. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  if (!isOpen || !cliente) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <User className="h-6 w-6 text-indigo-600" />
            <h2 className="text-xl font-bold text-gray-900">Editar Cliente</h2>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={isSubmitting}
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          {/* Hidden ID field */}
          <input {...register("id")} type="hidden" />

          {/* Nome */}
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Nome *
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                {...register("name")}
                type="text"
                id="name"
                className={`w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  errors.name ? "border-red-300" : "border-gray-300"
                }`}
                placeholder="Digite o nome completo"
                disabled={isSubmitting}
              />
            </div>
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                {...register("email")}
                type="email"
                id="email"
                className={`w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  errors.email ? "border-red-300" : "border-gray-300"
                }`}
                placeholder="exemplo@email.com"
                disabled={isSubmitting}
              />
            </div>
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Telefone */}
          <div>
            <label
              htmlFor="phone"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Telefone
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                {...register("phone")}
                type="tel"
                id="phone"
                className={`w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  errors.phone ? "border-red-300" : "border-gray-300"
                }`}
                placeholder="(11) 99999-9999"
                disabled={isSubmitting}
              />
            </div>
            {errors.phone && (
              <p className="mt-1 text-sm text-red-600">
                {errors.phone.message}
              </p>
            )}
          </div>

          {/* Data de Nascimento */}
          <div>
            <label
              htmlFor="birth_date"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Data de Nascimento
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                {...register("birth_date")}
                type="date"
                id="birth_date"
                className={`w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  errors.birth_date ? "border-red-300" : "border-gray-300"
                }`}
                disabled={isSubmitting}
              />
            </div>
            {errors.birth_date && (
              <p className="mt-1 text-sm text-red-600">
                {errors.birth_date.message}
              </p>
            )}
          </div>

          {/* Endereço */}
          <div>
            <label
              htmlFor="address"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Endereço
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <textarea
                {...register("address")}
                id="address"
                rows={3}
                className={`w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none ${
                  errors.address ? "border-red-300" : "border-gray-300"
                }`}
                placeholder="Rua, número, bairro, cidade, CEP"
                disabled={isSubmitting}
              />
            </div>
            {errors.address && (
              <p className="mt-1 text-sm text-red-600">
                {errors.address.message}
              </p>
            )}
          </div>

          {/* Observações */}
          <div>
            <label
              htmlFor="notes"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Observações
            </label>
            <div className="relative">
              <FileText className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <textarea
                {...register("notes")}
                id="notes"
                rows={4}
                className={`w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none ${
                  errors.notes ? "border-red-300" : "border-gray-300"
                }`}
                placeholder="Informações adicionais sobre o cliente"
                disabled={isSubmitting}
              />
            </div>
            {errors.notes && (
              <p className="mt-1 text-sm text-red-600">
                {errors.notes.message}
              </p>
            )}
          </div>

          {/* Status */}
          <div>
            <label className="flex items-center space-x-2">
              <input
                {...register("is_active")}
                type="checkbox"
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                disabled={isSubmitting}
              />
              <span className="text-sm font-medium text-gray-700">
                Cliente ativo
              </span>
            </label>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              disabled={isSubmitting}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Salvando...</span>
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  <span>Atualizar Cliente</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
