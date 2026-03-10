import Link from 'next/link';
import { Home, Search } from 'lucide-react';
import { Button } from '@/components/user/Button';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-2xl w-full text-center space-y-8">
        {/* 404 Number */}
        <div className="relative">
          <div className="text-[180px] font-bold leading-none text-secondary/10 select-none">
            404
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <Search className="w-24 h-24 text-secondary/30 mx-auto mb-4" />
            </div>
          </div>
        </div>

        {/* Error Message */}
        <div className="space-y-4">
          <h1 className="text-4xl font-bold text-foreground" style={{ fontSize: 'var(--text-h1)', fontWeight: 'var(--font-weight-bold)' }}>
            Page Not Found
          </h1>
          <p className="text-lg text-muted-foreground" style={{ fontSize: 'var(--text-base)' }}>
            Oops! The page you're looking for doesn't exist or has been moved.
          </p>
          <p className="text-muted-foreground" style={{ fontSize: 'var(--text-small)' }}>
            Don't worry, let's get you back on track.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center">
          <Button to="/" size="lg" icon={Home}>
            Go Home
          </Button>
        </div>

        {/* Help Text */}
        <div className="pt-8 border-t border-border">
          <p className="text-sm text-muted-foreground">
            If you believe this is an error, please contact your system administrator
          </p>
        </div>
      </div>
    </div>
  );
}
