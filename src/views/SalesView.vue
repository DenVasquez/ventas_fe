<template>
  <div class="container py-4">
    <!-- Header y botón nueva venta -->
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h2>Ventas Realizadas</h2>
      <button class="btn btn-success" @click="openDialog('new')" :disabled="saleStore.loading">
        <i class="fa-solid fa-plus me-1"></i> Nueva Venta
      </button>
    </div>

    <!-- Filtro -->
    <div class="mb-3">
      <input v-model="filter" type="text" class="form-control" placeholder="Filtrar por comprador o fecha..." 
             :disabled="saleStore.loading" />
    </div>

    <!-- Estado de carga -->
    <div v-if="saleStore.loading && !saleStore.sales.length" class="text-center my-4">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Cargando...</span>
      </div>
      <p class="mt-2">Cargando ventas...</p>
    </div>

    <!-- Mensaje de error -->
    <div v-else-if="saleStore.error" class="alert alert-danger">
      <i class="fa-solid fa-triangle-exclamation me-2"></i>
      Error al cargar ventas: {{ saleStore.error }}
      <button class="btn btn-sm btn-outline-danger ms-2" @click="loadSales">Reintentar</button>
    </div>

    <!-- Mensaje cuando no hay ventas -->
    <div v-else-if="!saleStore.sales.length" class="alert alert-info">
      <i class="fa-solid fa-circle-info me-2"></i>
      No se encontraron ventas registradas.
    </div>

    <!-- Tabla de ventas -->
    <div v-else class="table-responsive">
      <table class="table table-bordered table-hover mb-0">
        <thead class="table-light">
          <tr>
            <th width="120">Acciones</th>
            <th width="80">ID</th>
            <th>Comprador</th>
            <th width="120">Fecha</th>
            <th>Productos</th>
            <th width="120">Total</th>
            <th width="120">Estado</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="sale in filteredSales" :key="sale.id">
            <td>
              <div class="d-flex flex-wrap">
                <button class="btn btn-sm btn-outline-primary me-1 mb-1" @click="openDialog('view', sale)" :disabled="saleStore.loading">
                  <i class="fa-solid fa-eye"></i>
                </button>
                <button v-if="sale.status !== 'canceled'" class="btn btn-sm btn-outline-success me-1 mb-1" 
                        @click="openDialog('edit', sale)" :disabled="saleStore.loading">
                  <i class="fa-solid fa-pen-to-square"></i>
                </button>
                <button v-if="sale.status !== 'canceled'" class="btn btn-sm btn-outline-secondary me-1 mb-1" 
                        @click="confirmCancelSale(sale)" :disabled="saleStore.loading">
                  <i class="fa-solid fa-trash"></i>
                </button>
                <button class="btn btn-sm btn-outline-info me-1 mb-1" @click="generateInvoice(sale)" 
                        :disabled="sale.status === 'canceled' || saleStore.loading">
                  <i class="fa-solid fa-file-invoice"></i>
                </button>
              </div>
            </td>
            <td>{{ sale.id }}</td>
            <td>{{ getBuyerName(sale.buyer_id) }}</td>
            <td>{{ formatDate(sale.date) }}</td>
            <td>
              <ul class="mb-0 ps-3 small">
                <li v-for="item in sale.items" :key="item.cod">
                  {{ getProductName(item.cod) }} x{{ item.qty }} ({{ formatCurrency(item.unit_price) }})
                </li>
              </ul>
            </td>
            <td class="text-end">{{ formatCurrency(sale.total) }}</td>
            <td>
              <span :class="['badge', getStatusClass(sale.status)]">
                {{ getStatusText(sale.status) }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal para registrar/ver ventas -->
    <dialog ref="salesDialog" class="p-0 border-0 modal-large">
      <form @submit.prevent="saveSale" class="p-3">
        <h5 class="d-flex justify-content-between align-items-center">
          <span>{{ dialogTitle }}</span>
          <button type="button" class="btn-close" @click="closeDialog" aria-label="Close"></button>
        </h5>

        <div class="row g-2 mb-3">
          <div class="col-md-6">
            <label class="form-label">Comprador</label>
            <select v-model="form.buyer_id" class="form-select" :disabled="isViewing" required
                    :class="{ 'is-invalid': errors.buyer_id }">
              <option value="">Seleccione un comprador</option>
              <option v-for="buyer in buyerStore.buyers" :key="buyer.id" :value="buyer.id">
                {{ buyer.name }} ({{ buyer.company || 'Sin empresa' }}) - {{ buyer.tax_id}}
              </option>
            </select>
            <div class="invalid-feedback">{{ errors.buyer_id }}</div>
          </div>
          <div class="col-md-6">
            <label class="form-label">Fecha</label>
            <input v-model="form.date" type="date" class="form-control" :readonly="isViewing" required
                   :class="{ 'is-invalid': errors.date }" />
            <div class="invalid-feedback">{{ errors.date }}</div>
          </div>
        </div>

        <div class="mb-3">
          <label class="form-label">Productos</label>
          <div v-for="(item, index) in form.items" :key="index" class="d-flex align-items-center mb-2">
            <select v-model="item.cod" class="form-select me-2" :disabled="isViewing" required 
                    @change="updateProductPrice(index)"
                    :class="{ 'is-invalid': errors[`items-${index}-cod`] }">
              <option value="">Seleccione producto</option>
              <option v-for="product in availableProducts" :key="product.cod" :value="product.cod" 
                      :disabled="product.stock <= 0">
                {{ product.name }} ({{ product.cod }}) - Stock: {{ product.stock }} - Precio: {{ formatCurrency(product.price) }}
              </option>
            </select>
            <input v-model.number="item.qty" type="number" min="1" :max="getMaxQuantity(item.cod)" 
                   class="form-control me-2" style="width: 100px;" :readonly="isViewing" required
                   :class="{ 'is-invalid': errors[`items-${index}-qty`] }" />
            <span class="me-2">{{ formatCurrency(item.unit_price * item.qty) }}</span>
            <button v-if="!isViewing" type="button" class="btn btn-sm btn-outline-secondary" @click="removeItem(index)">
              <i class="fa-solid fa-trash"></i>
            </button>
            <div class="invalid-feedback">
              {{ errors[`items-${index}-cod`] || errors[`items-${index}-qty`] }}
            </div>
          </div>
          <button v-if="!isViewing" type="button" class="btn btn-sm btn-outline-secondary" @click="addItem">
            <i class="fa-solid fa-plus me-1"></i> Agregar Producto
          </button>
          <div v-if="errors.items" class="invalid-feedback d-block">{{ errors.items }}</div>
        </div>

        <div class="mb-3 p-2 bg-light rounded">
          <div class="d-flex justify-content-between fw-bold fs-5">
            <strong>Total:</strong>
            <span>{{ formatCurrency(computedTotal) }}</span>
          </div>
        </div>

        <div class="d-flex justify-content-end mt-3">
          <button type="button" class="btn btn-secondary me-2" @click="closeDialog" :disabled="isSaving">Cancelar</button>
          <button v-if="!isViewing" type="submit" class="btn btn-outline-primary" :disabled="isSaving || form.items.length === 0">
            <span v-if="isSaving" class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
            {{ form.id ? 'Actualizar' : 'Registrar' }} Venta
          </button>
        </div>
      </form>
    </dialog>

    <!-- Modal de confirmación para cancelar venta -->
    <dialog ref="confirmDialog" class="p-3 border-0">
      <h5 class="mb-3"><i class="fa-solid fa-triangle-exclamation text-warning me-2"></i>Confirmar cancelación</h5>
      <p>¿Está seguro de cancelar la venta #{{ saleToCancel?.id }}?</p>
      <div class="d-flex justify-content-end mt-3">
        <button type="button" class="btn btn-secondary me-2" @click="closeConfirmDialog" :disabled="isCanceling">
          Cancelar
        </button>
        <button type="button" class="btn btn-outline-secondary" @click="cancelSale" :disabled="isCanceling">
          <span v-if="isCanceling" class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
          Confirmar Cancelación
        </button>
      </div>
    </dialog>

    <!-- Modal de factura -->
    <dialog ref="invoiceDialog" class="p-0 border-0" style="max-width: 800px; width:100%; padding: 0;">
      <div class="p-3">
        <div class="d-flex justify-content-between align-items-center mb-3">
          <h5>Factura Legal</h5>
          <button type="button" class="btn-close" @click="closeInvoiceDialog" aria-label="Close"></button>
        </div>
        <div v-if="currentInvoice" class="invoice-container border p-3" id="invoice-container">
          <!-- Encabezado, datos cliente, productos, totales y leyenda se mantienen igual -->
          <div class="row mb-4">
            <div class="col-md-6">
              <h2 class="mb-1">{{ currentInvoice.companyInfo.name }}</h2>
              <p class="mb-1 small">{{ currentInvoice.companyInfo.address }}</p>
              <p class="mb-1 small">Tel: {{ currentInvoice.companyInfo.phone }}</p>
              <p class="mb-1 small">NIT: {{ currentInvoice.companyInfo.nit }}</p>
            </div>
            <div class="col-md-6 text-end">
              <h3 class="text-primary">FACTURA</h3>
              <p class="mb-1"><strong>N°:</strong> {{ currentInvoice.invoiceNumber }}</p>
              <p class="mb-1"><strong>Fecha:</strong> {{ currentInvoice.fechaEmision }}</p>
              <p class="mb-1"><strong>Autorización:</strong> {{ currentInvoice.companyInfo.numeroAutorizacion }}</p>
            </div>
          </div>
          <div class="row mb-4 border-top border-bottom py-2">
            <div class="col-md-6">
              <h6 class="mb-1"><strong>Señor(es):</strong> {{ currentInvoice.buyer.name }}</h6>
              <p class="mb-1 small"><strong>NIT/CI:</strong> {{ currentInvoice.buyer.tax_id }}</p>
            </div>
            <div class="col-md-6">
              <p class="mb-1 small"><strong>Actividad Económica:</strong> {{ currentInvoice.companyInfo.actividadEconomica }}</p>
            </div>
          </div>
          <table class="table table-bordered mb-4">
            <thead>
              <tr>
                <th width="60">Cant.</th>
                <th>Descripción</th>
                <th width="100">P. Unit.</th>
                <th width="120">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, index) in currentInvoice.items" :key="index">
                <td>{{ item.qty }}</td>
                <td>{{ getProductName(item.cod) }}</td>
                <td class="text-end">{{ formatCurrency(item.unit_price) }}</td>
                <td class="text-end">{{ formatCurrency(item.unit_price * item.qty) }}</td>
              </tr>
            </tbody>
            <tfoot>
              <tr>
                <td colspan="3" class="text-end"><strong>TOTAL Bs.</strong></td>
                <td class="text-end"><strong>{{ formatCurrency(currentInvoice.total) }}</strong></td>
              </tr>
            </tfoot>
          </table>
          <div class="row border-top pt-3">
            <div class="col-md-8">
              <p class="small">{{ currentInvoice.companyInfo.leyenda }}</p>
              <p class="small"><strong>Fecha Límite Emisión:</strong> {{ currentInvoice.companyInfo.fechaLimiteEmision }}</p>
            </div>
            <div class="col-md-4 text-center">
              <img :src="currentInvoice.codigoQR" alt="Código QR" class="img-fluid" style="max-width: 120px;">
              <p class="small mt-1">Código de Control: {{ currentInvoice.companyInfo.codigoControl }}</p>
            </div>
          </div>
          <div class="d-flex justify-content-between mt-4">
            <button class="btn btn-outline-secondary" @click="printInvoice">
              <i class="fa-solid fa-print me-1"></i> Imprimir
            </button>
            <button class="btn btn-primary" @click="downloadInvoice">
              <i class="fa-solid fa-download me-1"></i> Descargar PDF
            </button>
          </div>
        </div>
      </div>
    </dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { useSaleStore } from '../store/sale.store';
import { useBuyerStore } from '../store/buyer.store';
import { useProductoStore } from '../store/productos.store';
import html2pdf from 'html2pdf.js';

const saleStore = useSaleStore();
const buyerStore = useBuyerStore();
const productoStore = useProductoStore();

// Refs
const filter = ref('');
const salesDialog = ref(null);
const confirmDialog = ref(null);
const invoiceDialog = ref(null);

const dialogMode = ref('new');
const isSaving = ref(false);
const isCanceling = ref(false);
const saleToCancel = ref(null);
const currentInvoice = ref(null);

// Formulario
const form = reactive({ id: null, buyer_id: '', items: [], date: new Date().toISOString().slice(0, 10), total: 0, status: 'pending' });
const errors = reactive({});

// Computed
const availableProducts = computed(() => 
  productoStore.productos.filter(p => p.quantity > 0)
);

const filteredSales = computed(() => {
  const search = filter.value.toLowerCase();
  return saleStore.sales.filter(sale =>
    getBuyerName(sale.buyer_id).toLowerCase().includes(search) ||
    sale.date.includes(search) ||
    sale.id.toString().includes(search)
  ).sort((a, b) => new Date(b.date) - new Date(a.date));
});
const isViewing = computed(() => dialogMode.value === 'view');
const dialogTitle = computed(() => dialogMode.value === 'new' ? 'Registrar Nueva Venta' : dialogMode.value === 'edit' ? 'Editar Venta' : 'Detalle de Venta');
const computedSubtotal = computed(() => form.items.reduce((sum, item) => sum + (item.unit_price * item.qty), 0));
const computedTotal = computed(() => computedSubtotal.value);

// Métodos
function clearErrors() { Object.keys(errors).forEach(key => delete errors[key]); }

function validateForm() {
  clearErrors();
  let isValid = true;
  if (!form.buyer_id) { errors.buyer_id = 'Seleccione un comprador'; isValid = false; }
  if (!form.date) { errors.date = 'Seleccione una fecha'; isValid = false; }
  if (form.items.length === 0) { errors.items = 'Debe agregar al menos un producto'; isValid = false; }
  form.items.forEach((item, index) => {
    if (!item.cod) { errors[`items-${index}-cod`] = 'Seleccione un producto'; isValid = false; }
    if (!item.qty || item.qty <= 0) { errors[`items-${index}-qty`] = 'Cantidad inválida'; isValid = false; }
    else { 
      const product = productoStore.productos.find(p => p.cod === item.cod);
      if (product && product.stock < item.qty) { errors[`items-${index}-qty`] = `Stock insuficiente (${product.stock} disponibles)`; isValid = false; }
    }
  });
  return isValid;
}

function openDialog(mode, sale = null) {
  dialogMode.value = mode;
  if (sale) Object.assign(form, JSON.parse(JSON.stringify(sale)));
  else { resetForm(); addItem(); }
  salesDialog.value.showModal();
}

function closeDialog() { salesDialog.value.close(); }
function resetForm() { form.id = null; form.buyer_id = ''; form.items = []; form.date = new Date().toISOString().slice(0, 10); form.total = 0; form.status='pending'; clearErrors(); }
function addItem() { form.items.push({ cod: '', qty: 1, unit_price: 0 }); }
function removeItem(index) { form.items.splice(index,1); }
function getBuyerName(buyerId) { const buyer = buyerStore.getBuyerById(buyerId); return buyer ? `${buyer.name} (${buyer.company || 'Sin empresa'})` : 'Comprador no encontrado'; }

function getProductName(cod) { 
  const product = productoStore.productos.find(p => p.cod === cod); 
  return product ? product.name : 'Producto no encontrado'; 
}

function updateProductPrice(index) { 
  const product = productoStore.productos.find(p => p.cod === form.items[index].cod); 
  form.items[index].unit_price = product ? product.price : 0; 
}

function getMaxQuantity(cod) { 
  const product = productoStore.productos.find(p => p.cod === cod); 
  return product ? product.quantity : 0; 
}
function formatCurrency(value) { return new Intl.NumberFormat('es-BO', { style: 'currency', currency: 'BOB' }).format(value); }
function formatDate(dateString) { const date = new Date(dateString); if (isNaN(date.getTime())) return 'Fecha inválida'; const offset = date.getTimezoneOffset() + 240; const adjustedDate = new Date(date.getTime() + offset * 60000); const day = adjustedDate.getDate(); const month = adjustedDate.toLocaleString('es', { month: 'long' }); const year = adjustedDate.getFullYear(); return `${day} ${month} ${year}`; }
function getStatusClass(status) { return {'completed': 'bg-success','pending':'bg-warning text-dark','canceled':'bg-danger'}[status]||'bg-secondary'; }
function getStatusText(status) { return {'completed':'Completado','pending':'Pendiente','canceled':'Cancelado'}[status]||status; }
function confirmCancelSale(sale) { saleToCancel.value = sale; confirmDialog.value.showModal(); }
function closeConfirmDialog() { confirmDialog.value.close(); saleToCancel.value=null; }

async function cancelSale() {
  if(!saleToCancel.value) return;
  isCanceling.value = true;
  try { await saleStore.cancelSale(saleToCancel.value.id); closeConfirmDialog(); } 
  catch(error){ console.error(error); alert('Error al cancelar venta'); } 
  finally { isCanceling.value=false; }
}

async function saveSale() {
  if(!validateForm()) return;
  if(!confirm('¿Confirmar la venta?')) return;
  isSaving.value=true;
  try {
    form.total=computedTotal.value;
    form.status='completed';
    if(!form.id){
      await saleStore.addSale({...form});
      for(const item of form.items){
        const product = productoStore.productos.find(p=>p.cod===item.cod);
        if(product) await productoStore.updateProducto(product.id,{stock:product.stock-item.qty});
      }
    } else await saleStore.updateSale(form.id,{...form});
    closeDialog();
  } catch(error){ console.error(error); alert('Ocurrió un error al guardar la venta'); }
  finally{ isSaving.value=false; }
}

async function loadSales() { try{ await Promise.all([saleStore.fetchSales(), buyerStore.fetchBuyers(), productoStore.fetchProductos()]); } catch(error){ console.error(error); } }

const generateInvoice=async(sale)=>{ try{ currentInvoice.value = await saleStore.generateInvoice(sale.id); invoiceDialog.value.showModal(); } catch(error){ console.error(error); alert('Ocurrió un error al generar la factura'); } };
const closeInvoiceDialog = ()=>invoiceDialog.value.close();

const printInvoice = async () => {
  const invoiceElement = document.getElementById('invoice-container');
  invoiceElement.querySelectorAll('button').forEach(btn=>btn.style.display='none');
  const printWindow = window.open('', '_blank');
  printWindow.document.write(`<html><head><title>Factura</title></head><body>${invoiceElement.innerHTML}</body></html>`);
  printWindow.document.close();
  printWindow.onload=()=>{ setTimeout(()=>printWindow.print(),500); };
};

const downloadInvoice = async () => {
  try{
    const element=document.getElementById('invoice-container');
    if(!element) throw new Error('Contenedor no encontrado');
    element.querySelectorAll('button').forEach(btn=>btn.style.display='none');
    const opt={margin:[10,10,10,10],filename:`FACTURA_${currentInvoice.value.invoiceNumber}.pdf`,image:{type:'jpeg',quality:0.98},html2canvas:{scale:2,dpi:192,letterRendering:true},jsPDF:{unit:'mm',format:'a4',orientation:'portrait'},pagebreak:{mode:['css','avoid-all']}};
    await html2pdf().set(opt).from(element).save();
  } catch(error){ console.error(error); alert('Error al generar PDF: '+error.message); }
};

onMounted(()=>{ loadSales(); buyerStore.fetchBuyers(); productoStore.fetchProductos(); });
</script>

<style scoped>
.table-responsive{ overflow-x:auto; min-height:300px; }
dialog{ border:none; border-radius:8px; }
dialog::backdrop{ background:rgba(0,0,0,0.5); }
.badge{ font-size:.85em; padding:.35em .65em; }
.btn-sm{ padding:.25rem .5rem; font-size:.875rem; }
ul{ list-style-type:none; padding-left:0; }
ul li{ position:relative; padding-left:1.5em; }
ul li:before{ content:"•"; position:absolute; left:0; color:#6c757d; }
.is-invalid{ border-color:#dc3545; }
.invalid-feedback{ color:#dc3545; font-size:.875em; }
.spinner-border{ width:1rem; height:1rem; border-width:.15em; }
.btn-close{ font-size:.75rem; }
.invoice-container{ font-family:Arial,sans-serif; background:white; max-width:800px; margin:0 auto; padding:20px; box-shadow:0 0 10px rgba(0,0,0,.1); }
.modal-large{ width:90%; max-width:1200px; height:90vh; overflow-y:auto; border-radius:8px; padding:20px; }
@media print{ body *{ visibility:hidden; } .invoice-container, .invoice-container *{ visibility:visible; } .invoice-container{ position:absolute; left:0; top:0; width:100%; padding:0; margin:0; box-shadow:none; } .no-print, .no-print *{ display:none !important; } }
</style>
