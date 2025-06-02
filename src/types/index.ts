export interface Product {
  id: string;
  name: string;
  price: number;
  quantity: number;
  created_at: string;
}

export interface Sale {
  id: string;
  product_id: string;
  quantity_sold: number;
  sale_date: string;
  total_amount: number;
  created_at: string;
  products?: { name: string }; // Optional: for joining product name
}

export interface ProductWithSales extends Product {
  sales: Pick<Sale, 'quantity_sold' | 'sale_date'>[];
}
