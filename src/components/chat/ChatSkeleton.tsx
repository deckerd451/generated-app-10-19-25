import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Bot, User } from 'lucide-react';
export const ChatSkeleton: React.FC = () => {
  return (
    <div className="flex flex-col h-full p-4 sm:p-6 lg:p-8 space-y-6 animate-pulse">
      {/* AI Message Skeleton */}
      <div className="flex items-start gap-3 justify-start">
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
          <Bot className="w-5 h-5 text-primary/50" />
        </div>
        <div className="max-w-md lg:max-w-xl space-y-2">
          <Skeleton className="h-4 w-48 rounded-md" />
          <Skeleton className="h-4 w-64 rounded-md" />
        </div>
      </div>
      {/* User Message Skeleton */}
      <div className="flex items-start gap-3 justify-end">
        <div className="max-w-md lg:max-w-xl space-y-2 items-end flex flex-col">
          <Skeleton className="h-4 w-40 rounded-md" />
        </div>
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center">
          <User className="w-5 h-5 text-accent/50" />
        </div>
      </div>
      {/* AI Message Skeleton */}
      <div className="flex items-start gap-3 justify-start">
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
          <Bot className="w-5 h-5 text-primary/50" />
        </div>
        <div className="max-w-md lg:max-w-xl space-y-2">
          <Skeleton className="h-4 w-56 rounded-md" />
          <Skeleton className="h-4 w-32 rounded-md" />
          <Skeleton className="h-4 w-48 rounded-md" />
        </div>
      </div>
    </div>
  );
};