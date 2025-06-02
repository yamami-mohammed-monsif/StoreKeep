
import Link from "next/link";
import { ArrowLeft, CalendarDays, Filter } from "lucide-react"; // Added CalendarDays, Filter for potential future use
import RecordSaleForm from "./RecordSaleForm";
import SalesHistory from "./SalesHistory";
import { getProducts } from "@/actions/productActions";
import { getSales } from "@/actions/saleActions";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";

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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="/dashboard">
              <ArrowLeft className="h-5 w-5" />
              <span className="sr-only">Back to Dashboard</span>
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Sales Reports</h1>
            <p className="text-muted-foreground">View and analyze your sales data.</p>
          </div>
        </div>
        {/* Placeholder for future filter/calendar icons 
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon">
            <Filter className="h-5 w-5" />
            <span className="sr-only">Filter Sales</span>
          </Button>
          <Button variant="outline" size="icon">
            <CalendarDays className="h-5 w-5" />
            <span className="sr-only">Select Date Range</span>
          </Button>
        </div>
        */}
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
