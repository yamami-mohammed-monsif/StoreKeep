
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  PackageSearch,
  ShoppingCart,
  BrainCircuit,
  PanelLeft,
} from "lucide-react";

import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarTrigger,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
} from "@/components/ui/sidebar";
import { Logo } from "@/components/icons/Logo";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/products", icon: PackageSearch, label: "Products" },
  { href: "/sales", icon: ShoppingCart, label: "Record Sale" },
  { href: "/restock", icon: BrainCircuit, label: "Restock AI" },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <SidebarProvider defaultOpen>
      <Sidebar collapsible="icon" variant="sidebar" side="left">
        <SidebarHeader className="h-16 flex items-center justify-between px-4">
          <Link href="/dashboard" className="flex items-center gap-2 text-sidebar-foreground hover:text-sidebar-primary transition-colors">
            <Logo className="h-7 w-7 text-sidebar-foreground" /> {/* Changed text-sidebar-primary to text-sidebar-foreground */}
            <span className="font-semibold text-lg group-data-[collapsible=icon]:hidden">StoreKeep</span>
          </Link>
          <div className="md:hidden">
             <SidebarTrigger />
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {navItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <Link href={item.href} legacyBehavior passHref>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href))}
                    tooltip={{children: item.label, className: "bg-primary text-primary-foreground"}}
                  >
                    <a>
                      <item.icon />
                      <span>{item.label}</span>
                    </a>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter className="p-4 group-data-[collapsible=icon]:hidden">
          <p className="text-xs text-sidebar-foreground/70">&copy; 2024 StoreKeep Inc.</p>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-primary px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6 py-4 md:hidden"> {/* Changed bg-background to bg-primary */}
          <SidebarTrigger 
            size="icon" 
            variant="ghost" /* Changed variant to ghost */
            className="sm:hidden text-primary-foreground hover:bg-primary/80 hover:text-primary-foreground" /* Added text and hover styles */
          />
        </header>
        <main className="flex-1 p-6 bg-background min-h-[calc(100vh-theme(spacing.16))]">
            {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
