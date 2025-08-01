import { useState, useEffect } from 'react';

interface GoogleUser {
  id: number;
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
  name?: string;
  surname?: string;
  company?: string;
  region?: string;
  city?: string;
}

interface GoogleAuthResponse {
  token: string;
  user: GoogleUser;
  profile_complete: boolean;
  message: string;
}

interface GoogleProfileCompletion {
  requires_completion: boolean;
  google_data: {
    google_id: string;
    email: string;
    first_name: string;
    last_name: string;
    picture?: string;
  };
}

export const useGoogleAuth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isGoogleLoaded, setIsGoogleLoaded] = useState(false);

  // Initialize Google OAuth
  useEffect(() => {
    const initializeGoogleAuth = () => {
      if (typeof window !== 'undefined' && window.google?.accounts?.id) {
        try {
          window.google.accounts.id.initialize({
            client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
            callback: () => {}, // We'll handle this manually
            auto_select: false,
            cancel_on_tap_outside: true,
          });
          setIsGoogleLoaded(true);
          console.log('Google OAuth initialized successfully');
        } catch (error) {
          console.error('Error initializing Google OAuth:', error);
          setError('Failed to initialize Google OAuth');
        }
      }
    };

    // Load Google OAuth script if not already loaded
    if (!window.google) {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = initializeGoogleAuth;
      script.onerror = () => {
        console.error('Failed to load Google OAuth script');
        setError('Failed to load Google OAuth');
      };
      document.head.appendChild(script);
    } else {
      initializeGoogleAuth();
    }
  }, []);

  const signInWithGoogle = async (): Promise<GoogleAuthResponse | GoogleProfileCompletion | null> => {
    if (!isGoogleLoaded) {
      throw new Error('Google OAuth not initialized');
    }

    setIsLoading(true);
    setError(null);

    try {
      return new Promise((resolve, reject) => {
        // Create a temporary callback function
        const handleCredentialResponse = async (response: any) => {
          try {
            console.log('Received credential response:', response);
            const result = await authenticateWithBackend(response.credential);
            resolve(result);
          } catch (err) {
            reject(err);
          }
        };

        // Set the callback
        window.google.accounts.id.initialize({
          client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
          callback: handleCredentialResponse,
          auto_select: false,
          cancel_on_tap_outside: true,
        });

        // Try One Tap first, but if it fails, render a sign-in button
        window.google.accounts.id.prompt((notification: any) => {
          console.log('One Tap notification:', notification);
          
          if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
            console.log('One Tap not available, rendering sign-in button');
            
            // Create and render a sign-in button as fallback
            const buttonDiv = document.createElement('div');
            buttonDiv.id = 'google-signin-button';
            buttonDiv.style.position = 'fixed';
            buttonDiv.style.top = '50%';
            buttonDiv.style.left = '50%';
            buttonDiv.style.transform = 'translate(-50%, -50%)';
            buttonDiv.style.zIndex = '9999';
            buttonDiv.style.backgroundColor = 'white';
            buttonDiv.style.padding = '20px';
            buttonDiv.style.borderRadius = '8px';
            buttonDiv.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
            
            // Add overlay
            const overlay = document.createElement('div');
            overlay.id = 'google-signin-overlay';
            overlay.style.position = 'fixed';
            overlay.style.top = '0';
            overlay.style.left = '0';
            overlay.style.width = '100%';
            overlay.style.height = '100%';
            overlay.style.backgroundColor = 'rgba(0,0,0,0.5)';
            overlay.style.zIndex = '9998';
            overlay.onclick = () => {
              document.body.removeChild(overlay);
              document.body.removeChild(buttonDiv);
              reject(new Error('Sign-in cancelled'));
            };
            
            document.body.appendChild(overlay);
            document.body.appendChild(buttonDiv);
            
            // Render the Google Sign-In button
            window.google.accounts.id.renderButton(buttonDiv, {
              theme: 'outline',
              size: 'large',
              type: 'standard',
              text: 'signin_with',
              shape: 'rectangular',
              logo_alignment: 'left'
            });
            
            // Set up success handler
            const originalCallback = window.google.accounts.id.callback;
            window.google.accounts.id.callback = async (response: any) => {
              // Clean up
              document.body.removeChild(overlay);
              document.body.removeChild(buttonDiv);
              
              // Restore original callback
              window.google.accounts.id.callback = originalCallback;
              
              // Handle the response
              await handleCredentialResponse(response);
            };
          }
        });

        // Set a timeout in case the user doesn't respond
        setTimeout(() => {
          // Clean up any lingering elements
          const overlay = document.getElementById('google-signin-overlay');
          const buttonDiv = document.getElementById('google-signin-button');
          if (overlay) document.body.removeChild(overlay);
          if (buttonDiv) document.body.removeChild(buttonDiv);
          
          reject(new Error('Google sign-in timeout. Please try again.'));
        }, 60000); // 60 second timeout
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Google authentication failed';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const authenticateWithBackend = async (
    googleToken: string
  ): Promise<GoogleAuthResponse | GoogleProfileCompletion> => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    
    const response = await fetch(`${apiUrl}/users/google-oauth/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id_token: googleToken,
      }),
    });

    const data = await response.json();

    if (response.ok) {
      // Existing user successfully authenticated
      return {
        token: data.token,
        user: data,
        profile_complete: true,
        message: 'Successfully signed in with Google',
      };
    } else if (response.status === 202 && data.requires_completion) {
      // New user needs profile completion
      return data;
    } else {
      throw new Error(data.error || 'Authentication failed');
    }
  };

  const completeGoogleProfile = async (
    googleToken: string,
    profileData: {
      username: string;
      company: string;
      region?: string;
      city?: string;
    }
  ): Promise<GoogleAuthResponse> => {
    setIsLoading(true);
    setError(null);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      
      const response = await fetch(`${apiUrl}/users/complete-google-profile/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          google_token: googleToken,
          ...profileData,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        return {
          token: data.token,
          user: data,
          profile_complete: true,
          message: 'Profile completed successfully',
        };
      } else {
        throw new Error(data.error || 'Profile completion failed');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Profile completion failed';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    signInWithGoogle,
    completeGoogleProfile,
    isLoading,
    error,
    isGoogleLoaded,
  };
};

// Add global types for Google OAuth
declare global {
  interface Window {
    google: any;
  }
}
