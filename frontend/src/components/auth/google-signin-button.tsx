"use client";

// import { useGoogleAuth } from '@/hooks/useGoogleAuth';
// import { Button } from '@/components/ui/button';
// import Alert from '@/components/ui/alert';

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
  onError?: (error: string) => void;
  className?: string;
  children?: React.ReactNode;
}

const GoogleSignInButton = ({ 
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onSuccess: _onSuccess, 
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onError: _onError, 
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  className: _className = "",
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  children: _children 
}: GoogleSignInButtonProps) => {
//   const { signInWithGoogle, isLoading, error } = useGoogleAuth();
//   const [alert, setAlert] = useState<{type: 'success' | 'error' | 'info' | 'warning', message: string} | null>(null);
//   const [isProcessing, setIsProcessing] = useState(false);

//   const handleGoogleSignIn = async () => {
//     // Prevent double clicks and concurrent requests
//     if (isLoading || isProcessing) {
//       return;
//     }

//     setIsProcessing(true);
    
//     try {
//       console.log('Google Sign In - Starting authentication...');
//       const result = await signInWithGoogle();
      
//       if (result) {
//         console.log('Google Sign In - Success, calling onSuccess callback');
//         onSuccess(result);
//       } else {
//         console.log('Google Sign In - No result returned');
//         setAlert({type: 'error', message: 'Failed to sign in with Google'});
//         if (onError) {
//           onError('Failed to sign in with Google');
//         }
//       }
//     } catch (err) {
//       console.error('Google Sign In - Error:', err);
//       const errorMessage = err instanceof Error ? err.message : 'Failed to sign in with Google';
//       setAlert({type: 'error', message: errorMessage});
//       if (onError) {
//         onError(errorMessage);
//       }
//     } finally {
//       setIsProcessing(false);
//     }
//   };

  return (
    <>
      {/* {alert && (
        <Alert
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert(null)}
          duration={5000}
        />
      )} */}
      
      {/* <Button
        type="button"
        variant="outline"
        onClick={handleGoogleSignIn}
        disabled={isLoading || isProcessing}
        className={`w-full flex items-center justify-center gap-3 ${className}`}
      >
        {(isLoading || isProcessing) ? (
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
        {children || ((isLoading || isProcessing) ? 'Signing in...' : 'Continue with Google')}
      </Button> */}
    </>
  );
};

export default GoogleSignInButton;