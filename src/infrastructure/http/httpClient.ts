import { env } from '@/shared/config/env';
import { ApiError, parseErrorResponse } from './apiError';
import { fetchWithRetry, toApiError } from './networkError';
import { tokenStorage } from '../storage/tokenStorage';

type RequestOptions = Omit<RequestInit, 'headers'> & {
  headers?: Record<string, string>;
  skipAuth?: boolean;
  /** No token refresh on 401 — caller handles logout (user /prices API). */
  skipRefresh?: boolean;
};

let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = tokenStorage.getRefresh();
  if (!refreshToken) return null;

  try {
    const response = await fetchWithRetry(`${env.apiUrl}/auth/refresh`, {
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
  } catch {
    tokenStorage.clear();
    return null;
  }
}

async function getValidAccessToken(): Promise<string | null> {
  return tokenStorage.getAccess();
}

export async function httpClient<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const { skipAuth = false, skipRefresh = false, headers = {}, ...init } =
    options;

  const buildHeaders = (token: string | null): Record<string, string> => ({
    Accept: 'application/json',
    ...headers,
    ...(token && !skipAuth ? { Authorization: `JWT ${token}` } : {}),
  });

  const execute = async (token: string | null): Promise<Response> =>
    fetchWithRetry(`${env.apiUrl}${path}`, {
      ...init,
      headers: buildHeaders(token),
    });

  try {
    let token = skipAuth ? null : await getValidAccessToken();
    let response = await execute(token);

    if (response.status === 401 && !skipAuth) {
      if (skipRefresh) {
        throw new ApiError('Сессия истекла. Войдите снова.', 401);
      }

      if (!refreshPromise) {
        refreshPromise = refreshAccessToken().finally(() => {
          refreshPromise = null;
        });
      }

      token = await refreshPromise;
      if (token) {
        response = await execute(token);
      } else {
        throw new ApiError('Сессия истекла. Войдите снова.', 401);
      }
    }

    if (!response.ok) {
      const detail = await parseErrorResponse(response);
      throw new ApiError(detail, response.status, detail);
    }

    if (response.status === 204) {
      return undefined as T;
    }

    const text = await response.text();
    if (!text) {
      return undefined as T;
    }

    return JSON.parse(text) as T;
  } catch (error) {
    throw toApiError(error);
  }
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

  try {
    let response = await fetchWithRetry(`${env.apiUrl}${path}`, {
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
        response = await fetchWithRetry(`${env.apiUrl}${path}`, {
          ...options,
          headers: {
            ...headers,
            Authorization: `JWT ${newToken}`,
          },
        });
      }
    }

    return response;
  } catch (error) {
    throw toApiError(error);
  }
}

function parseContentDispositionFilename(
  header: string | null,
): string | null {
  if (!header) return null;

  const utf8Match = /filename\*=UTF-8''([^;\n]+)/i.exec(header);
  if (utf8Match?.[1]) {
    try {
      return decodeURIComponent(utf8Match[1].trim());
    } catch {
      return utf8Match[1].trim();
    }
  }

  const plainMatch = /filename="?([^";\n]+)"?/i.exec(header);
  return plainMatch?.[1]?.trim() ?? null;
}

export async function httpClientBlob(
  path: string,
  options: RequestOptions = {},
  fallbackFilename: string,
): Promise<{ blob: Blob; filename: string }> {
  const { skipAuth = false, skipRefresh = false, headers = {}, ...init } =
    options;

  const buildHeaders = (token: string | null): Record<string, string> => ({
    ...headers,
    ...(token && !skipAuth ? { Authorization: `JWT ${token}` } : {}),
  });

  const execute = async (token: string | null): Promise<Response> =>
    fetchWithRetry(`${env.apiUrl}${path}`, {
      ...init,
      headers: buildHeaders(token),
    });

  try {
    let token = skipAuth ? null : await getValidAccessToken();
    let response = await execute(token);

    if (response.status === 401 && !skipAuth) {
      if (skipRefresh) {
        throw new ApiError('Сессия истекла. Войдите снова.', 401);
      }

      if (!refreshPromise) {
        refreshPromise = refreshAccessToken().finally(() => {
          refreshPromise = null;
        });
      }

      token = await refreshPromise;
      if (token) {
        response = await execute(token);
      } else {
        throw new ApiError('Сессия истекла. Войдите снова.', 401);
      }
    }

    if (!response.ok) {
      const detail = await parseErrorResponse(response);
      throw new ApiError(detail, response.status, detail);
    }

    const blob = await response.blob();
    const filename =
      parseContentDispositionFilename(
        response.headers.get('Content-Disposition'),
      ) ?? fallbackFilename;

    return { blob, filename };
  } catch (error) {
    throw toApiError(error);
  }
}
