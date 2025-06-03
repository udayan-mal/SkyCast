
import { useState, useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import Logo from "@/components/Logo";
import { Loader, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function Auth() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [session, setSession] = useState<any>(null);
  const [showEmailConfirmationAlert, setShowEmailConfirmationAlert] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        navigate("/");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setShowEmailConfirmationAlert(false);
    
    try {
      const { error, data } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        // Check if it's an email confirmation issue
        if (error.message.includes("email not confirmed") || error.message.includes("Email not confirmed")) {
          setShowEmailConfirmationAlert(true);
          toast.error("Please check your email and click the confirmation link before signing in.");
        } else if (error.message.includes("Invalid login credentials")) {
          toast.error("Invalid email or password. Please check your credentials and try again.");
        } else {
          toast.error(error.message);
        }
        return;
      }
      
      if (data.user && !data.user.email_confirmed_at) {
        setShowEmailConfirmationAlert(true);
        toast.error("Please check your email and click the confirmation link before signing in.");
        return;
      }
      
      toast.success("Signed in successfully!");
    } catch (error) {
      console.error("Error signing in:", error);
      toast.error("An unexpected error occurred during sign in");
    } finally {
      setLoading(false);
    }
  }

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setShowEmailConfirmationAlert(false);
    
    try {
      const { error, data } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
        }
      });

      if (error) {
        if (error.message.includes("User already registered")) {
          toast.error("An account with this email already exists. Please sign in instead.");
        } else {
          toast.error(error.message);
        }
        return;
      }
      
      if (data.user && !data.user.email_confirmed_at) {
        setShowEmailConfirmationAlert(true);
        toast.success("Account created! Please check your email for a confirmation link.");
      } else {
        toast.success("Account created successfully!");
      }
    } catch (error) {
      console.error("Error signing up:", error);
      toast.error("An unexpected error occurred during sign up");
    } finally {
      setLoading(false);
    }
  }

  async function resendConfirmation() {
    if (!email) {
      toast.error("Please enter your email address first");
      return;
    }

    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
        }
      });

      if (error) {
        toast.error(error.message);
      } else {
        toast.success("Confirmation email sent! Please check your inbox.");
      }
    } catch (error) {
      console.error("Error resending confirmation:", error);
      toast.error("Failed to resend confirmation email");
    }
  }

  // Redirect to home if already logged in
  if (session) {
    return <Navigate to="/" />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-blue-200 to-blue-100 dark:from-slate-900 dark:to-slate-800 weather-pattern">
      <Card className="w-full max-w-md glass-card animate-fade-in">
        <CardHeader className="space-y-1 flex flex-col items-center">
          <Logo />
          <CardTitle className="text-2xl mt-4">Welcome to SkyView</CardTitle>
          <CardDescription>Sign in or create an account to save your preferences</CardDescription>
        </CardHeader>
        
        {showEmailConfirmationAlert && (
          <div className="px-6 pb-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-sm">
                Please check your email and click the confirmation link to activate your account.
                <Button
                  variant="link"
                  size="sm"
                  className="text-xs p-0 h-auto ml-2"
                  onClick={resendConfirmation}
                >
                  Resend confirmation email
                </Button>
              </AlertDescription>
            </Alert>
          </div>
        )}
        
        <Tabs defaultValue="signin" className="w-full">
          <TabsList className="grid grid-cols-2 w-full">
            <TabsTrigger value="signin">Sign In</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>
          
          <TabsContent value="signin">
            <form onSubmit={handleSignIn}>
              <CardContent className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="your.email@example.com" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                  </div>
                  <Input 
                    id="password" 
                    type="password" 
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                </div>
              </CardContent>
              
              <CardFooter>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader className="mr-2 h-4 w-4 animate-spin" />
                      Signing In...
                    </>
                  ) : (
                    "Sign In"
                  )}
                </Button>
              </CardFooter>
            </form>
          </TabsContent>
          
          <TabsContent value="signup">
            <form onSubmit={handleSignUp}>
              <CardContent className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input 
                    id="signup-email" 
                    type="email" 
                    placeholder="your.email@example.com" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <Input 
                    id="signup-password" 
                    type="password" 
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                  <p className="text-sm text-muted-foreground">
                    Password must be at least 6 characters long
                  </p>
                </div>
              </CardContent>
              
              <CardFooter>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader className="mr-2 h-4 w-4 animate-spin" />
                      Creating Account...
                    </>
                  ) : (
                    "Create Account"
                  )}
                </Button>
              </CardFooter>
            </form>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
}
