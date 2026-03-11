'use client';

import { useCommonTranslation } from '@/lib/i18n/client';

export function WizardLoading() {
  const t = useCommonTranslation();

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-muted-foreground">{t('loading')}</p>
      </div>
    </div>
  );
}
