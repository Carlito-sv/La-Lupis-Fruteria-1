import { Button } from "@/components/ui/button";
import QuickStatsCards from "@/components/dashboard/QuickStatsCards";
import SalesChart from "@/components/dashboard/SalesChart";
import TopProducts from "@/components/dashboard/TopProducts";
import InventoryAlerts from "@/components/dashboard/InventoryAlerts";
import RecentTransactions from "@/components/dashboard/RecentTransactions";
import FeaturedProducts from "@/components/dashboard/FeaturedProducts";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export default function Dashboard() {
  const today = format(new Date(), "d 'de' MMMM, yyyy", { locale: es });

  return (
    <div className="px-4 py-6 md:px-6 lg:px-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">Resumen del negocio - {today}</p>
        </div>
        <div className="mt-4 md:mt-0 flex space-x-3">
          <Button 
            variant="outline" 
            className="px-4 py-2 flex items-center text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <i className="ri-download-line mr-2"></i>
            Exportar
          </Button>
          <Button
            className="px-4 py-2 bg-primary-500 text-white flex items-center text-sm font-medium hover:bg-primary-600"
          >
            <i className="ri-refresh-line mr-2"></i>
            Actualizar
          </Button>
        </div>
      </div>
      
      {/* Quick Stats */}
      <QuickStatsCards />
      
      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <SalesChart />
        <TopProducts />
      </div>
      
      {/* Alerts & Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <InventoryAlerts />
        <RecentTransactions />
      </div>
      
      {/* Featured Products Gallery */}
      <FeaturedProducts />
    </div>
  );
}
