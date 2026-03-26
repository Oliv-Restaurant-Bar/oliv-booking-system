import { Suspense } from 'react';
import { CustomMenuWizard } from '@/components/user/CustomMenuWizardVariant1';
import { WizardHeader } from '@/components/user/WizardHeader';
import { SkeletonMenuSelection } from '@/components/ui/skeleton-loaders';

function WizardPageWrapper() {
  return <CustomMenuWizard />;
}

function WizardLoadingFallback() {
  return (
    <div className="min-h-screen bg-background">
      <WizardHeader />
      <SkeletonMenuSelection />
    </div>
  );
}

export default function WizardPage() {
  return (
    <Suspense fallback={<WizardLoadingFallback />}>
      <WizardPageWrapper />
    </Suspense>
  );
}
