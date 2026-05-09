"use client";

import { useEffect, useState } from "react";

interface AdBanner {
  id: string;
  name: string;
  imageUrl: string;
  linkUrl: string;
  position: "top" | "bottom" | "sidebar-left" | "sidebar-right";
  isActive: boolean;
}

interface Props {
  position: AdBanner["position"];
}

export default function AdBannerDisplay({ position }: Props) {
  const [ad, setAd] = useState<AdBanner | null>(null);
  const [loaded, setLoaded] = useState(false);

  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    fetch("/api/ads")
      .then((r) => {
        if (!r.ok) throw new Error("Failed to fetch ads");
        return r.json();
      })
      .then((ads: AdBanner[]) => {
        // Public API already returns only active ads
        const match = ads.find((a) => a.position === position);
        setAd(match || null);
        setImgError(false);
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  }, [position]);

  if (!loaded || !ad || imgError) return null;

  const isHorizontal = position === "top" || position === "bottom";

  return (
    <div
      className={isHorizontal ? "adBannerHorizontal" : "adBannerSidebar"}
      style={{
        display: "flex",
        justifyContent: "center",
        padding: isHorizontal ? "8px 16px" : "0",
        width: "100%",
      }}
    >
      <a
        href={ad.linkUrl}
        target="_blank"
        rel="noopener noreferrer"
        title={ad.name}
        style={{
          display: "block",
          width: "100%",
          borderRadius: "12px",
          overflow: "hidden",
          border: "1px solid rgba(255,255,255,0.08)",
          transition: "transform 0.2s, box-shadow 0.2s",
          boxShadow: "0 2px 16px rgba(0,0,0,0.3)",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLElement).style.transform = "scale(1.01)";
          (e.currentTarget as HTMLElement).style.boxShadow =
            "0 4px 24px rgba(0,0,0,0.5)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.transform = "scale(1)";
          (e.currentTarget as HTMLElement).style.boxShadow =
            "0 2px 16px rgba(0,0,0,0.3)";
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={ad.imageUrl}
          alt={ad.name}
          style={{
            display: "block",
            width: "100%",
            height: isHorizontal ? "90px" : "auto",
            objectFit: "cover",
          }}
          loading="lazy"
          onError={() => setImgError(true)}
        />
      </a>
    </div>
  );
}
