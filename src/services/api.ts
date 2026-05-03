import axios, { AxiosError } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur requête : ajouter le token JWT
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Intercepteur réponse : gestion des erreurs
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    // Erreurs de validation Spring Boot (format : { errors: [{ field, defaultMessage }] })
    if (error.response?.status === 400 && error.response.data) {
      const data = error.response.data as any;
      if (data.errors && Array.isArray(data.errors)) {
        const validationErrors: Record<string, string> = {};
        data.errors.forEach((err: { field: string; defaultMessage: string }) => {
          validationErrors[err.field] = err.defaultMessage;
        });
        return Promise.reject({ ...error, validationErrors, message: 'Validation error' });
      }
      if (data.message) {
        return Promise.reject({ ...error, message: data.message });
      }
    }

    // 401 Unauthorized
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_email');
      localStorage.removeItem('user_name');
      localStorage.removeItem('user_type');
      localStorage.removeItem('user_id');
      window.location.href = '/auth/login';
    }
    
    // 403 Forbidden
    if (error.response?.status === 403) {
      // Optionnel : Vous pouvez rediriger vers une page "Accès refusé" ou afficher une erreur
      console.warn("Access Denied : 403 Forbidden");
    }

    return Promise.reject({ ...error, message: (error.response?.data as any)?.message || 'An error occurred' });
  }
);

export default api;