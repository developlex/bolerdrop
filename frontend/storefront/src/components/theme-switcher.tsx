"use client";

import { useEffect, useState } from "react";
import {
  getStorefrontTheme,
  STOREFRONT_THEME_COOKIE,
  STOREFRONT_THEME_IDS,
  type StorefrontThemeId
} from "@/src/themes/themes";

type ThemeSwitcherProps = {
  activeThemeId: StorefrontThemeId;
};

const THEME_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 90;

function applyTheme(themeId: StorefrontThemeId) {
  if (typeof document === "undefined") {
    return;
  }

  const body = document.body;
  const theme = getStorefrontTheme(themeId);
  for (const knownThemeId of STOREFRONT_THEME_IDS) {
    body.classList.remove(getStorefrontTheme(knownThemeId).bodyClassName);
  }
  body.classList.add(theme.bodyClassName);

  for (const [name, value] of Object.entries(theme.cssVariables)) {
    body.style.setProperty(name, value);
  }
}

function persistTheme(themeId: StorefrontThemeId) {
  if (typeof document === "undefined") {
    return;
  }

  document.cookie =
    `${STOREFRONT_THEME_COOKIE}=${encodeURIComponent(themeId)}; Path=/; Max-Age=${THEME_COOKIE_MAX_AGE_SECONDS}; SameSite=Lax`;
}

export function ThemeSwitcher({ activeThemeId }: ThemeSwitcherProps) {
  const [selectedThemeId, setSelectedThemeId] = useState<StorefrontThemeId>(activeThemeId);

  useEffect(() => {
    setSelectedThemeId(activeThemeId);
    applyTheme(activeThemeId);
  }, [activeThemeId]);

  return (
    <div className="flex items-center gap-1 rounded-full border border-black/8 bg-white/86 p-1 text-xs shadow-[0_4px_10px_rgba(19,32,47,0.08)]">
      {STOREFRONT_THEME_IDS.map((themeId) => {
        const active = themeId === selectedThemeId;
        return (
          <button
            key={themeId}
            type="button"
            onClick={() => {
              if (themeId === selectedThemeId) {
                return;
              }
              setSelectedThemeId(themeId);
              applyTheme(themeId);
              persistTheme(themeId);
            }}
            className={
              active
                ? "rounded-full bg-[rgba(190,79,46,0.14)] px-2.5 py-1 font-semibold uppercase tracking-[0.06em] text-ink no-underline"
                : "rounded-full px-2.5 py-1 font-semibold uppercase tracking-[0.06em] text-steel transition-colors hover:bg-[rgba(185,119,63,0.16)] hover:text-ink hover:no-underline"
            }
            aria-pressed={active}
            aria-label={`Switch storefront theme to ${themeId}`}
          >
            {themeId}
          </button>
        );
      })}
    </div>
  );
}
