
"use server";

import { supabase } from '@/lib/supabaseClient';
import type { SaleFormData } from '@/lib/schemas';
import type { Sale, SaleItem, Product } from '@/types';
import { revalidatePath } from 'next/cache';

export async function recordSale(formData: SaleFormData): Promise<{ data?: { sale: Sale, saleItem: SaleItem }; error?: string }> {
  // 1. Fetch the product to get its current retail_price and quantity
  const { data: product, error: productError } = await supabase
    .from('products')
    .select('id, name, type, retail_price, wholesale_price, quantity')
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

  // 3. Calculate item total amount
  const itemTotalAmount = product.retail_price * formData.quantitySold;
  const saleTimestamp = new Date().toISOString();

  // 4. Insert the main sale record
  const { data: saleData, error: saleInsertError } = await supabase
    .from('sales')
    .insert([
      {
        sale_timestamp: saleTimestamp,
        total_transaction_amount: itemTotalAmount, 
      },
    ])
    .select()
    .single();

  if (saleInsertError || !saleData) {
    console.error('Error inserting sale record:', saleInsertError?.message || 'Failed to insert sale.');
    return { error: saleInsertError?.message || 'Failed to insert sale.' };
  }

  // 5. Insert the sale item record
  const { data: saleItemData, error: saleItemInsertError } = await supabase
    .from('sale_items') 
    .insert([
      {
        sale_id: saleData.id,
        product_id: product.id,
        product_name: product.name, 
        product_type: product.type, 
        quantity_sold: formData.quantitySold,
        wholesale_price_per_unit_snapshot: product.wholesale_price, 
        retail_price_per_unit_snapshot: product.retail_price, 
        item_total_amount: itemTotalAmount,
      }
    ])
    .select()
    .single();
  
  if (saleItemInsertError || !saleItemData) {
    console.error('Error inserting sale item record:', saleItemInsertError?.message || 'Failed to insert sale item.');
    // Potentially roll back the sale record here if critical
    return { error: saleItemInsertError?.message || 'Failed to insert sale item.' };
  }

  // 6. Update product quantity
  const newQuantity = product.quantity - formData.quantitySold;
  const { error: updateError } = await supabase
    .from('products')
    .update({ quantity: newQuantity, updated_at: new Date().toISOString() })
    .eq('id', product.id);

  if (updateError) {
    console.error('Error updating product quantity after sale:', updateError.message || updateError);
    // Sale recorded, but quantity update failed. This is a partial success.
    // Consider how to handle this - e.g., alert admin, queue for retry.
    return { data: { sale: saleData as Sale, saleItem: saleItemData as SaleItem }, error: `Sale recorded, but failed to update product quantity: ${updateError.message}` };
  }

  revalidatePath('/sales');
  revalidatePath('/products'); 
  revalidatePath('/dashboard'); 
  revalidatePath('/restock'); 
  return { data: { sale: saleData as Sale, saleItem: saleItemData as SaleItem } };
}

export async function getSales(limit: number = 50): Promise<{ data?: Sale[]; error?: string }> {
  const { data, error } = await supabase
    .from('sales')
    .select(`
      id,
      sale_timestamp,
      total_transaction_amount,
      created_at,
      updated_at,
      sale_items:sale_items!sale_id ( 
        id,
        product_id,
        quantity_sold,
        retail_price_per_unit_snapshot, 
        item_total_amount,
        created_at,
        products:products!product_id ( name, type ) 
      )
    `)
    .order('sale_timestamp', { ascending: false })
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
    const day = startDate.getDay();
    const diff = startDate.getDate() - day + (day === 0 ? -6 : 1); // Adjust to make Monday the start of the week
    startDate = new Date(startDate.setDate(diff));
    startDate.setHours(0,0,0,0);
  } else if (period === 'month') {
    startDate = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
    startDate.setHours(0,0,0,0);
  }

  const { data, error } = await supabase
    .from('sales')
    .select(`
      id, 
      sale_timestamp, 
      total_transaction_amount, 
      sale_items:sale_items!sale_id( 
        product_id, 
        quantity_sold, 
        item_total_amount,
        products:products!product_id(name)
      )
    `)
    .gte('sale_timestamp', startDate.toISOString())
    .order('sale_timestamp', { ascending: false });
  
  if (error) {
    console.error(`Error fetching sales for ${period}:`, error.message || error);
    return { error: error.message };
  }
  return { data: data as Sale[] };
}

