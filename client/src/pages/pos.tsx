import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import ProductImage from "@/components/ui/product-image";

interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  image: string;
  unit: string;
}

interface CartItem extends Product {
  quantity: number;
  total: number;
}

export default function POS() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [paymentMethod, setPaymentMethod] = useState("cash");

  const { data: products, isLoading } = useQuery({
    queryKey: ['/api/pos/products'],
    queryFunction: ({ queryKey }) => 
      fetch(queryKey[0])
        .then(res => res.json()),
  });

  const filteredProducts = products?.filter((product: Product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = category === "all" || product.category === category;
    return matchesSearch && matchesCategory;
  }) || [];

  const addToCart = (product: Product) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === product.id);
      
      if (existingItem) {
        return prevCart.map(item => 
          item.id === product.id 
            ? { ...item, quantity: item.quantity + 1, total: (item.quantity + 1) * item.price } 
            : item
        );
      } else {
        return [...prevCart, { ...product, quantity: 1, total: product.price }];
      }
    });
  };

  const updateCartItemQuantity = (id: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      setCart(prevCart => prevCart.filter(item => item.id !== id));
    } else {
      setCart(prevCart => 
        prevCart.map(item => 
          item.id === id 
            ? { ...item, quantity: newQuantity, total: newQuantity * item.price } 
            : item
        )
      );
    }
  };

  const clearCart = () => {
    setCart([]);
  };

  const calculateTotal = () => {
    return cart.reduce((sum, item) => sum + item.total, 0);
  };

  const handleCheckout = () => {
    // Implement checkout logic
    alert("Procesando pago...");
    clearCart();
  };

  return (
    <div className="px-4 py-6 md:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Punto de Venta</h1>
        <p className="mt-1 text-sm text-gray-500">Gestiona tus ventas de manera eficiente</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Product Selection Section */}
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="p-4">
              <div className="mb-4">
                <Input
                  type="search"
                  placeholder="Buscar productos..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full"
                />
              </div>
              
              <Tabs defaultValue="all" onValueChange={setCategory} className="mb-4">
                <TabsList className="w-full">
                  <TabsTrigger value="all" className="flex-1">Todos</TabsTrigger>
                  <TabsTrigger value="fruits" className="flex-1">Frutas</TabsTrigger>
                  <TabsTrigger value="vegetables" className="flex-1">Verduras</TabsTrigger>
                  <TabsTrigger value="groceries" className="flex-1">Abarrotes</TabsTrigger>
                </TabsList>
              </Tabs>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {isLoading ? (
                  // Skeleton loader
                  [...Array(8)].map((_, i) => (
                    <div key={i} className="bg-white border rounded-lg overflow-hidden">
                      <Skeleton className="w-full h-24" />
                      <div className="p-2 space-y-1">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                      </div>
                    </div>
                  ))
                ) : filteredProducts.length > 0 ? (
                  // Actual product grid
                  filteredProducts.map((product: Product) => (
                    <button
                      key={product.id}
                      className="bg-white border rounded-lg overflow-hidden hover:shadow-md transition-shadow focus:outline-none focus:ring-2 focus:ring-primary-500"
                      onClick={() => addToCart(product)}
                    >
                      <ProductImage
                        src={product.image}
                        alt={product.name}
                        className="w-full h-24 object-cover"
                        width={150}
                        height={96}
                      />
                      <div className="p-2 text-left">
                        <h3 className="font-medium text-sm truncate">{product.name}</h3>
                        <p className="text-primary-500 text-sm">${product.price.toFixed(2)}/{product.unit}</p>
                      </div>
                    </button>
                  ))
                ) : (
                  // No results message
                  <div className="col-span-full flex flex-col items-center justify-center p-6 text-center">
                    <i className="ri-search-line text-2xl text-gray-400 mb-2"></i>
                    <p className="text-gray-500">No se encontraron productos. Intenta con otra búsqueda.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Cart and Checkout Section */}
        <div>
          <Card>
            <CardContent className="p-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Carrito</h2>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={clearCart}
                  disabled={cart.length === 0}
                >
                  <i className="ri-delete-bin-line mr-1"></i>
                  Limpiar
                </Button>
              </div>

              <div className="max-h-[300px] overflow-y-auto mb-4">
                {cart.length === 0 ? (
                  <div className="py-8 text-center">
                    <i className="ri-shopping-cart-line text-3xl text-gray-300 mb-2"></i>
                    <p className="text-gray-500">El carrito está vacío</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {cart.map((item) => (
                      <div key={item.id} className="flex items-center gap-2 border-b pb-2">
                        <ProductImage
                          src={item.image}
                          alt={item.name}
                          className="w-12 h-12 rounded-md object-cover"
                          width={48}
                          height={48}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{item.name}</p>
                          <p className="text-gray-500 text-xs">${item.price.toFixed(2)}/{item.unit}</p>
                        </div>
                        <div className="flex items-center">
                          <button 
                            className="w-6 h-6 flex items-center justify-center bg-gray-200 rounded-full"
                            onClick={() => updateCartItemQuantity(item.id, item.quantity - 1)}
                          >
                            <i className="ri-subtract-line"></i>
                          </button>
                          <span className="w-8 text-center text-sm">{item.quantity}</span>
                          <button 
                            className="w-6 h-6 flex items-center justify-center bg-gray-200 rounded-full"
                            onClick={() => updateCartItemQuantity(item.id, item.quantity + 1)}
                          >
                            <i className="ri-add-line"></i>
                          </button>
                        </div>
                        <p className="text-sm font-medium">${item.total.toFixed(2)}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-2 border-t pt-4">
                <div className="flex justify-between text-sm">
                  <span>Subtotal:</span>
                  <span>${calculateTotal().toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>IVA (16%):</span>
                  <span>${(calculateTotal() * 0.16).toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-semibold">
                  <span>Total a pagar:</span>
                  <span>${(calculateTotal() * 1.16).toFixed(2)}</span>
                </div>
              </div>

              <div className="mt-4">
                <div className="mb-3">
                  <label className="text-sm font-medium mb-1 block">Método de Pago</label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      className={`p-2 rounded-md border text-sm text-center ${paymentMethod === 'cash' ? 'bg-primary-100 border-primary-500 text-primary-700' : 'border-gray-300'}`}
                      onClick={() => setPaymentMethod('cash')}
                    >
                      <i className="ri-cash-line block text-lg mb-1"></i>
                      Efectivo
                    </button>
                    <button
                      className={`p-2 rounded-md border text-sm text-center ${paymentMethod === 'card' ? 'bg-primary-100 border-primary-500 text-primary-700' : 'border-gray-300'}`}
                      onClick={() => setPaymentMethod('card')}
                    >
                      <i className="ri-bank-card-line block text-lg mb-1"></i>
                      Tarjeta
                    </button>
                    <button
                      className={`p-2 rounded-md border text-sm text-center ${paymentMethod === 'transfer' ? 'bg-primary-100 border-primary-500 text-primary-700' : 'border-gray-300'}`}
                      onClick={() => setPaymentMethod('transfer')}
                    >
                      <i className="ri-exchange-line block text-lg mb-1"></i>
                      Transferencia
                    </button>
                  </div>
                </div>

                <Button
                  className="w-full bg-primary-500 hover:bg-primary-600"
                  size="lg"
                  disabled={cart.length === 0}
                  onClick={handleCheckout}
                >
                  <i className="ri-shopping-cart-line mr-2"></i>
                  Cobrar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
