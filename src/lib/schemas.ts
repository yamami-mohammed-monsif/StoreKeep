
import { z } from 'zod';

export const ProductSchema = z.object({
  name: z.string().min(1, "Product name is required."),
  // 'price' in the form will map to 'retail_price' in the database
  price: z.coerce.number().min(0, "Retail price must be a positive number."),
  quantity: z.coerce.number().int().min(0, "Quantity must be a positive integer."),
  // type and wholesale_price are not in the form, so not validated here unless added to form
});
export type ProductFormData = z.infer<typeof ProductSchema>;


export const SaleSchema = z.object({
  productId: z.string().min(1, "Product selection is required."),
  quantitySold: z.coerce.number().int().min(1, "Quantity sold must be at least 1."),
});
export type SaleFormData = z.infer<typeof SaleSchema>;


export const RestockAISchema = z.object({
  salesData: z.string().min(1, "Sales data is required."),
  currentStockLevels: z.string().min(1, "Current stock levels are required."),
  leadTimeDays: z.coerce.number().int().min(0, "Lead time must be a non-negative integer."),
});
export type RestockAIFormData = z.infer<typeof RestockAISchema>;
