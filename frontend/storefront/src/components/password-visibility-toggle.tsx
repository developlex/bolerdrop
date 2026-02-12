"use client";

type PasswordVisibilityToggleProps = {
  visible: boolean;
  controls: string;
  onToggle: () => void;
};

function EyeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden="true">
      <path
        d="M2 12C3.9 8.2 7.4 6 12 6s8.1 2.2 10 6c-1.9 3.8-5.4 6-10 6s-8.1-2.2-10-6Z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function EyeSlashIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden="true">
      <path
        d="M3 4.5 20.5 22"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M5.3 7.2C3.9 8.3 2.8 9.9 2 12c1.9 3.8 5.4 6 10 6 2.3 0 4.4-.5 6.1-1.6M9.9 6.2C10.6 6.1 11.3 6 12 6c4.6 0 8.1 2.2 10 6-.7 1.5-1.6 2.8-2.7 3.8"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M9.9 9.9a3 3 0 0 0 4.2 4.2"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function PasswordVisibilityToggle({
  visible,
  controls,
  onToggle
}: PasswordVisibilityToggleProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-controls={controls}
      aria-label={visible ? "Hide password" : "Show password"}
      className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md border border-black/10 bg-white/95 px-2 py-1 text-steel transition hover:bg-sand"
    >
      {visible ? <EyeSlashIcon /> : <EyeIcon />}
    </button>
  );
}
