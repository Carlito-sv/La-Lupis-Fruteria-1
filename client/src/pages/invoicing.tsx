import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";

interface Invoice {
  id: number;
  invoiceNumber: string;
  customer: string;
  date: string;
  total: string;
  status: "paid" | "pending" | "canceled";
}

export default function Invoicing() {
  const [searchQuery, setSearchQuery] = useState("");
  const [status, setStatus] = useState("all");

  const { data: invoices, isLoading } = useQuery({
    queryKey: ['/api/invoices'],
    queryFunction: ({ queryKey }) => 
      fetch(queryKey[0])
        .then(res => res.json()),
  });

  const filteredInvoices = invoices?.filter((invoice: Invoice) => {
    const matchesSearch = 
      invoice.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invoice.customer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = status === "all" || invoice.status === status;
    return matchesSearch && matchesStatus;
  }) || [];

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-success bg-opacity-10 text-success";
      case "pending":
        return "bg-warning bg-opacity-10 text-warning";
      case "canceled":
        return "bg-danger bg-opacity-10 text-danger";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "paid":
        return "Pagada";
      case "pending":
        return "Pendiente";
      case "canceled":
        return "Cancelada";
      default:
        return status;
    }
  };

  return (
    <div className="px-4 py-6 md:px-6 lg:px-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Facturación</h1>
          <p className="mt-1 text-sm text-gray-500">Gestiona tus facturas y comprobantes</p>
        </div>
        <div className="mt-4 md:mt-0">
          <Button className="bg-primary-500 text-white hover:bg-primary-600">
            <i className="ri-add-line mr-2"></i>
            Nueva Factura
          </Button>
        </div>
      </div>

      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div className="md:col-span-2">
              <label htmlFor="search" className="text-sm font-medium block mb-1">Buscar</label>
              <Input
                id="search"
                type="search"
                placeholder="Número de factura o cliente..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="date-range" className="text-sm font-medium block mb-1">Rango de fechas</label>
              <Input
                id="date-range"
                type="date"
              />
            </div>
            <div>
              <Button variant="outline" className="w-full">
                <i className="ri-filter-3-line mr-2"></i>
                Filtros
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="all" onValueChange={setStatus} className="mb-4">
        <TabsList className="w-full md:w-auto">
          <TabsTrigger value="all">Todas</TabsTrigger>
          <TabsTrigger value="paid">Pagadas</TabsTrigger>
          <TabsTrigger value="pending">Pendientes</TabsTrigger>
          <TabsTrigger value="canceled">Canceladas</TabsTrigger>
        </TabsList>
      </Tabs>

      <Card>
        <CardContent className="p-0 overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>No. Factura</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                // Skeleton loader
                [...Array(5)].map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-36" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-16 rounded-full" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-8 w-20 ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : filteredInvoices.length > 0 ? (
                // Actual invoices list
                filteredInvoices.map((invoice: Invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
                    <TableCell>{invoice.customer}</TableCell>
                    <TableCell>{invoice.date}</TableCell>
                    <TableCell>{invoice.total}</TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(invoice.status)}`}>
                        {getStatusText(invoice.status)}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 w-8 p-0 text-gray-500"
                          title="Ver factura"
                        >
                          <i className="ri-eye-line"></i>
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 w-8 p-0 text-gray-500"
                          title="Descargar PDF"
                        >
                          <i className="ri-download-line"></i>
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 w-8 p-0 text-gray-500"
                          title="Más opciones"
                        >
                          <i className="ri-more-2-fill"></i>
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
                      <p className="text-gray-500">No se encontraron facturas</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
