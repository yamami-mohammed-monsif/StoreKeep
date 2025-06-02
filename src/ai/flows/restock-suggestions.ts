'use server';

/**
 * @fileOverview An AI agent that provides restock suggestions based on past sales data.
 *
 * - getRestockSuggestions - A function that generates restock suggestions.
 * - GetRestockSuggestionsInput - The input type for the getRestockSuggestions function.
 * - GetRestockSuggestionsOutput - The return type for the getRestockSuggestions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GetRestockSuggestionsInputSchema = z.object({
  salesData: z
    .string()
    .describe(
      'A string containing past sales data for each product, including product name, date, and quantity sold.'
    ),
  currentStockLevels: z
    .string()
    .describe(
      'A string containing current stock levels for each product, including product name and quantity in stock.'
    ),
  leadTimeDays: z
    .number()
    .describe(
      'The number of days it takes to receive a new shipment of products from the supplier.'
    ),
});
export type GetRestockSuggestionsInput = z.infer<typeof GetRestockSuggestionsInputSchema>;

const GetRestockSuggestionsOutputSchema = z.object({
  restockSuggestions: z.string().describe('Restock suggestions for each product.'),
});
export type GetRestockSuggestionsOutput = z.infer<typeof GetRestockSuggestionsOutputSchema>;

export async function getRestockSuggestions(input: GetRestockSuggestionsInput): Promise<GetRestockSuggestionsOutput> {
  return getRestockSuggestionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'restockSuggestionsPrompt',
  input: {schema: GetRestockSuggestionsInputSchema},
  output: {schema: GetRestockSuggestionsOutputSchema},
  prompt: `You are an expert inventory management assistant. Your goal is to provide restock suggestions based on past sales data and current stock levels.

  Analyze the following sales data and current stock levels to determine the optimal restock quantities for each product. Consider the lead time required to receive new shipments.

  Sales Data:
  {{salesData}}

  Current Stock Levels:
  {{currentStockLevels}}

  Lead Time (days):
  {{leadTimeDays}}

  Provide restock suggestions for each product, taking into account sales trends and lead time to avoid stockouts and minimize overstocking.  The suggestions should be easily parsable.
  `,
});

const getRestockSuggestionsFlow = ai.defineFlow(
  {
    name: 'getRestockSuggestionsFlow',
    inputSchema: GetRestockSuggestionsInputSchema,
    outputSchema: GetRestockSuggestionsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
