"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import Link from "next/link";
import styles from "./page.module.css";
import AdBannerDisplay from "@/components/AdBannerDisplay";

type CameraStatus =
  | "idle"
  | "requesting"
  | "active"
  | "error"
  | "no-device"
  | "denied";

interface DeviceInfo {
  label: string;
  resolution: string;
  fps: string;
  deviceId: string;
}

export default function HomePage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number>(0);

  const [status, setStatus] = useState<CameraStatus>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo | null>(null);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<string>("");
  const [isMirrored, setIsMirrored] = useState(true);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [frameCounter, setFrameCounter] = useState(0);

  // FPS tracking
  const fpsRef = useRef({ count: 0, lastTime: 0, fps: 0 });

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) videoRef.current.srcObject = null;
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    setStatus("idle");
    setDeviceInfo(null);
  }, []);

  const trackFPS = useCallback(() => {
    const now = performance.now();
    fpsRef.current.count++;
    if (now - fpsRef.current.lastTime >= 1000) {
      fpsRef.current.fps = fpsRef.current.count;
      fpsRef.current.count = 0;
      fpsRef.current.lastTime = now;
      setFrameCounter((c) => c + 1); // trigger re-render for FPS display
    }
    animFrameRef.current = requestAnimationFrame(trackFPS);
  }, []);

  const startCamera = useCallback(
    async (deviceId?: string) => {
      stopCamera();
      setStatus("requesting");
      setErrorMsg("");

      try {
        const constraints: MediaStreamConstraints = {
          video: deviceId
            ? { deviceId: { exact: deviceId }, width: { ideal: 1920 }, height: { ideal: 1080 } }
            : { width: { ideal: 1920 }, height: { ideal: 1080 } },
          audio: false,
        };

        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        streamRef.current = stream;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }

        // Get device info
        const track = stream.getVideoTracks()[0];
        const settings = track.getSettings();
        const deviceList = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = deviceList.filter((d) => d.kind === "videoinput");
        setDevices(videoDevices);

        const matchedDevice = videoDevices.find(
          (d) => d.deviceId === settings.deviceId
        );

        setDeviceInfo({
          label: matchedDevice?.label || track.label || "Unknown Camera",
          resolution: `${settings.width ?? "?"}×${settings.height ?? "?"}`,
          fps: `${settings.frameRate?.toFixed(0) ?? "?"} fps`,
          deviceId: settings.deviceId ?? "",
        });

        setStatus("active");

        // Start FPS tracking
        fpsRef.current = { count: 0, lastTime: performance.now(), fps: 0 };
        animFrameRef.current = requestAnimationFrame(trackFPS);
      } catch (err: unknown) {
        const error = err as Error;
        if (
          error.name === "NotAllowedError" ||
          error.name === "PermissionDeniedError"
        ) {
          setStatus("denied");
          setErrorMsg(
            "Camera access was denied. Please allow camera permission in your browser settings."
          );
        } else if (
          error.name === "NotFoundError" ||
          error.name === "DevicesNotFoundError"
        ) {
          setStatus("no-device");
          setErrorMsg(
            "No camera found. Please connect a webcam and try again."
          );
        } else {
          setStatus("error");
          setErrorMsg(
            error.message || "An unexpected error occurred. Please try again."
          );
        }
      }
    },
    [stopCamera, trackFPS]
  );

  const handleDeviceSwitch = useCallback(
    (deviceId: string) => {
      setSelectedDevice(deviceId);
      startCamera(deviceId);
    },
    [startCamera]
  );

  // Enumerate devices on mount
  useEffect(() => {
    navigator.mediaDevices
      ?.enumerateDevices()
      .then((list) => setDevices(list.filter((d) => d.kind === "videoinput")))
      .catch(() => {});
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  const currentFps = fpsRef.current.fps;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  void frameCounter; // used to trigger re-render

  return (
    <div className={styles.page}>
      {/* Background ambient */}
      <div className={styles.ambient} aria-hidden="true">
        <div className={styles.ambientBlob1} />
        <div className={styles.ambientBlob2} />
        <div className={styles.ambientBlob3} />
      </div>

      {/* Top Ad Banner */}
      <AdBannerDisplay position="top" />

      <main className={styles.main}>
        {/* Header */}
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

        {/* Main content */}
        <div className={styles.content}>
          {/* Viewport row: sidebar-left + camera viewport + sidebar-right */}
          <div className={styles.viewportRow}>
            <div className={styles.sidebarLeft}>
              <AdBannerDisplay position="sidebar-left" />
            </div>

            <div
              className={`${styles.viewport} ${status === "active" ? styles.viewportActive : ""}`}
            >
              {status === "active" && (
                <div className={styles.liveIndicator}>
                  <span className={styles.liveDot} />
                  LIVE
                </div>
              )}

              <video
                ref={videoRef}
                className={styles.video}
                style={{
                  transform: isMirrored ? "scaleX(-1)" : "none",
                  filter: `brightness(${brightness}%) contrast(${contrast}%)`,
                  display: status === "active" ? "block" : "none",
                }}
                playsInline
                muted
                autoPlay
                aria-label="Webcam preview"
              />

              {status !== "active" && (
                <div className={styles.placeholder}>
                  {status === "idle" && (
                    <div className={styles.placeholderContent}>
                      <div className={styles.placeholderIcon}>
                        <svg
                          width="48"
                          height="48"
                          viewBox="0 0 24 24"
                          fill="none"
                        >
                          <path
                            d="M15 10l4.553-2.069A1 1 0 0121 8.87v6.26a1 1 0 01-1.447.9L15 14M3 8a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </div>
                      <p>Click &quot;Start Camera&quot; to begin your test</p>
                    </div>
                  )}
                  {status === "requesting" && (
                    <div className={styles.placeholderContent}>
                      <div className={styles.spinner} />
                      <p>Requesting camera access...</p>
                    </div>
                  )}
                  {(status === "denied" ||
                    status === "error" ||
                    status === "no-device") && (
                    <div className={styles.placeholderContent}>
                      <div
                        className={styles.placeholderIcon}
                        style={{ color: "var(--error)" }}
                      >
                        <svg
                          width="48"
                          height="48"
                          viewBox="0 0 24 24"
                          fill="none"
                        >
                          <circle
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="1.5"
                          />
                          <path
                            d="M15 9l-6 6M9 9l6 6"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                          />
                        </svg>
                      </div>
                      <p className={styles.errorText}>{errorMsg}</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className={styles.sidebarRight}>
              <AdBannerDisplay position="sidebar-right" />
            </div>
          </div>

          {/* Camera controls + stats below viewport */}
          <section className={styles.cameraSection}>
            {/* Controls */}
            <div className={`${styles.controls} glass`}>
              <div className={styles.controlsRow}>
                {status !== "active" ? (
                  <button
                    id="start-camera-btn"
                    className="btn btn-success"
                    onClick={() => startCamera(selectedDevice || undefined)}
                    disabled={status === "requesting"}
                  >
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M8 5v14l11-7z" />
                    </svg>
                    Start Camera
                  </button>
                ) : (
                  <button
                    id="stop-camera-btn"
                    className="btn btn-danger"
                    onClick={stopCamera}
                  >
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <rect x="6" y="6" width="12" height="12" rx="1" />
                    </svg>
                    Stop Camera
                  </button>
                )}

                {devices.length > 1 && (
                  <select
                    id="camera-device-select"
                    className="input"
                    style={{ maxWidth: 240 }}
                    value={selectedDevice}
                    onChange={(e) => handleDeviceSwitch(e.target.value)}
                  >
                    <option value="">Default Camera</option>
                    {devices.map((d) => (
                      <option key={d.deviceId} value={d.deviceId}>
                        {d.label || `Camera ${d.deviceId.slice(0, 6)}`}
                      </option>
                    ))}
                  </select>
                )}

                {status === "active" && (
                  <button
                    id="mirror-toggle-btn"
                    className={`btn btn-secondary ${isMirrored ? styles.btnActive : ""}`}
                    onClick={() => setIsMirrored((m) => !m)}
                    title="Toggle mirror"
                  >
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M12 3v18M3 12l4-4M3 12l4 4M21 12l-4-4M21 12l-4 4" />
                    </svg>
                    {isMirrored ? "Mirrored" : "Normal"}
                  </button>
                )}
              </div>

              {/* Sliders */}
              {status === "active" && (
                <div className={styles.sliders}>
                  <div className={styles.sliderGroup}>
                    <label htmlFor="brightness-slider">
                      ☀️ Brightness: {brightness}%
                    </label>
                    <input
                      id="brightness-slider"
                      type="range"
                      min={50}
                      max={200}
                      value={brightness}
                      onChange={(e) => setBrightness(+e.target.value)}
                      className={styles.slider}
                    />
                  </div>
                  <div className={styles.sliderGroup}>
                    <label htmlFor="contrast-slider">
                      🎨 Contrast: {contrast}%
                    </label>
                    <input
                      id="contrast-slider"
                      type="range"
                      min={50}
                      max={200}
                      value={contrast}
                      onChange={(e) => setContrast(+e.target.value)}
                      className={styles.slider}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Stats */}
            {status === "active" && deviceInfo && (
              <div className={`${styles.stats} animate-fade-in`}>
                <div className={styles.statCard}>
                  <div className={styles.statIcon}>📷</div>
                  <div>
                    <div className={styles.statLabel}>Camera</div>
                    <div
                      className={styles.statValue}
                      title={deviceInfo.label}
                    >
                      {deviceInfo.label.length > 30
                        ? deviceInfo.label.slice(0, 30) + "…"
                        : deviceInfo.label}
                    </div>
                  </div>
                </div>
                <div className={styles.statCard}>
                  <div className={styles.statIcon}>🖥️</div>
                  <div>
                    <div className={styles.statLabel}>Resolution</div>
                    <div className={styles.statValue}>
                      {deviceInfo.resolution}
                    </div>
                  </div>
                </div>
                <div className={styles.statCard}>
                  <div className={styles.statIcon}>⚡</div>
                  <div>
                    <div className={styles.statLabel}>Live FPS</div>
                    <div className={styles.statValue}>
                      {currentFps > 0 ? `${currentFps} fps` : deviceInfo.fps}
                    </div>
                  </div>
                </div>
                <div className={styles.statCard}>
                  <div className={styles.statIcon} style={{ color: "var(--success)" }}>✅</div>
                  <div>
                    <div className={styles.statLabel}>Status</div>
                    <div
                      className={styles.statValue}
                      style={{ color: "var(--success)" }}
                    >
                      Working
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Help section */}
            <div className={`${styles.helpSection} glass`}>
              <h2 className={styles.helpTitle}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3M12 17h.01"/>
                </svg>
                Common Issues
              </h2>
              <ul className={styles.helpList}>
                <li>
                  <strong>Permission denied</strong> — Click the camera icon in
                  your browser&apos;s address bar to allow access.
                </li>
                <li>
                  <strong>No camera found</strong> — Make sure your webcam is
                  connected and not in use by another app.
                </li>
                <li>
                  <strong>Black screen</strong> — Try switching cameras or
                  refreshing the page.
                </li>
                <li>
                  <strong>Low FPS</strong> — Close other applications that may
                  be using your camera.
                </li>
              </ul>
            </div>
          </section>
        </div>

        {/* Bottom Ad Banner */}
        <AdBannerDisplay position="bottom" />
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
