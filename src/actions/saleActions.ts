
"use server";

import { supabase } from '@/lib/supabaseClient';
import type { SaleFormData } from '@/lib/schemas';
import type { Sale, Product } from '@/types';
import { revalidatePath } from 'next/cache';

export async function recordSale(formData: SaleFormData): Promise<{ data?: Sale; error?: string }> {
  // 1. Fetch the product to get its current price and quantity
  const { data: product, error: productError } = await supabase
    .from('products')
    .select('id, price, quantity')
    .eq('id', formData.productId)
    .single();

  if (productError || !product) {
    console.error('Error fetching product for sale:', productError?.message || 'Product not found.');
    return { error: productError?.message || 'Product not found.' };
  }

  // 2. Check if enough stock is available
  if (product.quantity < formData.quantitySold) {
    return { error: 'Not enough stock available for this sale.' };
  }

  // 3. Calculate total amount
  const totalAmount = product.price * formData.quantitySold;

  // 4. Start a transaction (or proceed if not using Supabase transactions directly here)
  // For simplicity, we'll do sequential operations. Proper transactions are better for production.

  // 5. Insert the sale record
  const { data: saleData, error: saleError } = await supabase
    .from('sales')
    .insert([
      {
        product_id: formData.productId,
        quantity_sold: formData.quantitySold,
        total_amount: totalAmount,
        sale_date: new Date().toISOString(),
      },
    ])
    .select()
    .single();

  if (saleError) {
    console.error('Error recording sale:', saleError.message || saleError);
    return { error: saleError.message };
  }

  // 6. Update product quantity
  const newQuantity = product.quantity - formData.quantitySold;
  const { error: updateError } = await supabase
    .from('products')
    .update({ quantity: newQuantity })
    .eq('id', formData.productId);

  if (updateError) {
    // Potentially roll back sale or log inconsistency
    console.error('Error updating product quantity after sale:', updateError.message || updateError);
    // For now, return sale data but warn about quantity update failure
    return { data: saleData as Sale, error: `Sale recorded, but failed to update product quantity: ${updateError.message}` };
  }

  revalidatePath('/sales');
  revalidatePath('/products'); // Stock levels changed
  revalidatePath('/dashboard'); // Sales data changed
  revalidatePath('/restock'); // Sales data changed
  return { data: saleData as Sale };
}

export async function getSales(limit: number = 50): Promise<{ data?: Sale[]; error?: string }> {
  const { data, error } = await supabase
    .from('sales')
    .select('*, products(name)') // Join with products table to get product name
    .order('sale_date', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching sales:', error.message || error);
    return { error: error.message };
  }
  return { data: data as Sale[] };
}

export async function getSalesForDashboard(period: 'today' | 'week' | 'month'): Promise<{ data?: Sale[], error?: string }> {
  let startDate = new Date();
  if (period === 'today') {
    startDate.setHours(0, 0, 0, 0);
  } else if (period === 'week') {
    startDate.setDate(startDate.getDate() - 7);
    startDate.setHours(0, 0, 0, 0);
  } else if (period === 'month') {
    startDate.setDate(startDate.getDate() - 30);
    startDate.setHours(0, 0, 0, 0);
  }

  const { data, error } = await supabase
    .from('sales')
    .select('id, product_id, quantity_sold, sale_date, total_amount, products(name)')
    .gte('sale_date', startDate.toISOString())
    .order('sale_date', { ascending: false });
  
  if (error) {
    console.error(`Error fetching sales for ${period}:`, error.message || error);
    return { error: error.message };
  }
  return { data: data as Sale[] };
}
