
import { getDashboardStats, getSalesByDay } from "@/actions/dashboardActions";
import { Separator } from "@/components/ui/separator";
import type { SalesByDay } from "@/actions/dashboardActions";
import DashboardClientPage from "./DashboardClientPage";

interface DashboardStats {
  totalProducts: number;
  lowStockItems: number;
  totalSalesToday: number;
  totalSalesThisWeek: number;
  totalSalesThisMonth: number;
}

export default async function DashboardPage() {
  const [{ data: statsData, error: statsError }, { data: chartData, error: chartError }] = await Promise.all([
    getDashboardStats(),
    getSalesByDay(7)
  ]);
  
  const error = statsError || chartError;
  const stats = statsData || null;
  const salesChartDataProp = chartData || null;

  return (
    <div className="w-full space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Welcome to StoreKeep! Here's an overview of your store.</p>
      </div>
      <Separator />
      <DashboardClientPage stats={stats} salesChartData={salesChartDataProp || []} error={error} />
    </div>
  );
}
