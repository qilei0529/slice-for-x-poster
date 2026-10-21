import type { Metadata } from "next";
import { bonConfig } from "@/bon.config";
import { ThemeTransitionProvider } from "@/components/theme-transition";
import { ToastProvider } from "@/components/ui/toast";
import { TooltipProvider } from "@/components/ui/tooltip";
import { getBonConfigCss } from "@/lib/config";
import { getThemeInitScript } from "@/lib/theme";
import {
  getDefaultThemePrefs,
  getThemePrefsInitScript,
} from "@/lib/theme-prefs";
import "./globals.css";

export const metadata: Metadata = {
  title: "Slice for X",
  description: "Slice one picture into portrait tiles for X.",
  alternates: {
    types: {
      "application/json": [
        {
          url: "/agent.json",
          title: "Agent API",
        },
      ],
    },
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="zh-CN"
      className="h-full antialiased"
      data-palette={bonConfig.colors.palette}
      data-button-radius={bonConfig.button.radius}
      data-panel-radius={bonConfig.panel.radius}
      suppressHydrationWarning
    >
      <head>
        <style
          dangerouslySetInnerHTML={{ __html: getBonConfigCss(bonConfig) }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html:
              getThemeInitScript(bonConfig.colors.palette) +
              getThemePrefsInitScript(getDefaultThemePrefs()),
          }}
        />
      </head>
      <body className="min-h-full">
        <ThemeTransitionProvider>
          <ToastProvider>
            <TooltipProvider>
              <div className="root min-h-full">{children}</div>
            </TooltipProvider>
          </ToastProvider>
        </ThemeTransitionProvider>
      </body>
    </html>
  );
}
