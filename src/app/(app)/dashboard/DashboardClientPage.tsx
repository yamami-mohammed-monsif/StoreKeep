
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
import useTranslation from "@/hooks/useTranslation";
import { Skeleton } from "@/components/ui/skeleton";

interface DashboardStats {
  totalProducts: number;
  lowStockItems: number;
  totalSalesToday: number;
  totalSalesThisWeek: number;
  totalSalesThisMonth: number;
}

interface DashboardClientPageProps {
  stats: DashboardStats | null;
  salesChartData: SalesByDay[]; 
  error?: string;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background/80 backdrop-blur-sm p-2 border rounded-md shadow-lg">
        <p className="label text-sm font-medium">{label}</p>
        <p className="intro text-sm text-primary">{`Sales: $${payload[0].value.toFixed(2)}`}</p>
      </div>
    );
  }
  return null;
};

export default function DashboardClientPage({ stats, salesChartData, error }: DashboardClientPageProps) {
  const { t, ready } = useTranslation();

  if (!ready) {
     return (
      <div className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-28 w-full" />)}
        </div>
        <Skeleton className="h-80 w-full" />
      </div>
    );
  }
  
  if (error) {
    return <div className="text-destructive p-4">{t('errorLoadingDashboardData', {error: error})}</div>;
  }

  if (!stats) {
    return <div className="p-4">{t('loadingDashboardData')}</div>;
  }

  const chartData = salesChartData?.map(item => ({
    name: format(new Date(item.date + 'T00:00:00'), 'MMM d'), 
    sales: item.totalSales,
  })) || [];


  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border border-primary/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('totalSalesToday')}</CardTitle>
            <DollarSign className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">${stats.totalSalesToday.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card className="border border-primary/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('totalSalesThisWeek')}</CardTitle>
            <DollarSign className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">${stats.totalSalesThisWeek.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card className="border border-primary/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('totalSalesThisMonth')}</CardTitle>
            <DollarSign className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">${stats.totalSalesThisMonth.toFixed(2)}</div>
          </CardContent>
        </Card>
         <Card className="border border-primary/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('totalProducts')}</CardTitle>
            <Package className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProducts}</div>
          </CardContent>
        </Card>
        <Card className="border border-primary/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('lowStockItems')}</CardTitle>
            <AlertTriangle className="h-5 w-5 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.lowStockItems}</div>
             <p className="text-xs text-muted-foreground">
              {t('itemsNeedingAttention')}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="border border-primary/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            {t('salesTrendLast7Days')}
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
              {t('notEnoughSalesData')}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
