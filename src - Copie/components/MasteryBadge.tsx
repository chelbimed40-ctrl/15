import { cn } from "../utils/cn";
import { type MasteryLevel, MASTERY_LABELS } from "../lib/store";

const SEG = ["ms-0","ms-1","ms-2","ms-3","ms-4","ms-5"] as const;
const LEVELS: MasteryLevel[] = [0,1,2,3,4,5];

const labelColors: Record<MasteryLevel, string> = {
  0: "text-[var(--color-muted)]",
  1: "text-[var(--color-sub)]",
  2: "text-[var(--accent-terra)]",
  3: "text-[var(--accent-amber)]",
  4: "text-[var(--gold-500)]",
  5: "text-[var(--gold-500)]",
};

export default function MasteryBadge({ mastery, compact = false }: { mastery: MasteryLevel; compact?: boolean }) {
  if (compact) {
    return (
      <div className="flex gap-0.5">
        {LEVELS.map(s => (
          <div key={s} className={cn(
            "h-1.5 rounded-full transition-all duration-500",
            s <= mastery ? SEG[mastery] : "ms-0",
            s <= mastery ? "w-3.5" : "w-1.5"
          )} />
        ))}
      </div>
    );
  }

  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <span className="text-[11px] font-bold text-[var(--color-sub)]">مستوى الإنجاز</span>
        <span className={cn("text-[11px] font-black", labelColors[mastery])}>
          {MASTERY_LABELS[mastery]}{mastery === 5 ? " ⭐" : ""}
        </span>
      </div>
      <div className="flex gap-1">
        {LEVELS.map(s => (
          <div key={s} className={cn(
            "h-2.5 flex-1 rounded-full transition-all duration-500",
            s <= mastery ? SEG[mastery] : "ms-0"
          )} />
        ))}
      </div>
    </div>
  );
}
