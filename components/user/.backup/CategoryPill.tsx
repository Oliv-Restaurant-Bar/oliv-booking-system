interface CategoryPillProps {
  label: string;
  isSelected?: boolean;
  color?: string;
  onClick?: () => void;
  variant?: 'button' | 'badge';
}

export function CategoryPill({ label, isSelected = false, color, onClick, variant = 'button' }: CategoryPillProps) {
  // Badge variant - small, non-interactive pill
  if (variant === 'badge') {
    return (
      <span 
        className="px-2 py-0.5 rounded text-xs uppercase inline-block"
        style={{ 
          backgroundColor: color ? `${color}20` : 'var(--color-muted)',
          color: color || 'var(--color-muted-foreground)',
          fontSize: '10px',
          fontWeight: 'var(--font-weight-semibold)',
          letterSpacing: '0.5px'
        }}
      >
        {label}
      </span>
    );
  }

  // Button variant - interactive filter button
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-lg transition-all cursor-pointer ${
        isSelected
          ? 'text-white shadow-sm'
          : 'bg-background text-muted-foreground hover:bg-accent'
      }`}
      style={{ 
        fontSize: 'var(--text-small)', 
        fontWeight: 'var(--font-weight-medium)',
        backgroundColor: isSelected && color ? color : undefined
      }}
    >
      {label}
    </button>
  );
}