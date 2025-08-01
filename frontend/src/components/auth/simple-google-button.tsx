"use client";

import { useEffect, useRef, useState } from 'react';

export default function SimpleGoogleButton() {
  const googleButtonRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Load Google OAuth script
    if (!window.google) {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = initializeGoogle;
      script.onerror = () => setError('Failed to load Google OAuth script');
      document.head.appendChild(script);
    } else {
      initializeGoogle();
    }
  }, []);

  const initializeGoogle = () => {
    if (window.google?.accounts?.id) {
      // Initialize without auto-select or one-tap
      window.google.accounts.id.initialize({
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
        callback: handleCredentialResponse,
        auto_select: false,
        use_fedcm_for_prompt: false, // Disable FedCM for now
      });

      // Render the button directly
      if (googleButtonRef.current) {
        window.google.accounts.id.renderButton(googleButtonRef.current, {
          theme: 'outline',
          size: 'large',
          type: 'standard',
          text: 'signin_with',
          shape: 'rectangular',
          logo_alignment: 'left',
          width: 250,
        });
        setIsLoaded(true);
      }
    }
  };

  const handleCredentialResponse = async (response: any) => {
    console.log('Google credential received:', response);
    
    try {
      // Send to backend
      const backendResponse = await fetch('http://localhost:8000/users/google-oauth/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id_token: response.credential }),
      });

      const data = await backendResponse.json();
      console.log('Backend response:', data);

      if (backendResponse.ok) {
        if (data.needs_profile_completion) {
          alert('Profile completion needed: ' + JSON.stringify(data.user_data));
        } else {
          alert('Success! Logged in as: ' + data.user?.email);
        }
      } else {
        alert('Error: ' + (data.error || 'Authentication failed'));
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Network error: ' + error);
    }
  };

  return (
    <div className="p-4 border rounded">
      <h3 className="text-lg font-semibold mb-4">Simple Google OAuth Test</h3>
      
      {error && (
        <div className="mb-4 p-2 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}
      
      <div ref={googleButtonRef} className="mb-4">
        {!isLoaded && !error && <div>Loading Google button...</div>}
      </div>
      
      <div className="text-sm text-gray-600">
        <p><strong>Client ID:</strong> {process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ? 'Set' : 'Missing'}</p>
        <p><strong>Origin:</strong> {typeof window !== 'undefined' ? window.location.origin : 'Unknown'}</p>
      </div>
    </div>
  );
}
