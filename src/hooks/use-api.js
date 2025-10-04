import BASE_URL from "@/config/base-url";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import Cookies from "js-cookie";

const STALE_TIME = 5 * 60 * 1000;
const CACHE_TIME = 30 * 60 * 1000;

const fetchData = async (endpoint, token) => {
  if (!token) throw new Error("No authentication token found");

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) throw new Error(`Failed to fetch data from ${endpoint}`);
  return response.json();
};

const createQueryConfig = (queryKey, endpoint, options = {}) => {
  const token = Cookies.get("token");
  return {
    queryKey,
    queryFn: () => fetchData(endpoint, token),
    staleTime: STALE_TIME,
    cacheTime: CACHE_TIME,
    retry: 2,
    ...options,
  };
};

export const useFetchState = () => {
  return useQuery(createQueryConfig(["states"], "/api/fetch-states"));
};
export const useFetchDataSource = () => {
  return useQuery(createQueryConfig(["datasource"], "/api/fetch-datasource"));
};
export const useFetchPromoter = () => {
  return useQuery(createQueryConfig(["promoter"], "/api/fetch-promoter"));
};
