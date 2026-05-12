// Server Component – ads are rendered directly in the initial HTML
// so that bots (e.g. AADS verification bot) can detect the ad iframe without JS.
export const dynamic = "force-dynamic";
import Link from "next/link";
import CameraView from "@/components/CameraView";
import styles from "./page.module.css";

function AdSlot({
  embedCode,
  horizontal,
  sidebar,
}: {
  embedCode?: string;
  horizontal?: boolean;
  sidebar?: boolean;
}) {
  if (!embedCode) return null;

  return (
    <div
      className={horizontal ? "adBannerHorizontal" : "adBannerSidebar"}
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: sidebar ? "stretch" : undefined,
        padding: horizontal ? "8px 16px" : "0",
        width: "100%",
        ...(sidebar ? { height: "100%", minHeight: 0 } : {}),
      }}
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: embedCode }}
    />
  );
}

export default async function HomePage() {
  // HARDCODE YOUR AD EMBED CODES HERE
  // Replace the strings below with your actual AADS iframe code or other ad network code.
  // Example: `<iframe data-aa='123456' src='//ad.a-ads.com/123456?size=728x90' style='width:728px; height:90px; border:0px; padding:0; overflow:hidden; background-color: transparent;'></iframe>`

  const TOP_AD_CODE = ``;
  const BOTTOM_AD_CODE = ``;
  const LEFT_AD_CODE = ``;
  const RIGHT_AD_CODE = `<!-- BEGIN AADS AD UNIT 2437360 -->

<div id="frame" style="width: 100%;margin: auto;position: relative; z-index: 99998;">
          <iframe data-aa='2437360' src='//acceptable.a-ads.com/2437360/?size=Adaptive'
                            style='border:0; padding:0; width:70%; height:auto; overflow:hidden;display: block;margin: auto'></iframe>
        </div>

<!-- END AADS AD UNIT 2437360 -->`;

  return (
    <div className={styles.page}>
      {/* Background ambient */}
      <div className={styles.ambient} aria-hidden="true">
        <div className={styles.ambientBlob1} />
        <div className={styles.ambientBlob2} />
        <div className={styles.ambientBlob3} />
      </div>

      {/* Top Ad – bot-visible */}
      {TOP_AD_CODE && (
        <AdSlot
          embedCode={TOP_AD_CODE}
          horizontal
        />
      )}

      <main className={styles.main}>
        <header className={styles.header}>
          <div className={styles.logoMark} aria-hidden="true">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <path
                d="M15 10l4.553-2.069A1 1 0 0121 8.87v6.26a1 1 0 01-1.447.9L15 14M3 8a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div>
            <h1 className={styles.title}>CamCheck</h1>
            <p className={styles.subtitle}>
              Test your webcam online — instant, free, no install
            </p>
          </div>
        </header>

        <div className={styles.content}>
          {/* Viewport row: sidebar-left (SSR ad) | camera column | sidebar-right (SSR ad) */}
          <div className={styles.viewportRow}>
            <div className={styles.sidebarLeft}>
              {LEFT_AD_CODE && (
                <AdSlot
                  embedCode={LEFT_AD_CODE}
                  sidebar
                />
              )}
            </div>

            {/* CameraView is the client island – wraps viewport + controls in a flex column */}
            <CameraView />

            <div className={styles.sidebarRight}>
              {RIGHT_AD_CODE && (
                <AdSlot
                  embedCode={RIGHT_AD_CODE}
                  sidebar
                />
              )}
            </div>
          </div>
        </div>

        {/* Bottom Ad – SSR, bot-visible */}
        {BOTTOM_AD_CODE && (
          <AdSlot
            embedCode={BOTTOM_AD_CODE}
            horizontal
          />
        )}
      </main>

      <footer className={styles.footer}>
        <p>
          © {new Date().getFullYear()} CamCheck &nbsp;·&nbsp; Your camera data
          never leaves your browser &nbsp;·&nbsp;
          <Link href="/admin/login" className={styles.footerLink}>
            Admin
          </Link>
        </p>
      </footer>
    </div>
  );
}
