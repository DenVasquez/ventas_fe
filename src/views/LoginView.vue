<template>
  <div class="container mt-5">
    <div class="row justify-content-center">
      <div class="col-md-4">
        <div class="card shadow-sm">
          <div class="card-body text-center">
            <img src="../../public/logo.jpg" alt="Logo" height="50" width="50" class="mb-3 mx-auto d-block" />
            <h2 class="mb-4">Login</h2>
            
            <form @submit.prevent="handleLogin">
              <div class="mb-3 text-start">
                <label class="form-label">Usuario</label>
                <input v-model="usuario" type="text" class="form-control" :disabled="loading" required />
              </div>
              <div class="mb-3 text-start">
                <label class="form-label">Contraseña</label>
                <input v-model="password" type="password" class="form-control" :disabled="loading" required />
              </div>

              <button type="submit" class="btn btn-outline-primary w-100" :disabled="loading">
                <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
                {{ loading ? 'Ingresando...' : 'Ingresar' }}
              </button>
            </form>

            <p v-if="error" class="text-danger mt-3">{{ error }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useAuth } from '../composables/useAuth';
import { useRouter } from 'vue-router';

const auth = useAuth();
const router = useRouter();

const usuario = ref('svasquez'); // Usuario administrador por defecto
const password = ref('Abc123$$');
const error = ref('');
const loading = ref(false);

onMounted(() => {
  auth.loadUserFromStorage();
  if (auth.user) {
    router.push({ name: 'Dashboard' });
  }
});

const handleLogin = async () => {
  error.value = '';
  loading.value = true;
  try {
    await auth.loginUser({ usuario: usuario.value, password: password.value });
    router.replace({ name: 'Dashboard' }); // redirección
  } catch (err) {
    error.value = err.message || 'Error al iniciar sesión';
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.center {
  justify-content: center;
}
.card {
  border-radius: 12px;
}
</style>
