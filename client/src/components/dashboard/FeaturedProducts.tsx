import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Link } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";
import ProductImage from "@/components/ui/product-image";

interface FeaturedProduct {
  id: number;
  name: string;
  description: string;
  price: string;
  image: string;
  inStock: boolean;
  category: string;
}

export default function FeaturedProducts() {
  const { data: products, isLoading } = useQuery({
    queryKey: ['/api/products/featured'],
    queryFunction: ({ queryKey }) => 
      fetch(queryKey[0])
        .then(res => res.json()),
  });

  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-lg">Productos Destacados</h3>
        <Link href="/inventory" className="text-sm text-primary-500 hover:underline">
          Ver todos
        </Link>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {isLoading ? (
          // Skeleton loader
          [...Array(4)].map((_, i) => (
            <Card key={i} className="bg-white overflow-hidden border border-gray-100">
              <Skeleton className="w-full h-48" />
              <div className="p-4 space-y-2">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-full" />
                <div className="flex items-center justify-between pt-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-6 w-16 rounded-full" />
                </div>
              </div>
            </Card>
          ))
        ) : (
          // Actual products list
          (products?.length > 0 ? products : [
            { 
              id: 1, 
              name: "Frutas Frescas", 
              description: "Amplia variedad de frutas de temporada", 
              price: "Desde $18.90/kg", 
              image: "https://images.unsplash.com/photo-1542838132-92c53300491e?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400", 
              inStock: true,
              category: "fruits"
            },
            { 
              id: 2, 
              name: "Verduras Orgánicas", 
              description: "Cultivadas sin pesticidas ni químicos", 
              price: "Desde $12.50/kg", 
              image: "https://images.unsplash.com/photo-1467453678174-768ec283a940?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400", 
              inStock: true,
              category: "vegetables"
            },
            { 
              id: 3, 
              name: "Abarrotes Básicos", 
              description: "Todo lo esencial para tu hogar", 
              price: "Precios competitivos", 
              image: "https://images.unsplash.com/photo-1578916171728-46686eac8d58?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400", 
              inStock: true,
              category: "groceries"
            },
            { 
              id: 4, 
              name: "Sistema de Venta", 
              description: "Rápido y eficiente para atender clientes", 
              price: "Siempre disponible", 
              image: "https://images.unsplash.com/photo-1556740738-b6a63e27c4df?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400", 
              inStock: true,
              category: "pos"
            }
          ]).map((product: FeaturedProduct) => (
            <Link key={product.id} href={`/inventory/category/${product.category}`}>
              <a className="group block">
                <Card className="bg-white overflow-hidden border border-gray-100">
                  <ProductImage
                    src={product.image}
                    alt={product.name}
                    className="w-full h-48 object-cover group-hover:opacity-90 transition-opacity"
                    width={600}
                    height={400}
                  />
                  <div className="p-4">
                    <h4 className="text-md font-semibold mb-1">{product.name}</h4>
                    <p className="text-sm text-gray-500 mb-2">{product.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-primary-500 font-medium">{product.price}</span>
                      <span className="text-xs px-2 py-1 bg-success bg-opacity-10 text-success rounded-full">
                        {product.inStock ? "En stock" : "Agotado"}
                      </span>
                    </div>
                  </div>
                </Card>
              </a>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
