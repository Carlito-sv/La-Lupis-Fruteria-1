import { db } from "./db";
import { eq, gt, lt, lte, and, desc, sql, inArray, isNull, or } from "drizzle-orm";
import {
  users, customers, products, inventory, sales, saleItems,
  suppliers, purchases, purchaseItems, employees, attendance,
  transactions, settings,
  type User, type InsertUser,
  type Customer, type InsertCustomer,
  type Product, type InsertProduct,
  type Inventory, type InsertInventory,
  type Sale, type InsertSale,
  type SaleItem, type InsertSaleItem,
  type Supplier, type InsertSupplier,
  type Purchase, type InsertPurchase,
  type PurchaseItem, type InsertPurchaseItem,
  type Employee, type InsertEmployee,
  type Attendance, type InsertAttendance,
  type Transaction, type InsertTransaction,
  type Setting, type InsertSetting
} from "@shared/schema";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, data: Partial<InsertUser>): Promise<User | undefined>;
  deleteUser(id: number): Promise<boolean>;

  // Products
  getProduct(id: number): Promise<Product | undefined>;
  getProducts(limit?: number, offset?: number): Promise<Product[]>;
  getProductsByCategory(category: string): Promise<Product[]>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, data: Partial<InsertProduct>): Promise<Product | undefined>;
  deleteProduct(id: number): Promise<boolean>;
  
  // Inventory
  getInventoryItem(id: number): Promise<Inventory | undefined>;
  getInventoryByProduct(productId: number): Promise<Inventory[]>;
  getLowStockProducts(): Promise<any[]>;
  getNearExpiryProducts(days: number): Promise<any[]>;
  updateInventoryQuantity(productId: number, quantity: number): Promise<Inventory | undefined>;
  createInventoryItem(item: InsertInventory): Promise<Inventory>;
  
  // Sales
  getSale(id: number): Promise<Sale | undefined>;
  getSaleWithItems(id: number): Promise<{ sale: Sale, items: SaleItem[] } | undefined>;
  getRecentSales(limit?: number): Promise<any[]>;
  createSale(sale: InsertSale, items: InsertSaleItem[]): Promise<{ sale: Sale, items: SaleItem[] }>;
  
  // Financial
  getTransactions(type?: string, startDate?: Date, endDate?: Date): Promise<Transaction[]>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  getFinancialSummary(startDate: Date, endDate: Date): Promise<any>;
  
  // Employees
  getEmployee(id: number): Promise<Employee | undefined>;
  getEmployees(): Promise<Employee[]>;
  createEmployee(employee: InsertEmployee): Promise<Employee>;
  createAttendanceRecord(record: InsertAttendance): Promise<Attendance>;
  getAttendanceRecords(date?: string): Promise<any[]>;
  
  // Settings
  getSetting(key: string): Promise<string | undefined>;
  updateSetting(key: string, value: string): Promise<void>;
  getAllSettings(): Promise<Record<string, string>>;
  
  // Dashboard
  getDashboardData(): Promise<any>;
  getTopProducts(limit?: number): Promise<any[]>;
}

export class DatabaseStorage implements IStorage {
  // User Methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async updateUser(id: number, data: Partial<InsertUser>): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set(data)
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async deleteUser(id: number): Promise<boolean> {
    const result = await db
      .delete(users)
      .where(eq(users.id, id))
      .returning({ id: users.id });
    return result.length > 0;
  }

  // Product Methods
  async getProduct(id: number): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product;
  }

  async getProducts(limit = 100, offset = 0): Promise<Product[]> {
    return db.select().from(products).limit(limit).offset(offset);
  }

  async getProductsByCategory(category: string): Promise<Product[]> {
    return db.select().from(products).where(eq(products.category, category));
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const [newProduct] = await db
      .insert(products)
      .values(product)
      .returning();
    return newProduct;
  }

  async updateProduct(id: number, data: Partial<InsertProduct>): Promise<Product | undefined> {
    const [product] = await db
      .update(products)
      .set(data)
      .where(eq(products.id, id))
      .returning();
    return product;
  }

  async deleteProduct(id: number): Promise<boolean> {
    const result = await db
      .delete(products)
      .where(eq(products.id, id))
      .returning({ id: products.id });
    return result.length > 0;
  }

  // Inventory Methods
  async getInventoryItem(id: number): Promise<Inventory | undefined> {
    const [item] = await db.select().from(inventory).where(eq(inventory.id, id));
    return item;
  }

  async getInventoryByProduct(productId: number): Promise<Inventory[]> {
    return db.select().from(inventory).where(eq(inventory.productId, productId));
  }

  async getLowStockProducts(): Promise<any[]> {
    return db.execute(sql`
      SELECT p.id, p.name, p.category, p.min_stock, i.quantity, p.unit, i.expiry_date
      FROM ${products} p
      JOIN ${inventory} i ON p.id = i.product_id
      WHERE i.quantity <= p.min_stock
      ORDER BY (i.quantity / p.min_stock) ASC
    `);
  }

  async getNearExpiryProducts(days: number): Promise<any[]> {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);
    
    return db.execute(sql`
      SELECT p.id, p.name, p.category, i.quantity, p.unit, i.expiry_date,
             (i.expiry_date - CURRENT_DATE) as days_until_expiry
      FROM ${products} p
      JOIN ${inventory} i ON p.id = i.product_id
      WHERE p.is_perishable = true
        AND i.expiry_date IS NOT NULL
        AND i.expiry_date <= ${futureDate.toISOString()}
        AND i.expiry_date >= CURRENT_DATE
        AND i.quantity > 0
      ORDER BY i.expiry_date ASC
    `);
  }

  async updateInventoryQuantity(productId: number, quantity: number): Promise<Inventory | undefined> {
    const [existingInventory] = await db
      .select()
      .from(inventory)
      .where(eq(inventory.productId, productId))
      .orderBy(desc(inventory.expiryDate));

    if (existingInventory) {
      const [updatedInventory] = await db
        .update(inventory)
        .set({ 
          quantity: sql`${inventory.quantity} + ${quantity}`,
          lastUpdated: new Date()
        })
        .where(eq(inventory.id, existingInventory.id))
        .returning();
      return updatedInventory;
    }
    
    return undefined;
  }

  async createInventoryItem(item: InsertInventory): Promise<Inventory> {
    const [newItem] = await db
      .insert(inventory)
      .values(item)
      .returning();
    return newItem;
  }

  // Sales Methods
  async getSale(id: number): Promise<Sale | undefined> {
    const [sale] = await db.select().from(sales).where(eq(sales.id, id));
    return sale;
  }

  async getSaleWithItems(id: number): Promise<{ sale: Sale, items: SaleItem[] } | undefined> {
    const [sale] = await db.select().from(sales).where(eq(sales.id, id));
    if (!sale) return undefined;
    
    const items = await db
      .select()
      .from(saleItems)
      .where(eq(saleItems.saleId, id));
    
    return { sale, items };
  }

  async getRecentSales(limit = 10): Promise<any[]> {
    return db.execute(sql`
      SELECT s.id, s.invoice_number, c.name as customer_name, s.sale_date, s.total, s.status,
             COUNT(si.id) as item_count
      FROM ${sales} s
      LEFT JOIN ${customers} c ON s.customer_id = c.id
      LEFT JOIN ${saleItems} si ON s.id = si.sale_id
      GROUP BY s.id, c.name
      ORDER BY s.sale_date DESC
      LIMIT ${limit}
    `);
  }

  async createSale(saleData: InsertSale, itemsData: InsertSaleItem[]): Promise<{ sale: Sale, items: SaleItem[] }> {
    // Start a transaction
    return await db.transaction(async (tx) => {
      // Insert the sale
      const [sale] = await tx
        .insert(sales)
        .values(saleData)
        .returning();
      
      // Insert all the sale items
      const saleItemsWithSaleId = itemsData.map(item => ({
        ...item,
        saleId: sale.id
      }));
      
      const items = await tx
        .insert(saleItems)
        .values(saleItemsWithSaleId)
        .returning();
      
      // Update inventory for each item
      for (const item of itemsData) {
        // Get the product's inventory
        const [inventoryItem] = await tx
          .select()
          .from(inventory)
          .where(eq(inventory.productId, item.productId))
          .orderBy(desc(inventory.expiryDate));
        
        if (inventoryItem) {
          // Update inventory quantity
          await tx
            .update(inventory)
            .set({ 
              quantity: sql`${inventory.quantity} - ${item.quantity}`,
              lastUpdated: new Date()
            })
            .where(eq(inventory.id, inventoryItem.id));
        }
      }
      
      return { sale, items };
    });
  }

  // Financial Methods
  async getTransactions(type?: string, startDate?: Date, endDate?: Date): Promise<Transaction[]> {
    let query = db.select().from(transactions);
    
    if (type) {
      query = query.where(eq(transactions.type, type));
    }
    
    if (startDate) {
      query = query.where(gte(transactions.date, startDate));
    }
    
    if (endDate) {
      query = query.where(lte(transactions.date, endDate));
    }
    
    return query.orderBy(desc(transactions.date));
  }

  async createTransaction(transaction: InsertTransaction): Promise<Transaction> {
    const [newTransaction] = await db
      .insert(transactions)
      .values(transaction)
      .returning();
    return newTransaction;
  }

  async getFinancialSummary(startDate: Date, endDate: Date): Promise<any> {
    const [income] = await db.execute(sql`
      SELECT COALESCE(SUM(amount), 0) as total
      FROM ${transactions}
      WHERE type = 'income'
      AND date BETWEEN ${startDate.toISOString()} AND ${endDate.toISOString()}
    `);
    
    const [expenses] = await db.execute(sql`
      SELECT COALESCE(SUM(amount), 0) as total
      FROM ${transactions}
      WHERE type = 'expense'
      AND date BETWEEN ${startDate.toISOString()} AND ${endDate.toISOString()}
    `);
    
    const expensesBreakdown = await db.execute(sql`
      SELECT category, COALESCE(SUM(amount), 0) as value
      FROM ${transactions}
      WHERE type = 'expense'
      AND date BETWEEN ${startDate.toISOString()} AND ${endDate.toISOString()}
      GROUP BY category
    `);
    
    const incomeByDay = await db.execute(sql`
      SELECT to_char(date, 'Dy') as name, COALESCE(SUM(amount), 0) as income
      FROM ${transactions}
      WHERE type = 'income'
      AND date BETWEEN ${startDate.toISOString()} AND ${endDate.toISOString()}
      GROUP BY to_char(date, 'Dy'), to_char(date, 'ID')
      ORDER BY to_char(date, 'ID')
    `);
    
    // Calculate previous period for comparison
    const daysDiff = Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const prevStartDate = new Date(startDate);
    prevStartDate.setDate(prevStartDate.getDate() - daysDiff - 1);
    const prevEndDate = new Date(startDate);
    prevEndDate.setDate(prevEndDate.getDate() - 1);
    
    const [prevIncome] = await db.execute(sql`
      SELECT COALESCE(SUM(amount), 0) as total
      FROM ${transactions}
      WHERE type = 'income'
      AND date BETWEEN ${prevStartDate.toISOString()} AND ${prevEndDate.toISOString()}
    `);
    
    const [prevExpenses] = await db.execute(sql`
      SELECT COALESCE(SUM(amount), 0) as total
      FROM ${transactions}
      WHERE type = 'expense'
      AND date BETWEEN ${prevStartDate.toISOString()} AND ${prevEndDate.toISOString()}
    `);
    
    const incomeTotal = parseFloat(income.total) || 0;
    const expensesTotal = parseFloat(expenses.total) || 0;
    const prevIncomeTotal = parseFloat(prevIncome.total) || 0;
    const prevExpensesTotal = parseFloat(prevExpenses.total) || 0;
    
    const incomeChange = prevIncomeTotal > 0 
      ? Math.round(((incomeTotal - prevIncomeTotal) / prevIncomeTotal) * 100) 
      : 0;
      
    const expensesChange = prevExpensesTotal > 0 
      ? Math.round(((expensesTotal - prevExpensesTotal) / prevExpensesTotal) * 100) 
      : 0;
      
    const netProfit = incomeTotal - expensesTotal;
    const prevNetProfit = prevIncomeTotal - prevExpensesTotal;
    const netProfitChange = prevNetProfit !== 0 
      ? Math.round(((netProfit - prevNetProfit) / Math.abs(prevNetProfit)) * 100) 
      : 0;
    
    return {
      income: incomeTotal.toFixed(2),
      expenses: expensesTotal.toFixed(2),
      netProfit: netProfit.toFixed(2),
      incomeChange: `${incomeChange}%`,
      expensesChange: `${expensesChange}%`,
      netProfitChange: `${netProfitChange}%`,
      expensesBreakdown,
      incomeByDay
    };
  }

  // Employee Methods
  async getEmployee(id: number): Promise<Employee | undefined> {
    const [employee] = await db.select().from(employees).where(eq(employees.id, id));
    return employee;
  }

  async getEmployees(): Promise<Employee[]> {
    return db.select().from(employees);
  }

  async createEmployee(employee: InsertEmployee): Promise<Employee> {
    const [newEmployee] = await db
      .insert(employees)
      .values(employee)
      .returning();
    return newEmployee;
  }

  async createAttendanceRecord(record: InsertAttendance): Promise<Attendance> {
    const [newRecord] = await db
      .insert(attendance)
      .values(record)
      .returning();
    return newRecord;
  }

  async getAttendanceRecords(date?: string): Promise<any[]> {
    let query = db.select({
      id: attendance.id,
      employeeId: attendance.employeeId,
      employeeName: employees.name,
      date: attendance.date,
      checkIn: attendance.checkIn,
      checkOut: attendance.checkOut,
      hoursWorked: attendance.hoursWorked,
      status: attendance.status,
      notes: attendance.notes
    })
    .from(attendance)
    .innerJoin(employees, eq(attendance.employeeId, employees.id));
    
    if (date) {
      query = query.where(eq(attendance.date, date));
    }
    
    return query.orderBy(desc(attendance.date));
  }

  // Settings Methods
  async getSetting(key: string): Promise<string | undefined> {
    const [setting] = await db
      .select()
      .from(settings)
      .where(eq(settings.key, key));
    
    return setting?.value;
  }

  async updateSetting(key: string, value: string): Promise<void> {
    const [existing] = await db
      .select()
      .from(settings)
      .where(eq(settings.key, key));
    
    if (existing) {
      await db
        .update(settings)
        .set({ value, updatedAt: new Date() })
        .where(eq(settings.key, key));
    } else {
      await db
        .insert(settings)
        .values({ key, value });
    }
  }

  async getAllSettings(): Promise<Record<string, string>> {
    const allSettings = await db.select().from(settings);
    return allSettings.reduce((acc, { key, value }) => {
      acc[key] = value;
      return acc;
    }, {} as Record<string, string>);
  }

  // Dashboard Methods
  async getDashboardData(): Promise<any> {
    // Get today's date
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Get yesterday's date
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    // Get today's sales
    const [todaySales] = await db.execute(sql`
      SELECT COALESCE(SUM(total), 0) as total
      FROM ${sales}
      WHERE sale_date >= ${today.toISOString()}
    `);
    
    // Get yesterday's sales
    const [yesterdaySales] = await db.execute(sql`
      SELECT COALESCE(SUM(total), 0) as total
      FROM ${sales}
      WHERE sale_date >= ${yesterday.toISOString()} AND sale_date < ${today.toISOString()}
    `);
    
    // Get today's customers count
    const [todayCustomers] = await db.execute(sql`
      SELECT COUNT(DISTINCT customer_id) as count
      FROM ${sales}
      WHERE sale_date >= ${today.toISOString()}
    `);
    
    // Get yesterday's customers count
    const [yesterdayCustomers] = await db.execute(sql`
      SELECT COUNT(DISTINCT customer_id) as count
      FROM ${sales}
      WHERE sale_date >= ${yesterday.toISOString()} AND sale_date < ${today.toISOString()}
    `);
    
    // Get inventory alerts count
    const [inventoryAlerts] = await db.execute(sql`
      SELECT COUNT(*) as count
      FROM (
        -- Low stock alerts
        SELECT p.id
        FROM ${products} p
        JOIN ${inventory} i ON p.id = i.product_id
        WHERE i.quantity <= p.min_stock
        UNION
        -- Near expiry alerts
        SELECT p.id
        FROM ${products} p
        JOIN ${inventory} i ON p.id = i.product_id
        WHERE p.is_perishable = true
          AND i.expiry_date IS NOT NULL
          AND i.expiry_date <= (CURRENT_DATE + INTERVAL '7 days')
          AND i.expiry_date >= CURRENT_DATE
          AND i.quantity > 0
      ) alerts
    `);
    
    // Get new alerts today
    const [newAlerts] = await db.execute(sql`
      SELECT COUNT(*) as count
      FROM (
        -- New low stock alerts
        SELECT p.id
        FROM ${products} p
        JOIN ${inventory} i ON p.id = i.product_id
        WHERE i.quantity <= p.min_stock
          AND i.last_updated >= ${today.toISOString()}
        UNION
        -- New near expiry alerts (items that entered the 7-day window today)
        SELECT p.id
        FROM ${products} p
        JOIN ${inventory} i ON p.id = i.product_id
        WHERE p.is_perishable = true
          AND i.expiry_date IS NOT NULL
          AND i.expiry_date = (CURRENT_DATE + INTERVAL '7 days')
          AND i.quantity > 0
      ) new_alerts
    `);
    
    // Get today's net profit
    const [todayProfit] = await db.execute(sql`
      SELECT 
        COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) - 
        COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) as profit
      FROM ${transactions}
      WHERE date >= ${today.toISOString()}
    `);
    
    // Get yesterday's net profit
    const [yesterdayProfit] = await db.execute(sql`
      SELECT 
        COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) - 
        COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) as profit
      FROM ${transactions}
      WHERE date >= ${yesterday.toISOString()} AND date < ${today.toISOString()}
    `);
    
    // Calculate percentages
    const todaySalesValue = parseFloat(todaySales.total) || 0;
    const yesterdaySalesValue = parseFloat(yesterdaySales.total) || 0;
    const salesChange = yesterdaySalesValue > 0 
      ? Math.round(((todaySalesValue - yesterdaySalesValue) / yesterdaySalesValue) * 100) 
      : 0;
    
    const todayCustomersValue = parseInt(todayCustomers.count) || 0;
    const yesterdayCustomersValue = parseInt(yesterdayCustomers.count) || 0;
    const customersChange = yesterdayCustomersValue > 0 
      ? Math.round(((todayCustomersValue - yesterdayCustomersValue) / yesterdayCustomersValue) * 100) 
      : 0;
    
    const todayProfitValue = parseFloat(todayProfit.profit) || 0;
    const yesterdayProfitValue = parseFloat(yesterdayProfit.profit) || 0;
    const profitChange = yesterdayProfitValue !== 0 
      ? Math.round(((todayProfitValue - yesterdayProfitValue) / Math.abs(yesterdayProfitValue)) * 100) 
      : 0;
    
    return {
      dailySales: {
        value: `$${todaySalesValue.toFixed(2)}`,
        change: `${salesChange}%`,
        direction: salesChange > 0 ? "up" : salesChange < 0 ? "down" : "neutral"
      },
      dailyCustomers: {
        value: `${todayCustomersValue}`,
        change: `${customersChange}%`,
        direction: customersChange > 0 ? "up" : customersChange < 0 ? "down" : "neutral"
      },
      inventoryAlerts: {
        value: `${inventoryAlerts.count}`,
        change: `${newAlerts.count} nuevas`,
        direction: parseInt(newAlerts.count) > 0 ? "up" : "neutral"
      },
      netProfit: {
        value: `$${todayProfitValue.toFixed(2)}`,
        change: `${profitChange}%`,
        direction: profitChange > 0 ? "up" : profitChange < 0 ? "down" : "neutral"
      }
    };
  }

  async getTopProducts(limit = 5): Promise<any[]> {
    // Get top selling products for the last 30 days
    return db.execute(sql`
      SELECT 
        p.id,
        p.name,
        p.image_url as image,
        SUM(si.quantity) as total_quantity,
        COUNT(DISTINCT s.id) as total_sales,
        ROUND((COUNT(DISTINCT s.id) * 100.0 / (
          SELECT COUNT(*) FROM ${sales} 
          WHERE sale_date >= (CURRENT_DATE - INTERVAL '30 days')
        )), 0) as percentage
      FROM ${products} p
      JOIN ${saleItems} si ON p.id = si.product_id
      JOIN ${sales} s ON si.sale_id = s.id
      WHERE s.sale_date >= (CURRENT_DATE - INTERVAL '30 days')
      GROUP BY p.id, p.name
      ORDER BY total_quantity DESC
      LIMIT ${limit}
    `);
  }
}

export const storage = new DatabaseStorage();
