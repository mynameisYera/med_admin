import { ApiError } from './apiError';

const NETWORK_ERROR_MESSAGE =
  'Не удалось связаться с сервером. Render может просыпаться 30–60 сек — попробуйте ещё раз.';

export function isNetworkError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  const message = error.message.toLowerCase();
  return (
    error.name === 'TypeError' &&
    (message.includes('failed to fetch') ||
      message.includes('networkerror') ||
      message.includes('load failed'))
  );
}

export function toApiError(error: unknown): ApiError {
  if (error instanceof ApiError) return error;

  if (isNetworkError(error)) {
    return new ApiError(NETWORK_ERROR_MESSAGE, 0);
  }

  if (error instanceof Error) {
    return new ApiError(error.message, 0);
  }

  return new ApiError('Неизвестная ошибка', 0);
}

export async function fetchWithRetry(
  url: string,
  init: RequestInit,
  retries = 2,
): Promise<Response> {
  let lastError: unknown;

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      return await fetch(url, init);
    } catch (error) {
      lastError = error;
      if (attempt < retries && isNetworkError(error)) {
        await new Promise((resolve) => {
          window.setTimeout(resolve, 1500 * (attempt + 1));
        });
        continue;
      }
      break;
    }
  }

  throw toApiError(lastError);
}
