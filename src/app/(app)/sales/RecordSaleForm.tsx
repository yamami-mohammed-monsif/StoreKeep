
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { SaleSchema, type SaleFormData } from "@/lib/schemas";
import { recordSale } from "@/actions/saleActions";
import type { Product } from "@/types";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface RecordSaleFormProps {
  products: Product[];
}

export default function RecordSaleForm({ products }: RecordSaleFormProps) {
  const { toast } = useToast();
  const form = useForm<SaleFormData>({
    resolver: zodResolver(SaleSchema),
    defaultValues: {
      productId: "",
      quantitySold: 1,
    },
  });

  const onSubmit = async (data: SaleFormData) => {
    const selectedProduct = products.find(p => p.id === data.productId);
    if (!selectedProduct) {
        toast({ title: "Error", description: "Invalid product selected.", variant: "destructive" });
        return;
    }
    if (selectedProduct.quantity < data.quantitySold) {
        toast({ title: "Error", description: `Not enough stock for ${selectedProduct.name}. Available: ${selectedProduct.quantity}`, variant: "destructive" });
        return;
    }

    const result = await recordSale(data);
    if (result.error) {
      toast({
        title: "Error",
        description: `Failed to record sale: ${result.error}`,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Sale recorded successfully.",
        variant: "positive", // Use new positive variant
      });
      form.reset();
    }
  };

  const availableProducts = products.filter(p => p.quantity > 0);

  return (
    <Card className="w-full max-w-lg">
      <CardHeader>
        <CardTitle>Record Sale Details</CardTitle>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="productId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Product</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a product" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {availableProducts.length > 0 ? (
                        availableProducts.map((product) => (
                          <SelectItem key={product.id} value={product.id}>
                            {product.name} (Stock: {product.quantity})
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="no-products" disabled>
                          No products in stock
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="quantitySold"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Quantity Sold</FormLabel>
                  <FormControl>
                    <Input type="number" step="1" min="1" placeholder="e.g. 1" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter>
            <Button 
              type="submit" 
              disabled={form.formState.isSubmitting || availableProducts.length === 0}
              className="bg-accent hover:bg-accent/90 text-primary-foreground" // Warm Orange background, White text
            >
              {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Complete Sale
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
