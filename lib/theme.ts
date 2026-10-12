import type { BonColorPalette } from "@/lib/palettes";

export type Theme = "light" | "dark" | "system";

export const THEME_STORAGE_KEY = "bon-ui-theme";

const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((listener) => listener());
}

export function getStoredTheme(): Theme {
  if (typeof window === "undefined") return "system";

  const stored = localStorage.getItem(THEME_STORAGE_KEY);
  if (stored === "light" || stored === "dark" || stored === "system") {
    return stored;
  }

  return "system";
}

export function resolveTheme(theme: Theme): "light" | "dark" {
  if (theme === "system") {
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }

  return theme;
}

export function applyTheme(theme: Theme) {
  const resolved = resolveTheme(theme);

  document.documentElement.classList.toggle("dark", resolved === "dark");
  document.documentElement.dataset.theme = theme;
}

export function setTheme(theme: Theme) {
  localStorage.setItem(THEME_STORAGE_KEY, theme);
  applyTheme(theme);
  notify();
}

export function subscribeTheme(onStoreChange: () => void) {
  const media = window.matchMedia("(prefers-color-scheme: dark)");
  const onSystemChange = () => {
    if (getStoredTheme() === "system") {
      applyTheme("system");
      notify();
    }
  };

  listeners.add(onStoreChange);
  media.addEventListener("change", onSystemChange);

  return () => {
    listeners.delete(onStoreChange);
    media.removeEventListener("change", onSystemChange);
  };
}

export function getThemeInitScript(_palette: BonColorPalette) {
  return `
(function () {
  try {
    var key = ${JSON.stringify(THEME_STORAGE_KEY)};
    var stored = localStorage.getItem(key) || "system";
    var dark =
      stored === "dark" ||
      (stored === "system" &&
        window.matchMedia("(prefers-color-scheme: dark)").matches);
    document.documentElement.classList.toggle("dark", dark);
    document.documentElement.dataset.theme = stored;
  } catch (e) {}
})();
`;
}
