'use client';

interface StepPillsProps {
  stepTitles: readonly string[];
  currentStep: number;
  stepErrorCounts: number[];
  onStepSelect: (index: number) => void;
}

export function StepPills({
  stepTitles,
  currentStep,
  stepErrorCounts,
  onStepSelect,
}: StepPillsProps) {
  return (
    <div className="mt-5 flex flex-wrap gap-2">
      {stepTitles.map((title, index) => {
        const errorCount = stepErrorCounts[index] ?? 0;

        return (
          <button
            key={title}
            onClick={() => onStepSelect(index)}
            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
              currentStep === index
                ? 'border-primary/45 bg-primary/16 text-primary'
                : errorCount > 0
                  ? 'border-destructive/45 bg-destructive/10 text-destructive hover:border-destructive/60'
                  : 'border-border bg-card/60 text-muted-foreground hover:border-ring/35 hover:text-foreground'
            }`}
          >
            <span>
              {index + 1}. {title}
            </span>
            {errorCount > 0 ? (
              <span className="rounded-full border border-destructive/45 bg-destructive/16 px-1.5 py-0.5 text-[10px] leading-none text-destructive">
                {errorCount}
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
