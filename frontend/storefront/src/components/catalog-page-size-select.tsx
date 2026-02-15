"use client";

import { useRouter } from "next/navigation";
import { DEFAULT_PAGE_SIZE, getCatalogPageHref, PAGE_SIZE_OPTIONS } from "@/src/lib/commerce/pagination";
import { ui } from "@/src/ui/styles";

type CatalogPageSizeSelectProps = {
  searchTerm: string;
  pageSize: number;
};

function buildHref(page: number, searchTerm: string, pageSize: number): string {
  const base = getCatalogPageHref(page);
  const params = new URLSearchParams();
  const normalizedSearch = searchTerm.trim();

  if (normalizedSearch) {
    params.set("q", normalizedSearch);
  }
  if (pageSize !== DEFAULT_PAGE_SIZE) {
    params.set("size", String(pageSize));
  }

  const query = params.toString();
  return query ? `${base}?${query}` : base;
}

export function CatalogPageSizeSelect({ searchTerm, pageSize }: CatalogPageSizeSelectProps) {
  const router = useRouter();

  return (
    <label className="text-sm">
      <span className="sr-only">Products per page</span>
      <select
        name="size"
        value={String(pageSize)}
        className={ui.form.select + " w-28"}
        onChange={(event) => {
          const nextSize = Number(event.target.value);
          const href = buildHref(1, searchTerm, nextSize);
          router.push(href);
        }}
      >
        {PAGE_SIZE_OPTIONS.map((size) => (
          <option key={size} value={size}>
            {size} / page
          </option>
        ))}
      </select>
    </label>
  );
}
