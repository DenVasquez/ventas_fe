<template>
  <div class="container py-4">
    <h2 class="mb-4">Reportes de Ventas</h2>
    
    <!-- Filtros -->
    <div class="card mb-4">
      <div class="card-body">
        <h5 class="card-title">Filtros</h5>
        <div class="row g-3">
          <div class="col-md-4">
            <label class="form-label">Fecha Inicio</label>
            <input type="date" v-model="filters.startDate" class="form-control">
          </div>
          <div class="col-md-4">
            <label class="form-label">Fecha Fin</label>
            <input type="date" v-model="filters.endDate" class="form-control">
          </div>
          <div class="col-md-4 d-flex align-items-end">
            <button @click="generateReports" class="btn btn-primary">
              Generar Reportes
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Reportes -->
    <div v-if="loading" class="text-center my-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Cargando...</span>
      </div>
      <p>Generando reportes...</p>
    </div>
    
    <div v-else-if="error" class="alert alert-danger">
      {{ error }}
    </div>
    
    <div v-else-if="reportsGenerated">
      <!-- Reporte de Facturas -->
      <div class="card mb-4">
        <div class="card-header d-flex justify-content-between align-items-center">
          <h5>Reporte de Facturas</h5>
          <button @click="exportToPDF('invoices-report')" class="btn btn-sm btn-outline-secondary">
            <i class="fas fa-file-pdf"></i> Exportar
          </button>
        </div>
        <div class="card-body">
          <div id="invoices-report">
            <h6>Resumen</h6>
            <ul>
              <li>Total Facturas: {{ invoiceReport.summary.totalInvoices }}</li>
              <li>Total Ventas: {{ formatCurrency(invoiceReport.summary.totalAmount) }}</li>
              <li>Facturas Canceladas: {{ invoiceReport.summary.totalCanceled }}</li>
            </ul>
            
            <table class="table table-striped">
              <thead>
                <tr>
                  <th>N° Factura</th>
                  <th>Fecha</th>
                  <th>Cliente</th>
                  <th>Total</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="inv in invoiceReport.invoices" :key="inv.id">
                  <td>{{ inv.invoiceNumber }}</td>
                  <td>{{ formatDate(inv.date) }}</td>
                  <td>{{ getBuyerName(inv.buyer_id) }}</td>
                  <td>{{ formatCurrency(inv.total) }}</td>
                  <td>
                    <span :class="['badge', getStatusClass(inv.status)]">
                      {{ getStatusText(inv.status) }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      <!-- Reporte de Productos -->
      <div class="card mb-4">
        <div class="card-header">
          <h5>Productos Más Vendidos</h5>
        </div>
        <div class="card-body">
          <div class="row">
            <div class="col-md-6">
              <h6>Por Cantidad</h6>
              <table class="table">
                <thead>
                  <tr>
                    <th>Producto</th>
                    <th>Cantidad</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(prod, index) in topProductsReport.topByQuantity" :key="'qty-'+index">
                    <td>{{ prod.name }}</td>
                    <td>{{ prod.totalSold }}</td>
                    <td>{{ formatCurrency(prod.totalRevenue) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div class="col-md-6">
              <h6>Por Valor</h6>
              <table class="table">
                <thead>
                  <tr>
                    <th>Producto</th>
                    <th>Total</th>
                    <th>Cantidad</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(prod, index) in topProductsReport.topByRevenue" :key="'rev-'+index">
                    <td>{{ prod.name }}</td>
                    <td>{{ formatCurrency(prod.totalRevenue) }}</td>
                    <td>{{ prod.totalSold }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Reporte de Clientes -->
      <div class="card">
        <div class="card-header">
          <h5>Ventas por Cliente</h5>
        </div>
        <div class="card-body">
          <table class="table">
            <thead>
              <tr>
                <th>Cliente</th>
                <th>Facturas</th>
                <th>Productos</th>
                <th>Total Comprado</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="buyer in salesByBuyerReport.buyers" :key="buyer.id">
                <td>{{ buyer.name }}</td>
                <td>{{ buyer.invoiceCount }}</td>
                <td>{{ buyer.totalPurchases }}</td>
                <td>{{ formatCurrency(buyer.totalSpent) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useSaleStore } from '../store/sale.store';
import { useBuyerStore } from '../store/buyer.store';
import { useProductoStore } from '../store/productos.store';
import html2pdf from 'html2pdf.js';

const saleStore = useSaleStore();
const buyerStore = useBuyerStore();
const productoStore = useProductoStore();

const filters = ref({
  startDate: new Date(new Date().setDate(1)).toISOString().slice(0, 10), // Primer día del mes
  endDate: new Date().toISOString().slice(0, 10) // Hoy
});

const loading = ref(false);
const error = ref(null);
const reportsGenerated = ref(false);

const invoiceReport = ref(null);
const topProductsReport = ref(null);
const salesByBuyerReport = ref(null);

const generateReports = async () => {
  try {
    loading.value = true;
    error.value = null;
    
    // Generar todos los reportes en paralelo
    const results = await Promise.all([
      saleStore.getInvoicesReport(filters.value.startDate, filters.value.endDate),
      productoStore.getTopProductsReport(),
      buyerStore.getSalesByBuyerReport()
    ]);
    
    invoiceReport.value = results[0];
    topProductsReport.value = results[1];
    salesByBuyerReport.value = results[2];
    
    reportsGenerated.value = true;
  } catch (err) {
    error.value = 'Error al generar reportes: ' + err.message;
    console.error(err);
  } finally {
    loading.value = false;
  }
};

const exportToPDF = (elementId) => {
  const element = document.getElementById(elementId);
  const opt = {
    margin: 10,
    filename: `reporte_${new Date().toISOString().slice(0, 10)}.pdf`,
    html2canvas: { scale: 2 },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
  };
  
  html2pdf().set(opt).from(element).save();
};

// Helpers
const formatCurrency = (value) => {
  return new Intl.NumberFormat('es-BO', { style: 'currency', currency: 'BOB' }).format(value);
};

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('es-BO');
};

const getBuyerName = (buyerId) => {
  const buyer = buyerStore.getBuyerById(buyerId);
  return buyer ? buyer.name : 'Cliente no encontrado';
};

const getStatusClass = (status) => {
  const classes = {
    'completed': 'bg-success',
    'pending': 'bg-warning text-dark',
    'canceled': 'bg-danger'
  };
  return classes[status] || 'bg-secondary';
};

const getStatusText = (status) => {
  const texts = {
    'completed': 'Completado',
    'pending': 'Pendiente',
    'canceled': 'Cancelado'
  };
  return texts[status] || status;
};
</script>

<style scoped>
.card {
  margin-bottom: 20px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.card-header {
  background-color: #f8f9fa;
  font-weight: bold;
}

.table {
  margin-top: 15px;
}

.badge {
  font-size: 0.85em;
  padding: 0.35em 0.65em;
}

@media print {
  .no-print {
    display: none !important;
  }
  
  body {
    background: white;
    font-size: 12pt;
  }
  
  .card {
    border: none;
    box-shadow: none;
    page-break-inside: avoid;
  }
}
</style>