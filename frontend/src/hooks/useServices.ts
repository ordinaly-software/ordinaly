"use client";

import { useState, useEffect, useCallback } from 'react';
import { getApiEndpoint } from '@/lib/api-config';

export interface Service {
  id: number;
  type: 'SERVICE' | 'PRODUCT';
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
  draft?: boolean;
  created_by?: number;
  created_by_username?: string;
  created_at: string;
  updated_at: string;
}

// Simple cache with shorter duration
const servicesCache = new Map<string, { data: Service[]; timestamp: number }>();
const CACHE_DURATION = 2 * 60 * 1000; // 2 minutes cache


export const useServices = (limit?: number, isAdmin: boolean = false, enabled: boolean = true) => {
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOnVacation, setIsOnVacation] = useState(false);

  const fetchServices = useCallback(async () => {
    if (!enabled) return;
    try {
      const cacheKey = `services_${limit || 'all'}_${isAdmin}`;
      const cached = servicesCache.get(cacheKey);
      if (cached && (Date.now() - cached.timestamp) < CACHE_DURATION) {
        setServices(cached.data);
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      setError(null);
      const apiUrl = getApiEndpoint('/api/services/');
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (isAdmin) {
        const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
        if (token) headers['Authorization'] = `Token ${token}`;
      }
      const response = await fetch(apiUrl, {
        headers,
      });
      if (!response.ok) {
        if (response.status >= 500) {
          setIsOnVacation(true);
          setServices([]);
          return;
        }
        throw new Error(`API Error: ${response.status}`);
      }
      const data = await response.json();
      let servicesData = Array.isArray(data) ? data : [];
      // Filter out draft services for non-admins
      if (!isAdmin) {
        servicesData = servicesData.filter((s: Service) => !s.draft);
      }
      servicesData.sort((a, b) => {
        if (a.is_featured && !b.is_featured) return -1;
        if (!a.is_featured && b.is_featured) return 1;
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
      if (limit) {
        servicesData = servicesData.slice(0, limit);
      }
      servicesCache.set(cacheKey, { data: servicesData, timestamp: Date.now() });
      setServices(servicesData);
      setError(null);
      setIsOnVacation(false);
    } catch (err) {
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
  }, [limit, isAdmin, enabled]);

  useEffect(() => {
    if (!enabled) return;
    fetchServices();
  }, [fetchServices, enabled]);

  const refetch = useCallback(() => {
    servicesCache.clear();
    fetchServices();
  }, [fetchServices]);

  return { services, isLoading, error, isOnVacation, refetch };
};
