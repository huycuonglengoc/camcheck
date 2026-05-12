import type { Metadata } from "next";
import "./globals.css";
import { getAds } from "@/lib/storage";

// Force dynamic rendering so the ad embed code is always fetched fresh from Redis
export const dynamic = "force-dynamic";
export const revalidate = 0;

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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Fetch ads server-side so the AADS iframe (with data-aa) appears in the
  // raw HTML response – visible to bots that don't execute JavaScript.
  // Uses a 3-second timeout so layout never blocks startup.
  let adHtml = "";
  try {
    const ads = await Promise.race([
      getAds(),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("timeout")), 3000)
      ),
    ]);
    adHtml = ads
      .filter((a) => a.isActive && a.embedCode)
      .map((a) => a.embedCode as string)
      .join("\n");
  } catch {
    // Redis unavailable or timed out – layout renders without the hidden anchor
  }

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
      <body>
        {/*
          Hidden SSR ad anchor – puts the AADS iframe (with data-aa attribute)
          directly in the initial HTML so the AADS bot detects it without JS.
          Visually hidden; the actual visible ads are rendered in page.tsx.
        */}
        {adHtml && (
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              width: 0,
              height: 0,
              overflow: "hidden",
              opacity: 0,
              pointerEvents: "none",
            }}
            dangerouslySetInnerHTML={{ __html: adHtml }}
          />
        )}
        {children}
      </body>
    </html>
  );
}
