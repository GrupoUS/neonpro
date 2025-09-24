/**
 * Event Modal Component
 */

import React from 'react'
import type { EventModalProps } from '../../types/event-calendar'
import { formatCalendarDate, formatCalendarTime } from './utils'

export function EventModal({
  event,
  isOpen,
  onClose,
  onEdit,
  onDelete,
  canEdit,
  canDelete,
}: EventModalProps) {
  if (!isOpen || !event) return null

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      scheduled: 'Agendado',
      confirmed: 'Confirmado',
      in_progress: 'Em Andamento',
      completed: 'Concluído',
      cancelled: 'Cancelado',
      no_show: 'Não Compareceu',
    }
    return labels[status] || status
  }

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      appointment: 'Consulta',
      consultation: 'Avaliação',
      procedure: 'Procedimento',
      follow_up: 'Retorno',
      blocker: 'Bloqueio',
    }
    return labels[type] || type
  }

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
      <div className='bg-white rounded-lg shadow-xl w-full max-w-md mx-4'>
        <div className='p-6'>
          <div className='flex justify-between items-start mb-4'>
            <h2 className='text-xl font-semibold text-gray-800'>
              {event.title}
            </h2>
            <button
              onClick={onClose}
              className='text-gray-400 hover:text-gray-600 text-xl'
            >
              ×
            </button>
          </div>

          <div className='space-y-4'>
            {/* Date and Time */}
            <div className='grid grid-cols-2 gap-4'>
              <div>
                <label className='text-sm font-medium text-gray-500'>Data</label>
                <p className='text-gray-800'>
                  {formatCalendarDate(event.start, "dd 'de' MMMM 'de' yyyy")}
                </p>
              </div>
              <div>
                <label className='text-sm font-medium text-gray-500'>Horário</label>
                <p className='text-gray-800'>
                  {formatCalendarTime(event.start)} - {formatCalendarTime(event.end)}
                </p>
              </div>
            </div>

            {/* Type and Status */}
            <div className='grid grid-cols-2 gap-4'>
              <div>
                <label className='text-sm font-medium text-gray-500'>Tipo</label>
                <p className='text-gray-800'>{getTypeLabel(event.type)}</p>
              </div>
              <div>
                <label className='text-sm font-medium text-gray-500'>Status</label>
                <p
                  className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                    event.status === 'completed'
                      ? 'bg-green-100 text-green-800'
                      : event.status === 'cancelled'
                      ? 'bg-red-100 text-red-800'
                      : event.status === 'in_progress'
                      ? 'bg-yellow-100 text-yellow-800'
                      : event.status === 'no_show'
                      ? 'bg-gray-100 text-gray-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}
                >
                  {getStatusLabel(event.status)}
                </p>
              </div>
            </div>

            {/* Patient Information */}
            {event.patientName && (
              <div>
                <label className='text-sm font-medium text-gray-500'>Paciente</label>
                <p className='text-gray-800'>{event.patientName}</p>
              </div>
            )}

            {/* Professional Information */}
            {event.professionalName && (
              <div>
                <label className='text-sm font-medium text-gray-500'>Profissional</label>
                <p className='text-gray-800'>{event.professionalName}</p>
              </div>
            )}

            {/* Notes */}
            {event.notes && (
              <div>
                <label className='text-sm font-medium text-gray-500'>Observações</label>
                <p className='text-gray-800 whitespace-pre-wrap'>{event.notes}</p>
              </div>
            )}

            {/* Reminder */}
            {event.reminder && (
              <div>
                <label className='text-sm font-medium text-gray-500'>Lembrete</label>
                <p className='text-gray-800'>
                  {event.reminderTime ? `${event.reminderTime} minutos antes` : 'Ativado'}
                </p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className='flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200'>
            <button
              onClick={onClose}
              className='px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors'
            >
              Fechar
            </button>
            {canEdit && (
              <button
                onClick={() => onEdit(event)}
                className='px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-md hover:bg-blue-600 transition-colors'
              >
                Editar
              </button>
            )}
            {canDelete && (
              <button
                onClick={() => onDelete(event.id)}
                className='px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-md hover:bg-red-600 transition-colors'
              >
                Excluir
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default EventModal
