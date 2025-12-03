<template>
  <div class="dashboard-container">
    <!-- Filtros -->
    <div class="filters card mb-4">
      <div class="card-body">
        <h5 class="card-title">Filtros</h5>
        <div class="row g-3">
          <div class="col-md-3">
            <label class="form-label">Fecha Inicio</label>
            <input type="date" v-model="filters.startDate" class="form-control">
          </div>
          <div class="col-md-3">
            <label class="form-label">Fecha Fin</label>
            <input type="date" v-model="filters.endDate" class="form-control">
          </div>
          <div class="col-md-3">
            <label class="form-label">Tipo de Cliente</label>
            <select v-model="filters.customerType" class="form-select">
              <option value="all">Todos</option>
              <option value="mayorista">Mayoristas</option>
              <option value="minorista">Minoristas</option>
            </select>
          </div>
          <div class="col-md-3 d-flex align-items-end">
            <button @click="loadDashboardData" class="btn btn-primary w-100">
              <i class="fas fa-sync-alt me-2"></i>Actualizar
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Resumen de KPIs -->
    <div class="row mb-4">
      <div class="col-md-4">
        <div class="card kpi-card">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-center">
              <div>
                <h6 class="card-subtitle mb-2 text-muted">Ventas Totales</h6>
                <h3 class="card-title">{{ formatCurrency(dashboardData.totalSales) }}</h3>
              </div>
              <div class="kpi-icon bg-primary">
                <i class="fas fa-dollar-sign"></i>
              </div>
            </div>
            <!-- <div class="mt-2">
              <span :class="['badge', salesTrendClass]">
                <i :class="salesTrendIcon"></i> {{ salesTrendPercentage }}%
              </span>
              <span class="text-muted small ms-2">vs período anterior</span>
            </div> -->
          </div>
        </div>
      </div>

      <div class="col-md-4">
        <div class="card kpi-card">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-center">
              <div>
                <h6 class="card-subtitle mb-2 text-muted">Facturas Emitidas</h6>
                <h3 class="card-title">{{ dashboardData.totalInvoices }}</h3>
              </div>
              <div class="kpi-icon bg-success">
                <i class="fas fa-file-invoice"></i>
              </div>
            </div>
            <div class="mt-2">
              <span class="badge bg-light text-dark">
                {{ dashboardData.completedInvoices }} completadas
              </span>
              <span class="badge bg-warning text-dark ms-1">
                {{ dashboardData.pendingInvoices }} pendientes
              </span>
            </div>
          </div>
        </div>
      </div>

      <div class="col-md-4">
        <div class="card kpi-card">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-center">
              <div>
                <h6 class="card-subtitle mb-2 text-muted">Clientes Activos</h6>
                <h3 class="card-title">{{ dashboardData.activeCustomers }}</h3>
              </div>
              <div class="kpi-icon bg-info">
                <i class="fas fa-users"></i>
              </div>
            </div>
            <div class="mt-2">
              <span class="badge bg-primary me-1">
                {{ dashboardData.mayoristas }} mayoristas
              </span>
              <span class="badge bg-secondary">
                {{ dashboardData.minoristas }} minoristas
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- <div class="col-md-3">
        <div class="card kpi-card">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-center">
              <div>
                <h6 class="card-subtitle mb-2 text-muted">Productos Vendidos</h6>
                <h3 class="card-title">{{ dashboardData.totalProductsSold }}</h3>
              </div>
              <div class="kpi-icon bg-warning">
                <i class="fas fa-boxes"></i>
              </div>
            </div>
            <div class="mt-2">
              <span class="badge bg-danger">
                {{ dashboardData.lowStockProducts }} bajo stock
              </span>
            </div>
          </div>
        </div>
      </div> -->

      <!-- <div class="col-md-3">
        <div class="card kpi-card">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-center">
              <div>
                <h6 class="card-subtitle mb-2 text-muted">Materiales Usados</h6>
                <h3 class="card-title">{{ dashboardData.totalMaterialsUsed }}</h3>
              </div>
              <div class="kpi-icon bg-danger">
                <i class="fas fa-box-open"></i>
              </div>
            </div>
            <div class="mt-2">
              <span class="badge bg-danger">
                {{ dashboardData.lowStockMaterials }} bajo stock
              </span>
            </div>
          </div>
        </div>
      </div> -->
    </div>

    <!-- Gráficos y Tablas -->
    <div class="row">
      <!-- Gráfico de Ventas por Día -->
      <div class="col-md-8">
        <div class="card mb-4">
          <div class="card-header">
            <h5>Ventas por Día</h5>
          </div>
          <div class="card-body position-relative" style="height: 300px;">
            <canvas ref="salesChart"></canvas>
          </div>
        </div>
      </div>

      <!-- Top Productos -->
      <!-- <div class="col-md-4">
        <div class="card mb-4">
          <div class="card-header d-flex justify-content-between align-items-center">
            <h5>Top 5 Productos</h5>
            <router-link to="/productos" class="btn btn-sm btn-outline-primary">
              Ver todos
            </router-link>
          </div>
          <div class="card-body">
            <ul class="list-group">
              <li v-for="(product, index) in dashboardData.topProducts" 
                  :key="product.cod"
                  class="list-group-item d-flex justify-content-between align-items-center">
                <div>
                  <span class="badge bg-primary me-2">{{ index + 1 }}</span>
                  {{ product.name }} ({{ product.cod }})
                </div>
                <div class="text-end">
                  <div class="fw-bold">{{ product.totalSold }} vendidos</div>
                  <small class="text-muted">{{ formatCurrency(product.totalRevenue) }}</small>
                </div>
              </li>
              <li v-if="dashboardData.topProducts.length === 0" 
                  class="list-group-item text-center text-muted py-2">
                No hay datos de productos
              </li>
            </ul>
          </div>
        </div>
      </div> -->

      <!-- Materiales Críticos -->
      <!-- <div class="col-md-4">
        <div class="card mb-4">
          <div class="card-header d-flex justify-content-between align-items-center">
            <h5>Materiales Críticos</h5>
            <router-link to="/materiales" class="btn btn-sm btn-outline-danger">
              <i class="fas fa-box-open me-1"></i> Gestionar
            </router-link>
          </div>
          <div class="card-body">
            <ul class="list-group">
              <li v-for="material in dashboardData.criticalMaterials" 
                  :key="material.cod"
                  class="list-group-item d-flex justify-content-between align-items-center">
                <div>
                  <span class="badge bg-danger me-2">
                    <i class="fas fa-exclamation-triangle"></i>
                  </span>
                  {{ material.name }} ({{ material.cod }})
                </div>
                <div class="text-end">
                  <span class="badge bg-warning">
                    Stock: {{ material.stock }}
                  </span>
                  <div class="text-muted small">
                    Mínimo: {{ material.stock_minimo || 'N/D' }}
                  </div>
                </div>
              </li>
              <li v-if="dashboardData.criticalMaterials.length === 0" 
                  class="list-group-item text-center text-muted py-2">
                No hay materiales críticos
              </li>
            </ul>
          </div>
        </div>
      </div> -->

      <!-- Uso de Materiales por Producto -->
      <div class="col-md-4">
        <div class="card mb-4">
          <div class="card-header">
            <h5>Materiales por Agotarse</h5>
          </div>
          <div class="card-body">
            <ul class="list-group">
              <li v-for="material in dashboardData.lowStockMaterialsList"
                  :key="material.cod"
                  class="list-group-item d-flex justify-content-between align-items-center">
                <div>
                  <span class="badge bg-warning me-2">
                    <i class="fas fa-exclamation-circle"></i>
                  </span>
                  {{ material.name }} ({{ material.cod }})
                </div>
                <span class="badge bg-danger">
                  {{ material.stock }} restantes
                </span>
              </li>
              <li v-if="dashboardData.lowStockMaterialsList.length === 0"
                  class="list-group-item text-center text-muted py-2">
                No hay materiales bajos en stock
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <!-- Tabla de Últimas Ventas -->
    <div class="row">
      <div class="col-12">
        <div class="card">
          <div class="card-header d-flex justify-content-between align-items-center">
            <h5>Últimas Ventas</h5>
            <router-link to="/ventas" class="btn btn-sm btn-outline-secondary">
              Ver todas
            </router-link>
          </div>
          <div class="card-body">
            <div class="table-responsive">
              <table class="table table-hover">
                <thead>
                  <tr>
                    <th>Factura</th>
                    <th>Fecha</th>
                    <th>Cliente</th>
                    <th>Productos</th>
                    <th>Total</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="sale in dashboardData.recentSales" :key="sale.id">
                    <td>{{ sale.invoiceNumber }}</td>
                    <td>{{ formatDate(sale.date) }}</td>
                    <td>{{ getCustomerName(sale.buyer_id) }}</td>
                    <td>
                      <span v-for="(item, idx) in sale.items" :key="idx" class="badge bg-light text-dark me-1">
                        {{ item.quantity }}x {{ getProductName(item.cod) }}
                      </span>
                    </td>
                    <td>{{ formatCurrency(sale.total) }}</td>
                    <td>
                      <span :class="['badge', getStatusClass(sale.status)]">
                        {{ getStatusText(sale.status) }}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useSaleStore } from '../store/sale.store';
import { useBuyerStore } from '../store/buyer.store';
import { useProductoStore } from '../store/productos.store';
import { useMaterialStore } from '../store/material.store';
import { Chart, registerables } from 'chart.js';
import { formatCurrency, formatDate } from '../utils/formatters';

// Registra los componentes de Chart.js
Chart.register(...registerables);

// Stores
const saleStore = useSaleStore();
const buyerStore = useBuyerStore();
const productoStore = useProductoStore();
const materialStore = useMaterialStore();

// Refs
const salesChart = ref(null);
let chartInstance = null;

// Helpers
const getFirstDayOfMonth = () => {
  const date = new Date();
  return new Date(date.getFullYear(), date.getMonth(), 1).toISOString().slice(0, 10);
};

// Filtros
const filters = ref({
  startDate: getFirstDayOfMonth(),
  endDate: new Date().toISOString().slice(0, 10),
  customerType: 'all'
});

// Datos del dashboard
const dashboardData = ref({
  totalSales: 0,
  totalInvoices: 0,
  completedInvoices: 0,
  pendingInvoices: 0,
  activeCustomers: 0,
  mayoristas: 0,
  minoristas: 0,
  totalProductsSold: 0,
  lowStockProducts: 0,
  totalMaterialsUsed: 0,
  lowStockMaterials: 0,
  topProducts: [],
  recentSales: [],
  salesByDay: [],
  criticalMaterials: [],
  lowStockMaterialsList: []
});

// Carga los datos iniciales
onMounted(() => {
  loadDashboardData();
});

// Función para cargar los datos del dashboard
const loadDashboardData = async () => {
  try {
    // Cargar datos de todos los stores
    await Promise.all([
      saleStore.fetchSales(),
      buyerStore.fetchBuyers(),
      productoStore.fetchProductos(),
      materialStore.fetchMateriales() 
    ]);

    // Filtrar ventas según los filtros aplicados
    const filteredSales = saleStore.sales.filter(sale => {
      const saleDate = new Date(sale.date);
      const startDate = new Date(filters.value.startDate);
      const endDate = new Date(filters.value.endDate);
      
      const dateMatch = saleDate >= startDate && saleDate <= endDate;
      let customerMatch = true;
      
      if (filters.value.customerType !== 'all') {
        const buyer = buyerStore.getBuyerById(sale.buyer_id);
        customerMatch = buyer && buyer.type === filters.value.customerType;
      }
      console.log("dateMatch && customerMatch", dateMatch && customerMatch);
      return dateMatch && customerMatch;
    });

    // Calcular materiales usados
    const calculateMaterialsUsed = () => {
      let total = 0;
      filteredSales.forEach(sale => {
        sale.items.forEach(item => {
          const product = productoStore.productos.find(p => p.cod === item.product_code);
          if (product?.bom) {
            product.bom.forEach(material => {
              total += material.qty * item.quantity;
            });
          }
        });
      });
      return total;
    };

    // Obtener productos más vendidos
    const topProducts = await productoStore.getTopProductsReport(5);

    // Materiales críticos (stock < 30% del mínimo)
    const criticalMaterials = materialStore.materiales
      .filter(m => m.stock < (m.stock_minimo || 10) * 0.3)
      .sort((a, b) => a.stock - b.stock);

    // Materiales bajos en stock (stock < mínimo pero > 30%)
    const lowStockMaterialsList = materialStore.materiales
      .filter(m => 
        m.stock < (m.stock_minimo || 10) && 
        m.stock >= (m.stock_minimo || 10) * 0.3
      )
      .sort((a, b) => a.stock - b.stock);

    // Actualizar datos del dashboard
    dashboardData.value = {
      totalSales: filteredSales.reduce((sum, sale) => sum + sale.total, 0),
      totalInvoices: filteredSales.length,
      completedInvoices: filteredSales.filter(s => s.status === 'completed').length,
      pendingInvoices: filteredSales.filter(s => s.status === 'pending').length,
      activeCustomers: buyerStore.activeBuyers.length,
      mayoristas: buyerStore.mayoristas.length,
      minoristas: buyerStore.minoristas.length,
      totalProductsSold: filteredSales.reduce((sum, sale) => {
        return sum + sale.items.reduce((itemSum, item) => itemSum + item.quantity, 0);
      }, 0),
      lowStockProducts: productoStore.productos.filter(p => p.stock < 10).length,
      totalMaterialsUsed: calculateMaterialsUsed(),
      lowStockMaterials: materialStore.materiales.filter(m => m.stock < (m.stock_minimo || 10)).length,
      topProducts: topProducts,
      recentSales: [...filteredSales]
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 5),
      salesByDay: calculateSalesByDay(filteredSales),
      criticalMaterials: criticalMaterials.slice(0, 5),
      lowStockMaterialsList: lowStockMaterialsList.slice(0, 5)
    };

    renderSalesChart();
    
  } catch (error) {
    console.error('Error loading dashboard data:', error);
  }
};

// Función para calcular ventas por día
const calculateSalesByDay = (sales) => {
  const salesByDay = {};
  
  sales.forEach(sale => {
    const date = new Date(sale.date).toISOString().slice(0, 10);
    if (!salesByDay[date]) {
      salesByDay[date] = 0;
    }
    salesByDay[date] += Number(sale.total);
  });
  
  return Object.entries(salesByDay)
    .map(([date, total]) => ({ date, total }))
    .sort((a, b) => new Date(a.date) - new Date(b.date));
};

// Función para renderizar el gráfico
const renderSalesChart = () => {
  if (!salesChart.value || dashboardData.value.salesByDay.length === 0) return;
  
  if (chartInstance) {
    chartInstance.destroy();
  }

  const ctx = salesChart.value.getContext('2d');
  
  chartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: dashboardData.value.salesByDay.map(item => formatDate(item.date)),
      datasets: [{
        label: 'Ventas por día',
        data: dashboardData.value.salesByDay.map(item => item.total),
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 2,
        tension: 0.1,
        fill: true
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
        },
        tooltip: {
          callbacks: {
            label: (context) => ` ${formatCurrency(context.raw)}`
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: (value) => formatCurrency(value)
          },
          grid: {
            color: 'rgba(0, 0, 0, 0.1)'
          }
        },
        x: {
          grid: {
            color: 'rgba(0, 0, 0, 0.1)'
          }
        }
      }
    }
  });
};

// Helpers adicionales
const getCustomerName = (buyerId) => {
  const buyer = buyerStore.getBuyerById(buyerId);
  return buyer ? buyer.name : 'Cliente no encontrado';
};

const getProductName = (productCode) => {
    console.log("productCode", productCode);
    console.log("productoStore", productoStore.productos);
  const product = productoStore.productos.find(p => p.cod === productCode);
  return product ? product.name : 'Producto no encontrado';
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

// Computed properties
const salesTrendPercentage = computed(() => {
  // Implementar lógica real según tus necesidades
  return 15;
});

const salesTrendClass = computed(() => {
  return salesTrendPercentage.value >= 0 ? 'bg-success' : 'bg-danger';
});

const salesTrendIcon = computed(() => {
  return salesTrendPercentage.value >= 0 ? 'fas fa-arrow-up' : 'fas fa-arrow-down';
});
</script>

<style scoped>
.dashboard-container {
  padding-left: 180px;
}

.kpi-card {
  height: 100%;
  transition: transform 0.2s;
}

.kpi-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.kpi-icon {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.25rem;
}

.card-header {
  background-color: #f8f9fa;
  font-weight: 600;
}

.list-group-item {
  transition: background-color 0.2s;
}

.list-group-item:hover {
  background-color: #f8f9fa;
}

.table th {
  background-color: #f8f9fa;
}

.filters {
  background-color: #f8f9fa;
}

/* Estilos para el gráfico */
canvas {
  width: 100% !important;
  height: 100% !important;
}

.card-body {
  position: relative;
}

/* Estilos para materiales críticos */
.material-critical {
  border-left: 4px solid #dc3545;
  background-color: rgba(220, 53, 69, 0.05);
}

.material-warning {
  border-left: 4px solid #ffc107;
  background-color: rgba(255, 193, 7, 0.05);
}

.kpi-icon.bg-danger {
  background-color: #dc3545 !important;
}

/* Responsive */
@media (max-width: 768px) {
  .dashboard-container {
    padding-left: 0;
  }
  
  .col-md-3, .col-md-4, .col-md-8, .col-md-12 {
    margin-bottom: 1rem;
  }
}
</style>