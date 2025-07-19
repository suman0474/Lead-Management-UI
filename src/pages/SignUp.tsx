import React, { useState } from "react";
import axios from "axios";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { auth, provider } from "../lib/firebase";
import { signInWithPopup, getAdditionalUserInfo, signOut } from "firebase/auth";
import AnimatedHero from "@/components/AnimatedHero";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

const SignUp = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setIsLoading(true);

    try {
      await axios.post(`${API_BASE_URL}/auth/registration`, form, {
        withCredentials: true,
      });

      setSuccess(true);
      setForm({ username: "", email: "", password: "" });

      toast({
        title: "Registration Successful",
        description: "You can now log in to your account.",
      });
    } catch (err: any) {
      setError(err.response?.data?.error || "Registration failed");
      toast({
        title: "Registration Failed",
        description: err.response?.data?.error || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignup = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    setIsLoading(true);
    try {
      const result = await signInWithPopup(auth, provider);
      const userInfo = getAdditionalUserInfo(result);
      const user = result.user;

      if (userInfo?.isNewUser) {
        toast({
          title: "Signup Complete",
          description: "Your account has been created. Please log in.",
        });
      } else {
        toast({
          title: "Account Exists",
          description: "This email is already registered. Please log in.",
        });
      }

      await signOut(auth);
      navigate("/login");
    } catch (err: any) {
      console.error("Google Signup Error:", err);
      toast({
        title: "Google Sign Up Failed",
        description: err.message || "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Left Side - Form */}
      <div className="flex items-center justify-center ">
        <div className="w-full max-w-md">
          <Card className="w-full max-w-md shadow-xl backdrop-blur-sm bg-white/80">
            <CardHeader className="text-center pb-6">
              <div className="mx-auto mb-4 w-20 h-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center">
                <span className="text-2xl font-bold text-white">LM</span>
              </div>
              <CardTitle className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                Create an Account
              </CardTitle>
              <CardDescription className="text-gray-600">
                Sign up to manage your leads efficiently
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Button
                variant="outline"
                className="w-full h-12 border-2 hover:bg-gray-50 transition-all duration-200"
                onClick={handleGoogleSignup}
              >
                <svg className="mr-3 h-5 w-5" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                Sign up with Google
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm uppercase">
                  <span className="bg-white px-3 text-gray-500 font-medium">OR</span>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username">
                    Username
                  </Label>
                  <Input
                    id="username"
                    name="username"
                    placeholder="Your name"
                    value={form.username}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" >
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    name="email"
                    placeholder="Enter your email"
                    value={form.email}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" >
                    Password
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    name="password"
                    placeholder="Create a strong password"
                    value={form.password}
                    onChange={handleChange}
                    required
                  />
                </div>

                {error && <p className="text-red-600 text-sm">{error}</p>}

                {success && (
                  <div className="text-green-600 text-sm space-y-2">
                    <p>✅ Registration successful!</p>
                    <p>
                      👉{" "}
                      <button
                        className="text-blue-600 hover:underline"
                        onClick={() => navigate("/login")}
                      >
                        Go to login page
                      </button>
                    </p>
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full h-12 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-medium text-base transition-all duration-200"
                  disabled={isLoading}
                >
                  {isLoading ? "Creating account..." : "Create Account"}
                </Button>
              </form>

              {!success && (
                <div className="text-center">
                  <span className="text-gray-600">Already have an account? </span>
                  <button
                    type="button"
                    onClick={() => navigate("/login")}
                    className="text-indigo-600 hover:text-indigo-700 font-semibold hover:underline transition-colors"
                  >
                    Sign In
                  </button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Right Side - Animated Image */}
      <div className="flex-1 hidden lg:block">
        <AnimatedHero />
      </div>
    </div>
  );
};

export default SignUp;
