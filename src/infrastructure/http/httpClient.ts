import { env } from '@/shared/config/env';
import { ApiError, parseErrorResponse } from './apiError';
import { tokenStorage } from '../storage/tokenStorage';

type RequestOptions = Omit<RequestInit, 'headers'> & {
  headers?: Record<string, string>;
  skipAuth?: boolean;
};

let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = tokenStorage.getRefresh();
  if (!refreshToken) return null;

  const response = await fetch(`${env.apiUrl}/auth/refresh`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({ refresh: refreshToken }),
  });

  if (!response.ok) {
    tokenStorage.clear();
    return null;
  }

  const data = (await response.json()) as {
    access?: string;
    refresh?: string;
    access_token?: string;
    refresh_token?: string;
  };

  const access = data.access ?? data.access_token;
  const refresh = data.refresh ?? data.refresh_token;

  if (!access || !refresh) {
    tokenStorage.clear();
    return null;
  }

  tokenStorage.save(access, refresh);
  return access;
}

async function getValidAccessToken(): Promise<string | null> {
  return tokenStorage.getAccess();
}

export async function httpClient<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const { skipAuth = false, headers = {}, ...init } = options;

  const buildHeaders = (token: string | null): Record<string, string> => ({
    Accept: 'application/json',
    ...headers,
    ...(token && !skipAuth ? { Authorization: `JWT ${token}` } : {}),
  });

  const execute = async (token: string | null): Promise<Response> =>
    fetch(`${env.apiUrl}${path}`, {
      ...init,
      headers: buildHeaders(token),
    });

  let token = skipAuth ? null : await getValidAccessToken();
  let response = await execute(token);

  if (response.status === 401 && !skipAuth) {
    if (!refreshPromise) {
      refreshPromise = refreshAccessToken().finally(() => {
        refreshPromise = null;
      });
    }

    token = await refreshPromise;
    if (token) {
      response = await execute(token);
    }
  }

  if (!response.ok) {
    const detail = await parseErrorResponse(response);
    throw new ApiError(detail, response.status, detail);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export async function httpClientRaw(
  path: string,
  options: RequestOptions = {},
): Promise<Response> {
  const token = options.skipAuth ? null : await getValidAccessToken();

  const headers: Record<string, string> = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    ...options.headers,
    ...(token && !options.skipAuth
      ? { Authorization: `JWT ${token}` }
      : {}),
  };

  let response = await fetch(`${env.apiUrl}${path}`, {
    ...options,
    headers,
  });

  if (response.status === 401 && !options.skipAuth) {
    if (!refreshPromise) {
      refreshPromise = refreshAccessToken().finally(() => {
        refreshPromise = null;
      });
    }

    const newToken = await refreshPromise;
    if (newToken) {
      response = await fetch(`${env.apiUrl}${path}`, {
        ...options,
        headers: {
          ...headers,
          Authorization: `JWT ${newToken}`,
        },
      });
    }
  }

  return response;
}
