import { Progress } from '@/components/ui/progress';
import { useI18n } from '@/i18n/i18n';
import { Button } from '@neonpro/ui';

export type TaskStage = 'queued' | 'running' | 'completed' | 'failed';

export type TaskProgressProps = {
  stage: TaskStage;
  percent?: number;
  onCancel?: () => void;
};

export function TaskProgress({
  stage,
  percent = 0,
  onCancel,
}: TaskProgressProps) {
  const { t } = useI18n();
  const stageLabel = t(`chat.stage.${stage}`);
  return (
    <div
      role='status'
      aria-live='polite'
      aria-label={t('a11y.status')}
      className='flex items-center gap-2'
    >
      <span className='text-xs capitalize'>{stageLabel}</span>
      <Progress value={percent} className='w-40' />
      <span className='text-xs'>{Math.round(percent)}%</span>
      {stage !== 'completed' && (
        <Button
          type='button'
          variant='outline'
          size='sm'
          onClick={() => onCancel?.()}
        >
          {t('chat.cancel')}
        </Button>
      )}
    </div>
  );
}

export default TaskProgress;
