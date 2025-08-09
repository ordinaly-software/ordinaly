"use client";

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
  onSuccess: _onSuccess, 
  onError: _onError, 
  className: _className = "",
  children: _children 
}: GoogleSignInButtonProps) => {
  return null; // Google Sign-in temporarily disabled
};

export default GoogleSignInButton;