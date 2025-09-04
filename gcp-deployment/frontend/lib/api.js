// API service for permit management
class ApiService {
  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_API_URL || 'https://permitpro-463203.uk.r.appspot.com/api';
  }

  getToken() {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('permitProToken');
    }
    return null;
  }

  setToken(token) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('permitProToken', token);
    }
  }

  removeToken() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('permitProToken');
    }
  }

  async request(endpoint, options = {}) {
    const token = this.getToken();
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, config);
      
      if (!response.ok) {
        if (response.status === 401) {
          // Token expired or invalid
          this.removeToken();
          throw new Error('Authentication failed. Please login again.');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return response.json();
    } catch (error) {
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('Network error. Please check your connection and ensure the server is running.');
      }
      throw error;
    }
  }

  // Authentication
  async login(email, password) {
    const response = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    if (response.token) {
      this.setToken(response.token);
    }
    
    return response;
  }

  async logout() {
    this.removeToken();
  }

  // Permit packages
  async getPermits() {
    return this.request('/permits');
  }

  async createPermit(packageData) {
    return this.request('/permits', {
      method: 'POST',
      body: JSON.stringify(packageData),
    });
  }

  async updatePackageStatus(packageId, status) {
    return this.request(`/permits/${packageId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  async uploadDocument(packageId, documentData) {
    return this.request(`/permits/${packageId}/documents`, {
      method: 'POST',
      body: JSON.stringify(documentData),
    });
  }

  // Get permit types
  async getPermitTypes() {
    return this.request('/permit-types');
  }

  // Dashboard stats
  async getDashboardStats() {
    return this.request('/dashboard/stats');
  }
}

export const apiService = new ApiService();
