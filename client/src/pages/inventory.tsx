import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import ProductImage from "@/components/ui/product-image";

interface Product {
  id: number;
  name: string;
  category: string;
  stock: number;
  unit: string;
  price: string;
  expiryDate?: string;
  image: string;
  lowStock: boolean;
  expiringAlert: boolean;
}

export default function Inventory() {
  const [searchQuery, setSearchQuery] = useState("");
  const [category, setCategory] = useState("all");

  const { data: products, isLoading } = useQuery({
    queryKey: ['/api/inventory/products'],
    queryFunction: ({ queryKey }) => 
      fetch(queryKey[0])
        .then(res => res.json()),
  });

  const filteredProducts = products?.filter((product: Product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = category === "all" || product.category === category;
    return matchesSearch && matchesCategory;
  }) || [];

  return (
    <div className="px-4 py-6 md:px-6 lg:px-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inventario</h1>
          <p className="mt-1 text-sm text-gray-500">Gestiona los productos de tu negocio</p>
        </div>
        <div className="mt-4 md:mt-0">
          <Button className="bg-primary-500 text-white hover:bg-primary-600">
            <i className="ri-add-line mr-2"></i>
            Añadir Producto
          </Button>
        </div>
      </div>

      <div className="mb-6 flex flex-col md:flex-row gap-4">
        <div className="w-full md:w-2/3">
          <Input
            type="search"
            placeholder="Buscar productos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
          />
        </div>
        <div className="w-full md:w-1/3">
          <Tabs defaultValue="all" onValueChange={setCategory}>
            <TabsList className="w-full">
              <TabsTrigger value="all" className="flex-1">Todos</TabsTrigger>
              <TabsTrigger value="fruits" className="flex-1">Frutas</TabsTrigger>
              <TabsTrigger value="vegetables" className="flex-1">Verduras</TabsTrigger>
              <TabsTrigger value="groceries" className="flex-1">Abarrotes</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {isLoading ? (
          // Skeleton loader
          [...Array(8)].map((_, i) => (
            <Card key={i} className="bg-white overflow-hidden">
              <CardContent className="p-0">
                <Skeleton className="w-full h-40" />
                <div className="p-4 space-y-2">
                  <Skeleton className="h-5 w-2/3" />
                  <Skeleton className="h-4 w-full" />
                  <div className="flex justify-between pt-2">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : filteredProducts.length > 0 ? (
          // Actual products grid
          filteredProducts.map((product: Product) => (
            <Card key={product.id} className="bg-white overflow-hidden">
              <CardContent className="p-0">
                <div className="relative">
                  <ProductImage
                    src={product.image}
                    alt={product.name}
                    className="w-full h-40 object-cover"
                    width={300}
                    height={160}
                  />
                  {product.lowStock && (
                    <div className="absolute top-2 right-2 bg-warning text-white text-xs px-2 py-1 rounded-full">
                      Stock Bajo
                    </div>
                  )}
                  {product.expiringAlert && (
                    <div className="absolute top-2 left-2 bg-danger text-white text-xs px-2 py-1 rounded-full">
                      Por Vencer
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-lg mb-1">{product.name}</h3>
                  <p className="text-sm text-gray-500 mb-3">
                    Categoría: {product.category === "fruits" ? "Frutas" : 
                               product.category === "vegetables" ? "Verduras" : 
                               product.category === "groceries" ? "Abarrotes" : product.category}
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="text-primary-500 font-medium">{product.price}</span>
                    <span className="text-gray-600">Stock: {product.stock} {product.unit}</span>
                  </div>
                  {product.expiryDate && (
                    <p className="text-xs text-gray-500 mt-2">
                      Vence: {product.expiryDate}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          // No results message
          <div className="col-span-full flex flex-col items-center justify-center p-8 text-center">
            <div className="rounded-full bg-gray-100 p-3 mb-4">
              <i className="ri-search-line text-2xl text-gray-400"></i>
            </div>
            <h3 className="text-lg font-medium mb-1">No se encontraron productos</h3>
            <p className="text-gray-500">Intenta con otros términos de búsqueda o categoría.</p>
          </div>
        )}
      </div>
    </div>
  );
}
