import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface StatCardProps {
  title: string;
  value: string;
  icon: string;
  iconBgColor: string;
  iconColor: string;
  changeValue: string;
  changeDirection: "up" | "down" | "neutral";
  comparedTo: string;
}

const StatCard = ({ 
  title, 
  value, 
  icon, 
  iconBgColor, 
  iconColor,
  changeValue,
  changeDirection,
  comparedTo
}: StatCardProps) => {
  const changeIcon = changeDirection === "up" 
    ? "ri-arrow-up-line" 
    : changeDirection === "down" 
      ? "ri-arrow-down-line" 
      : "ri-arrow-right-line";
  
  const changeColor = changeDirection === "up" 
    ? "text-success" 
    : changeDirection === "down" 
      ? "text-danger" 
      : "text-gray-500";

  return (
    <Card className="bg-white p-6 shadow-sm border border-gray-100">
      <div className="flex items-center">
        <div className={`p-3 rounded-full ${iconBgColor} ${iconColor}`}>
          <i className={`${icon} text-xl`}></i>
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-xl font-semibold">{value}</p>
        </div>
      </div>
      <div className="mt-4 flex items-center text-sm">
        <span className={`${changeColor} flex items-center`}>
          <i className={`${changeIcon} mr-1`}></i>
          {changeValue}
        </span>
        <span className="text-gray-500 ml-2">{comparedTo}</span>
      </div>
    </Card>
  );
};

export default function QuickStatsCards() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['/api/statistics/dashboard'],
    queryFunction: ({ queryKey }) => 
      fetch(queryKey[0])
        .then(res => res.json()),
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="bg-white p-6 shadow-sm border border-gray-100">
            <div className="flex items-center">
              <Skeleton className="w-12 h-12 rounded-full" />
              <div className="ml-4 space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-6 w-20" />
              </div>
            </div>
            <div className="mt-4">
              <Skeleton className="h-4 w-24" />
            </div>
          </Card>
        ))}
      </div>
    );
  }

  const defaultStats = {
    dailySales: {
      value: "$0.00",
      change: "0%",
      direction: "neutral" as const,
    },
    dailyCustomers: {
      value: "0",
      change: "0%",
      direction: "neutral" as const,
    },
    inventoryAlerts: {
      value: "0",
      change: "0 nuevas",
      direction: "neutral" as const,
    },
    netProfit: {
      value: "$0.00",
      change: "0%",
      direction: "neutral" as const,
    }
  };

  const currentStats = stats || defaultStats;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <StatCard
        title="Ventas de Hoy"
        value={currentStats.dailySales.value}
        icon="ri-shopping-cart-line"
        iconBgColor="bg-primary-100"
        iconColor="text-primary-500"
        changeValue={currentStats.dailySales.change}
        changeDirection={currentStats.dailySales.direction}
        comparedTo="vs. ayer"
      />
      
      <StatCard
        title="Clientes Hoy"
        value={currentStats.dailyCustomers.value}
        icon="ri-user-line"
        iconBgColor="bg-blue-100"
        iconColor="text-blue-500"
        changeValue={currentStats.dailyCustomers.change}
        changeDirection={currentStats.dailyCustomers.direction}
        comparedTo="vs. ayer"
      />
      
      <StatCard
        title="Alertas Inventario"
        value={currentStats.inventoryAlerts.value}
        icon="ri-alert-line"
        iconBgColor="bg-accent bg-opacity-20"
        iconColor="text-accent"
        changeValue={currentStats.inventoryAlerts.change}
        changeDirection={currentStats.inventoryAlerts.direction}
        comparedTo="hoy"
      />
      
      <StatCard
        title="Ganancia Neta"
        value={currentStats.netProfit.value}
        icon="ri-funds-line"
        iconBgColor="bg-purple-100"
        iconColor="text-purple-500"
        changeValue={currentStats.netProfit.change}
        changeDirection={currentStats.netProfit.direction}
        comparedTo="vs. ayer"
      />
    </div>
  );
}
