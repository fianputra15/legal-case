"use client";

import { cn } from "@/shared/lib/utils";

interface LoadingShimmerProps {
  className?: string;
  variant?: 'default' | 'text' | 'card' | 'avatar' | 'button' | 'table-row';
  lines?: number;
  width?: 'full' | 'half' | 'third' | 'quarter' | string;
  height?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | string;
}

export function LoadingShimmer({ 
  className,
  variant = 'default',
  lines = 1,
  width = 'full',
  height = 'md'
}: LoadingShimmerProps) {
  const getWidthClass = () => {
    switch (width) {
      case 'full': return 'w-full';
      case 'half': return 'w-1/2';
      case 'third': return 'w-1/3';
      case 'quarter': return 'w-1/4';
      default: return width.startsWith('w-') ? width : `w-[${width}]`;
    }
  };

  const getHeightClass = () => {
    switch (height) {
      case 'xs': return 'h-3';
      case 'sm': return 'h-4';
      case 'md': return 'h-5';
      case 'lg': return 'h-6';
      case 'xl': return 'h-8';
      default: return height.startsWith('h-') ? height : `h-[${height}]`;
    }
  };

  const baseClasses = "bg-gray-200 rounded animate-pulse";
  const widthClass = getWidthClass();
  const heightClass = getHeightClass();

  if (variant === 'text' && lines > 1) {
    return (
      <div className={cn("space-y-2", className)}>
        {Array.from({ length: lines }).map((_, index) => (
          <div
            key={index}
            className={cn(
              baseClasses,
              heightClass,
              index === lines - 1 ? 'w-3/4' : widthClass // Last line is shorter
            )}
          />
        ))}
      </div>
    );
  }

  if (variant === 'card') {
    return (
      <div className={cn("border border-gray-200 rounded-lg p-6 space-y-4", className)}>
        <div className={cn(baseClasses, "h-6 w-3/4")} />
        <div className="space-y-2">
          <div className={cn(baseClasses, "h-4 w-full")} />
          <div className={cn(baseClasses, "h-4 w-5/6")} />
          <div className={cn(baseClasses, "h-4 w-2/3")} />
        </div>
        <div className="flex items-center justify-between">
          <div className={cn(baseClasses, "h-4 w-20")} />
          <div className={cn(baseClasses, "h-8 w-24 rounded-md")} />
        </div>
      </div>
    );
  }

  if (variant === 'avatar') {
    return (
      <div className={cn("flex items-center space-x-4", className)}>
        <div className={cn(baseClasses, "w-12 h-12 rounded-full")} />
        <div className="space-y-2 flex-1">
          <div className={cn(baseClasses, "h-4 w-1/3")} />
          <div className={cn(baseClasses, "h-3 w-1/4")} />
        </div>
      </div>
    );
  }

  if (variant === 'button') {
    return (
      <div className={cn(baseClasses, "h-10 w-24 rounded-md", className)} />
    );
  }

  if (variant === 'table-row') {
    return (
      <div className={cn("flex items-center space-x-4 py-3", className)}>
        <div className={cn(baseClasses, "h-4 w-1/4")} />
        <div className={cn(baseClasses, "h-4 w-1/4")} />
        <div className={cn(baseClasses, "h-4 w-1/4")} />
        <div className={cn(baseClasses, "h-4 w-1/4")} />
      </div>
    );
  }

  // Default variant
  return (
    <div className={cn(baseClasses, widthClass, heightClass, className)} />
  );
}

// Preset shimmer patterns for common use cases
export const LoadingShimmers = {
  CaseCard: () => (
    <LoadingShimmer variant="card" className="mb-6" />
  ),
  
  CaseHeader: () => (
    <div className="space-y-4">
      <LoadingShimmer height="h-8" width="half" />
      <LoadingShimmer variant="text" lines={2} height="sm" />
      <div className="flex items-center space-x-2">
        <LoadingShimmer width="w-20" height="h-6" className="rounded-full" />
        <LoadingShimmer width="w-24" height="h-4" />
      </div>
    </div>
  ),
  
  DocumentList: () => (
    <div className="space-y-3">
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className="flex items-center space-x-4 p-3 border border-gray-200 rounded-lg">
          <LoadingShimmer width="w-8" height="h-8" className="rounded" />
          <div className="flex-1">
            <LoadingShimmer width="w-1/3" height="h-4" className="mb-1" />
            <LoadingShimmer width="w-1/4" height="h-3" />
          </div>
          <LoadingShimmer variant="button" />
        </div>
      ))}
    </div>
  ),
  
  PendingRequests: () => (
    <div className="space-y-4">
      {Array.from({ length: 2 }).map((_, index) => (
        <div key={index} className="border border-gray-200 rounded-lg p-4">
          <LoadingShimmer variant="avatar" className="mb-4" />
          <LoadingShimmer variant="text" lines={2} height="sm" className="mb-4" />
          <div className="flex items-center space-x-2">
            <LoadingShimmer variant="button" />
            <LoadingShimmer variant="button" />
          </div>
        </div>
      ))}
    </div>
  ),
  
  Table: ({ rows = 5 }: { rows?: number }) => (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <div className="bg-gray-50 px-4 py-3">
        <div className="flex items-center space-x-4">
          <LoadingShimmer width="w-1/4" height="h-4" />
          <LoadingShimmer width="w-1/4" height="h-4" />
        </div>
      </div>
      <div className="divide-y divide-gray-200">
        {Array.from({ length: rows }).map((_, index) => (
          <LoadingShimmer key={index} variant="table-row" className="px-4" />
        ))}
      </div>
    </div>
  ),
  
  Timeline: ({ events = 3 }: { events?: number }) => (
    <div className="space-y-6">
      {Array.from({ length: events }).map((_, index) => (
        <div key={index} className={`${index < events - 1 ? 'border-s border-gray-200' : ''} pb-6`}>
          <div className="flex items-center">
            <div className="-ms-3.5 me-3 h-7 w-7 rounded-full bg-gray-200 animate-pulse" />
            <LoadingShimmer width="w-20" height="h-4" />
          </div>
          <div className="ml-5 mt-2 border border-gray-200 rounded-md p-2">
            <LoadingShimmer variant="text" lines={2} height="sm" className="mb-2" />
            <div className="flex items-center space-x-2">
              <LoadingShimmer width="w-24" height="h-6" className="rounded-md" />
              <LoadingShimmer width="w-20" height="h-6" className="rounded-md" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
};