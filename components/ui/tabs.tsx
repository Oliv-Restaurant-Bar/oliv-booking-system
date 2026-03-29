"use client";

import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { Info, Menu, MessageSquare, ClipboardList } from "lucide-react";

import { cn } from "./utils";

/* Root */
function Tabs({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      className={cn("flex flex-col gap-4", className)}
      {...props}
    />
  );
}

/* List */
function TabsList({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List>) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      className={cn(
        "w-full flex gap-2 overflow-x-auto no-scrollbar bg-muted p-1 rounded-xl",
        className
      )}
      {...props}
    />
  );
}

/* Trigger */
function TabsTrigger({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(
        `
        shrink-0 inline-flex items-center justify-center gap-2
        rounded-lg px-4 py-2.5 text-sm sm:text-base font-medium
        whitespace-nowrap
        text-muted-foreground
        transition-all duration-200

        data-[state=active]:bg-background
        data-[state=active]:text-foreground
        data-[state=active]:shadow-sm

        hover:bg-background/60

        focus-visible:outline-none
        focus-visible:ring-2
        focus-visible:ring-ring

        disabled:pointer-events-none disabled:opacity-50
        `,
        className
      )}
      {...props}
    />
  );
}

/* Content */
function TabsContent({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn("flex-1 outline-none", className)}
      {...props}
    />
  );
}

export { Tabs, TabsList, TabsTrigger, TabsContent };