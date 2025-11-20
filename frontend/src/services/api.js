import AuthService from './auth';

const API_BASE_URL = '/api';

// Função helper para fazer requisições autenticadas
async function fetchAPI(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...AuthService.getAuthHeaders(),
      ...options.headers,
    },
    ...options,
  };

  if (config.body && typeof config.body === 'object') {
    config.body = JSON.stringify(config.body);
  }

  try {
    const response = await fetch(url, config);
    
    // Se receber 401 (Unauthorized), fazer logout
    if (response.status === 401) {
      await AuthService.logout();
      window.location.href = '/login';
      throw new Error('Sessão expirada');
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || errorData.message || `HTTP error! status: ${response.status}`);
    }

    // Para respostas sem conteúdo (como DELETE)
    if (response.status === 204) {
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

export const api = {
  // Auth
  login: (email, password) => AuthService.login(email, password),
  logout: () => AuthService.logout(),
  register: (userData) => AuthService.register(userData),
  validateSession: () => AuthService.validateSession(),

  // Tickets
  getTickets: () => fetchAPI('/tickets'),
  getTicket: (id) => fetchAPI(`/tickets/${id}`),
  createTicket: (data) => fetchAPI('/tickets', { method: 'POST', body: data }),
  updateTicketStatus: (id, status, additionalData = {}) => 
    fetchAPI(`/tickets/${id}/status`, { 
      method: 'PUT', 
      body: { status, ...additionalData } 
    }),
  addTicketUpdate: (id, text, author) => 
    fetchAPI(`/tickets/${id}/updates`, { 
      method: 'POST', 
      body: { text, author } 
    }),
  deleteTicket: (id) => fetchAPI(`/tickets/${id}`, { method: 'DELETE' }),

  // Assets
  getAssets: () => fetchAPI('/assets'),
  createAsset: (data) => fetchAPI('/assets', { method: 'POST', body: data }),
  deleteAsset: (id) => fetchAPI(`/assets/${id}`, { method: 'DELETE' }),

  // Users
  getUsers: () => fetchAPI('/users'),
  getUser: (id) => fetchAPI(`/users/${id}`),
  createUser: (data) => fetchAPI('/users', { method: 'POST', body: data }),
  updateUser: (id, data) => fetchAPI(`/users/${id}`, { method: 'PUT', body: data }),
  changeUserPassword: (id, data) => fetchAPI(`/users/${id}/password`, { method: 'PUT', body: data }),
  deleteUser: (id) => fetchAPI(`/users/${id}`, { method: 'DELETE' }),

  // Groups
  getGroups: () => fetchAPI('/groups'),
  createGroup: (data) => fetchAPI('/groups', { method: 'POST', body: data }),
  deleteGroup: (id) => fetchAPI(`/groups/${id}`, { method: 'DELETE' }),
};