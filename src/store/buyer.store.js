import { defineStore } from 'pinia';
import {
  fetchBuyers,
  createBuyer,
  updateBuyer,
  deleteBuyer,
} from '../api/cliente.js';

export const useBuyerStore = defineStore('buyer', {
  state: () => ({
    buyers: [],
    loading: false,
    error: null,

    // paginación
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,

    search: '',
  }),

  actions: {
    /* =============================
       CARGAR COMPRADORES
    ============================= */
    async fetchBuyers(page = 1) {
      this.loading = true;
      this.error = null;

      try {
        const resp = await fetchBuyers({
          page,
          limit: this.limit,
          search: this.search,
        });
console.log("resp", resp);
        if (!resp.success) {
          this.error = resp.message || 'Error desconocido';
          return;
        }

        this.buyers = resp.data.map(m => ({
          id: m.id_cliente,
          name: m.nombre_completo,
          company: m.nombre_empresa,
          phone: m.telefono,
          email: m.email,
          tax_id: m.doc_identificacion,
          type: m.tipo,
          is_active: m.estado,
          address: m.direccion
        }));
        this.total = resp.total;
        this.totalPages = resp.totalPages;
        this.page = page;

      } catch (err) {
        this.error = err.message;
      } finally {
        this.loading = false;
      }
    },

    /* =============================
       CREAR COMPRADOR
    ============================= */
    async addBuyer(buyer) {
      const resp = await createBuyer(buyer);

      if (resp.success) {
        // refrescamos la lista
        await this.fetchBuyers(this.page);
      }

      return resp;
    },

    /* =============================
       ACTUALIZAR COMPRADOR
    ============================= */
    async updateBuyer(id, buyer) {
      const resp = await updateBuyer(id, buyer);

      if (resp.success) {
        await this.fetchBuyers(this.page);
      }

      return resp;
    },

    /* =============================
       ELIMINAR COMPRADOR
    ============================= */
    async deleteBuyer(id) {
      const resp = await deleteBuyer(id);

      if (resp.success) {
        await this.fetchBuyers(this.page);
      }

      return resp;
    },
  },
});
