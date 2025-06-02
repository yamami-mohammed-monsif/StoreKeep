
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Package, AlertTriangle, TrendingUp } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import type { SalesByDay } from "@/actions/dashboardActions";
import { format } from 'date-fns';

interface DashboardStats {
  totalProducts: number;
  lowStockItems: number;
  totalSalesToday: number;
  totalSalesThisWeek: number;
  totalSalesThisMonth: number;
}

interface DashboardClientPageProps {
  stats: DashboardStats | null;
  salesChartData: SalesByDay[] | null;
  error?: string;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background/80 backdrop-blur-sm p-2 border rounded-md shadow-lg">
        {/* Label is already formatted as 'MMM d' from chartData map */}
        <p className="label text-sm font-medium">{label}</p>
        <p className="intro text-sm text-primary">{`Sales: $${payload[0].value.toFixed(2)}`}</p>
      </div>
    );
  }
  return null;
};

export default function DashboardClientPage({ stats, salesChartData, error }: DashboardClientPageProps) {
  if (error) {
    return <div className="text-destructive p-4">Error loading dashboard data: {error}</div>;
  }

  if (!stats) {
    return <div className="p-4">Loading dashboard data...</div>;
  }

  const chartData = salesChartData?.map(item => ({
    // item.date is 'yyyy-MM-dd', format it for display
    name: format(new Date(item.date + 'T00:00:00'), 'MMM d'), // Ensure date is parsed correctly by adding time part
    sales: item.totalSales,
  })) || [];


  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sales (Today)</CardTitle>
            <DollarSign className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalSalesToday.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sales (This Week)</CardTitle>
            <DollarSign className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalSalesThisWeek.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sales (This Month)</CardTitle>
            <DollarSign className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalSalesThisMonth.toFixed(2)}</div>
          </CardContent>
        </Card>
         <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProducts}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Items (&lt;10)</CardTitle>
            <AlertTriangle className="h-5 w-5 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.lowStockItems}</div>
             <p className="text-xs text-muted-foreground">
              Items needing attention
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Sales Trend (Last 7 Days)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {chartData && chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="name" 
                  stroke="hsl(var(--muted-foreground))" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false}
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false} 
                  tickFormatter={(value) => `$${value}`}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--accent)/0.1)' }} />
                <Legend wrapperStyle={{fontSize: "12px"}} />
                <Bar dataKey="sales" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Total Sales" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-muted-foreground text-center py-10">
              Not enough sales data for the chart yet.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
