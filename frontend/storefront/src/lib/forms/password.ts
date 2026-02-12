export const MIN_PASSWORD_LENGTH = 8;

export const PASSWORD_MIN_LENGTH_MESSAGE =
  "Minimum length of this field must be equal or greater than 8 symbols. Leading and trailing spaces will be ignored.";

export const PASSWORD_MISMATCH_MESSAGE = "Please make sure your passwords match.";

export type PasswordStrengthLevel = "very-weak" | "weak" | "medium" | "strong";

export type PasswordStrengthResult = {
  level: PasswordStrengthLevel;
  label: string;
  score: number;
  hasMinLength: boolean;
};

export function normalizePassword(value: string): string {
  return value.trim();
}

export function hasMinimumPasswordLength(value: string): boolean {
  return normalizePassword(value).length >= MIN_PASSWORD_LENGTH;
}

export function passwordsMatch(password: string, confirmPassword: string): boolean {
  return normalizePassword(password) === normalizePassword(confirmPassword);
}

function scorePasswordComposition(value: string): number {
  const hasLower = /[a-z]/.test(value);
  const hasUpper = /[A-Z]/.test(value);
  const hasDigit = /\d/.test(value);
  const hasSymbol = /[^A-Za-z0-9\s]/.test(value);
  return [hasLower, hasUpper, hasDigit, hasSymbol].filter(Boolean).length;
}

export function evaluatePasswordStrength(value: string): PasswordStrengthResult {
  const normalized = normalizePassword(value);
  const hasMinLength = normalized.length >= MIN_PASSWORD_LENGTH;
  const compositionScore = scorePasswordComposition(normalized);

  let score = 0;
  if (hasMinLength) {
    score += 1;
  }
  if (normalized.length >= 12) {
    score += 1;
  }
  if (compositionScore >= 2) {
    score += 1;
  }
  if (compositionScore >= 3) {
    score += 1;
  }

  if (score <= 1) {
    return {
      level: "very-weak",
      label: "Very weak",
      score,
      hasMinLength
    };
  }

  if (score === 2) {
    return {
      level: "weak",
      label: "Weak",
      score,
      hasMinLength
    };
  }

  if (score === 3) {
    return {
      level: "medium",
      label: "Medium",
      score,
      hasMinLength
    };
  }

  return {
    level: "strong",
    label: "Strong",
    score,
    hasMinLength
  };
}
