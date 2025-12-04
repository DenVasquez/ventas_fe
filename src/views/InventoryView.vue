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
            <th width="120">Costo Fabricación</th>
            <th width="120">Precio Venta</th>
            <th>Materiales</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="producto in filteredProducts" :key="producto.id_producto">
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
              </div>
            </td>
            <td>{{ producto.codigo }}</td>
            <td>{{ producto.nombre_producto }}</td>
            <td class="text-end">{{ formatCurrency(producto.costo_fabricacion) }}</td>
            <td class="text-end">{{ formatCurrency(producto.precio_venta) }}</td>
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
            <label class="form-label">Nombre Producto</label>
            <input v-model="form.name" type="text" class="form-control" :readonly="isViewing" required
                   :class="{ 'is-invalid': errors.name }" />
            <div class="invalid-feedback">{{ errors.name }}</div>
          </div>
        </div>

        <div class="row g-2 mb-2">
          <div class="col-md-6">
            <label class="form-label">Cantidad a producir</label>
            <input v-model.number="form.cantidadProduccion" type="number" step="1" min="1" class="form-control"
                   :readonly="isViewing" required :class="{ 'is-invalid': errors.cantidadProduccion }" />
            <div class="invalid-feedback">{{ errors.cantidadProduccion }}</div>
          </div>
          <div class="col-md-6">
            <label class="form-label">Porcentaje de redito (%)</label>
            <input v-model.number="form.porcentajeRedito" type="number" step="1" min="0" max="100" class="form-control"
                   :readonly="isViewing" required :class="{ 'is-invalid': errors.porcentajeRedito }" />
            <div class="invalid-feedback">{{ errors.porcentajeRedito }}</div>
          </div>
        </div>

        <div class="mb-3">
          <label class="form-label">Lista de Materiales (BOM)</label>
          <div v-for="(item, index) in form.bom" :key="index" class="d-flex align-items-center mb-2">
            <select v-model="item.cod_material" class="form-select me-2" :disabled="isViewing" required
                    :class="{ 'is-invalid': errors[`bom-${index}-cod`] }">
              <option value="">Seleccionar material</option>
              <option v-for="material in materialStore.materiales" :key="material.id" :value="material.id">
                {{ material.name }} ({{ material.cod }}) - Stock: {{ material.stock }}
              </option>
            </select>
            <input v-model.number="item.cantidad" type="number" min="1" step="1" class="form-control me-2"
                   style="width: 100px;" :readonly="isViewing" required
                   :class="{ 'is-invalid': errors[`bom-${index}-cantidad`] }" />
            <button v-if="!isViewing" type="button" class="btn btn-sm btn-outline-secondary" @click="removeBomItem(index)">
              <i class="fa-solid fa-trash"></i>
            </button>
            <div class="invalid-feedback">{{ errors[`bom-${index}-cod`] || errors[`bom-${index}-cantidad`] }}</div>
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

const productoStore = useProductoStore();
const materialStore = useMaterialStore();

const filter = ref('');
const productDialog = ref(null);
const confirmDialog = ref(null);
const dialogMode = ref('new');
const isSaving = ref(false);
const isDeleting = ref(false);
const productToDelete = ref(null);

const form = reactive({
  id: null,
  cod: '',
  name: '',
  cantidadProduccion: 1,
  porcentajeRedito: 30, // ahora es % entero
  bom: []
});

const errors = reactive({});

const filteredProducts = computed(() => {
  const searchTerm = filter?.value?.toLowerCase();
  return productoStore.productos.filter(p =>
    p?.nombre_producto?.toLowerCase().includes(searchTerm) ||
    p?.codigo?.toLowerCase().includes(searchTerm)
  ).sort((a, b) => a?.nombre_producto?.localeCompare(b.nombre_producto));
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

function formatCurrency(value) {
  return new Intl.NumberFormat('es-BO', { style: 'currency', currency: 'BOB' }).format(value);
}

function formatBOM(bom) {
  return bom?.map(item => {
    const material = materialStore.materiales.find(m => m.id === item.cod_material);
    return `${material?.name || item.cod_material} (${item.cantidad})`;
  }).join(', ') || 'Sin materiales';
}

function clearErrors() { Object.keys(errors).forEach(key => delete errors[key]); }

function validateForm() {
  clearErrors();
  let isValid = true;

  if (!form.cod.trim()) { errors.cod = 'El código es requerido'; isValid = false; }
  if (!form.name.trim()) { errors.name = 'El nombre es requerido'; isValid = false; }
  if (form.porcentajeRedito < 0 || form.porcentajeRedito > 100) { errors.porcentajeRedito = 'Debe estar entre 0 y 100'; isValid = false; }
  if (form.cantidadProduccion < 1) { errors.cantidadProduccion = 'Cantidad mínima 1'; isValid = false; }

  form.bom.forEach((item, index) => {
    if (!item.cod_material) { errors[`bom-${index}-cod`] = 'Seleccione un material'; isValid = false; }
    if (!item.cantidad || item.cantidad < 1) { errors[`bom-${index}-cantidad`] = 'Cantidad inválida'; isValid = false; }
    else {
      const material = materialStore.materiales.find(m => m.id_material === item.cod_material);
      if (material && (item.cantidad * form.cantidadProduccion) > material.stock) {
        errors[`bom-${index}-cantidad`] = `Stock insuficiente (${material.stock} disponibles)`;
        isValid = false;
      }
    }
  });

  if (form.bom.length === 0) { errors.bom = 'Debe agregar al menos un material'; isValid = false; }

  return isValid;
}

function openDialog(mode, product = null) {
  dialogMode.value = mode;

  if (product) {
    form.id = product.id_producto;
    form.cod = product.codigo;
    form.name = product.nombre_producto;
    form.porcentajeRedito = Math.round((product.utilidad / product.costo_fabricacion) * 100);
    form.cantidadProduccion = 1;
    form.bom = JSON.parse(JSON.stringify(product.bom || []));
  } else {
    form.id = null;
    form.cod = `PROD-${(productoStore.productos.length + 1).toString().padStart(3, '0')}`;
    form.name = '';
    form.porcentajeRedito = 30;
    form.cantidadProduccion = 1;
    form.bom = [];
    addBomItem();
  }

  // Cargar materiales si no lo ha hecho
  if (!materialStore.materiales.length) materialStore.fetchMateriales();

  productDialog.value.showModal();
}

function closeDialog() { productDialog.value.close(); resetForm(); }
function resetForm() { form.id = null; form.cod = ''; form.name = ''; form.porcentajeRedito = 30; form.cantidadProduccion = 1; form.bom = []; clearErrors(); }
function addBomItem() { form.bom.push({ cod_material: '', cantidad: 1 }); }
function removeBomItem(index) { form.bom.splice(index, 1); }

async function saveProduct() {
  if (!validateForm()) return;
  isSaving.value = true;

  try {
    const payload = {
      nombre_producto: form.name,
      codigo: form.cod,
      porcentajeRedito: form.porcentajeRedito / 100, // enviar decimal al backend
      bom: form.bom.map(i => ({
        cod_material: i.cod_material,
        cantidad: i.cantidad * form.cantidadProduccion
      }))
    };
    // Solo creación por ahora
    console.log("payload", payload);
    await productoStore.addProducto(payload);

    closeDialog();
  } catch (error) {
    console.error('Error al guardar producto:', error);
    alert(error?.response?.data?.message || 'Ocurrió un error al guardar el producto');
  } finally {
    isSaving.value = false;
  }
}


function confirmDelete(product) { productToDelete.value = product; confirmDialog.value.showModal(); }
function closeConfirmDialog() { confirmDialog.value.close(); productToDelete.value = null; }

async function deleteProduct() {
  if (!productToDelete.value) return;
  isDeleting.value = true;
  try { await productoStore.deleteProducto(productToDelete.value.id_producto); closeConfirmDialog(); }
  catch (error) { console.error('Error al eliminar producto:', error); alert('Ocurrió un error al eliminar el producto'); }
  finally { isDeleting.value = false; }
}

async function loadProductos() {
  try { await Promise.all([productoStore.fetchProductos(), materialStore.fetchMateriales()]); }
  catch (error) { console.error('Error al cargar datos:', error); }
}

onMounted(async () => {
  await loadProductos();
  nextTick(() => { document.querySelectorAll('[data-bs-toggle="tooltip"]').forEach(el => new Tooltip(el)); });
});
</script>

<style scoped>
.table-responsive { overflow-x: auto; min-height: 300px; }
dialog { width: 90%; max-width: 800px; border-radius: 8px; border: none; }
dialog::backdrop { background-color: rgba(0, 0, 0, 0.5); }
.blinking-icon { animation: blink 1.5s infinite; }
@keyframes blink { 0% { opacity: 1; } 50% { opacity: 0.3; } 100% { opacity: 1; } }
.btn-sm { padding: 0.25rem 0.5rem; font-size: 0.875rem; }
.spinner-border { width: 1rem; height: 1rem; border-width: 0.15em; }
.btn-close { font-size: 0.75rem; }
.is-invalid { border-color: #dc3545; }
.invalid-feedback { color: #dc3545; font-size: 0.875em; }
</style>
