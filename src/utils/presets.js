/**
 * Catálogo de Casos Reales de Restaurantes y Emprendimientos
 * Para Programación Lineal (Investigación de Operaciones)
 */

export const PRESETS = [
  {
    id: 'pizzeria',
    name: '🍕 Pizzería Napolitana Artesanal',
    description: 'Optimización de producción diaria entre Pizza Clásica Margherita y Pizza Especial Trufada.',
    dishes: [
      {
        id: 'p1',
        name: 'Pizza Margherita (x₁)',
        shortName: 'Margherita',
        price: 14.0,  // Precio de venta
        cost: 4.5,    // Costo de insumos
        risk: 1.2,    // Riesgo de merma / perecibilidad baja
        targetDemand: 15,
        color: '#10b981'
      },
      {
        id: 'p2',
        name: 'Pizza Trufa Especial (x₂)',
        shortName: 'Trufa Especial',
        price: 24.0,
        cost: 9.0,
        risk: 3.8,    // Mayor riesgo (ingrediente costoso y perecedero)
        targetDemand: 10,
        color: '#f59e0b'
      }
    ],
    ingredients: [
      {
        id: 'ing_dough',
        name: 'Masa de Harina Fermentada',
        unit: 'porciones',
        stock: 50,
        costPerUnit: 0.8,
        color: '#f97316',
        usage: { p1: 1, p2: 1 }
      },
      {
        id: 'ing_cheese',
        name: 'Mozzarella di Bufala',
        unit: 'kg',
        stock: 8.0,
        costPerUnit: 12.0,
        color: '#eab308',
        usage: { p1: 0.15, p2: 0.25 }
      },
      {
        id: 'ing_sauce',
        name: 'Salsa San Marzano',
        unit: 'litros',
        stock: 6.0,
        costPerUnit: 4.0,
        color: '#ef4444',
        usage: { p1: 0.12, p2: 0.08 }
      },
      {
        id: 'ing_truffle',
        name: 'Crema de Trufa Negra',
        unit: 'frascos (100g)',
        stock: 4.0,
        costPerUnit: 18.0,
        color: '#8b5cf6',
        usage: { p1: 0, p2: 0.15 }
      }
    ],
    demand: {
      minTotalClients: 15, // Al menos 15 clientes satisfechos
      minDishX: 5,        // Al menos 5 Margherita
      minDishY: 3,        // Al menos 3 Trufada
      maxKitchenCapacity: 45
    }
  },
  {
    id: 'burger',
    name: '🍔 Hamburguesería Gourmet Smash',
    description: 'Balance entre Smash Burger Tradicional y Doble Angus Premium con Bacon Caramelizado.',
    dishes: [
      {
        id: 'p1',
        name: 'Smash Classic (x₁)',
        shortName: 'Smash Classic',
        price: 9.5,
        cost: 3.2,
        risk: 0.9,
        targetDemand: 25,
        color: '#3b82f6'
      },
      {
        id: 'p2',
        name: 'Doble Angus Bacon (x₂)',
        shortName: 'Doble Angus',
        price: 16.5,
        cost: 6.8,
        risk: 2.5,
        targetDemand: 18,
        color: '#ec4899'
      }
    ],
    ingredients: [
      {
        id: 'ing_meat',
        name: 'Carne Molida Angus Prime',
        unit: 'kg',
        stock: 12.0,
        costPerUnit: 10.0,
        color: '#b91c1c',
        usage: { p1: 0.12, p2: 0.24 }
      },
      {
        id: 'ing_brioche',
        name: 'Pan Brioche Dorado',
        unit: 'panes',
        stock: 60,
        costPerUnit: 0.7,
        color: '#d97706',
        usage: { p1: 1, p2: 1 }
      },
      {
        id: 'ing_cheddar',
        name: 'Queso Cheddar Curado',
        unit: 'kg',
        stock: 4.5,
        costPerUnit: 8.5,
        color: '#eab308',
        usage: { p1: 0.04, p2: 0.08 }
      },
      {
        id: 'ing_bacon',
        name: 'Bacon Ahumado Caramelizado',
        unit: 'kg',
        stock: 3.0,
        costPerUnit: 11.0,
        color: '#a855f7',
        usage: { p1: 0.02, p2: 0.07 }
      }
    ],
    demand: {
      minTotalClients: 20,
      minDishX: 8,
      minDishY: 5,
      maxKitchenCapacity: 55
    }
  },
  {
    id: 'sushi',
    name: '🍣 Sushi Bar Nikkei',
    description: 'Maximizando margen y controlando riesgo de salmón fresco en Rolls California vs Roll Salmón.',
    dishes: [
      {
        id: 'p1',
        name: 'Roll California Ebi (x₁)',
        shortName: 'California',
        price: 11.0,
        cost: 3.8,
        risk: 1.1,
        targetDemand: 20,
        color: '#06b6d4'
      },
      {
        id: 'p2',
        name: 'Roll Salmón Trufado (x₂)',
        shortName: 'Salmón Trufa',
        price: 18.0,
        cost: 7.2,
        risk: 3.2,
        targetDemand: 15,
        color: '#f43f5e'
      }
    ],
    ingredients: [
      {
        id: 'ing_rice',
        name: 'Arroz Shari Cocido',
        unit: 'kg',
        stock: 10.0,
        costPerUnit: 3.0,
        color: '#94a3b8',
        usage: { p1: 0.18, p2: 0.18 }
      },
      {
        id: 'ing_salmon',
        name: 'Salmón Fresco Premium',
        unit: 'kg',
        stock: 3.5,
        costPerUnit: 24.0,
        color: '#fb7185',
        usage: { p1: 0.03, p2: 0.14 }
      },
      {
        id: 'ing_avocado',
        name: 'Aguacate Hass Maduro',
        unit: 'kg',
        stock: 5.0,
        costPerUnit: 6.0,
        color: '#84cc16',
        usage: { p1: 0.06, p2: 0.06 }
      },
      {
        id: 'ing_nori',
        name: 'Hojas de Alga Nori',
        unit: 'hojas',
        stock: 45,
        costPerUnit: 0.25,
        color: '#15803d',
        usage: { p1: 1, p2: 1 }
      }
    ],
    demand: {
      minTotalClients: 15,
      minDishX: 5,
      minDishY: 4,
      maxKitchenCapacity: 40
    }
  },
  {
    id: 'tacos',
    name: '🌮 Taquería Mexicana de Especialidad',
    description: 'Balance entre Orden de Tacos al Pastor y Orden de Tacos de Rib Eye con Tuétano.',
    dishes: [
      {
        id: 'p1',
        name: 'Orden Tacos al Pastor (x₁)',
        shortName: 'Al Pastor',
        price: 6.5,
        cost: 2.1,
        risk: 0.6,
        targetDemand: 30,
        color: '#e11d48'
      },
      {
        id: 'p2',
        name: 'Orden Tacos Rib Eye (x₂)',
        shortName: 'Rib Eye',
        price: 15.0,
        cost: 6.0,
        risk: 2.2,
        targetDemand: 15,
        color: '#ca8a04'
      }
    ],
    ingredients: [
      {
        id: 'ing_tortillas',
        name: 'Tortillas de Maíz Nixtamal',
        unit: 'piezas',
        stock: 200,
        costPerUnit: 0.08,
        color: '#eab308',
        usage: { p1: 5, p2: 4 }
      },
      {
        id: 'ing_pastor_meat',
        name: 'Carne de Cerdo Adobada',
        unit: 'kg',
        stock: 8.0,
        costPerUnit: 7.0,
        color: '#ea580c',
        usage: { p1: 0.2, p2: 0 }
      },
      {
        id: 'ing_ribeye',
        name: 'Corte Rib Eye Sonorense',
        unit: 'kg',
        stock: 4.0,
        costPerUnit: 22.0,
        color: '#991b1b',
        usage: { p1: 0, p2: 0.22 }
      },
      {
        id: 'ing_cilantro_cebolla',
        name: 'Cebolla, Cilantro y Piña',
        unit: 'kg',
        stock: 5.0,
        costPerUnit: 2.5,
        color: '#16a34a',
        usage: { p1: 0.08, p2: 0.05 }
      }
    ],
    demand: {
      minTotalClients: 20,
      minDishX: 10,
      minDishY: 3,
      maxKitchenCapacity: 60
    }
  }
];
