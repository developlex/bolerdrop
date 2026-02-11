export type PageParamInput = string | string[] | undefined;

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

export function getCatalogPageHref(page: number): string {
  return page <= 1 ? "/" : `/page/${page}`;
}
