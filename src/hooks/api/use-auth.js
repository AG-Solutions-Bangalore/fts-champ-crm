import Cookies from "js-cookie";
import { useEffect, useState } from "react";

const useAuth = () => {
  const [authData, setAuthData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      const token = Cookies.get("token");
      const userData = {
        id: Cookies.get("id"),
        name: Cookies.get("name"),
        userType: Cookies.get("user_type_id"),
        email: Cookies.get("email"),
       
      };

      // console.log("🔍 useAuth checking cookies:", {
      //   token: !!token,
      //   userData,
      //   allCookies: document.cookie
      // });

      if (token) {
        setAuthData({ 
          user: userData,
          token: token 
        });
      } else {
        setAuthData({ user: null });
      }
      setIsLoading(false);
    };

   
    checkAuth();


    const interval = setInterval(checkAuth, 1000);
    
  
    const timeout = setTimeout(() => {
      clearInterval(interval);
    }, 5000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, []);

  return { data: authData, isLoading };
};

export default useAuth;