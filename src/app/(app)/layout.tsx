
"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  PackageSearch,
  ShoppingCart,
  BrainCircuit,
  Languages, 
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
import useTranslation from "@/hooks/useTranslation";
import type { Locale } from "@/hooks/useTranslation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";


export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { t, currentLocale, changeLanguage, ready } = useTranslation();
  const currentPathname = usePathname();

  const navItems = ready ? [
    { href: "/dashboard", icon: LayoutDashboard, label: t("dashboard") },
    { href: "/products", icon: PackageSearch, label: t("products") },
    { href: "/sales", icon: ShoppingCart, label: t("recordSale") }, 
    { href: "/restock", icon: BrainCircuit, label: t("restockAI") },
  ] : [];

  const isActive = (href: string) => {
    const baseHref = href.startsWith('/') ? href : `/${href}`;

    let normalizedPathname = currentPathname;
    // Adjust for locale prefix if present
    if (currentLocale !== 'ar' && currentPathname.startsWith(`/${currentLocale}`)) {
      normalizedPathname = currentPathname.substring(currentLocale.length + 1) || "/";
    }
    
    if (baseHref === '/dashboard') {
      return normalizedPathname === '/dashboard' || normalizedPathname === '/';
    }
    return normalizedPathname.startsWith(baseHref);
  };
  
  if (!ready) {
    return (
      <div className="flex h-screen">
        <div className="w-64 bg-muted p-4 space-y-2">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
        </div>
        <div className="flex-1 p-6">
          <Skeleton className="h-12 w-1/3 mb-4" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider defaultOpen>
      <Sidebar collapsible="icon" variant="sidebar" side="left">
        <SidebarHeader className="h-16 flex items-center justify-between px-4">
          <Link href={"/dashboard"} className="flex items-center gap-2 text-sidebar-foreground hover:text-sidebar-primary transition-colors">
            <Logo className="h-7 w-7 text-sidebar-foreground" />
            <span className="font-semibold text-lg group-data-[collapsible=icon]:hidden">{t('storeKeep')}</span>
          </Link>
          <div className="md:hidden">
             <SidebarTrigger />
          </div>
        </SidebarHeader>
        <SidebarContent>
          <div className="p-2 group-data-[collapsible=icon]:hidden">
            <Label htmlFor="language-select" className="sr-only">{t('language')}</Label>
            <Select
              value={currentLocale}
              onValueChange={(value) => changeLanguage(value as Locale)}
            >
              <SelectTrigger id="language-select" className="w-full bg-sidebar-accent text-sidebar-accent-foreground border-sidebar-border focus:ring-sidebar-ring">
                <div className="flex items-center gap-2">
                  <Languages size={16} />
                  <SelectValue placeholder={t('language')} />
                </div>
              </SelectTrigger>
              <SelectContent className="bg-sidebar border-sidebar-border text-sidebar-foreground focus:ring-sidebar-ring">
                <SelectItem value="ar" className="focus:bg-sidebar-primary focus:text-sidebar-primary-foreground">{t('arabic')}</SelectItem>
                <SelectItem value="en" className="focus:bg-sidebar-primary focus:text-sidebar-primary-foreground">{t('english')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <SidebarMenu>
            {navItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <Link href={item.href} legacyBehavior passHref>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.href)}
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
          <p className="text-xs text-sidebar-foreground/70">{t('copyright')}</p>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset> {/* This component renders a <main> tag and is flex-col */}
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-primary px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6 py-4 md:hidden">
          <SidebarTrigger 
            size="icon" 
            variant="ghost"
            className="sm:hidden text-primary-foreground hover:bg-primary/80 hover:text-primary-foreground"
          />
        </header>
        {/* This div now correctly contains the page content as a flex child of SidebarInset's main tag */}
        <div className="flex-1 p-6 bg-background"> {/* Removed min-h, flex-1 in flex-col parent should handle height */}
            {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

const Label = React.forwardRef<
  React.ElementRef<"label">,
  React.ComponentPropsWithoutRef<"label">
>(({ className, ...props }, ref) => (
  <label ref={ref} className={cn(className)} {...props} />
));
Label.displayName = "Label";
