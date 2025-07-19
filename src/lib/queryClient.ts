import { QueryClient, QueryFunction } from "@tanstack/react-query";

export const apiRequest = async (
  method: string,
  url: string,
  data?: any
): Promise<Response> => {
  // Use environment variable or fallback to localhost
  const baseURL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3001';
  const fullURL = url.startsWith('http') ? url : `${baseURL}${url}`;

  const config: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  };

  if (data) {
    config.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(fullURL, config);
    
    // Check if response is ok
    if (!response.ok) {
      // Try to get error message from response
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      
      try {
        const errorData = await response.text();
        if (errorData && errorData.trim()) {
          // Check if it's JSON
          if (errorData.trim().startsWith('{')) {
            const parsedError = JSON.parse(errorData);
            errorMessage = parsedError.message || parsedError.error || errorMessage;
          } else {
            errorMessage = errorData;
          }
        }
      } catch (parseError) {
        // If we can't parse the error, use the status text
        console.warn("Could not parse error response:", parseError);
      }
      
      throw new Error(errorMessage);
    }

    // Check content type to avoid JSON parse errors
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      // Verify response is valid JSON before returning
      const text = await response.text();
      try {
        JSON.parse(text);
        // If parsing succeeds, return a new response with the text
        return new Response(text, {
          status: response.status,
          statusText: response.statusText,
          headers: response.headers,
        });
      } catch (jsonError) {
        console.error("Invalid JSON response:", text);
        throw new Error("Invalid JSON response from server");
      }
    }

    return response;
  } catch (error: any) {
    console.error(`API Request failed (${method} ${url}):`, error);
    
    // Handle network errors
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error("Network error - please check your connection");
    }
    
    // Handle JSON parse errors
    if (error.message.includes("Unexpected token '<'")) {
      throw new Error("Server returned HTML instead of JSON - please try again later");
    }
    
    throw error;
  }
};

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    try {
      const res = await fetch(queryKey[0] as string, {
        credentials: "include",
      });

      if (unauthorizedBehavior === "returnNull" && res.status === 401) {
        return null;
      }

      // Check if response is ok
      if (!res.ok) {
        // Try to get error message from response
        let errorMessage = `HTTP ${res.status}: ${res.statusText}`;
        
        try {
          const errorData = await res.text();
          if (errorData && errorData.trim()) {
            // Check if it's JSON
            if (errorData.trim().startsWith('{')) {
              const parsedError = JSON.parse(errorData);
              errorMessage = parsedError.message || parsedError.error || errorMessage;
            } else {
              errorMessage = errorData;
            }
          }
        } catch (parseError) {
          // If we can't parse the error, use the status text
          console.warn("Could not parse error response:", parseError);
        }
        
        throw new Error(errorMessage);
      }

      // Check if response is JSON
      const contentType = res.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        return await res.json();
      } else {
        // Return text if not JSON
        return await res.text();
      }
    } catch (error) {
      console.warn('Query function error:', error);
      throw error;
    }
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "returnNull" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: 1,
      retryDelay: 1000,
    },
    mutations: {
      retry: 1,
    },
  },
});
