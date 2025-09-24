import * as React from "react";
import { Calendar, Clock, Plus, RefreshCw, AlertCircle, Check, X, User, MapPin, Video, Phone } from "lucide-react";

interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  location?: string;
  attendees?: string[];
  isNeonProEvent?: boolean;
  eventType?: 'appointment' | 'procedure' | 'consultation' | 'followup' | 'personal';
  patientId?: string;
  professionalId?: string;
  status?: 'confirmed' | 'pending' | 'cancelled';
}

interface PWACalendarIntegrationProps {
  className?: string;
  events?: CalendarEvent[];
  onEventSelect?: (event: CalendarEvent) => void;
  onEventCreate?: (event: Omit<CalendarEvent, 'id'>) => void;
  onSyncComplete?: (events: CalendarEvent[]) => void;
  showSyncButton?: boolean;
  autoSync?: boolean;
}

export const PWACalendarIntegration: React.FC<PWACalendarIntegrationProps> = ({
  className,
  events: propEvents = [],
  onEventSelect,
  onEventCreate,
  onSyncComplete,
  showSyncButton = true,
  autoSync = false
}) => {
  const [events, setEvents] = React.useState<CalendarEvent[]>(propEvents);
  const [filteredEvents, setFilteredEvents] = React.useState<CalendarEvent[]>([]);
  const [selectedDate, setSelectedDate] = React.useState(new Date());
  const [viewMode, setViewMode] = React.useState<'day' | 'week' | 'month'>('week');
  const [isSyncing, setIsSyncing] = React.useState(false);
  const [hasCalendarAccess, setHasCalendarAccess] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [showEventModal, setShowEventModal] = React.useState(false);
  const [newEvent, setNewEvent] = React.useState<Partial<CalendarEvent>>({});
  const [syncStatus, setSyncStatus] = React.useState<{
    lastSync?: Date;
    totalEvents: number;
    neonProEvents: number;
    deviceEvents: number;
  }>({
    totalEvents: 0,
    neonProEvents: 0,
    deviceEvents: 0
  });

  React.useEffect(() => {
    checkCalendarAccess();
    loadStoredEvents();
    
    if (autoSync && hasCalendarAccess) {
      performSync();
    }
  }, []);

  React.useEffect(() => {
    filterEventsByDate();
  }, [events, selectedDate, viewMode]);

  const checkCalendarAccess = async () => {
    if ('calendar' in navigator) {
      try {
        // @ts-ignore - Calendar API is experimental
        const status = await navigator.permissions.query({ name: 'calendar' });
        setHasCalendarAccess(status.state === 'granted');
      } catch {
        setHasCalendarAccess(false);
      }
    }
  };

  const loadStoredEvents = () => {
    const stored = localStorage.getItem('neonpro-calendar-events');
    const syncStatus = localStorage.getItem('neonpro-calendar-sync-status');
    
    if (stored) {
      try {
        const parsed = JSON.parse(stored).map((e: any) => ({
          ...e,
          startTime: new Date(e.startTime),
          endTime: new Date(e.endTime)
        }));
        setEvents(parsed);
      } catch {
        setEvents([]);
      }
    }

    if (syncStatus) {
      try {
        const parsed = JSON.parse(syncStatus);
        setSyncStatus({
          ...parsed,
          lastSync: new Date(parsed.lastSync)
        });
      } catch {
        setSyncStatus({
          totalEvents: 0,
          neonProEvents: 0,
          deviceEvents: 0
        });
      }
    }
  };

  const saveEvents = (updatedEvents: CalendarEvent[]) => {
    setEvents(updatedEvents);
    localStorage.setItem('neonpro-calendar-events', JSON.stringify(updatedEvents));
    
    const neonProCount = updatedEvents.filter(e => e.isNeonProEvent).length;
    const deviceCount = updatedEvents.filter(e => !e.isNeonProEvent).length;
    
    setSyncStatus(prev => ({
      ...prev,
      totalEvents: updatedEvents.length,
      neonProEvents: neonProCount,
      deviceEvents: deviceCount
    }));
  };

  const filterEventsByDate = () => {
    const now = new Date();
    let startDate: Date;
    let endDate: Date;

    switch (viewMode) {
      case 'day':
        startDate = new Date(selectedDate);
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(selectedDate);
        endDate.setHours(23, 59, 59, 999);
        break;
      
      case 'week':
        startDate = new Date(selectedDate);
        const dayOfWeek = startDate.getDay();
        startDate.setDate(startDate.getDate() - dayOfWeek);
        startDate.setHours(0, 0, 0, 0);
        
        endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 6);
        endDate.setHours(23, 59, 59, 999);
        break;
      
      case 'month':
        startDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
        endDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0);
        endDate.setHours(23, 59, 59, 999);
        break;
    }

    const filtered = events.filter(event => 
      event.startTime >= startDate && event.startTime <= endDate
    );

    // Sort by start time
    filtered.sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
    setFilteredEvents(filtered);
  };

  const performSync = async () => {
    if (!hasCalendarAccess || isSyncing) return;

    setIsSyncing(true);
    setError(null);

    try {
      if ('calendar' in navigator) {
        // @ts-ignore - Calendar API is experimental
        const calendars = await navigator.calendars.get();
        
        let deviceEvents: CalendarEvent[] = [];
        
        for (const calendar of calendars) {
          // @ts-ignore - Calendar API is experimental
          const events = await calendar.events.list({
            timeMin: new Date().toISOString(),
            timeMax: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days ahead
          });

          deviceEvents = deviceEvents.concat(events.map((event: any) => ({
            id: `device-${event.id}`,
            title: event.title,
            description: event.description,
            startTime: new Date(event.start),
            endTime: new Date(event.end),
            location: event.location,
            isNeonProEvent: false,
            eventType: 'personal'
          })));
        }

        // Merge with existing events, avoiding duplicates
        const existingDeviceIds = events
          .filter(e => !e.isNeonProEvent)
          .map(e => e.id);
        
        const newDeviceEvents = deviceEvents.filter(
          e => !existingDeviceIds.includes(e.id)
        );

        const updatedEvents = [...events, ...newDeviceEvents];
        saveEvents(updatedEvents);
        
        setSyncStatus(prev => ({
          ...prev,
          lastSync: new Date(),
          deviceEvents: updatedEvents.filter(e => !e.isNeonProEvent).length
        }));

        onSyncComplete?.(updatedEvents);
      }
    } catch (err) {
      console.error('Calendar sync error:', err);
      setError('Não foi possível sincronizar com o calendário do dispositivo');
    } finally {
      setIsSyncing(false);
    }
  };

  const requestCalendarAccess = async () => {
    try {
      if ('calendar' in navigator) {
        // @ts-ignore - Calendar API is experimental
        const calendars = await navigator.calendars.get();
        setHasCalendarAccess(calendars.length > 0);
        
        if (calendars.length > 0) {
          await performSync();
        }
      }
    } catch (err) {
      console.error('Calendar access error:', err);
      setError('Não foi possível acessar o calendário do dispositivo');
    }
  };

  const createNewEvent = () => {
    if (!newEvent.title || !newEvent.startTime || !newEvent.endTime) return;

    const event: CalendarEvent = {
      id: `neonpro-${Date.now()}`,
      title: newEvent.title,
      description: newEvent.description,
      startTime: newEvent.startTime,
      endTime: newEvent.endTime,
      location: newEvent.location,
      eventType: newEvent.eventType || 'appointment',
      isNeonProEvent: true,
      status: 'confirmed',
      patientId: newEvent.patientId,
      professionalId: newEvent.professionalId
    };

    const updatedEvents = [...events, event];
    saveEvents(updatedEvents);
    onEventCreate?.(event);
    
    setNewEvent({});
    setShowEventModal(false);
  };

  const getEventTypeColor = (eventType?: string) => {
    switch (eventType) {
      case 'appointment': return 'bg-blue-100 text-blue-800';
      case 'procedure': return 'bg-purple-100 text-purple-800';
      case 'consultation': return 'bg-green-100 text-green-800';
      case 'followup': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatEventTime = (date: Date) => {
    return date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate);
    
    switch (viewMode) {
      case 'day':
        newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
        break;
      case 'week':
        newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
        break;
      case 'month':
        newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
        break;
    }
    
    setSelectedDate(newDate);
  };

  return (
    <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Calendar className="h-5 w-5 text-white" />
            </div>
          </div>
          <div className="ml-3">
            <h3 className="text-lg font-medium text-gray-900">
              Agenda Integrada
            </h3>
            <p className="text-sm text-gray-500">
              Sincronize com o calendário do seu dispositivo
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {showSyncButton && (
            <button
              onClick={hasCalendarAccess ? performSync : requestCalendarAccess}
              disabled={isSyncing}
              className="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center"
            >
              {isSyncing ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-1" />
                  {hasCalendarAccess ? 'Sincronizar' : 'Conectar'}
                </>
              )}
            </button>
          )}
          
          <button
            onClick={() => setShowEventModal(true)}
            className="p-2 text-gray-400 hover:text-gray-600"
            title="Novo evento"
          >
            <Plus className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Sync Status */}
      {syncStatus.lastSync && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
          <div className="flex items-center justify-between text-sm">
            <span className="text-blue-800">
              Última sincronização: {syncStatus.lastSync.toLocaleString('pt-BR')}
            </span>
            <span className="text-blue-600">
              {syncStatus.neonProEvents} NeonPro + {syncStatus.deviceEvents} dispositivo
            </span>
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <div className="flex items-center">
            <AlertCircle className="h-4 w-4 text-red-400 mr-2" />
            <span className="text-sm text-red-800">{error}</span>
          </div>
        </div>
      )}

      {/* Date Navigation */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => navigateDate('prev')}
            className="p-2 text-gray-400 hover:text-gray-600"
          >
            ←
          </button>
          
          <div className="text-center">
            <h4 className="font-medium text-gray-900">
              {selectedDate.toLocaleDateString('pt-BR', {
                month: 'long',
                year: 'numeric'
              })}
            </h4>
            <p className="text-sm text-gray-500">
              {viewMode === 'day' && 'Visão Diária'}
              {viewMode === 'week' && 'Visão Semanal'}
              {viewMode === 'month' && 'Visão Mensal'}
            </p>
          </div>
          
          <button
            onClick={() => navigateDate('next')}
            className="p-2 text-gray-400 hover:text-gray-600"
          >
            →
          </button>
        </div>

        <div className="flex items-center space-x-1">
          <button
            onClick={() => setViewMode('day')}
            className={`px-3 py-1 text-sm rounded-md ${
              viewMode === 'day' ? 'bg-blue-100 text-blue-800' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Dia
          </button>
          <button
            onClick={() => setViewMode('week')}
            className={`px-3 py-1 text-sm rounded-md ${
              viewMode === 'week' ? 'bg-blue-100 text-blue-800' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Semana
          </button>
          <button
            onClick={() => setViewMode('month')}
            className={`px-3 py-1 text-sm rounded-md ${
              viewMode === 'month' ? 'bg-blue-100 text-blue-800' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Mês
          </button>
        </div>
      </div>

      {/* Events List */}
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {filteredEvents.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-500">
              Nenhum evento encontrado para este período
            </p>
          </div>
        ) : (
          filteredEvents.map((event) => (
            <div
              key={event.id}
              className={`border rounded-lg p-3 hover:bg-gray-50 transition-colors cursor-pointer ${
                event.isNeonProEvent ? 'border-blue-200' : 'border-gray-200'
              }`}
              onClick={() => onEventSelect?.(event)}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3 flex-1">
                  <div className="flex-shrink-0">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      event.isNeonProEvent ? 'bg-blue-100' : 'bg-gray-100'
                    }`}>
                      {event.eventType === 'appointment' && <Clock className="h-4 w-4 text-blue-600" />}
                      {event.eventType === 'procedure' && <User className="h-4 w-4 text-purple-600" />}
                      {event.eventType === 'consultation' && <Video className="h-4 w-4 text-green-600" />}
                      {event.eventType === 'followup' && <Phone className="h-4 w-4 text-yellow-600" />}
                      {!event.eventType && <Calendar className="h-4 w-4 text-gray-600" />}
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <h4 className="text-sm font-medium text-gray-900 truncate">
                        {event.title}
                      </h4>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getEventTypeColor(event.eventType)}`}>
                        {event.eventType || 'outro'}
                      </span>
                      {event.isNeonProEvent && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          NeonPro
                        </span>
                      )}
                    </div>
                    
                    <div className="text-xs text-gray-600 space-y-1">
                      <div className="flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {formatEventTime(event.startTime)} - {formatEventTime(event.endTime)}
                      </div>
                      
                      {event.location && (
                        <div className="flex items-center">
                          <MapPin className="h-3 w-3 mr-1" />
                          {event.location}
                        </div>
                      )}
                      
                      {event.description && (
                        <p className="text-gray-500 truncate">{event.description}</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center ml-2">
                  {event.status === 'confirmed' && (
                    <Check className="h-4 w-4 text-green-600" />
                  )}
                  {event.status === 'pending' && (
                    <Clock className="h-4 w-4 text-yellow-600" />
                  )}
                  {event.status === 'cancelled' && (
                    <X className="h-4 w-4 text-red-600" />
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* New Event Modal */}
      {showEventModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Novo Evento
              </h3>
              <button
                onClick={() => setShowEventModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Título
                </label>
                <input
                  type="text"
                  value={newEvent.title || ''}
                  onChange={(e) => setNewEvent(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="Consulta, procedimento, etc."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Início
                  </label>
                  <input
                    type="datetime-local"
                    value={newEvent.startTime ? newEvent.startTime.toISOString().slice(0, 16) : ''}
                    onChange={(e) => setNewEvent(prev => ({ ...prev, startTime: new Date(e.target.value) }))}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fim
                  </label>
                  <input
                    type="datetime-local"
                    value={newEvent.endTime ? newEvent.endTime.toISOString().slice(0, 16) : ''}
                    onChange={(e) => setNewEvent(prev => ({ ...prev, endTime: new Date(e.target.value) }))}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo
                </label>
                <select
                  value={newEvent.eventType || 'appointment'}
                  onChange={(e) => setNewEvent(prev => ({ ...prev, eventType: e.target.value as any }))}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="appointment">Agendamento</option>
                  <option value="procedure">Procedimento</option>
                  <option value="consultation">Consulta</option>
                  <option value="followup">Retorno</option>
                  <option value="personal">Pessoal</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Local (opcional)
                </label>
                <input
                  type="text"
                  value={newEvent.location || ''}
                  onChange={(e) => setNewEvent(prev => ({ ...prev, location: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="Clínica, sala, endereço"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descrição (opcional)
                </label>
                <textarea
                  value={newEvent.description || ''}
                  onChange={(e) => setNewEvent(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  rows={3}
                  placeholder="Observações sobre o evento"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowEventModal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Cancelar
              </button>
              <button
                onClick={createNewEvent}
                disabled={!newEvent.title || !newEvent.startTime || !newEvent.endTime}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                Criar Evento
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};