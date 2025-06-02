
export interface Product {
  id: string;
  name: string;
  type?: string; // Added from user schema
  wholesale_price?: number; // Added from user schema
  retail_price: number; // Replaces 'price'
  quantity: number;
  created_at: string;
  updated_at?: string; // Added from user schema
}

export interface SaleItem {
  id: string;
  sale_id: string;
  product_id: string;
  product_name?: string; // Can be denormalized or joined
  product_type?: string; // Can be denormalized or joined
  quantity_sold: number;
  wholesale_price_per_unit_snapshot?: number; // Price at time of sale - UPDATED
  retail_price_per_unit_snapshot: number; // Price at time of sale - UPDATED
  item_total_amount: number;
  created_at: string;
  updated_at?: string;
  products?: { name: string; type?: string; retail_price?: number }; // For joining product details if not denormalized
}

export interface Sale {
  id: string;
  sale_timestamp: string; // Renamed from sale_date
  total_transaction_amount: number; // Renamed from total_amount
  created_at: string;
  updated_at?: string;
  // product_id and quantity_sold are now in SaleItem
  sale_items?: SaleItem[]; // To hold related sale items
}

// This type might need to be re-evaluated based on how sales are fetched.
// For now, it will assume sales are primarily linked to product via sale_items.
export interface ProductWithSales extends Product {
  sale_items: Pick<SaleItem, 'quantity_sold' | 'retail_price_per_unit_snapshot' | 'item_total_amount'> & { sale_timestamp: string }[];
}

