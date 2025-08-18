// Placeholder import for @neonpro/utils
const cn = (...classes: (string | undefined)[]) => classes.filter(Boolean).join(" ");

type ProgressProps = {
  value?: number;
  max?: number;
  className?: string;
};

export type { ProgressProps };

export function Progress({ value = 0, max = 100, className, ...props }: ProgressProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  return (
    <div
      className={cn("relative h-4 w-full overflow-hidden rounded-full bg-secondary", className)}
      {...props}
    >
      <div
        className="h-full w-full flex-1 bg-primary transition-all"
        style={{ transform: `translateX(-${100 - percentage}%)` }}
      />
    </div>
  );
}
