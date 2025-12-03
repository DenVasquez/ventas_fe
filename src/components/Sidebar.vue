<template>
  <nav
    class="sidebar border-end bg-custom d-flex flex-column"
    :class="{ narrow: !hovered }"
    @mouseenter="hovered = true"
    @mouseleave="hovered = false"
  >
    <!-- Contenedor de imagen compacto -->
    <div class="sidebar-image-container">
      <transition name="fade" mode="out-in">
        <router-link to="/Dashboard">
        <img 
          key="expanded"
          src="../../public/logo.png" 
          alt="Logo"
          class="sidebar-logo"
        >
        </router-link>
      </transition>
    </div>

    <!-- Menú de navegación -->
    <ul class="nav flex-column flex-grow-1 mt-2">
      <li v-for="item in items" :key="item.to" class="nav-item">
        <router-link class="nav-link d-flex align-items-center" :to="item.to">
          <i :class="item.icon"></i>
          <span v-if="hovered" class="ms-2">{{ item.text }}</span>
        </router-link>
      </li>
    </ul>
  </nav>
</template>

<script setup>
import { ref } from 'vue';
const hovered = ref(false);
const items = [
  { to: '/usuarios', text: 'Usuarios', icon: 'fa-solid fa-user' },
  { to: '/materiales', text: 'Materiales', icon: 'fa-solid fa-bank' },
  { to: '/inventario', text: 'Almacenes', icon: 'fa-solid fa-house' },
  { to: '/ventas', text: 'Ventas', icon: 'fa-solid fa-shopping-cart' },
  { to: '/clientes', text: 'Clientes', icon: 'fa-solid fa-users' },
  { to: '/reportes', text: 'Reportes', icon: 'fa-solid fa-file' }
];
</script>

<style scoped>
.sidebar {
  width: 200px;
  height: 100vh;
  position: fixed;
  left: 0;
  top: 0;
  transition: width 0.3s ease;
  background-color: #d2a679;
  z-index: 1000;
}

.sidebar.narrow {
  width: 60px;
}

/* Contenedor de imagen compacto */
.sidebar-image-container {
  height: 60px; /* Altura reducida */
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem;
}

.sidebar-logo {
  max-height: 40px; /* Tamaño más compacto */
  width: auto;
  object-fit: contain;
}

.sidebar-icon {
  font-size: 1.25rem; /* Tamaño reducido */
  color: #2c3e50;
}

.nav-link {
  padding: 0.65rem 1rem; /* Padding más ajustado */
  color: #2c3e50;
  transition: all 0.2s;
}

.nav-link:hover {
  background-color: rgba(0, 0, 0, 0.1);
}

.nav-link i {
  font-size: 1.1rem; /* Tamaño de icono reducido */
  min-width: 24px;
  text-align: center;
}

/* Resto de estilos... */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.2s; /* Transición más rápida */
}
</style>