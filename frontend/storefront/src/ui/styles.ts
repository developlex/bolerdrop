export const ui = {
  layout: {
    shell: "relative z-10 mx-auto w-full max-w-6xl px-4 pb-14 pt-8 sm:px-6 lg:px-8",
    headerWrap: "mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6 lg:px-8",
    stackMd: "space-y-4",
    stackLg: "space-y-6"
  },
  text: {
    pageTitle: "font-[family-name:var(--font-display)] text-3xl font-semibold leading-tight tracking-tight text-ink sm:text-4xl",
    heroTitle: "font-[family-name:var(--font-display)] text-4xl font-semibold leading-tight tracking-tight text-ink sm:text-5xl",
    subtitle: "text-sm leading-relaxed text-steel",
    body: "text-base leading-relaxed text-ink",
    label: "text-xs font-semibold uppercase tracking-[0.09em] text-steel/95",
    value: "text-base font-semibold text-ink",
    price: "text-2xl font-semibold tracking-tight text-ink",
    link: "inline-flex items-center gap-1 text-sm font-medium text-ember transition-colors hover:text-ocean hover:no-underline"
  },
  surface: {
    card:
      "group relative overflow-hidden rounded-2xl border border-black/5 bg-white/85 p-4 shadow-[0_10px_24px_rgba(19,32,47,0.1)] backdrop-blur-sm transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_34px_rgba(19,32,47,0.16)]",
    panel:
      "rounded-2xl border border-black/5 bg-white/88 p-5 shadow-[0_8px_22px_rgba(19,32,47,0.1)] backdrop-blur-sm",
    panelLg:
      "rounded-3xl border border-black/5 bg-white/90 p-7 shadow-[0_18px_40px_rgba(19,32,47,0.12)] backdrop-blur-md sm:p-8",
    media:
      "overflow-hidden rounded-2xl border border-black/5 bg-white shadow-[0_12px_26px_rgba(19,32,47,0.12)]",
    mediaPlaceholder: "flex h-full items-center justify-center text-sm font-medium text-steel"
  },
  state: {
    warning: "rounded-xl border-l-4 border-amber-500 bg-amber-50/95 p-4 text-sm text-amber-950",
    success: "rounded-xl border-l-4 border-emerald-600 bg-emerald-50/95 p-4 text-sm text-emerald-900"
  },
  form: {
    input:
      "w-full rounded-xl border border-black/10 bg-white px-3 py-2.5 text-sm text-ink shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] outline-none transition focus:border-ember focus:ring-3 focus:ring-[rgba(190,79,46,0.18)]",
    select:
      "select-chevron w-full rounded-xl border border-black/10 bg-white px-3 py-2.5 text-sm text-ink shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] outline-none transition focus:border-ember focus:ring-3 focus:ring-[rgba(190,79,46,0.18)]",
    inputCompact:
      "w-20 rounded-lg border border-black/10 bg-white px-2 py-1.5 text-sm text-ink outline-none transition focus:border-ember focus:ring-3 focus:ring-[rgba(190,79,46,0.18)]"
  },
  action: {
    buttonPrimary:
      "inline-flex items-center justify-center rounded-xl bg-ember px-4 py-2.5 text-sm font-semibold !text-white visited:!text-white shadow-[0_8px_18px_rgba(190,79,46,0.32)] transition duration-200 hover:-translate-y-0.5 hover:bg-[#a94724] hover:!text-white hover:no-underline focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-[rgba(190,79,46,0.25)]",
    buttonHero:
      "inline-flex items-center justify-center rounded-xl bg-ink px-4 py-2.5 text-sm font-semibold !text-white visited:!text-white shadow-[0_10px_22px_rgba(19,32,47,0.28)] transition duration-200 hover:-translate-y-0.5 hover:bg-ocean hover:!text-white hover:no-underline focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-[rgba(19,32,47,0.24)]",
    buttonSecondary:
      "inline-flex items-center justify-center rounded-xl border border-black/10 bg-white/90 px-4 py-2.5 text-sm font-semibold !text-ink visited:!text-ink shadow-[0_4px_12px_rgba(19,32,47,0.08)] transition duration-200 hover:-translate-y-0.5 hover:bg-sand hover:!text-ink hover:no-underline focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-[rgba(15,111,103,0.2)]"
  },
  nav: {
    header: "flex items-center gap-1 rounded-full border border-black/5 bg-white/76 p-1 text-sm shadow-[0_8px_18px_rgba(19,32,47,0.1)] backdrop-blur-sm",
    brand:
      "font-[family-name:var(--font-display)] text-xl font-semibold tracking-tight text-ink no-underline transition-colors hover:text-ember hover:no-underline",
    navLink:
      "rounded-full px-3 py-1.5 text-sm font-semibold text-steel transition-colors duration-200 hover:bg-[rgba(190,79,46,0.14)] hover:text-ink hover:no-underline"
  },
  grid: {
    catalog: "grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
    product: "grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]"
  },
  misc: {
    prose:
      "mt-6 max-w-none text-sm leading-relaxed text-steel [&_a]:text-ember [&_h2]:mt-6 [&_h2]:font-[family-name:var(--font-display)] [&_h2]:text-xl [&_h2]:text-ink [&_iframe]:mx-auto [&_iframe]:block [&_iframe]:w-full [&_iframe]:max-w-2xl [&_iframe]:aspect-video [&_iframe]:h-auto [&_iframe]:rounded-xl [&_iframe]:border [&_iframe]:border-black/10 [&_li]:mb-1 [&_p]:mb-3"
  }
} as const;
