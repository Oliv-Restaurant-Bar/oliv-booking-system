import { Suspense } from 'react';
import { CustomMenuWizard } from '@/components/user/CustomMenuWizardVariant1';

function WizardPageWrapper() {
  return <CustomMenuWizard />;
}

export default function WizardPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <WizardPageWrapper />
    </Suspense>
  );
}
