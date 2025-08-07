"use client";

import { useState, useEffect, useCallback } from 'react';
import { getApiEndpoint } from '@/lib/api-config';

export interface Service {
  id: number;
  title: string;
  subtitle?: string;
  description: string;
  clean_description: string;
  html_description?: string;
  color: string;
  color_hex: string;
  icon: string;
  duration?: number;
  requisites?: string;
  price?: string | null;
  is_featured: boolean;
  featured?: boolean; // for backward compatibility
  created_by?: number;
  created_by_username?: string;
  created_at: string;
  updated_at: string;
}

// Simple cache with shorter duration
const servicesCache = new Map<string, { data: Service[]; timestamp: number }>();
const CACHE_DURATION = 2 * 60 * 1000; // 2 minutes cache

export const useServices = (limit?: number) => {
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOnVacation, setIsOnVacation] = useState(false);

  // Simplified fetch function
  const fetchServices = useCallback(async () => {
    try {
      // Check cache first
      const cacheKey = `services_${limit || 'all'}`;
      const cached = servicesCache.get(cacheKey);
      
      if (cached && (Date.now() - cached.timestamp) < CACHE_DURATION) {
        console.log('📦 Using cached services data:', cached.data.length, 'services');
        setServices(cached.data);
        setIsLoading(false);
        return;
      }

      console.log('🔄 Fetching services from API...');
      setIsLoading(true);
      setError(null);

      const apiUrl = getApiEndpoint('/api/services/');
      console.log('📡 API URL:', apiUrl);

      const response = await fetch(apiUrl, {
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        console.error('❌ API Response not OK:', response.status, response.statusText);
        if (response.status >= 500) {
          setIsOnVacation(true);
          setServices([]);
          return;
        }
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Raw API data received:', data);
      let servicesData = Array.isArray(data) ? data : [];
      console.log('📊 Services array length:', servicesData.length);
      
      // Simple sorting: featured first, then by creation date
      servicesData.sort((a, b) => {
        if (a.is_featured && !b.is_featured) return -1;
        if (!a.is_featured && b.is_featured) return 1;
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });

      // Apply limit if specified
      if (limit) {
        servicesData = servicesData.slice(0, limit);
        console.log('✂️ Applied limit, services count:', servicesData.length);
      }

      // Cache the result
      servicesCache.set(cacheKey, { data: servicesData, timestamp: Date.now() });
      
      console.log('💾 Services cached and state updated:', servicesData.length, 'services');
      setServices(servicesData);
      setError(null);
      setIsOnVacation(false);
    } catch (err) {
      console.error('Error fetching services:', err);
      if (err instanceof TypeError && err.message.includes('Failed to fetch')) {
        setIsOnVacation(true);
        setServices([]);
      } else {
        setError('Failed to load services');
        setServices([]);
        setIsOnVacation(false);
      }
    } finally {
      setIsLoading(false);
    }
  }, [limit]);

  // Single effect for initial fetch
  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  const refetch = useCallback(() => {
    // Clear cache and refetch
    servicesCache.clear();
    fetchServices();
  }, [fetchServices]);

  return { services, isLoading, error, isOnVacation, refetch };
};
