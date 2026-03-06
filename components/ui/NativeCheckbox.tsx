import React from 'react';
import { Check } from 'lucide-react';

interface NativeCheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
    containerClassName?: string;
}

export function NativeCheckbox({ className, containerClassName, ...props }: NativeCheckboxProps) {
    return (
        <div className={`relative flex items-center justify-center flex-shrink-0 ${containerClassName || ''}`}>
            <input
                type="checkbox"
                className={`appearance-none w-5 h-5 border-2 border-border rounded transition-all cursor-pointer checked:bg-primary checked:border-primary focus:ring-2 focus:ring-primary/20 ${className || ''}`}
                {...props}
            />
            {props.checked && (
                <Check className="w-3.5 h-3.5 text-primary-foreground absolute pointer-events-none" style={{ strokeWidth: 3 }} />
            )}
        </div>
    );
}
