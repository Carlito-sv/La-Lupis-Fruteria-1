import { db } from "../server/db";
import { products, inventory, customers } from "../shared/schema";

async function seedDatabase() {
  console.log("Creando datos básicos para La Lupis ERP...");

  try {
    // Verificar si ya hay datos
    const existingProducts = await db.select().from(products).limit(1);
    if (existingProducts.length > 0) {
      console.log("La base de datos ya contiene productos. Omitiendo seed.");
      return;
    }

    console.log("Creando productos...");
    // Crear productos
    const productData = [
      {
        name: "Manzana Roja",
        description: "Manzanas rojas frescas",
        category: "fruits",
        price: 35.90,
        cost: 25.50,
        unit: "kg",
        minStock: 10,
        barcode: "FR-001",
        isPerishable: true,
        imageUrl: "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=600"
      },
      {
        name: "Plátano",
        description: "Plátanos maduros",
        category: "fruits",
        price: 29.90,
        cost: 18.50,
        unit: "kg",
        minStock: 8,
        barcode: "FR-002",
        isPerishable: true,
        imageUrl: "https://images.unsplash.com/photo-1543218024-57a70143c369?w=600"
      },
      {
        name: "Zanahoria",
        description: "Zanahorias frescas",
        category: "vegetables",
        price: 19.90,
        cost: 12.50,
        unit: "kg",
        minStock: 15,
        barcode: "VG-001",
        isPerishable: true,
        imageUrl: "https://images.unsplash.com/photo-1590868309235-ea34bed7bd7f?w=600"
      },
      {
        name: "Tomate",
        description: "Tomates frescos",
        category: "vegetables",
        price: 24.90,
        cost: 16.50,
        unit: "kg",
        minStock: 12,
        barcode: "VG-002",
        isPerishable: true,
        imageUrl: "https://images.unsplash.com/photo-1518977822534-7049a61ee0c2?w=600"
      },
      {
        name: "Leche",
        description: "Leche entera",
        category: "dairy",
        price: 25.50,
        cost: 19.00,
        unit: "l",
        minStock: 20,
        barcode: "DR-001",
        isPerishable: true,
        imageUrl: "https://images.unsplash.com/photo-1563636619-e9143da7973b?w=600"
      },
      {
        name: "Queso Fresco",
        description: "Queso fresco artesanal",
        category: "dairy",
        price: 110.00,
        cost: 85.00,
        unit: "kg",
        minStock: 5,
        barcode: "DR-002",
        isPerishable: true,
        imageUrl: "https://images.unsplash.com/photo-1552767059-ce182eda6a73?w=600"
      },
      {
        name: "Arroz",
        description: "Arroz blanco de grano largo",
        category: "groceries",
        price: 35.90,
        cost: 25.00,
        unit: "kg",
        minStock: 25,
        barcode: "GR-001",
        isPerishable: false,
        imageUrl: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600"
      },
      {
        name: "Frijol",
        description: "Frijol negro",
        category: "groceries",
        price: 42.00,
        cost: 32.00,
        unit: "kg",
        minStock: 20,
        barcode: "GR-002",
        isPerishable: false,
        imageUrl: "https://images.unsplash.com/photo-1608189617989-6b0f56b0e163?w=600"
      }
    ];
    
    for (const product of productData) {
      await db.insert(products).values(product);
    }

    console.log("Creando inventario...");
    // Obtener todos los productos para agregarlos al inventario
    const allProducts = await db.select().from(products);
    
    // Crear fechas para los productos perecederos
    const today = new Date();
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);
    
    const nextMonth = new Date(today);
    nextMonth.setDate(today.getDate() + 30);
    
    // Agregar inventario para cada producto
    for (const product of allProducts) {
      let expiryDate = null;
      // Si es perecedero, asignar una fecha de caducidad
      if (product.isPerishable) {
        if (product.id % 3 === 0) { // Algunos productos con fecha cercana
          expiryDate = nextWeek;
        } else {
          expiryDate = nextMonth;
        }
      }
      
      // Decidir cantidades basadas en el stock mínimo
      let quantity = product.minStock;
      
      // Algunos productos con stock bajo para pruebas
      if (product.id % 4 === 0) {
        quantity = product.minStock - Math.ceil(product.minStock * 0.2); // 20% por debajo
      } else {
        quantity = product.minStock + Math.ceil(product.minStock * (1 + (product.id % 3) / 2)); // Varía entre 150% y 250%
      }
      
      await db.insert(inventory).values({
        productId: product.id,
        quantity,
        expiryDate,
        location: "Tienda principal",
        lastUpdated: new Date()
      });
    }

    console.log("Creando clientes...");
    // Crear clientes
    const customerData = [
      {
        name: "Cliente General",
        email: "general@example.com",
        phone: "5555555555",
        address: "N/A"
      },
      {
        name: "María López",
        email: "maria@example.com",
        phone: "5551234567",
        address: "Calle Principal 123"
      },
      {
        name: "Juan Pérez",
        email: "juan@example.com",
        phone: "5559876543",
        address: "Avenida Central 456"
      },
      {
        name: "Restaurant El Buen Sabor",
        email: "restaurante@example.com",
        phone: "5552223333",
        address: "Plaza Central 789"
      }
    ];
    
    for (const customer of customerData) {
      await db.insert(customers).values(customer);
    }

    console.log("¡Datos de prueba básicos insertados correctamente!");
    
  } catch (error) {
    console.error("Error al insertar datos de prueba:", error);
  }
}

seedDatabase()
  .then(() => {
    console.log("Script finalizado.");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Error en script:", error);
    process.exit(1);
  });