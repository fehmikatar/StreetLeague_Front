import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService, AuthResponse, LoginRequest, SignupRequest } from '@/services/authService';

interface AuthContextType {
  user: (AuthResponse & { id: number }) | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (data: SignupRequest) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      const storedId = localStorage.getItem('user_id');
      setUser({
        id: storedId ? parseInt(storedId) : 0,
        token,
        email: localStorage.getItem('user_email') || '',
        name: localStorage.getItem('user_name') || '',
        userType: (localStorage.getItem('user_type') as 'player' | 'owner') || 'player',
      });
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const response = await authService.login({ email, password });
    saveUserToLocalStorage(response);
    setUser(response);
  };

  const signup = async (data: SignupRequest) => {
    const response = await authService.signup(data);
    saveUserToLocalStorage(response);
    setUser(response);
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const saveUserToLocalStorage = (response: AuthResponse) => {
    localStorage.setItem('auth_token', response.token);
    localStorage.setItem('user_id', response.id.toString());
    localStorage.setItem('user_email', response.email);
    localStorage.setItem('user_name', response.name);
    localStorage.setItem('user_type', response.userType);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, signup, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}