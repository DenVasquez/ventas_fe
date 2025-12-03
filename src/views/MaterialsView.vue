<template>
  <div class="container py-4">
    <h2 class="mb-4">Gestión de Materiales</h2>

    <!-- Buscar -->
    <div class="input-group mb-3">
      <span class="input-group-text"><i class="fa fa-search"></i></span>
      <input
        class="form-control"
        placeholder="Buscar por nombre, código o unidad..."
        v-model="filter"
      />
    </div>

    <!-- Botón Nuevo -->
    <button class="btn btn-success mb-3" @click="openDialog('new')">
      <i class="fa-solid fa-plus"></i> Nuevo Material
    </button>

    <!-- Tabla -->
    <div class="table-responsive">
      <table class="table table-bordered table-hover mb-0">
        <thead class="table-light">
          <tr>
            <th>Acciones</th>
            <th>Código</th>
            <th>Nombre</th>
            <th>Costo</th>
            <th>Cantidad</th>
            <th>Unidad</th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="m in materialStore.materiales" :key="m.id">
            <td>
              <button
                class="btn btn-sm btn-outline-success me-1"
                @click="openDialog('edit', m)"
              >
                <i class="fa-solid fa-pen-to-square"></i>
              </button>

              <button
                class="btn btn-sm btn-outline-danger"
                @click="confirmDelete(m.id)"
              >
                <i class="fa-solid fa-trash"></i>
              </button>
            </td>

            <td>{{ m.cod }}</td>
            <td>{{ m.name }}</td>
            <td>{{ m.unit_cost }} Bs</td>
            <td>{{ m.stock }}</td>
            <td>{{ m.unit }}</td>
          </tr>

          <tr v-if="materialStore.materiales.length === 0">
            <td colspan="6" class="text-center text-muted py-3">
              No hay materiales registrados
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- PAGINACIÓN -->
    <nav class="mt-3" v-if="materialStore.totalPages > 1">
      <ul class="pagination justify-content-center">
        <li class="page-item" :class="{ disabled: materialStore.page === 1 }">
          <button class="page-link" @click="changePage(materialStore.page - 1)">
            «
          </button>
        </li>

        <li
          v-for="p in materialStore.totalPages"
          :key="p"
          class="page-item"
          :class="{ active: p === materialStore.page }"
        >
          <button class="page-link" @click="changePage(p)">{{ p }}</button>
        </li>

        <li
          class="page-item"
          :class="{ disabled: materialStore.page === materialStore.totalPages }"
        >
          <button class="page-link" @click="changePage(materialStore.page + 1)">
            »
          </button>
        </li>
      </ul>
    </nav>

    <!-- DIALOG -->
    <dialog ref="dialogRef" class="p-0 border-0">
      <form @submit.prevent="saveMaterial" class="p-3">
        <h5>{{ dialogTitle }}</h5>

        <div class="mb-2">
          <label>Código</label>
          <input v-model="form.cod" type="text" class="form-control" required />
        </div>

        <div class="mb-2">
          <label>Nombre Material</label>
          <input v-model="form.name" type="text" class="form-control" required />
        </div>

        <div class="mb-2">
          <label>Costo Unitario</label>
          <input
            v-model="form.unit_cost"
            type="number"
            class="form-control"
            step="0.01"
            min="0"
            required
          />
        </div>

        <div class="mb-2">
          <label>Cantidad</label>
          <input
            v-model="form.stock"
            type="number"
            class="form-control"
            min="0"
            required
          />
        </div>

        <!-- NUEVA UNIDAD -->
        <div class="mb-3">
          <label>Unidad</label>
          <select v-model="form.unit" class="form-select" required>
            <option disabled value="">Seleccione una unidad</option>
            <option v-for="u in unidades" :key="u" :value="u">
              {{ u }}
            </option>
          </select>
        </div>

        <div class="d-flex justify-content-end">
          <button type="button" class="btn btn-secondary me-2" @click="closeDialog">
            Cerrar
          </button>
          <button type="submit" class="btn btn-outline-primary">Guardar</button>
        </div>
      </form>
    </dialog>

    <AlertComponent ref="alertRef" />
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted } from "vue";
import { useMaterialStore } from "../store/material.store";
import AlertComponent from "../components/AppAlert.vue";

const materialStore = useMaterialStore();
const alertRef = ref(null);

const filter = ref("");
const dialogRef = ref(null);

const dialogMode = ref("new");
const dialogTitle = computed(() =>
  dialogMode.value === "new" ? "Nuevo Material" : "Editar Material"
);

// Lista estática de unidades para fabricación de muebles
const unidades = [
  "m",
  "cm",
  "mm",
  "m²",
  "m³",
  "pieza",
  "par",
  "kg",
  "lt",
  "bolsa",
];

const form = reactive({
  id: null,
  cod: "",
  name: "",
  unit_cost: 0,
  stock: 0,
  unit: "",
});

// ---------------------------
// ABRIR DIALOG
// ---------------------------
function openDialog(mode, material = null) {
  dialogMode.value = mode;

  if (material) {
    Object.assign(form, material);
  } else {
    Object.assign(form, {
      id: null,
      cod: "",
      name: "",
      unit_cost: 0,
      stock: 0,
      unit: "",
    });
  }

  dialogRef.value.showModal();
}

function closeDialog() {
  dialogRef.value.close();
}

// ---------------------------
// GUARDAR
// ---------------------------
async function saveMaterial() {
  try {
    if (dialogMode.value === "new") {
      await materialStore.addMaterial(form);
      alertRef.value.addAlert("Material creado correctamente", "success");
    } else {
      await materialStore.updateMaterial(form.id, form);
      alertRef.value.addAlert("Material actualizado", "success");
    }

    closeDialog();
  } catch (err) {
    alertRef.value.addAlert("Error al guardar", "error");
  }
}

// ---------------------------
// ELIMINAR
// ---------------------------
async function confirmDelete(id) {
  if (!confirm("¿Eliminar este material?")) return;

  try {
    await materialStore.deleteMaterial(id);
    alertRef.value.addAlert("Material eliminado", "success");
  } catch (err) {
    alertRef.value.addAlert("No se pudo eliminar", "error");
  }
}

function changePage(p) {
  materialStore.fetchMateriales(p);
}

watch(filter, () => {
  materialStore.search = filter.value;
  materialStore.fetchMateriales(1);
});

onMounted(() => {
  materialStore.fetchMateriales();
});
</script>

<style scoped>
dialog {
  max-width: 500px;
  width: 100%;
  border-radius: 10px;
}
dialog::backdrop {
  background: rgba(0, 0, 0, 0.4);
}
</style>
