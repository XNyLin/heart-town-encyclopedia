export const metadata = {
  title: "心動小鎮｜生物圖鑑",
  description: "Heart Town Encyclopedia",
};

export default function RootLayout({ children }) {
  return (
    <html lang="zh-TW">
      <head>
        <style>{`
          section > div[style*="grid-template-columns"] > div:last-child div[style*="border-top"] {
            max-height: 320px;
            overflow-y: auto;
            overscroll-behavior: contain;
            padding-right: 6px;
          }
        `}</style>
      </head>
      <body>{children}</body>
    </html>
  );
}