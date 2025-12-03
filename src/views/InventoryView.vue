<template>
  <div class="container py-4">
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h2>Productos Terminados</h2>
      <button class="btn btn-success" @click="openDialog('new')" :disabled="productoStore.loading">
        <i class="fa-solid fa-plus"></i> Nuevo Producto
      </button>
    </div>

    <div class="mb-3">
      <input v-model="filter" type="text" class="form-control" placeholder="Filtrar por nombre o código..." 
             :disabled="productoStore.loading" />
    </div>

    <!-- Estado de carga -->
    <div v-if="productoStore.loading && !productoStore.productos.length" class="text-center my-4">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Cargando...</span>
      </div>
      <p class="mt-2">Cargando productos...</p>
    </div>

    <!-- Mensaje de error -->
    <div v-else-if="productoStore.error" class="alert alert-danger">
      <i class="fa-solid fa-triangle-exclamation me-2"></i>
      Error al cargar productos: {{ productoStore.error }}
      <button class="btn btn-sm btn-outline-danger ms-2" @click="loadProductos">
        Reintentar
      </button>
    </div>

    <!-- Mensaje cuando no hay productos -->
    <div v-else-if="!productoStore.productos.length" class="alert alert-info">
      <i class="fa-solid fa-circle-info me-2"></i>
      No se encontraron productos registrados.
    </div>

    <!-- Tabla de productos -->
    <div v-else class="table-responsive">
      <table class="table table-bordered table-hover mb-0">
        <thead class="table-light">
          <tr>
            <th width="120">Acciones</th>
            <th width="100">Código</th>
            <th>Nombre</th>
            <th width="120">Costo</th>
            <th width="120">Stock</th>
            <th>Materiales</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="producto in filteredProducts" :key="producto.id">
            <td>
              <div class="d-flex align-items-center">
                <button class="btn btn-sm btn-outline-primary me-1" @click="openDialog('view', producto)"
                        :disabled="productoStore.loading">
                  <i class="fa-solid fa-eye"></i>
                </button>
                <button class="btn btn-sm btn-outline-success me-1" @click="openDialog('edit', producto)"
                        :disabled="productoStore.loading">
                  <i class="fa-solid fa-pen-to-square"></i>
                </button>
                <button class="btn btn-sm btn-outline-secondary me-2" @click="confirmDelete(producto)"
                        :disabled="productoStore.loading">
                  <i class="fa-solid fa-trash"></i>
                </button>
                <span v-if="isLowStock(producto)" 
                      class="blinking-icon" 
                      data-bs-toggle="tooltip" 
                      data-bs-placement="top"
                      :data-bs-title="`Stock bajo! Mínimo requerido: ${minStockThreshold}`">
                  <i class="fa-solid fa-triangle-exclamation text-danger fa-lg"></i>
                </span>
              </div>
            </td>
            <td>{{ producto.cod }}</td>
            <td>{{ producto.name }}</td>
            <td class="text-end">{{ formatCurrency(producto.unit_cost) }}</td>
            <td class="text-end" :class="{ 'text-danger': isLowStock(producto) }">
              {{ producto.stock }}
            </td>
            <td>{{ formatBOM(producto.bom) }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal para CRUD -->
    <dialog ref="productDialog" class="p-0 border-0">
      <form @submit.prevent="saveProduct" class="p-3">
        <h5 class="d-flex justify-content-between align-items-center">
          <span>{{ dialogTitle }}</span>
          <button type="button" class="btn-close" @click="closeDialog" aria-label="Close"></button>
        </h5>

        <div class="row g-2 mb-2">
          <div class="col-md-6">
            <label class="form-label">Código</label>
            <input v-model="form.cod" type="text" class="form-control" :readonly="isViewing" required
                   :class="{ 'is-invalid': errors.cod }" />
            <div class="invalid-feedback">{{ errors.cod }}</div>
          </div>
          <div class="col-md-6">
            <label class="form-label">Nombre</label>
            <input v-model="form.name" type="text" class="form-control" :readonly="isViewing" required
                   :class="{ 'is-invalid': errors.name }" />
            <div class="invalid-feedback">{{ errors.name }}</div>
          </div>
        </div>

        <div class="row g-2 mb-2">
          <div class="col-md-6">
            <label class="form-label">Costo unitario (Bs)</label>
            <input v-model.number="form.unit_cost" type="number" step="0.01" min="0" class="form-control" 
                   :readonly="isViewing" required :class="{ 'is-invalid': errors.unit_cost }" />
            <div class="invalid-feedback">{{ errors.unit_cost }}</div>
          </div>
          <div class="col-md-6">
            <label class="form-label">Stock</label>
            <input v-model.number="form.stock" type="number" step="1" min="0" class="form-control" 
                   :readonly="isViewing" required :class="{ 'is-invalid': errors.stock }" />
            <div class="invalid-feedback">{{ errors.stock }}</div>
          </div>
        </div>

        <div class="mb-3">
          <label class="form-label">Lista de Materiales (BOM)</label>
          <div v-for="(item, index) in form.bom" :key="index" class="d-flex align-items-center mb-2">
            <select v-model="item.cod" class="form-select me-2" :disabled="isViewing" required
                    :class="{ 'is-invalid': errors[`bom-${index}-cod`] }">
              <option value="">Seleccionar material</option>
              <option v-for="material in materialStore.materiales" :key="material.cod" :value="material.cod"
                      :disabled="material.stock <= 0">
                {{ material.name }} ({{ material.cod }}) - Stock: {{ material.stock }}
              </option>
            </select>
            <input v-model.number="item.qty" type="number" min="1" step="1" class="form-control me-2" 
                   style="width: 100px;" :readonly="isViewing" required
                   :class="{ 'is-invalid': errors[`bom-${index}-qty`] }" />
            <button v-if="!isViewing" type="button" class="btn btn-sm btn-outline-secondary" @click="removeBomItem(index)">
              <i class="fa-solid fa-trash"></i>
            </button>
            <div class="invalid-feedback">{{ errors[`bom-${index}-cod`] || errors[`bom-${index}-qty`] }}</div>
          </div>
          <button v-if="!isViewing" type="button" class="btn btn-sm btn-outline-secondary" @click="addBomItem">
            <i class="fa-solid fa-plus me-2"></i>Agregar Material
          </button>
        </div>

        <div class="d-flex justify-content-end mt-3">
          <button type="button" class="btn btn-secondary me-2" @click="closeDialog" :disabled="isSaving">
            Cancelar
          </button>
          <button v-if="!isViewing" type="submit" class="btn btn-outline-primary" :disabled="isSaving">
            <span v-if="isSaving" class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
            {{ form.id ? 'Actualizar' : 'Guardar' }}
          </button>
        </div>
      </form>
    </dialog>

    <!-- Modal de confirmación para eliminar -->
    <dialog ref="confirmDialog" class="p-3 border-0">
      <h5 class="mb-3"><i class="fa-solid fa-triangle-exclamation text-warning me-2"></i>Confirmar eliminación</h5>
      <p>¿Está seguro de eliminar el producto <strong>{{ productToDelete?.name }}</strong> ({{ productToDelete?.cod }})?</p>
      <div class="d-flex justify-content-end mt-3">
        <button type="button" class="btn btn-secondary me-2" @click="closeConfirmDialog" :disabled="isDeleting">
          Cancelar
        </button>
        <button type="button" class="btn btn-outline-secondary" @click="deleteProduct" :disabled="isDeleting">
          <span v-if="isDeleting" class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
          Eliminar
        </button>
      </div>
    </dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, nextTick } from 'vue';
import { useProductoStore } from '../store/productos.store';
import { useMaterialStore } from '../store/material.store';
import { Tooltip } from 'bootstrap';

const props = defineProps({
  isAdmin: {
    type: Boolean,
    default: false
  }
});

const productoStore = useProductoStore();
const materialStore = useMaterialStore();

// Refs
const filter = ref('');
const productDialog = ref(null);
const confirmDialog = ref(null);
const dialogMode = ref('new');
const minStockThreshold = 10;
const isSaving = ref(false);
const isDeleting = ref(false);
const productToDelete = ref(null);

// Formulario y validación
const form = reactive({
  id: null,
  cod: '',
  name: '',
  unit_cost: 0,
  stock: 0,
  bom: []
});

const errors = reactive({});

// Computed
const filteredProducts = computed(() => {
  const searchTerm = filter.value.toLowerCase();
  return productoStore.productos.filter(p => 
    p.name.toLowerCase().includes(searchTerm) || 
    p.cod.toLowerCase().includes(searchTerm)
  ).sort((a, b) => a.name.localeCompare(b.name));
});

const dialogTitle = computed(() => {
  switch(dialogMode.value) {
    case 'new': return 'Nuevo Producto';
    case 'edit': return 'Editar Producto';
    case 'view': return 'Ver Producto';
    default: return 'Producto';
  }
});

const isViewing = computed(() => dialogMode.value === 'view');

// Métodos
function formatCurrency(value) {
  return new Intl.NumberFormat('es-BO', { 
    style: 'currency', 
    currency: 'BOB' 
  }).format(value);
}

function formatBOM(bom) {
  return bom?.map(item => {
    const material = materialStore.materiales.find(m => m.cod === item.cod);
    return `${material?.name || item.cod} (${item.qty})`;
  }).join(', ') || 'Sin materiales';
}

function isLowStock(product) {
  return product.stock < minStockThreshold;
}

function clearErrors() {
  Object.keys(errors).forEach(key => delete errors[key]);
}

function validateForm() {
  clearErrors();
  let isValid = true;

  if (!form.cod.trim()) {
    errors.cod = 'El código es requerido';
    isValid = false;
  }

  if (!form.name.trim()) {
    errors.name = 'El nombre es requerido';
    isValid = false;
  }

  if (form.unit_cost <= 0) {
    errors.unit_cost = 'El costo debe ser mayor a 0';
    isValid = false;
  }

  if (form.stock < 0) {
    errors.stock = 'El stock no puede ser negativo';
    isValid = false;
  }

  // Validar BOM
  form.bom.forEach((item, index) => {
    if (!item.cod) {
      errors[`bom-${index}-cod`] = 'Seleccione un material';
      isValid = false;
    }

    if (!item.qty || item.qty <= 0) {
      errors[`bom-${index}-qty`] = 'Cantidad inválida';
      isValid = false;
    } else {
      const material = materialStore.materiales.find(m => m.cod === item.cod);
      if (material && material.stock < item.qty * form.stock) {
        errors[`bom-${index}-qty`] = `Stock insuficiente (${material.stock} disponibles)`;
        isValid = false;
      }
    }
  });

  if (form.bom.length === 0) {
    errors.bom = 'Debe agregar al menos un material';
    isValid = false;
  }

  return isValid;
}

function openDialog(mode, product = null) {
  dialogMode.value = mode;
  
  if (product) {
    Object.assign(form, JSON.parse(JSON.stringify(product)));
  } else {
    resetForm();
    addBomItem();
    // Generar código sugerido
    if (productoStore.productos.length > 0) {
      const lastCode = productoStore.productos[productoStore.productos.length - 1].cod;
      const match = lastCode.match(/(\d+)$/);
      if (match) {
        const nextNum = parseInt(match[1]) + 1;
        form.cod = `PROD-${nextNum.toString().padStart(3, '0')}`;
      }
    } else {
      form.cod = 'PROD-001';
    }
  }
  
  productDialog.value.showModal();
}

function closeDialog() {
  productDialog.value.close();
  resetForm();
}

function resetForm() {
  form.id = null;
  form.cod = '';
  form.name = '';
  form.unit_cost = 0;
  form.stock = 0;
  form.bom = [];
  clearErrors();
}

function addBomItem() {
  form.bom.push({ cod: '', qty: 1 });
}

function removeBomItem(index) {
  form.bom.splice(index, 1);
}

async function saveProduct() {
  if (!validateForm()) return;

  isSaving.value = true;
  try {
    if (dialogMode.value === 'new') {
      await productoStore.addProducto({...form});
    } else {
      await productoStore.updateProducto(form.id, {...form});
    }
    closeDialog();
  } catch (error) {
    console.error('Error al guardar producto:', error);
    if (error.response && error.response.data) {
      alert(`Error: ${error.response.data.message}`);
    } else {
      alert('Ocurrió un error al guardar el producto');
    }
  } finally {
    isSaving.value = false;
  }
}

function confirmDelete(product) {
  productToDelete.value = product;
  confirmDialog.value.showModal();
}

function closeConfirmDialog() {
  confirmDialog.value.close();
  productToDelete.value = null;
}

async function deleteProduct() {
  if (!productToDelete.value) return;

  isDeleting.value = true;
  try {
    await productoStore.deleteProducto(productToDelete.value.id);
    closeConfirmDialog();
  } catch (error) {
    console.error('Error al eliminar producto:', error);
    alert('Ocurrió un error al eliminar el producto');
  } finally {
    isDeleting.value = false;
  }
}

async function loadProductos() {
  try {
    await Promise.all([
      productoStore.fetchProductos(),
      materialStore.fetchMateriales()
    ]);
  } catch (error) {
    console.error('Error al cargar datos:', error);
  }
}

// Inicialización
onMounted(async () => {
  await loadProductos();
  
  nextTick(() => {
    document.querySelectorAll('[data-bs-toggle="tooltip"]').forEach(el => {
      new Tooltip(el);
    });
  });
});
</script>

<style scoped>
.table-responsive {
  overflow-x: auto;
  min-height: 300px;
}

.blinking-icon {
  animation: blink 1.5s infinite;
}

@keyframes blink {
  0% { opacity: 1; }
  50% { opacity: 0.3; }
  100% { opacity: 1; }
}

dialog {
  width: 90%;
  max-width: 800px;
  border-radius: 8px;
  border: none;
}

dialog::backdrop {
  background-color: rgba(0, 0, 0, 0.5);
}

.btn-sm {
  padding: 0.25rem 0.5rem;
  font-size: 0.875rem;
}

.spinner-border {
  width: 1rem;
  height: 1rem;
  border-width: 0.15em;
}

.btn-close {
  font-size: 0.75rem;
}

.is-invalid {
  border-color: #dc3545;
}

.invalid-feedback {
  color: #dc3545;
  font-size: 0.875em;
}
</style>