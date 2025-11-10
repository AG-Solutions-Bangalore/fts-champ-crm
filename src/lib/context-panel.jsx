import BASE_URL from "@/config/base-url";
import Cookies from "js-cookie";
import { createContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export const ContextPanel = createContext();

const AppProvider = ({ children }) => {
  const navigate = useNavigate();
  const [isPanelUp, setIsPanelUp] = useState(true);
  const handleLogout = () => {
    [
      "token",
      "id",
      "name",
      "username",
      "chapter_id",
      "viewer_chapter_ids",
      "user_type_id",
      "token-expire-time",
      "ver_con",
      "email",
      "currentYear",
      "favorite_chapters",
      "recent_chapters",
    ].forEach((cookie) => {
      Cookies.remove(cookie);
    });
    navigate("/");
  };
  const checkPanelStatus = async () => {
    try {
      // check-status
      const response = await fetch(`${BASE_URL}/api/panel-check-status`);
      const data = await response.json();
      setIsPanelUp(data);
      if (data.success === "ok") {
        if (location.pathname === "/maintenance") {
          navigate("/");
        }
      } else {
        handleLogout();

        if (!Cookies.get("token")) {
          navigate("/maintenance");
        }
      }
    } catch (error) {
      console.error("Error fetching panel status:", error);
      navigate("/maintenance");
    }
  };
  useEffect(() => {
    checkPanelStatus();

    const interval = setInterval(checkPanelStatus, 30000);

    return () => clearInterval(interval);
  }, []);

  return (
    <ContextPanel.Provider value={{ isPanelUp }}>
      {children}
    </ContextPanel.Provider>
  );
};

export default AppProvider;
