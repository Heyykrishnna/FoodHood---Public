import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Copy, ExternalLink, CheckCircle2, XCircle, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import logo from "@/assets/foodhood-logo.png";

const OAuthDebug = () => {
  const { toast } = useToast();
  const [debugInfo, setDebugInfo] = useState<any>({});
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    const collectDebugInfo = async () => {
      // Get current session
      const { data: sessionData } = await supabase.auth.getSession();
      setSession(sessionData.session);

      // Collect debug information
      const info = {
        currentUrl: window.location.href,
        origin: window.location.origin,
        supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
        supabaseProjectId: import.meta.env.VITE_SUPABASE_PROJECT_ID,
        expectedCallbackUrl: `${window.location.origin}/auth/callback`,
        supabaseCallbackUrl: `${import.meta.env.VITE_SUPABASE_URL}/auth/v1/callback`,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString(),
      };
      setDebugInfo(info);
    };

    collectDebugInfo();
  }, []);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: `${label} copied to clipboard`,
    });
  };

  const testGoogleAuth = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) {
        console.error('OAuth test error:', error);
        toast({
          title: "OAuth Test Failed",
          description: error.message,
          variant: "destructive",
        });
      } else {
        console.log('OAuth test initiated:', data);
      }
    } catch (error: any) {
      console.error('OAuth test error:', error);
      toast({
        title: "OAuth Test Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const DebugRow = ({ label, value, status = 'info', copyable = false }: {
    label: string;
    value: string;
    status?: 'info' | 'success' | 'warning' | 'error';
    copyable?: boolean;
  }) => {
    const getStatusIcon = () => {
      switch (status) {
        case 'success':
          return <CheckCircle2 className="w-4 h-4 text-green-500" />;
        case 'error':
          return <XCircle className="w-4 h-4 text-red-500" />;
        case 'warning':
          return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
        default:
          return null;
      }
    };

    return (
      <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {getStatusIcon()}
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium">{label}</div>
            <div className="text-xs text-muted-foreground truncate" title={value}>
              {value}
            </div>
          </div>
        </div>
        {copyable && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => copyToClipboard(value, label)}
            className="flex-shrink-0 ml-2"
          >
            <Copy className="w-3 h-3" />
          </Button>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600/95 via-indigo-500/90 to-purple-600/90 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <Card>
          <CardHeader className="text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <img src={logo} alt="FoodHood" className="h-12 w-12" />
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
                OAuth Debug Console
              </h1>
            </div>
            <CardDescription>
              Use this page to diagnose Google OAuth configuration issues
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Current Session */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Authentication Status
              <Badge variant={session ? "default" : "secondary"}>
                {session ? "Authenticated" : "Not Authenticated"}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {session ? (
              <>
                <DebugRow 
                  label="User Email" 
                  value={session.user.email || "N/A"} 
                  status="success"
                />
                <DebugRow 
                  label="Provider" 
                  value={session.user.app_metadata.provider || "N/A"} 
                  status="success"
                />
                <DebugRow 
                  label="Session Expires" 
                  value={new Date(session.expires_at * 1000).toLocaleString()} 
                  status="info"
                />
              </>
            ) : (
              <div className="text-center text-muted-foreground py-4">
                No active session found
              </div>
            )}
          </CardContent>
        </Card>

        {/* Configuration Info */}
        <Card>
          <CardHeader>
            <CardTitle>Configuration Details</CardTitle>
            <CardDescription>
              Copy these URLs to configure Google Console and Supabase
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3">
              <DebugRow
                label="Current Domain"
                value={debugInfo.origin || ""}
                status="info"
                copyable
              />
              <DebugRow
                label="App Callback URL (for Google Console)"
                value={debugInfo.expectedCallbackUrl || ""}
                status="warning"
                copyable
              />
              <DebugRow
                label="Supabase Auth Callback (for Google Console)"
                value={debugInfo.supabaseCallbackUrl || ""}
                status="error"
                copyable
              />
              <DebugRow
                label="Supabase Project ID"
                value={debugInfo.supabaseProjectId || ""}
                status="info"
                copyable
              />
              <DebugRow
                label="Supabase URL"
                value={debugInfo.supabaseUrl || ""}
                status="info"
                copyable
              />
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mt-6">
              <h4 className="font-medium text-amber-800 mb-2">🔧 Configuration Requirements:</h4>
              <div className="text-sm text-amber-700 space-y-1">
                <p>1. <strong>Google Console</strong> → Add both callback URLs above</p>
                <p>2. <strong>Supabase</strong> → Enable Google provider with client credentials</p>
                <p>3. <strong>Supabase</strong> → Add your domain to Site URL and Redirect URLs</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Test Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Test OAuth Flow</CardTitle>
            <CardDescription>
              Click below to test the Google OAuth configuration
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button onClick={testGoogleAuth} className="w-full" size="lg">
              Test Google Sign-In
            </Button>
            <div className="grid grid-cols-2 gap-3">
              <Button 
                variant="outline" 
                onClick={() => window.open('https://console.cloud.google.com/apis/credentials', '_blank')}
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Google Console
              </Button>
              <Button 
                variant="outline" 
                onClick={() => window.open('https://app.supabase.com/project/' + debugInfo.supabaseProjectId + '/auth/providers', '_blank')}
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Supabase Auth
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* URL Parameters */}
        {window.location.search && (
          <Card>
            <CardHeader>
              <CardTitle>Current URL Parameters</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="text-xs bg-muted p-3 rounded overflow-auto">
                {JSON.stringify(Object.fromEntries(new URLSearchParams(window.location.search)), null, 2)}
              </pre>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default OAuthDebug;