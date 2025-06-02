"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { RestockAISchema, type RestockAIFormData } from "@/lib/schemas";
import { getRestockSuggestions, type GetRestockSuggestionsOutput } from "@/ai/flows/restock-suggestions";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Sparkles } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export default function RestockClientPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<GetRestockSuggestionsOutput | null>(null);

  const form = useForm<RestockAIFormData>({
    resolver: zodResolver(RestockAISchema),
    defaultValues: {
      salesData: "",
      currentStockLevels: "",
      leadTimeDays: 7,
    },
  });

  const onSubmit = async (data: RestockAIFormData) => {
    setIsLoading(true);
    setSuggestions(null);
    try {
      const result = await getRestockSuggestions(data);
      setSuggestions(result);
      toast({
        title: "Suggestions Generated",
        description: "AI has provided restock suggestions.",
      });
    } catch (error) {
      console.error("Error getting restock suggestions:", error);
      toast({
        title: "Error",
        description: `Failed to get suggestions: ${error instanceof Error ? error.message : String(error)}`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
       <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Sparkles className="h-7 w-7 text-primary" /> AI Restock Suggestions
        </h1>
        <p className="text-muted-foreground">
          Get intelligent restock recommendations based on your sales data.
        </p>
      </div>
      <Separator />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Input Data</CardTitle>
            <CardDescription>Provide sales history, current stock, and lead time.</CardDescription>
          </CardHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="salesData"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Past Sales Data</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="e.g., Product A, 2024-01-01, 10 sold&#10;Product B, 2024-01-02, 5 sold"
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="currentStockLevels"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Current Stock Levels</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="e.g., Product A, 50 in stock&#10;Product B, 20 in stock"
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="leadTimeDays"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Lead Time (Days)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="e.g., 7" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
              <CardFooter>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Sparkles className="mr-2 h-4 w-4" />
                  )}
                  Get Suggestions
                </Button>
              </CardFooter>
            </form>
          </Form>
        </Card>

        <Card className="min-h-[300px]">
          <CardHeader>
            <CardTitle>Restock Suggestions</CardTitle>
            <CardDescription>AI-powered recommendations will appear here.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading && (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="ml-2">Generating suggestions...</p>
              </div>
            )}
            {suggestions && !isLoading && (
              <div className="prose prose-sm max-w-none dark:prose-invert">
                <pre className="whitespace-pre-wrap bg-muted p-4 rounded-md text-sm">
                  {suggestions.restockSuggestions}
                </pre>
              </div>
            )}
            {!suggestions && !isLoading && (
              <p className="text-muted-foreground text-center py-8">
                Enter your data and click "Get Suggestions" to see results.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
