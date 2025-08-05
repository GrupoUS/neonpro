"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RegulatoryDocumentsListSkeleton = RegulatoryDocumentsListSkeleton;
var react_1 = require("react");
var skeleton_1 = require("@/components/ui/skeleton");
function RegulatoryDocumentsListSkeleton() {
  return (
    <div className="space-y-4" data-testid="loading-skeleton">
      <div className="flex items-center justify-between">
        <skeleton_1.Skeleton className="h-8 w-48" />
        <skeleton_1.Skeleton className="h-10 w-32" />
      </div>

      <div className="grid gap-4">
        {Array.from({ length: 3 }).map(function (_, i) {
          return (
            <div key={i} className="border rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <skeleton_1.Skeleton className="h-6 w-64" />
                <skeleton_1.Skeleton className="h-8 w-20" />
              </div>

              <div className="flex items-center gap-4">
                <skeleton_1.Skeleton className="h-4 w-16" />
                <skeleton_1.Skeleton className="h-4 w-24" />
                <skeleton_1.Skeleton className="h-4 w-20" />
              </div>

              <div className="flex items-center justify-between">
                <skeleton_1.Skeleton className="h-4 w-32" />
                <div className="flex gap-2">
                  <skeleton_1.Skeleton className="h-8 w-8" />
                  <skeleton_1.Skeleton className="h-8 w-8" />
                  <skeleton_1.Skeleton className="h-8 w-8" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
