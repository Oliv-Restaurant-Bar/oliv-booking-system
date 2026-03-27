'use client';

import { LayoutGrid, Calendar } from 'lucide-react';
import * as ToggleGroup from '@radix-ui/react-toggle-group';
import { cn } from '@/lib/utils';

export type ViewMode = 'grid' | 'calendar';

interface ViewSwitcherProps {
  currentView: ViewMode;
  onViewChange: (view: ViewMode) => void;
}

export function ViewSwitcher({ currentView, onViewChange }: ViewSwitcherProps) {
  return (
    <ToggleGroup.Root
      type="single"
      value={currentView}
      onValueChange={(value) => {
        if (value) onViewChange(value as ViewMode);
      }}
      className="inline-flex items-center gap-0 bg-muted p-1 rounded-lg"
    >
      <ToggleGroup.Item
        value="grid"
        aria-label="Grid view"
        title="Grid View"
        className={cn(
          "inline-flex items-center justify-center gap-2 px-3 py-2 rounded-md transition-all",
          "hover:bg-background hover:shadow-sm",
          "focus:outline-none focus:ring-2 focus:ring-primary/20",
          "data-[state=on]:bg-background data-[state=on]:shadow-sm data-[state=on]:text-foreground",
          "data-[state=off]:text-muted-foreground"
        )}
      >
        <LayoutGrid className="w-4 h-4" />
        <span className="text-sm font-medium hidden sm:inline">Grid</span>
      </ToggleGroup.Item>

      <ToggleGroup.Item
        value="calendar"
        aria-label="Calendar view"
        title="Calendar View"
        className={cn(
          "inline-flex items-center justify-center gap-2 px-3 py-2 rounded-md transition-all",
          "hover:bg-background hover:shadow-sm",
          "focus:outline-none focus:ring-2 focus:ring-primary/20",
          "data-[state=on]:bg-background data-[state=on]:shadow-sm data-[state=on]:text-foreground",
          "data-[state=off]:text-muted-foreground"
        )}
      >
        <Calendar className="w-4 h-4" />
        <span className="text-sm font-medium hidden sm:inline">Calendar</span>
      </ToggleGroup.Item>
    </ToggleGroup.Root>
  );
}
