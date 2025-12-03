<template>
  <div class="container py-4">
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h2>Lista de Compradores</h2>
      <button v-if="isAdmin" class="btn btn-success" @click="openDialog('new')">
        <i class="fa-solid fa-plus me-1"></i> Nuevo Comprador
      </button>
    </div>

    <div class="mb-3">
      <input v-model="filter" type="text" class="form-control" placeholder="Filtrar por nombre, empresa o contacto..." />
    </div>

    <div v-if="buyerStore.loading" class="text-center my-4">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Cargando...</span>
      </div>
      <p class="mt-2">Cargando compradores...</p>
    </div>

    <div v-else-if="buyerStore.error" class="alert alert-danger">
      Error al cargar compradores: {{ buyerStore.error }}
    </div>

    <div v-else class="table-responsive">
      <table class="table table-bordered table-hover mb-0">
        <thead class="table-light">
          <tr>
            <th>Acciones</th>
            <th>Nombre</th>
            <th>Empresa</th>
            <th>Contacto</th>
            <th>Email</th>
            <th>CI o NIT</th>
            <th>Dirección</th>
            <th>Tipo</th>
            <th>Estado</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="buyer in filteredBuyers" :key="buyer.id" :class="{ 'row-inactivo': buyer.is_active==='inactivo' }">
            <td>
              <div class="d-flex align-items-center">
                <button v-if="buyer.is_active==='activo'" class="btn btn-sm btn-outline-primary me-1" @click="openDialog('view', buyer)">
                  <i class="fa-solid fa-eye"></i>
                </button>
                <button v-if="buyer.is_active==='activo' && isAdmin"  class="btn btn-sm btn-outline-success me-1" @click="openDialog('edit', buyer)">
                  <i class="fa-solid fa-pen-to-square"></i>
                </button>
                <button v-if="buyer.is_active==='activo' && isAdmin" class="btn btn-sm btn-outline-secondary" @click="deleteBuyer(buyer.id)">
                  <i class="fa-solid fa-trash"></i>
                </button>
              </div>
            </td>
            <td>{{ buyer.name }}</td>
            <td>{{ buyer.company }}</td>
            <td>{{ buyer.phone }}</td>
            <td>{{ buyer.email }}</td>
            <td>{{ buyer.tax_id }}</td>
            <td>{{ buyer.address }}</td>
            <td>
              <span :class="['badge', buyer.type === 'mayorista' ? 'bg-primary' : 'bg-success']">
                {{ buyer.type === 'mayorista' ? 'Mayorista' : 'Minorista' }}
              </span>
            </td>
            <td>
              <span :class="['badge', buyer.is_active ==='activo'? 'bg-success' : 'bg-warning']">
                {{ buyer.is_active==='activo' ? 'Activo' : 'Inactivo' }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal para agregar/editar compradores -->
    <dialog ref="buyerDialog" class="p-0 border-0">
      <form @submit.prevent="saveBuyer" class="p-3">
        <h5>{{ dialogTitle }}</h5>

        <div class="row g-2 mb-2">
          <div class="col-md-6">
            <label>Nombre completo</label>
            <input v-model="form.name" type="text" class="form-control" :readonly="isViewing" required />
          </div>
          <div class="col-md-6">
            <label>Empresa</label>
            <input v-model="form.company" type="text" class="form-control" :readonly="isViewing" />
          </div>
        </div>

        <div class="row g-2 mb-2">
          <div class="col-md-6">
            <label>Teléfono</label>
            <input v-model="form.phone" type="tel" class="form-control" :readonly="isViewing" required />
          </div>
          <div class="col-md-6">
            <label>Email</label>
            <input v-model="form.email" type="email" class="form-control" :readonly="isViewing" required />
          </div>
        </div>

        <div class="row g-2 mb-2">
          <div class="col-md-6">
            <label>Tipo de comprador</label>
            <select v-model="form.type" class="form-select" :disabled="isViewing" required>
              <option value="mayorista">Mayorista</option>
              <option value="minorista">Minorista</option>
            </select>
          </div>
          <div class="col-md-6">
            <label>CI o NIT</label>
            <input v-model="form.tax_id" type="text" class="form-control" :readonly="isViewing" required />
          </div>
        </div>

        <div class="mb-2">
          <label>Dirección</label>
          <textarea v-model="form.address" class="form-control" :readonly="isViewing" rows="2" required></textarea>
        </div>

        <div class="mb-2" v-if="!isViewing">
          <label>
            <input v-model="form.is_active" type="checkbox" class="form-check-input me-2" />
            Comprador activo
          </label>
        </div>

        <div class="d-flex justify-content-end mt-3">
          <button type="button" class="btn btn-secondary me-2" @click="closeDialog()">Cancelar</button>
          <button v-if="!isViewing" type="submit" class="btn btn-outline-primary">
            <span v-if="isSaving" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
            {{ isSaving ? 'Guardando...' : 'Guardar' }}
          </button>
        </div>
      </form>
    </dialog>
  </div>
      <AlertComponent ref="alertRef" />
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import AlertComponent from "../components/AppAlert.vue";
import { useBuyerStore } from '../store/buyer.store';

const alertRef = ref(null);
const buyerStore = useBuyerStore();
const filter = ref('');
const isAdmin = ref(true);
const isSaving = ref(false);

const form = reactive({
  id: null,
  name: '',
  company: '',
  phone: '',
  email: '',
  type: 'mayorista',
  tax_id: '',
  address: '',
  is_active: true
});

const buyerDialog = ref(null);
const dialogMode = ref('new');

// Computed properties
const filteredBuyers = computed(() => {
  const searchTerm = filter.value.toLowerCase();
  return buyerStore.buyers.filter(buyer => 
    buyer.name.toLowerCase().includes(searchTerm) ||
    buyer.company.toLowerCase().includes(searchTerm) ||
    buyer.phone.toLowerCase().includes(searchTerm) ||
    buyer.email.toLowerCase().includes(searchTerm)
  );
});

const isViewing = computed(() => dialogMode.value === 'view');
const dialogTitle = computed(() => {
  if(dialogMode.value === 'new') return 'Nuevo Comprador';
  if(dialogMode.value === 'edit') return 'Editar Comprador';
  return 'Detalles del Comprador';
});

// Methods
function openDialog(mode, buyer = null) {
  dialogMode.value = mode;
  
  if(buyer) {
    Object.assign(form, JSON.parse(JSON.stringify(buyer)));
  } else {
    resetForm();
  }
  
  buyerDialog.value.showModal();
}

function closeDialog() {
  buyerDialog.value.close();
  resetForm();
}

function resetForm() {
  form.id = null;
  form.name = '';
  form.company = '';
  form.phone = '';
  form.email = '';
  form.type = 'mayorista';
  form.tax_id = '';
  form.address = '';
  form.is_active = true;
}

async function saveBuyer() {
  isSaving.value = true;
  try {
    if(dialogMode.value === 'new') {
      await buyerStore.addBuyer({...form});
        alertRef.value.addAlert("Cliente creado correctamente", "success");
    } else {
      await buyerStore.updateBuyer(form.id, {...form});
        alertRef.value.addAlert("Cliente editado correctamente", "success");
    }
    closeDialog();
  } catch (error) {
    console.error('Error al guardar comprador:', error);
      alertRef.value.addAlert("Error al guardar el cliente", "error");
  } finally {
    isSaving.value = false;
  }
}

async function deleteBuyer(id) {
  if(confirm('¿Está seguro de eliminar este comprador?')) {
    try {
      await buyerStore.deleteBuyer(id);
        alertRef.value.addAlert("Cliente eliminado correctamente", "success");
    } catch (error) {
      console.error('Error al eliminar comprador:', error);
      alertRef.value.addAlert("Error al eliminar el cliente", "error");
    }
  }
}

// Lifecycle hooks
onMounted(async () => {
  try {
    await buyerStore.fetchBuyers();
  } catch (error) {
    console.error('Error al cargar compradores:', error);
  }
});
</script>

<style scoped>
.table-responsive { overflow-x: auto; }
dialog {
  max-width: 700px;
  width: 100%;
  border: none;
  border-radius: 8px;
}
dialog::backdrop {
  background: rgba(0,0,0,0.5);
}

/* Estilos para los badges */
.badge {
  font-size: 0.85em;
  padding: 0.35em 0.65em;
}

/* Estilos para los botones de acción */
.btn-sm {
  padding: 0.25rem 0.5rem;
  font-size: 0.875rem;
}

/* Mejora para inputs */
.form-control:readonly {
  background-color: #f8f9fa;
  opacity: 1;
}

/* Estilos para el spinner de carga */
.spinner-border {
  width: 1.5rem;
  height: 1.5rem;
  border-width: 0.2em;
}
.row-inactivo td{
  background-color: #f8d7da; /* rojo muy tenue */
  color: #721c24; /* texto oscuro sobre rojo */
}
</style>