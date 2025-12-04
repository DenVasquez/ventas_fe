import { defineStore } from 'pinia';
import { fetchMateriales } from '../api/materiales';
import { fetchProductos, createProducto } from '../api/productos';
export const useProductoStore = defineStore('producto', {
  state: () => ({
    productos: [],
    loading: false,
    error: null,
    page: 1,
    limit: 10,
    search: ""
  }),
  actions: {
    async fetchProductos(page = 1) {
      this.loading = true;
      this.error = null;
      try {
        const result = await fetchProductos({
          page,
          limit: this.limit,
          search: this.search
        });
        // result.data contiene el array del backend
        this.productos = result.data.map(m => ({
          id: m.id_producto,
          cod: m.codigo,
          name: m.nombre_producto,
          price: m.precio_venta,
          manufacturing_cost: m.costo_fabricacion,
          utility: Number(m.utilidad)
        }));
      } catch (error) {
        this.error = error.message;
        throw error;
      } finally {
        this.loading = false;
      }
    },
        async addProducto(Producto) {
      await createProducto(Producto);
      await this.fetchProductos(this.page);
    },

    async updateProducto(id, Producto) {
      await updateProducto(id, Producto);
      await this.fetchProductos(this.page);
    },

    async deleteProducto(id) {
      await deleteProducto(id);
      await this.fetchProductos(this.page);
    },



    getProductoById(id) {
      return this.productos.find(producto => producto.cod === id);
    },
    async getTopProductsReport(limit = 5) {
  const saleStore = useSaleStore();
  await saleStore.fetchSales();
  
  const productSales = {};
  
  // Procesar todas las ventas no canceladas
  saleStore.sales
    .filter(sale => sale.status !== 'canceled')
    .forEach(sale => {
      sale.items.forEach(item => {
        // Buscar el producto por código (cod) en lugar de id
        const product = this.productos.find(p => p.cod === item.product_code) || {
          cod: item.product_code,
          name: 'Producto no encontrado',
          stock: 0
        };
        
        if (!productSales[product.cod]) {
          productSales[product.cod] = {
            ...product,
            totalSold: 0,
            totalRevenue: 0
          };
        }
        
        productSales[product.cod].totalSold += item.quantity;
        productSales[product.cod].totalRevenue += item.quantity * (item.unit_price || product.unit_cost || 0);
      });
    });
  
  // Convertir a array, ordenar y limitar
  return Object.values(productSales)
    .sort((a, b) => b.totalSold - a.totalSold)
    .slice(0, limit);
}
  },
  getters: {
    productosConMateriales: (state) => {
      const materialStore = useMaterialStore();
      return state.productos.map(producto => {
        return {
          ...producto,
          materialesInfo: producto.bom.map(item => {
            const material = materialStore.materiales.find(m => m.cod === item.cod);
            return {
              ...item,
              name: material ? material.name : 'Material no encontrado',
              unit_cost: material ? material.unit_cost : 0,
              stock: material ? material.stock : 0
            };
          })
        };
      });
    },
    productosBajoStock: (state) => (threshold = 5) => {
      return state.productos.filter(p => p.stock < threshold);
    }
  }
});