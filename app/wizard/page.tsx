import { Suspense } from 'react';
import { CustomMenuWizard } from '@/components/user/CustomMenuWizardVariant1';
import { Skeleton } from '@/components/ui/skeleton';

function WizardPageWrapper() {
  return <CustomMenuWizard />;
}

function WizardLoadingSkeleton() {
  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto space-y-6 pt-20">
        {/* Header Skeleton */}
        <div className="text-center space-y-3">
          <Skeleton className="h-8 w-64 mx-auto" />
          <Skeleton className="h-4 w-96 mx-auto" />
        </div>

        {/* Step Indicator Skeleton */}
        <div className="flex items-center justify-center gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-2">
              <Skeleton className="w-10 h-10 rounded-full" />
              {i < 3 && <Skeleton className="w-16 h-1" />}
            </div>
          ))}
        </div>

        {/* Form Skeleton */}
        <div className="bg-card border border-border rounded-xl p-6 space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-10 w-full" />
            </div>
          ))}
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
    </div>
  );
}

export default function WizardPage() {
  return (
    <Suspense fallback={<WizardLoadingSkeleton />}>
      <WizardPageWrapper />
    </Suspense>
  );
}
