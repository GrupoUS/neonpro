import {
  AlertCircle,
  Check,
  Clock,
  Contact,
  Mail,
  Phone,
  Search,
  Star,
  UserPlus,
  X,
} from 'lucide-react'
import * as React from 'react'

interface ContactData {
  id?: string
  name: string
  email?: string
  phone?: string
  isPatient?: boolean
  lastVisit?: Date
  isFavorite?: boolean
}

interface PWAContactIntegrationProps {
  className?: string
  onContactSelect?: (contact: ContactData) => void
  onContactImport?: (contacts: ContactData[]) => void
  showFavorites?: boolean
  maxContacts?: number
}

export const PWAContactIntegration: React.FC<PWAContactIntegrationProps> = ({
  className,
  onContactSelect,
  onContactImport,
  showFavorites = false,
  maxContacts = 50,
}) => {
  const [contacts, setContacts] = React.useState<ContactData[]>([])
  const [filteredContacts, setFilteredContacts] = React.useState<ContactData[]>([])
  const [selectedContacts, setSelectedContacts] = React.useState<string[]>([])
  const [searchTerm, setSearchTerm] = React.useState('')
  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [hasPermission, setHasPermission] = React.useState(false)
  const [showImportModal, setShowImportModal] = React.useState(false)
  const [importPreview, setImportPreview] = React.useState<ContactData[]>([])

  React.useEffect(() => {
    checkContactsPermission()
    loadExistingContacts()
  }, [])

  React.useEffect(() => {
    filterContacts()
  }, [contacts, searchTerm, showFavorites])

  const checkContactsPermission = async () => {
    if ('contacts' in navigator) {
      try {
        // @ts-ignore - Contacts API is experimental
        const status = await navigator.permissions.query({ name: 'contacts' })
        setHasPermission(status.state === 'granted')
      } catch {
        setHasPermission(false)
      }
    }
  }

  const loadExistingContacts = () => {
    // Load contacts from local storage or database
    const stored = localStorage.getItem('neonpro-contacts')
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        setContacts(parsed)
      } catch {
        setContacts([])
      }
    }
  }

  const saveContacts = (updatedContacts: ContactData[]) => {
    setContacts(updatedContacts)
    localStorage.setItem('neonpro-contacts', JSON.stringify(updatedContacts))
  }

  const filterContacts = () => {
    let filtered = contacts

    if (searchTerm) {
      filtered = filtered.filter(contact =>
        contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.phone?.includes(searchTerm)
      )
    }

    if (showFavorites) {
      filtered = filtered.filter(contact => contact.isFavorite)
    }

    setFilteredContacts(filtered)
  }

  const requestContactsAccess = async () => {
    setIsLoading(true)
    setError(null)

    try {
      if ('contacts' in navigator) {
        // @ts-ignore - Contacts API is experimental
        const contactsList = await navigator.contacts.select(
          ['name', 'email', 'tel'],
          { multiple: true },
        )

        if (contactsList.length > 0) {
          const newContacts: ContactData[] = contactsList.map((contact, index) => ({
            id: `imported-${Date.now()}-${index}`,
            name: contact.name.join(' ') || 'Contato sem nome',
            email: contact.email?.[0],
            phone: contact.tel?.[0],
            isPatient: false,
            isFavorite: false,
          }))

          setImportPreview(newContacts.slice(0, maxContacts))
          setShowImportModal(true)
        }
      } else {
        setError('Seu dispositivo não suporta acesso a contatos')
      }
    } catch (err) {
      console.error('Contacts access error:', err)
      setError('Não foi possível acessar os contatos. Verifique as permissões.')
    } finally {
      setIsLoading(false)
    }
  }

  const confirmImport = () => {
    const updatedContacts = [...contacts, ...importPreview]
    saveContacts(updatedContacts)
    onContactImport?.(importPreview)
    setShowImportModal(false)
    setImportPreview([])
    setHasPermission(true)
  }

  const toggleContactSelection = (contactId: string) => {
    setSelectedContacts(prev =>
      prev.includes(contactId)
        ? prev.filter(id => id !== contactId)
        : [...prev, contactId]
    )
  }

  const toggleFavorite = (contactId: string) => {
    const updatedContacts = contacts.map(contact =>
      contact.id === contactId
        ? { ...contact, isFavorite: !contact.isFavorite }
        : contact
    )
    saveContacts(updatedContacts)
  }

  const markAsPatient = (contactId: string) => {
    const updatedContacts = contacts.map(contact =>
      contact.id === contactId
        ? { ...contact, isPatient: true, lastVisit: new Date() }
        : contact
    )
    saveContacts(updatedContacts)
  }

  const addManualContact = () => {
    const name = prompt('Nome do contato:')
    if (!name) return

    const phone = prompt('Telefone (opcional):')
    const email = prompt('Email (opcional):')

    const newContact: ContactData = {
      id: `manual-${Date.now()}`,
      name,
      phone: phone || undefined,
      email: email || undefined,
      isPatient: false,
      isFavorite: false,
    }

    const updatedContacts = [...contacts, newContact]
    saveContacts(updatedContacts)
  }

  const formatDate = (date?: Date) => {
    if (!date) return ''
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return 'Hoje'
    if (diffDays === 1) return 'Ontem'
    if (diffDays < 7) return `${diffDays} dias atrás`
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} semanas atrás`
    return `${Math.floor(diffDays / 30)} meses atrás`
  }

  return (
    <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
      <div className='flex items-center justify-between mb-6'>
        <div className='flex items-center'>
          <div className='flex-shrink-0'>
            <div className='h-8 w-8 bg-green-600 rounded-lg flex items-center justify-center'>
              <Contact className='h-5 w-5 text-white' />
            </div>
          </div>
          <div className='ml-3'>
            <h3 className='text-lg font-medium text-gray-900'>
              Contatos
            </h3>
            <p className='text-sm text-gray-500'>
              Gerencie contatos de pacientes e profissionais
            </p>
          </div>
        </div>

        <div className='flex items-center space-x-2'>
          {hasPermission && (
            <button
              onClick={addManualContact}
              className='p-2 text-gray-400 hover:text-gray-600'
              title='Adicionar contato manualmente'
            >
              <UserPlus className='h-5 w-5' />
            </button>
          )}
          <button
            onClick={requestContactsAccess}
            disabled={isLoading}
            className='px-3 py-1 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 disabled:opacity-50 flex items-center'
          >
            {isLoading
              ? <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white' />
              : (
                <>
                  <Contact className='h-4 w-4 mr-1' />
                  Importar
                </>
              )}
          </button>
        </div>
      </div>

      {/* Search and Filter */}
      <div className='mb-4'>
        <div className='relative'>
          <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400' />
          <input
            type='text'
            placeholder='Buscar contatos...'
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className='w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent'
          />
        </div>

        <div className='flex items-center mt-2 space-x-4'>
          <label className='flex items-center text-sm'>
            <input
              type='checkbox'
              checked={showFavorites}
              onChange={e => setShowFavorites(e.target.checked)}
              className='mr-2'
            />
            <Star className='h-4 w-4 text-yellow-500 mr-1' />
            Favoritos
          </label>

          {selectedContacts.length > 0 && (
            <span className='text-sm text-gray-600'>
              {selectedContacts.length} selecionado(s)
            </span>
          )}
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className='mb-4 p-3 bg-red-50 border border-red-200 rounded-md'>
          <div className='flex items-center'>
            <AlertCircle className='h-4 w-4 text-red-400 mr-2' />
            <span className='text-sm text-red-800'>{error}</span>
          </div>
        </div>
      )}

      {/* Contacts List */}
      <div className='space-y-2 max-h-96 overflow-y-auto'>
        {filteredContacts.length === 0
          ? (
            <div className='text-center py-8'>
              <Contact className='mx-auto h-12 w-12 text-gray-400 mb-4' />
              <p className='text-gray-500'>
                {searchTerm ? 'Nenhum contato encontrado' : 'Nenhum contato importado'}
              </p>
              {!hasPermission && (
                <button
                  onClick={requestContactsAccess}
                  className='mt-4 text-green-600 hover:text-green-700 font-medium'
                >
                  Importar contatos do dispositivo
                </button>
              )}
            </div>
          )
          : (
            filteredContacts.map(contact => (
              <div
                key={contact.id}
                className={`border rounded-lg p-3 hover:bg-gray-50 transition-colors ${
                  selectedContacts.includes(contact.id!)
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200'
                }`}
              >
                <div className='flex items-start justify-between'>
                  <div className='flex items-start space-x-3 flex-1'>
                    <input
                      type='checkbox'
                      checked={selectedContacts.includes(contact.id!)}
                      onChange={() => toggleContactSelection(contact.id!)}
                      className='mt-1'
                    />

                    <div className='flex-1 min-w-0'>
                      <div className='flex items-center space-x-2'>
                        <h4 className='text-sm font-medium text-gray-900 truncate'>
                          {contact.name}
                        </h4>
                        {contact.isFavorite && (
                          <Star className='h-4 w-4 text-yellow-500 fill-current' />
                        )}
                        {contact.isPatient && (
                          <span className='inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800'>
                            Paciente
                          </span>
                        )}
                      </div>

                      <div className='mt-1 space-y-1'>
                        {contact.phone && (
                          <div className='flex items-center text-xs text-gray-600'>
                            <Phone className='h-3 w-3 mr-1' />
                            {contact.phone}
                          </div>
                        )}
                        {contact.email && (
                          <div className='flex items-center text-xs text-gray-600'>
                            <Mail className='h-3 w-3 mr-1' />
                            {contact.email}
                          </div>
                        )}
                        {contact.lastVisit && (
                          <div className='flex items-center text-xs text-gray-500'>
                            <Clock className='h-3 w-3 mr-1' />
                            Última visita: {formatDate(contact.lastVisit)}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className='flex items-center space-x-1 ml-2'>
                    <button
                      onClick={() => toggleFavorite(contact.id!)}
                      className={`p-1 rounded ${
                        contact.isFavorite
                          ? 'text-yellow-500 bg-yellow-50'
                          : 'text-gray-400 hover:text-gray-600'
                      }`}
                      title={contact.isFavorite ? 'Remover favorito' : 'Adicionar favorito'}
                    >
                      <Star className='h-4 w-4' />
                    </button>

                    {!contact.isPatient && (
                      <button
                        onClick={() => markAsPatient(contact.id!)}
                        className='p-1 text-gray-400 hover:text-blue-600'
                        title='Marcar como paciente'
                      >
                        <UserPlus className='h-4 w-4' />
                      </button>
                    )}

                    <button
                      onClick={() => onContactSelect?.(contact)}
                      className='p-1 text-gray-400 hover:text-green-600'
                      title='Selecionar contato'
                    >
                      <Check className='h-4 w-4' />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
      </div>

      {/* Import Confirmation Modal */}
      {showImportModal && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50'>
          <div className='bg-white rounded-lg p-6 max-w-md w-full'>
            <h3 className='text-lg font-medium text-gray-900 mb-4'>
              Confirmar Importação
            </h3>

            <p className='text-sm text-gray-600 mb-4'>
              {importPreview.length} contatos encontrados. Deseja importá-los para o NeonPro?
            </p>

            <div className='mb-4 max-h-48 overflow-y-auto border rounded-md'>
              {importPreview.slice(0, 10).map((contact, index) => (
                <div key={index} className='p-2 border-b last:border-b-0'>
                  <p className='text-sm font-medium'>{contact.name}</p>
                  {contact.phone && <p className='text-xs text-gray-600'>{contact.phone}</p>}
                  {contact.email && <p className='text-xs text-gray-600'>{contact.email}</p>}
                </div>
              ))}
              {importPreview.length > 10 && (
                <p className='text-xs text-gray-500 p-2 text-center'>
                  +{importPreview.length - 10} mais contatos...
                </p>
              )}
            </div>

            <div className='flex justify-end space-x-3'>
              <button
                onClick={() => setShowImportModal(false)}
                className='px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200'
              >
                Cancelar
              </button>
              <button
                onClick={confirmImport}
                className='px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700'
              >
                Importar {importPreview.length} contatos
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
