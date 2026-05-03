import api from './api';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  name: string;
  email: string;
  password: string;
  userType: 'player' | 'owner';
}

export interface AuthResponse {
  id: number;
  token: string;
  email: string;
  name: string;
  role: string;
}

export const authService = {
  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/login', data);
    // Sauvegarder dans le localStorage
    localStorage.setItem('auth_token', response.data.token);
    localStorage.setItem('user_id', response.data.id.toString());
    localStorage.setItem('user_email', response.data.email);
    localStorage.setItem('user_name', response.data.name);
    localStorage.setItem('user_type', response.data.role === 'ROLE_PLAYER' ? 'player' : 'owner');
    return response.data;
  },

  async signup(data: SignupRequest): Promise<any> {
    const parts = data.name.split(' ');
    const firstName = parts[0];
    const lastName = parts.slice(1).join(' ') || '';
    const role = data.userType === 'player' ? 'ROLE_PLAYER' : 'ROLE_FIELD_OWNER';
    
    const backendData = {
      firstName,
      lastName,
      email: data.email,
      password: data.password,
      role
    };
    
    const response = await api.post('/auth/register', backendData);
    return response.data;
  },

  async requestPasswordReset(email: string): Promise<void> {
    await api.post('/auth/password-reset-request', { email });
  },

  logout(): void {
    ['auth_token', 'user_email', 'user_name', 'user_type', 'user_id'].forEach(key =>
      localStorage.removeItem(key)
    );
  },
};