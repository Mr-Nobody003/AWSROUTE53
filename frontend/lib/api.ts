export const getBackendUrl = () => {
  const version = process.env.NEXT_PUBLIC_API_VERSION || 'v1';
  if (typeof window === 'undefined') {
    const url = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://127.0.0.1:8000';
    return `${url.replace(/\/$/, '')}/api/${version}`;
  }
  return `/api/${version}`;
};

const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 60000; // 60 seconds

export const fetchApi = async (endpoint: string, options: RequestInit = {}) => {
  const url = `${getBackendUrl()}${endpoint}`;
  
  const isGet = !options.method || options.method.toUpperCase() === 'GET';
  
  if (isGet) {
    const cached = cache.get(url);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.data;
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
      const errorData = await response.json();
      if (Array.isArray(errorData.detail)) {
        message = errorData.detail.map((e: any) => `${e.loc.slice(-1)[0]}: ${e.msg}`).join(', ');
      } else {
        message = errorData.detail || message;
      }
    } catch (e) {}
    throw new Error(message);
  }

  if (response.status === 204) {
    if (!isGet) cache.clear(); // Invalidate on mutation
    return null;
  }

  const data = await response.json();
  
  if (isGet) {
    cache.set(url, { data, timestamp: Date.now() });
  } else {
    cache.clear(); // Invalidate all cache on any mutation to ensure consistency
  }

  return data;
};
