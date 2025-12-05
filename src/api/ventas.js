import api from './api.js';

// Obtener todas las ventas
export const fetchVentas = async () => {
  const { data } = await api.get('/ventas');
  return data; // backend devuelve { success, data: [...] }
};

// Crear venta
export const createVenta = async (ventaData) => {
  const { data } = await api.post('/ventas', ventaData);
  return data;
};

// Actualizar venta
export const updateVenta = async (id, updates) => {
  const { data } = await api.put(`/ventas/${id}`, updates);
  return data;
};

// Cancelar venta
export const cancelVenta = async (id) => {
  const { data } = await api.post(`/ventas/${id}/cancel`);
  return data;
};
