// Helper to get backend URL — strips trailing slash to avoid double-slash in URLs
export const getBackendUrl = () => {
  const url = process.env.NEXT_PUBLIC_BACKEND_URL || '/api';
  return url.replace(/\/$/, '');
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
