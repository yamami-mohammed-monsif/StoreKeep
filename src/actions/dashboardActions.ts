
"use server";

import { supabase } from '@/lib/supabaseClient';
import type { Sale } from '@/types'; // Product type not directly used here for stats
import { startOfDay, startOfWeek, startOfMonth, endOfDay, endOfWeek, endOfMonth, subDays, format } from 'date-fns';

interface DashboardStats {
  totalProducts: number;
  lowStockItems: number;
  totalSalesToday: number;
  totalSalesThisWeek: number;
  totalSalesThisMonth: number;
}

export async function getDashboardStats(): Promise<{ data?: DashboardStats; error?: string }> {
  try {
    const today = new Date();
    
    const { count: totalProducts, error: productsError } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true });

    if (productsError) throw productsError;

    const { count: lowStockItems, error: lowStockError } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .lt('quantity', 10); 

    if (lowStockError) throw lowStockError;

    const salesTodayResult = await supabase
      .from('sales')
      .select('total_transaction_amount') // Use new column name
      .gte('sale_timestamp', startOfDay(today).toISOString()) // Use new column name
      .lte('sale_timestamp', endOfDay(today).toISOString());
    if (salesTodayResult.error) throw salesTodayResult.error;
    const totalSalesToday = salesTodayResult.data?.reduce((sum, sale) => sum + sale.total_transaction_amount, 0) || 0;
    
    const salesThisWeekResult = await supabase
      .from('sales')
      .select('total_transaction_amount') // Use new column name
      .gte('sale_timestamp', startOfWeek(today, { weekStartsOn: 1 }).toISOString()) 
      .lte('sale_timestamp', endOfWeek(today, { weekStartsOn: 1 }).toISOString());
    if (salesThisWeekResult.error) throw salesThisWeekResult.error;
    const totalSalesThisWeek = salesThisWeekResult.data?.reduce((sum, sale) => sum + sale.total_transaction_amount, 0) || 0;

    const salesThisMonthResult = await supabase
      .from('sales')
      .select('total_transaction_amount') // Use new column name
      .gte('sale_timestamp', startOfMonth(today).toISOString())
      .lte('sale_timestamp', endOfMonth(today).toISOString());
    if (salesThisMonthResult.error) throw salesThisMonthResult.error;
    const totalSalesThisMonth = salesThisMonthResult.data?.reduce((sum, sale) => sum + sale.total_transaction_amount, 0) || 0;

    return {
      data: {
        totalProducts: totalProducts || 0,
        lowStockItems: lowStockItems || 0,
        totalSalesToday,
        totalSalesThisWeek,
        totalSalesThisMonth,
      }
    };
  } catch (error: any) {
    console.error('Error fetching dashboard stats:', error.message || error);
    return { error: error.message };
  }
}

export interface SalesByDay {
  date: string; // Represents the day
  totalSales: number;
}

export async function getSalesByDay(days: number = 7): Promise<{ data?: SalesByDay[]; error?: string }> {
  try {
    const dateTo = endOfDay(new Date());
    const dateFrom = startOfDay(subDays(new Date(), days - 1));

    // Fetch raw sales data within the date range
    const { data, error } = await supabase
      .from('sales')
      .select('sale_timestamp, total_transaction_amount') // Use new column names
      .gte('sale_timestamp', dateFrom.toISOString())
      .lte('sale_timestamp', dateTo.toISOString())
      .order('sale_timestamp', { ascending: true });

    if (error) throw error;

    // Aggregate sales by day
    const salesMap = new Map<string, number>();

    // Initialize map with all days in the range to ensure days with no sales are included
    for (let i = 0; i < days; i++) {
      const currentDate = startOfDay(subDays(new Date(), i));
      salesMap.set(format(currentDate, 'yyyy-MM-dd'), 0);
    }
    
    // Populate map with actual sales data
    (data as Partial<Sale>[]).forEach(sale => {
      if (sale.sale_timestamp && typeof sale.total_transaction_amount === 'number') {
        const day = format(new Date(sale.sale_timestamp), 'yyyy-MM-dd');
        salesMap.set(day, (salesMap.get(day) || 0) + sale.total_transaction_amount);
      }
    });
    
    const aggregatedSales = Array.from(salesMap.entries())
      .map(([date, totalSales]) => ({ date, totalSales }))
      // Sort by date to ensure the chart displays chronologically
      .sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return { data: aggregatedSales };

  } catch (error: any) {
    console.error('Error fetching sales by day:', error.message || error);
    return { error: error.message };
  }
}
