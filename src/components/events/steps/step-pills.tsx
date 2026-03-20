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
                ? 'border-[#00A896]/45 bg-[#00A896]/18 text-[#a7fff5]'
                : errorCount > 0
                  ? 'border-[#ff69b4]/45 bg-[#ff69b4]/12 text-[#ffc3de] hover:border-[#ff69b4]/55'
                  : 'border-white/14 bg-white/6 text-white/65 hover:border-white/25 hover:text-white/85'
            }`}
          >
            <span>
              {index + 1}. {title}
            </span>
            {errorCount > 0 ? (
              <span className="rounded-full border border-[#ff69b4]/45 bg-[#ff69b4]/20 px-1.5 py-0.5 text-[10px] leading-none text-[#ffd3e7]">
                {errorCount}
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
