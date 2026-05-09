"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import styles from "./login.module.css";

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Login failed");
      } else {
        router.push("/admin");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.ambient} aria-hidden="true">
        <div className={styles.blob1} />
        <div className={styles.blob2} />
      </div>

      <div className={`${styles.card} glass animate-fade-in-up`}>
        <div className={styles.cardHeader}>
          <div className={styles.lockIcon}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <rect
                x="3"
                y="11"
                width="18"
                height="11"
                rx="2"
                stroke="currentColor"
                strokeWidth="2"
              />
              <path
                d="M7 11V7a5 5 0 0110 0v4"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <circle cx="12" cy="16" r="1.5" fill="currentColor" />
            </svg>
          </div>
          <h1 className={styles.title}>Admin Panel</h1>
          <p className={styles.subtitle}>Sign in to manage your ad banners</p>
        </div>

        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          <div className={styles.field}>
            <label htmlFor="admin-username">Username</label>
            <div className={styles.inputWrap}>
              <span className={styles.inputIcon}>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </span>
              <input
                id="admin-username"
                type="text"
                className={`input ${styles.inputPadded}`}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                autoComplete="username"
                required
                disabled={loading}
              />
            </div>
          </div>

          <div className={styles.field}>
            <label htmlFor="admin-password">Password</label>
            <div className={styles.inputWrap}>
              <span className={styles.inputIcon}>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <rect x="3" y="11" width="18" height="11" rx="2" />
                  <path d="M7 11V7a5 5 0 0110 0v4" strokeLinecap="round" />
                </svg>
              </span>
              <input
                id="admin-password"
                type={showPass ? "text" : "password"}
                className={`input ${styles.inputPadded} ${styles.inputPr}`}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                autoComplete="current-password"
                required
                disabled={loading}
              />
              <button
                type="button"
                className={styles.eyeBtn}
                onClick={() => setShowPass((v) => !v)}
                aria-label={showPass ? "Hide password" : "Show password"}
              >
                {showPass ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19M1 1l22 22"/>
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                )}
              </button>
            </div>
          </div>

          {error && (
            <div className={styles.errorBox} role="alert">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <path d="M12 8v4M12 16h.01"/>
              </svg>
              {error}
            </div>
          )}

          <button
            id="admin-login-btn"
            type="submit"
            className="btn btn-primary"
            style={{ width: "100%", marginTop: 4 }}
            disabled={loading}
          >
            {loading ? (
              <>
                <span className={styles.btnSpinner} />
                Signing in...
              </>
            ) : (
              <>
                Sign In
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </>
            )}
          </button>
        </form>

        <div className={styles.cardFooter}>
          <Link href="/" className={styles.backLink}>
            ← Back to CamCheck
          </Link>
        </div>
      </div>
    </div>
  );
}
