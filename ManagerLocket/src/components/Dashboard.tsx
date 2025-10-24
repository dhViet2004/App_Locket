import React, { useEffect, useMemo, useState } from "react";
import "./Dashboard.css";
import UserManagement from "./UserManagement";

/** ===== Types ===== */
type StatKey = "users" | "activeToday" | "photosToday" | "adsActive";
type Stats = Record<StatKey, number>;

type AdPlacement = "home_widget" | "feed" | "onboarding";
type AdStatus = "active" | "paused";

type Frequency = {
  /** Số lần 1 người thấy trong 1 ngày (cap) */
  perUserPerDay: number; // 0 = không giới hạn
  /** Số phút tối thiểu giữa 2 lần hiển thị (cooldown) */
  minIntervalMinutes: number; // 0 = không giới hạn
  /** Tối đa hiển thị trong 1 session/app open */
  perSession: number; // 0 = không giới hạn
};

type Ad = {
  id: string;
  name: string;
  imageUrl: string;
  targetUrl: string;
  placement: AdPlacement;
  status: AdStatus;
  startAt?: string; // ISO
  endAt?: string;   // ISO
  frequency: Frequency;
  createdAt: string; // ISO
  impressionsToday?: number;
  clicksToday?: number;
};

/** ===== Utils ===== */
const formatNumber = (n: number) =>
  Intl.NumberFormat("en-US", { notation: n > 9999 ? "compact" : "standard" }).format(n);

const nowISO = () => new Date().toISOString();

const emptyFrequency: Frequency = {
  perUserPerDay: 3,
  minIntervalMinutes: 30,
  perSession: 1,
};

const defaultAd = (): Ad => ({
  id: cryptoRandomId(),
  name: "",
  imageUrl: "",
  targetUrl: "",
  placement: "feed",
  status: "active",
  startAt: nowISO(),
  endAt: undefined,
  frequency: { ...emptyFrequency },
  createdAt: nowISO(),
  impressionsToday: 0,
  clicksToday: 0,
});

function cryptoRandomId() {
  // nhỏ gọn cho demo
  return "ad_" + Math.random().toString(36).slice(2, 9);
}

/** ===== Local persistence (demo) ===== */
const LS_KEY = "locket_admin_ads";

function loadAds(): Ad[] {
  try {
    const s = localStorage.getItem(LS_KEY);
    if (!s) return [];
    const data: Ad[] = JSON.parse(s);
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

function saveAds(ads: Ad[]) {
  localStorage.setItem(LS_KEY, JSON.stringify(ads));
}

/** ===== Component ===== */
export default function Dashboard() {
  // --- Navigation state ---
  const [currentView, setCurrentView] = useState<'dashboard' | 'users'>('dashboard');
  
  // --- Stats demo (giữ lại phần KPI cho tổng quan) ---
  const [stats, setStats] = useState<Stats>({
    users: 182340,
    activeToday: 25120,
    photosToday: 98432,
    adsActive: 0,
  });

  // --- Ads state ---
  const [ads, setAds] = useState<Ad[]>([]);
  const [form, setForm] = useState<Ad>(defaultAd());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [filter, setFilter] = useState<{ status: "all" | AdStatus; placement: "all" | AdPlacement }>({
    status: "all",
    placement: "all",
  });

  useEffect(() => {
    const initial = loadAds();
    setAds(initial);
  }, []);

  useEffect(() => {
    saveAds(ads);
    setStats((s) => ({ ...s, adsActive: ads.filter((a) => a.status === "active").length }));
  }, [ads]);

  // --- Derived metrics ---
  const avgCap = useMemo(() => {
    if (!ads.length) return 0;
    const caps = ads.map((a) => a.frequency.perUserPerDay || 0);
    const sum = caps.reduce((x, y) => x + y, 0);
    return Math.round(sum / ads.length);
  }, [ads]);

  const filteredAds = useMemo(() => {
    return ads.filter((a) => {
      const okStatus = filter.status === "all" ? true : a.status === filter.status;
      const okPlacement = filter.placement === "all" ? true : a.placement === filter.placement;
      return okStatus && okPlacement;
    });
  }, [ads, filter]);

  /** ---- CRUD & actions ---- */
  const resetForm = () => {
    setForm(defaultAd());
    setErrors({});
  };

  const validate = (draft: Ad) => {
    const e: Record<string, string> = {};
    if (!draft.name.trim()) e.name = "Tên quảng cáo không được để trống.";
    if (!/^https?:\/\//i.test(draft.imageUrl.trim())) e.imageUrl = "Image URL phải bắt đầu bằng http/https.";
    if (!/^https?:\/\//i.test(draft.targetUrl.trim())) e.targetUrl = "Target URL phải bắt đầu bằng http/https.";
    if (draft.frequency.perUserPerDay < 0) e.perUserPerDay = "Không nhỏ hơn 0.";
    if (draft.frequency.minIntervalMinutes < 0) e.minIntervalMinutes = "Không nhỏ hơn 0.";
    if (draft.frequency.perSession < 0) e.perSession = "Không nhỏ hơn 0.";
    if (draft.endAt && new Date(draft.endAt) < new Date(draft.startAt || nowISO())) {
      e.endAt = "Ngày kết thúc phải sau ngày bắt đầu.";
    }
    return e;
  };

  const handleCreate = (ev: React.FormEvent) => {
    ev.preventDefault();
    const e = validate(form);
    setErrors(e);
    if (Object.keys(e).length) return;
    setAds((a) => [
      { ...form, id: cryptoRandomId(), createdAt: nowISO(), impressionsToday: 0, clicksToday: 0 },
      ...a,
    ]);
    resetForm();
  };

  const handleDelete = (id: string) => {
    if (!confirm("Xóa quảng cáo này?")) return;
    setAds((a) => a.filter((x) => x.id !== id));
  };

  const handleToggle = (id: string) => {
    setAds((a) =>
      a.map((x) => (x.id === id ? { ...x, status: x.status === "active" ? "paused" : "active" } : x))
    );
  };

  const handleFreqChange = (id: string, freq: Partial<Frequency>) => {
    setAds((a) =>
      a.map((x) => (x.id === id ? { ...x, frequency: { ...x.frequency, ...freq } } : x))
    );
  };

  const handleQuickSimulate = (id: string) => {
    // Demo: tăng impression & click ngẫu nhiên để thấy số liệu đổi
    setAds((a) =>
      a.map((x) =>
        x.id === id
          ? {
              ...x,
              impressionsToday: (x.impressionsToday || 0) + Math.floor(Math.random() * 50 + 10),
              clicksToday: (x.clicksToday || 0) + Math.floor(Math.random() * 5),
            }
          : x
      )
    );
  };

  /** ---- Render ---- */
  if (currentView === 'users') {
    return <UserManagement onBack={() => setCurrentView('dashboard')} />;
  }

  return (
    <div className="dash">
      <header className="dash__topbar">
        <div className="dash__title">
          <span className="dot" />
          Locket Admin — Dashboard
        </div>
        <div className="dash__actions">
          <button className="btn btn--ghost" onClick={() => (localStorage.removeItem(LS_KEY), setAds([]))}>
            Xóa dữ liệu demo
          </button>
        </div>
      </header>

      {/* KPI (giữ 4 ô, thay ô cuối thành Ads Active) */}
      <section className="grid stats">
        <div onClick={() => setCurrentView('users')} style={{ cursor: 'pointer' }}>
          <StatCard label="Tổng người dùng" value={formatNumber(stats.users)} hint="+2.4% tuần này" />
        </div>
        <StatCard label="Đang hoạt động (h.nay)" value={formatNumber(stats.activeToday)} hint="ARPU ↑ nhẹ" />
        <StatCard label="Ảnh gửi hôm nay" value={formatNumber(stats.photosToday)} hint="Tỷ lệ lỗi 0.3%" />
        <StatCard label="Ads đang chạy" value={formatNumber(stats.adsActive)} hint={`Cap TB: ${avgCap}/user/ngày`} />
      </section>

      {/* MAIN: Form tạo quảng cáo + Bảng quản lý */}
      <section className="grid main single">
        {/* CREATE FORM */}
        <div className="card">
          <div className="card__header">
            <h3>Thêm quảng cáo mới</h3>
          </div>
          <form className="form" onSubmit={handleCreate}>
            <div className="form__row">
              <label>Tên quảng cáo *</label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="VD: Back-to-school Promo"
              />
              {errors.name && <div className="err">{errors.name}</div>}
            </div>

            <div className="form__grid-2">
              <div className="form__row">
                <label>Image URL *</label>
                <input
                  value={form.imageUrl}
                  onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                  placeholder="https://cdn.example.com/banner.png"
                />
                {errors.imageUrl && <div className="err">{errors.imageUrl}</div>}
              </div>
              <div className="form__row">
                <label>Target URL *</label>
                <input
                  value={form.targetUrl}
                  onChange={(e) => setForm({ ...form, targetUrl: e.target.value })}
                  placeholder="https://example.com/landing"
                />
                {errors.targetUrl && <div className="err">{errors.targetUrl}</div>}
              </div>
            </div>

            <div className="form__grid-3">
              <div className="form__row">
                <label>Vị trí hiển thị</label>
                <select
                  value={form.placement}
                  onChange={(e) => setForm({ ...form, placement: e.target.value as AdPlacement })}
                >
                  <option value="feed">Feed</option>
                  <option value="home_widget">Home Widget</option>
                  <option value="onboarding">Onboarding</option>
                </select>
              </div>
              <div className="form__row">
                <label>Trạng thái</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value as AdStatus })}
                >
                  <option value="active">Active</option>
                  <option value="paused">Paused</option>
                </select>
              </div>
              <div className="form__row">
                <label>Bắt đầu</label>
                <input
                  type="datetime-local"
                  value={toLocalInputValue(form.startAt)}
                  onChange={(e) => setForm({ ...form, startAt: fromLocalInputValue(e.target.value) })}
                />
              </div>
            </div>

            <div className="form__grid-3">
              <div className="form__row">
                <label>Kết thúc</label>
                <input
                  type="datetime-local"
                  value={toLocalInputValue(form.endAt)}
                  onChange={(e) => setForm({ ...form, endAt: fromLocalInputValue(e.target.value) })}
                />
                {errors.endAt && <div className="err">{errors.endAt}</div>}
              </div>

              <div className="form__row">
                <label>Cap mỗi user/ngày</label>
                <input
                  type="number"
                  min={0}
                  value={form.frequency.perUserPerDay}
                  onChange={(e) =>
                    setForm({ ...form, frequency: { ...form.frequency, perUserPerDay: +e.target.value } })
                  }
                />
                <div className="hint">0 = không giới hạn</div>
                {errors.perUserPerDay && <div className="err">{errors.perUserPerDay}</div>}
              </div>

              <div className="form__row">
                <label>Cooldown (phút)</label>
                <input
                  type="range"
                  min={0}
                  max={180}
                  step={5}
                  value={form.frequency.minIntervalMinutes}
                  onChange={(e) =>
                    setForm({ ...form, frequency: { ...form.frequency, minIntervalMinutes: +e.target.value } })
                  }
                />
                <div className="hint">
                  {form.frequency.minIntervalMinutes} phút giữa 2 lần hiển thị
                </div>
                {errors.minIntervalMinutes && <div className="err">{errors.minIntervalMinutes}</div>}
              </div>
            </div>

            <div className="form__grid-3">
              <div className="form__row">
                <label>Tối đa mỗi session</label>
                <input
                  type="number"
                  min={0}
                  value={form.frequency.perSession}
                  onChange={(e) =>
                    setForm({ ...form, frequency: { ...form.frequency, perSession: +e.target.value } })
                  }
                />
                <div className="hint">0 = không giới hạn</div>
                {errors.perSession && <div className="err">{errors.perSession}</div>}
              </div>

              <div className="form__row form__preview">
                <label>Xem nhanh</label>
                {form.imageUrl ? (
                  <img src={form.imageUrl} alt="preview" className="ad-preview" />
                ) : (
                  <div className="ad-preview ad-preview--placeholder">Ảnh sẽ hiện ở đây</div>
                )}
              </div>

              <div className="form__row align-end">
                <button className="btn btn--primary" type="submit">
                  Tạo quảng cáo
                </button>
                <button className="btn btn--ghost" type="button" onClick={resetForm} style={{ marginLeft: 8 }}>
                  Xóa form
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* LIST + INLINE FREQUENCY */}
        <div className="card">
          <div className="card__header">
            <h3>Danh sách quảng cáo</h3>
            <div className="filters">
              <select
                value={filter.status}
                onChange={(e) => setFilter((f) => ({ ...f, status: e.target.value as any }))}
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="active">Active</option>
                <option value="paused">Paused</option>
              </select>
              <select
                value={filter.placement}
                onChange={(e) => setFilter((f) => ({ ...f, placement: e.target.value as any }))}
              >
                <option value="all">Tất cả vị trí</option>
                <option value="feed">Feed</option>
                <option value="home_widget">Home Widget</option>
                <option value="onboarding">Onboarding</option>
              </select>
            </div>
          </div>

          <div className="table table--ads">
            <div className="table__row table__row--head">
              <div>Tên</div>
              <div>Vị trí</div>
              <div>Trạng thái</div>
              <div>Cap /user/ngày</div>
              <div>Cooldown (phút)</div>
              <div>/session</div>
              <div>Impr / Click (h.nay)</div>
              <div>Hành động</div>
            </div>

            {filteredAds.map((ad) => (
              <div className="table__row table__row--ad" key={ad.id}>
                <div className="ad__main">
                  <img src={ad.imageUrl} alt="" className="ad__thumb" />
                  <div className="ad__meta">
                    <div className="ad__title">{ad.name}</div>
                    <a className="ad__link" href={ad.targetUrl} target="_blank" rel="noreferrer">
                      {ad.targetUrl}
                    </a>
                    <div className="ad__dates">
                      {ad.startAt ? `Bắt đầu: ${fmtDate(ad.startAt)}` : "—"}{" "}
                      {ad.endAt ? ` • Kết thúc: ${fmtDate(ad.endAt)}` : ""}
                    </div>
                  </div>
                </div>

                <div className="ellipsis">{prettyPlacement(ad.placement)}</div>

                <div>
                  <span className={`pill pill--${ad.status === "active" ? "ok" : "other"}`}>{ad.status}</span>
                </div>

                <div className="freq-input">
                  <input
                    type="number"
                    min={0}
                    value={ad.frequency.perUserPerDay}
                    onChange={(e) => handleFreqChange(ad.id, { perUserPerDay: +e.target.value })}
                  />
                </div>

                <div className="freq-input">
                  <input
                    type="range"
                    min={0}
                    max={180}
                    step={5}
                    value={ad.frequency.minIntervalMinutes}
                    onChange={(e) => handleFreqChange(ad.id, { minIntervalMinutes: +e.target.value })}
                  />
                  <div className="hint tiny">{ad.frequency.minIntervalMinutes} phút</div>
                </div>

                <div className="freq-input">
                  <input
                    type="number"
                    min={0}
                    value={ad.frequency.perSession}
                    onChange={(e) => handleFreqChange(ad.id, { perSession: +e.target.value })}
                  />
                </div>

                <div>{(ad.impressionsToday ?? 0)} / {(ad.clicksToday ?? 0)}</div>

                <div className="row-actions">
                  <button className="btn btn--ghost small" onClick={() => handleQuickSimulate(ad.id)}>
                    Giả lập
                  </button>
                  <button className="btn small" onClick={() => handleToggle(ad.id)}>
                    {ad.status === "active" ? "Tạm dừng" : "Kích hoạt"}
                  </button>
                  <button className="btn small" onClick={() => handleDelete(ad.id)}>
                    Xóa
                  </button>
                </div>
              </div>
            ))}

            {filteredAds.length === 0 && (
              <div className="muted" style={{ padding: 12 }}>
                Chưa có quảng cáo nào. Hãy tạo ở form bên trên.
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

/** ===== Helpers & small components ===== */
function StatCard({
  label,
  value,
  hint,
  tone = "ok",
}: {
  label: string;
  value: string | number;
  hint?: string;
  tone?: "ok" | "warn";
}) {
  return (
    <div className={`card stat stat--${tone}`}>
      <div className="stat__label">{label}</div>
      <div className="stat__value">{value}</div>
      {hint && <div className="stat__hint">{hint}</div>}
    </div>
  );
}

function toLocalInputValue(iso?: string) {
  if (!iso) return "";
  const d = new Date(iso);
  const tz = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  return tz.toISOString().slice(0, 16);
}
function fromLocalInputValue(v: string) {
  if (!v) return undefined;
  const d = new Date(v);
  return d.toISOString();
}
function fmtDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString();
}
function prettyPlacement(p: AdPlacement) {
  switch (p) {
    case "feed":
      return "Feed";
    case "home_widget":
      return "Home Widget";
    case "onboarding":
      return "Onboarding";
    default:
      return p;
  }
}
