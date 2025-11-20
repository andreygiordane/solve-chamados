const API_BASE_URL = '/api/auth';

class AuthService {
  static async login(email, password) {
    const response = await fetch(`${API_BASE_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    
    if (data.success && data.session) {
      // Salvar token no localStorage
      localStorage.setItem('authToken', data.session.token);
      localStorage.setItem('user', JSON.stringify(data.user));
    }

    return data;
  }

  static async logout() {
    const token = this.getToken();
    
    if (token) {
      await fetch(`${API_BASE_URL}/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
    }

    // Limpar localStorage
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  }

  static async register(userData) {
    const response = await fetch(`${API_BASE_URL}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    return await response.json();
  }

  static async validateSession() {
    const token = this.getToken();
    
    if (!token) {
      return { success: false, message: 'Token não encontrado' };
    }

    const response = await fetch(`${API_BASE_URL}/validate`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    return await response.json();
  }

  static getToken() {
    return localStorage.getItem('authToken');
  }

  static getUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  static isAuthenticated() {
    return !!this.getToken();
  }

  static hasRole(role) {
    const user = this.getUser();
    return user && user.role === role;
  }

  static hasAnyRole(roles) {
    const user = this.getUser();
    return user && roles.includes(user.role);
  }

  // Headers para requisições autenticadas
  static getAuthHeaders() {
    const token = this.getToken();
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  }
}

export default AuthService;