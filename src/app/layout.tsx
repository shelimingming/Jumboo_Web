import type { Metadata } from "next";
import { Literata, Sora } from "next/font/google";
import "./globals.css";

// 品牌字体：与原先 preview.html 的 Google Fonts 配置一致
const sora = Sora({
  subsets: ["latin"],
  variable: "--font-sora",
  weight: ["300", "400", "500", "600"],
});

const literata = Literata({
  subsets: ["latin"],
  variable: "--font-literata",
  style: ["normal", "italic"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "阿布 Jumboo · AI 影像创作者",
  description:
    "用生成式影像探索光、几何与情绪。浏览创作片段，欢迎聊聊下一次视觉实验。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="zh-CN"
      className={`${sora.variable} ${literata.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
