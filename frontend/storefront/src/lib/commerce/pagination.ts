export type PageParamInput = string | string[] | undefined;
export type PageSizeParamInput = string | string[] | undefined;

export const PAGE_SIZE_OPTIONS = [4, 8, 12, 16] as const;
export const DEFAULT_PAGE_SIZE = 12;

export function parsePageParam(input: PageParamInput): number | null {
  const raw = Array.isArray(input) ? input[0] : input;
  if (raw === undefined) {
    return null;
  }

  const parsed = Number(raw);
  if (!Number.isInteger(parsed) || parsed < 1) {
    return null;
  }

  return parsed;
}

export function parsePageSizeParam(input: PageSizeParamInput): number {
  const raw = Array.isArray(input) ? input[0] : input;
  if (raw === undefined) {
    return DEFAULT_PAGE_SIZE;
  }

  const parsed = Number(raw);
  if (!Number.isInteger(parsed) || !PAGE_SIZE_OPTIONS.includes(parsed as typeof PAGE_SIZE_OPTIONS[number])) {
    return DEFAULT_PAGE_SIZE;
  }

  return parsed;
}

export function getCatalogPageHref(page: number): string {
  return page <= 1 ? "/" : `/page/${page}`;
}
