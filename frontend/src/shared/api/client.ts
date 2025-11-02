export const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

export function buildUrl(path: string): string {
  if (!path.startsWith('/')) {
    path = `/${path}`;
  }
  return `${API_URL}${path}`;
}

export async function handleJsonOrThrow<T>(res: Response, fallbackMessage: string): Promise<T> {
  if (res.ok) {
    return (await res.json()) as T;
  }

  try {
    const body = await res.json();
    if (typeof body?.message === 'string') {
      throw new Error(body.message);
    }
  } catch {
    /* empty */
  }

  throw new Error(fallbackMessage);
}

export async function ensureOkOrThrow(res: Response, fallbackMessage: string): Promise<void> {
  if (res.ok) return;

  await handleJsonOrThrow<unknown>(res, fallbackMessage);
}
