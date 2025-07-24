import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

export const LoadingSkeleton = () => {
  return (
    <Card className="w-full">
      <div className="p-6">
        <div className="space-y-4">
          <Skeleton className="h-8 w-48" />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-24" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
          
          <div className="border-t border-gray-700 pt-4">
            <Skeleton className="h-6 w-64" />
            <div className="mt-4 space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};