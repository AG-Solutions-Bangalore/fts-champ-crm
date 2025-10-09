import React, { useContext, useEffect, useState } from "react";
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
import { ContextPanel } from "@/lib/context-panel";
import BASE_URL from "@/config/base-url";
import Cookies from "js-cookie";
import { ButtonConfig } from "@/config/button-config";
import { Eye, EyeOff } from "lucide-react";
import logo from "../../assets/jaju1.png";
import { toast } from "sonner";

export default function LoginAuth() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  
  const loadingMessages = [
    "Setting things up for you...",
    "Checking your credentials...",
    "Preparing your dashboard...",
    "Almost there...",
  ];

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

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);

    const formData = new FormData();
    formData.append("username", email);
    formData.append("password", password);

    try {
      const res = await axios.post(`${BASE_URL}/api/login`, formData);

      if (res.status === 200) {
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
        };



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

        const redirectPath = window.innerWidth < 768 ? "/home" : "/home";
        console.log(`✅ Login successful! Redirecting to ${redirectPath}...`);
        navigate(redirectPath);
      } else {
        console.warn("⚠️ Unexpected API response:", res);
        toast.error("Login Failed: Unexpected response.");
      }
    } catch (error) {
      console.error("❌ Login Error:", error.response?.data.message || error.message);

      toast.error(error.response?.data?.message || "Please check your credentials.");

      setIsLoading(false);
    }
  };

  return (
    <div className=" flex flex-col justify-center items-center min-h-screen bg-gray-100">
      <div className=" py-12">
        <motion.div 
          className="mx-auto grid w-[350px] gap-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="grid gap-2 text-center">
            <h1 className="text-3xl font-bold">FTS CHAMP DEV</h1>
            <p className="text-balance text-muted-foreground">
              Enter your credentials below to login to your account
            </p>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Username</Label>
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <Input
                    id="email"
                    type="text"
                    placeholder="Enter your username"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    minLength={1}
                    maxLength={50}
                    required
                  />
                </motion.div>
              </div>

              <div className="grid gap-2">
                <div className="flex items-center" >
                  <Label htmlFor="password">Password</Label>
                  <a
                  tabIndex={-1}
                    href="/forgot-password"
                    className="ml-auto inline-block text-sm underline"
                    onClick={(e) => {
                      e.preventDefault();
                      navigate("/forgot-password");
                    }}
                  >
                    Forgot your password?
                  </a>
                </div>
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="*******"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={1}
                      maxLength={16}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
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
                  className={`w-full `}
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
                    "Login"
                  )}
                </Button>
              </motion.div>
            </div>
          </form>

          
          
          
        </motion.div>
      </div>
      
      {/* <div className="hidden bg-muted lg:block">
        <img
          src="/login.jpg"
          alt="Login Image"
      
          className="h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
        />
      </div> */}
    </div>
  );
}