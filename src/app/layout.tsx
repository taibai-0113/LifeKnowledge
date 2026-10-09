import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AppShell } from "@/components/layout/AppShell";
import { UserStoreProvider } from "@/context/UserStoreContext";

export const metadata: Metadata = {
  title: "人生常识 — 成年人的生活常识补全系统",
  description: "把没人系统教过你的生活常识补起来。移动端优先、可信有据的生活常识系统。",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "人生常识",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#fbfbfa",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className="antialiased selection:bg-zinc-200 dark:selection:bg-zinc-800">
        <UserStoreProvider>
          <AppShell>{children}</AppShell>
        </UserStoreProvider>
      </body>
    </html>
  );
}
