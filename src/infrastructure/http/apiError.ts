export class ApiError extends Error {
  status: number;
  detail?: string;

  constructor(message: string, status: number, detail?: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.detail = detail;
  }
}

export async function parseErrorResponse(response: Response): Promise<string> {
  const text = await response.text();
  if (!text) return response.statusText;

  try {
    const json = JSON.parse(text) as { detail?: string | { msg?: string }[] };
    if (typeof json.detail === 'string') return json.detail;
    if (Array.isArray(json.detail)) {
      return json.detail.map((d) => d.msg ?? String(d)).join('; ');
    }
    return text;
  } catch {
    return text;
  }
}
