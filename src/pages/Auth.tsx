import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { 
  Mail, 
  Lock, 
  User, 
  ChevronRight, 
  Sparkles, 
  ShoppingBag, 
  Clock, 
  Shield,
  Eye,
  EyeOff,
  Github,
  Chrome,
  KeyRound,
  CheckCircle2,
  XCircle,
  AlertCircle,
  RefreshCw
} from "lucide-react";
import logo from "@/assets/foodhood-logo.png";

const authSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  fullName: z.string().optional(),
});

const resetSchema = z.object({
  email: z.string().email("Invalid email address"),
});

// Password strength checker
const checkPasswordStrength = (password: string) => {
  let score = 0;
  const checks = {
    length: password.length >= 8,
    lowercase: /[a-z]/.test(password),
    uppercase: /[A-Z]/.test(password),
    number: /\d/.test(password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  };
  
  Object.values(checks).forEach(check => check && score++);
  
  return {
    score,
    checks,
    strength: score < 2 ? 'weak' : score < 4 ? 'medium' : 'strong'
  };
};

const Auth = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({});
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [particles, setParticles] = useState<Array<{id: number, left: number, delay: number}>>([]);
  const emailInputRef = useRef<HTMLInputElement>(null);
  const passwordInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    fullName: "",
    resetEmail: "",
  });

  // Particle system
  useEffect(() => {
    const generateParticles = () => {
      const newParticles = Array.from({ length: 15 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 4,
      }));
      setParticles(newParticles);
    };
    
    generateParticles();
    const interval = setInterval(generateParticles, 8000);
    
    return () => clearInterval(interval);
  }, []);
  
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate("/menu");
      }
    });
    
    // Auto focus on email field
    if (emailInputRef.current) {
      emailInputRef.current.focus();
    }
    
    // Load remember me from localStorage
    const savedRememberMe = localStorage.getItem('rememberMe') === 'true';
    setRememberMe(savedRememberMe);
    if (savedRememberMe) {
      const savedEmail = localStorage.getItem('savedEmail');
      if (savedEmail) {
        setFormData(prev => ({ ...prev, email: savedEmail }));
      }
    }
  }, [navigate]);
  
  // Real-time validation
  const validateField = useCallback((field: string, value: string) => {
    const errors: {[key: string]: string} = {};
    
    switch (field) {
      case 'email':
        if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          errors.email = 'Please enter a valid email address';
        }
        break;
      case 'password':
        if (value && value.length < 6) {
          errors.password = 'Password must be at least 6 characters';
        }
        break;
      case 'fullName':
        if (value && value.length < 2) {
          errors.fullName = 'Name must be at least 2 characters';
        }
        break;
    }
    
    setValidationErrors(prev => ({ ...prev, ...errors, [field]: errors[field] || '' }));
  }, []);
  
  // Handle form data changes with validation
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    validateField(field, value);
  };
  
  // Password reset function
  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsResetting(true);
    
    try {
      const validated = resetSchema.parse({ email: formData.resetEmail });
      
      const { error } = await supabase.auth.resetPasswordForEmail(validated.email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      
      if (error) throw error;
      
      toast({
        title: "Reset email sent!",
        description: "Check your email for password reset instructions.",
      });
      
      setShowForgotPassword(false);
      setFormData(prev => ({ ...prev, resetEmail: '' }));
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to send reset email",
        variant: "destructive",
      });
    } finally {
      setIsResetting(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const validated = authSchema.parse(formData);
      
      // Check if all required fields are valid
      if (validationErrors.email || validationErrors.password || validationErrors.fullName) {
        throw new Error('Please fix the validation errors');
      }
      
      const { error } = await supabase.auth.signUp({
        email: validated.email,
        password: validated.password,
        options: {
          data: {
            full_name: formData.fullName,
          },
          emailRedirectTo: `${window.location.origin}/`,
        },
      });

      if (error) throw error;
      
      // Save email if remember me is checked
      if (rememberMe) {
        localStorage.setItem('rememberMe', 'true');
        localStorage.setItem('savedEmail', formData.email);
      }

      toast({
        title: "Success!",
        description: "Account created successfully. Please check your email to verify your account.",
        className: "animate-success",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to sign up",
        variant: "destructive",
        className: "animate-shake",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const validated = authSchema.pick({ email: true, password: true }).parse(formData);
      
      // Check for validation errors
      if (validationErrors.email || validationErrors.password) {
        throw new Error('Please fix the validation errors');
      }
      
      const { error } = await supabase.auth.signInWithPassword({
        email: validated.email,
        password: validated.password,
      });

      if (error) throw error;
      
      // Handle remember me
      if (rememberMe) {
        localStorage.setItem('rememberMe', 'true');
        localStorage.setItem('savedEmail', formData.email);
      } else {
        localStorage.removeItem('rememberMe');
        localStorage.removeItem('savedEmail');
      }

      toast({
        title: "Welcome back!",
        description: "Signed in successfully.",
        className: "animate-success",
      });
      
      // Add a small delay for better UX
      setTimeout(() => {
        navigate("/menu");
      }, 500);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to sign in",
        variant: "destructive",
        className: "animate-shake",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);

    try {
      // Get the current domain to construct proper redirect URL
      const currentDomain = window.location.origin;
      const redirectUrl = `${currentDomain}/auth/callback`;
      
      console.log('OAuth redirect URL:', redirectUrl);
      console.log('Current domain:', currentDomain);
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) {
        console.error('Google OAuth error:', error);
        throw error;
      }
      
      // Don't set loading to false here as the user will be redirected
      console.log('OAuth initiated successfully:', data);
      
    } catch (error: any) {
      console.error('Google sign-in error:', error);
      
      let errorMessage = "Failed to sign in with Google";
      
      // Handle specific OAuth errors
      if (error.message?.includes('provider is not enabled')) {
        errorMessage = "Google sign-in is not configured in Supabase. Please contact support.";
      } else if (error.message?.includes('validation_failed')) {
        errorMessage = "Google authentication configuration is invalid.";
      } else if (error.message?.includes('unauthorized_client')) {
        errorMessage = "OAuth client configuration is incorrect.";
      } else if (error.message?.includes('redirect_uri_mismatch')) {
        errorMessage = "OAuth redirect URL mismatch. Please check Google Console configuration.";
      } else if (error.message?.includes('access_denied')) {
        errorMessage = "Access denied. Please try again and accept the permissions.";
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Google Sign-in Error",
        description: errorMessage,
        variant: "destructive",
        className: "animate-shake",
      });
      setIsLoading(false);
    }
  };

  // Get password strength
  const passwordStrength = checkPasswordStrength(formData.password);

  return (
    <div className="min-h-screen flex relative overflow-hidden">
      {/* Campus-Themed Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-700 via-red-600 to-orange-800">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,140,0,0.3),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_70%,rgba(220,38,38,0.3),transparent_50%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.05)_50%,transparent_75%)] animate-pulse" />
        
        {/* Academic Pattern Overlay */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full bg-[repeating-linear-gradient(45deg,transparent,transparent_35px,rgba(255,255,255,0.1)_35px,rgba(255,255,255,0.1)_70px)]" />
        </div>
      </div>

      {/* Particle System */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {particles.map((particle) => (
          <div
            key={particle.id}
            className="particle"
            style={{
              left: `${particle.left}%`,
              animationDelay: `${particle.delay}s`,
            }}
          />
        ))}
      </div>

      {/* Campus-Inspired Floating Elements */}
      <div className="absolute top-20 left-10 w-80 h-80 bg-gradient-to-br from-orange-400/20 to-yellow-400/10 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-gradient-to-tl from-red-400/20 to-orange-400/10 rounded-full blur-3xl animate-float" style={{ animationDelay: "2s" }} />
      <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-gradient-to-r from-yellow-300/10 to-orange-300/10 rounded-full blur-2xl animate-pulse" style={{ animationDelay: "1s" }} />

      <div className="relative z-10 flex w-full">
        {/* Left Side - Campus Hero Section */}
        <div className="hidden lg:flex lg:w-1/2 flex-col justify-center items-center p-12 text-center">
          <div className="max-w-lg space-y-8 animate-fade-in">
            {/* University-Styled Logo */}
            <div className="flex flex-col items-center gap-4 mb-8">
              <div className="relative group">
                <div className="absolute -inset-3 bg-gradient-to-r from-orange-400 via-red-400 to-orange-400 rounded-full opacity-75 group-hover:opacity-100 blur-lg transition-all duration-500 animate-pulse" />
                <div className="relative bg-white square-full p-4 shadow-2xl">
                  <img src={logo} alt="FoodHood" className="h-20 w-20 group-hover:scale-110 transition-all duration-300" />
                </div>
              </div>
              <div className="space-y-2">
                <h1 className="text-5xl font-bold bg-gradient-to-r from-white via-orange-100 to-white bg-clip-text text-transparent drop-shadow-lg">
                  FoodHood
                </h1>
                <p className="text-sm font-medium text-orange-100 tracking-wider uppercase">
                  Rishihood University Campus
                </p>
              </div>
            </div>
            
            {/* Campus Mission Statement */}
            <div className="space-y-4 text-center bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
              <h2 className="text-3xl font-bold text-white leading-tight">
                Fueling Academic Excellence
              </h2>
              <p className="text-lg text-orange-50 leading-relaxed">
                Your trusted campus food platform - connecting students with quality meals through smart, time-based pricing
              </p>
            </div>


            {/* Campus Features */}
            <div className="grid grid-cols-2 gap-4 mt-8">
              <div className="group flex flex-col items-center gap-3 p-5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/30 hover:border-orange-300 hover:bg-white/15 transition-all duration-300 hover-scale cursor-pointer">
                <div className="p-3 rounded-full bg-gradient-to-br from-orange-400 to-yellow-400 shadow-lg group-hover:shadow-orange-400/50 transition-shadow">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <div className="text-center">
                  <h3 className="font-bold text-white text-sm">Campus Delivery</h3>
                  <p className="text-xs text-orange-100">Quick & Reliable</p>
                </div>
              </div>

              <div className="group flex flex-col items-center gap-3 p-5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/30 hover:border-red-300 hover:bg-white/15 transition-all duration-300 hover-scale cursor-pointer">
                <div className="p-3 rounded-full bg-gradient-to-br from-red-500 to-orange-500 shadow-lg group-hover:shadow-red-400/50 transition-shadow">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div className="text-center">
                  <h3 className="font-bold text-white text-sm">Smart Pricing</h3>
                  <p className="text-xs text-orange-100">Student Savings</p>
                </div>
              </div>

              <div className="group flex flex-col items-center gap-3 p-5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/30 hover:border-yellow-300 hover:bg-white/15 transition-all duration-300 hover-scale cursor-pointer">
                <div className="p-3 rounded-full bg-gradient-to-br from-yellow-400 to-orange-400 shadow-lg group-hover:shadow-yellow-400/50 transition-shadow">
                  <ShoppingBag className="w-6 h-6 text-white" />
                </div>
                <div className="text-center">
                  <h3 className="font-bold text-white text-sm">Easy Orders</h3>
                  <p className="text-xs text-orange-100">Hassle Free</p>
                </div>
              </div>

              <div className="group flex flex-col items-center gap-3 p-5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/30 hover:border-orange-300 hover:bg-white/15 transition-all duration-300 hover-scale cursor-pointer">
                <div className="p-3 rounded-full bg-gradient-to-br from-orange-500 to-red-500 shadow-lg group-hover:shadow-orange-400/50 transition-shadow">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div className="text-center">
                  <h3 className="font-bold text-white text-sm">Secure System</h3>
                  <p className="text-xs text-orange-100">Protected</p>
                </div>
              </div>
            </div>

            {/* Campus Stats */}
            <div className="grid grid-cols-3 gap-4 py-6 px-4 bg-white/10 backdrop-blur-md rounded-xl border border-white/20">
              <div className="text-center">
                <div className="text-3xl font-bold text-white">500+</div>
                <div className="text-xs text-orange-100 mt-1">Students</div>
              </div>
              <div className="text-center border-l border-r border-white/30">
                <div className="text-3xl font-bold text-white">15+</div>
                <div className="text-xs text-orange-100 mt-1">Vendors</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white">24/7</div>
                <div className="text-xs text-orange-100 mt-1">Available</div>
              </div>
            </div>

            {/* Back to Home */}
            <div className="mt-8 space-y-2 text-center">
              <Link to="/">
                <Button variant="ghost" className="group text-white hover:text-orange-200 hover:bg-white/10">
                  <span>Back to Campus Home</span>
                  <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Right Side - Modern Auth Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12">
          <div className="w-full max-w-md relative">
            {/* Enhanced card with academic styling */}
            <div className="relative animate-slide-up">
              {/* Decorative border effect */}
              <div className="absolute -inset-1 bg-gradient-to-r from-orange-400 via-red-400 to-orange-400 rounded-3xl blur-md opacity-75 group-hover:opacity-100 transition duration-1000 animate-pulse" />
              
              <Card className="relative z-10 shadow-2xl bg-white/95 backdrop-blur-xl border-2 border-orange-200/50 rounded-3xl overflow-hidden">
                {/* Decorative top accent */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 via-red-500 to-orange-500" />
                
                <CardHeader className="text-center space-y-3 pb-8 pt-8 relative">
                  {/* Mobile Logo */}
                  <div className="flex lg:hidden flex-col items-center gap-3 mb-4">
                    <div className="relative group">
                      <div className="absolute -inset-2 bg-gradient-to-r from-orange-400 to-red-400 rounded-full opacity-75 blur-lg animate-pulse" />
                      <div className="relative bg-white rounded-full p-3 shadow-lg">
                        <img src={logo} alt="FoodHood" className="h-14 w-14" />
                      </div>
                    </div>
                    <div>
                      <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                        FoodHood
                      </h1>
                      <p className="text-xs font-medium text-orange-600 mt-1">Rishihood Campus</p>
                    </div>
                  </div>
                  
                  <CardTitle className="text-3xl font-bold !text-gray-900 dark:!text-gray-900 animate-fade-in">
                    {showForgotPassword ? 'Reset Password' : 'Welcome Back!'}
                  </CardTitle>
                  <CardDescription className="text-base !text-gray-700 dark:!text-gray-700 animate-fade-in" style={{ animationDelay: "0.1s" }}>
                    {showForgotPassword ? 'Enter your email to receive reset instructions' : 'Access your campus food account'}
                  </CardDescription>
                </CardHeader>
            
                <CardContent className="relative z-10">
                  {showForgotPassword ? (
                    /* Password Reset Form */
                    <div className="space-y-6 animate-slide-up">
                      <form onSubmit={handlePasswordReset} className="space-y-6">
                          <div className="space-y-2">
                            <Label htmlFor="reset-email" className="text-base flex items-center gap-2 !text-gray-900 dark:!text-gray-900">
                              <Mail className="w-4 h-4 text-orange-600" />
                              Email Address
                            </Label>
                          <Input
                            id="reset-email"
                            type="email"
                            placeholder="Enter your email address"
                            value={formData.resetEmail}
                            onChange={(e) => setFormData({ ...formData, resetEmail: e.target.value })}
                            className="h-12 text-base border-2 focus:border-orange-600 transition-all duration-300"
                            required
                          />
                        </div>
                        
                        <div className="space-y-4">
                          <Button 
                            type="submit" 
                            className="w-full h-12 text-base font-semibold bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 transition-all shadow-lg hover:shadow-xl hover:scale-[1.02]" 
                            disabled={isResetting}
                          >
                            {isResetting ? (
                              <span className="flex items-center gap-2">
                                <RefreshCw className="w-4 h-4 animate-spin" />
                                Sending Reset Email...
                              </span>
                            ) : (
                              <span className="flex items-center gap-2">
                                <KeyRound className="w-4 h-4" />
                                Send Reset Email
                              </span>
                            )}
                          </Button>
                          
                          <Button 
                            type="button"
                            variant="outline"
                            className="w-full h-12"
                            onClick={() => setShowForgotPassword(false)}
                          >
                            Back to Sign In
                          </Button>
                        </div>
                      </form>
                    </div>
                  ) : (
                    /* Main Auth Forms */
                    <Tabs defaultValue="signin" className="w-full animate-fade-in">
                <TabsList className="grid w-full grid-cols-2 h-12 mb-8 bg-muted/50">
                  <TabsTrigger 
                    value="signin" 
                    className="text-base data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-600 data-[state=active]:to-red-600 data-[state=active]:text-white"
                  >
                    Sign In
                  </TabsTrigger>
                  <TabsTrigger 
                    value="signup"
                    className="text-base data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-600 data-[state=active]:to-orange-600 data-[state=active]:text-white"
                  >
                    Sign Up
                  </TabsTrigger>
                </TabsList>

                      <TabsContent value="signin" className="space-y-6">
                        <form onSubmit={handleSignIn} className="space-y-6">
                          {/* Email Field */}
                          <div className="space-y-2 animate-slide-up" style={{ animationDelay: "0.1s" }}>
                            <Label htmlFor="signin-email" className="text-base flex items-center gap-2 !text-gray-900 dark:!text-gray-900">
                              <Mail className="w-4 h-4 text-orange-600" />
                              Email Address
                            </Label>
                            <div className="relative">
                              <Input
                                ref={emailInputRef}
                                id="signin-email"
                                type="email"
                                placeholder="your@email.com"
                                value={formData.email}
                                onChange={(e) => handleInputChange('email', e.target.value)}
                                onFocus={() => setFocusedField('email')}
                                onBlur={() => setFocusedField(null)}
                                className={`h-12 text-base border-2 transition-all duration-300 pl-4 ${
                                  focusedField === 'email' ? 'border-orange-600 shadow-lg scale-[1.02]' : 
                                  validationErrors.email ? 'border-destructive animate-shake' : 'border-border'
                                } hover:border-orange-600/50`}
                                required
                              />
                              {validationErrors.email && (
                                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                  <XCircle className="w-4 h-4 text-destructive" />
                                </div>
                              )}
                            </div>
                            {validationErrors.email && (
                              <p className="text-sm text-destructive animate-slide-up flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" />
                                {validationErrors.email}
                              </p>
                            )}
                          </div>
                          
                          {/* Password Field */}
                          <div className="space-y-2 animate-slide-up" style={{ animationDelay: "0.2s" }}>
                            <Label htmlFor="signin-password" className="text-base flex items-center gap-2 !text-gray-900 dark:!text-gray-900">
                              <Lock className="w-4 h-4 text-orange-600" />
                              Password
                            </Label>
                            <div className="relative">
                              <Input
                                ref={passwordInputRef}
                                id="signin-password"
                                type={showPassword ? "text" : "password"}
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={(e) => handleInputChange('password', e.target.value)}
                                onFocus={() => setFocusedField('password')}
                                onBlur={() => setFocusedField(null)}
                                className={`h-12 text-base border-2 transition-all duration-300 pl-4 pr-12 ${
                                  focusedField === 'password' ? 'border-orange-600 shadow-lg scale-[1.02]' : 
                                  validationErrors.password ? 'border-destructive animate-shake' : 'border-border'
                                } hover:border-orange-600/50`}
                                required
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="absolute right-0 top-0 h-12 px-3 hover:bg-transparent"
                                onClick={() => setShowPassword(!showPassword)}
                              >
                                {showPassword ? (
                                  <EyeOff className="w-4 h-4 text-muted-foreground hover:text-orange-600 transition-colors" />
                                ) : (
                                  <Eye className="w-4 h-4 text-muted-foreground hover:text-orange-600 transition-colors" />
                                )}
                              </Button>
                            </div>
                            {validationErrors.password && (
                              <p className="text-sm text-destructive animate-slide-up flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" />
                                {validationErrors.password}
                              </p>
                            )}
                          </div>
                          
                          {/* Remember Me & Forgot Password */}
                          <div className="flex items-center justify-between animate-slide-up" style={{ animationDelay: "0.3s" }}>
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id="remember-me"
                                checked={rememberMe}
                                onCheckedChange={(checked) => setRememberMe(checked === true)}
                              />
                              <Label htmlFor="remember-me" className="text-sm cursor-pointer !text-gray-900 dark:!text-gray-900">
                                Remember me
                              </Label>
                            </div>
                            <Button
                              type="button"
                              variant="link"
                              className="p-0 h-auto text-sm text-orange-600 hover:text-orange-600/80"
                              onClick={() => setShowForgotPassword(true)}
                            >
                              Forgot password?
                            </Button>
                          </div>
                    
                          {/* Sign In Button */}
                          <Button 
                            type="submit" 
                            className="w-full h-12 text-base font-semibold bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 transition-all shadow-lg hover:shadow-xl hover:scale-[1.02] animate-slide-up" 
                            style={{ animationDelay: "0.4s" }}
                            disabled={isLoading}
                          >
                            {isLoading ? (
                              <span className="flex items-center gap-2">
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Signing in...
                              </span>
                            ) : (
                              <span className="flex items-center gap-2">
                                Sign In
                                <ChevronRight className="w-4 h-4" />
                              </span>
                            )}
                          </Button>
                          
                          {/* Divider */}
                          <div className="relative animate-slide-up" style={{ animationDelay: "0.5s" }}>
                            <div className="absolute inset-0 flex items-center">
                              <span className="w-full border-t" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                              <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
                            </div>
                          </div>
                          
                          {/* Social Auth Buttons */}
                          <div className="grid grid-cols-1 gap-3 animate-slide-up text-black" style={{ animationDelay: "0.6s" }}>
                            <Button 
                              type="button"
                              variant="outline" 
                              className="h-11 hover:bg-black transition-all hover:scale-105"
                              disabled={isLoading}
                              onClick={handleGoogleSignIn}
                            >
                              <Chrome className="w-4 h-4 mr-2" />
                              Google
                            </Button>
                          </div>
                        </form>
                      </TabsContent>

                      <TabsContent value="signup" className="space-y-6">
                        <form onSubmit={handleSignUp} className="space-y-6">
                          {/* Full Name Field */}
                          <div className="space-y-2 animate-slide-up" style={{ animationDelay: "0.1s" }}>
                            <Label htmlFor="signup-name" className="text-base flex items-center gap-2 !text-gray-900 dark:!text-gray-900">
                              <User className="w-4 h-4 text-orange-600" />
                              Full Name
                            </Label>
                            <div className="relative">
                              <Input
                                id="signup-name"
                                type="text"
                                placeholder="Priya"
                                value={formData.fullName}
                                onChange={(e) => handleInputChange('fullName', e.target.value)}
                                onFocus={() => setFocusedField('fullName')}
                                onBlur={() => setFocusedField(null)}
                                className={`h-12 text-base border-2 transition-all duration-300 pl-4 ${
                                  focusedField === 'fullName' ? 'border-orange-600 shadow-lg scale-[1.02]' : 
                                  validationErrors.fullName ? 'border-destructive animate-shake' : 'border-border'
                                } hover:border-orange-600/50`}
                              />
                              {validationErrors.fullName && (
                                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                  <XCircle className="w-4 h-4 text-destructive" />
                                </div>
                              )}
                            </div>
                            {validationErrors.fullName && (
                              <p className="text-sm text-destructive animate-slide-up flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" />
                                {validationErrors.fullName}
                              </p>
                            )}
                          </div>
                          
                          {/* Email Field */}
                          <div className="space-y-2 animate-slide-up" style={{ animationDelay: "0.2s" }}>
                            <Label htmlFor="signup-email" className="text-base flex items-center gap-2 !text-gray-900 dark:!text-gray-900">
                              <Mail className="w-4 h-4 text-red-600" />
                              Email Address
                            </Label>
                            <div className="relative">
                              <Input
                                id="signup-email"
                                type="email"
                                placeholder="your@email.com"
                                value={formData.email}
                                onChange={(e) => handleInputChange('email', e.target.value)}
                                onFocus={() => setFocusedField('email')}
                                onBlur={() => setFocusedField(null)}
                                className={`h-12 text-base border-2 transition-all duration-300 pl-4 ${
                                  focusedField === 'email' ? 'border-red-600 shadow-lg scale-[1.02]' : 
                                  validationErrors.email ? 'border-destructive animate-shake' : 'border-border'
                                } hover:border-red-600/50`}
                                required
                              />
                              {validationErrors.email ? (
                                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                  <XCircle className="w-4 h-4 text-destructive" />
                                </div>
                              ) : formData.email && !validationErrors.email && focusedField !== 'email' ? (
                                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                                </div>
                              ) : null}
                            </div>
                            {validationErrors.email && (
                              <p className="text-sm text-destructive animate-slide-up flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" />
                                {validationErrors.email}
                              </p>
                            )}
                          </div>
                          
                          {/* Password Field with Strength Indicator */}
                          <div className="space-y-3 animate-slide-up" style={{ animationDelay: "0.3s" }}>
                            <Label htmlFor="signup-password" className="text-base flex items-center gap-2 !text-gray-900 dark:!text-gray-900">
                              <Lock className="w-4 h-4 text-orange-600" />
                              Password
                            </Label>
                            <div className="relative">
                              <Input
                                id="signup-password"
                                type={showPassword ? "text" : "password"}
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={(e) => handleInputChange('password', e.target.value)}
                                onFocus={() => setFocusedField('password')}
                                onBlur={() => setFocusedField(null)}
                                className={`h-12 text-base border-2 transition-all duration-300 pl-4 pr-12 ${
                                  focusedField === 'password' ? 'border-orange-600 shadow-lg scale-[1.02]' : 
                                  validationErrors.password ? 'border-destructive animate-shake' : 'border-border'
                                } hover:border-orange-600/50`}
                                required
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="absolute right-0 top-0 h-12 px-3 hover:bg-transparent"
                                onClick={() => setShowPassword(!showPassword)}
                              >
                                {showPassword ? (
                                  <EyeOff className="w-4 h-4 text-muted-foreground hover:text-orange-600 transition-colors" />
                                ) : (
                                  <Eye className="w-4 h-4 text-muted-foreground hover:text-orange-600 transition-colors" />
                                )}
                              </Button>
                            </div>
                            
                            {/* Password Strength Indicator */}
                            {formData.password && (
                              <div className="space-y-2 animate-fade-in">
                                <div className="flex items-center gap-2">
                                  <Progress 
                                    value={(passwordStrength.score / 5) * 100} 
                                    className={`h-2 flex-1 ${
                                      passwordStrength.strength === 'weak' ? '[&>div]:bg-red-500' :
                                      passwordStrength.strength === 'medium' ? '[&>div]:bg-yellow-500' :
                                      '[&>div]:bg-green-500'
                                    }`}
                                  />
                                  <span className={`text-xs font-medium ${
                                    passwordStrength.strength === 'weak' ? 'text-red-500' :
                                    passwordStrength.strength === 'medium' ? 'text-yellow-500' :
                                    'text-green-500'
                                  }`}>
                                    {passwordStrength.strength.charAt(0).toUpperCase() + passwordStrength.strength.slice(1)}
                                  </span>
                                </div>
                                
                                {/* Password Requirements */}
                                <div className="grid grid-cols-2 gap-1 text-xs">
                                  <div className={`flex items-center gap-1 ${
                                    passwordStrength.checks.length ? 'text-green-600' : 'text-muted-foreground'
                                  }`}>
                                    {passwordStrength.checks.length ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                                    8+ characters
                                  </div>
                                  <div className={`flex items-center gap-1 ${
                                    passwordStrength.checks.lowercase ? 'text-green-600' : 'text-muted-foreground'
                                  }`}>
                                    {passwordStrength.checks.lowercase ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                                    Lowercase
                                  </div>
                                  <div className={`flex items-center gap-1 ${
                                    passwordStrength.checks.uppercase ? 'text-green-600' : 'text-muted-foreground'
                                  }`}>
                                    {passwordStrength.checks.uppercase ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                                    Uppercase
                                  </div>
                                  <div className={`flex items-center gap-1 ${
                                    passwordStrength.checks.number ? 'text-green-600' : 'text-muted-foreground'
                                  }`}>
                                    {passwordStrength.checks.number ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                                    Number
                                  </div>
                                </div>
                              </div>
                            )}
                            
                            {validationErrors.password && (
                              <p className="text-sm text-destructive animate-slide-up flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" />
                                {validationErrors.password}
                              </p>
                            )}
                          </div>
                          
                          {/* Terms and Remember Me */}
                          <div className="space-y-3 animate-slide-up" style={{ animationDelay: "0.4s" }}>
                            <div className="flex items-center space-x-2">
                      <Checkbox
                        id="remember-signup"
                        checked={rememberMe}
                        onCheckedChange={(checked) => setRememberMe(checked === true)}
                      />
                              <Label htmlFor="remember-signup" className="text-sm cursor-pointer !text-gray-900 dark:!text-gray-900">
                                Remember me
                              </Label>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              By creating an account, you agree to our Terms of Service and Privacy Policy.
                            </p>
                          </div>
                    
                          {/* Sign Up Button */}
                          <Button 
                            type="submit" 
                            className="w-full h-12 text-base font-semibold bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 transition-all shadow-lg hover:shadow-xl hover:scale-[1.02] animate-slide-up" 
                            style={{ animationDelay: "0.5s" }}
                            disabled={isLoading}
                          >
                            {isLoading ? (
                              <span className="flex items-center gap-2">
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Creating account...
                              </span>
                            ) : (
                              <span className="flex items-center gap-2">
                                Create Account
                                <Sparkles className="w-4 h-4" />
                              </span>
                            )}
                          </Button>
                          
                          {/* Divider */}
                          <div className="relative animate-slide-up" style={{ animationDelay: "0.6s" }}>
                            <div className="absolute inset-0 flex items-center">
                              <span className="w-full border-t" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                              <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
                            </div>
                          </div>
                          
                          {/* Social Auth Buttons */}
                          <div className="grid grid-cols-1 gap-3 animate-slide-up" style={{ animationDelay: "0.7s" }}>
                            <Button 
                              type="button"
                              variant="outline" 
                              className="h-11 hover:black transition-all hover:scale-105"
                              disabled={isLoading}
                              onClick={handleGoogleSignIn}
                            >
                              <Chrome className="w-4 h-4 mr-2" />
                              Google
                            </Button>
                          </div>
                        </form>
                      </TabsContent>
                    </Tabs>
                  )}

                  {/* Mobile Back to Home */}
                  <div className="lg:hidden mt-6 text-center space-y-2 animate-fade-in" style={{ animationDelay: "0.7s" }}>
                    <Link to="/">
                      <Button variant="ghost" className="group hover:bg-muted/50 transition-all">
                        <span>Back to Home</span>
                        <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </Link>
                    <div className="text-xs text-muted-foreground">
                      Having OAuth issues? <Link to="/oauth-debug" className="text-blue-600 hover:underline">Debug Console</Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
