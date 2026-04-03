import { Suspense } from 'react';
import { CustomMenuWizard } from '@/components/user/CustomMenuWizardVariant1';
import { WizardHeader } from '@/components/user/WizardHeader';
import { SkeletonMenuSelection } from '@/components/ui/skeleton-loaders';
import { getCompleteMenuData } from '@/lib/actions/menu';
import { getServerLocale } from '@/lib/i18n/server';

async function WizardPageWrapper() {
  const menuData = await getCompleteMenuData();
  const locale = await getServerLocale();
  return <CustomMenuWizard initialMenuData={menuData} initialLocale={locale} />;
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
