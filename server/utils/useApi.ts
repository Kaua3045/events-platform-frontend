import { FetchError } from "ofetch";

type HttpMethod =
  | "GET"
  | "HEAD"
  | "PATCH"
  | "POST"
  | "PUT"
  | "DELETE"
  | "CONNECT"
  | "OPTIONS"
  | "TRACE"
  | "get"
  | "head"
  | "patch"
  | "post"
  | "put"
  | "delete"
  | "connect"
  | "options"
  | "trace";

type ApiResponse<T> =
  | { status: "success"; data: T }
  | {
      status: "error";
      message: string;
      errors: { field: string; message: string }[];
      timestamp: string;
    };

export type ApiErrorResponse = {
  message: string;
  errors: { field: string; message: string }[];
  timestamp: string;
};

export async function useBackendApi<T>(
  path: string,
  method: HttpMethod = "GET",
  options: { headers?: Record<string, string>; body?: any } = {}
): Promise<ApiResponse<T>> {
  const config = useRuntimeConfig();
  return baseFetch<T>(`${config.backendUrl}${path}`, method, options);
}

export async function useBffApi<T>(
  path: string,
  method: HttpMethod = "GET",
  options: { headers?: Record<string, string>; body?: any } = {}
): Promise<ApiResponse<T>> {
  const config = useRuntimeConfig();
  return baseFetch<T>(`${config.public.apiUrl}${path}`, method, options);
}

async function baseFetch<T>(
  url: string,
  method: HttpMethod,
  { headers, body }: { headers?: Record<string, string>; body?: any }
): Promise<ApiResponse<T>> {
  try {
    const response = await $fetch<T>(url, {
      method,
      headers: { "Content-Type": "application/json", ...headers },
      ...(method !== "GET" && method !== "HEAD" ? { body } : {}),
      credentials: "include",
    });
    return { status: "success", data: response as T };
  } catch (error) {
    if (error instanceof FetchError) {
      const { message, errors, timestamp } = error.response?._data || {};
      return {
        status: "error",
        message,
        errors: errors || [],
        timestamp: timestamp || new Date().toISOString(),
      };
    }
    return {
      status: "error",
      message: "Unexpected error",
      errors: [],
      timestamp: new Date().toISOString(),
    };
  }
}

export async function useApi<T>(
  path: string,
  method: HttpMethod = "GET",
  options: { headers?: Record<string, string>; body?: any } = {},
  isCallBff: boolean = false
): Promise<ApiResponse<T>> {
  if (isCallBff) {
    return useBffApi<T>(path, method, options);
  } else {
    return useBackendApi<T>(path, method, options);
  }
}