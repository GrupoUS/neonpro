/**
 * Advanced Patient Search System with AI
 * Implements intelligent search, filtering, and segmentation
 * Part of Story 3.1 - Task 6: System Integration & Search
 */

import { logger } from '@/lib/logger';
import { supabase } from '@/lib/supabase/client';
import type { Patient } from '@/types/patient';

export interface SearchFilters {
  name?: string;
  email?: string;
  phone?: string;
  age_range?: { min: number; max: number };
  gender?: string;
  city?: string;
  registration_date_range?: { start: string; end: string };
  last_appointment_range?: { start: string; end: string };
  risk_level?: 'low' | 'medium' | 'high';
  appointment_status?: 'active' | 'inactive' | 'new';
  satisfaction_score_range?: { min: number; max: number };
  services?: string[];
  tags?: string[];
  has_photo?: boolean;
  insurance_provider?: string;
}

export interface SearchSuggestion {
  type: 'patient' | 'service' | 'condition' | 'location';
  value: string;
  label: string;
  count: number;
  relevance_score: number;
}

export interface PatientSegment {
  id: string;
  name: string;
  description: string;
  criteria: SearchFilters;
  patient_count: number;
  avg_satisfaction: number;
  avg_risk_score: number;
  last_updated: string;
}

export interface SearchResult {
  patients: Patient[];
  total_count: number;
  page: number;
  per_page: number;
  total_pages: number;
  search_time_ms: number;
  suggestions: SearchSuggestion[];
  applied_filters: SearchFilters;
}

export class AdvancedPatientSearch {
  /**
   * Perform intelligent patient search with AI suggestions
   */
  static async searchPatients(
    query: string,
    filters: SearchFilters = {},
    page = 1,
    perPage = 20
  ): Promise<SearchResult> {
    const startTime = Date.now();

    try {
      // Build the search query
      let searchQuery = supabase.from('patients').select(
        `
          *,
          patient_profiles_extended(*),
          patient_photos(count),
          appointments(count)
        `,
        { count: 'exact' }
      );

      // Apply text search with AI-powered fuzzy matching
      if (query.trim()) {
        const searchTerms = AdvancedPatientSearch.processSearchQuery(query);
        searchQuery = AdvancedPatientSearch.applyTextSearch(
          searchQuery,
          searchTerms
        );
      }

      // Apply filters
      searchQuery = AdvancedPatientSearch.applyFilters(searchQuery, filters);

      // Apply pagination
      const offset = (page - 1) * perPage;
      searchQuery = searchQuery
        .range(offset, offset + perPage - 1)
        .order('updated_at', { ascending: false });

      const { data: patients, error, count } = await searchQuery;

      if (error) {
        throw error;
      }

      // Generate AI suggestions
      const suggestions = await AdvancedPatientSearch.generateSearchSuggestions(
        query,
        filters
      );

      const searchTime = Date.now() - startTime;

      return {
        patients: patients || [],
        total_count: count || 0,
        page,
        per_page: perPage,
        total_pages: Math.ceil((count || 0) / perPage),
        search_time_ms: searchTime,
        suggestions,
        applied_filters: filters,
      };
    } catch (error) {
      logger.error('Error in patient search:', error);
      throw new Error('Failed to search patients');
    }
  }

  /**
   * Get quick access patient lookup for staff
   */
  static async quickPatientLookup(query: string): Promise<Patient[]> {
    try {
      if (!query || query.length < 2) {
        return [];
      }

      const { data: patients, error } = await supabase
        .from('patients')
        .select(
          `
          id, name, email, phone, date_of_birth,
          patient_profiles_extended(risk_score)
        `
        )
        .or(
          `
          name.ilike.%${query}%,
          email.ilike.%${query}%,
          phone.ilike.%${query}%
        `
        )
        .limit(10)
        .order('updated_at', { ascending: false });

      if (error) {
        throw error;
      }

      return patients || [];
    } catch (error) {
      logger.error('Error in quick patient lookup:', error);
      return [];
    }
  }

  /**
   * Create and manage patient segments
   */
  static async createPatientSegment(
    name: string,
    description: string,
    criteria: SearchFilters
  ): Promise<PatientSegment> {
    try {
      // Count patients matching criteria
      const searchResult = await AdvancedPatientSearch.searchPatients(
        '',
        criteria,
        1,
        1
      );

      // Calculate segment statistics
      const stats = await AdvancedPatientSearch.calculateSegmentStats(criteria);

      const segment: PatientSegment = {
        id: `segment_${Date.now()}`,
        name,
        description,
        criteria,
        patient_count: searchResult.total_count,
        avg_satisfaction: stats.avg_satisfaction,
        avg_risk_score: stats.avg_risk_score,
        last_updated: new Date().toISOString(),
      };

      // Save segment to database
      const { error } = await supabase.from('patient_segments').insert(segment);

      if (error) {
        throw error;
      }

      logger.info(
        `Created patient segment: ${name} with ${segment.patient_count} patients`
      );
      return segment;
    } catch (error) {
      logger.error('Error creating patient segment:', error);
      throw new Error('Failed to create patient segment');
    }
  }

  /**
   * Get predefined patient segments
   */
  static async getPredefinedSegments(): Promise<PatientSegment[]> {
    const segments: PatientSegment[] = [
      {
        id: 'high_risk',
        name: 'High Risk Patients',
        description:
          'Patients with high health risk scores requiring special attention',
        criteria: { risk_level: 'high' },
        patient_count: 0,
        avg_satisfaction: 0,
        avg_risk_score: 0,
        last_updated: new Date().toISOString(),
      },
      {
        id: 'new_patients',
        name: 'New Patients (Last 30 Days)',
        description: 'Recently registered patients requiring onboarding',
        criteria: {
          registration_date_range: {
            start: new Date(
              Date.now() - 30 * 24 * 60 * 60 * 1000
            ).toISOString(),
            end: new Date().toISOString(),
          },
        },
        patient_count: 0,
        avg_satisfaction: 0,
        avg_risk_score: 0,
        last_updated: new Date().toISOString(),
      },
      {
        id: 'inactive_patients',
        name: 'Inactive Patients',
        description: 'Patients with no appointments in the last 6 months',
        criteria: {
          last_appointment_range: {
            start: '2020-01-01',
            end: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(),
          },
        },
        patient_count: 0,
        avg_satisfaction: 0,
        avg_risk_score: 0,
        last_updated: new Date().toISOString(),
      },
    ];

    // Update counts for each segment
    for (const segment of segments) {
      try {
        const result = await AdvancedPatientSearch.searchPatients(
          '',
          segment.criteria,
          1,
          1
        );
        segment.patient_count = result.total_count;

        const stats = await AdvancedPatientSearch.calculateSegmentStats(
          segment.criteria
        );
        segment.avg_satisfaction = stats.avg_satisfaction;
        segment.avg_risk_score = stats.avg_risk_score;
      } catch (error) {
        logger.error(`Error updating segment ${segment.id}:`, error);
      }
    }

    return segments;
  }

  /**
   * Process search query for AI-powered matching
   */
  private static processSearchQuery(query: string): string[] {
    // Remove special characters and split into terms
    const cleanQuery = query.replace(/[^a-zA-Z0-9\s]/g, ' ');
    const terms = cleanQuery
      .toLowerCase()
      .split(/\s+/)
      .filter((term) => term.length > 1);

    // Add fuzzy matching variations
    const expandedTerms: string[] = [];

    terms.forEach((term) => {
      expandedTerms.push(term);

      // Add partial matches for names
      if (term.length > 3) {
        expandedTerms.push(`${term}%`);
        expandedTerms.push(`%${term}`);
      }
    });

    return expandedTerms;
  }

  /**
   * Apply text search to query
   */
  private static applyTextSearch(query: any, searchTerms: string[]) {
    if (searchTerms.length === 0) {
      return query;
    }

    const searchConditions = searchTerms
      .map(
        (term) =>
          `name.ilike.%${term}%,email.ilike.%${term}%,phone.ilike.%${term}%`
      )
      .join(',');

    return query.or(searchConditions);
  }

  /**
   * Apply filters to search query
   */
  private static applyFilters(query: any, filters: SearchFilters) {
    if (filters.name) {
      query = query.ilike('name', `%${filters.name}%`);
    }

    if (filters.email) {
      query = query.ilike('email', `%${filters.email}%`);
    }

    if (filters.phone) {
      query = query.ilike('phone', `%${filters.phone}%`);
    }

    if (filters.gender) {
      query = query.eq('gender', filters.gender);
    }

    if (filters.city) {
      query = query.ilike('city', `%${filters.city}%`);
    }

    if (filters.age_range) {
      const currentYear = new Date().getFullYear();
      const maxBirthYear = currentYear - filters.age_range.min;
      const minBirthYear = currentYear - filters.age_range.max;

      query = query
        .gte('date_of_birth', `${minBirthYear}-01-01`)
        .lte('date_of_birth', `${maxBirthYear}-12-31`);
    }

    if (filters.registration_date_range) {
      query = query
        .gte('created_at', filters.registration_date_range.start)
        .lte('created_at', filters.registration_date_range.end);
    }

    if (filters.has_photo !== undefined) {
      if (filters.has_photo) {
        query = query.not('patient_photos', 'is', null);
      } else {
        query = query.is('patient_photos', null);
      }
    }

    return query;
  }

  /**
   * Generate AI-powered search suggestions
   */
  private static async generateSearchSuggestions(
    query: string,
    _filters: SearchFilters
  ): Promise<SearchSuggestion[]> {
    const suggestions: SearchSuggestion[] = [];

    try {
      // Get popular search terms
      const { data: popularNames } = await supabase
        .from('patients')
        .select('name')
        .ilike('name', `%${query}%`)
        .limit(5);

      popularNames?.forEach((patient) => {
        suggestions.push({
          type: 'patient',
          value: patient.name,
          label: `Patient: ${patient.name}`,
          count: 1,
          relevance_score: 0.9,
        });
      });

      // Get service suggestions
      const { data: services } = await supabase
        .from('services')
        .select('name, id')
        .ilike('name', `%${query}%`)
        .limit(3);

      services?.forEach((service) => {
        suggestions.push({
          type: 'service',
          value: service.id,
          label: `Service: ${service.name}`,
          count: 1,
          relevance_score: 0.7,
        });
      });
    } catch (error) {
      logger.error('Error generating search suggestions:', error);
    }

    return suggestions.sort((a, b) => b.relevance_score - a.relevance_score);
  }

  /**
   * Calculate statistics for a patient segment
   */
  private static async calculateSegmentStats(criteria: SearchFilters) {
    try {
      const { data: stats } = await supabase.rpc('calculate_segment_stats', {
        filter_criteria: criteria,
      });

      return {
        avg_satisfaction: stats?.avg_satisfaction || 0,
        avg_risk_score: stats?.avg_risk_score || 0,
      };
    } catch (error) {
      logger.error('Error calculating segment stats:', error);
      return {
        avg_satisfaction: 0,
        avg_risk_score: 0,
      };
    }
  }
}

export default AdvancedPatientSearch;
