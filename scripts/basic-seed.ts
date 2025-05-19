import { db } from "../server/db";
import { 
  users, products, inventory, customers, transactions
} from "../shared/schema";
import { hash } from "bcrypt";

async function seedBasicData() {
  console.log("Insertando datos básicos para La Lupis ERP...");

  try {
    // Verificar si ya hay datos
    const existingUsers = await db.select().from(users).limit(1);
    if (existingUsers.length > 0) {
      console.log("La base de datos ya contiene datos. Omitiendo seed.");
      return;
    }

    console.log("Creando usuarios básicos...");
    // Crear usuarios
    const hashedPassword = await hash("lupis123", 10);
    const insertedUsers = await db.insert(users).values([
      {
        username: "admin",
        password: hashedPassword,
        name: "Administrador",
        email: "admin@lupis.com",
        role: "admin",
        active: true
      },
      {
        username: "vendedor",
        password: hashedPassword,
        name: "Juan Vendedor",
        email: "vendedor@lupis.com",
        role: "cashier",
        active: true
      }
    ]).returning();

    console.log("Creando productos básicos...");
    // Crear productos
    await db.insert(products).values([
      {
        name: "Manzana Roja",
        description: "Manzanas rojas frescas",
        category: "fruits",
        price: "35.90",
        cost: "25.50",
        unit: "kg",
        minStock: 10,
        isPerishable: true,
        imageUrl: "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400"
      },
      {
        name: "Plátano",
        description: "Plátanos maduros",
        category: "fruits",
        price: "29.90",
        cost: "18.50",
        unit: "kg",
        minStock: 8,
        isPerishable: true,
        imageUrl: "https://images.unsplash.com/photo-1543218024-57a70143c369?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400"
      },
      {
        name: "Zanahoria",
        description: "Zanahorias frescas",
        category: "vegetables",
        price: "19.90",
        cost: "12.50",
        unit: "kg",
        minStock: 15,
        isPerishable: true,
        imageUrl: "https://images.unsplash.com/photo-1590868309235-ea34bed7bd7f?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400"
      },
      {
        name: "Tomate",
        description: "Tomates frescos",
        category: "vegetables",
        price: "24.90",
        cost: "16.50",
        unit: "kg",
        minStock: 12,
        isPerishable: true,
        imageUrl: "https://images.unsplash.com/photo-1518977822534-7049a61ee0c2?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400"
      },
      {
        name: "Arroz",
        description: "Arroz blanco de grano largo",
        category: "groceries",
        price: "35.90",
        cost: "25.00",
        unit: "kg",
        minStock: 25,
        isPerishable: false,
        imageUrl: "https://images.unsplash.com/photo-1586201375761-83865001e31c?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400"
      },
      {
        name: "Frijol",
        description: "Frijol negro",
        category: "groceries",
        price: "42.00",
        cost: "32.00",
        unit: "kg",
        minStock: 20,
        isPerishable: false,
        imageUrl: "https://images.unsplash.com/photo-1608189617989-6b0f56b0e163?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400"
      }
    ]);

    console.log("Creando inventario para los productos...");
    // Obtener los productos para inventario
    const allProducts = await db.select().from(products);
    
    // Crear inventario para cada producto
    for (const product of allProducts) {
      let expiryDate = null;
      // Si es perecedero, asignar fecha de caducidad
      if (product.isPerishable) {
        const nextMonth = new Date();
        nextMonth.setDate(nextMonth.getDate() + 30);
        expiryDate = nextMonth.toISOString().split('T')[0]; // Formato YYYY-MM-DD
      }
      
      // Cantidad basada en stock mínimo
      const quantity = product.minStock * 2; // Doble del mínimo
      
      await db.insert(inventory).values({
        productId: product.id,
        quantity: quantity.toString(),
        expiryDate,
        location: "Tienda principal"
      });
    }

    console.log("Creando clientes básicos...");
    // Crear clientes
    await db.insert(customers).values([
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
      }
    ]);

    console.log("Creando transacciones de ejemplo...");
    // Crear algunas transacciones financieras de ejemplo
    await db.insert(transactions).values([
      {
        description: "Venta del día",
        amount: "157.70",
        category: "sales",
        type: "income",
        userId: insertedUsers[0].id, // Usar ID del administrador
        reference: "Factura #1001"
      },
      {
        description: "Compra de frutas y verduras",
        amount: "1200.00",
        category: "inventory",
        type: "expense",
        userId: insertedUsers[0].id, // Usar ID del administrador
        reference: "Factura Proveedor #123"
      }
    ]);

    console.log("¡Datos básicos insertados correctamente!");
    
  } catch (error) {
    console.error("Error al insertar datos básicos:", error);
  }
}

seedBasicData()
  .then(() => {
    console.log("Script finalizado.");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Error en script:", error);
    process.exit(1);
  });