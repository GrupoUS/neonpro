import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Button } from '@neonpro/ui';

export type TaskStage = 'queued' | 'running' | 'completed' | 'failed';

export type TaskProgressProps = {
  stage: TaskStage;
  percent?: number;
  onCancel?: () => void;
};

export function TaskProgress({ stage, percent = 0, onCancel }: TaskProgressProps) {
  return (
    <div role="status" aria-live="polite" className="flex items-center gap-2">
      <span className="text-xs capitalize">{stage}</span>
      <Progress value={percent} className="w-40" />
      <span className="text-xs">{Math.round(percent)}%</span>
      {stage !== 'completed' && (
        <Button type="button" variant="outline" size="sm" onClick={() => onCancel?.()}>
          Cancel
        </Button>
      )}
    </div>
  );
}

export default TaskProgress;
