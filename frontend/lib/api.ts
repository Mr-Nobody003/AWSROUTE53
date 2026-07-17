// Helper to get backend URL from Vercel Services or local proxy
export const getBackendUrl = () => {
  return process.env.NEXT_PUBLIC_BACKEND_URL || '/api';
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
