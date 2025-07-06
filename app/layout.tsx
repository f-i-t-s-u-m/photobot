import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Telegram Watermark Bot",
  description: "A Telegram bot that adds watermarks to photos",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
