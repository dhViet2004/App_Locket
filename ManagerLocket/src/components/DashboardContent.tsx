import React, { useEffect, useMemo, useState } from "react";
import DatePicker from "./DatePicker";
import SelectDropdown from "./SelectDropdown";
import ImageUpload from "./ImageUpload";
import { adminAPI } from '../lib/api';

/** ===== Types ===== */
type StatKey = "users" | "activeToday" | "photosToday" | "adsActive";
type Stats = Record<StatKey, number>;

type AdPlacement = "home_widget" | "feed" | "onboarding";
type AdStatus = "active" | "paused";

type Frequency = {
  perUserPerDay: number;
  minIntervalMinutes: number;
  perSession: number;
};

type Ad = {
  id: string;
  name: string;
  imageUrl: string;
  targetUrl: string;
  placement: AdPlacement;
  status: AdStatus;
  startAt?: string;
  endAt?: string;
  frequency: Frequency;
  createdAt: string;
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
  return "ad_" + Math.random().toString(36).slice(2, 9);
}

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

function StatCard({
  label,
  value,
  hint,
  color = 'default',
}: {
  label: string;
  value: string | number;
  hint?: string;
  color?: 'blue' | 'green' | 'purple' | 'default';
}) {
  const colorConfig = {
    blue: {
      bg: 'bg-[#151A25]',
      border: 'border-blue-500/20',
      text: 'text-gray-400',
      value: 'text-blue-400',
      iconBg: 'bg-blue-500/10',
      shadow: 'shadow-blue-500/10',
    },
    green: {
      bg: 'bg-[#151A25]',
      border: 'border-green-500/20',
      text: 'text-gray-400',
      value: 'text-green-400',
      iconBg: 'bg-green-500/10',
      shadow: 'shadow-green-500/10',
    },
    purple: {
      bg: 'bg-[#151A25]',
      border: 'border-purple-500/20',
      text: 'text-gray-400',
      value: 'text-purple-400',
      iconBg: 'bg-purple-500/10',
      shadow: 'shadow-purple-500/10',
    },
    default: {
      bg: 'bg-[#151A25]',
      border: 'border-gray-700',
      text: 'text-gray-400',
      value: 'text-gray-300',
      iconBg: 'bg-gray-700',
      shadow: 'shadow-gray-700/10',
    },
  };

  const config = colorConfig[color];

  return (
    <div className={`${config.bg} ${config.border} rounded-2xl shadow-xl border p-6 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 relative overflow-hidden group`}>
      {/* Decorative gradient overlay */}
      <div className={`absolute top-0 right-0 w-32 h-32 ${config.iconBg} rounded-full blur-3xl opacity-50 group-hover:opacity-75 transition-opacity`}></div>
      
      <div className={`text-xs font-bold ${config.text} uppercase tracking-wider mb-3 relative z-10`}>{label}</div>
      <div className={`text-4xl font-bold ${config.value} mb-2 relative z-10`}>{value}</div>
      {hint && (
        <div className={`text-xs ${config.text} opacity-60 mt-2 relative z-10 flex items-center gap-1`}>
          <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
          {hint}
        </div>
      )}
    </div>
  );
}

export default function DashboardContent() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Stats>({
    users: 0,
    activeToday: 0,
    photosToday: 0,
    adsActive: 0,
  });
  const [pendingRefunds, setPendingRefunds] = useState(0);

  const [ads, setAds] = useState<Ad[]>([]);
  const [form, setForm] = useState<Ad>(defaultAd());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [filter, setFilter] = useState<{ status: "all" | AdStatus; placement: "all" | AdPlacement }>({
    status: "all",
    placement: "all",
  });

  // Load dashboard summary from API
  useEffect(() => {
    loadDashboardSummary();
  }, []);

  // Load ads from localStorage (demo data)
  useEffect(() => {
    const initial = loadAds();
    setAds(initial);
  }, []);

  useEffect(() => {
    saveAds(ads);
    setStats((s) => ({ ...s, adsActive: ads.filter((a) => a.status === "active").length }));
  }, [ads]);

  const loadDashboardSummary = async () => {
    setLoading(true);
    try {
      const response = await adminAPI.getDashboardSummary();
      if (response.data) {
        setStats({
          users: response.data.users?.total || 0,
          activeToday: response.data.users?.newLast7Days || 0,
          photosToday: response.data.posts?.last24h || 0,
          adsActive: response.data.ads?.active || 0,
        });
        setPendingRefunds(response.data.refunds?.pending || 0);
      }
    } catch (error) {
      console.error('Failed to load dashboard summary:', error);
      // Keep default values on error
    } finally {
      setLoading(false);
    }
  };

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

  return (
    <div className="w-full max-w-full flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white uppercase tracking-wider">Dashboard Overview</h1>
        <p className="text-sm text-gray-500 mt-1">System Statistics & Analytics</p>
      </div>

      {/* Row 1: KPI Stats Cards */}
      <section className="w-full max-w-full">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-[#151A25] rounded-2xl border border-gray-800/50 p-6 animate-pulse">
                <div className="h-4 w-24 bg-gray-700 rounded mb-4"></div>
                <div className="h-10 w-32 bg-gray-700 rounded mb-2"></div>
                <div className="h-3 w-20 bg-gray-700 rounded"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 w-full">
            <StatCard label="Total Users" value={formatNumber(stats.users)} hint="All registered users" color="blue" />
            <StatCard label="New Users (7d)" value={formatNumber(stats.activeToday)} hint="Last 7 days" color="green" />
            <StatCard label="Posts (24h)" value={formatNumber(stats.photosToday)} hint="Last 24 hours" color="purple" />
            <StatCard label="Pending Refunds" value={formatNumber(pendingRefunds)} hint="Awaiting review" color="orange" />
          </div>
        )}
      </section>

      {/* Row 2: Create Ad Form */}
      <section className="w-full max-w-full">
        <div className="bg-[#151A25] rounded-2xl shadow-xl border border-gray-800/50 p-6 w-full max-w-full">
        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <span className="w-1 h-6 bg-blue-500 rounded-full"></span>
          Create New Ad
        </h3>
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Ad Name *</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g., Back-to-school Promo"
              className="w-full px-4 py-3 bg-[#0B0E14] border border-gray-800 rounded-xl text-white focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all placeholder-gray-600"
            />
            {errors.name && <div className="text-sm text-red-400 mt-1">{errors.name}</div>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ImageUpload
              label="Hình ảnh quảng cáo *"
              value={form.imageUrl}
              onChange={(url) => setForm({ ...form, imageUrl: url })}
              onUrlChange={(url) => setForm({ ...form, imageUrl: url })}
              error={errors.imageUrl}
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Target URL *</label>
              <input
                type="url"
                value={form.targetUrl}
                onChange={(e) => setForm({ ...form, targetUrl: e.target.value })}
                placeholder="https://example.com/landing"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
              />
              {errors.targetUrl && <div className="text-sm text-red-600 mt-1">{errors.targetUrl}</div>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <SelectDropdown
              label="Vị trí hiển thị"
              value={form.placement}
              onChange={(value) => setForm({ ...form, placement: value as AdPlacement })}
              options={[
                { value: "feed", label: "Feed" },
                { value: "home_widget", label: "Home Widget" },
                { value: "onboarding", label: "Onboarding" },
              ]}
            />
            <SelectDropdown
              label="Trạng thái"
              value={form.status}
              onChange={(value) => setForm({ ...form, status: value as AdStatus })}
              options={[
                { value: "active", label: "Active" },
                { value: "paused", label: "Paused" },
              ]}
            />
            <DatePicker
              label="Bắt đầu"
              value={form.startAt}
              onChange={(value) => setForm({ ...form, startAt: value })}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <DatePicker
              label="Kết thúc"
              value={form.endAt}
              onChange={(value) => setForm({ ...form, endAt: value })}
              error={errors.endAt}
              min={form.startAt}
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Cap mỗi user/ngày</label>
              <input
                type="number"
                min={0}
                value={form.frequency.perUserPerDay}
                onChange={(e) =>
                  setForm({ ...form, frequency: { ...form.frequency, perUserPerDay: +e.target.value } })
                }
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
              />
              <div className="text-xs text-gray-500 mt-1">0 = không giới hạn</div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cooldown (phút)</label>
              <input
                type="range"
                min={0}
                max={180}
                step={5}
                value={form.frequency.minIntervalMinutes}
                onChange={(e) =>
                  setForm({ ...form, frequency: { ...form.frequency, minIntervalMinutes: +e.target.value } })
                }
                className="w-full"
              />
              <div className="text-xs text-gray-500 mt-1">{form.frequency.minIntervalMinutes} phút giữa 2 lần hiển thị</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tối đa mỗi session</label>
              <input
                type="number"
                min={0}
                value={form.frequency.perSession}
                onChange={(e) =>
                  setForm({ ...form, frequency: { ...form.frequency, perSession: +e.target.value } })
                }
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
              />
              <div className="text-xs text-gray-500 mt-1">0 = không giới hạn</div>
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                className="w-full px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all duration-200 font-medium shadow-md hover:shadow-lg"
              >
                Tạo quảng cáo
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="ml-2 px-6 py-3 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Xóa form
              </button>
            </div>
          </div>
        </form>
        </div>
      </section>

      {/* Row 3: Ads List Table */}
      <section className="w-full max-w-full">
        <div className="bg-white rounded-xl shadow-lg border border-gray-200/50 p-6 w-full max-w-full backdrop-blur-sm">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <span className="w-1 h-6 bg-gradient-to-b from-indigo-500 to-purple-600 rounded-full"></span>
            Danh sách quảng cáo
          </h3>
          <div className="flex gap-2">
            <select
              value={filter.status}
              onChange={(e) => setFilter((f) => ({ ...f, status: e.target.value as any }))}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="active">Active</option>
              <option value="paused">Paused</option>
            </select>
            <select
              value={filter.placement}
              onChange={(e) => setFilter((f) => ({ ...f, placement: e.target.value as any }))}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value="all">Tất cả vị trí</option>
              <option value="feed">Feed</option>
              <option value="home_widget">Home Widget</option>
              <option value="onboarding">Onboarding</option>
            </select>
          </div>
        </div>

        {/* Card Grid Layout */}
        {filteredAds.length === 0 ? (
          <div className="bg-gradient-to-br from-white via-indigo-50/30 to-purple-50/30 rounded-3xl shadow-xl border border-indigo-100/50 p-16 text-center backdrop-blur-sm relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-100/20 to-purple-100/20 opacity-50"></div>
            <div className="relative z-10">
              <div className="w-24 h-24 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <svg className="w-12 h-12 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Chưa có quảng cáo nào</h3>
              <p className="text-gray-600 text-lg mb-6">Hãy tạo quảng cáo mới ở form bên trên.</p>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg text-sm font-medium">
                Tạo quảng cáo đầu tiên của bạn
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAds.map((ad, index) => (
              <div
                key={ad.id}
                className="group bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-6 hover:shadow-2xl hover:-translate-y-2 hover:scale-[1.02] transition-all duration-500 relative overflow-hidden"
                style={{ 
                  animationDelay: `${index * 50}ms`,
                  animation: 'fadeInUp 0.5s ease-out forwards'
                }}
              >
                {/* Decorative gradient overlay */}
                <div className={`absolute top-0 right-0 w-40 h-40 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${
                  ad.status === "active" 
                    ? 'bg-gradient-to-br from-green-200/30 via-emerald-200/30 to-teal-200/30' 
                    : 'bg-gradient-to-br from-gray-200/30 via-slate-200/30 to-zinc-200/30'
                }`}></div>
                <div className={`absolute bottom-0 left-0 w-32 h-32 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${
                  ad.status === "active" 
                    ? 'bg-gradient-to-tr from-green-200/20 to-emerald-200/20' 
                    : 'bg-gradient-to-tr from-gray-200/20 to-slate-200/20'
                }`}></div>
                
                {/* Shine effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                
                {/* Content */}
                <div className="relative z-10">
                  {/* Ad Image & Name */}
                  <div className="mb-4">
                    <div className="relative rounded-2xl overflow-hidden mb-3 border-2 border-gray-200 group-hover:border-indigo-300 transition-colors duration-300 shadow-md">
                      <img 
                        src={ad.imageUrl} 
                        alt={ad.name} 
                        className="w-full h-36 object-cover group-hover:scale-110 transition-transform duration-500" 
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent"></div>
                      <div className="absolute top-2 right-2">
                        <span className={`px-3 py-1.5 rounded-lg text-xs font-bold backdrop-blur-sm ${
                          ad.status === "active" 
                            ? "bg-green-500/90 text-white shadow-lg" 
                            : "bg-gray-500/90 text-white shadow-lg"
                        }`}>
                          {ad.status}
                        </span>
                      </div>
                    </div>
                    <h3 className="font-bold text-gray-900 text-lg mb-1 group-hover:text-indigo-600 transition-colors">{ad.name}</h3>
                    <p className="text-xs text-gray-500 truncate">{ad.targetUrl}</p>
                  </div>

                  {/* Placement & Status */}
                  <div className="flex items-center gap-2 mb-4">
                    <span className="px-4 py-2 bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700 text-xs font-bold rounded-xl border border-indigo-100 group-hover:from-indigo-100 group-hover:to-purple-100 transition-all duration-300">
                      {prettyPlacement(ad.placement)}
                    </span>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="p-3 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                      <p className="text-xs text-gray-600 mb-1">Cap/ngày</p>
                      <input
                        type="number"
                        min={0}
                        value={ad.frequency.perUserPerDay}
                        onChange={(e) => handleFreqChange(ad.id, { perUserPerDay: +e.target.value })}
                        className="w-full px-2 py-1 text-sm font-semibold text-gray-900 bg-transparent border-0 focus:ring-0 p-0"
                      />
                    </div>
                    <div className="p-3 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-100">
                      <p className="text-xs text-gray-600 mb-1">Cooldown</p>
                      <p className="text-sm font-semibold text-gray-900">{ad.frequency.minIntervalMinutes} phút</p>
                      <input
                        type="range"
                        min={0}
                        max={180}
                        step={5}
                        value={ad.frequency.minIntervalMinutes}
                        onChange={(e) => handleFreqChange(ad.id, { minIntervalMinutes: +e.target.value })}
                        className="w-full mt-1"
                      />
                    </div>
                    <div className="p-3 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-100">
                      <p className="text-xs text-gray-600 mb-1">/session</p>
                      <input
                        type="number"
                        min={0}
                        value={ad.frequency.perSession}
                        onChange={(e) => handleFreqChange(ad.id, { perSession: +e.target.value })}
                        className="w-full px-2 py-1 text-sm font-semibold text-gray-900 bg-transparent border-0 focus:ring-0 p-0"
                      />
                    </div>
                    <div className="p-3 bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl border border-orange-100">
                      <p className="text-xs text-gray-600 mb-1">Impr/Click</p>
                      <p className="text-sm font-semibold text-gray-900">
                        {(ad.impressionsToday ?? 0)} / {(ad.clicksToday ?? 0)}
                      </p>
                    </div>
                  </div>

                  {/* Dates */}
                  {(ad.startAt || ad.endAt) && (
                    <div className="mb-4 p-3 bg-gray-50 rounded-xl text-xs text-gray-600">
                      {ad.startAt && <div>Bắt đầu: {fmtDate(ad.startAt)}</div>}
                      {ad.endAt && <div>Kết thúc: {fmtDate(ad.endAt)}</div>}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 pt-3 border-t border-gray-100">
                    <button
                      onClick={() => handleQuickSimulate(ad.id)}
                      className="flex-1 px-3 py-2.5 text-xs font-bold border-2 border-gray-300 rounded-xl hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 hover:border-gray-400 transition-all duration-300 shadow-sm hover:shadow-lg hover:scale-105"
                    >
                      Giả lập
                    </button>
                    <button
                      onClick={() => handleToggle(ad.id)}
                      className={`flex-1 px-3 py-2.5 text-xs font-bold rounded-xl transition-all duration-300 shadow-sm hover:shadow-lg hover:scale-105 ${
                        ad.status === "active"
                          ? "bg-gradient-to-r from-yellow-50 to-amber-50 text-yellow-700 border-2 border-yellow-200 hover:from-yellow-100 hover:to-amber-100"
                          : "bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 border-2 border-green-200 hover:from-green-100 hover:to-emerald-100"
                      }`}
                    >
                      {ad.status === "active" ? "Tạm dừng" : "Kích hoạt"}
                    </button>
                    <button
                      onClick={() => handleDelete(ad.id)}
                      className="px-3 py-2.5 text-xs font-bold bg-gradient-to-r from-red-50 to-rose-50 text-red-700 border-2 border-red-200 rounded-xl hover:from-red-100 hover:to-rose-100 transition-all duration-300 shadow-sm hover:shadow-lg hover:scale-105"
                    >
                      Xóa
                    </button>
                  </div>
                </div>

                {/* Hover border effect */}
                <div className={`absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-opacity-50 group-hover:shadow-[0_0_30px_rgba(99,102,241,0.3)] transition-all duration-500 pointer-events-none ${
                  ad.status === "active" ? 'group-hover:border-green-300' : 'group-hover:border-gray-300'
                }`}></div>
              </div>
            ))}
          </div>
        )}
        </div>
      </section>
    </div>
  );
}

