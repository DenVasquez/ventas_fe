<template>
  <!-- Contenedor de alertas fijo en la parte superior de la pantalla -->
  <div v-if="alerts.length > 0" class="alerts-container">
    <transition-group name="fade">
      <div 
        v-for="alert in alerts" 
        :key="alert.id"
        :class="['alert', `alert--${alert.type}`]"
        @click="removeAlert(alert.id)"
      >
        <span class="alert__icon">
          <template v-if="alert.type === 'success'">✓</template>
          <template v-else-if="alert.type === 'error'">✗</template>
          <template v-else>⚠</template>
        </span>
        <span class="alert__message">{{ alert.message }}</span>
      </div>
    </transition-group>
  </div>
</template>

<script setup>
import { ref } from 'vue';

// Ejemplo con estado local (puedes reemplazarlo por Pinia si lo prefieres)
const alerts = ref([]);

// Función para agregar alertas (puede ser llamada desde cualquier componente)
const addAlert = (message, type = 'info', timeout = 5000) => {
  const id = Date.now();
  alerts.value.push({ id, message, type });
  
  // Eliminar automáticamente después de `timeout` ms
  if (timeout > 0) {
    setTimeout(() => removeAlert(id), timeout);
  }
};

// Función para eliminar una alerta por ID
const removeAlert = (id) => {
  alerts.value = alerts.value.filter(alert => alert.id !== id);
};

// Opcional: Expón las funciones para usarlas con provide/inject o Pinia
defineExpose({ addAlert, removeAlert });
</script>

<style scoped>
.alerts-container {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.alert {
  padding: 12px 16px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  animation: slideIn 0.3s ease-out;
}

.alert--success {
  background-color: #f0fff4;
  color: #2d8a4b;
  border-left: 4px solid #2d8a4b;
}

.alert--error {
  background-color: #fff0f0;
  color: #e53e3e;
  border-left: 4px solid #e53e3e;
}

.alert--info {
  background-color: #ebf8ff;
  color: #3182ce;
  border-left: 4px solid #3182ce;
}

.alert--warning {
  background-color: #fffaf0;
  color: #dd6b20;
  border-left: 4px solid #dd6b20;
}

.alert__icon {
  font-weight: bold;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
  }
  to {
    transform: translateX(0);
  }
}
</style>