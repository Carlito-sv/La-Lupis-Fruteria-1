import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from "recharts";

interface Transaction {
  id: number;
  date: string;
  description: string;
  category: string;
  amount: number;
  type: "income" | "expense";
}

export default function Finances() {
  const [period, setPeriod] = useState("month");
  const [transactionType, setTransactionType] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: financialData, isLoading: financialsLoading } = useQuery({
    queryKey: ['/api/finances/summary', period],
    queryFunction: ({ queryKey }) => 
      fetch(`${queryKey[0]}?period=${queryKey[1]}`)
        .then(res => res.json()),
  });

  const { data: transactions, isLoading: transactionsLoading } = useQuery({
    queryKey: ['/api/finances/transactions', period],
    queryFunction: ({ queryKey }) => 
      fetch(`${queryKey[0]}?period=${queryKey[1]}`)
        .then(res => res.json()),
  });

  const filteredTransactions = transactions?.filter((transaction: Transaction) => {
    const matchesSearch = transaction.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = transactionType === "all" || transaction.type === transactionType;
    return matchesSearch && matchesType;
  }) || [];

  // Sample data for charts when API doesn't return data
  const defaultExpensesData = [
    { name: "Frutas", value: 35000 },
    { name: "Verduras", value: 25000 },
    { name: "Abarrotes", value: 45000 },
    { name: "Servicios", value: 12000 },
    { name: "Personal", value: 28000 }
  ];

  const defaultIncomeData = [
    { name: "Lun", income: 18500 },
    { name: "Mar", income: 22000 },
    { name: "Mié", income: 19800 },
    { name: "Jue", income: 24500 },
    { name: "Vie", income: 32000 },
    { name: "Sáb", income: 38000 },
    { name: "Dom", income: 25000 }
  ];

  const COLORS = ['#2e7d32', '#66BB6A', '#81C784', '#C8E6C9', '#FFAB00', '#FB8C00'];

  return (
    <div className="px-4 py-6 md:px-6 lg:px-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Ingresos y Gastos</h1>
          <p className="mt-1 text-sm text-gray-500">Gestiona las finanzas de tu negocio</p>
        </div>
        <div className="mt-4 md:mt-0 flex gap-3">
          <Button variant="outline">
            <i className="ri-download-line mr-2"></i>
            Exportar
          </Button>
          <Button className="bg-primary-500 text-white hover:bg-primary-600">
            <i className="ri-add-line mr-2"></i>
            Nueva Transacción
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* Financial Summary Cards */}
        {financialsLoading ? (
          [...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-5 w-32 mb-2" />
                <Skeleton className="h-8 w-48 mb-4" />
                <Skeleton className="h-4 w-24" />
              </CardContent>
            </Card>
          ))
        ) : (
          <>
            <Card>
              <CardContent className="p-6">
                <p className="text-sm font-medium text-gray-500">Ingresos Totales</p>
                <p className="text-2xl font-bold mt-1">{financialData?.income || "$0.00"}</p>
                <p className="text-sm mt-2">
                  <span className="text-success">
                    <i className="ri-arrow-up-line"></i> {financialData?.incomeChange || "0%"}
                  </span>
                  <span className="text-gray-500 ml-1">vs. periodo anterior</span>
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <p className="text-sm font-medium text-gray-500">Gastos Totales</p>
                <p className="text-2xl font-bold mt-1">{financialData?.expenses || "$0.00"}</p>
                <p className="text-sm mt-2">
                  <span className="text-danger">
                    <i className="ri-arrow-up-line"></i> {financialData?.expensesChange || "0%"}
                  </span>
                  <span className="text-gray-500 ml-1">vs. periodo anterior</span>
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <p className="text-sm font-medium text-gray-500">Ganancia Neta</p>
                <p className="text-2xl font-bold mt-1">{financialData?.netProfit || "$0.00"}</p>
                <p className="text-sm mt-2">
                  <span className="text-success">
                    <i className="ri-arrow-up-line"></i> {financialData?.netProfitChange || "0%"}
                  </span>
                  <span className="text-gray-500 ml-1">vs. periodo anterior</span>
                </p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Charts */}
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-lg">Distribución de Gastos</h3>
              <div>
                <Tabs defaultValue="month" onValueChange={setPeriod}>
                  <TabsList className="h-8">
                    <TabsTrigger value="week" className="px-3 text-xs h-6">Semana</TabsTrigger>
                    <TabsTrigger value="month" className="px-3 text-xs h-6">Mes</TabsTrigger>
                    <TabsTrigger value="year" className="px-3 text-xs h-6">Año</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </div>
            
            {financialsLoading ? (
              <div className="h-64 flex items-center justify-center">
                <Skeleton className="h-full w-full rounded-lg" />
              </div>
            ) : (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={financialData?.expensesBreakdown || defaultExpensesData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {(financialData?.expensesBreakdown || defaultExpensesData).map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value) => [`$${value}`, 'Monto']}
                      contentStyle={{
                        backgroundColor: '#fff',
                        border: '1px solid #e2e8f0',
                        borderRadius: '0.375rem',
                        boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
                      }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-lg">Ingresos por Día</h3>
              <div>
                <Tabs defaultValue="week">
                  <TabsList className="h-8">
                    <TabsTrigger value="week" className="px-3 text-xs h-6">Semana</TabsTrigger>
                    <TabsTrigger value="month" className="px-3 text-xs h-6">Mes</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </div>
            
            {financialsLoading ? (
              <div className="h-64 flex items-center justify-center">
                <Skeleton className="h-full w-full rounded-lg" />
              </div>
            ) : (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={financialData?.incomeByDay || defaultIncomeData}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(value) => `$${value/1000}k`} />
                    <Tooltip 
                      formatter={(value) => [`$${value}`, 'Ingresos']}
                      contentStyle={{
                        backgroundColor: '#fff',
                        border: '1px solid #e2e8f0',
                        borderRadius: '0.375rem',
                        boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
                      }}
                    />
                    <Legend />
                    <Bar dataKey="income" fill="#2e7d32" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <h3 className="font-semibold text-lg">Historial de Transacciones</h3>
            <div className="mt-3 md:mt-0 flex flex-col md:flex-row gap-3">
              <Tabs defaultValue="all" onValueChange={setTransactionType}>
                <TabsList>
                  <TabsTrigger value="all">Todas</TabsTrigger>
                  <TabsTrigger value="income">Ingresos</TabsTrigger>
                  <TabsTrigger value="expense">Gastos</TabsTrigger>
                </TabsList>
              </Tabs>
              <Input
                type="search"
                placeholder="Buscar transacción..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full md:w-56"
              />
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Descripción</TableHead>
                  <TableHead>Categoría</TableHead>
                  <TableHead>Monto</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactionsLoading ? (
                  // Skeleton loader
                  [...Array(5)].map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-40" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-16 rounded-full" /></TableCell>
                      <TableCell className="text-right"><Skeleton className="h-8 w-20 ml-auto" /></TableCell>
                    </TableRow>
                  ))
                ) : filteredTransactions.length > 0 ? (
                  // Actual transactions list
                  filteredTransactions.map((transaction: Transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell>{transaction.date}</TableCell>
                      <TableCell>{transaction.description}</TableCell>
                      <TableCell>{transaction.category}</TableCell>
                      <TableCell className={transaction.type === "income" ? "text-success" : "text-danger"}>
                        {transaction.type === "income" ? "+" : "-"}${Math.abs(transaction.amount).toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          transaction.type === "income" 
                            ? "bg-success bg-opacity-10 text-success" 
                            : "bg-danger bg-opacity-10 text-danger"
                        }`}>
                          {transaction.type === "income" ? "Ingreso" : "Gasto"}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 w-8 p-0 text-gray-500"
                            title="Editar"
                          >
                            <i className="ri-pencil-line"></i>
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 w-8 p-0 text-gray-500"
                            title="Ver detalles"
                          >
                            <i className="ri-eye-line"></i>
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 w-8 p-0 text-danger"
                            title="Eliminar"
                          >
                            <i className="ri-delete-bin-line"></i>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  // No results message
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      <div className="flex flex-col items-center justify-center py-4">
                        <i className="ri-file-search-line text-3xl text-gray-300 mb-2"></i>
                        <p className="text-gray-500">No se encontraron transacciones</p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
