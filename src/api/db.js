// db.js - Base de datos simulada
let db = {
 materiales: [
    { id: 1, cod: 'MAT-001', name: 'Madera de pino', unit_cost: 25.75, stock: 150, stock_minimo: 500 },
    { id: 2, cod: 'MAT-002', name: 'Tornillos', unit_cost: 0.50, stock: 500, stock_minimo: 10 },
    { id: 3, cod: 'MAT-003', name: 'Pegamento', unit_cost: 15.25, stock: 3, stock_minimo: 5 },
    { id: 4, cod: 'MAT-004', name: 'Pintura blanca', unit_cost: 32.50, stock: 45, stock_minimo: 20 },
    { id: 5, cod: 'MAT-005', name: 'Clavos', unit_cost: 0.20, stock: 1200, stock_minimo: 500 },
    { id: 6, cod: 'MAT-006', name: 'Bisagras', unit_cost: 2.75, stock: 230, stock_minimo: 100 },
    { id: 7, cod: 'MAT-007', name: 'Barniz', unit_cost: 28.90, stock: 18, stock_minimo: 15 },
    { id: 8, cod: 'MAT-008', name: 'Lija', unit_cost: 1.20, stock: 340, stock_minimo: 200 },
    { id: 9, cod: 'MAT-009', name: 'Tela tapiz', unit_cost: 18.75, stock: 65, stock_minimo: 50 },
    { id: 10, cod: 'MAT-010', name: 'Espuma', unit_cost: 12.30, stock: 42, stock_minimo: 30 },
    // ... (90 materiales más)
  ],
  productos: [
    {
      id: 1,
      cod: 'PROD-001',
      name: 'Silla clásica',
      unit_cost: 150.50,
      stock: 25,
      bom: [
        { cod: 'MAT-001', qty: 5 },
        { cod: 'MAT-002', qty: 10 }
      ]
    },
    {
      id: 2,
      cod: 'PROD-002',
      name: 'Mesa redonda',
      unit_cost: 320.75,
      stock: 8,
      bom: [
        { cod: 'MAT-001', qty: 8 },
        { cod: 'MAT-003', qty: 4 }
      ]
    },
    {
      id: 3,
      cod: 'PROD-003',
      name: 'Sofá de 3 plazas',
      unit_cost: 850.00,
      stock: 5,
      bom: [
        { cod: 'MAT-001', qty: 15 },
        { cod: 'MAT-009', qty: 8 },
        { cod: 'MAT-010', qty: 5 }
      ]
    },
    {
      id: 4,
      cod: 'PROD-004',
      name: 'Estantería moderna',
      unit_cost: 275.40,
      stock: 12,
      bom: [
        { cod: 'MAT-001', qty: 10 },
        { cod: 'MAT-006', qty: 12 }
      ]
    },
    {
      id: 5,
      cod: 'PROD-005',
      name: 'Escritorio ejecutivo',
      unit_cost: 420.90,
      stock: 7,
      bom: [
        { cod: 'MAT-001', qty: 12 },
        { cod: 'MAT-002', qty: 20 },
        { cod: 'MAT-006', qty: 8 }
      ]
    },
    // ... (95 productos más)
  ],
  buyers: [
    {
      id: 1,
      name: 'Juan Pérez',
      company: 'Distribuciones Pérez SA',
      phone: '+51 987654321',
      email: 'juan@perez.com',
      type: 'mayorista',
      tax_id: '20123456789',
      address: 'Av. Principal 123, La Paz',
      is_active: true
    },
    {
      id: 2,
      name: 'María Gómez',
      company: 'Tienda María',
      phone: '+51 987123456',
      email: 'maria@gomez.com',
      type: 'minorista',
      tax_id: '10456789234',
      address: 'Calle Los Pinos 456, Sucre',
      is_active: true
    },
    {
      id: 3,
      name: 'Carlos Rodríguez',
      company: 'Importaciones CR',
      phone: '+51 987654987',
      email: 'carlos@cr.com',
      type: 'mayorista',
      tax_id: '20345678912',
      address: 'Calle Comercio 789, Santa Cruz',
      is_active: false
    },
    {
      id: 4,
      name: 'Ana Mendoza',
      company: 'Muebles Mendoza',
      phone: '+51 987321654',
      email: 'ana@mendoza.com',
      type: 'mayorista',
      tax_id: '20198765432',
      address: 'Av. Industrial 456, La Paz',
      is_active: true
    },
    {
      id: 5,
      name: 'Luis Torres',
      company: 'Decoraciones Torres',
      phone: '+51 987456123',
      email: 'luis@torres.com',
      type: 'minorista',
      tax_id: '10412345678',
      address: 'Calle Mercaderes 789, Cochabamba',
      is_active: true
    },
    // ... (95 compradores más)
  ],
  sales: [
    {
      id: 1,
      buyer_id: 1,
      date: '2025-05-20',
      items: [
        { cod: 'PROD-001', qty: 2, unit_price: 150.50 }
      ],
      total: 301.00,
      status: 'completed'
    },
    {
      id: 2,
      buyer_id: 2,
      date: '2025-05-21',
      items: [
        { cod: 'PROD-002', qty: 1, unit_price: 320.75 },
        { cod: 'PROD-001', qty: 3, unit_price: 150.50 }
      ],
      total: 772.25,
      status: 'completed'
    },
    {
      id: 3,
      buyer_id: 1,
      date: '2025-05-15',
      items: [
        { cod: 'PROD-003', qty: 1, unit_price: 850.00 },
        { cod: 'PROD-005', qty: 2, unit_price: 420.90 }
      ],
      total: 1691.80,
      status: 'completed'
    },
    {
      id: 4,
      buyer_id: 3,
      date: '2025-05-18',
      items: [
        { cod: 'PROD-004', qty: 3, unit_price: 275.40 }
      ],
      total: 826.20,
      status: 'pending'
    },
    {
      id: 5,
      buyer_id: 4,
      date: '2025-05-22',
      items: [
        { cod: 'PROD-001', qty: 5, unit_price: 150.50 },
        { cod: 'PROD-002', qty: 2, unit_price: 320.75 }
      ],
      total: 1397.00,
      status: 'completed'
    },
    // ... (95 ventas más)
  ]
};

// Métodos para simular una API REST
const api = {
  // Materiales
  getMateriales: () => new Promise(resolve => {
    setTimeout(() => resolve([...db.materiales]), 300);
  }),
  getMaterialById: (id) => new Promise(resolve => {
    setTimeout(() => {
      const material = db.materiales.find(m => m.id === id);
      resolve(material ? {...material} : null);
    }, 300);
  }),
  addMaterial: (material) => new Promise(resolve => {
    setTimeout(() => {
      const newId = Math.max(...db.materiales.map(m => m.id)) + 1;
      const newMaterial = { ...material, id: newId };
      db.materiales.push(newMaterial);
      resolve(newMaterial);
    }, 300);
  }),
  updateMaterial: (id, updates) => new Promise(resolve => {
    setTimeout(() => {
      const index = db.materiales.findIndex(m => m.id === id);
      if (index !== -1) {
        db.materiales[index] = { ...db.materiales[index], ...updates };
        resolve(db.materiales[index]);
      } else {
        resolve(null);
      }
    }, 300);
  }),
  deleteMaterial: (id) => new Promise(resolve => {
    setTimeout(() => {
      db.materiales = db.materiales.filter(m => m.id !== id);
      resolve(true);
    }, 300);
  }),

  // Productos
  getProductos: () => new Promise(resolve => {
    setTimeout(() => resolve([...db.productos]), 300);
  }),
  getProductoById: (id) => new Promise(resolve => {
    setTimeout(() => {
      const producto = db.productos.find(p => p.id === id);
      resolve(producto ? {...producto} : null);
    }, 300);
  }),
  addProducto: (producto) => new Promise(resolve => {
    setTimeout(() => {
      const newId = Math.max(...db.productos.map(p => p.id)) + 1;
      const newProducto = { ...producto, id: newId };
      db.productos.push(newProducto);
      resolve(newProducto);
    }, 300);
  }),
  updateProducto: (id, updates) => new Promise(resolve => {
    setTimeout(() => {
      const index = db.productos.findIndex(p => p.id === id);
      if (index !== -1) {
        db.productos[index] = { ...db.productos[index], ...updates };
        resolve(db.productos[index]);
      } else {
        resolve(null);
      }
    }, 300);
  }),
  deleteProducto: (id) => new Promise(resolve => {
    setTimeout(() => {
      db.productos = db.productos.filter(p => p.id !== id);
      resolve(true);
    }, 300);
  }),

  // Compradores
  getBuyers: () => new Promise(resolve => {
    setTimeout(() => resolve([...db.buyers]), 300);
  }),
  getBuyerById: (id) => new Promise(resolve => {
    setTimeout(() => {
      const buyer = db.buyers.find(b => b.id === id);
      resolve(buyer ? {...buyer} : null);
    }, 300);
  }),
  addBuyer: (buyer) => new Promise(resolve => {
    setTimeout(() => {
      const newId = Math.max(...db.buyers.map(b => b.id)) + 1;
      const newBuyer = { ...buyer, id: newId };
      db.buyers.push(newBuyer);
      resolve(newBuyer);
    }, 300);
  }),
  updateBuyer: (id, updates) => new Promise(resolve => {
    setTimeout(() => {
      const index = db.buyers.findIndex(b => b.id === id);
      if (index !== -1) {
        db.buyers[index] = { ...db.buyers[index], ...updates };
        resolve(db.buyers[index]);
      } else {
        resolve(null);
      }
    }, 300);
  }),
  deleteBuyer: (id) => new Promise(resolve => {
    setTimeout(() => {
      db.buyers = db.buyers.filter(b => b.id !== id);
      resolve(true);
    }, 300);
  }),


  // Ventas
  getSales: () => new Promise(resolve => {
    setTimeout(() => resolve([...db.sales]), 300);
  }),
  getSaleById: (id) => new Promise(resolve => {
    setTimeout(() => {
      const sale = db.sales.find(s => s.id === id);
      resolve(sale ? {...sale} : null);
    }, 300);
  }),
  addSale: (sale) => new Promise(resolve => {
    setTimeout(() => {
      const newId = Math.max(...db.sales.map(s => s.id), 0) + 1;
      const newSale = { ...sale, id: newId };
      db.sales.push(newSale);
      resolve(newSale);
    }, 300);
  }),
  updateSale: (id, updates) => new Promise(resolve => {
    setTimeout(() => {
      const index = db.sales.findIndex(s => s.id === id);
      if (index !== -1) {
        db.sales[index] = { ...db.sales[index], ...updates };
        resolve(db.sales[index]);
      } else {
        resolve(null);
      }
    }, 300);
  }),
  cancelSale: (id) => new Promise(resolve => {
    setTimeout(() => {
      const index = db.sales.findIndex(s => s.id === id);
      if (index !== -1) {
        db.sales[index].status = 'canceled';
        resolve(true);
      } else {
        resolve(false);
      }
    }, 300);
  })

};

export default api;