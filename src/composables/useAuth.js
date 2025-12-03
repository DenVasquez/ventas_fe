// src/composables/useAuth.js
import { ref, computed } from 'vue';
import { loginUser as loginUserAPI } from '../api/auth';

export function useAuth() {
  const user = ref(null);
  const token = ref(null);
  const loading = ref(false);
  const error = ref('');

  // Computed para autenticación
  const isAuthenticated = computed(() => !!token.value);

  // Cargar usuario desde localStorage al iniciar
  const loadUserFromStorage = () => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    if (storedToken && storedUser) {
      token.value = storedToken;
      user.value = JSON.parse(storedUser);
    }
  };

  // Login
  const loginUser = async ({ usuario, password }) => {
    loading.value = true;
    error.value = '';
    try {
      const result = await loginUserAPI({ usuario, password });
      if (!result.success) {
        throw new Error(result.message);
      }

      user.value = result.data.user;
      token.value = result.data.token;

      // Persistencia
      localStorage.setItem('token', token.value);
      localStorage.setItem('user', JSON.stringify(user.value));

      loading.value = false;
      return result;
    } catch (err) {
      loading.value = false;
      error.value = err.message || 'Error al iniciar sesión';
      throw err;
    }
  };

  // Logout
  const logout = () => {
    user.value = null;
    token.value = null;
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  // Verificar autenticación al iniciar la app
  const checkAuth = async () => {
    loadUserFromStorage();
    // Aquí puedes agregar validación de token con backend si quieres
    return isAuthenticated.value;
  };

  return {
    user,
    token,
    loading,
    error,
    isAuthenticated,
    loginUser,
    logout,
    loadUserFromStorage,
    checkAuth
  };
}
