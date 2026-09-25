const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export async function apiFetch(endpoint, options = {}) {
  const config = {
    ...options,
    credentials: 'include', 
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  };

  const response = await fetch(`${BASE_URL}${endpoint}`, config);
  
  if (!response.ok) {
    if (response.status === 401 && typeof window !== 'undefined') {
      window.dispatchEvent(new Event('sessaoExpirada'));
    }

    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Erro na requisição');
  }

  return response.json();
}