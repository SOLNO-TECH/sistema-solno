import React from 'react';
import { cn } from '../../lib/utils';

export function Button({ className, variant = 'primary', ...props }) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-sm text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-10 px-6 py-2 tracking-wide",
        variant === 'primary' && "bg-primary text-primaryForeground hover:bg-black/80 shadow-sm",
        variant === 'outline' && "border border-border bg-transparent hover:bg-muted text-foreground",
        variant === 'ghost' && "bg-transparent hover:bg-muted text-foreground",
        variant === 'danger' && "bg-danger text-white hover:bg-danger/80",
        className
      )}
      {...props}
    />
  );
}
