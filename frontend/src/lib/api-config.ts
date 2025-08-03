/**
 * API Configuration Utility
 * Centralized handling of API URL configuration
 */

export function getApiUrl(): string {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  
  if (!apiUrl) {
    const isDevelopment = process.env.NODE_ENV === 'development';
    
    if (isDevelopment) {
      console.warn('NEXT_PUBLIC_API_URL not set, falling back to localhost for development');
      return 'http://localhost:8000';
    } else {
      throw new Error('NEXT_PUBLIC_API_URL environment variable is required for production');
    }
  }
  
  return apiUrl;
}

export function getApiEndpoint(path: string): string {
  const baseUrl = getApiUrl();
  // Ensure path starts with /
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${baseUrl}${normalizedPath}`;
}

// Common endpoints
export const API_ENDPOINTS = {
  services: '/api/services/',
  courses: '/api/courses/courses/',
  terms: '/api/terms/',
  contact: '/api/contact/',
  auth: {
    signin: '/api/users/signin/',
    signup: '/api/users/signup/',
    signout: '/api/users/signout/',
    profile: '/api/users/profile/',
  },
} as const;
