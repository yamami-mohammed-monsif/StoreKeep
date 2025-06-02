import DashboardClientPage from "./DashboardClientPage";
import { getDashboardStats, getSalesByDay } from "@/actions/dashboardActions";
import { Separator } from "@/components/ui/separator";

export const dynamic = 'force-dynamic';

export const metadata = {
  title: "Dashboard - StoreKeep",
  description: "Overview of your sales and inventory.",
};

export default async function DashboardPage() {
  const [{ data: stats, error: statsError }, { data: salesChartData, error: chartError }] = await Promise.all([
    getDashboardStats(),
    getSalesByDay(7) // Fetch sales for the last 7 days for the chart
  ]);

  const combinedError = statsError || chartError;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Welcome to StoreKeep! Here's an overview of your store.</p>
      </div>
      <Separator />
      <DashboardClientPage stats={stats || null} salesChartData={salesChartData || null} error={combinedError} />
    </div>
  );
}
