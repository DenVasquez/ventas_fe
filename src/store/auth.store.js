import { defineStore } from 'pinia';
import { loginUser as loginUserAPI } from '../api/auth';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    token: null
  }),
  actions: {
    /**
     * Login del usuario
     * @param {Object} param0
     * @param {string} param0.usuario
     * @param {string} param0.password
     */
    async loginUser({ usuario, password }) {
      const result = await loginUserAPI({ usuario, password });

      if (!result.success) {
        throw new Error(result.message);
      }

      // Guardar información del usuario y token
      this.user = result.data.user;
      this.token = result.data.token;

      // Persistencia en localStorage
      localStorage.setItem('token', this.token);
      localStorage.setItem('user', JSON.stringify(this.user));
    },

    /**
     * Logout del usuario
     */
    logout() {
      this.user = null;
      this.token = null;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    },

    /**
     * Cargar usuario desde localStorage (por ejemplo al refrescar página)
     */
    loadUserFromStorage() {
      const token = localStorage.getItem('token');
      const user = localStorage.getItem('user');
      if (token && user) {
        this.token = token;
        this.user = JSON.parse(user);
      }
    }
  }
});
