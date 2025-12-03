import { defineStore } from 'pinia';
import { fetchMateriales, createMaterial, updateMaterial, deleteMaterial } from '../api/materiales';

export const useMaterialStore = defineStore('materialStore', {
  state: () => ({
    materiales: [],
    loading: false,
    error: null,
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
    search: ''
  }),

  actions: {
    async fetchMateriales(page = 1) {
      this.loading = true;
      this.error = null;

      try {
        const result = await fetchMateriales({
          page,
          limit: this.limit,
          search: this.search
        });
        // result.data contiene el array del backend
        this.materiales = result.data.map(m => ({
          id: m.id_material,
          cod: m.codigo,
          name: m.nombre_material,
          unit_cost: Number(m.costo),
          unit: m.unidad,
          stock: Number(m.cantidad)
        }));

        this.page = result.page || 1;
        this.total = result.total || this.materiales.length;
        this.totalPages = result.totalPages || 1;

      } catch (err) {
        this.error = err.message;
      } finally {
        this.loading = false;
      }
    },

    async addMaterial(material) {
      await createMaterial(material);
      await this.fetchMateriales(this.page);
    },

    async updateMaterial(id, material) {
      await updateMaterial(id, material);
      await this.fetchMateriales(this.page);
    },

    async deleteMaterial(id) {
      await deleteMaterial(id);
      await this.fetchMateriales(this.page);
    }
  }
});
