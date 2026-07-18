export const getBackendUrl = () => {
  const version = process.env.NEXT_PUBLIC_API_VERSION || 'v1';
  if (typeof window === 'undefined') {
    const url = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://127.0.0.1:8000';
    return `${url.replace(/\/$/, '')}/api/${version}`;
  }
  return `/api/${version}`;
};

export const fetchApi = async (endpoint: string, options: RequestInit = {}) => {
  const url = `${getBackendUrl()}${endpoint}`;
  
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
      message = errorData.detail || message;
    } catch (e) {}
    throw new Error(message);
  }

  // Handle 204 No Content
  if (response.status === 204) {
    return null;
  }

  return response.json();
};
