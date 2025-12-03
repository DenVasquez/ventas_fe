import api from './api.js';

export const fetchProductos = async ({ page = 1, limit = 10, search = '' } = {}) => {
  const { data } = await api.get('/productos', {
    params: { page, limit, search }
  });

  // Backend retorna: { success, data: [...] }
  return data;
};

export const createProducto = async (producto) => {
  const { data } = await api.post('/productos', {

    codigo: producto.cod,
    nombre_producto: producto.name,
    precio_venta: producto.price,
    costo_fabricacion: producto.manufacturing_cost,
    utilidad: producto.utility
  });
  return data;
};

export const updateProducto = async (id, producto) => {
  const { data } = await api.put(`/productos/${id}`, {
    codigo: producto.cod,
    nombre_producto: producto.name,
    precio_venta: producto.price,
    costo_fabricacion: producto.manufacturing_cost,
    utilidad: producto.utility
  });

  return data;
};

/* ============================
   ELIMINAR producto
============================ */
export const deleteProducto = async (id) => {
  const { data } = await api.delete(`/productos/${id}`);
  return data;
};