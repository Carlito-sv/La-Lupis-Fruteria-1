import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

interface InventoryAlert {
  id: number;
  type: "low_stock" | "expiring" | "out_of_stock";
  product: string;
  details: string;
}

const AlertIcon = ({ type }: { type: string }) => {
  switch (type) {
    case "low_stock":
      return (
        <div className="p-2 rounded-full bg-warning bg-opacity-20 text-warning">
          <i className="ri-error-warning-line"></i>
        </div>
      );
    case "expiring":
      return (
        <div className="p-2 rounded-full bg-danger bg-opacity-20 text-danger">
          <i className="ri-alarm-warning-line"></i>
        </div>
      );
    case "out_of_stock":
      return (
        <div className="p-2 rounded-full bg-danger bg-opacity-20 text-danger">
          <i className="ri-close-circle-line"></i>
        </div>
      );
    default:
      return (
        <div className="p-2 rounded-full bg-warning bg-opacity-20 text-warning">
          <i className="ri-error-warning-line"></i>
        </div>
      );
  }
};

const AlertBackground = ({ type }: { type: string }) => {
  return type === "expiring" || type === "out_of_stock"
    ? "bg-danger bg-opacity-10 border border-danger border-opacity-20"
    : "bg-warning bg-opacity-10 border border-warning border-opacity-20";
};

export default function InventoryAlerts() {
  const { data: alerts, isLoading } = useQuery({
    queryKey: ['/api/inventory/alerts'],
    queryFunction: ({ queryKey }) => 
      fetch(queryKey[0])
        .then(res => res.json()),
  });

  return (
    <Card className="bg-white shadow-sm border border-gray-100">
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold text-lg">Alertas de Inventario</h3>
          <button className="text-sm text-primary-500 hover:underline">Ver todas</button>
        </div>
        
        <div className="space-y-3">
          {isLoading ? (
            // Skeleton loader
            [...Array(4)].map((_, i) => (
              <div key={i} className="p-3 rounded-lg">
                <div className="flex items-center">
                  <Skeleton className="w-8 h-8 rounded-full" />
                  <div className="ml-3 flex-1 space-y-2">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-3 w-60" />
                  </div>
                  <Skeleton className="h-8 w-20" />
                </div>
              </div>
            ))
          ) : (
            // Actual alerts list
            (alerts?.length > 0 ? alerts : [
              { id: 1, type: "low_stock", product: "Plátanos", details: "Quedan 3kg - Mínimo recomendado: 5kg" },
              { id: 2, type: "expiring", product: "Leche", details: "Vence en 2 días - 12 unidades" },
              { id: 3, type: "low_stock", product: "Papel Higiénico", details: "Quedan 4 paquetes - Mínimo recomendado: 10" },
              { id: 4, type: "out_of_stock", product: "Zanahorias", details: "Agotado hace 2 días" }
            ]).map((alert: InventoryAlert) => (
              <div key={alert.id} className={`p-3 rounded-lg ${AlertBackground({ type: alert.type })}`}>
                <div className="flex items-center">
                  <AlertIcon type={alert.type} />
                  <div className="ml-3">
                    <p className="text-sm font-medium">
                      {alert.type === "low_stock" && "Stock Bajo: "}
                      {alert.type === "expiring" && "Próximo a vencer: "}
                      {alert.type === "out_of_stock" && "Sin Stock: "}
                      {alert.product}
                    </p>
                    <p className="text-xs text-gray-500">{alert.details}</p>
                  </div>
                  <Button 
                    variant="ghost"
                    className="ml-auto text-sm font-medium text-primary-500 h-auto py-1 px-3"
                  >
                    {alert.type === "out_of_stock" || alert.type === "low_stock" ? "Ordenar" : "Acciones"}
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
