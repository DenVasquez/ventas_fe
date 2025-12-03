import { defineStore } from 'pinia';

export const useSidebarStore = defineStore('sidebar', {
  state: () => ({
    isCollapsed: true,
  }),
  actions: {
    setCollapsed(value) {
      this.isCollapsed = value;
    },
  },
});