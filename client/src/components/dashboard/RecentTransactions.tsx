import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface Transaction {
  id: number;
  customer: {
    name: string;
    initials: string;
    color: string;
  };
  items: number;
  amount: string;
  status: "paid" | "pending" | "canceled";
}

const StatusBadge = ({ status }: { status: string }) => {
  const statusStyles = {
    paid: "bg-success bg-opacity-10 text-success",
    pending: "bg-warning bg-opacity-10 text-warning",
    canceled: "bg-danger bg-opacity-10 text-danger"
  };
  
  const statusText = {
    paid: "Pagado",
    pending: "Pendiente",
    canceled: "Cancelado"
  };

  return (
    <span className={`px-2 py-1 text-xs rounded-full ${statusStyles[status as keyof typeof statusStyles]}`}>
      {statusText[status as keyof typeof statusText]}
    </span>
  );
};

export default function RecentTransactions() {
  const { data: transactions, isLoading } = useQuery({
    queryKey: ['/api/transactions/recent'],
    queryFunction: ({ queryKey }) => 
      fetch(queryKey[0])
        .then(res => res.json()),
  });

  return (
    <Card className="bg-white shadow-sm border border-gray-100">
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold text-lg">Transacciones Recientes</h3>
          <button className="text-sm text-primary-500 hover:underline">Ver todas</button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Artículos</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Monto</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {isLoading ? (
                // Skeleton loader
                [...Array(5)].map((_, i) => (
                  <tr key={i}>
                    <td className="px-3 py-3 whitespace-nowrap">
                      <div className="flex items-center">
                        <Skeleton className="w-7 h-7 rounded-full" />
                        <Skeleton className="ml-2 h-4 w-24" />
                      </div>
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap">
                      <Skeleton className="h-4 w-20" />
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap">
                      <Skeleton className="h-4 w-16" />
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap">
                      <Skeleton className="h-6 w-16 rounded-full" />
                    </td>
                  </tr>
                ))
              ) : (
                // Actual transactions list
                (transactions?.length > 0 ? transactions : [
                  { id: 1, customer: { name: "Juan Ramírez", initials: "JR", color: "blue" }, items: 8, amount: "$385.00", status: "paid" },
                  { id: 2, customer: { name: "Ana López", initials: "AL", color: "purple" }, items: 5, amount: "$147.50", status: "paid" },
                  { id: 3, customer: { name: "Roberto Sánchez", initials: "RS", color: "green" }, items: 3, amount: "$92.75", status: "pending" },
                  { id: 4, customer: { name: "María Castillo", initials: "MC", color: "red" }, items: 12, amount: "$527.30", status: "paid" },
                  { id: 5, customer: { name: "David Ramos", initials: "DR", color: "orange" }, items: 7, amount: "$235.10", status: "canceled" }
                ]).map((transaction: Transaction) => (
                  <tr key={transaction.id}>
                    <td className="px-3 py-3 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className={`w-7 h-7 rounded-full bg-${transaction.customer.color}-100 flex items-center justify-center text-${transaction.customer.color}-500 text-sm`}>
                          {transaction.customer.initials}
                        </div>
                        <span className="ml-2 text-sm font-medium">{transaction.customer.name}</span>
                      </div>
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap text-sm">{transaction.items} artículos</td>
                    <td className="px-3 py-3 whitespace-nowrap text-sm font-medium">{transaction.amount}</td>
                    <td className="px-3 py-3 whitespace-nowrap">
                      <StatusBadge status={transaction.status} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
