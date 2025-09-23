import BASE_URL from "@/config/base-url";
import { createContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export const ContextPanel = createContext();

const AppProvider = ({ children }) => {
  const [statusCheck, setStatusCheck] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkPanelStatus = async () => {
      try { 
        // check-status
        const response = await fetch(`${BASE_URL}/api/check-status`);
        const data = await response.json();

        if (data.success === "ok") {
          setStatusCheck("ok");
          if (location.pathname === "/maintenance") {
            navigate("/");
          }
        } else {
          navigate("/maintenance");
        }
      } catch (error) {
        console.error("Error fetching panel status:", error);
        navigate("/maintenance"); 
      }
    };

    checkPanelStatus();

    const interval = setInterval(checkPanelStatus, 300000);

    return () => clearInterval(interval);
  }, []);

  return (
    <ContextPanel.Provider value={{ statusCheck }}>
      {statusCheck === "ok" ? children : null}
    </ContextPanel.Provider>
  );
};

export default AppProvider;
