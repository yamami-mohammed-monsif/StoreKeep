# Project Changelog

This file documents the significant changes and steps made to the StoreKeep application.

## Initial Setup & Debugging

1.  **Supabase Credentials**:
    *   Encountered "Invalid URL" error on initial run.
    *   Updated the `.env` file with the user-provided `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

2.  **Layout Rendering Error**:
    *   Encountered "React.Children.only expected to receive a single React element child" error.
    *   **Fix**: Modified `src/app/(app)/layout.tsx`. Corrected the usage of `SidebarTrigger` by removing an unnecessary nested `Button` and the `asChild` prop, applying styling props directly to `SidebarTrigger`.

3.  **Improved Server Action Logging**:
    *   Observed generic console error "Error fetching sales by day: {}".
    *   **Enhancement**: Updated `console.error` calls in `src/actions/dashboardActions.ts`, `src/actions/productActions.ts`, and `src/actions/saleActions.ts` to log `error.message || error` for more descriptive error output.

## Database Schema Alignment & Refactor

4.  **Schema Mismatch Identification**:
    *   Discussed discrepancies between the application's expected database schema and the user's actual Supabase schema (e.g., `sale_date` vs `sale_timestamp`, `total_amount` vs `total_transaction_amount`, and the introduction of a three-table structure: `products`, `sales`, `sale_items`).

5.  **Major Code Refactor for Schema Alignment**:
    *   Updated `src/types/index.ts`: Modified `Product`, `Sale`, and `SaleItem` interfaces to match the user's database schema (e.g., using `retail_price`, `wholesale_price` in `products`; `sale_timestamp`, `total_transaction_amount` in `sales`; and detailing fields for `sale_items` including snapshot prices).
    *   Updated `src/lib/schemas.ts`: Adjusted Zod schemas for product and sale forms.
    *   Updated `src/actions/productActions.ts`: Aligned product creation and fetching with the new `products` table structure (e.g., mapping form `price` to `retail_price`).
    *   Updated `src/actions/saleActions.ts`:
        *   Rewrote `recordSale` to create entries in both `sales` and `sale_items` tables.
        *   Updated `getSales` and `getSalesForDashboard` to fetch data by joining `sales`, `sale_items`, and `products` tables, using correct column names like `sale_timestamp` and `total_transaction_amount`.
    *   Updated `src/actions/dashboardActions.ts`: Aligned dashboard statistics fetching with the new schema, particularly for sales data.
    *   Updated `src/app/(app)/products/ProductList.tsx`: Displayed `retail_price`.
    *   Updated `src/app/(app)/sales/SalesHistory.tsx`: Adapted to display sales data based on the new joined structure from `sales` and `sale_items`.
    *   Updated `src/app/(app)/dashboard/DashboardClientPage.tsx`: Ensured dashboard statistics and charts use the correctly mapped field names.

6.  **Restock Page Typo**:
    *   Encountered "Parsing ecmascript source code failed ... Expected 'from', got '_from'" error.
    *   **Fix**: Corrected a typo in `src/app/(app)/restock/RestockClientPage.tsx` from `import { useState }_from "react"` to `import { useState } from "react"`. This fix was applied twice as the error recurred.

7.  **Supabase Relationship Error (sale_item vs sale_items)**:
    *   Encountered "Could not find a relationship between 'sales' and 'sale_item'" error.
    *   Initially updated `src/actions/saleActions.ts` to use more explicit join syntax (`sale_item!sale_id`).
    *   After user provided a screenshot, it was identified that the table was named `sale_items` (plural).
    *   **Fix**: Updated `src/actions/saleActions.ts` to use `sale_items!sale_id(...)` in the join syntax to match the actual table name.

8.  **Supabase Column Name Error (retail_price vs retail_price_per_unit_snapshot)**:
    *   Encountered "column sale_items_1.retail_price does not exist".
    *   User clarified that the `sale_items` table uses `retail_price_per_unit_snapshot` and `wholesale_price_per_unit_snapshot`.
    *   **Fix**:
        *   Updated `src/types/index.ts`: Corrected the `SaleItem` interface.
        *   Updated `src/actions/saleActions.ts`: Modified `recordSale` (for inserts) and `getSales` (for selects) to use `retail_price_per_unit_snapshot` and `wholesale_price_per_unit_snapshot`.

## UI Styling & Accessibility

9.  **Visual Theme Customization (Dashboard & Global)**:
    *   User requested specific color theme changes (Deep Teal, Soft Gray, Warm Orange, etc.).
    *   **Implemented**:
        *   Updated `tailwind.config.ts`: Added a `positive` color for trends.
        *   Updated `src/app/globals.css`: Modified CSS variables for the new color palette for both light and dark modes.
        *   Updated `src/app/(app)/layout.tsx`: Styled the mobile header bar (Deep Teal background, White text) and sidebar header logo (White text).
        *   Updated `src/app/(app)/dashboard/DashboardClientPage.tsx`: Applied subtle borders to metric cards and used Deep Teal for sales figures.

10. **Accessibility Fix (DialogTitle for Sheet)**:
    *   Encountered Radix UI console error: "`DialogContent` requires a `DialogTitle`...".
    *   **Fix**: Modified `src/components/ui/sidebar.tsx`. Added a visually hidden `<SheetTitle className="sr-only">Main Navigation</SheetTitle>` inside the `SheetContent` for the mobile sidebar and imported `SheetTitle` from `../sheet`.

11. **Sales Screen UI Enhancements**:
    *   **Sales Page Header (`src/app/(app)/sales/page.tsx`):** Changed title to "Add New Sale" and added a styled "Back" button.
    *   **Record Sale Form (`src/app/(app)/sales/RecordSaleForm.tsx`):**
        *   Styled the "Complete Sale" button with a "Warm Orange" background and "White" text.
        *   Updated success toasts to use a new "positive" variant.
    *   **Product Form (`src/app/(app)/products/ProductForm.tsx`):** Updated success toasts to use the "positive" variant.
    *   **Input Component (`src/components/ui/input.tsx`):** Enhanced focus styling to include a "Deep Teal" border.
    *   **Toast Component (`src/components/ui/toast.tsx`):** Added a "positive" variant (Bright Green background, White text) for success messages.

12. **Sales Report Screen Styling (Initial)**:
    *   **Sales Page Header (`src/app/(app)/sales/page.tsx`):** Changed title to "Sales Reports" and updated description.
    *   **Sales History Table (`src/app/(app)/sales/SalesHistory.tsx`):**
        *   Styled table headers with a `bg-muted` background and `text-foreground` for text.
        *   Updated card title to "Recent Sales Data".
    *   Acknowledged that features like filtering, summary rows, visualizations, and export buttons are new functionalities to be added later.
