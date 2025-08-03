"use client";

import { useState, useEffect, useRef } from 'react';
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

export const useServices = (limit?: number) => {
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOnVacation, setIsOnVacation] = useState(false);
  const [refetchTrigger, setRefetchTrigger] = useState(0);
  
  // Use refs to track fetching state without causing effect re-runs
  const isRefetchingRef = useRef(false);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const visibilityTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        // Prevent multiple simultaneous fetches
        if (isRefetchingRef.current) {
          console.log('Fetch already in progress, skipping...');
          return;
        }
        
        isRefetchingRef.current = true;
        
        // Only show loading state on initial load, not on refetches
        if (services.length === 0) {
          setIsLoading(true);
        }
        setError(null);
        
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://ordinaly.duckdns.org';
        console.log('Fetching services from:', `${apiUrl}/api/services/`);
        
        const response = await fetch(`${apiUrl}/api/services/`, {
          headers: {
            'Content-Type': 'application/json',
          },
        });

        console.log('Services API response status:', response.status);

        if (!response.ok) {
          // Only set vacation mode for server errors (5xx) or service unavailable (503)
          if (response.status >= 500) {
            console.log('Server error detected, showing vacation message');
            setIsOnVacation(true);
            // Only clear services on initial load, not on refetches
            if (services.length === 0) {
              setServices([]);
            }
            return;
          } else {
            // For other errors (like 404, 401, etc.), just log but don't show vacation
            console.error('API error (not server issue):', response.status, response.statusText);
            setError(`API Error: ${response.status}`);
            setIsOnVacation(false);
            // Only clear services on initial load, not on refetches
            if (services.length === 0) {
              setServices([]);
            }
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

        console.log(`Setting services:`, servicesData.map(s => ({ id: s.id, title: s.title })));
        setServices(servicesData);
        setError(null);
        setIsOnVacation(false);
      } catch (err) {
        console.error('Network error fetching services:', err);
        // Only set vacation mode for actual network failures
        if (err instanceof TypeError && err.message.includes('Failed to fetch')) {
          console.log('Network failure detected, showing vacation message');
          setIsOnVacation(true);
          // Only clear services on initial load, not on refetches
          if (services.length === 0) {
            setServices([]);
          }
        } else {
          console.log('Other error, not showing vacation:', err);
          setError('Failed to load services');
          // Only clear services on initial load, not on refetches
          if (services.length === 0) {
            setServices([]);
          }
          setIsOnVacation(false);
        }
      } finally {
        setIsLoading(false);
        isRefetchingRef.current = false;
      }
    };

    fetchServices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [limit, refetchTrigger]);

  // Listen for services events to auto-refresh with debouncing
  useEffect(() => {
    const handleRefresh = () => {
      console.log('Services event received, scheduling refresh...');
      
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

  return { services, isLoading, error, isOnVacation, refetch: () => {
    if (!isRefetchingRef.current) {
      console.log('Manual refetch triggered');
      setRefetchTrigger(prev => prev + 1);
    } else {
      console.log('Manual refetch skipped - already fetching');
    }
  }};
};
