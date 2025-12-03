<template>
  <div class="container py-4">
    <h2 class="mb-4">Gestión de Usuarios</h2>
    <button class="btn btn-success mb-3" @click="openDialog('new')">
      <i class="fa-solid fa-plus"></i> Nuevo Usuario
    </button>

    <div class="table-responsive">
      <table class="table table-bordered table-hover mb-0">
        <thead class="table-light">
          <tr>
            <th>Acciones</th>
            <th>Nombres</th>
            <th>Apellidos</th>
            <th>Usuario</th>
            <th>Correo</th>
            <th>Celular</th>
            <th>Rol</th>
            <th>Estado</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="u in users" :key="u.id_usuario" :class="{ 'row-inactivo': u.estado?.toLowerCase() === 'inactivo' }">
            <td>
              <button class="btn btn-sm btn-outline-primary me-1" v-if="u.estado==='activo'" @click="openDialog('view', u)">
                <i class="fa-solid fa-eye"></i>
              </button>
              <button class="btn btn-sm btn-outline-success me-1" v-if="u.estado==='activo'" @click="openDialog('edit', u)">
                <i class="fa-solid fa-pen-to-square"></i>
              </button>
              <button class="btn btn-sm btn-outline-danger" v-if="u.estado==='activo'" @click="handleDelete(u.id_usuario)">
                <i class="fa-solid fa-trash"></i>
              </button>
            </td>
            <td>{{ u.nombres }}</td>
            <td>{{ u.apellidos }}</td>
            <td>{{ u.nombre_usuario }}</td>
            <td>{{ u.correo }}</td>
            <td>{{ u.celular }}</td>
            <td>{{ u.rol }}</td>
            <td>{{ u.estado }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Dialogo -->
    <dialog ref="userDialog" class="p-0 border-0">
      <form @submit.prevent="saveUser" class="p-3">
        <h5>{{ dialogTitle }}</h5>

        <div class="row g-2 mb-2">
          <div class="col-md-6">
            <label>Nombres</label>
            <input v-model="form.nombres" type="text" class="form-control" :readonly="isViewing" required />
          </div>
          <div class="col-md-6">
            <label>Apellidos</label>
            <input v-model="form.apellidos" type="text" class="form-control" :readonly="isViewing" required />
          </div>
        </div>

        <div class="mb-2">
          <label>Nombre de Usuario</label>
          <input v-model="form.nombre_usuario" type="text" class="form-control" :readonly="isViewing" required />
        </div>

        <div class="mb-2">
          <label>Correo</label>
          <input v-model="form.correo" type="email" class="form-control" :readonly="isViewing" required />
        </div>

        <div class="mb-2">
          <label>Celular</label>
          <input v-model="form.celular" type="text" class="form-control" :readonly="isViewing" />
        </div>

        <div class="mb-2" v-if="dialogMode !== 'view'">
          <label>Contraseña</label>
          <input v-model="form.clave" type="password" class="form-control" :required="dialogMode==='new'" />
        </div>

        <div class="mb-3">
          <label>Rol</label>
          <select v-model="form.rol" class="form-select" :disabled="isViewing">
            <option v-for="r in allRoles" :key="r" :value="r">{{ r }}</option>
          </select>
        </div>

        <div class="d-flex justify-content-end">
          <button type="button" class="btn btn-secondary me-2" @click="closeDialog()">Cerrar</button>
          <button v-if="!isViewing" type="submit" class="btn btn-outline-primary">Guardar</button>
        </div>
      </form>
    </dialog>
  </div>
  <AlertComponent ref="alertRef" />
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { fetchUsers, createUser, updateUser, deleteUser } from '../api/usuarios.js';
import AlertComponent from '../components/AppAlert.vue';

const alertRef = ref(null);
const users = ref([]);
const allRoles = ['usuario','admin','auditor'];

const form = reactive({
  id_usuario: null,
  nombres: '',
  apellidos: '',
  correo: '',
  celular: '',
  nombre_usuario: '',
  clave: '',
  rol: 'usuario'
});

const dialogMode = ref('new');
const userDialog = ref(null);

const isViewing = computed(() => dialogMode.value === 'view');
const dialogTitle = computed(() => {
  if (dialogMode.value === 'new') return 'Crear Usuario';
  if (dialogMode.value === 'edit') return 'Editar Usuario';
  return 'Ver Usuario';
});

function openDialog(mode, user = null) {
  dialogMode.value = mode;
  if (user) Object.assign(form, { ...user, clave: '' });
  else Object.assign(form, { id_usuario:null, nombres:'', apellidos:'', correo:'', celular:'', nombre_usuario:'', clave:'', rol:'usuario' });
  userDialog.value.showModal();
}

function closeDialog() {
  userDialog.value.close();
}

async function saveUser() {
  try {
    let result;

    if (dialogMode.value === 'new') {
      // El backend se encarga de created_by
      result = await createUser(form);
      if (result.success) {
         users.value = await fetchUsers();
         alertRef.value.addAlert(result.message, 'success');
      }else {
        // Mostrar alerta de error
        alertRef.value.addAlert(result.message, 'error');
      }

    } else if (dialogMode.value === 'edit') {
      // El backend se encarga de updated_by
      result = await updateUser(form.id_usuario, form);
      if (result.success) {
         alertRef.value.addAlert(result.message, 'success');
         users.value = await fetchUsers();
      } else {
        alertRef.value.addAlert(result.message, 'error');
      }
    }

    closeDialog();
  } catch (err) {
    console.error(err);
    alert('Error al guardar usuario');
  }
}


async function handleDelete(id) {
  if (!confirm('¿Eliminar este usuario?')) return;
  try {
    const result = await deleteUser(id); 
    if (result.success) {
      alertRef.value.addAlert(result.message, 'success');
      users.value = await fetchUsers();
    }else {
      alertRef.value.addAlert(result.message, 'error');
    }
  } catch (err) {
    console.error(err);
    alert('Error al eliminar usuario');
  }
}

onMounted(async () => {
  try {
    users.value = await fetchUsers();
  } catch (err) {
    console.error('Error cargando usuarios', err);
  }
});
</script>

<style scoped>
.table-responsive { overflow-x: auto; }
dialog { max-width: 600px; width: 100%; border: none; border-radius: 8px; }
dialog::backdrop { background: rgba(0,0,0,0.5); }
.row-inactivo td{
  background-color: #f8d7da; /* rojo muy tenue */
  color: #721c24; /* texto oscuro sobre rojo */
}
</style>
