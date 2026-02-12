import { MIN_PASSWORD_LENGTH } from "@/src/lib/forms/password";
import { ui } from "@/src/ui/styles";

type PasswordStrengthMeterProps = {
  level: "very-weak" | "weak" | "medium" | "strong";
  label: string;
};

const strengthSegmentClass: Record<string, string> = {
  inactive: "bg-black/10",
  "very-weak": "bg-red-500",
  weak: "bg-amber-500",
  medium: "bg-sky-500",
  strong: "bg-emerald-500"
};

function getStrengthSegments(level: PasswordStrengthMeterProps["level"]): number {
  if (level === "very-weak") {
    return 1;
  }
  if (level === "weak") {
    return 2;
  }
  if (level === "medium") {
    return 3;
  }
  return 4;
}

export function PasswordStrengthMeter({ level, label }: PasswordStrengthMeterProps) {
  const activeSegments = getStrengthSegments(level);

  return (
    <div className="mt-2">
      <div className="mb-1 grid grid-cols-4 gap-1">
        {Array.from({ length: 4 }).map((_, index) => {
          const isActive = index < activeSegments;
          const tone = isActive ? level : "inactive";
          return <span key={index} className={`h-1.5 rounded-full ${strengthSegmentClass[tone]}`} />;
        })}
      </div>
      <p className={ui.text.subtitle}>Password strength: {label}</p>
      <p className={ui.text.subtitle}>
        Minimum {MIN_PASSWORD_LENGTH} characters. Leading and trailing spaces are ignored.
      </p>
    </div>
  );
}
