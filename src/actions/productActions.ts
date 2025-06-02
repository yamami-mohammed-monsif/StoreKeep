
"use server";

import { supabase } from '@/lib/supabaseClient';
import type { ProductFormData } from '@/lib/schemas';
import type { Product } from '@/types';
import { revalidatePath } from 'next/cache';

export async function addProduct(formData: ProductFormData): Promise<{ data?: Product; error?: string }> {
  const { data, error } = await supabase
    .from('products')
    .insert([
      { 
        name: formData.name, 
        retail_price: formData.price, // Map form 'price' to 'retail_price'
        quantity: formData.quantity,
        // Assuming 'type' and 'wholesale_price' are nullable or have DB defaults
        // as they are not collected in the current form
      },
    ])
    .select()
    .single();

  if (error) {
    console.error('Error adding product:', error.message || error);
    return { error: error.message };
  }
  revalidatePath('/products');
  revalidatePath('/sales'); 
  return { data: data as Product };
}

export async function getProducts(): Promise<{ data?: Product[]; error?: string }> {
  const { data, error } = await supabase
    .from('products')
    .select('id, name, retail_price, quantity, created_at, type, wholesale_price, updated_at') // Ensure all relevant columns are fetched
    .order('name', { ascending: true });

  if (error) {
    console.error('Error fetching products:', error.message || error);
    return { error: error.message };
  }
  return { data: data as Product[] };
}

export async function updateProductQuantity(productId: string, newQuantity: number): Promise<{ error?: string }> {
  const { error } = await supabase
    .from('products')
    .update({ quantity: newQuantity, updated_at: new Date().toISOString() })
    .eq('id', productId);

  if (error) {
    console.error('Error updating product quantity:', error.message || error);
    return { error: error.message };
  }
  revalidatePath('/products');
  revalidatePath('/dashboard'); 
  return {};
}

export async function deleteProduct(productId: string): Promise<{ error?: string }> {
  // Consider handling related sale_items if cascading delete is not set up in DB
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', productId);

  if (error) {
    console.error('Error deleting product:', error.message || error);
    return { error: error.message };
  }
  revalidatePath('/products');
  revalidatePath('/sales');
  revalidatePath('/dashboard');
  return {};
}
