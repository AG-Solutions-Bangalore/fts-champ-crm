import React, { useContext, useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { motion } from "framer-motion";
import Cookies from "js-cookie";
import { Eye, EyeOff, LogIn } from "lucide-react";
import BASE_URL from "@/config/base-url";
import logoLogin from "@/assets/receipt/fts_log.png"
import { toast } from "sonner";

export default function LoginAuth() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const navigate = useNavigate();
 
  const [showPassword, setShowPassword] = useState(false);
  const emailInputRef = useRef(null);

  const loadingMessages = [
    "Setting things up for you...",
    "Checking your credentials...",
    "Preparing your dashboard...",
    "Almost there...",
  ];

  // Auto-focus on email input
  useEffect(() => {
    if (emailInputRef.current) {
      emailInputRef.current.focus();
    }
  }, []);

  useEffect(() => {
    let messageIndex = 0;
    let intervalId;

    if (isLoading) {
      setLoadingMessage(loadingMessages[0]);
      intervalId = setInterval(() => {
        messageIndex = (messageIndex + 1) % loadingMessages.length;
        setLoadingMessage(loadingMessages[messageIndex]);
      }, 800);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isLoading]);

  // Fix for form submission with Enter key
  const handleKeyPress = (event) => {
    if (event.key === 'Enter' && !isLoading) {
      handleSubmit(event);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    // Validate inputs
    if (!email.trim() || !password.trim()) {
      toast.error('Please enter both username and password.');
      return;
    }

    setIsLoading(true);
  
    const formData = new FormData();
    formData.append("username", email);
    formData.append("password", password);
  
    try {
      const res = await axios.post(`${BASE_URL}/api/panel-login`, formData);
  
      if (res.data.code === 200) {
        if (!res.data.UserInfo || !res.data.UserInfo.token) {
          console.warn("⚠️ Login failed: Token missing in response");
          toast.error("Login Failed: No token received.");
          setIsLoading(false);
          return;
        }
  
        const { UserInfo, version, year } = res.data;
        const isProduction = window.location.protocol === "https:";
               
        const cookieOptions = {
          expires: 7,
          secure: isProduction,
          sameSite: "Strict",
          path: "/",
        };
       
        // Set all cookies
        Cookies.set("token", UserInfo.token, cookieOptions);
        Cookies.set("id", UserInfo.user.user_type_id, cookieOptions);
        Cookies.set("name", UserInfo.user.first_name, cookieOptions);
        Cookies.set("username", UserInfo.user.name, cookieOptions);
        Cookies.set("chapter_id", UserInfo.user.chapter_id, cookieOptions);
        Cookies.set("viewer_chapter_ids", UserInfo.user.viewer_chapter_ids, cookieOptions);
        Cookies.set("user_type_id", UserInfo.user.user_type_id, cookieOptions);
        Cookies.set("email", UserInfo.user.email, cookieOptions);
        Cookies.set("token-expire-time", UserInfo?.token_expires_at, cookieOptions);
        Cookies.set("ver_con", version?.version_panel, cookieOptions);
        Cookies.set("currentYear", year?.current_year, cookieOptions);
       
  const token = Cookies.get("token");
  const tokenExpireTime = Cookies.get("token-expire-time");
        if (!token && !tokenExpireTime ) {
          throw new Error("Cookies not set properly");
        }

        
       
        navigate("/home", { replace: true });
        
      } else {
        toast.error(res.data.message||"Login Failed: Unexpected response.");
        setIsLoading(false);
      }
    } catch (error) {
      console.error("❌ Login Error:", error.response?.data?.message || error.message);
  
      toast.error(error.response?.data?.message);
  
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      className="relative flex flex-col justify-center items-center min-h-screen bg-login-gradient"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-32 w-80 h-80 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob login-blob-1"></div>
        <div className="absolute -bottom-40 -left-32 w-80 h-80 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000 login-blob-2"></div>
        <div className="absolute top-40 left-1/2 w-80 h-80 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000 login-blob-3"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10"
      >
        <Card className="w-80 md:w-96 max-w-md bg-white/90 backdrop-blur-sm border-0 shadow-2xl">
          <CardHeader className="space-y-4 pb-6">
            <div className="flex justify-center">
              <div className="p-1 rounded-2xl shadow-lg shadow-[var(--color)]">
                <img src={logoLogin} className="" alt="logo_login"/>
              </div>
            </div>
            <div className="text-center space-y-2">
              <CardTitle className="text-3xl font-bold bg-gradient-to-r from-[var(--team-color)] to-[var(--color-dark)] bg-clip-text text-transparent">
                Welcome Back
              </CardTitle>
              <CardDescription className="text-gray-600 text-base">
                Sign in to your Fts Champ account
              </CardDescription>
            </div>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} onKeyPress={handleKeyPress}>
              <div className="grid gap-6">
                <div className="grid gap-3">
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                    Username
                  </Label>
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <Input
                      ref={emailInputRef}
                      id="email"
                      type="text"
                      placeholder="Enter your username"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      minLength={1}
                      maxLength={50}
                      required
                      className="h-11 border-gray-300 focus:border-[var(--color-border)] focus:ring-[var(--color-border)] transition-colors"
                      autoComplete="username"
                    />
                  </motion.div>
                </div>

                <div className="grid gap-3">
                  <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                    Password
                  </Label>
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={1}
                        maxLength={16}
                        className="h-11 pr-10 border-gray-300 focus:border-[var(--color-border)] focus:ring-[var(--color-border)] transition-colors"
                        autoComplete="current-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                        tabIndex={-1}
                      >
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                  </motion.div>
                </div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <Button
                    type="submit"
                    className="w-full h-11 bg-gradient-to-r from-[var(--team-color)] to-[var(--color-dark)] hover:opacity-90 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <motion.span
                        key={loadingMessage}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="text-sm"
                      >
                        {loadingMessage}
                      </motion.span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <LogIn size={18} />
                        Sign In
                      </span>
                    )}
                  </Button>
                </motion.div>
              </div>
            </form>
            
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="mt-6 text-center"
            >
              <button
                onClick={() => navigate("/forgot-password")}
                className="text-sm text-[var(--color)] hover:text-[var(--color-dark)] font-medium transition-colors duration-200 hover:underline"
              >
                Forgot your password?
              </button>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Add CSS for blob animation */}
      <style jsx>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </motion.div>
  );
}