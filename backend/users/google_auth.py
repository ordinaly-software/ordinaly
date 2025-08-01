from google.auth.transport import requests
from google.oauth2 import id_token
from django.contrib.auth import get_user_model
from django.conf import settings
from django.contrib.auth.backends import BaseBackend

User = get_user_model()


class GoogleOAuth2Backend(BaseBackend):
    """
    Custom authentication backend for Google OAuth2
    """
    
    def authenticate(self, request, google_token=None, **kwargs):
        """
        Authenticate user with Google OAuth2 token
        """
        if google_token is None:
            return None
            
        try:
            # Verify the Google ID token
            idinfo = id_token.verify_oauth2_token(
                google_token,
                requests.Request(),
                settings.GOOGLE_OAUTH2_CLIENT_ID
            )
            
            # Check if token is issued by Google
            if idinfo['iss'] not in ['accounts.google.com', 'https://accounts.google.com']:
                return None
                
            google_id = idinfo['sub']
            email = idinfo['email']
            first_name = idinfo.get('given_name', '')
            last_name = idinfo.get('family_name', '')
            
            # Try to find existing user by email
            try:
                user = User.objects.get(email=email)
                # Update Google ID if not set
                if not hasattr(user, 'google_id') or not user.google_id:
                    user.google_id = google_id
                    user.save()
                return user
            except User.DoesNotExist:
                # User doesn't exist, we'll handle creation in the view
                # Return user data for profile completion
                return {
                    'google_id': google_id,
                    'email': email,
                    'first_name': first_name,
                    'last_name': last_name,
                    'requires_completion': True
                }
                
        except ValueError:
            # Invalid token
            return None
    
    def get_user(self, user_id):
        """
        Get user by ID
        """
        try:
            return User.objects.get(pk=user_id)
        except User.DoesNotExist:
            return None


def verify_google_token(token):
    """
    Utility function to verify Google OAuth2 token
    """
    try:
        idinfo = id_token.verify_oauth2_token(
            token,
            requests.Request(),
            settings.GOOGLE_OAUTH2_CLIENT_ID
        )
        
        if idinfo['iss'] not in ['accounts.google.com', 'https://accounts.google.com']:
            return None
            
        return {
            'google_id': idinfo['sub'],
            'email': idinfo['email'],
            'first_name': idinfo.get('given_name', ''),
            'last_name': idinfo.get('family_name', ''),
            'picture': idinfo.get('picture', ''),
            'email_verified': idinfo.get('email_verified', False)
        }
    except ValueError:
        return None
