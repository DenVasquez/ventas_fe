import { defineStore } from 'pinia';
import { useBuyerStore } from './buyer.store';
import { useProductoStore } from './productos.store';
import * as ventasApi from '../api/ventas';

export const useSaleStore = defineStore('sale', {
  state: () => ({
    sales: [],
    loading: false,
    error: null
  }),
  actions: {
    async fetchSales() {
      this.loading = true;
      this.error = null;
      try {
        const result = await ventasApi.fetchVentas();
        if (result.success) {
          this.sales = result.data;
        } else {
          this.error = 'Error al obtener ventas';
        }
      } catch (error) {
        this.error = error.message;
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async addSale(saleData) {
      this.loading = true;
      try {
        const result = await ventasApi.createVenta(saleData);
        if (result.success) {
          this.sales.push(result.data);
          return result.data;
        } else {
          throw new Error(result.message);
        }
      } catch (error) {
        this.error = error.message;
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async updateSale(id, updates) {
      this.loading = true;
      try {
        const result = await ventasApi.updateVenta(id, updates);
        if (result.success) {
          const index = this.sales.findIndex(s => s.id_venta === id);
          if (index !== -1) this.sales[index] = result.data || updates;
          return result.data;
        } else {
          throw new Error(result.message);
        }
      } catch (error) {
        this.error = error.message;
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async cancelSale(id) {
      this.loading = true;
      try {
        const result = await ventasApi.cancelVenta(id);
        if (result.success) {
          const index = this.sales.findIndex(s => s.id_venta === id);
          if (index !== -1) this.sales[index].estado = 'canceled';
        } else {
          throw new Error(result.message);
        }
      } catch (error) {
        this.error = error.message;
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async generateInvoice(saleId) {
      const sale = this.getSaleById(saleId);
      if (!sale) throw new Error('Venta no encontrada');

      const buyerStore = useBuyerStore();
      const buyer = buyerStore.getBuyerById(sale.cod_cliente);
      if (!buyer) throw new Error('Comprador no encontrado');

      const companyInfo = {
        name: "INPLAC SRL",
        address: "Calle Murillo #123, La Paz, Bolivia",
        phone: "+591 2 1234567",
        email: "info@inplac.bo",
        nit: "123456789",
        actividadEconomica: "Fabricación de muebles",
        leyenda: "Ley N° 453: Tienes derecho a recibir información sobre tus beneficios tributarios",
        numeroAutorizacion: "123456789",
        codigoControl: "ABC123XYZ",
        fechaLimiteEmision: "31/12/2025"
      };

      return {
        ...sale,
        buyer,
        companyInfo,
        invoiceNumber: `FAC-${String(saleId).padStart(6, '0')}`,
        fechaEmision: new Date().toLocaleDateString('es-BO'),
        codigoQR: `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(
          `NIT:${companyInfo.nit}|NRO:${saleId}|AUT:${companyInfo.numeroAutorizacion}|FEC:${new Date().toISOString().slice(0,10)}|TOT:${sale.total}|COD:${companyInfo.codigoControl}`
        )}`
      };
    }
  },
  getters: {
    getSaleById: (state) => (id) => state.sales.find(sale => sale.id_venta === id)
  }
});
