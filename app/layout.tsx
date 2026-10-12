import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Clip Image for X",
  description: "Clip images for X",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="zh-CN">
      <body className="h-dvh antialiased">{children}</body>
    </html>
  );
}
