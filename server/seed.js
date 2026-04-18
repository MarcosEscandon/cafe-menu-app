const mongoose = require('mongoose');
const MenuItem = require('./models/MenuItem');
require('dotenv').config();

const menuItems = [
  {
    name: 'Café del Bosque',
    description: 'Café artesanal con granos seleccionados de las montañas patagónicas',
    price: 2.50,
    category: 'café',
    available: true,
    preparationTime: 3,
    customizationOptions: [
      {
        name: 'Tamaño',
        type: 'select',
        options: ['Arroyo', 'Río', 'Cascada'],
        priceModifier: 0.50,
        required: true
      },
      {
        name: 'Miel del Bosque',
        type: 'boolean',
        priceModifier: 0.30,
        required: false
      },
      {
        name: 'Leche',
        type: 'select',
        options: ['Negro puro', 'Leche fresca', 'Leche de almendras', 'Leche de coco'],
        priceModifier: 0.30,
        required: false
      }
    ]
  },
  {
    name: 'Cappuccino Patagónico',
    description: 'Espresso con espuma de leche y chocolate suizo de las montañas',
    price: 3.50,
    category: 'café',
    available: true,
    preparationTime: 5,
    customizationOptions: [
      {
        name: 'Tamaño',
        type: 'select',
        options: ['Arroyo', 'Río', 'Cascada'],
        priceModifier: 0.75,
        required: true
      },
      {
        name: 'Sabor de Montaña',
        type: 'select',
        options: ['Natural', 'Vainilla del bosque', 'Caramelo de roble', 'Menta alpina'],
        priceModifier: 0.50,
        required: false
      },
      {
        name: 'Canela y Nuez',
        type: 'boolean',
        priceModifier: 0.20,
        required: false
      }
    ]
  },
  {
    name: 'Latte del Refugio',
    description: 'Espresso suave con leche vaporizada como nieve patagónica',
    price: 3.75,
    category: 'café',
    available: true,
    preparationTime: 4,
    customizationOptions: [
      {
        name: 'Tamaño',
        type: 'select',
        options: ['Arroyo', 'Río', 'Cascada'],
        priceModifier: 0.80,
        required: true
      },
      {
        name: 'Sirope de Montaña',
        type: 'select',
        options: ['Puro', 'Vainilla silvestre', 'Caramelo de arce', 'Avellana del bosque'],
        priceModifier: 0.60,
        required: false
      }
    ]
  },
  {
    name: 'Té de la Selva',
    description: 'Té verde orgánico cosechado en los bosques andinos',
    price: 2.00,
    category: 'té',
    available: true,
    preparationTime: 3,
    customizationOptions: [
      {
        name: 'Temperatura',
        type: 'select',
        options: ['Helado', 'Caliente'],
        priceModifier: 0,
        required: true
      },
      {
        name: 'Limón andino',
        type: 'boolean',
        priceModifier: 0.10,
        required: false
      },
      {
        name: 'Miel silvestre',
        type: 'boolean',
        priceModifier: 0.30,
        required: false
      }
    ]
  },
  {
    name: 'Té de la Montaña',
    description: 'Té negro robusto con notas de tierra patagónica',
    price: 2.00,
    category: 'té',
    available: true,
    preparationTime: 3,
    customizationOptions: [
      {
        name: 'Temperatura',
        type: 'select',
        options: ['Helado', 'Caliente'],
        priceModifier: 0,
        required: true
      },
      {
        name: 'Leche de la cabaña',
        type: 'boolean',
        priceModifier: 0.20,
        required: false
      }
    ]
  },
  {
    name: 'Croissant del Alpes',
    description: 'Croissant artesanal con manteca de montaña, crujiente como hojas secas',
    price: 2.50,
    category: 'postres',
    available: true,
    preparationTime: 2,
    customizationOptions: [
      {
        name: 'Temperatura',
        type: 'boolean',
        priceModifier: 0,
        required: false
      },
      {
        name: 'Mermelada del Bosque',
        type: 'select',
        options: ['Natural', 'Frutos rojos', 'Durazno andino', 'Arándanos silvestres'],
        priceModifier: 0.50,
        required: false
      }
    ]
  },
  {
    name: 'Torta Chocolate Nevado',
    description: 'Exquisita torta de chocolate con crema como nieve fresca',
    price: 4.50,
    category: 'postres',
    available: true,
    preparationTime: 1,
    customizationOptions: [
      {
        name: 'Porción',
        type: 'select',
        options: ['Sendero', 'Cumbre'],
        priceModifier: 3.00,
        required: true
      },
      {
        name: 'Crema de montaña',
        type: 'boolean',
        priceModifier: 0.50,
        required: false
      }
    ]
  },
  {
    name: 'Sándwich del Refugio',
    description: 'Sándwich con jamón artesanal, queso de montaña y vegetales frescos',
    price: 5.50,
    category: 'sandwiches',
    available: true,
    preparationTime: 6,
    customizationOptions: [
      {
        name: 'Pan de la Cabaña',
        type: 'select',
        options: ['Pan blanco', 'Pan integral', 'Baguette rústico'],
        priceModifier: 0,
        required: true
      },
      {
        name: 'Verduras del huerto',
        type: 'boolean',
        priceModifier: 0.30,
        required: false
      },
      {
        name: 'Salsa especial',
        type: 'select',
        options: ['Natural', 'Mayonesa de hierbas', 'Mostaza antigua', 'Salsa forestal'],
        priceModifier: 0,
        required: false
      }
    ]
  },
  {
    name: 'Sándwich del Bosque',
    description: 'Sándwich vegetariano con vegetales orgánicos y hummus casero',
    price: 4.75,
    category: 'sandwiches',
    available: true,
    preparationTime: 5,
    customizationOptions: [
      {
        name: 'Pan de la Cabaña',
        type: 'select',
        options: ['Pan blanco', 'Pan integral', 'Baguette rústico'],
        priceModifier: 0,
        required: true
      },
      {
        name: 'Queso de montaña',
        type: 'boolean',
        priceModifier: 0.50,
        required: false
      }
    ]
  },
  {
    name: 'Jugo del Paraíso',
    description: 'Jugo natural de frutas cosechadas en el bosque patagónico',
    price: 3.00,
    category: 'bebidas',
    available: true,
    preparationTime: 4,
    customizationOptions: [
      {
        name: 'Fruta del Bosque',
        type: 'select',
        options: ['Naranja del valle', 'Manzana silvestre', 'Zanahoria orgánica', 'Mix del bosque'],
        priceModifier: 0,
        required: true
      },
      {
        name: 'Hielo de montaña',
        type: 'boolean',
        priceModifier: 0,
        required: false
      }
    ]
  },
  {
    name: 'Agua de la Montaña',
    description: 'Agua mineral pura de manantiales patagónicos',
    price: 1.50,
    category: 'bebidas',
    available: true,
    preparationTime: 1,
    customizationOptions: [
      {
        name: 'Tipo',
        type: 'select',
        options: ['Manantial', 'Con gas natural'],
        priceModifier: 0,
        required: true
      }
    ]
  },
  {
    name: 'Galletas del Cazador',
    description: 'Galletas artesanales con chocolate y nueces del bosque',
    price: 1.75,
    category: 'otros',
    available: true,
    preparationTime: 1,
    customizationOptions: [
      {
        name: 'Cantidad',
        type: 'select',
        options: ['2 hojas', '4 hojas', '6 hojas'],
        priceModifier: 1.00,
        required: true
      }
    ]
  }
];

async function seedDatabase() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/cafe-menu');
    
    // Limpiar datos existentes
    await MenuItem.deleteMany({});
    
    // Insertar nuevos datos
    await MenuItem.insertMany(menuItems);
    
    console.log('Base de datos poblada exitosamente con', menuItems.length, 'items del menú');
    
    mongoose.connection.close();
  } catch (error) {
    console.error('Error al poblar la base de datos:', error);
    process.exit(1);
  }
}

seedDatabase();
