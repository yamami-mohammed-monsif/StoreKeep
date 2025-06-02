"use client";

import DashboardClientPage from "./DashboardClientPage";
import { getDashboardStats, getSalesByDay } from "@/actions/dashboardActions";
import { Separator } from "@/components/ui/separator";
import useTranslation from "@/hooks/useTranslation";
import { useEffect, useState } from 'react';
import { Skeleton } from "@/components/ui/skeleton";

interface DashboardStats {
  totalProducts: number;
  lowStockItems: number;
  totalSalesToday: number;
  totalSalesThisWeek: number;
  totalSalesThisMonth: number;
}
type SalesChartData = Awaited<ReturnType<typeof getSalesByDay>>['data'];


export default function DashboardPage() {
  const { t, currentLocale, ready } = useTranslation();

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [salesChartData, setSalesChartData] = useState<SalesChartData | null>(null);
  const [error, setError] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (ready) {
      document.title = t('dashboard') + " - " + t('storeKeep');
    }
  }, [ready, t, currentLocale]);

  useEffect(() => {
    async function fetchData() {
      if (!ready) return; 
      setLoading(true);
      try {
        const [{ data: statsData, error: statsError }, { data: chartData, error: chartError }] = await Promise.all([
          getDashboardStats(),
          getSalesByDay(7)
        ]);
        
        if (statsError || chartError) {
          setError(statsError || chartError);
        } else {
          setStats(statsData || null);
          setSalesChartData(chartData || null);
        }
      } catch (e: any) {
        setError(e.message || 'Failed to fetch dashboard data');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [ready, currentLocale]);

  if (!ready || loading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-10 w-1/4 mb-1" />
          <Skeleton className="h-6 w-1/2" />
        </div>
        <Separator />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-28 w-full" />)}
        </div>
        <Skeleton className="h-80 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t('dashboard')}</h1>
        <p className="text-muted-foreground">{t('welcomeToStoreKeep')}</p>
      </div>
      <Separator />
      <DashboardClientPage stats={stats} salesChartData={salesChartData || []} error={error} />
    </div>
  );
}
