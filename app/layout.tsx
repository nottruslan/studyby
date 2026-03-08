import type { Metadata, Viewport } from "next";
import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";
import { DisplayModeScript } from "@/components/shared/DisplayModeScript";
import { fontSans } from "@/lib/fonts";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  // Плавное поднятие контента при открытии клавиатуры (как в Telegram)
  interactiveWidget: "resizes-content",
};

export const metadata: Metadata = {
  title: "Studby",
  description: "Studby — студенческое сообщество",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Studby",
  },
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" className={fontSans.variable}>
      <head>
        <DisplayModeScript />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="theme-color" content="#6366f1" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <div id="app-scroll" className="app-scroll">
            {children}
          </div>
          <Toaster richColors position="top-center" />
        </ThemeProvider>
      </body>
    </html>
  );
}
