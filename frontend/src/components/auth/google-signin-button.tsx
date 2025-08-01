"use client";

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import Alert from '@/components/ui/alert';

interface GoogleSignInButtonProps {
  onSuccess: (data: {
    token: string;
    user: {
      id: number;
      username: string;
      email: string;
      first_name?: string;
      last_name?: string;
    };
    profile_complete: boolean;
    message: string;
  }) => void;
  onProfileCompletion?: (data: {
    requires_completion: boolean;
    google_data: {
      google_id: string;
      email: string;
      first_name: string;
      last_name: string;
      picture?: string;
    };
    google_token: string;
  }) => void;
  onError?: (error: string) => void;
  className?: string;
  children?: React.ReactNode;
}

const GoogleSignInButton = ({ 
  onSuccess,
  onProfileCompletion,
  onError,
  className = "",
  children 
}: GoogleSignInButtonProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [alert, setAlert] = useState<{type: 'success' | 'error' | 'info' | 'warning', message: string} | null>(null);
  const [isGoogleLoaded, setIsGoogleLoaded] = useState(false);
  const buttonRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const initializeGoogle = () => {
      if (window.google?.accounts?.id) {
        window.google.accounts.id.initialize({
          client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
          callback: handleCredentialResponse,
          auto_select: false,
          cancel_on_tap_outside: false,
        });
        setIsGoogleLoaded(true);
        console.log('Google OAuth initialized');
      }
    };

    if (!window.google) {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = initializeGoogle;
      script.onerror = () => {
        console.error('Failed to load Google OAuth script');
        setAlert({type: 'error', message: 'Failed to load Google OAuth'});
      };
      document.head.appendChild(script);
    } else {
      initializeGoogle();
    }
  }, []);

  const handleCredentialResponse = async (credential: any) => {
    if (typeof credential === 'string') {
      // Direct credential string
      await processGoogleCredential(credential);
    } else if (credential?.credential) {
      // Google response object with credential property
      await processGoogleCredential(credential.credential);
    } else {
      console.error('Invalid credential format:', credential);
      setAlert({type: 'error', message: 'Invalid Google credential received'});
    }
  };

  const processGoogleCredential = async (idToken: string) => {
    console.log('Processing Google credential...');
    setIsLoading(true);
    setAlert(null);

    try {
      // Send the credential to our backend
      const response = await fetch('http://localhost:8000/users/google-oauth/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id_token: idToken }),
      });

      const data = await response.json();
      console.log('Backend response:', data);

      if (response.ok) {
        if (data.needs_profile_completion) {
          console.log('User needs to complete profile');
          onProfileCompletion?.({
            requires_completion: true,
            google_data: data.user_data,
            google_token: idToken
          });
        } else {
          console.log('User authenticated successfully');
          onSuccess?.(data);
        }
      } else {
        console.error('Authentication failed:', data);
        const errorMessage = data.error || 'Authentication failed';
        setAlert({type: 'error', message: errorMessage});
        onError?.(errorMessage);
      }
    } catch (error) {
      console.error('Error during authentication:', error);
      const errorMessage = 'Failed to authenticate with Google';
      setAlert({type: 'error', message: errorMessage});
      onError?.(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    if (!isGoogleLoaded) {
      setAlert({type: 'error', message: 'Google OAuth not loaded yet'});
      return;
    }

    setIsLoading(true);
    setAlert(null);

    try {
      // Use the Google Accounts popup flow
      window.google.accounts.id.prompt((notification: any) => {
        console.log('Prompt notification:', notification);
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          // If One Tap doesn't work, render a button
          if (buttonRef.current) {
            // Clear any existing content
            buttonRef.current.innerHTML = '';
            
            // Render Google Sign-In button
            window.google.accounts.id.renderButton(buttonRef.current, {
              theme: 'outline',
              size: 'large',
              type: 'standard',
              text: 'signin_with',
              shape: 'rectangular',
              logo_alignment: 'left',
              width: buttonRef.current.offsetWidth,
            });
          }
        }
        setIsLoading(false);
      });
    } catch (err) {
      console.error('Error triggering Google sign-in:', err);
      setAlert({type: 'error', message: 'Failed to start Google sign-in'});
      setIsLoading(false);
    }
  };

  return (
    <>
      {alert && (
        <Alert
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert(null)}
          duration={5000}
        />
      )}
      
      {/* Hidden div for Google button rendering */}
      <div ref={buttonRef} style={{ display: 'none' }} />
      
      <Button
        type="button"
        variant="outline"
        onClick={handleGoogleSignIn}
        disabled={isLoading || !isGoogleLoaded}
        className={`w-full flex items-center justify-center gap-3 ${className}`}
      >
        {isLoading ? (
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current"></div>
        ) : (
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="currentColor"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="currentColor"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="currentColor"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
        )}
        {children || (isLoading ? 'Signing in...' : 'Continue with Google')}
      </Button>
    </>
  );
};

export default GoogleSignInButton;