import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../store/auth.store';

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/LoginView.vue'),
    meta: { guestOnly: true, hideLayout: true }

  },
  {
    path: '/usuarios',
    name: 'Usuarios',
    component: () => import('../views/UsersView.vue'),
    // meta: { requiresAuth: true, requiredRoles: ['admin'] }
  },
  {
    path: '/inventario',
    name: 'Inventario',
    component: () => import('../views/InventoryView.vue'),
    // meta: { requiresAuth: true, requiredRoles: ['admin'] }
  },
  {
    path: '/materiales',
    name: 'Materiales',
    component: () => import('../views/MAterialsView.vue'),
    // meta: { requiresAuth: true, requiredRoles: ['admin'] }
  },
  {
    path: '/clientes',
    name: 'Clientes',
    component: () => import('../views/BuyersView.vue'),
    // meta: { requiresAuth: true, requiredRoles: ['admin'] }
  },
  
  {
    path: '/ventas',
    name: 'Ventas',
    component: () => import('../views/SalesView.vue'),
    // meta: { requiresAuth: true, requiredRoles: ['admin'] }
  },
  {
    path: '/reportes',
    name: 'reportes',
    component: () => import('../views/ReportsView.vue')
    // meta: { requiresAuth: true, isAdmin: true }
  },
  {
    path: '/Dashboard',
    name: 'Dashboard',
    component: () => import('../views/Dashboard.vue'),
    meta: { requiresAuth: true }
  }
];

const router = createRouter({
  history: createWebHistory('/implac/'),
  routes
});

router.beforeEach(async (to) => {
   const auth = useAuthStore();
  auth.loadUserFromStorage();

  if (to.meta.requiresAuth && !auth.user) {
    return { path: '/login', query: { redirect: to.fullPath } };
  }

  if (to.meta.guestOnly && auth.user) {
    return { path: '/Dashboard' };
  }
});

export default router;