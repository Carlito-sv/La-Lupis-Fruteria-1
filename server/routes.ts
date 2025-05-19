import express, { type Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertProductSchema, insertInventorySchema, insertSaleSchema, insertSaleItemSchema, insertEmployeeSchema, insertAttendanceSchema, insertTransactionSchema } from "@shared/schema";
import { zodToJsonSchema } from "zod-to-json-schema";
import { ZodError } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // API router
  const apiRouter = express.Router();
  app.use("/api", apiRouter);

  // Error handling middleware for zod validation
  const validateSchema = (schema: any) => {
    return (req: Request, res: Response, next: Function) => {
      try {
        req.body = schema.parse(req.body);
        next();
      } catch (error) {
        if (error instanceof ZodError) {
          res.status(400).json({
            message: "Validation error",
            errors: error.errors,
          });
        } else {
          next(error);
        }
      }
    };
  };

  // Auth routes
  apiRouter.post("/auth/login", async (req, res) => {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required" });
    }
    
    const user = await storage.getUserByUsername(username);
    
    if (!user || user.password !== password) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    
    // Exclude password from response
    const { password: _, ...userWithoutPassword } = user;
    
    res.json({
      user: userWithoutPassword,
      message: "Login successful"
    });
  });

  // Dashboard routes
  apiRouter.get("/statistics/dashboard", async (req, res) => {
    try {
      const dashboardData = await storage.getDashboardData();
      res.json(dashboardData);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      res.status(500).json({ message: "Failed to fetch dashboard data" });
    }
  });

  apiRouter.get("/statistics/sales", async (req, res) => {
    try {
      const timeRange = req.query.timeRange as string || "week";
      let startDate = new Date();
      let endDate = new Date();
      
      switch (timeRange) {
        case "week":
          startDate.setDate(startDate.getDate() - 7);
          break;
        case "lastWeek":
          endDate.setDate(endDate.getDate() - 7);
          startDate.setDate(startDate.getDate() - 14);
          break;
        case "month":
          startDate.setDate(startDate.getDate() - 30);
          break;
        default:
          startDate.setDate(startDate.getDate() - 7);
      }
      
      // Get daily sales data for the selected period
      const allSales = await storage.getTransactions('income', startDate, endDate);
      
      // Process data for chart display
      const dailyData: Record<string, number> = {};
      let currentDate = new Date(startDate);
      
      // Initialize all dates in the range with 0
      while (currentDate <= endDate) {
        const dateKey = currentDate.toISOString().split('T')[0];
        dailyData[dateKey] = 0;
        currentDate.setDate(currentDate.getDate() + 1);
      }
      
      // Fill in actual sales data
      allSales.forEach(transaction => {
        const dateKey = new Date(transaction.date).toISOString().split('T')[0];
        if (dailyData[dateKey] !== undefined) {
          dailyData[dateKey] += Number(transaction.amount);
        }
      });
      
      // Convert to array format for chart
      const chartData = Object.entries(dailyData).map(([date, sales]) => {
        const dayName = new Date(date).toLocaleDateString('es-ES', { weekday: 'short' });
        return {
          name: dayName,
          sales
        };
      });
      
      res.json({ data: chartData });
    } catch (error) {
      console.error("Error fetching sales statistics:", error);
      res.status(500).json({ message: "Failed to fetch sales statistics" });
    }
  });

  apiRouter.get("/products/top", async (req, res) => {
    try {
      const topProducts = await storage.getTopProducts(5);
      res.json(topProducts);
    } catch (error) {
      console.error("Error fetching top products:", error);
      res.status(500).json({ message: "Failed to fetch top products" });
    }
  });

  apiRouter.get("/inventory/alerts", async (req, res) => {
    try {
      // Get low stock alerts
      const lowStockProducts = await storage.getLowStockProducts();
      
      // Get products near expiry (within 7 days)
      const nearExpiryProducts = await storage.getNearExpiryProducts(7);
      
      // Combine and format the alerts
      const alerts = [
        ...lowStockProducts.map(product => ({
          id: product.id,
          type: "low_stock",
          product: product.name,
          details: `Quedan ${product.quantity}${product.unit} - Mínimo recomendado: ${product.min_stock}${product.unit}`
        })),
        ...nearExpiryProducts.map(product => ({
          id: product.id,
          type: "expiring",
          product: product.name,
          details: `Vence en ${product.days_until_expiry} días - ${product.quantity}${product.unit}`
        }))
      ];
      
      // Add out of stock alerts
      const outOfStockProducts = lowStockProducts.filter(product => product.quantity <= 0);
      const outOfStockAlerts = outOfStockProducts.map(product => ({
        id: product.id,
        type: "out_of_stock",
        product: product.name,
        details: `Agotado hace ${Math.abs(Math.min(0, product.days_out_of_stock || 0))} días`
      }));
      
      alerts.push(...outOfStockAlerts);
      
      res.json(alerts);
    } catch (error) {
      console.error("Error fetching inventory alerts:", error);
      res.status(500).json({ message: "Failed to fetch inventory alerts" });
    }
  });

  apiRouter.get("/transactions/recent", async (req, res) => {
    try {
      const recentSales = await storage.getRecentSales(5);
      
      // Format the sales data for display
      const formattedSales = recentSales.map(sale => ({
        id: sale.id,
        customer: {
          name: sale.customer_name || "Cliente Anónimo",
          initials: (sale.customer_name || "CA").split(' ').map((n: string) => n[0]).join(''),
          color: getRandomColor(sale.id)
        },
        items: parseInt(sale.item_count),
        amount: `$${parseFloat(sale.total).toFixed(2)}`,
        status: sale.status
      }));
      
      res.json(formattedSales);
    } catch (error) {
      console.error("Error fetching recent transactions:", error);
      res.status(500).json({ message: "Failed to fetch recent transactions" });
    }
  });

  apiRouter.get("/products/featured", async (req, res) => {
    try {
      // Get featured products from different categories
      const products = await storage.getProducts(20);
      
      // Group by category and take one from each
      const categoriesMap: Record<string, any[]> = {};
      products.forEach(product => {
        if (!categoriesMap[product.category]) {
          categoriesMap[product.category] = [];
        }
        categoriesMap[product.category].push(product);
      });
      
      const featuredProducts = Object.values(categoriesMap).map(categoryProducts => {
        const product = categoryProducts[0];
        return {
          id: product.id,
          name: getCategoryDisplayName(product.category),
          description: getCategoryDescription(product.category),
          price: getCategoryPriceRange(product.category),
          image: getCategoryImage(product.category),
          inStock: true,
          category: product.category
        };
      }).slice(0, 4);
      
      res.json(featuredProducts);
    } catch (error) {
      console.error("Error fetching featured products:", error);
      res.status(500).json({ message: "Failed to fetch featured products" });
    }
  });

  // Inventory routes
  apiRouter.get("/inventory/products", async (req, res) => {
    try {
      const products = await storage.getProducts();
      
      // For each product, get inventory information
      const productsWithInventory = await Promise.all(products.map(async (product) => {
        const inventoryItems = await storage.getInventoryByProduct(product.id);
        
        // Calculate total stock across all inventory records
        const totalStock = inventoryItems.reduce((sum, item) => sum + parseFloat(item.quantity.toString()), 0);
        
        // Check if any inventory item is close to expiry (within 7 days)
        const now = new Date();
        const expiringAlert = inventoryItems.some(item => {
          if (!item.expiryDate) return false;
          const expiryDate = new Date(item.expiryDate);
          const daysUntilExpiry = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
          return daysUntilExpiry <= 7 && daysUntilExpiry > 0;
        });
        
        // Get the closest expiry date
        const closestExpiryItem = inventoryItems
          .filter(item => item.expiryDate)
          .sort((a, b) => new Date(a.expiryDate!).getTime() - new Date(b.expiryDate!).getTime())[0];
        
        return {
          id: product.id,
          name: product.name,
          category: product.category,
          stock: totalStock,
          unit: product.unit,
          price: `$${parseFloat(product.price.toString()).toFixed(2)}`,
          expiryDate: closestExpiryItem?.expiryDate,
          image: getCategoryImage(product.category),
          lowStock: totalStock <= parseFloat(product.minStock?.toString() || "10"),
          expiringAlert
        };
      }));
      
      res.json(productsWithInventory);
    } catch (error) {
      console.error("Error fetching inventory products:", error);
      res.status(500).json({ message: "Failed to fetch inventory products" });
    }
  });

  // POS routes
  apiRouter.get("/pos/products", async (req, res) => {
    try {
      const products = await storage.getProducts();
      
      // For each product, get inventory information to check stock
      const availableProducts = await Promise.all(products.map(async (product) => {
        const inventoryItems = await storage.getInventoryByProduct(product.id);
        
        // Calculate total stock across all inventory records
        const totalStock = inventoryItems.reduce((sum, item) => sum + parseFloat(item.quantity.toString()), 0);
        
        // Only include products with stock > 0
        if (totalStock <= 0) return null;
        
        return {
          id: product.id,
          name: product.name,
          category: product.category,
          price: parseFloat(product.price.toString()),
          image: getCategoryImage(product.category),
          unit: product.unit
        };
      }));
      
      // Filter out null values (products with no stock)
      const filteredProducts = availableProducts.filter(product => product !== null);
      
      res.json(filteredProducts);
    } catch (error) {
      console.error("Error fetching POS products:", error);
      res.status(500).json({ message: "Failed to fetch POS products" });
    }
  });

  // Sales/Invoices routes
  apiRouter.get("/invoices", async (req, res) => {
    try {
      const recentSales = await storage.getRecentSales(100);
      
      // Format the sales data for display
      const formattedInvoices = recentSales.map(sale => ({
        id: sale.id,
        invoiceNumber: sale.invoice_number,
        customer: sale.customer_name || "Cliente Anónimo",
        date: new Date(sale.sale_date).toLocaleDateString('es-MX'),
        total: `$${parseFloat(sale.total).toFixed(2)}`,
        status: sale.status
      }));
      
      res.json(formattedInvoices);
    } catch (error) {
      console.error("Error fetching invoices:", error);
      res.status(500).json({ message: "Failed to fetch invoices" });
    }
  });

  // Finances routes
  apiRouter.get("/finances/summary", async (req, res) => {
    try {
      const period = req.query.period as string || "month";
      let startDate = new Date();
      let endDate = new Date();
      
      switch (period) {
        case "week":
          startDate.setDate(startDate.getDate() - 7);
          break;
        case "month":
          startDate.setDate(startDate.getDate() - 30);
          break;
        case "year":
          startDate.setDate(startDate.getDate() - 365);
          break;
        default:
          startDate.setDate(startDate.getDate() - 30);
      }
      
      const summary = await storage.getFinancialSummary(startDate, endDate);
      res.json(summary);
    } catch (error) {
      console.error("Error fetching financial summary:", error);
      res.status(500).json({ message: "Failed to fetch financial summary" });
    }
  });

  apiRouter.get("/finances/transactions", async (req, res) => {
    try {
      const period = req.query.period as string || "month";
      let startDate = new Date();
      let endDate = new Date();
      
      switch (period) {
        case "week":
          startDate.setDate(startDate.getDate() - 7);
          break;
        case "month":
          startDate.setDate(startDate.getDate() - 30);
          break;
        case "year":
          startDate.setDate(startDate.getDate() - 365);
          break;
        default:
          startDate.setDate(startDate.getDate() - 30);
      }
      
      const transactions = await storage.getTransactions(undefined, startDate, endDate);
      
      // Format transactions for display
      const formattedTransactions = transactions.map(transaction => ({
        id: transaction.id,
        date: new Date(transaction.date).toLocaleDateString('es-MX'),
        description: transaction.description,
        category: transaction.category,
        amount: parseFloat(transaction.amount.toString()),
        type: transaction.type
      }));
      
      res.json(formattedTransactions);
    } catch (error) {
      console.error("Error fetching financial transactions:", error);
      res.status(500).json({ message: "Failed to fetch financial transactions" });
    }
  });

  // Staff routes
  apiRouter.get("/staff/employees", async (req, res) => {
    try {
      const employees = await storage.getEmployees();
      
      // Format employees for display
      const formattedEmployees = employees.map(employee => ({
        id: employee.id,
        name: employee.name,
        position: employee.position,
        status: employee.status,
        email: employee.email || "No email",
        phone: employee.phone || "No phone",
        joinDate: employee.joinDate ? new Date(employee.joinDate).toLocaleDateString('es-MX') : "N/A"
      }));
      
      res.json(formattedEmployees);
    } catch (error) {
      console.error("Error fetching employees:", error);
      res.status(500).json({ message: "Failed to fetch employees" });
    }
  });

  apiRouter.get("/staff/attendance", async (req, res) => {
    try {
      const date = req.query.date as string;
      const records = await storage.getAttendanceRecords(date);
      res.json(records);
    } catch (error) {
      console.error("Error fetching attendance records:", error);
      res.status(500).json({ message: "Failed to fetch attendance records" });
    }
  });

  // Settings routes
  apiRouter.get("/settings", async (req, res) => {
    try {
      const allSettings = await storage.getAllSettings();
      
      // Parse settings to create a structured object
      const parsedSettings: any = {};
      
      Object.entries(allSettings).forEach(([key, value]) => {
        // Try to parse as JSON if possible
        let parsedValue;
        try {
          parsedValue = JSON.parse(value);
        } catch (e) {
          parsedValue = value;
        }
        
        // Split key by dots to create nested structure
        const keyParts = key.split('.');
        let currentObj = parsedSettings;
        
        keyParts.forEach((part, index) => {
          if (index === keyParts.length - 1) {
            currentObj[part] = parsedValue;
          } else {
            if (!currentObj[part]) {
              currentObj[part] = {};
            }
            currentObj = currentObj[part];
          }
        });
      });
      
      res.json(parsedSettings);
    } catch (error) {
      console.error("Error fetching settings:", error);
      res.status(500).json({ message: "Failed to fetch settings" });
    }
  });

  // Schema routes - for frontend reference
  apiRouter.get("/schemas", (req, res) => {
    const schemas = {
      user: zodToJsonSchema(insertUserSchema),
      product: zodToJsonSchema(insertProductSchema),
      inventory: zodToJsonSchema(insertInventorySchema),
      sale: zodToJsonSchema(insertSaleSchema),
      saleItem: zodToJsonSchema(insertSaleItemSchema),
      employee: zodToJsonSchema(insertEmployeeSchema),
      attendance: zodToJsonSchema(insertAttendanceSchema),
      transaction: zodToJsonSchema(insertTransactionSchema)
    };
    
    res.json(schemas);
  });

  // Helper function to get a random color based on ID
  function getRandomColor(id: number): string {
    const colors = ['blue', 'purple', 'green', 'red', 'orange', 'amber', 'emerald', 'teal', 'cyan', 'indigo'];
    return colors[id % colors.length];
  }

  // Helper functions for category display
  function getCategoryDisplayName(category: string): string {
    const displayNames: Record<string, string> = {
      fruits: "Frutas Frescas",
      vegetables: "Verduras Orgánicas",
      groceries: "Abarrotes Básicos",
      dairy: "Lácteos",
      meat: "Carnes",
      beverages: "Bebidas",
      pos: "Sistema de Venta"
    };
    
    return displayNames[category] || category;
  }

  function getCategoryDescription(category: string): string {
    const descriptions: Record<string, string> = {
      fruits: "Amplia variedad de frutas de temporada",
      vegetables: "Cultivadas sin pesticidas ni químicos",
      groceries: "Todo lo esencial para tu hogar",
      dairy: "Productos lácteos frescos",
      meat: "Carnes frescas y de calidad",
      beverages: "Refrescos, aguas y bebidas",
      pos: "Rápido y eficiente para atender clientes"
    };
    
    return descriptions[category] || "Productos de calidad";
  }

  function getCategoryPriceRange(category: string): string {
    const priceRanges: Record<string, string> = {
      fruits: "Desde $18.90/kg",
      vegetables: "Desde $12.50/kg",
      groceries: "Precios competitivos",
      dairy: "Variedad de precios",
      meat: "Cortes selectos",
      beverages: "Desde $15.00",
      pos: "Siempre disponible"
    };
    
    return priceRanges[category] || "Consulta precios";
  }

  function getCategoryImage(category: string): string {
    const images: Record<string, string> = {
      fruits: "https://images.unsplash.com/photo-1542838132-92c53300491e?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400",
      vegetables: "https://images.unsplash.com/photo-1467453678174-768ec283a940?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400",
      groceries: "https://images.unsplash.com/photo-1578916171728-46686eac8d58?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400",
      dairy: "https://images.unsplash.com/photo-1550583724-b2692b85b150?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400",
      meat: "https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400",
      beverages: "https://images.unsplash.com/photo-1551024709-8f23befc6f87?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400",
      pos: "https://images.unsplash.com/photo-1556740738-b6a63e27c4df?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400"
    };
    
    return images[category] || "https://images.unsplash.com/photo-1542838132-92c53300491e?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400";
  }

  const httpServer = createServer(app);
  return httpServer;
}
