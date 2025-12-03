import api from './api.js';

/* ============================
   LISTAR MATERIALES
   Soporta: ?page=1&limit=10&search=xxx
============================ */
export const fetchMateriales = async ({ page = 1, limit = 10, search = '' } = {}) => {
  const { data } = await api.get('/materiales', {
    params: { page, limit, search }
  });

  // Backend retorna: { success, data: [...] }
  return data;
};

/* ============================
   CREAR MATERIAL
============================ */
export const createMaterial = async (material) => {
  const { data } = await api.post('/materiales', {
    codigo: material.cod,
    nombre_material: material.name,
    costo: material.unit_cost,
    cantidad: material.stock,
    unidad: material.unit
  });
  return data;
};

/* ============================
   ACTUALIZAR MATERIAL
============================ */
export const updateMaterial = async (id, material) => {
  const { data } = await api.put(`/materiales/${id}`, {
    codigo: material.cod,
    nombre_material: material.name,
    costo: material.unit_cost,
    cantidad: material.stock,
    unidad: material.unit
  });

  return data;
};

/* ============================
   ELIMINAR MATERIAL
============================ */
export const deleteMaterial = async (id) => {
  const { data } = await api.delete(`/materiales/${id}`);
  return data;
};
