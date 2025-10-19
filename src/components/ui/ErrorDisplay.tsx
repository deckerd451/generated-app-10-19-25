import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
interface ErrorDisplayProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  className?: string;
  variant?: 'default' | 'inline';
}
export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
  title = "Something went wrong",
  message,
  onRetry,
  className,
  variant = 'default',
}) => {
  if (variant === 'inline') {
    return (
      <div className={cn("text-center p-4 text-destructive", className)}>
        <p className="text-sm font-semibold">{title}</p>
        <p className="text-xs mt-1">{message}</p>
        {onRetry && (
          <Button variant="link" size="sm" onClick={onRetry} className="mt-2 h-auto p-0 text-xs">
            Try Again
          </Button>
        )}
      </div>
    );
  }
  return (
    <div className={cn("flex flex-col items-center justify-center h-full w-full text-center p-8", className)}>
      <div className="bg-destructive/10 p-4 rounded-full mb-4">
        <AlertTriangle className="w-8 h-8 text-destructive" />
      </div>
      <h2 className="text-xl font-semibold text-destructive">{title}</h2>
      <p className="mt-2 text-muted-foreground max-w-sm">{message}</p>
      {onRetry && (
        <Button onClick={onRetry} variant="destructive" className="mt-6">
          Try Again
        </Button>
      )}
    </div>
  );
};