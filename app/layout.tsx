import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "我的游戏宇宙 · ROOM 202",
  description: "一本记录 31 部游戏、私人排名与记忆坐标的互动游戏画册。",
  openGraph: {
    title: "我的游戏宇宙",
    description: "31 段亲历世界，在记忆中的坐标。",
    type: "website",
    locale: "zh_CN",
    images: [{ url: "/og.png", width: 2184, height: 941, alt: "我的游戏宇宙" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "我的游戏宇宙",
    description: "31 段亲历世界，在记忆中的坐标。",
    images: ["/og.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
