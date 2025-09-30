// import { useQuery } from "@tanstack/react-query";
// import { useApiMutation } from "./use-mutation";

// export const useGetMutation = (key, url, params = {}) => {
//   const { trigger} = useApiMutation();

//   return useQuery({
//     queryKey: [key, params],
//     queryFn: async () => {
//       const searchParams = new URLSearchParams(params).toString();
//       const response = await trigger({
//         url: `${url}?${searchParams}`,
//         method: "get",
//       });

//       return response || [];
//     },
//     keepPreviousData: true,
//     staleTime: 5 * 60 * 1000,
//   });
// };
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useApiMutation } from "./use-mutation";

export const useGetMutation = (key, url, params = {}, options = {}) => {
  const { trigger } = useApiMutation();
  const queryClient = useQueryClient();

  // Main query
  const query = useQuery({
    queryKey: [key, params],
    queryFn: async () => {
      const searchParams = new URLSearchParams(params).toString();
      const response = await trigger({
        url: `${url}?${searchParams}`,
        // method: "get",
      });
      return response || [];
    },
    keepPreviousData: true,
    staleTime: 5 * 60 * 1000,
    ...options,
  });

  const prefetchPage = async (extraParams) => {
    const searchParams = new URLSearchParams({
      ...params,
      ...extraParams,
    }).toString();

    await queryClient.prefetchQuery({
      queryKey: [key, { ...params, ...extraParams }],
      queryFn: async () => {
        const response = await trigger({
          url: `${url}?${searchParams}`,
          // method: "get",
        });
        return response || [];
      },
      staleTime: 5 * 60 * 1000,
    });
  };

  return { ...query, prefetchPage };
};
