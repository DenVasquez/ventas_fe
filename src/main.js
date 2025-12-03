import { createApp } from 'vue';
import { createPinia } from 'pinia'; // Importa createPinia
import App from './App.vue';
import router from './router';

// Importaciones de Bootstrap
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

// Configuración de Axios (sin usar store aquí)
import axios from 'axios';
axios.defaults.baseURL = 'http://tu-backend-api.com'; // Reemplaza con tu URL

// 1. Crea la instancia de Pinia
const pinia = createPinia();

// 2. Crea la app Vue
const app = createApp(App);

// 3. Configura el interceptor de Axios DENTRO de la app
axios.interceptors.request.use((config) => {
  // Mueve la lógica del store al interceptor de componentes
  const token = localStorage.getItem('token'); // Solución temporal
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 4. Registra plugins en ORDEN CORRECTO
app.use(pinia); // Primero Pinia
app.use(router); // Luego Router

// 5. Monta la app
app.mount('#app');