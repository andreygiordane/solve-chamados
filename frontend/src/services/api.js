import AuthService from './auth';

const API_BASE_URL = '/api';

// Função helper para fazer requisições autenticadas
async function fetchAPI(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...AuthService.getAuthHeaders(), // Injeta o Token automaticamente
      ...options.headers,
    },
    ...options,
  };

  // Se tiver corpo e for objeto, converte para string
  if (config.body && typeof config.body === 'object') {
    config.body = JSON.stringify(config.body);
  }

  try {
    const response = await fetch(url, config);
    
    // Se receber 401 (Unauthorized), fazer logout e redirecionar
    if (response.status === 401) {
      await AuthService.logout();
      window.location.href = '/login';
      throw new Error('Sessão expirada');
    }

    // Tratamento de erro genérico da API
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || errorData.message || `HTTP error! status: ${response.status}`);
    }

    // Para respostas sem conteúdo (como DELETE ou 204 No Content)
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
  // --- AUTHENTICATION ---
  login: (email, password) => AuthService.login(email, password),
  logout: () => AuthService.logout(),
  register: (userData) => AuthService.register(userData),
  validateSession: () => AuthService.validateSession(),

  // --- TICKETS (CHAMADOS) ---
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

  // --- ASSETS (EQUIPAMENTOS) ---
  getAssets: () => fetchAPI('/assets'),
  // ADICIONADO AQUI: A função que faltava
  getAssetHistory: (id) => fetchAPI(`/assets/${id}/history`), 
  createAsset: (data) => fetchAPI('/assets', { method: 'POST', body: data }),
  updateAsset: (id, data) => fetchAPI(`/assets/${id}`, { method: 'PUT', body: data }),
  deleteAsset: (id) => fetchAPI(`/assets/${id}`, { method: 'DELETE' }),

  // --- USERS (USUÁRIOS) ---
  getUsers: () => fetchAPI('/users'),
  getUser: (id) => fetchAPI(`/users/${id}`),
  createUser: (data) => fetchAPI('/users', { method: 'POST', body: data }),
  updateUser: (id, data) => fetchAPI(`/users/${id}`, { method: 'PUT', body: data }),
  changeUserPassword: (id, data) => fetchAPI(`/users/${id}/password`, { method: 'PUT', body: data }),
  deleteUser: (id) => fetchAPI(`/users/${id}`, { method: 'DELETE' }),

  // --- GROUPS (GRUPOS DE ACESSO) ---
  getGroups: () => fetchAPI('/groups'),
  createGroup: (data) => fetchAPI('/groups', { method: 'POST', body: data }),
  deleteGroup: (id) => fetchAPI(`/groups/${id}`, { method: 'DELETE' }),

  // --- ROLES (PERMISSÕES & CARGOS) ---
  getRoles: () => fetchAPI('/roles'),
  createRole: (data) => fetchAPI('/roles', { method: 'POST', body: data }),
  updateRole: (id, data) => fetchAPI(`/roles/${id}`, { method: 'PUT', body: data }),
  deleteRole: (id) => fetchAPI(`/roles/${id}`, { method: 'DELETE' }),
};