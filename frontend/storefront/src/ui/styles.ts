export const ui = {
  layout: {
    shell: "mx-auto w-full max-w-6xl px-4 py-6",
    headerWrap: "mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4",
    stackMd: "space-y-4",
    stackLg: "space-y-6"
  },
  text: {
    pageTitle: "text-2xl font-semibold text-ink",
    heroTitle: "text-3xl font-semibold text-ink",
    subtitle: "text-sm text-steel",
    body: "text-base text-ink",
    label: "text-sm text-steel",
    value: "font-medium text-ink",
    price: "text-xl font-semibold text-ink",
    link: "inline-block text-ember hover:underline"
  },
  surface: {
    card: "rounded-lg border border-gray-200 bg-white p-4 shadow-sm",
    panel: "rounded border border-gray-200 bg-white p-4",
    panelLg: "rounded border border-gray-200 bg-white p-6",
    media: "overflow-hidden rounded-lg border border-gray-200 bg-white",
    mediaPlaceholder: "flex h-full items-center justify-center text-sm text-steel"
  },
  state: {
    warning: "rounded border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900",
    success: "rounded border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900"
  },
  form: {
    input: "w-full rounded border border-gray-300 bg-white px-3 py-2",
    inputCompact: "w-20 rounded border border-gray-300 bg-white px-2 py-1"
  },
  action: {
    buttonPrimary: "rounded bg-ember px-4 py-2 text-sm font-medium text-white hover:opacity-90",
    buttonSecondary: "rounded border border-gray-300 px-4 py-2 text-sm font-medium text-ink hover:bg-gray-50"
  },
  nav: {
    header: "flex items-center gap-4 text-sm",
    brand: "text-lg font-semibold text-ink no-underline hover:no-underline",
    navLink: "text-ember hover:underline"
  },
  grid: {
    catalog: "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4",
    product: "grid grid-cols-1 gap-6 md:grid-cols-2"
  },
  misc: {
    prose: "prose mt-6 max-w-none"
  }
} as const;
