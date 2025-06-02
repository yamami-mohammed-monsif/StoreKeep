"use server";

import { supabase } from '@/lib/supabaseClient';
import type { Sale, Product } from '@/types';
import { startOfDay, startOfWeek, startOfMonth, endOfDay, endOfWeek, endOfMonth, subDays } from 'date-fns';

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
      .lt('quantity', 10); // Assuming low stock is less than 10

    if (lowStockError) throw lowStockError;

    const salesToday = await supabase
      .from('sales')
      .select('total_amount')
      .gte('sale_date', startOfDay(today).toISOString())
      .lte('sale_date', endOfDay(today).toISOString());
    if (salesToday.error) throw salesToday.error;
    const totalSalesToday = salesToday.data?.reduce((sum, sale) => sum + sale.total_amount, 0) || 0;
    
    const salesThisWeek = await supabase
      .from('sales')
      .select('total_amount')
      .gte('sale_date', startOfWeek(today, { weekStartsOn: 1 }).toISOString()) // Assuming week starts on Monday
      .lte('sale_date', endOfWeek(today, { weekStartsOn: 1 }).toISOString());
    if (salesThisWeek.error) throw salesThisWeek.error;
    const totalSalesThisWeek = salesThisWeek.data?.reduce((sum, sale) => sum + sale.total_amount, 0) || 0;

    const salesThisMonth = await supabase
      .from('sales')
      .select('total_amount')
      .gte('sale_date', startOfMonth(today).toISOString())
      .lte('sale_date', endOfMonth(today).toISOString());
    if (salesThisMonth.error) throw salesThisMonth.error;
    const totalSalesThisMonth = salesThisMonth.data?.reduce((sum, sale) => sum + sale.total_amount, 0) || 0;

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
    console.error('Error fetching dashboard stats:', error);
    return { error: error.message };
  }
}

export interface SalesByDay {
  date: string;
  totalSales: number;
}

export async function getSalesByDay(days: number = 7): Promise<{ data?: SalesByDay[]; error?: string }> {
  try {
    const dateTo = endOfDay(new Date());
    const dateFrom = startOfDay(subDays(new Date(), days - 1));

    const { data, error } = await supabase
      .from('sales')
      .select('sale_date, total_amount')
      .gte('sale_date', dateFrom.toISOString())
      .lte('sale_date', dateTo.toISOString())
      .order('sale_date', { ascending: true });

    if (error) throw error;

    const salesMap = new Map<string, number>();
    for (let i = 0; i < days; i++) {
      const date = startOfDay(subDays(new Date(), i));
      salesMap.set(format(date, 'yyyy-MM-dd'), 0);
    }
    
    (data as Sale[]).forEach(sale => {
      const day = format(new Date(sale.sale_date), 'yyyy-MM-dd');
      salesMap.set(day, (salesMap.get(day) || 0) + sale.total_amount);
    });
    
    const aggregatedSales = Array.from(salesMap.entries())
      .map(([date, totalSales]) => ({ date, totalSales }))
      .sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime()); // ensure correct order

    return { data: aggregatedSales };

  } catch (error: any) {
    console.error('Error fetching sales by day:', error);
    return { error: error.message };
  }
}

// Helper function to format date, if not using date-fns directly in component
import { format } from 'date-fns';
