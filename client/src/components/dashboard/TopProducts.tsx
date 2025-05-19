import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import ProductImage from "@/components/ui/product-image";

interface Product {
  id: number;
  name: string;
  percentage: number;
  image: string;
}

export default function TopProducts() {
  const { data: products, isLoading } = useQuery({
    queryKey: ['/api/products/top'],
    queryFunction: ({ queryKey }) => 
      fetch(queryKey[0])
        .then(res => res.json()),
  });

  return (
    <Card className="bg-white shadow-sm border border-gray-100">
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold text-lg">Productos Más Vendidos</h3>
          <button className="text-sm text-primary-500 hover:underline">Ver todos</button>
        </div>
        
        <div className="space-y-4">
          {isLoading ? (
            // Skeleton loader
            [...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center">
                <Skeleton className="w-10 h-10 rounded-full" />
                <div className="ml-3 flex-1 space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-1.5 w-full" />
                </div>
                <Skeleton className="h-4 w-10" />
              </div>
            ))
          ) : (
            // Actual product list
            (products?.length > 0 ? products : [
              { id: 1, name: "Tomates", percentage: 85, image: "https://pixabay.com/get/gdafefd1d38715dc1407cd2e0da0fe281e526859e2c11bb98f44e54d33decb971f8940d1cca0e9effe4210330d478973f_1280.jpg" },
              { id: 2, name: "Manzanas", percentage: 72, image: "https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?ixlib=rb-4.0.3&auto=format&fit=crop&w=60&h=60" },
              { id: 3, name: "Arroz 1kg", percentage: 65, image: "https://pixabay.com/get/gb6ab6cc087c59f8cda5374f73b20280ab9f47db409599c3e7e93225708b5beb9eadba8b9963c1c9f888ac2cf49a207744f3ba2915465be8b224a1f1cd4d3c9c5_1280.jpg" },
              { id: 4, name: "Aguacates", percentage: 60, image: "https://images.unsplash.com/photo-1519162808019-7de1683fa2ad?ixlib=rb-4.0.3&auto=format&fit=crop&w=60&h=60" },
              { id: 5, name: "Leche 1L", percentage: 55, image: "https://images.unsplash.com/photo-1550583724-b2692b85b150?ixlib=rb-4.0.3&auto=format&fit=crop&w=60&h=60" }
            ]).map((product: Product) => (
              <div key={product.id} className="flex items-center">
                <ProductImage
                  src={product.image}
                  alt={product.name}
                  className="w-10 h-10 rounded-full object-cover"
                  width={60}
                  height={60}
                />
                <div className="ml-3 flex-1">
                  <p className="text-sm font-medium">{product.name}</p>
                  <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                    <div 
                      className="bg-primary-500 h-1.5 rounded-full" 
                      style={{ width: `${product.percentage}%` }}
                    ></div>
                  </div>
                </div>
                <span className="text-sm font-medium">{product.percentage}%</span>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
