import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { useNavigate } from 'react-router-dom';
import { useToast } from "@/hooks/use-toast";
import { signInWithGoogle } from "@/lib/signInWithGoogle";
import AnimatedHero from '@/components/AnimatedHero';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || 'Invalid email or password');
      }

      const data = await response.json();
      const token = data.token;
      localStorage.setItem('authToken', token);

      const userInfoResponse = await fetch(`${API_BASE_URL}/auth/userinfo`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const userInfo = await userInfoResponse.json();
      localStorage.setItem('user', JSON.stringify(userInfo));
      localStorage.setItem('isAuthenticated', 'true');

      toast({
        title: "Login Successful",
        description: `Welcome ${userInfo.username || 'User'}`
      });

      navigate('/dashboard');
    } catch (error: any) {
      toast({
        title: "Login Failed",
        description: error.message || "Invalid credentials",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    setIsLoading(true);

    try {
      const { token, user } = await signInWithGoogle();

      localStorage.setItem("authToken", token);
      localStorage.setItem("user", JSON.stringify({
        email: user.email,
        name: user.displayName,
        photo: user.photoURL,
      }));
      localStorage.setItem("isAuthenticated", "true");

      toast({
        title: "Logged in with Google",
        description: `Welcome ${user.displayName || user.email}`,
      });

      navigate("/dashboard");
    } catch (err: any) {
      toast({
        title: "Google Login Failed",
        description: err.message || "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Left Side - Login Form */}
      <div className="flex items-center justify-center p-8">
        <Card className="w-full max-w-md shadow-xl backdrop-blur-sm bg-white/80">
          <CardHeader className="text-center pb-6">
            <div className="mx-auto mb-4 w-20 h-16 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center">
              <span className="text-2xl font-bold text-white">LM</span>
            </div>
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
              Welcome Back
            </CardTitle>
            <CardDescription>Sign in to your Lead Management account</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <form onSubmit={handleLogin} className="space-y-4">
              <Button variant="outline" className="w-full h-12" onClick={handleGoogleLogin}>
                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                Continue with Google
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-muted-foreground">Or sign in with email</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <Button type="submit" className="w-full h-12 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium" disabled={isLoading}>
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
            </form>

            <div className="text-center text-sm text-muted-foreground">
              Don’t have an account?{" "}
              <button
                type="button"
                onClick={() => navigate("/signup")}
                className="text-indigo-600 hover:underline font-medium"
              >
                Sign Up
              </button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Right Side - Animated Image */}
      <div className="flex-1 hidden lg:block">
        <AnimatedHero />
      </div>
    </div>
  );
};

export default Login;
