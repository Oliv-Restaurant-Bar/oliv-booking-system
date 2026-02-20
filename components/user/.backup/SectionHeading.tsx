interface SectionHeadingProps {
  badge: string;
  title: string;
  description: string;
  align?: 'left' | 'center';
  className?: string;
}

export function SectionHeading({ 
  badge, 
  title, 
  description, 
  align = 'center',
  className = ''
}: SectionHeadingProps) {
  const alignmentClasses = align === 'center' ? 'text-center mx-auto' : '';
  
  return (
    <div className={`max-w-2xl ${alignmentClasses} ${className}`}>
      <div className={`inline-flex items-center gap-2 px-4 py-2 bg-primary/20 backdrop-blur-md border border-primary/30 rounded-full mb-4`}>
        <div className="w-2 h-2 rounded-full bg-primary" />
        <span className="text-primary" style={{ fontSize: 'var(--text-small)', fontWeight: 'var(--font-weight-semibold)' }}>
          {badge}
        </span>
      </div>
      <h2 className="text-foreground mb-3" style={{ fontSize: 'var(--text-h1)', fontWeight: 'var(--font-weight-bold)' }}>
        {title}
      </h2>
      <p className="text-muted-foreground" style={{ fontSize: 'var(--text-h4)' }}>
        {description}
      </p>
    </div>
  );
}
