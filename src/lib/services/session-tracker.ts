import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies, headers } from 'next/headers'

interface SessionInfo {
  id: string
  userId: string
  deviceInfo: {
    browser: string
    browserVersion: string
    os: string
    osVersion: string
    device: string
  }
  ipAddress: string
  location?: {
    country: string
    city: string
    region: string
  }
  userAgent: string
  createdAt: Date
  lastActiveAt: Date
  expiresAt: Date
  isCurrent: boolean
}

// Parse user agent to extract device info
export function parseUserAgent(userAgent: string): SessionInfo['deviceInfo'] {
  // Browser detection
  let browser = 'Unknown'
  let browserVersion = ''

  if (userAgent.includes('Chrome')) {
    browser = 'Chrome'
    browserVersion = userAgent.match(/Chrome\/(\d+)/)?.[1] || ''
  } else if (userAgent.includes('Firefox')) {
    browser = 'Firefox'
    browserVersion = userAgent.match(/Firefox\/(\d+)/)?.[1] || ''
  } else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
    browser = 'Safari'
    browserVersion = userAgent.match(/Version\/(\d+)/)?.[1] || ''
  } else if (userAgent.includes('Edge')) {
    browser = 'Edge'
    browserVersion = userAgent.match(/Edge\/(\d+)/)?.[1] || ''
  }

  // OS detection
  let os = 'Unknown'
  let osVersion = ''

  if (userAgent.includes('Windows')) {
    os = 'Windows'
    if (userAgent.includes('Windows NT 10')) osVersion = '10'
    else if (userAgent.includes('Windows NT 11')) osVersion = '11'
  } else if (userAgent.includes('Mac OS X')) {
    os = 'macOS'
    osVersion = userAgent.match(/Mac OS X (\d+[._]\d+)/)?.[1]?.replace('_', '.') || ''
  } else if (userAgent.includes('Linux')) {
    os = 'Linux'
  } else if (userAgent.includes('Android')) {
    os = 'Android'
    osVersion = userAgent.match(/Android (\d+)/)?.[1] || ''
  } else if (userAgent.includes('iOS')) {
    os = 'iOS'
    osVersion = userAgent.match(/OS (\d+)/)?.[1] || ''
  }

  // Device type detection
  let device = 'Desktop'
  if (userAgent.includes('Mobile')) device = 'Mobile'
  else if (userAgent.includes('Tablet')) device = 'Tablet'

  return {
    browser,
    browserVersion,
    os,
    osVersion,
    device,
  }
}

// Get client IP address
export function getClientIp(): string {
  const headersList = headers()

  // Check various headers for IP
  const forwardedFor = headersList.get('x-forwarded-for')
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim()
  }

  const realIp = headersList.get('x-real-ip')
  if (realIp) {
    return realIp
  }

  return '0.0.0.0'
}

// Get geolocation from IP (using a free service)
export async function getLocationFromIp(ip: string): Promise<SessionInfo['location'] | undefined> {
  try {
    // Skip for localhost
    if (ip === '0.0.0.0' || ip === '127.0.0.1' || ip === '::1') {
      return undefined
    }

    // Using ip-api.com (free tier: 45 requests per minute)
    const response = await fetch(`http://ip-api.com/json/${ip}?fields=status,country,city,regionName`)

    if (!response.ok) {
      return undefined
    }

    const data = await response.json()

    if (data.status !== 'success') {
      return undefined
    }

    return {
      country: data.country || 'Unknown',
      city: data.city || 'Unknown',
      region: data.regionName || 'Unknown',
    }
  } catch (error) {
    console.error('Failed to get location from IP:', error)
    return undefined
  }
}

// Create a new session
export async function createSession(userId: string, sessionId: string): Promise<SessionInfo> {
  const headersList = headers()
  const userAgent = headersList.get('user-agent') || ''
  const ipAddress = getClientIp()
  const deviceInfo = parseUserAgent(userAgent)
  const location = await getLocationFromIp(ipAddress)

  const supabase = createRouteHandlerClient({ cookies })

  const sessionInfo: SessionInfo = {
    id: sessionId,
    userId,
    deviceInfo,
    ipAddress,
    location,
    userAgent,
    createdAt: new Date(),
    lastActiveAt: new Date(),
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    isCurrent: true,
  }

  // Store session in database
  await supabase
    .from('user_sessions')
    .insert({
      id: sessionInfo.id,
      user_id: sessionInfo.userId,
      device_info: sessionInfo.deviceInfo,
      ip_address: sessionInfo.ipAddress,
      location: sessionInfo.location,
      user_agent: sessionInfo.userAgent,
      created_at: sessionInfo.createdAt.toISOString(),
      last_active_at: sessionInfo.lastActiveAt.toISOString(),
      expires_at: sessionInfo.expiresAt.toISOString(),
      is_current: sessionInfo.isCurrent,
    })

  return sessionInfo
}

// Update session activity
export async function updateSessionActivity(sessionId: string): Promise<void> {
  const supabase = createRouteHandlerClient({ cookies })

  await supabase
    .from('user_sessions')
    .update({
      last_active_at: new Date().toISOString(),
    })
    .eq('id', sessionId)
}

// Get all sessions for a user
export async function getUserSessions(userId: string): Promise<SessionInfo[]> {
  const supabase = createRouteHandlerClient({ cookies })

  const { data, error } = await supabase
    .from('user_sessions')
    .select('*')
    .eq('user_id', userId)
    .order('last_active_at', { ascending: false })

  if (error || !data) {
    return []
  }

  return data.map(session => ({
    id: session.id,
    userId: session.user_id,
    deviceInfo: session.device_info,
    ipAddress: session.ip_address,
    location: session.location,
    userAgent: session.user_agent,
    createdAt: new Date(session.created_at),
    lastActiveAt: new Date(session.last_active_at),
    expiresAt: new Date(session.expires_at),
    isCurrent: session.is_current,
  }))
}

// Revoke a session
export async function revokeSession(sessionId: string, userId: string): Promise<void> {
  const supabase = createRouteHandlerClient({ cookies })

  await supabase
    .from('user_sessions')
    .delete()
    .eq('id', sessionId)
    .eq('user_id', userId)
}

// Revoke all sessions except current
export async function revokeAllSessions(userId: string, exceptSessionId?: string): Promise<void> {
  const supabase = createRouteHandlerClient({ cookies })

  let query = supabase
    .from('user_sessions')
    .delete()
    .eq('user_id', userId)

  if (exceptSessionId) {
    query = query.neq('id', exceptSessionId)
  }

  await query
}

// Clean up expired sessions
export async function cleanupExpiredSessions(): Promise<void> {
  const supabase = createRouteHandlerClient({ cookies })

  await supabase
    .from('user_sessions')
    .delete()
    .lt('expires_at', new Date().toISOString())
}
