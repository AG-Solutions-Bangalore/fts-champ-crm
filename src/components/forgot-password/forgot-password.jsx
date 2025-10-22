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
import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import BASE_URL from "@/config/base-url";
import { ButtonConfig } from "@/config/button-config";
import { motion } from "framer-motion";
import { toast } from "sonner";
export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [username, setUserName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const navigate = useNavigate();

  const loadingMessages = [
    "Setting things up for you...",
    "Preparing your Password...",
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
    formData.append("email", email);
    formData.append("name", username);

    try {

      const res = await axios.post(
        `${BASE_URL}/api/panel-send-password?username=${username}&email=${email}`,
        formData
      );
      if (res?.data?.code === 201) {
        toast.success(res?.data?.message || "Success");
      } else {
        toast.error(res?.data?.message || "Unexpected Error");
      }
    } catch (error) {

      toast.error(error.response?.data?.message || "Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      className="relative flex flex-col justify-center items-center min-h-screen "
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="absolute  -z-10">
        <svg
          height="600px"
          width="600px"
          version="1.1"
          id="_x32_"
          xmlns="http://www.w3.org/2000/svg"
          xmlns:xlink="http://www.w3.org/1999/xlink"
          viewBox="0 0 512 512"
          xml:space="preserve"
          fill="var(--team-color)"
          stroke="#000000"
          opacity="0.5"
        >
          <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
          <g
            id="SVGRepo_tracerCarrier"
            stroke-linecap="round"
            stroke-linejoin="round"
          ></g>
          <g id="SVGRepo_iconCarrier">
            {" "}
            <style type="text/css"> .fill:'#df4949' </style>{" "}
            <g>
              {" "}
              <path
                class="st0"
                d="M396.138,85.295c-13.172-25.037-33.795-45.898-59.342-61.03C311.26,9.2,280.435,0.001,246.98,0.001 c-41.238-0.102-75.5,10.642-101.359,25.521c-25.962,14.826-37.156,32.088-37.156,32.088c-4.363,3.786-6.824,9.294-6.721,15.056 c0.118,5.77,2.775,11.186,7.273,14.784l35.933,28.78c7.324,5.864,17.806,5.644,24.875-0.518c0,0,4.414-7.978,18.247-15.88 c13.91-7.85,31.945-14.173,58.908-14.258c23.517-0.051,44.022,8.725,58.016,20.717c6.952,5.941,12.145,12.594,15.328,18.68 c3.208,6.136,4.379,11.5,4.363,15.574c-0.068,13.766-2.742,22.77-6.603,30.442c-2.945,5.729-6.789,10.813-11.738,15.744 c-7.384,7.384-17.398,14.207-28.634,20.479c-11.245,6.348-23.365,11.932-35.612,18.68c-13.978,7.74-28.77,18.858-39.701,35.544 c-5.449,8.249-9.71,17.686-12.416,27.641c-2.742,9.964-3.98,20.412-3.98,31.071c0,11.372,0,20.708,0,20.708 c0,10.719,8.69,19.41,19.41,19.41h46.762c10.719,0,19.41-8.691,19.41-19.41c0,0,0-9.336,0-20.708c0-4.107,0.467-6.755,0.917-8.436 c0.773-2.512,1.206-3.14,2.47-4.668c1.29-1.452,3.895-3.674,8.698-6.331c7.019-3.946,18.298-9.276,31.07-16.176 c19.121-10.456,42.367-24.646,61.972-48.062c9.752-11.686,18.374-25.758,24.323-41.968c6.001-16.21,9.242-34.431,9.226-53.96 C410.243,120.761,404.879,101.971,396.138,85.295z"
              ></path>{" "}
              <path
                class="st0"
                d="M228.809,406.44c-29.152,0-52.788,23.644-52.788,52.788c0,29.136,23.637,52.772,52.788,52.772 c29.136,0,52.763-23.636,52.763-52.772C281.572,430.084,257.945,406.44,228.809,406.44z"
              ></path>{" "}
            </g>{" "}
          </g>
        </svg>
      </div>
      <motion.div
        initial={{ opacity: 1, x: 0 }}
        exit={{
          opacity: 0,
          x: -window.innerWidth,
          transition: { duration: 0.3, ease: "easeInOut" },
        }}
      >
        <Card
          className={`w-72 md:w-80 max-w-md  z-1 bg-white/80 ${ButtonConfig.loginText}`}
        >
          <CardHeader className="space-y-1">
            <CardTitle
              className={`text-2xl text-center${ButtonConfig.loginText}`}
            >
              {/* <img src={logo} alt="logo" className=" mx-auto text-black bg-gray-500 rounded-lg shadow-md" /> */}
              Forgot Password
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <div className="flex items-center justify-between">
                    <Label
                      htmlFor="username"
                      className={`${ButtonConfig.loginText}`}
                    >
                      Username
                    </Label>
                  </div>
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <Input
                      id="username"
                      type="text"
                      placeholder="Enter your username"
                      value={username}
                      onChange={(e) => setUserName(e.target.value)}
                      required
                      minLength={1}
                      maxLength={50}
                    />
                  </motion.div>
                </div>

                <div className="grid gap-2">
                  <Label
                    htmlFor="email"
                    className={`${ButtonConfig.loginText}`}
                  >
                    Email
                  </Label>
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your Email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      minLength={1}
                      maxLength={50}
                    />
                  </motion.div>
                </div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className={`w-full `}
                  >
                    {isLoading ? (
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex items-center justify-center"
                      >
                        <motion.span
                          key={loadingMessage}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="text-sm"
                        >
                          {loadingMessage}
                        </motion.span>
                      </motion.span>
                    ) : (
                      "Reset Password"
                    )}
                  </Button>
                </motion.div>
              </div>
            </form>
            <CardDescription
              className={`flex justify-end mt-4 underline ${ButtonConfig.loginText}`}
            >
              <span onClick={() => navigate("/")} className="cursor-pointer">
                {" "}
                Sign In
              </span>
            </CardDescription>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
