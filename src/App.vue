<template>
  <div id="app">
    <Header v-if="!isLoginRoute" />
    <div v-if="!isLoginRoute" class="d-flex">
      <Sidebar v-if="auth.user" />
      <main class="flex-grow-1 p-3">
        <router-view />
      </main>
    </div>
    <div v-else>
      <router-view />
    </div>
    <Footer v-if="!isLoginRoute" />
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { useAuthStore } from './store/auth.store';
import Header from './components/Header.vue';
import Sidebar from './components/Sidebar.vue';
import Footer from './components/Footer.vue';

const auth = useAuthStore();
const route = useRoute();
const isLoginRoute = computed(() => route.name === 'Login');
</script>
