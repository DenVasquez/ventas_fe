<template>
  <header class="navbar navbar-expand navbar-dark bg-custom px-3">
    <div class="ms-auto d-flex align-items-center">
      <span class="text-light me-3">{{ auth.user?.nombre_usuario || 'Invitado' }}</span>
      <button class="btn btn-outline-light btn-sm" @click="handleLogout">Cerrar sesión</button>
    </div>
  </header>
</template>

<script setup>
import { useAuthStore } from '../store/auth.store';
import { useRouter } from 'vue-router';

const auth = useAuthStore();
const router = useRouter();

const handleLogout = () => {
  auth.logout();
  router.push({ name: 'Login' });
};
</script>

<style scoped>
.bg-custom {
  background-color: #d2a679; /* café claro */
}
</style>
