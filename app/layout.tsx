import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";
import { default as Navbar } from "@/components/Navbar";
import NotificationBanner from "@/components/NotificationBanner";
import Link from "next/link";
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "GSoC Leaderboard",
  description: "A leaderboard for Google Summer of Code participants.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Navbar />
        <NotificationBanner>
          These leaderboard entries are updated every 6 hours. ⭐ If you find
          this project useful,{" "}
          <Link
            href="https://github.com/Anxhul10/gsoc-leaderboard"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: "inherit",
              textDecoration: "underline",
              fontWeight: "bold",
            }}
          >
            star the repository
          </Link>
          .
        </NotificationBanner>
        <AppRouterCacheProvider options={{ enableCssLayer: true }}>
          {children}
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
