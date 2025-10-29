import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw, CheckCircle2, XCircle, AlertTriangle } from "lucide-react";
import logo from "@/assets/foodhood-logo.png";

const AuthCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Check for error parameters in URL
        const error = searchParams.get('error');
        const errorDescription = searchParams.get('error_description');
        const errorCode = searchParams.get('error_code');

        if (error) {
          console.error('OAuth error from URL:', { error, errorDescription, errorCode });
          
          let userFriendlyMessage = 'Authentication failed';
          
          if (error === 'server_error' && errorDescription?.includes('Unable to exchange external code')) {
            userFriendlyMessage = 'Google sign-in configuration error. Please check that:\n' +
              '• The OAuth redirect URL is correctly configured in Google Console\n' +
              '• The Google OAuth client is properly set up in Supabase\n' +
              '• All required OAuth scopes are enabled';
          } else if (error === 'access_denied') {
            userFriendlyMessage = 'You denied access to the application. Please try again and accept the required permissions.';
          } else if (errorDescription) {
            userFriendlyMessage = decodeURIComponent(errorDescription);
          }
          
          setStatus('error');
          setErrorMessage(userFriendlyMessage);
          
          toast({
            title: "Authentication Error",
            description: userFriendlyMessage,
            variant: "destructive",
            duration: 10000,
          });
          
          return;
        }

        // Handle successful OAuth callback
        const { data, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Session error:', sessionError);
          throw sessionError;
        }
        
        if (data.session) {
          console.log('Authentication successful:', data.session.user);
          setStatus('success');
          
          toast({
            title: "Welcome!",
            description: "Successfully signed in with Google.",
          });
          
          // Small delay for better UX
          setTimeout(() => {
            navigate('/menu');
          }, 1000);
        } else {
          throw new Error('No session found after authentication');
        }
      } catch (error: any) {
        console.error('Auth callback error:', error);
        setStatus('error');
        setErrorMessage(error.message || 'Authentication failed');
        
        toast({
          title: "Authentication Error",
          description: error.message || 'Something went wrong during authentication',
          variant: "destructive",
        });
      }
    };

    handleAuthCallback();
  }, [navigate, searchParams, toast]);

  const handleRetry = () => {
    navigate('/auth');
  };

  const handleGoHome = () => {
    navigate('/');
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-600/95 via-orange-500/90 to-red-600/90">
        <Card className="w-full max-w-md mx-4">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <img src={logo} alt="FoodHood" className="h-12 w-12" />
              <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
                FoodHood
              </h1>
            </div>
            <CardTitle className="flex items-center justify-center gap-2">
              <RefreshCw className="w-5 h-5 animate-spin" />
              Signing you in...
            </CardTitle>
            <CardDescription>
              Please wait while we complete your authentication
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-600/95 via-green-500/90 to-emerald-600/90">
        <Card className="w-full max-w-md mx-4">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <img src={logo} alt="FoodHood" className="h-12 w-12" />
              <h1 className="text-2xl font-bold bg-gradient-to-r from-green-500 to-emerald-500 bg-clip-text text-transparent">
                FoodHood
              </h1>
            </div>
            <CardTitle className="flex items-center justify-center gap-2 text-green-600">
              <CheckCircle2 className="w-5 h-5" />
              Success!
            </CardTitle>
            <CardDescription>
              You've been successfully signed in. Redirecting to menu...
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-600/95 via-red-500/90 to-pink-600/90">
      <Card className="w-full max-w-lg mx-4">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <img src={logo} alt="FoodHood" className="h-12 w-12" />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-red-500 to-pink-500 bg-clip-text text-transparent">
              FoodHood
            </h1>
          </div>
          <CardTitle className="flex items-center justify-center gap-2 text-red-600">
            <XCircle className="w-5 h-5" />
            Authentication Error
          </CardTitle>
          <CardDescription className="text-left">
            <div className="flex items-start gap-2 mt-4">
              <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-muted-foreground whitespace-pre-line">
                {errorMessage}
              </div>
            </div>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button onClick={handleRetry} className="w-full">
            Try Again
          </Button>
          <Button onClick={handleGoHome} variant="outline" className="w-full">
            Go to Home
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthCallback;