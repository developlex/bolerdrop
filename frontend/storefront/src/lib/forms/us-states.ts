export const US_COUNTRY_CODE = "US";
export const US_COUNTRY_LABEL = "United States";

export type UsStateOption = {
  code: string;
  name: string;
};

export const US_STATE_OPTIONS: readonly UsStateOption[] = [
  { code: "AL", name: "Alabama" },
  { code: "AK", name: "Alaska" },
  { code: "AZ", name: "Arizona" },
  { code: "AR", name: "Arkansas" },
  { code: "CA", name: "California" },
  { code: "CO", name: "Colorado" },
  { code: "CT", name: "Connecticut" },
  { code: "DE", name: "Delaware" },
  { code: "DC", name: "District of Columbia" },
  { code: "FL", name: "Florida" },
  { code: "GA", name: "Georgia" },
  { code: "HI", name: "Hawaii" },
  { code: "ID", name: "Idaho" },
  { code: "IL", name: "Illinois" },
  { code: "IN", name: "Indiana" },
  { code: "IA", name: "Iowa" },
  { code: "KS", name: "Kansas" },
  { code: "KY", name: "Kentucky" },
  { code: "LA", name: "Louisiana" },
  { code: "ME", name: "Maine" },
  { code: "MD", name: "Maryland" },
  { code: "MA", name: "Massachusetts" },
  { code: "MI", name: "Michigan" },
  { code: "MN", name: "Minnesota" },
  { code: "MS", name: "Mississippi" },
  { code: "MO", name: "Missouri" },
  { code: "MT", name: "Montana" },
  { code: "NE", name: "Nebraska" },
  { code: "NV", name: "Nevada" },
  { code: "NH", name: "New Hampshire" },
  { code: "NJ", name: "New Jersey" },
  { code: "NM", name: "New Mexico" },
  { code: "NY", name: "New York" },
  { code: "NC", name: "North Carolina" },
  { code: "ND", name: "North Dakota" },
  { code: "OH", name: "Ohio" },
  { code: "OK", name: "Oklahoma" },
  { code: "OR", name: "Oregon" },
  { code: "PA", name: "Pennsylvania" },
  { code: "RI", name: "Rhode Island" },
  { code: "SC", name: "South Carolina" },
  { code: "SD", name: "South Dakota" },
  { code: "TN", name: "Tennessee" },
  { code: "TX", name: "Texas" },
  { code: "UT", name: "Utah" },
  { code: "VT", name: "Vermont" },
  { code: "VA", name: "Virginia" },
  { code: "WA", name: "Washington" },
  { code: "WV", name: "West Virginia" },
  { code: "WI", name: "Wisconsin" },
  { code: "WY", name: "Wyoming" }
] as const;

function normalizeValue(value: string): string {
  return value.trim().toLowerCase();
}

export function resolveUsStateCode(...candidates: Array<string | null | undefined>): string | null {
  for (const candidate of candidates) {
    if (typeof candidate !== "string") {
      continue;
    }
    const value = candidate.trim();
    if (!value) {
      continue;
    }

    const byCode = US_STATE_OPTIONS.find((state) => state.code === value.toUpperCase());
    if (byCode) {
      return byCode.code;
    }

    const normalized = normalizeValue(value);
    const byName = US_STATE_OPTIONS.find((state) => normalizeValue(state.name) === normalized);
    if (byName) {
      return byName.code;
    }
  }

  return null;
}

export function dedupeUsStateOptions(options: ReadonlyArray<UsStateOption>): UsStateOption[] {
  const seenCodes = new Set<string>();
  const deduped: UsStateOption[] = [];

  for (const option of options) {
    const code = option.code.trim().toUpperCase();
    const name = option.name.trim();
    if (!code || !name) {
      continue;
    }
    if (seenCodes.has(code)) {
      continue;
    }
    seenCodes.add(code);
    deduped.push({ code, name });
  }

  return deduped;
}
