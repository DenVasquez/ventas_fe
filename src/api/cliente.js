import api from './api.js';

/* ============================================
   LISTAR COMPRADORES
   Soporta: ?page=1&limit=10&search=xxxx
============================================ */
export const fetchBuyers = async ({ page = 1, limit = 10, search = '' } = {}) => {
  const { data } = await api.get('/clientes', {
    params: { page, limit, search },
  });

  return data; // Backend retorna: { success, clientes, total, totalPages }
};

/* ============================================
   CREAR COMPRADOR
============================================ */
export const createBuyer = async (buyer) => {
  const { data } = await api.post('/clientes', {
    nombre_completo: buyer.name,
    nombre_empresa: buyer.company,
    telefono: buyer.phone,
    email: buyer.email,
    doc_identificacion: buyer.tax_id,
    tipo: buyer.type,
    estado: buyer.is_active ? 'activo' : 'inactivo',
    direccion: buyer.address
  });

  return data;
};

/* ============================================
   ACTUALIZAR COMPRADOR
============================================ */
export const updateBuyer = async (id, buyer) => {
  const { data } = await api.put(`/clientes/${id}`, {
    nombre_completo: buyer.name,
    nombre_empresa: buyer.company,
    telefono: buyer.phone,
    email: buyer.email,
    doc_identificacion: buyer.tax_id,
    tipo: buyer.type,
    estado: buyer.is_active ? 'activo' : 'inactivo',
    direccion: buyer.address,
  });

  return data;
};

/* ============================================
   ELIMINAR (Soft Delete)
============================================ */
export const deleteBuyer = async (id) => {
  const { data } = await api.delete(`/clientes/${id}`);
  return data;
};
