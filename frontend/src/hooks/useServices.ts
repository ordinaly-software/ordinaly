"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { servicesEvents } from '@/lib/events';

interface Service {
  id: number;
  title: string;
  subtitle?: string;
  description: string;
  icon: string;
  duration?: number;
  requisites?: string;
  price?: string | null;
  is_featured: boolean;
  created_by?: number;
  created_by_username?: string;
  created_at: string;
  updated_at: string;
}

// Add a cache for services to prevent unnecessary refetches
const servicesCache = new Map<string, { data: Service[]; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes cache

export const useServices = (limit?: number) => {
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOnVacation, setIsOnVacation] = useState(false);
  const [refetchTrigger, setRefetchTrigger] = useState(0);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  
  // Use refs to track fetching state without causing effect re-runs
  const isRefetchingRef = useRef(false);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const visibilityTimerRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const hasFetchedRef = useRef(false);

  // Memoized fetch function with abort signal support
  const fetchServices = useCallback(async (forceRefresh = false) => {
    try {
      // Cancel any ongoing request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      
      // Create new abort controller
      abortControllerRef.current = new AbortController();
      
      // Prevent multiple simultaneous fetches
      if (isRefetchingRef.current) {
        console.log('Fetch already in progress, skipping...');
        return;
      }
      
      isRefetchingRef.current = true;
      
      // Check cache first (but skip if force refresh or initial load)
      const cacheKey = `services_${limit || 'all'}`;
      const cachedData = servicesCache.get(cacheKey);
      const now = Date.now();
      
      if (!forceRefresh && !isInitialLoad && cachedData && (now - cachedData.timestamp) < CACHE_DURATION) {
        console.log('Using cached services data');
        setServices(cachedData.data);
        setError(null);
        setIsOnVacation(false);
        setIsLoading(false);
        isRefetchingRef.current = false;
        return;
      }
      
      // Always show loading state on first load or when forcing refresh
      setIsLoading(true);
      setError(null);
      
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://ordinaly.duckdns.org';
      console.log('Fetching services from:', `${apiUrl}/api/services/`, { isInitialLoad, forceRefresh });
      
      const response = await fetch(`${apiUrl}/api/services/`, {
        headers: {
          'Content-Type': 'application/json',
        },
        signal: abortControllerRef.current.signal,
      });

      console.log('Services API response status:', response.status);

      if (!response.ok) {
        // Only set vacation mode for server errors (5xx) or service unavailable (503)
        if (response.status >= 500) {
          console.log('Server error detected, showing vacation message');
          setIsOnVacation(true);
          setServices([]);
          return;
        } else {
          // For other errors (like 404, 401, etc.), just log but don't show vacation
          console.error('API error (not server issue):', response.status, response.statusText);
          setError(`API Error: ${response.status}`);
          setIsOnVacation(false);
          setServices([]);
          return;
        }
      }

      const data = await response.json();
      console.log('Raw services data received:', data);
      
      let servicesData = Array.isArray(data) ? data : [];
      console.log('Processed services data:', servicesData.length, 'services');
      
      // The backend already sorts by ['-is_featured', 'title']
      // But we want to show newest services first within each featured group
      servicesData = servicesData.sort((a, b) => {
        // First, sort by featured status (featured services first)
        if (a.is_featured && !b.is_featured) return -1;
        if (!a.is_featured && b.is_featured) return 1;
        
        // Within the same featured status, sort by creation date (newest first)
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });

      console.log('Services after sorting:', servicesData.map(s => ({ 
        id: s.id, 
        title: s.title, 
        is_featured: s.is_featured, 
        created_at: s.created_at 
      })));

      // Apply limit if specified
      if (limit) {
        servicesData = servicesData.slice(0, limit);
        console.log(`Applied limit ${limit}, now have ${servicesData.length} services`);
      }

      // Cache the result
      servicesCache.set(cacheKey, { data: servicesData, timestamp: now });
      
      console.log(`Setting services:`, servicesData.map(s => ({ id: s.id, title: s.title })));
      setServices(servicesData);
      setError(null);
      setIsOnVacation(false);
      
      // Mark that we've completed the initial load
      if (isInitialLoad) {
        setIsInitialLoad(false);
        hasFetchedRef.current = true;
      }
    } catch (err) {
      // Ignore abort errors
      if (err instanceof Error && err.name === 'AbortError') {
        console.log('Request was aborted');
        return;
      }
      
      console.error('Network error fetching services:', err);
      // Only set vacation mode for actual network failures
      if (err instanceof TypeError && err.message.includes('Failed to fetch')) {
        console.log('Network failure detected, showing vacation message');
        setIsOnVacation(true);
        setServices([]);
      } else {
        console.log('Other error, not showing vacation:', err);
        setError('Failed to load services');
        setServices([]);
        setIsOnVacation(false);
      }
    } finally {
      setIsLoading(false);
      isRefetchingRef.current = false;
    }
  }, [limit]); // Remove services.length dependency that was causing issues

  useEffect(() => {
    // Always fetch on mount, don't depend on cache for initial load
    if (!hasFetchedRef.current) {
      console.log('Initial services fetch triggered');
      fetchServices(true); // Force refresh on initial load
    }
    
    // Cleanup function
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [limit]); // Only depend on limit, not fetchServices

  // Separate effect for refetch trigger
  useEffect(() => {
    if (refetchTrigger > 0) {
      fetchServices(true); // Force refresh on manual triggers
    }
  }, [refetchTrigger, fetchServices]);

  // Listen for services events to auto-refresh with debouncing
  useEffect(() => {
    const handleRefresh = () => {
      console.log('Services event received, scheduling refresh...');
      
      // Clear cache on events
      servicesCache.clear();
      
      // Clear any existing timer
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      
      // Debounce multiple rapid events
      debounceTimerRef.current = setTimeout(() => {
        if (!isRefetchingRef.current) {
          console.log('Executing debounced refresh...');
          setRefetchTrigger(prev => prev + 1);
        } else {
          console.log('Refresh skipped - already fetching');
        }
      }, 100); // 100ms debounce
    };

    // Listen for all services events that should trigger a refresh
    servicesEvents.onCreated(handleRefresh);
    servicesEvents.onUpdated(handleRefresh);
    servicesEvents.onDeleted(handleRefresh);
    servicesEvents.onRefresh(handleRefresh);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      servicesEvents.offCreated(handleRefresh);
      servicesEvents.offUpdated(handleRefresh);
      servicesEvents.offDeleted(handleRefresh);
      servicesEvents.offRefresh(handleRefresh);
    };
  }, []); // No dependencies - this effect should only run once

  // Refetch when page becomes visible (user switches back to tab) with debouncing
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log('Page became visible, scheduling refresh...');
        
        // Clear any existing timer
        if (visibilityTimerRef.current) {
          clearTimeout(visibilityTimerRef.current);
        }
        
        // Only refresh if it's been a while since last fetch and not currently fetching
        visibilityTimerRef.current = setTimeout(() => {
          if (!isRefetchingRef.current) {
            console.log('Executing visibility refresh...');
            setRefetchTrigger(prev => prev + 1);
          } else {
            console.log('Visibility refresh skipped - already fetching');
          }
        }, 500); // 500ms debounce for visibility changes
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      if (visibilityTimerRef.current) {
        clearTimeout(visibilityTimerRef.current);
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []); // No dependencies - this effect should only run once

  const refetch = useCallback(() => {
    if (!isRefetchingRef.current) {
      console.log('Manual refetch triggered');
      // Clear cache on manual refetch
      servicesCache.clear();
      setRefetchTrigger(prev => prev + 1);
    } else {
      console.log('Manual refetch skipped - already fetching');
    }
  }, []);

  // Debug log to help troubleshoot
  useEffect(() => {
    console.log('useServices state:', { 
      servicesCount: services.length, 
      isLoading, 
      error, 
      isOnVacation,
      isInitialLoad,
      hasFetched: hasFetchedRef.current,
      limit 
    });
  }, [services.length, isLoading, error, isOnVacation, isInitialLoad, limit]);

  return { services, isLoading, error, isOnVacation, refetch };
};
