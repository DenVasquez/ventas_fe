<template>
  <div class="container py-4">
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h2>Productos Terminados</h2>
      <button class="btn btn-success" @click="openDialog('new')" :disabled="productoStore.loading">
        <i class="fa-solid fa-plus"></i> Nuevo Producto
      </button>
    </div>

    <div class="mb-3">
      <input v-model="filter" type="text" class="form-control"
        placeholder="Filtrar por nombre o código..." :disabled="productoStore.loading" />
    </div>

    <!-- Loading -->
    <div v-if="productoStore.loading && !productoStore.productos.length" class="text-center my-4">
      <div class="spinner-border text-primary"></div>
      <p class="mt-2">Cargando productos...</p>
    </div>

    <!-- Error -->
    <div v-else-if="productoStore.error" class="alert alert-danger">
      Error: {{ productoStore.error }}
      <button class="btn btn-sm btn-outline-danger ms-2" @click="loadProductos">Reintentar</button>
    </div>

    <!-- Empty -->
    <div v-else-if="!productoStore.productos.length" class="alert alert-info">
      No se encontraron productos registrados.
    </div>

    <!-- Table -->
<div v-else class="table-responsive">
  <table class="table table-bordered table-hover mb-0">
    <thead class="table-light">
      <tr>
        <th width="120">Acciones</th>
        <th width="100">Código</th>
        <th>Nombre</th>
        <th width="120">Precio Venta</th>
        <th width="100">Cantidad</th>
        <th width="120">Costo Fabricación</th>
        <th>Materiales</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="producto in filteredProducts" :key="producto.id">
        <td>
          <button class="btn btn-sm btn-outline-primary me-1"
            @click="openDialog('view', producto)">
            <i class="fa-solid fa-eye"></i>
          </button>
          <button class="btn btn-sm btn-outline-success me-1"
            @click="openDialog('edit', producto)">
            <i class="fa-solid fa-pen-to-square"></i>
          </button>
          <button class="btn btn-sm btn-outline-secondary"
            @click="confirmDelete(producto)">
            <i class="fa-solid fa-trash"></i>
          </button>
        </td>
        <td>{{ producto.cod }}</td>
        <td>{{ producto.name }}</td>
        <td class="text-end">{{ formatCurrency(producto.price) }}</td>
        <td>{{ producto.quantity }}</td>
        <td class="text-end">{{ formatCurrency(producto.manufacturing_cost) }}</td>
        <td>
          <ul class="mb-0">
            <li v-for="mat in producto.bom" :key="mat.cod_material">
              {{ mat.nombre_material }} ({{ mat.cantidad }})
            </li>
          </ul>
        </td>
      </tr>
    </tbody>
  </table>
</div>


    <!-- Modal CRUD -->
    <dialog ref="productDialog" class="p-0 border-0">
      <form @submit.prevent="saveProduct" class="p-3">

        <h5 class="d-flex justify-content-between">
          <span>{{ dialogTitle }}</span>
          <button class="btn-close" type="button" @click="closeDialog"></button>
        </h5>

        <!-- Código / nombre / cantidad -->
        <div class="row g-2 mb-2">
          <div class="col-md-4">
            <label class="form-label">Código</label>
            <input v-model="form.cod" type="text" class="form-control"
              :readonly="isViewing" :class="{ 'is-invalid': errors.cod }" />
            <div class="invalid-feedback">{{ errors.cod }}</div>
          </div>

          <div class="col-md-4">
            <label class="form-label">Nombre</label>
            <input v-model="form.name" type="text" class="form-control"
              :readonly="isViewing" :class="{ 'is-invalid': errors.name }" />
            <div class="invalid-feedback">{{ errors.name }}</div>
          </div>

          <div class="col-md-4">
            <label class="form-label">Cantidad</label>
            <input v-model.number="form.cantidad" type="number" step="1" min="1"
              class="form-control" :readonly="isViewing"
              :class="{ 'is-invalid': errors.cantidad }" />
            <div class="invalid-feedback">{{ errors.cantidad }}</div>
          </div>
        </div>

        <!-- Porcentaje -->
        <div class="row g-2 mb-2">
          <div class="col-md-6">
            <label class="form-label">Porcentaje de redito (%)</label>
            <input v-model.number="form.porcentajeRedito" type="number" step="1" min="0" max="100"
              class="form-control" :readonly="isViewing"
              :class="{ 'is-invalid': errors.porcentajeRedito }" />
            <div class="invalid-feedback">{{ errors.porcentajeRedito }}</div>
          </div>
        </div>

        <!-- BOM -->
        <div class="mb-3">
          <label class="form-label">Lista de Materiales (BOM)</label>
          <div v-for="(item, index) in form.bom" :key="index" class="mb-3">
            <div class="d-flex align-items-center gap-2">
              <select v-model="item.cod_material" class="form-select me-2"
                :disabled="isViewing" style="min-width: 280px;"
                :class="{ 'is-invalid': errors[`bom-${index}-cod`] }">
                <option value="">Seleccionar material</option>
                <option v-for="m in materialStore.materiales" :key="m.id" :value="m.id">
                  {{ m.name }} ({{ m.cod }}) - Bs. {{ m.unit_cost }} | {{ m.stock }}
                </option>
              </select>

              <input
                v-model.number="item.cantidad"
                type="number"
                min="1"
                step="1"
                class="form-control me-2"
                style="width: 110px;"
                :readonly="isViewing"
                :class="{ 'is-invalid': errors[`bom-${index}-cantidad`] }"
              />
              <div class="me-2 text-center" style="min-width: 80px;">
                <small>Cantidad Total</small>
                <div >{{ item.cantidad*form.cantidad}}</div>               
              </div>
              <div class="me-2 text-center" style="min-width: 80px;">
                <small>Stock</small>
                <div >{{ getAvailableStock(item) }}</div>
              </div>

              <div class="me-2 text-end" style="min-width: 140px;">
                <small class="d-block">Subtotal por Unidad</small>
                <strong>{{ formatCurrency(rowSubtotal(item)) }}</strong>
              </div>

              <button v-if="!isViewing" class="btn btn-sm btn-outline-danger"
                type="button" @click="removeBomItem(index)">
                <i class="fa-solid fa-trash"></i>
              </button>
            </div>
          </div>

          <button v-if="!isViewing" type="button" class="btn btn-sm btn-outline-secondary"
            @click="addBomItem">
            <i class="fa-solid fa-plus me-1"></i>Agregar Material
          </button>
        </div>

        <!-- RESUMEN -->
        <div class="p-3 border rounded bg-light">
          <h6 class="mb-2">Resumen de Costos (por unidad)</h6>
          <div class="d-flex justify-content-between mb-1">
            <span>Costo total materiales</span>
            <strong>{{ formatCurrency(costoTotalMateriales) }}</strong>
          </div>
          <div class="d-flex justify-content-between mb-1">
            <span>Utilidad ({{ form.porcentajeRedito }}%)</span>
            <strong>{{ formatCurrency(utilidadCalculada) }}</strong>
          </div>
          <div class="d-flex justify-content-between">
            <span>Precio sugerido de venta</span>
            <strong class="text-primary">{{ formatCurrency(precioVentaCalculado) }}</strong>
          </div>
        </div>

        <!-- BOTONES -->
        <div class="d-flex justify-content-end mt-3">
          <button type="button" class="btn btn-secondary me-2" @click="closeDialog">
            Cancelar
          </button>
          <button v-if="!isViewing" type="submit" class="btn btn-outline-primary" :disabled="isSaving">
            <span v-if="isSaving" class="spinner-border spinner-border-sm me-1"></span>
            {{ form.id ? "Actualizar" : "Guardar" }}
          </button>
        </div>
      </form>
    </dialog>

    <!-- Confirmación -->
    <dialog ref="confirmDialog" class="p-3 border-0">
      <h5><i class="fa-solid fa-triangle-exclamation text-warning me-2"></i>
        Confirmar eliminación</h5>
      <p>¿Eliminar <strong>{{ productToDelete?.name }}</strong>?</p>

      <div class="d-flex justify-content-end mt-3">
        <button class="btn btn-secondary me-2" @click="closeConfirmDialog">Cancelar</button>
        <button class="btn btn-outline-danger" @click="deleteProduct">Eliminar</button>
      </div>
    </dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, nextTick } from "vue";
import { useProductoStore } from "../store/productos.store";
import { useMaterialStore } from "../store/material.store";
import { Tooltip } from "bootstrap";
import Swal from "sweetalert2";

const productoStore = useProductoStore();
const materialStore = useMaterialStore();

const filter = ref("");
const productDialog = ref(null);
const confirmDialog = ref(null);
const dialogMode = ref("new");
const isSaving = ref(false);
const isDeleting = ref(false);
const productToDelete = ref(null);

const form = reactive({
  id: null,
  cod: "",
  name: "",
  cantidad: 1,
  porcentajeRedito: 30,
  bom: [],
});

const errors = reactive({});

// =========================
// HELPERS
// =========================

function maxAllowed(item) {
  const material = materialStore.materiales.find(m => m.id === item.cod_material);
  if (!material) return 1;
  return Math.max(1, material.stock);
}

function getAvailableStock(item) {
  const material = materialStore.materiales.find(m => m.id === item.cod_material);
  if (!material) return 0;
  return Math.max(0, (material.stock - (item.cantidad*form.cantidad)));
}

function rowSubtotal(item) {
  const material = materialStore.materiales.find(m => m.id === item.cod_material);
  if (!material) return 0;
  return item.cantidad * Number(material.unit_cost || 0);
}

function updateStock(item) {
  const max = maxAllowed(item);
  if (item.cantidad > max) item.cantidad = max;
  if (item.cantidad < 1 || !item.cantidad) item.cantidad = 1;
}


function formatCurrency(v) {
  return new Intl.NumberFormat("es-BO", { style: "currency", currency: "BOB" }).format(v || 0);
}

const costoTotalMateriales = computed(() =>
  form.bom.reduce((acc, item) => acc + rowSubtotal(item), 0)
);

const utilidadCalculada = computed(() =>
  costoTotalMateriales.value * (form.porcentajeRedito / 100)
);

const precioVentaCalculado = computed(() =>
  costoTotalMateriales.value + utilidadCalculada.value
);

function addBomItem() { form.bom.push({ cod_material: "", cantidad: 1 }); }
function removeBomItem(i) { form.bom.splice(i, 1); }

// =========================
// VALIDACIÓN
// =========================
function clearErrors() { Object.keys(errors).forEach(k => delete errors[k]); }
function validateForm() {
  clearErrors();
  let valid = true;
  if (!form.cod.trim()) { errors.cod = "Código requerido"; valid = false; }
  if (!form.name.trim()) { errors.name = "Nombre requerido"; valid = false; }
  if (form.cantidad < 1) { errors.cantidad = "Debe ser >= 1"; valid = false; }
  if (form.porcentajeRedito < 0 || form.porcentajeRedito > 100) { errors.porcentajeRedito = "Entre 0 y 100"; valid = false; }

  if (!form.bom.length) { errors.bom = "Debe agregar al menos 1 material"; valid = false; }
  form.bom.forEach((item, idx) => {
    if (!item.cod_material) { errors[`bom-${idx}-cod`] = "Seleccione un material"; valid = false; }
    if (item.cantidad < 1 || item.cantidad > maxAllowed(item)) { errors[`bom-${idx}-cantidad`] = `Cantidad inválida`; valid = false; }
  });

  return valid;
}

// =========================
// CRUD
// =========================
function openDialog(mode, product = null) {
  dialogMode.value = mode;
  if (product) {
    form.id = product.id_producto;
    form.cod = product.codigo;
    form.name = product.nombre_producto;
    form.cantidad = product.cantidad || 1;
    const porcentaje = Math.round((product.utilidad / product.costo_fabricacion) * 100);
    form.porcentajeRedito = porcentaje || 30;
    form.bom = product.bom.map(b => ({ cod_material: b.cod_material, cantidad: b.cantidad }));
  } else {
    form.id = null;
    form.cod = `PROD-${(productoStore.productos.length + 1).toString().padStart(3, "0")}`;
    form.name = "";
    form.cantidad = 1;
    form.porcentajeRedito = 30;
    form.bom = [];
    addBomItem();
  }
  if (!materialStore.materiales.length) materialStore.fetchMateriales();
  productDialog.value.showModal();
}

function closeDialog() { productDialog.value.close(); }

async function saveProduct() {
  if (!validateForm()) return;

  isSaving.value = true;
  try {
    const payload = {
      cod: form.cod,
      nombre_producto: form.name,
      cantidad: form.cantidad,
      porcentajeRedito: form.porcentajeRedito,
      bom: form.bom.map(b => ({ cod_material: b.cod_material, cantidad: b.cantidad })),
    };

    await productoStore.addProducto(payload);
    await materialStore.fetchMateriales();

    closeDialog();

    // ✅ Mensaje de éxito
    Swal.fire({
      icon: 'success',
      title: 'Producto registrado',
      text: `El producto "${form.name}" se ha guardado correctamente`,
      timer: 5000,
      showConfirmButton: false
    });

  } catch (error) {
    // ❌ Mensaje de error
    Swal.fire({
      icon: 'error',
      title: 'Error al guardar',
      text: error?.response?.data?.message || 'Ocurrió un error al guardar el producto',
    });
  } finally {
    isSaving.value = false;
  }
}


function confirmDelete(product) { productToDelete.value = product; confirmDialog.value.showModal(); }
function closeConfirmDialog() { confirmDialog.value.close(); }
async function deleteProduct() { isDeleting.value = true; try { await productoStore.deleteProducto(productToDelete.value.id_producto); closeConfirmDialog(); } finally { isDeleting.value = false; } }

async function loadProductos() { await Promise.all([productoStore.fetchProductos(), materialStore.fetchMateriales()]); }

onMounted(async () => {
  await loadProductos();
  nextTick(() => {
    document.querySelectorAll("[data-bs-toggle='tooltip']").forEach(el => new Tooltip(el));
  });
});

const filteredProducts = computed(() => {
  if (!filter.value.trim()) return productoStore.productos;
  return productoStore.productos.filter(p =>
    p.nombre_producto.toLowerCase().includes(filter.value.toLowerCase()) ||
    p.codigo.toLowerCase().includes(filter.value.toLowerCase())
  );
});

const isViewing = computed(() => dialogMode.value === "view");
const dialogTitle = computed(() => dialogMode.value === "new" ? "Nuevo Producto" : dialogMode.value === "edit" ? "Editar Producto" : "Ver Producto");
</script>

<style scoped>
.table-responsive { overflow-x: auto; min-height: 300px; }
dialog { width: 90%; max-width: 900px; border-radius: 8px; border: none; }
dialog::backdrop { background-color: rgba(0, 0, 0, 0.4); }
</style>
