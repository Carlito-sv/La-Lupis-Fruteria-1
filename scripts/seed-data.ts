import { db } from "../server/db";
import { 
  users, products, inventory, customers, sales, saleItems,
  transactions, suppliers, employees, attendance, settings
} from "../shared/schema";
import { hash } from "bcrypt";

async function seedDatabase() {
  console.log("Iniciando inserción de datos de prueba para La Lupis ERP...");

  try {
    // Verificar si ya hay datos
    const existingUsers = await db.select().from(users).limit(1);
    if (existingUsers.length > 0) {
      console.log("La base de datos ya contiene datos. Omitiendo seed.");
      return;
    }

    console.log("Creando usuarios...");
    // Crear usuarios admin y empleado
    const hashedPassword = await hash("lupis123", 10);
    const [adminUser, vendedorUser, almacenUser] = await db.insert(users).values([
      {
        username: "admin",
        password: hashedPassword,
        email: "admin@lupis.com",
        name: "Administrador",
        role: "admin",
      },
      {
        username: "vendedor1",
        password: hashedPassword,
        email: "vendedor@lupis.com",
        name: "Juan Vendedor",
        role: "cashier",
      },
      {
        username: "almacen",
        password: hashedPassword,
        email: "almacen@lupis.com",
        name: "María Inventario",
        role: "inventory",
      }
    ]).returning();

    console.log("Creando productos...");
    // Crear productos
    const productData = [
      {
        name: "Manzana Roja",
        description: "Manzanas rojas frescas",
        category: "fruits",
        price: 35.90,
        costPrice: 25.50,
        unit: "kg",
        minStock: 10,
        code: "FR-001",
        isPerishable: true,
        imageUrl: "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400"
      },
      {
        name: "Plátano",
        description: "Plátanos maduros",
        category: "fruits",
        price: 29.90,
        costPrice: 18.50,
        unit: "kg",
        minStock: 8,
        code: "FR-002",
        isPerishable: true,
        imageUrl: "https://images.unsplash.com/photo-1543218024-57a70143c369?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400"
      },
      {
        name: "Zanahoria",
        description: "Zanahorias frescas",
        category: "vegetables",
        price: 19.90,
        costPrice: 12.50,
        unit: "kg",
        minStock: 15,
        code: "VG-001",
        isPerishable: true,
        imageUrl: "https://images.unsplash.com/photo-1590868309235-ea34bed7bd7f?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400"
      },
      {
        name: "Tomate",
        description: "Tomates frescos",
        category: "vegetables",
        price: 24.90,
        costPrice: 16.50,
        unit: "kg",
        minStock: 12,
        code: "VG-002",
        isPerishable: true,
        imageUrl: "https://images.unsplash.com/photo-1518977822534-7049a61ee0c2?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400"
      },
      {
        name: "Leche",
        description: "Leche entera",
        category: "dairy",
        price: 25.50,
        costPrice: 19.00,
        unit: "l",
        minStock: 20,
        code: "DR-001",
        isPerishable: true,
        imageUrl: "https://images.unsplash.com/photo-1563636619-e9143da7973b?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400"
      },
      {
        name: "Queso Fresco",
        description: "Queso fresco artesanal",
        category: "dairy",
        price: 110.00,
        costPrice: 85.00,
        unit: "kg",
        minStock: 5,
        code: "DR-002",
        isPerishable: true,
        imageUrl: "https://images.unsplash.com/photo-1552767059-ce182eda6a73?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400"
      },
      {
        name: "Arroz",
        description: "Arroz blanco de grano largo",
        category: "groceries",
        price: 35.90,
        costPrice: 25.00,
        unit: "kg",
        minStock: 25,
        code: "GR-001",
        isPerishable: false,
        imageUrl: "https://images.unsplash.com/photo-1586201375761-83865001e31c?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400"
      },
      {
        name: "Frijol",
        description: "Frijol negro",
        category: "groceries",
        price: 42.00,
        costPrice: 32.00,
        unit: "kg",
        minStock: 20,
        code: "GR-002",
        isPerishable: false,
        imageUrl: "https://images.unsplash.com/photo-1608189617989-6b0f56b0e163?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400"
      },
      {
        name: "Azúcar",
        description: "Azúcar refinada",
        category: "groceries",
        price: 28.50,
        costPrice: 19.00,
        unit: "kg",
        minStock: 15,
        code: "GR-003",
        isPerishable: false,
        imageUrl: "https://images.unsplash.com/photo-1581351721010-8cf859cb14a4?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400"
      },
      {
        name: "Aceite",
        description: "Aceite vegetal",
        category: "groceries",
        price: 45.00,
        costPrice: 35.00,
        unit: "l",
        minStock: 10,
        code: "GR-004",
        isPerishable: false,
        imageUrl: "https://images.unsplash.com/photo-1599789197514-47270cd526b4?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400"
      },
      {
        name: "Refresco Cola",
        description: "Refresco sabor cola",
        category: "beverages",
        price: 18.00,
        costPrice: 12.00,
        unit: "unit",
        minStock: 30,
        code: "BV-001",
        isPerishable: false,
        imageUrl: "https://images.unsplash.com/photo-1624552184280-9e9631abbebd?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400"
      },
      {
        name: "Agua Embotellada",
        description: "Agua purificada",
        category: "beverages",
        price: 12.00,
        costPrice: 7.00,
        unit: "unit",
        minStock: 50,
        code: "BV-002",
        isPerishable: false,
        imageUrl: "https://images.unsplash.com/photo-1553564559-d9d1f8e03f11?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400"
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
        address: "N/A",
        notes: "Cliente para ventas generales"
      },
      {
        name: "María López",
        email: "maria@example.com",
        phone: "5551234567",
        address: "Calle Principal 123",
        notes: "Cliente frecuente"
      },
      {
        name: "Juan Pérez",
        email: "juan@example.com",
        phone: "5559876543",
        address: "Avenida Central 456",
        notes: "Prefiere productos orgánicos"
      },
      {
        name: "Restaurant El Buen Sabor",
        email: "restaurante@example.com",
        phone: "5552223333",
        address: "Plaza Central 789",
        notes: "Compra por mayoreo"
      }
    ];
    
    for (const customer of customerData) {
      await db.insert(customers).values(customer);
    }

    console.log("Creando proveedores...");
    // Crear proveedores
    const supplierData = [
      {
        name: "Frutas del Campo",
        contactName: "Roberto González",
        email: "frutas@example.com",
        phone: "5551112222",
        address: "Camino Rural 123",
        category: "fruits"
      },
      {
        name: "Verduras Frescas S.A.",
        contactName: "Ana Martínez",
        email: "verduras@example.com",
        phone: "5553334444",
        address: "Carretera Norte 456",
        category: "vegetables"
      },
      {
        name: "Distribuidora de Abarrotes",
        contactName: "Carlos Rodríguez",
        email: "abarrotes@example.com",
        phone: "5555556666",
        address: "Avenida Industrial 789",
        category: "groceries"
      },
      {
        name: "Lácteos La Vaca",
        contactName: "Laura Sánchez",
        email: "lacteos@example.com",
        phone: "5557778888",
        address: "Rancho El Encanto",
        category: "dairy"
      }
    ];
    
    for (const supplier of supplierData) {
      await db.insert(suppliers).values(supplier);
    }

    console.log("Creando empleados...");
    // Crear empleados
    const employeeData = [
      {
        name: "José Gómez",
        position: "Gerente",
        email: "jose@lupis.com",
        phone: "5551231234",
        status: "active",
        joinDate: new Date(2022, 0, 15),
        notes: "Encargado de la tienda",
        userId: 1 // Admin
      },
      {
        name: "Juan Vendedor",
        position: "Cajero",
        email: "vendedor@lupis.com",
        phone: "5552342345",
        status: "active",
        joinDate: new Date(2022, 3, 10),
        notes: "Turno matutino",
        userId: 2 // Vendedor
      },
      {
        name: "María Inventario",
        position: "Encargada de Inventario",
        email: "almacen@lupis.com",
        phone: "5553453456",
        status: "active",
        joinDate: new Date(2022, 6, 5),
        notes: "Responsable de almacén",
        userId: 3 // Almacen
      },
      {
        name: "Pedro Ayudante",
        position: "Ayudante General",
        email: "pedro@lupis.com",
        phone: "5554564567",
        status: "active",
        joinDate: new Date(2023, 1, 20),
        notes: "Apoyo en diversas áreas"
      }
    ];
    
    for (const employee of employeeData) {
      await db.insert(employees).values(employee);
    }

    console.log("Creando ventas e items de venta...");
    // Crear ventas y items de venta
    const allCustomers = await db.select().from(customers);
    
    // Fechas para las ventas
    const today2 = new Date();
    const yesterday = new Date(today2);
    yesterday.setDate(today2.getDate() - 1);
    
    const twoDaysAgo = new Date(today2);
    twoDaysAgo.setDate(today2.getDate() - 2);
    
    const threeDaysAgo = new Date(today2);
    threeDaysAgo.setDate(today2.getDate() - 3);
    
    // Crear algunas ventas
    const salesData = [
      {
        customerId: allCustomers[0].id, // Cliente general
        employeeId: 2, // Juan Vendedor
        saleDate: today2,
        total: 157.70,
        subtotal: 136.00,
        tax: 21.70,
        discount: 0,
        paymentMethod: "cash",
        status: "paid",
        notes: "Venta del día"
      },
      {
        customerId: allCustomers[1].id, // María López
        employeeId: 2, // Juan Vendedor
        saleDate: today2,
        total: 230.50,
        subtotal: 195.00,
        tax: 35.50,
        discount: 0,
        paymentMethod: "card",
        status: "paid",
        notes: "Cliente frecuente"
      },
      {
        customerId: allCustomers[3].id, // Restaurant El Buen Sabor
        employeeId: 1, // José Gómez
        saleDate: yesterday,
        total: 845.00,
        subtotal: 750.00,
        tax: 120.00,
        discount: 25.00,
        paymentMethod: "transfer",
        status: "paid",
        notes: "Compra para restaurante"
      },
      {
        customerId: allCustomers[2].id, // Juan Pérez
        employeeId: 2, // Juan Vendedor
        saleDate: twoDaysAgo,
        total: 125.80,
        subtotal: 108.00,
        tax: 17.80,
        discount: 0,
        paymentMethod: "cash",
        status: "paid",
        notes: ""
      },
      {
        customerId: allCustomers[0].id, // Cliente general
        employeeId: 2, // Juan Vendedor
        saleDate: threeDaysAgo,
        total: 78.20,
        subtotal: 67.00,
        tax: 11.20,
        discount: 0,
        paymentMethod: "cash",
        status: "paid",
        notes: ""
      }
    ];
    
    // Crear ventas y sus items
    for (let i = 0; i < salesData.length; i++) {
      // Añadir número de factura
      const invoiceNumber = `INV-${2023000 + i}`;
      const [sale] = await db.insert(sales).values({
        ...salesData[i], 
        invoiceNumber
      }).returning();
      
      // Agregar items a la venta basado en los productos
      const numItems = Math.floor(Math.random() * 4) + 1; // 1 a 4 items por venta
      const selectedProductsIndices = new Set();
      
      while (selectedProductsIndices.size < numItems) {
        selectedProductsIndices.add(Math.floor(Math.random() * allProducts.length));
      }
      
      for (const index of selectedProductsIndices) {
        const product = allProducts[index];
        const quantity = Math.floor(Math.random() * 3) + 1; // 1 a 3 unidades/kg
        
        await db.insert(saleItems).values({
          saleId: sale.id,
          productId: product.id,
          quantity,
          unitPrice: product.price,
          total: product.price * quantity
        });
        
        // Actualizar inventario (reducir cantidad)
        const [inventoryItem] = await db.select().from(inventory).where({ productId: product.id });
        
        await db.update(inventory)
          .set({ 
            quantity: inventoryItem.quantity - quantity,
            lastUpdated: new Date()
          })
          .where({ id: inventoryItem.id });
      }
    }

    console.log("Creando transacciones financieras...");
    // Crear transacciones financieras
    
    // Ingresos (basados en las ventas)
    for (let i = 0; i < salesData.length; i++) {
      await db.insert(transactions).values({
        date: salesData[i].saleDate,
        amount: salesData[i].total,
        type: "income",
        category: "sales",
        description: `Venta #${i+1}`,
        reference: `Factura #${1000 + i}`,
        status: "paid",
        notes: ""
      });
    }
    
    // Gastos
    const expenseData = [
      {
        date: yesterday,
        amount: 5000.00,
        type: "expense",
        category: "inventory",
        description: "Compra de frutas y verduras",
        reference: "Factura Proveedor #123",
        status: "paid",
        notes: "Compra semanal"
      },
      {
        date: twoDaysAgo,
        amount: 1200.00,
        type: "expense",
        category: "rent",
        description: "Renta del local",
        reference: "Recibo #456",
        status: "paid",
        notes: "Mes en curso"
      },
      {
        date: threeDaysAgo,
        amount: 800.00,
        type: "expense",
        category: "utilities",
        description: "Electricidad",
        reference: "Recibo CFE",
        status: "paid",
        notes: ""
      },
      {
        date: threeDaysAgo,
        amount: 600.00,
        type: "expense",
        category: "utilities",
        description: "Agua",
        reference: "Recibo AyMAP",
        status: "paid",
        notes: ""
      }
    ];
    
    for (const expense of expenseData) {
      await db.insert(transactions).values(expense);
    }

    console.log("Creando registros de asistencia...");
    // Crear registros de asistencia
    const allEmployees = await db.select().from(employees);
    
    for (const employee of allEmployees) {
      // Asistencia para hoy
      await db.insert(attendance).values({
        employeeId: employee.id,
        date: today,
        checkIn: "08:00",
        checkOut: employee.id === allEmployees.length ? "" : "17:00", // El último sin checkout
        hoursWorked: employee.id === allEmployees.length ? 0 : 9,
        status: employee.id === allEmployees.length ? "present" : "present"
      });
      
      // Asistencia para ayer
      await db.insert(attendance).values({
        employeeId: employee.id,
        date: yesterday,
        checkIn: employee.id === 2 ? "08:15" : "08:00", // Uno llegó tarde
        checkOut: "17:00",
        hoursWorked: employee.id === 2 ? 8.75 : 9,
        status: employee.id === 2 ? "late" : "present"
      });
    }

    console.log("Creando configuraciones...");
    // Crear configuraciones
    const settingsData = [
      {
        key: "store_name",
        value: "La Lupis - Abarrotes y Verduras",
        category: "general"
      },
      {
        key: "store_address",
        value: "Calle Principal #123, Colonia Centro",
        category: "general"
      },
      {
        key: "store_phone",
        value: "555-123-4567",
        category: "general"
      },
      {
        key: "store_email",
        value: "contacto@lupis.com",
        category: "general"
      },
      {
        key: "tax_rate",
        value: "16",
        category: "finance"
      },
      {
        key: "currency",
        value: "MXN",
        category: "finance"
      },
      {
        key: "receipt_footer",
        value: "¡Gracias por su compra! Vuelva pronto.",
        category: "invoice"
      },
      {
        key: "low_stock_alert",
        value: "true",
        category: "inventory"
      },
      {
        key: "expiry_alert_days",
        value: "7",
        category: "inventory"
      }
    ];
    
    for (const setting of settingsData) {
      await db.insert(settings).values(setting);
    }

    console.log("¡Datos de prueba insertados correctamente!");
    
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