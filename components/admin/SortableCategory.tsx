'use client';

import { useSortable } from '@dnd-kit/sortable';

interface SortableCategoryProps {
  id: string;
  children: (dragProps: { attributes: any; listeners: any; isDragging: boolean }) => React.ReactNode;
}

export function SortableCategory({ id, children }: SortableCategoryProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style}>
      {children({
        attributes,
        listeners,
        isDragging,
      })}
    </div>
  );
}
