import RecordSaleForm from "./RecordSaleForm";
import SalesHistory from "./SalesHistory";
import { getProducts } from "@/actions/productActions";
import { getSales } from "@/actions/saleActions";
import { Separator } from "@/components/ui/separator";

export const dynamic = 'force-dynamic';

export default async function SalesPage() {
  const [{ data: productsData, error: productsError }, { data: salesData, error: salesError }] = await Promise.all([
    getProducts(),
    getSales(20) // Get recent 20 sales
  ]);
  
  const products = productsData || [];
  const sales = salesData || [];

  if (productsError) {
    return <div className="text-destructive">Error loading products: {productsError}</div>;
  }
  if (salesError) {
    // Non-critical, can still show form
    console.error("Error loading sales history:", salesError);
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Record Sales</h1>
        <p className="text-muted-foreground">Track sales and automatically update stock levels.</p>
      </div>
      <Separator />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-1">
          <RecordSaleForm products={products} />
        </div>
        <div className="lg:col-span-2">
          <SalesHistory sales={sales} />
        </div>
      </div>
    </div>
  );
}
