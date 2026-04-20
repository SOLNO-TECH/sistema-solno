import React from 'react';
import { cn } from '../../lib/utils';

export function Card({ className, children }) {
  return (
    <div className={cn("rounded-sm border border-border bg-card shadow-corporate transition-all hover:shadow-corporate-lg", className)}>
      {children}
    </div>
  );
}

export function CardHeader({ className, children }) {
  return <div className={cn("flex flex-col space-y-1.5 p-6 border-b border-border/40", className)}>{children}</div>;
}

export function CardTitle({ className, children }) {
  return <h3 className={cn("font-semibold leading-none tracking-tight text-foreground", className)}>{children}</h3>;
}

export function CardContent({ className, children }) {
  return <div className={cn("p-6", className)}>{children}</div>;
}
