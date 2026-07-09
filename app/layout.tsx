import type { Metadata } from "next";
import "./globals.css";

// This is what fixes the text-message link preview.
// Title and description here are exactly what shows in iMessage / social cards.
export const metadata: Metadata = {
  title: "The Daily Dump",
  description: "The Daily Dump",
  openGraph: {
    title: "The Daily Dump",
    description: "The Daily Dump",
    type: "website",
    // Once you add public/og.png (1200x630), uncomment the next line:
    // images: ["/og.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "The Daily Dump",
    description: "The Daily Dump",
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
