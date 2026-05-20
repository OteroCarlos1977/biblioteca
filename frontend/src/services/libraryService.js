// Service del frontend: concentra fetch y URLs.
// Si cambia el puerto o la ruta del backend, se modifica aca y no en los componentes.
const LOCAL_API_URL = 'http://localhost:5010/api';

const getApiUrl = () => {
  const configuredUrl = import.meta.env.VITE_API_URL;
  const currentHost = typeof window !== 'undefined' ? window.location.hostname : '';
  const isLocalHost = currentHost === 'localhost' || currentHost === '127.0.0.1';

  // En despliegues publicos la API vive en el mismo dominio bajo /api.
  // Si alguna variable de build queda apuntando a localhost, la ignoramos
  // para evitar que el navegador del usuario intente llamar a su propia PC.
  if (!isLocalHost) {
    return configuredUrl && !configuredUrl.includes('localhost') ? configuredUrl : '/api';
  }

  return configuredUrl || LOCAL_API_URL;
};

const API_URL = getApiUrl();

// Todas las respuestas pasan por este helper para que los componentes no
// repitan la misma validacion de response.ok.
const handleResponse = async (response, errorMessage) => {
  if (!response.ok) {
    throw new Error(errorMessage);
  }

  return response.json();
};

const buildQuery = (filters) => {
  // Convierte objetos de filtros en query strings: { year: 2001 } -> ?year=2001
  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value) {
      params.append(key, value);
    }
  });

  return params.toString();
};

export const getBooks = async (filters = {}) => {
  const query = buildQuery(filters);
  const response = await fetch(`${API_URL}/books${query ? `?${query}` : ''}`);
  return handleResponse(response, 'No se pudieron obtener los libros');
};

export const getBooksMeta = async () => {
  const response = await fetch(`${API_URL}/books/meta`);
  return handleResponse(response, 'No se pudo obtener metadata de libros');
};

export const getUsers = async (filters = {}) => {
  const query = buildQuery(filters);
  const response = await fetch(`${API_URL}/users${query ? `?${query}` : ''}`);
  return handleResponse(response, 'No se pudieron obtener los usuarios');
};

export const getLoans = async (filters = {}) => {
  const query = buildQuery(filters);
  const response = await fetch(`${API_URL}/loans${query ? `?${query}` : ''}`);
  return handleResponse(response, 'No se pudieron obtener los prestamos');
};

export const getBookAvailability = async (bookId) => {
  const response = await fetch(`${API_URL}/books/${bookId}/availability`);
  return handleResponse(response, 'No se pudo consultar disponibilidad');
};

export const createLoan = async ({ bookId, userId }) => {
  const response = await fetch(`${API_URL}/loans`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ bookId, userId }),
  });

  return handleResponse(response, 'No se pudo crear el prestamo');
};

export const returnLoan = async (loanId) => {
  const response = await fetch(`${API_URL}/loans/${loanId}/return`, {
    method: 'PUT',
  });

  return handleResponse(response, 'No se pudo registrar la devolucion');
};

export const deleteLoan = async (loanId) => {
  const response = await fetch(`${API_URL}/loans/${loanId}`, {
    method: 'DELETE',
  });

  return handleResponse(response, 'No se pudo eliminar el prestamo');
};
