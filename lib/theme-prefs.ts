import { bonConfig } from "@/bon.config";
import {
  bonRadiusValues,
  type BonColorPalette,
  type BonRadius,
} from "@/lib/config";
import { bonColorPaletteOptions, isBonColorPalette } from "@/lib/palettes";

export const THEME_PREFS_STORAGE_KEY = "bon-ui-theme-prefs";

export type BonThemePrefs = {
  palette: BonColorPalette;
  buttonRadius: BonRadius;
  panelRadius: BonRadius;
};

export { bonColorPaletteOptions };

export const bonRadiusOptions = [
  "none",
  "sm",
  "md",
  "lg",
  "xl",
  "2xl",
] as const satisfies readonly BonRadius[];

const listeners = new Set<() => void>();

/** Stable defaults for SSR / getServerSnapshot — must not allocate per call. */
const defaultThemePrefs: BonThemePrefs = {
  palette: bonConfig.colors.palette,
  buttonRadius: bonConfig.button.radius,
  panelRadius: bonConfig.panel.radius,
};

let cachedThemePrefs: BonThemePrefs = defaultThemePrefs;
let themePrefsHydrated = false;

function notify() {
  listeners.forEach((listener) => listener());
}

export function getDefaultThemePrefs(): BonThemePrefs {
  return defaultThemePrefs;
}

export function getServerThemePrefs(): BonThemePrefs {
  return defaultThemePrefs;
}

function isBonRadius(value: unknown): value is BonRadius {
  return (
    value === "none" ||
    value === "sm" ||
    value === "md" ||
    value === "lg" ||
    value === "xl" ||
    value === "2xl"
  );
}

function parseThemePrefs(raw: string | null): Partial<BonThemePrefs> {
  if (!raw) return {};

  try {
    const parsed = JSON.parse(raw) as Partial<BonThemePrefs>;
    const next: Partial<BonThemePrefs> = {};

    if (isBonColorPalette(parsed.palette)) {
      next.palette = parsed.palette;
    }
    if (isBonRadius(parsed.buttonRadius)) {
      next.buttonRadius = parsed.buttonRadius;
    }
    if (isBonRadius(parsed.panelRadius)) {
      next.panelRadius = parsed.panelRadius;
    }

    return next;
  } catch {
    return {};
  }
}

function readThemePrefs(): BonThemePrefs {
  if (typeof window === "undefined") {
    return defaultThemePrefs;
  }

  const stored = parseThemePrefs(localStorage.getItem(THEME_PREFS_STORAGE_KEY));
  if (
    stored.palette === undefined &&
    stored.buttonRadius === undefined &&
    stored.panelRadius === undefined
  ) {
    return defaultThemePrefs;
  }

  return {
    ...defaultThemePrefs,
    ...stored,
  };
}

/** Cached snapshot for useSyncExternalStore — same reference until prefs change. */
export function getThemePrefs(): BonThemePrefs {
  if (typeof window === "undefined") {
    return defaultThemePrefs;
  }

  if (!themePrefsHydrated) {
    cachedThemePrefs = readThemePrefs();
    themePrefsHydrated = true;
  }

  return cachedThemePrefs;
}

function commitThemePrefs(next: BonThemePrefs) {
  themePrefsHydrated = true;
  cachedThemePrefs = next;
  applyThemePrefs(next);
  notify();
}

export function applyThemePrefs(prefs: BonThemePrefs) {
  const root = document.documentElement;
  root.dataset.palette = prefs.palette;
  root.dataset.buttonRadius = prefs.buttonRadius;
  root.dataset.panelRadius = prefs.panelRadius;
}

export function setThemePrefs(partial: Partial<BonThemePrefs>) {
  const next = { ...readThemePrefs(), ...partial };
  localStorage.setItem(THEME_PREFS_STORAGE_KEY, JSON.stringify(next));
  commitThemePrefs(next);
}

export function resetThemePrefs() {
  localStorage.removeItem(THEME_PREFS_STORAGE_KEY);
  commitThemePrefs(defaultThemePrefs);
}

export function subscribeThemePrefs(onStoreChange: () => void) {
  listeners.add(onStoreChange);
  return () => {
    listeners.delete(onStoreChange);
  };
}

export function getThemePrefsInitScript(defaults: BonThemePrefs) {
  return `
(function () {
  try {
    var prefsKey = ${JSON.stringify(THEME_PREFS_STORAGE_KEY)};
    var defaults = ${JSON.stringify(defaults)};
    var radiusValues = ${JSON.stringify(bonRadiusValues)};
    var palettes = ${JSON.stringify(
      Object.fromEntries(
        bonColorPaletteOptions.map((palette) => [palette, true]),
      ),
    )};
    var stored = null;
    try {
      stored = JSON.parse(localStorage.getItem(prefsKey) || "null");
    } catch (e) {
      stored = null;
    }
    var prefs = {
      palette: defaults.palette,
      buttonRadius: defaults.buttonRadius,
      panelRadius: defaults.panelRadius
    };
    if (stored && typeof stored === "object") {
      if (palettes[stored.palette]) {
        prefs.palette = stored.palette;
      }
      if (Object.prototype.hasOwnProperty.call(radiusValues, stored.buttonRadius)) {
        prefs.buttonRadius = stored.buttonRadius;
      }
      if (Object.prototype.hasOwnProperty.call(radiusValues, stored.panelRadius)) {
        prefs.panelRadius = stored.panelRadius;
      }
    }
    var root = document.documentElement;
    root.dataset.palette = prefs.palette;
    root.dataset.buttonRadius = prefs.buttonRadius;
    root.dataset.panelRadius = prefs.panelRadius;
  } catch (e) {}
})();
`;
}
