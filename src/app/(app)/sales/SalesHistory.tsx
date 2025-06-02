
"use client";

import type { Sale, SaleItem } from "@/types";
import { format } from 'date-fns';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface SalesHistoryProps {
  sales: Sale[];
}

export default function SalesHistory({ sales }: SalesHistoryProps) {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Recent Sales Data</CardTitle>
      </CardHeader>
      <CardContent>
        {sales.length === 0 ? (
          <p className="text-muted-foreground">No sales recorded yet.</p>
        ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted hover:bg-muted">
                <TableHead className="text-foreground">Sale ID</TableHead>
                <TableHead className="text-foreground">Product</TableHead>
                <TableHead className="text-right text-foreground">Qty Sold</TableHead>
                <TableHead className="text-right text-foreground">Item Total</TableHead>
                <TableHead className="text-right text-foreground">Transaction Total</TableHead>
                <TableHead className="text-foreground">Sale Timestamp</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sales.map((sale) => (
                // Each sale can have multiple items, but for now we assume one for simplicity from recordSale
                sale.sale_items && sale.sale_items.map((item: SaleItem) => (
                  <TableRow key={`${sale.id}-${item.id}`}>
                    <TableCell className="font-mono text-xs">{sale.id.substring(0,8)}...</TableCell>
                    <TableCell className="font-medium">
                      {item.products?.name || item.product_name || 'N/A'}
                    </TableCell>
                    <TableCell className="text-right">{item.quantity_sold}</TableCell>
                    <TableCell className="text-right">${item.item_total_amount.toFixed(2)}</TableCell>
                    <TableCell className="text-right">${sale.total_transaction_amount.toFixed(2)}</TableCell>
                    <TableCell>{format(new Date(sale.sale_timestamp), "MMM d, yyyy HH:mm")}</TableCell>
                  </TableRow>
                ))
              ))}
            </TableBody>
          </Table>
        </div>
        )}
      </CardContent>
    </Card>
  );
}
