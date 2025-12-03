import api from './api.js';

// ====================
// Traer todos los usuarios
// ====================
export const fetchUsers = async () => {
  const { data } = await api.get('/usuarios');
  return data; // data = array de usuarios
};

// ====================
// Crear usuario
// ====================
export const createUser = async (user) => {
  const { data } = await api.post('/usuarios', user);
  return data; // data = { success, message, ...usuario }
};

// ====================
// Actualizar usuario
// ====================
export const updateUser = async (id, user) => {
  const { data } = await api.put(`/usuarios/${id}`, user);
  // El backend devuelve { actualizado: { success, ... } } según tu controller
  return data.actualizado || data;
};

// ====================
// Eliminar usuario (soft delete)
// ====================
export const deleteUser = async (id) => {
  const { data } = await api.delete(`/usuarios/${id}`);
  // El backend devuelve { eliminado: { success, ... } }
  return data.eliminado || data;
};
