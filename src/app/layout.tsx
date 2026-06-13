import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FitBase — Health tracker",
  description:
    "Turn a few numbers a day into momentum you can see. Track activity, body, nutrition, sleep & mood — and watch your trends.",
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
