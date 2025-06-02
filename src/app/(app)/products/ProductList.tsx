"use client";

import type { Product } from "@/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, Edit3, MinusCircle, PlusCircle } from "lucide-react";
import { deleteProduct, updateProductQuantity } from "@/actions/productActions";
import { useToast } from "@/hooks/use-toast";
import { useState, useTransition } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface ProductListProps {
  products: Product[];
}

export default function ProductList({ products }: ProductListProps) {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [editQuantity, setEditQuantity] = useState<number>(0);


  const handleDelete = async (productId: string) => {
    startTransition(async () => {
      const result = await deleteProduct(productId);
      if (result.error) {
        toast({
          title: "Error",
          description: `Failed to delete product: ${result.error}`,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success",
          description: "Product deleted successfully.",
        });
      }
    });
  };

  const handleQuantityChange = async (productId: string, change: number) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const newQuantity = product.quantity + change;
    if (newQuantity < 0) {
      toast({ title: "Error", description: "Quantity cannot be negative.", variant: "destructive"});
      return;
    }

    startTransition(async () => {
      const result = await updateProductQuantity(productId, newQuantity);
      if (result.error) {
        toast({ title: "Error", description: `Failed to update quantity: ${result.error}`, variant: "destructive"});
      } else {
        toast({ title: "Success", description: "Quantity updated."});
      }
    });
  };


  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Current Stock Levels</CardTitle>
      </CardHeader>
      <CardContent>
        {products.length === 0 ? (
          <p className="text-muted-foreground">No products found. Add some products to see them here.</p>
        ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead className="text-right">Quantity</TableHead>
                <TableHead className="text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell className="text-right">${product.price.toFixed(2)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                       <Button variant="ghost" size="icon" onClick={() => handleQuantityChange(product.id, -1)} disabled={isPending || product.quantity === 0}>
                        <MinusCircle className="h-4 w-4" />
                      </Button>
                      {product.quantity}
                      <Button variant="ghost" size="icon" onClick={() => handleQuantityChange(product.id, 1)} disabled={isPending}>
                        <PlusCircle className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                     <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" aria-label="Delete product" disabled={isPending}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the product "{product.name}".
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(product.id)}
                            className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                    {/* Edit button can be implemented later */}
                    {/* <Button variant="ghost" size="icon" aria-label="Edit product" className="ml-2" disabled>
                        <Edit3 className="h-4 w-4" />
                    </Button> */}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        )}
      </CardContent>
    </Card>
  );
}
