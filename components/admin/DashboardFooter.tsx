'use client';

export function DashboardFooter() {
  return (
    <footer className="w-full py-4 mt-auto border-t border-border bg-background/80 backdrop-blur-sm sticky bottom-0 z-10 transition-all duration-300">
      <div className="flex items-center justify-center px-4 md:px-8">
        <p className="text-muted-foreground text-center" style={{ fontSize: 'var(--text-small)' }}>
          © 2026 Oliv Restaurant & Bar
        </p>
      </div>
    </footer>
  );
}
