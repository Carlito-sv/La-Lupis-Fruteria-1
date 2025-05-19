import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function SalesChart() {
  const [timeRange, setTimeRange] = useState("week");
  
  const { data: salesData, isLoading } = useQuery({
    queryKey: ['/api/statistics/sales', timeRange],
    queryFunction: ({ queryKey }) => 
      fetch(`${queryKey[0]}?timeRange=${queryKey[1]}`)
        .then(res => res.json()),
  });

  const handleTimeRangeChange = (value: string) => {
    setTimeRange(value);
  };

  // Format sales data for chart
  const chartData = salesData?.data || [];

  const renderTimeRangeLabel = () => {
    switch (timeRange) {
      case "week":
        return "Esta Semana";
      case "lastWeek":
        return "Semana Pasada";
      case "month":
        return "Este Mes";
      default:
        return "Esta Semana";
    }
  };

  return (
    <Card className="bg-white shadow-sm border border-gray-100 lg:col-span-2">
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-semibold text-lg">Ventas de la Semana</h3>
          <div className="flex items-center space-x-2">
            <Select value={timeRange} onValueChange={handleTimeRangeChange}>
              <SelectTrigger className="w-[180px] h-9 text-sm">
                <SelectValue placeholder={renderTimeRangeLabel()} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">Esta Semana</SelectItem>
                <SelectItem value="lastWeek">Semana Pasada</SelectItem>
                <SelectItem value="month">Este Mes</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="h-72 w-full">
          {isLoading ? (
            <div className="h-full w-full flex items-center justify-center">
              <Skeleton className="h-full w-full" />
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={chartData}
                margin={{
                  top: 10,
                  right: 20,
                  left: 0,
                  bottom: 0,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#64748b', fontSize: 12 }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#64748b', fontSize: 12 }}
                  dx={-10}
                  tickFormatter={(value) => `$${value}`}
                />
                <Tooltip 
                  formatter={(value) => [`$${value}`, 'Ventas']}
                  labelFormatter={(label) => `Día: ${label}`}
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '0.375rem',
                    boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="sales" 
                  stroke="#2e7d32" 
                  fill="url(#colorSales)" 
                  strokeWidth={2}
                  dot={{ stroke: '#2e7d32', strokeWidth: 2, r: 4, fill: '#fff' }}
                  activeDot={{ r: 6, stroke: '#2e7d32', strokeWidth: 2, fill: '#fff' }}
                />
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2e7d32" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#2e7d32" stopOpacity={0}/>
                  </linearGradient>
                </defs>
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
