export const getBackendUrl = () => {
  const version = process.env.NEXT_PUBLIC_API_VERSION || 'v1';
  if (typeof window === 'undefined') {
    const url = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://127.0.0.1:8000';
    return `${url.replace(/\/$/, '')}/api/${version}`;
  }
  return `/api/${version}`;
};

const cache = new Map<string, { data: unknown; timestamp: number }>();
const CACHE_TTL = 6000000; // 600 seconds

export const fetchApi = async <T = unknown>(endpoint: string, options: RequestInit = {}): Promise<T> => {
  const url = `${getBackendUrl()}${endpoint}`;
  
  const isGet = !options.method || options.method.toUpperCase() === 'GET';
  
  if (isGet) {
    const cached = cache.get(url);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.data as T;
    }
  }

  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    let message = 'An error occurred';
    try {
      const errorData = await response.json() as unknown;
      if (
        typeof errorData === 'object' &&
        errorData !== null &&
        Array.isArray((errorData as { detail?: unknown }).detail)
      ) {
        const details = (errorData as { detail: Array<{ loc: string[]; msg: string }> }).detail;
        message = details.map((e) => `${e.loc.slice(-1)[0]}: ${e.msg}`).join(', ');
      } else if (
        typeof errorData === 'object' &&
        errorData !== null &&
        typeof (errorData as { detail?: unknown }).detail === 'string'
      ) {
        message = (errorData as { detail: string }).detail;
      }
    } catch {
      // ignore JSON parse errors for error responses
    }
    throw new Error(message);
  }

  if (response.status === 204) {
    if (!isGet) cache.clear(); // Invalidate on mutation
    return null as unknown as T;
  }

  const data = await response.json();
  
  if (isGet) {
    cache.set(url, { data, timestamp: Date.now() });
  } else {
    cache.clear(); // Invalidate all cache on any mutation to ensure consistency
  }

  return data;
};
