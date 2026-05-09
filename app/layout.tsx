import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CamCheck – Webcam Test Online",
  description:
    "Test your webcam online for free. Check if your camera works properly in seconds. No download, no install required.",
  keywords: [
    "webcam test",
    "camera check",
    "test webcam online",
    "camera not working",
    "webcam checker",
  ],
  openGraph: {
    title: "CamCheck – Webcam Test Online",
    description: "Test your webcam online for free in seconds.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
