import { useQuery } from "@tanstack/react-query";
import { useApiMutation } from "./use-mutation";

export const useGetMutation = (key, url, params = {}) => {
  const { trigger} = useApiMutation();

  return useQuery({
    queryKey: [key, params],
    queryFn: async () => {
      const searchParams = new URLSearchParams(params).toString();
      const response = await trigger({
        url: `${url}?${searchParams}`,
        method: "get",
      });

      return response || [];
    },
    keepPreviousData: true,
    staleTime: 5 * 60 * 1000,
  });
};
