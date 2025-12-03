import api from './api.js'; // Axios instance configurada con baseURL e interceptores

/**
 * Login del usuario
 * @param {Object} param0 
 * @param {string} param0.usuario
 * @param {string} param0.password
 * @returns {Promise<Object>}
 */
export const loginUser = async ({ usuario, password }) => {
  try {
    const response = await api.post('/auth/login', { nombre_usuario: usuario, password });

    // Se espera que el backend devuelva { success: true, message, data: { user, token } }
    return response.data;

  } catch (err) {
    if (err.response && err.response.data) {
      throw new Error(err.response.data.message || 'Error en la autenticación');
    } else {
      throw new Error('Error de conexión con el servidor');
    }
  }
};
