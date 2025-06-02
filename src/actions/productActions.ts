
"use server";

import { supabase } from '@/lib/supabaseClient';
import type { ProductFormData } from '@/lib/schemas';
import type { Product } from '@/types';
import { revalidatePath } from 'next/cache';

export async function addProduct(formData: ProductFormData): Promise<{ data?: Product; error?: string }> {
  const { data, error } = await supabase
    .from('products')
    .insert([
      { name: formData.name, price: formData.price, quantity: formData.quantity },
    ])
    .select()
    .single();

  if (error) {
    console.error('Error adding product:', error.message || error);
    return { error: error.message };
  }
  revalidatePath('/products');
  revalidatePath('/sales'); // Product list might be used in sales form
  return { data: data as Product };
}

export async function getProducts(): Promise<{ data?: Product[]; error?: string }> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
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
    .update({ quantity: newQuantity })
    .eq('id', productId);

  if (error) {
    console.error('Error updating product quantity:', error.message || error);
    return { error: error.message };
  }
  revalidatePath('/products');
  revalidatePath('/dashboard'); // Dashboard might show stock levels
  return {};
}

export async function deleteProduct(productId: string): Promise<{ error?: string }> {
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
