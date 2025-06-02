import ProductForm from "./ProductForm";
import ProductList from "./ProductList";
import { getProducts } from "@/actions/productActions";
import { Separator } from "@/components/ui/separator";

export const dynamic = 'force-dynamic'; // Ensure fresh data on each request

export default async function ProductsPage() {
  const { data: products, error } = await getProducts();

  if (error) {
    return <div className="text-destructive">Error loading products: {error}</div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Manage Products</h1>
        <p className="text-muted-foreground">Add new products and view current stock levels.</p>
      </div>
      <Separator />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-1">
          <ProductForm />
        </div>
        <div className="lg:col-span-2">
          <ProductList products={products || []} />
        </div>
      </div>
    </div>
  );
}
