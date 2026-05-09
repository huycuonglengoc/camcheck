"use client";

import { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import styles from "./admin.module.css";

interface AdBanner {
  id: string;
  name: string;
  imageUrl: string;
  linkUrl: string;
  position: "top" | "bottom" | "sidebar-left" | "sidebar-right";
  isActive: boolean;
  createdAt: string;
}

type AdPosition = AdBanner["position"];

const POSITIONS: { value: AdPosition; label: string; icon: string }[] = [
  { value: "top", label: "Top Banner", icon: "⬆️" },
  { value: "bottom", label: "Bottom Banner", icon: "⬇️" },
  { value: "sidebar-left", label: "Left Sidebar", icon: "◀️" },
  { value: "sidebar-right", label: "Right Sidebar", icon: "▶️" },
];

const EMPTY_FORM = {
  name: "",
  imageUrl: "",
  linkUrl: "",
  position: "top" as AdPosition,
};

export default function AdminPage() {
  const router = useRouter();
  const [ads, setAds] = useState<AdBanner[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [editId, setEditId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [toast, setToast] = useState<{
    msg: string;
    type: "success" | "error";
  } | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchAds = async () => {
    try {
      const res = await fetch("/api/ads?admin=true");
      if (res.status === 401) {
        router.push("/admin/login");
        return;
      }
      const data = await res.json();
      setAds(data);
    } catch {
      showToast("Failed to fetch ads", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAds();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin/login");
  };

  const openCreateForm = () => {
    setEditId(null);
    setFormData(EMPTY_FORM);
    setShowForm(true);
  };

  const openEditForm = (ad: AdBanner) => {
    setEditId(ad.id);
    setFormData({
      name: ad.name,
      imageUrl: ad.imageUrl,
      linkUrl: ad.linkUrl,
      position: ad.position,
    });
    setShowForm(true);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (editId) {
        // Update
        const res = await fetch("/api/ads", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editId, ...formData }),
        });
        if (!res.ok) throw new Error("Failed to update");
        showToast("Ad updated successfully!");
      } else {
        // Create
        const res = await fetch("/api/ads", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        if (!res.ok) throw new Error("Failed to create");
        showToast("Ad created successfully!");
      }

      setShowForm(false);
      setFormData(EMPTY_FORM);
      setEditId(null);
      await fetchAds();
    } catch {
      showToast("Failed to save ad", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (ad: AdBanner) => {
    try {
      const res = await fetch("/api/ads", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: ad.id, isActive: !ad.isActive }),
      });
      if (!res.ok) throw new Error();
      showToast(ad.isActive ? "Ad deactivated" : "Ad activated!");
      await fetchAds();
    } catch {
      showToast("Failed to update status", "error");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/ads?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      showToast("Ad deleted");
      setDeleteConfirm(null);
      await fetchAds();
    } catch {
      showToast("Failed to delete ad", "error");
    }
  };

  const positionStats = POSITIONS.map((p) => ({
    ...p,
    count: ads.filter((a) => a.position === p.value).length,
    active: ads.filter((a) => a.position === p.value && a.isActive).length,
  }));

  return (
    <div className={styles.page}>
      {/* Background */}
      <div className={styles.ambient} aria-hidden="true">
        <div className={styles.blob1} />
        <div className={styles.blob2} />
      </div>

      {/* Toast */}
      {toast && (
        <div
          className={`${styles.toast} ${toast.type === "error" ? styles.toastError : styles.toastSuccess}`}
          role="alert"
        >
          {toast.type === "success" ? "✓" : "✗"} {toast.msg}
        </div>
      )}

      {/* Delete Confirm Modal */}
      {deleteConfirm && (
        <div className={styles.modalOverlay}>
          <div className={`${styles.modal} glass`}>
            <div className={styles.modalIcon}>🗑️</div>
            <h3 className={styles.modalTitle}>Delete Ad?</h3>
            <p className={styles.modalDesc}>
              This action cannot be undone. The ad banner will be permanently
              removed.
            </p>
            <div className={styles.modalActions}>
              <button
                className="btn btn-secondary"
                onClick={() => setDeleteConfirm(null)}
              >
                Cancel
              </button>
              <button
                id="confirm-delete-btn"
                className="btn btn-danger"
                onClick={() => handleDelete(deleteConfirm)}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <div className={styles.logoMark}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
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
            <div className={styles.sidebarTitle}>CamCheck</div>
            <div className={styles.sidebarRole}>Admin Panel</div>
          </div>
        </div>

        <nav className={styles.nav}>
          <Link href="/admin" className={`${styles.navItem} ${styles.navItemActive}`}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
              <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
            </svg>
            Ad Banners
          </Link>
          <Link href="/" className={styles.navItem} target="_blank">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15,3 21,3 21,9"/>
              <line x1="10" y1="14" x2="21" y2="3"/>
            </svg>
            View Site
          </Link>
        </nav>

        <div className={styles.sidebarFooter}>
          <button id="logout-btn" className="btn btn-secondary btn-sm" style={{width:"100%"}} onClick={handleLogout}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/>
            </svg>
            Logout
          </button>
        </div>
      </aside>

      {/* Mobile Header - visible when sidebar is hidden */}
      <div className={styles.mobileHeader}>
        <div className={styles.mobileHeaderLeft}>
          <div className={styles.logoMark}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path
                d="M15 10l4.553-2.069A1 1 0 0121 8.87v6.26a1 1 0 01-1.447.9L15 14M3 8a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <span className={styles.mobileTitle}>CamCheck Admin</span>
        </div>
        <button className="btn btn-secondary btn-sm" onClick={handleLogout}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/>
          </svg>
          Logout
        </button>
      </div>

      {/* Main */}
      <main className={styles.main}>
        {/* Header */}
        <div className={styles.pageHeader}>
          <div>
            <h1 className={styles.pageTitle}>Ad Banner Management</h1>
            <p className={styles.pageSubtitle}>
              Manage ad banners displayed on the CamCheck website
            </p>
          </div>
          <button
            id="create-ad-btn"
            className="btn btn-primary"
            onClick={openCreateForm}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 5v14M5 12h14"/>
            </svg>
            New Ad Banner
          </button>
        </div>

        {/* Stats row */}
        <div className={styles.statsRow}>
          <div className={`${styles.statCard} glass`}>
            <div className={styles.statNum}>{ads.length}</div>
            <div className={styles.statLbl}>Total Banners</div>
          </div>
          <div className={`${styles.statCard} glass`}>
            <div className={styles.statNum} style={{color: "var(--success)"}}>
              {ads.filter((a) => a.isActive).length}
            </div>
            <div className={styles.statLbl}>Active</div>
          </div>
          <div className={`${styles.statCard} glass`}>
            <div className={styles.statNum} style={{color: "var(--error)"}}>
              {ads.filter((a) => !a.isActive).length}
            </div>
            <div className={styles.statLbl}>Inactive</div>
          </div>
          <div className={`${styles.statCard} glass`}>
            <div className={styles.statNum}>{POSITIONS.length}</div>
            <div className={styles.statLbl}>Positions</div>
          </div>
        </div>

        {/* Position overview */}
        <div className={styles.positionGrid}>
          {positionStats.map((p) => (
            <div key={p.value} className={`${styles.positionCard} glass`}>
              <div className={styles.positionIcon}>{p.icon}</div>
              <div className={styles.positionInfo}>
                <div className={styles.positionLabel}>{p.label}</div>
                <div className={styles.positionCount}>
                  <span style={{color: "var(--success)"}}>{p.active} active</span>
                  {" / "}{p.count} total
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Create / Edit Form */}
        {showForm && (
          <div className={`${styles.formCard} glass animate-fade-in`}>
            <div className={styles.formHeader}>
              <h2 className={styles.formTitle}>
                {editId ? "Edit Ad Banner" : "Create New Ad Banner"}
              </h2>
              <button
                className={styles.closeBtn}
                onClick={() => { setShowForm(false); setFormData(EMPTY_FORM); setEditId(null); }}
                aria-label="Close form"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12"/>
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.formGrid}>
                <div className={styles.field}>
                  <label htmlFor="ad-name">Ad Name *</label>
                  <input
                    id="ad-name"
                    type="text"
                    className="input"
                    value={formData.name}
                    onChange={(e) => setFormData((f) => ({ ...f, name: e.target.value }))}
                    placeholder="e.g. Google Ads Top Banner"
                    required
                  />
                </div>

                <div className={styles.field}>
                  <label htmlFor="ad-position">Position *</label>
                  <select
                    id="ad-position"
                    className="input"
                    value={formData.position}
                    onChange={(e) =>
                      setFormData((f) => ({ ...f, position: e.target.value as AdPosition }))
                    }
                    required
                  >
                    {POSITIONS.map((p) => (
                      <option key={p.value} value={p.value}>
                        {p.icon} {p.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className={`${styles.field} ${styles.fieldFull}`}>
                  <label htmlFor="ad-image-url">Banner Image URL *</label>
                  <input
                    id="ad-image-url"
                    type="url"
                    className="input"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData((f) => ({ ...f, imageUrl: e.target.value }))}
                    placeholder="https://example.com/banner.jpg"
                    required
                  />
                  {formData.imageUrl && (
                    <div className={styles.imagePreview}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={formData.imageUrl}
                        alt="Preview"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                        style={{ maxHeight: 80, borderRadius: 8, border: "1px solid var(--border)" }}
                      />
                    </div>
                  )}
                </div>

                <div className={`${styles.field} ${styles.fieldFull}`}>
                  <label htmlFor="ad-link-url">Destination URL *</label>
                  <input
                    id="ad-link-url"
                    type="url"
                    className="input"
                    value={formData.linkUrl}
                    onChange={(e) => setFormData((f) => ({ ...f, linkUrl: e.target.value }))}
                    placeholder="https://advertiser.com"
                    required
                  />
                </div>
              </div>

              <div className={styles.formActions}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => { setShowForm(false); setFormData(EMPTY_FORM); setEditId(null); }}
                >
                  Cancel
                </button>
                <button
                  id="save-ad-btn"
                  type="submit"
                  className="btn btn-primary"
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <span className={styles.btnSpinner} />
                      Saving...
                    </>
                  ) : (
                    <>{editId ? "Update Banner" : "Create Banner"}</>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Ads Table */}
        <div className={`${styles.tableCard} glass`}>
          <div className={styles.tableHeader}>
            <h2 className={styles.tableTitle}>All Banners</h2>
            {ads.length > 0 && (
              <span className={styles.tableCount}>{ads.length} total</span>
            )}
          </div>

          {loading ? (
            <div className={styles.loadingState}>
              <div className={styles.spinner} />
              <span>Loading banners...</span>
            </div>
          ) : ads.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>📢</div>
              <h3>No ad banners yet</h3>
              <p>Click &quot;New Ad Banner&quot; to create your first ad</p>
              <button className="btn btn-primary btn-sm" onClick={openCreateForm}>
                Create Banner
              </button>
            </div>
          ) : (
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Banner</th>
                    <th>Name</th>
                    <th>Position</th>
                    <th>Status</th>
                    <th>Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {ads.map((ad) => {
                    const pos = POSITIONS.find((p) => p.value === ad.position);
                    return (
                      <tr key={ad.id} className={styles.tableRow}>
                        <td>
                          <div className={styles.adThumb}>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={ad.imageUrl}
                              alt={ad.name}
                              onError={(e) => {
                                (e.target as HTMLImageElement).src =
                                  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='40'%3E%3Crect width='60' height='40' fill='%231a1f30'/%3E%3Ctext x='50%25' y='50%25' fill='%238b9ab5' font-size='10' text-anchor='middle' dy='.35em'%3ENo img%3C/text%3E%3C/svg%3E";
                              }}
                            />
                          </div>
                        </td>
                        <td>
                          <div className={styles.adName}>{ad.name}</div>
                          <div className={styles.adLink}>{ad.linkUrl}</div>
                        </td>
                        <td>
                          <span className={styles.posBadge}>
                            {pos?.icon} {pos?.label}
                          </span>
                        </td>
                        <td>
                          <span className={`tag ${ad.isActive ? "tag-active" : "tag-inactive"}`}>
                            {ad.isActive ? "● Active" : "○ Inactive"}
                          </span>
                        </td>
                        <td className={styles.dateTd}>
                          {new Date(ad.createdAt).toLocaleDateString("en-US", {
                            month: "short", day: "numeric", year: "numeric"
                          })}
                        </td>
                        <td>
                          <div className={styles.actions}>
                            <button
                              className="btn btn-secondary btn-sm"
                              onClick={() => openEditForm(ad)}
                              title="Edit"
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                                <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                              </svg>
                              Edit
                            </button>
                            <button
                              className={`btn btn-sm ${ad.isActive ? "btn-secondary" : "btn-success"}`}
                              onClick={() => handleToggleActive(ad)}
                              title={ad.isActive ? "Deactivate" : "Activate"}
                            >
                              {ad.isActive ? (
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <rect x="6" y="6" width="12" height="12" rx="1"/>
                                </svg>
                              ) : (
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                                  <path d="M8 5v14l11-7z"/>
                                </svg>
                              )}
                              {ad.isActive ? "Deactivate" : "Activate"}
                            </button>
                            <button
                              className="btn btn-danger btn-sm"
                              onClick={() => setDeleteConfirm(ad.id)}
                              title="Delete"
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="3,6 5,6 21,6"/><path d="M19 6l-1 14H6L5 6"/>
                                <path d="M10 11v6M14 11v6M9 6V4h6v2"/>
                              </svg>
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Help */}
        <div className={`${styles.helpCard} glass`}>
          <h3 className={styles.helpTitle}>💡 How to Add Ads</h3>
          <div className={styles.helpGrid}>
            <div className={styles.helpItem}>
              <strong>1. Get Image URL</strong>
              <p>Upload your banner image to any hosting (e.g. Imgur, Cloudinary) and copy the direct image URL.</p>
            </div>
            <div className={styles.helpItem}>
              <strong>2. Choose Position</strong>
              <p>Top/Bottom banners are horizontal (728×90px recommended). Sidebars are vertical (160×600px).</p>
            </div>
            <div className={styles.helpItem}>
              <strong>3. Set Destination</strong>
              <p>Enter the URL where users will be sent when they click the ad banner.</p>
            </div>
            <div className={styles.helpItem}>
              <strong>4. Activate</strong>
              <p>New banners are active by default. You can toggle them on/off anytime without deleting.</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
