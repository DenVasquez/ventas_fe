// stores/saleStore.js
import { defineStore } from 'pinia';
import api from '../api/db';
import { useBuyerStore } from './buyer.store';
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
        this.sales = await api.getSales();
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
        const newSale = await api.addSale(saleData);
        this.sales.push(newSale);
        return newSale;
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
        const updatedSale = await api.updateSale(id, updates);
        const index = this.sales.findIndex(s => s.id === id);
        if (index !== -1) {
          this.sales[index] = updatedSale;
        }
        return updatedSale;
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
        await api.cancelSale(id);
        const index = this.sales.findIndex(s => s.id === id);
        if (index !== -1) {
          this.sales[index].status = 'canceled';
        }
      } catch (error) {
        this.error = error.message;
        throw error;
      } finally {
        this.loading = false;
      }
    },
    // Agregar este método al store de ventas
    async generateInvoice(saleId) {
        const sale = this.getSaleById(saleId);
        if (!sale) throw new Error('Venta no encontrada');

        const buyerStore = useBuyerStore();
        const buyer = buyerStore.getBuyerById(sale.buyer_id);
        if (!buyer) throw new Error('Comprador no encontrado');
            
        // Datos de la empresa (deberías configurarlos en tu aplicación)
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
    },
     async getInvoicesReport(startDate, endDate) {
        this.loading = true;
        try {
        // Filtrar facturas por rango de fechas
        const filtered = this.sales.filter(sale => {
            const saleDate = new Date(sale.date);
            return saleDate >= new Date(startDate) && saleDate <= new Date(endDate);
        });
        
        // Calcular totales
        const totals = {
            totalAmount: filtered.reduce((sum, sale) => sum + sale.total, 0),
            totalInvoices: filtered.length,
            totalCanceled: filtered.filter(s => s.status === 'canceled').length
        };
        
        return {
            invoices: filtered,
            summary: totals,
            generatedAt: new Date().toISOString()
        };
        } catch (error) {
        this.error = error.message;
        throw error;
        } finally {
        this.loading = false;
        }
    }
  },
  getters: {
    getSaleById: (state) => (id) => {
        console.log(state);
        console.log(id);
      return state.sales.find(sale => sale.id === id);
    },
    completedSales: (state) => {
      return state.sales.filter(sale => sale.status === 'completed');
    },
    pendingSales: (state) => {
      return state.sales.filter(sale => sale.status === 'pending');
    },
    canceledSales: (state) => {
      return state.sales.filter(sale => sale.status === 'canceled');
    },
    salesByBuyer: (state) => (buyerId) => {
      return state.sales.filter(sale => sale.buyer_id === buyerId);
    }
  }
});