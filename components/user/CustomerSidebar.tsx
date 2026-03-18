import { Check } from 'lucide-react';

interface Step {
  number: number;
  title: string;
  subtitle: string;
  icon: any;
}

interface CustomerSidebarProps {
  steps: Step[];
  currentStep: number;
}

export function CustomerSidebar({ steps, currentStep }: CustomerSidebarProps) {
    return (<div className="hidden lg:block lg:w-[25%] bg-primary text-primary-foreground p-6 lg:p-8 lg:fixed lg:left-0 lg:top-20 lg:h-[calc(100vh-5rem)] lg:overflow-y-auto">
        <div className="max-w-md mx-auto lg:mx-0">
            {/* Title */}
            <div className="mb-8">
                <h2 className="text-primary-foreground mb-2" style={{ fontSize: 'var(--text-h2)', fontWeight: 'var(--font-weight-semibold)' }}>
                    Menu configurator for your event
                </h2>
                <p className="text-primary-foreground opacity-90" style={{ fontSize: 'var(--text-base)' }}>
                    Create your own personalized menu. We look forward to your inquiry and will get back to you promptly.
                </p>
            </div>

            {/* Vertical Steps */}
            <div className="space-y-6">
                {steps.map((step, index) => {
                    const Icon = step.icon;
                    const isActive = currentStep === step.number;
                    const isCompleted = currentStep > step.number;

                    return (
                        <div key={step.number} className="relative flex items-start gap-3">
                            {/* Connecting Line */}
                            {index < steps.length - 1 && (
                                <div
                                    className="absolute left-5 top-10 -bottom-6 w-0.5 -translate-x-1/2 transition-all duration-500"
                                    style={{
                                        backgroundColor: isCompleted
                                            ? 'var(--color-secondary)'
                                            : 'rgba(255, 255, 255, 0.2)'
                                    }}
                                />
                            )}

                            {/* Step Circle */}
                            <div
                                className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center transition-all duration-300 relative z-10 ${isCompleted
                                    ? 'bg-secondary text-secondary-foreground'
                                    : isActive
                                        ? 'bg-secondary text-secondary-foreground ring-4 ring-secondary/20'
                                        : 'bg-transparent text-primary-foreground border-2 border-primary-foreground/30'
                                    }`}
                            >
                                {isCompleted ? (
                                    <Check className="w-5 h-5" />
                                ) : (
                                    <Icon className="w-4 h-4" />
                                )}
                            </div>

                            {/* Step Content */}
                            <div className="flex-1 pt-1.5">
                                <p
                                    className={`mb-1 text-primary-foreground ${isActive || isCompleted ? 'opacity-100' : 'opacity-60'}`}
                                    style={{ fontSize: 'var(--text-h4)', fontWeight: 'var(--font-weight-semibold)' }}
                                >
                                    {step.title}
                                </p>
                                <p
                                    className="text-primary-foreground opacity-80"
                                    style={{ fontSize: 'var(--text-small)' }}
                                >
                                    {step.subtitle}
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Progress Summary */}
            <div className="mt-6 p-3 bg-primary-foreground/10 rounded-lg" style={{ borderRadius: 'var(--radius-card)' }}>
                <div className="flex items-center justify-between mb-2">
                    <p className="text-primary-foreground opacity-80" style={{ fontSize: 'var(--text-small)' }}>
                        Overall Progress
                    </p>
                    <span className="text-primary-foreground opacity-90" style={{ fontSize: 'var(--text-small)', fontWeight: 'var(--font-weight-semibold)' }}>
                        {currentStep}/3 · {Math.round(((currentStep - 1) / 2) * 100)}%
                    </span>
                </div>
                <div className="h-2 bg-primary-foreground/20 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-primary-foreground transition-all duration-500"
                        style={{ width: `${((currentStep - 1) / 2) * 100}%` }}
                    />
                </div>
            </div>
        </div>
    </div>)
}