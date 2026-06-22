import { type HTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/shared/lib/utils';

type CardVariant = 'default' | 'elevated' | 'bordered';
type CardPadding = 'none' | 'sm' | 'md' | 'lg';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  padding?: CardPadding;
  hoverable?: boolean;
}

const variantStyles: Record<CardVariant, string> = {
  default: 'bg-slate-900 border border-slate-800',
  elevated: 'bg-slate-800 border border-slate-700 shadow-lg shadow-black/20',
  bordered: 'bg-transparent border border-slate-700',
};

const paddingStyles: Record<CardPadding, string> = {
  none: '',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
};

export function Card({
  variant = 'default',
  padding = 'md',
  hoverable = false,
  className,
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        'rounded-xl',
        variantStyles[variant],
        paddingStyles[padding],
        hoverable && 'hover:border-slate-600 hover:bg-slate-800/50 transition-colors cursor-pointer',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

interface CardSectionProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

function CardHeader({ className, children, ...props }: CardSectionProps) {
  return (
    <div className={cn('pb-3 border-b border-slate-800', className)} {...props}>
      {children}
    </div>
  );
}

function CardContent({ className, children, ...props }: CardSectionProps) {
  return (
    <div className={cn('py-3', className)} {...props}>
      {children}
    </div>
  );
}

function CardFooter({ className, children, ...props }: CardSectionProps) {
  return (
    <div className={cn('pt-3 border-t border-slate-800', className)} {...props}>
      {children}
    </div>
  );
}

Card.Header = CardHeader;
Card.Content = CardContent;
Card.Footer = CardFooter;
