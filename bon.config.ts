import type { BonConfig } from "@/lib/config";

export const bonConfig = {
  version: "0.1.46",
  colors: {
    palette: "neutral",
  },
  button: {
    radius: "lg",
    borderWidth: "sm",
  },
  panel: {
    radius: "2xl",
  },
  spacing: {
    pageX: "6",
    pageY: "6",
    pageYMobile: "10",
    sectionGap: "5",
    sectionInner: "3",
    panelPadding: "3",
    inlineGap: "3",
    stackTight: "2",
  },
  typography: {
    pageTitle: "3xl",
    sectionTitle: "lg",
    body: "sm",
    caption: "xs",
    code: "sm",
    buttonSm: "xs",
    buttonMd: "sm",
    buttonLg: "base",
  },
} satisfies BonConfig;
