import { Suspense } from 'react';
import { CustomMenuWizard } from '@/components/user/CustomMenuWizardVariant1';
import { WizardLoading } from '@/components/user/WizardLoading';

function WizardPageWrapper() {
  return <CustomMenuWizard />;
}

export default function WizardPage() {
  return (
    <Suspense fallback={<WizardLoading />}>
      <WizardPageWrapper />
    </Suspense>
  );
}
