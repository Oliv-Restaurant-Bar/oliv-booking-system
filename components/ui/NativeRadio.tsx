import React from 'react';

export function NativeRadio({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
    return (
        <input
            type="radio"
            className={`w-5 h-5 appearance-none border-2 border-border rounded-full checked:border-primary checked:border-[6px] transition-all cursor-pointer flex-shrink-0 m-0 ${className || ''}`}
            style={{ accentColor: 'var(--color-primary)', ...props.style }}
            {...props}
        />
    );
}
