export const metadata = {
  title: "心動小鎮｜生物圖鑑",
  description: "Heart Town Encyclopedia",
};

export default function RootLayout({ children }) {
  return (
    <html lang="zh-TW">
      <body>{children}</body>
    </html>
  );
}