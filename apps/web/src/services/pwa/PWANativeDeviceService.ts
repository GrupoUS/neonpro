/**
 * NeonPro PWA Native Device Integration Service
 *
 * Comprehensive service for managing native device features in the PWA
 * including camera, contacts, calendar, location, and other device APIs
 * specifically optimized for aesthetic clinic workflows.
 */

export interface DeviceCapability {
  id: string
  name: string
  available: boolean
  permission: 'granted' | 'denied' | 'prompt' | 'unsupported'
  lastUsed?: Date
  usageCount: number
}

export interface CameraPhoto {
  id: string
  dataUrl: string
  timestamp: Date
  location?: {
    latitude: number
    longitude: number
  }
  metadata: {
    patientId?: string
    procedureType: string
    beforeAfter: 'before' | 'after'
    notes?: string
    professionalId: string
    quality: 'high' | 'medium' | 'low'
    fileSize: number
    dimensions: {
      width: number
      height: number
    }
  }
}

export interface DeviceContact {
  id: string
  name: string
  email?: string
  phone?: string
  isPatient: boolean
  isFavorite: boolean
  lastVisit?: Date
  visitCount: number
  totalSpent?: number
  preferredServices?: string[]
  source: 'imported' | 'manual' | 'neonpro'
}

export interface CalendarEvent {
  id: string
  title: string
  description?: string
  startTime: Date
  endTime: Date
  location?: string
  isNeonProEvent: boolean
  eventType: 'appointment' | 'procedure' | 'consultation' | 'followup' | 'personal'
  patientId?: string
  professionalId?: string
  status: 'confirmed' | 'pending' | 'cancelled'
  syncedWithDevice: boolean
}

export interface LocationData {
  latitude: number
  longitude: number
  accuracy: number
  timestamp: Date
  address?: string
}

export class PWANativeDeviceService {
  private static instance: PWANativeDeviceService
  private capabilities: Map<string, DeviceCapability> = new Map()
  private isInitialized = false
  private eventHandlers: Record<string, Function> = {}

  // Storage keys
  private readonly STORAGE_KEYS = {
    CAPABILITIES: 'neonpro-device-capabilities',
    PHOTOS: 'neonpro-camera-photos',
    CONTACTS: 'neonpro-device-contacts',
    CALENDAR_EVENTS: 'neonpro-calendar-events',
    SETTINGS: 'neonpro-device-settings',
  }

  // Default settings
  private settings = {
    autoSyncCalendar: true,
    autoBackupPhotos: true,
    locationTracking: false,
    cameraQuality: 'high' as 'high' | 'medium' | 'low',
    maxStorageUsage: 500, // MB
    privacyMode: false,
  }

  private constructor() {}

  static getInstance(): PWANativeDeviceService {
    if (!PWANativeDeviceService.instance) {
      PWANativeDeviceService.instance = new PWANativeDeviceService()
    }
    return PWANativeDeviceService.instance
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return

    try {
      await this.loadSettings()
      await this.detectCapabilities()
      this.setupEventListeners()
      this.isInitialized = true

      console.log('NeonPro Native Device Service initialized successfully')
    } catch (error) {
      console.error('Failed to initialize Native Device Service:', error)
      throw error
    }
  }

  private async detectCapabilities(): Promise<void> {
    const capabilities: DeviceCapability[] = [
      {
        id: 'camera',
        name: 'Câmera',
        available: this.checkCameraAvailability(),
        permission: 'prompt',
        usageCount: 0,
      },
      {
        id: 'contacts',
        name: 'Contatos',
        available: this.checkContactsAvailability(),
        permission: 'prompt',
        usageCount: 0,
      },
      {
        id: 'calendar',
        name: 'Calendário',
        available: this.checkCalendarAvailability(),
        permission: 'prompt',
        usageCount: 0,
      },
      {
        id: 'location',
        name: 'Localização',
        available: this.checkLocationAvailability(),
        permission: 'prompt',
        usageCount: 0,
      },
      {
        id: 'notifications',
        name: 'Notificações',
        available: this.checkNotificationsAvailability(),
        permission: Notification.permission as any,
        usageCount: 0,
      },
      {
        id: 'microphone',
        name: 'Microfone',
        available: this.checkMicrophoneAvailability(),
        permission: 'prompt',
        usageCount: 0,
      },
      {
        id: 'vibration',
        name: 'Vibração',
        available: this.checkVibrationAvailability(),
        permission: 'granted',
        usageCount: 0,
      },
      {
        id: 'sharing',
        name: 'Compartilhamento',
        available: this.checkSharingAvailability(),
        permission: 'granted',
        usageCount: 0,
      },
    ]

    // Load stored capabilities
    const stored = localStorage.getItem(this.STORAGE_KEYS.CAPABILITIES)
    const storedCapabilities = stored ? JSON.parse(stored) : {}

    // Merge with detected capabilities
    capabilities.forEach((capability) => {
      const stored = storedCapabilities[capability.id]
      if (stored) {
        capability.lastUsed = stored.lastUsed ? new Date(stored.lastUsed) : undefined
        capability.usageCount = stored.usageCount || 0
      }
      this.capabilities.set(capability.id, capability)
    })

    this.saveCapabilities()
  }

  private checkCameraAvailability(): boolean {
    return 'mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices
  }

  private checkContactsAvailability(): boolean {
    return 'contacts' in navigator
  }

  private checkCalendarAvailability(): boolean {
    return 'calendar' in navigator
  }

  private checkLocationAvailability(): boolean {
    return 'geolocation' in navigator
  }

  private checkNotificationsAvailability(): boolean {
    return 'Notification' in window
  }

  private checkMicrophoneAvailability(): boolean {
    return 'mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices
  }

  private checkVibrationAvailability(): boolean {
    return 'vibrate' in navigator
  }

  private checkSharingAvailability(): boolean {
    return 'share' in navigator || 'canShare' in navigator
  }

  private setupEventListeners(): void {
    // Listen for online/offline events
    const handleOnline = () => this.handleOnline()
    const handleOffline = () => this.handleOffline()

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Listen for permission changes
    if ('permissions' in navigator) {
      navigator.permissions.addEventListener('change', this.handlePermissionChange)
    }

    // Listen for PWA install events
    const handleAppInstalled = () => this.handleAppInstalled()
    const handleBeforeInstall = (e: any) => this.handleBeforeInstall(e)

    window.addEventListener('appinstalled', handleAppInstalled)
    window.addEventListener('beforeinstallprompt', handleBeforeInstall)

    // Store event handlers for cleanup
    this.eventHandlers = {
      handleOnline,
      handleOffline,
      handleAppInstalled,
      handleBeforeInstall,
    }
  }

  private handleOnline(): void {
    console.log('Device online - syncing pending operations')
    this.syncPendingOperations()
  }

  private handleOffline(): void {
    console.log('Device offline - enabling offline mode')
  }

  private handlePermissionChange = (event: any): void => {
    const capability = this.capabilities.get(event.target.name)
    if (capability) {
      capability.permission = event.target.state
      this.saveCapabilities()
    }
  }

  private handleAppInstalled(): void {
    console.log('NeonPro PWA installed successfully')
    this.updateCapabilityUsage('notifications')
  }

  private handleBeforeInstall(event: any): void {
    console.log('PWA install prompt available')
    event.preventDefault()
  }

  // Camera Methods
  async requestCameraPermission(): Promise<boolean> {
    const capability = this.capabilities.get('camera')
    if (!capability?.available) return false

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
      })
      stream.getTracks().forEach((track) => track.stop())

      capability.permission = 'granted'
      this.updateCapabilityUsage('camera')
      return true
    } catch {
      capability.permission = 'denied'
      this.saveCapabilities()
      return false
    }
  }

  async capturePhoto(options: {
    patientId?: string
    procedureType: string
    beforeAfter: 'before' | 'after'
    notes?: string
  }): Promise<CameraPhoto | null> {
    if (!await this.requestCameraPermission()) return null

    try {
      // This would typically use the camera component
      // For now, we'll create a mock implementation
      const photo: CameraPhoto = {
        id: `photo-${Date.now()}`,
        dataUrl: '', // This would be the actual photo data
        timestamp: new Date(),
        metadata: {
          patientId: options.patientId,
          procedureType: options.procedureType,
          beforeAfter: options.beforeAfter,
          notes: options.notes,
          professionalId: 'current-user', // From auth context
          quality: this.settings.cameraQuality,
          fileSize: 0,
          dimensions: { width: 0, height: 0 },
        },
      }

      // Save photo
      await this.savePhoto(photo)
      this.updateCapabilityUsage('camera')

      return photo
    } catch (error) {
      console.error('Error capturing photo:', error)
      return null
    }
  }

  private async savePhoto(photo: CameraPhoto): Promise<void> {
    const photos = this.getStoredPhotos()
    photos.push(photo)

    // Check storage limits
    if (photos.length > 1000) {
      // Remove oldest photos
      photos.splice(0, photos.length - 1000)
    }

    localStorage.setItem(this.STORAGE_KEYS.PHOTOS, JSON.stringify(photos))
  }

  private getStoredPhotos(): CameraPhoto[] {
    const stored = localStorage.getItem(this.STORAGE_KEYS.PHOTOS)
    return stored ? JSON.parse(stored) : []
  }

  // Contacts Methods
  async requestContactsPermission(): Promise<boolean> {
    const capability = this.capabilities.get('contacts')
    if (!capability?.available) return false

    try {
      // @ts-ignore - Contacts API is experimental
      const contacts = await navigator.contacts.select(['name', 'email', 'tel'], {
        multiple: false,
      })
      capability.permission = 'granted'
      this.updateCapabilityUsage('contacts')
      return contacts.length > 0
    } catch {
      capability.permission = 'denied'
      this.saveCapabilities()
      return false
    }
  }

  async importContacts(): Promise<DeviceContact[]> {
    if (!await this.requestContactsPermission()) return []

    try {
      // @ts-ignore - Contacts API is experimental
      const contactsList = await navigator.contacts.select(
        ['name', 'email', 'tel'],
        { multiple: true },
      )

      const deviceContacts: DeviceContact[] = contactsList.map((contact, index) => ({
        id: `imported-${Date.now()}-${index}`,
        name: contact.name.join(' ') || 'Contato sem nome',
        email: contact.email?.[0],
        phone: contact.tel?.[0],
        isPatient: false,
        isFavorite: false,
        visitCount: 0,
        source: 'imported',
      }))

      // Save contacts
      await this.saveContacts(deviceContacts)
      this.updateCapabilityUsage('contacts')

      return deviceContacts
    } catch (error) {
      console.error('Error importing contacts:', error)
      return []
    }
  }

  private async saveContacts(contacts: DeviceContact[]): Promise<void> {
    const existingContacts = this.getStoredContacts()
    const updatedContacts = [...existingContacts, ...contacts]
    localStorage.setItem(this.STORAGE_KEYS.CONTACTS, JSON.stringify(updatedContacts))
  }

  private getStoredContacts(): DeviceContact[] {
    const stored = localStorage.getItem(this.STORAGE_KEYS.CONTACTS)
    return stored ? JSON.parse(stored) : []
  }

  // Calendar Methods
  async requestCalendarPermission(): Promise<boolean> {
    const capability = this.capabilities.get('calendar')
    if (!capability?.available) return false

    try {
      // @ts-ignore - Calendar API is experimental
      const calendars = await navigator.calendars.get()
      capability.permission = calendars.length > 0 ? 'granted' : 'denied'
      this.updateCapabilityUsage('calendar')
      return calendars.length > 0
    } catch {
      capability.permission = 'denied'
      this.saveCapabilities()
      return false
    }
  }

  async syncCalendar(): Promise<CalendarEvent[]> {
    if (!await this.requestCalendarPermission()) return []

    try {
      const deviceEvents: CalendarEvent[] = []

      // @ts-ignore - Calendar API is experimental
      const calendars = await navigator.calendars.get()

      for (const calendar of calendars) {
        // @ts-ignore - Calendar API is experimental
        const events = await calendar.events.list({
          timeMin: new Date().toISOString(),
          timeMax: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        })

        deviceEvents.push(...events.map((event: any) => ({
          id: `device-${event.id}`,
          title: event.title,
          description: event.description,
          startTime: new Date(event.start),
          endTime: new Date(event.end),
          location: event.location,
          isNeonProEvent: false,
          eventType: 'personal' as const,
          status: 'confirmed' as const,
          syncedWithDevice: true,
        })))
      }

      this.updateCapabilityUsage('calendar')
      return deviceEvents
    } catch (error) {
      console.error('Error syncing calendar:', error)
      return []
    }
  }

  // Location Methods
  async requestLocationPermission(): Promise<boolean> {
    const capability = this.capabilities.get('location')
    if (!capability?.available) return false

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        () => {
          capability.permission = 'granted'
          this.saveCapabilities()
          this.updateCapabilityUsage('location')
          resolve(true)
        },
        () => {
          capability.permission = 'denied'
          this.saveCapabilities()
          resolve(false)
        },
        { timeout: 5000 },
      )
    })
  }

  async getCurrentLocation(): Promise<LocationData | null> {
    if (!await this.requestLocationPermission()) return null

    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location: LocationData = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: new Date(),
          }

          this.updateCapabilityUsage('location')
          resolve(location)
        },
        reject,
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000,
        },
      )
    })
  }

  // Notification Methods
  async requestNotificationPermission(): Promise<boolean> {
    const capability = this.capabilities.get('notifications')
    if (!capability?.available) return false

    const permission = await Notification.requestPermission()
    capability.permission = permission as any
    this.saveCapabilities()

    if (permission === 'granted') {
      this.updateCapabilityUsage('notifications')
    }

    return permission === 'granted'
  }

  async showNotification(title: string, options: {
    body?: string
    icon?: string
    badge?: string
    tag?: string
    data?: any
    actions?: NotificationAction[]
  } = {}): Promise<boolean> {
    if (!await this.requestNotificationPermission()) return false

    try {
      await new Promise<void>((resolve) => {
        const notification = new Notification(title, {
          body: options.body,
          icon: options.icon || '/icons/icon-192x192.png',
          badge: options.badge || '/icons/badge-72x72.png',
          tag: options.tag,
          data: options.data,
          actions: options.actions,
        })

        notification.onclick = () => {
          notification.close()
          if (options.data?.url) {
            window.open(options.data.url, '_blank')
          }
          resolve()
        }

        setTimeout(resolve, 5000)
      })

      this.updateCapabilityUsage('notifications')
      return true
    } catch (error) {
      console.error('Error showing notification:', error)
      return false
    }
  }

  // Sharing Methods
  async shareContent(data: {
    title?: string
    text?: string
    url?: string
    files?: File[]
  }): Promise<boolean> {
    const capability = this.capabilities.get('sharing')
    if (!capability?.available) return false

    try {
      if ('share' in navigator) {
        await navigator.share(data)
      } else if ('canShare' in navigator) {
        // Fallback for browsers that don't support full sharing
        await navigator.share({
          title: data.title,
          text: data.text,
          url: data.url,
        })
      } else {
        return false
      }

      this.updateCapabilityUsage('sharing')
      return true
    } catch (error) {
      console.error('Error sharing content:', error)
      return false
    }
  }

  // Vibration Methods
  vibrate(pattern: number | number[] = 200): boolean {
    const capability = this.capabilities.get('vibration')
    if (!capability?.available) return false

    try {
      navigator.vibrate(pattern)
      this.updateCapabilityUsage('vibration')
      return true
    } catch {
      return false
    }
  }

  // Utility Methods
  private updateCapabilityUsage(capabilityId: string): void {
    const capability = this.capabilities.get(capabilityId)
    if (capability) {
      capability.usageCount++
      capability.lastUsed = new Date()
      this.saveCapabilities()
    }
  }

  private saveCapabilities(): void {
    const capabilitiesObject = Object.fromEntries(this.capabilities)
    localStorage.setItem(this.STORAGE_KEYS.CAPABILITIES, JSON.stringify(capabilitiesObject))
  }

  private async loadSettings(): Promise<void> {
    const stored = localStorage.getItem(this.STORAGE_KEYS.SETTINGS)
    if (stored) {
      try {
        this.settings = { ...this.settings, ...JSON.parse(stored) }
      } catch {
        // Use default settings
      }
    }
  }

  async updateSettings(newSettings: Partial<typeof this.settings>): Promise<void> {
    this.settings = { ...this.settings, ...newSettings }
    localStorage.setItem(this.STORAGE_KEYS.SETTINGS, JSON.stringify(this.settings))
  }

  getCapabilities(): DeviceCapability[] {
    return Array.from(this.capabilities.values())
  }

  getCapability(id: string): DeviceCapability | undefined {
    return this.capabilities.get(id)
  }

  private async syncPendingOperations(): Promise<void> {
    // Sync pending photos, contacts, calendar events, etc.
    console.log('Syncing pending operations...')

    // Implementation would depend on backend sync endpoints
  }

  // Cleanup method for proper event listener management
  cleanup(): void {
    if (this.eventHandlers) {
      // Remove all event listeners
      if (this.eventHandlers.handleOnline) {
        window.removeEventListener('online', this.eventHandlers.handleOnline)
      }
      if (this.eventHandlers.handleOffline) {
        window.removeEventListener('offline', this.eventHandlers.handleOffline)
      }
      if (this.eventHandlers.handleAppInstalled) {
        window.removeEventListener('appinstalled', this.eventHandlers.handleAppInstalled)
      }
      if (this.eventHandlers.handleBeforeInstall) {
        window.removeEventListener('beforeinstallprompt', this.eventHandlers.handleBeforeInstall)
      }

      // Remove permission change listener
      if ('permissions' in navigator) {
        navigator.permissions.removeEventListener('change', this.handlePermissionChange)
      }

      // Clear handlers
      this.eventHandlers = {}
    }

    // Clear capabilities if needed
    if (process.env.NODE_ENV === 'development') {
      this.capabilities.clear()
    }
  }

  // Analytics Methods
  getUsageStats(): {
    totalUsage: number
    mostUsedCapability: string | null
    usageByCapability: Record<string, number>
    lastUsedAll: Date | null
  } {
    const capabilities = Array.from(this.capabilities.values())
    const totalUsage = capabilities.reduce((sum, cap) => sum + cap.usageCount, 0)

    let mostUsedCapability: string | null = null
    let maxUsage = 0

    const usageByCapability: Record<string, number> = {}
    let lastUsedAll: Date | null = null

    capabilities.forEach((cap) => {
      usageByCapability[cap.id] = cap.usageCount
      if (cap.usageCount > maxUsage) {
        maxUsage = cap.usageCount
        mostUsedCapability = cap.id
      }
      if (cap.lastUsed && (!lastUsedAll || cap.lastUsed > lastUsedAll)) {
        lastUsedAll = cap.lastUsed
      }
    })

    return {
      totalUsage,
      mostUsedCapability,
      usageByCapability,
      lastUsedAll,
    }
  }

  // Storage Management
  async getStorageUsage(): Promise<{
    used: number
    total: number
    byType: Record<string, number>
  }> {
    const usage = {
      photos: 0,
      contacts: 0,
      calendar: 0,
      other: 0,
    }

    // Calculate actual storage usage
    Object.entries(localStorage).forEach(([key, value]) => {
      const size = new Blob([value]).size
      if (key.includes('photo')) usage.photos += size
      else if (key.includes('contact')) usage.contacts += size
      else if (key.includes('calendar')) usage.calendar += size
      else usage.other += size
    })

    const total = Object.values(usage).reduce((sum, size) => sum + size, 0)

    return {
      used: total,
      total: this.settings.maxStorageUsage * 1024 * 1024,
      byType: usage,
    }
  }

  async clearStorage(type?: 'photos' | 'contacts' | 'calendar'): Promise<void> {
    const keysToRemove: string[] = []

    Object.keys(localStorage).forEach((key) => {
      if (type) {
        if (key.includes(type)) keysToRemove.push(key)
      } else {
        if (key.startsWith('neonpro-')) keysToRemove.push(key)
      }
    })

    keysToRemove.forEach((key) => localStorage.removeItem(key))
  }
}

// Export singleton instance
export const nativeDeviceService = PWANativeDeviceService.getInstance()
