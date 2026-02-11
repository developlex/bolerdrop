import { getStorefrontConfig } from "@/src/lib/config";

const DEFAULT_BASE_URL = "http://localhost:8281";
const MAX_DESCRIPTION_LENGTH = 160;

export function getStorefrontBaseUrl(): URL {
  const { storefrontBaseUrl } = getStorefrontConfig();
  try {
    return new URL(storefrontBaseUrl);
  } catch {
    return new URL(DEFAULT_BASE_URL);
  }
}

export function absoluteStorefrontUrl(pathname: string): string {
  return new URL(pathname, getStorefrontBaseUrl()).toString();
}

export function htmlToPlainText(input: string | null | undefined): string {
  if (!input) {
    return "";
  }

  return input
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function toMetaDescription(input: string | null | undefined): string | undefined {
  const text = htmlToPlainText(input);
  if (!text) {
    return undefined;
  }

  if (text.length <= MAX_DESCRIPTION_LENGTH) {
    return text;
  }

  return `${text.slice(0, MAX_DESCRIPTION_LENGTH - 1)}…`;
}
