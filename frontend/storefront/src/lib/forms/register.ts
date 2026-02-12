export const REGISTER_PREFILL_COOKIE = "register_prefill";

export type RegisterPrefill = {
  firstname: string;
  lastname: string;
  email: string;
};

function sanitizeText(value: string): string {
  return value.trim().slice(0, 120);
}

function sanitizeEmail(value: string): string {
  return value.trim().toLowerCase().slice(0, 190);
}

export function createRegisterPrefill(firstname: string, lastname: string, email: string): RegisterPrefill {
  return {
    firstname: sanitizeText(firstname),
    lastname: sanitizeText(lastname),
    email: sanitizeEmail(email)
  };
}

export function serializeRegisterPrefill(prefill: RegisterPrefill): string {
  return JSON.stringify(prefill);
}

export function parseRegisterPrefill(value: string | undefined): RegisterPrefill | null {
  if (!value) {
    return null;
  }

  try {
    const parsed = JSON.parse(value) as Partial<RegisterPrefill>;
    if (
      typeof parsed.firstname !== "string" ||
      typeof parsed.lastname !== "string" ||
      typeof parsed.email !== "string"
    ) {
      return null;
    }

    return createRegisterPrefill(parsed.firstname, parsed.lastname, parsed.email);
  } catch {
    return null;
  }
}
