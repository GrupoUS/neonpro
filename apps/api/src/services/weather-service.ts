/**
 * Weather Service Integration
 * Provides weather data for appointment no-show prediction and healthcare operations
 */

export interface WeatherData {
  temperature: number // Celsius
  condition: string // e.g., 'sunny', 'rainy', 'cloudy'
  humidity: number // Percentage
  windSpeed: number // km/h
  precipitation: number // mm
  visibility: number // km
  uvIndex: number // UV index
  timestamp: Date
  location: {
    city: string
    state: string
    latitude: number
    longitude: number
  }
}

export interface WeatherAlert {
  type:
    | 'severe_weather'
    | 'heavy_rain'
    | 'flood'
    | 'extreme_heat'
    | 'cold_wave'
  severity: 'low' | 'medium' | 'high' | 'extreme'
  title: string
  description: string
  startTime: Date
  endTime: Date
}

export interface WeatherImpact {
  mobilityImpact: 'none' | 'low' | 'medium' | 'high' | 'severe'
  attendanceLikelihood: 'normal' | 'reduced' | 'significantly_reduced'
  recommendations: string[]
  riskFactors: string[]
}

/**
 * Weather Service Class
 */
export class WeatherService {
  private apiKey?: string
  private baseUrl: string
  private cache = new Map<string, { data: WeatherData; expires: number }>()
  private readonly CACHE_DURATION = 30 * 60 * 1000 // 30 minutes

  constructor() {
    this.baseUrl = process.env.WEATHER_API_URL || 'https://api.openweathermap.org/data/2.5'
    this.apiKey = process.env.WEATHER_API_KEY
  }

  /**
   * Get current weather data for a location
   */
  async getCurrentWeather(
    _latitude: number,
    _longitude: number,
    city?: string,
    state?: string,
  ): Promise<WeatherData | null> {
    try {
      // Create cache key
      const cacheKey = `${latitude},${longitude}`
      const cached = this.cache.get(cacheKey)

      if (cached && cached.expires > Date.now()) {
        return cached.data
      }

      // If no API key configured, return mock data for development
      if (!this.apiKey) {
        return this.getMockWeatherData(latitude, longitude, city, state)
      }

      // Call real weather API
      const weatherData = await this.fetchWeatherAPI(latitude, longitude)

      // Cache the result
      this.cache.set(cacheKey, {
        data: weatherData,
        expires: Date.now() + this.CACHE_DURATION,
      })

      return weatherData
    } catch {
      console.error('Weather service error:', error)

      // Fallback to mock data on API failure
      return this.getMockWeatherData(latitude, longitude, city, state)
    }
  }

  /**
   * Get weather forecast for appointment planning
   */
  async getWeatherForecast(
    _latitude: number,
    _longitude: number,
    appointmentTime: Date,
  ): Promise<WeatherData | null> {
    try {
      // For now, use current weather as forecast
      // In a real implementation, this would call a forecast API
      const currentWeather = await this.getCurrentWeather(latitude, longitude)

      if (!currentWeather) {
        return null
      }

      // Adjust timestamp to appointment time
      return {
        ...currentWeather,
        timestamp: appointmentTime,
      }
    } catch {
      console.error('Weather forecast error:', error)
      return null
    }
  }

  /**
   * Get weather alerts for a location
   */
  async getWeatherAlerts(
    _latitude: number,
    _longitude: number,
  ): Promise<WeatherAlert[]> {
    try {
      // Mock implementation - in real scenario, this would call weather alert API
      return []
    } catch {
      console.error('Weather alerts error:', error)
      return []
    }
  }

  /**
   * Calculate weather impact on appointment attendance
   */
  calculateWeatherImpact(weather: WeatherData): WeatherImpact {
    const impact: WeatherImpact = {
      mobilityImpact: 'none',
      attendanceLikelihood: 'normal',
      recommendations: [],
      riskFactors: [],
    }

    // Heavy rain impact
    if (weather.precipitation > 10) {
      impact.mobilityImpact = 'medium'
      impact.attendanceLikelihood = 'reduced'
      impact.riskFactors.push('heavy_rain')
      impact.recommendations.push(
        'Allow extra travel time due to heavy rain',
        'Consider virtual appointment if available',
      )
    }

    // Extreme temperatures
    if (weather.temperature < 5 || weather.temperature > 35) {
      impact.mobilityImpact = 'medium'
      impact.attendanceLikelihood = 'reduced'
      impact.riskFactors.push('extreme_temperature')
      impact.recommendations.push(
        'Advise patients to dress appropriately',
        'Ensure clinic climate control is working',
      )
    }

    // Low visibility
    if (weather.visibility < 1) {
      impact.mobilityImpact = 'high'
      impact.attendanceLikelihood = 'significantly_reduced'
      impact.riskFactors.push('low_visibility')
      impact.recommendations.push(
        'Consider rescheduling non-urgent appointments',
        'Provide clear travel guidance',
      )
    }

    // High winds
    if (weather.windSpeed > 50) {
      impact.mobilityImpact = 'medium'
      impact.attendanceLikelihood = 'reduced'
      impact.riskFactors.push('high_winds')
      impact.recommendations.push(
        'Advise caution when traveling',
        'Monitor weather updates',
      )
    }

    return impact
  }

  /**
   * Fetch real weather data from API
   */
  private async fetchWeatherAPI(
    latitude: number,
    longitude: number,
  ): Promise<WeatherData> {
    const url =
      `${this.baseUrl}/weather?lat=${latitude}&lon=${longitude}&appid=${this.apiKey}&units=metric`

    const response = await fetch(url, {
      timeout: 5000, // 5 second timeout
    })

    if (!response.ok) {
      throw new Error(`Weather API error: ${response.status}`)
    }

    const _data = await response.json()

    return {
      temperature: data.main.temp,
      condition: data.weather[0].main.toLowerCase(),
      humidity: data.main.humidity,
      windSpeed: data.wind?.speed || 0,
      precipitation: data.rain?.['1h'] || 0,
      visibility: data.visibility / 1000, // Convert to km
      uvIndex: data.uvi || 0,
      timestamp: new Date(),
      location: {
        city: data.name,
        state: data.sys?.country || '',
        latitude,
        longitude,
      },
    }
  }

  /**
   * Generate mock weather data for development/testing
   */
  private getMockWeatherData(
    latitude: number,
    longitude: number,
    city?: string,
    state?: string,
  ): WeatherData {
    // Generate realistic weather based on location and season
    const now = new Date()
    const month = now.getMonth()

    // Seasonal temperature ranges for Brazil
    const tempRanges = {
      summer: { min: 25, max: 40 }, // Dec-Feb
      autumn: { min: 20, max: 30 }, // Mar-May
      winter: { min: 15, max: 25 }, // Jun-Aug
      spring: { min: 20, max: 30 }, // Sep-Nov
    }

    let season
    if (month >= 11 || month <= 1) season = 'summer'
    else if (month >= 2 && month <= 4) season = 'autumn'
    else if (month >= 5 && month <= 7) season = 'winter'
    else season = 'spring'

    const range = tempRanges[season as keyof typeof tempRanges]
    const temperature = Math.floor(Math.random() * (range.max - range.min + 1)) + range.min

    // Weather conditions common in Brazil
    const conditions = ['clear', 'clouds', 'rain', 'thunderstorm']
    const condition = conditions[Math.floor(Math.random() * conditions.length)]

    return {
      temperature,
      condition,
      humidity: Math.floor(Math.random() * 40) + 40, // 40-80%
      windSpeed: Math.floor(Math.random() * 20) + 5, // 5-25 km/h
      precipitation: condition === 'rain' ? Math.floor(Math.random() * 20) + 5 : 0,
      visibility: Math.floor(Math.random() * 5) + 5, // 5-10 km
      uvIndex: Math.floor(Math.random() * 11), // 0-10
      timestamp: now,
      location: {
        city: city || 'Unknown',
        state: state || 'Unknown',
        latitude,
        longitude,
      },
    }
  }

  /**
   * Clear weather cache (for testing)
   */
  clearCache(): void {
    this.cache.clear()
  }

  /**
   * Get cache statistics (for monitoring)
   */
  getCacheStats() {
    return {
      size: this.cache.size,
      duration: this.CACHE_DURATION,
    }
  }
}

// Export singleton instance
export const weatherService = new WeatherService()
