import BASE_URL from "@/config/base-url";
import axios from "axios";
import Cookies from "js-cookie";
import { useState } from "react";

export function useApiMutation() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const token = Cookies.get("token");
  console.log("mainmutation");

  const trigger = async ({
    url,
    method = "get",
    data = null,
    params = null,
    headers = {},
  }) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios({
        url: `${BASE_URL}${url}`,
        method,
        data,
        params,
        headers: {
          ...headers,
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      return response.data;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { trigger, loading, error };
}
