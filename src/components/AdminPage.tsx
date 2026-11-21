import { useState, useEffect, type FormEvent } from 'react';
import { Lock, KeyRound, ShieldCheck, CheckCircle2, AlertCircle, LogOut, RefreshCw, Send, FileJson, Inbox } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { APPLE_EASE } from './MotionPrimitives.tsx';
import type { Language, LocalizedPortfolioData } from '../data/portfolioData.ts';

interface AdminPageProps {
  onLogout?: () => void;
}

async function readJsonResponse<T>(response: Response): Promise<T> {
  const text = await response.text();
  if (!text.trim()) throw new Error(`Server mengembalikan respons kosong (HTTP ${response.status}). Pastikan backend terbaru sedang berjalan.`);
  try { return JSON.parse(text) as T; }
  catch { throw new Error(`Respons server bukan JSON valid (HTTP ${response.status}). Periksa log backend.`); }
}

interface ContactMessageRecord {
  id: string;
  submittedAt: string;
  name: string;
  email: string;
  purpose: string;
  subject: string;
  message: string;
  status: 'unread' | 'read' | 'archived';
}

type AdminTab = 'portfolio' | 'messages';
type PortfolioCollection = 'profile' | 'experiences' | 'certificates' | 'projects' | 'skills' | 'copy' | 'seo';
const COLLECTIONS: Array<{ key: PortfolioCollection; label: string; tab: string }> = [
  { key: 'profile', label: 'Profil', tab: 'Profile' }, { key: 'experiences', label: 'Pengalaman', tab: 'Experiences' },
  { key: 'certificates', label: 'Sertifikat', tab: 'Certificates' }, { key: 'projects', label: 'Proyek', tab: 'Projects' },
  { key: 'skills', label: 'Keahlian', tab: 'Skills' }, { key: 'copy', label: 'Teks Antarmuka', tab: 'Copy' }, { key: 'seo', label: 'SEO', tab: 'SEO' }
];

export default function AdminPage({ onLogout }: AdminPageProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [csrfToken, setCsrfToken] = useState<string>('');
  const [activeTab, setActiveTab] = useState<AdminTab>('portfolio');

  // Login form state
  const [password, setPassword] = useState('');
  const [totp, setTotp] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Portfolio data state
  const [isFetchingData, setIsFetchingData] = useState(false);
  const [isSavingData, setIsSavingData] = useState(false);
  const [saveStatus, setSaveStatus] = useState<{ ok: boolean; message: string } | null>(null);
  const [portfolioData, setPortfolioData] = useState<Record<Language, LocalizedPortfolioData & { seo?: Record<string, unknown> }> | null>(null);
  const [selectedLocale, setSelectedLocale] = useState<Language>('id');
  const [selectedCollection, setSelectedCollection] = useState<PortfolioCollection>('profile');
  const [selectedItemId, setSelectedItemId] = useState('profile');
  const [itemDraft, setItemDraft] = useState('{}');

  // Messages state
  const [messages, setMessages] = useState<ContactMessageRecord[]>([]);
  const [isFetchingMessages, setIsFetchingMessages] = useState(false);

  // Check initial session
  useEffect(() => {
    async function checkSession() {
      try {
        const res = await fetch('/api/admin/session');
        if (res.ok) {
          const json = await readJsonResponse<{ authenticated: boolean; csrfToken: string }>(res);
          setIsAuthenticated(Boolean(json.authenticated));
          setCsrfToken(json.csrfToken || '');
        } else {
          setIsAuthenticated(false);
        }
      } catch {
        setIsAuthenticated(false);
      }
    }
    checkSession();
  }, []);

  // Fetch data on authentication
  useEffect(() => {
    if (!isAuthenticated) return;
    loadPortfolioData();
    loadMessages();
  }, [isAuthenticated]);

  async function handleLogin(e: FormEvent) {
    e.preventDefault();
    setLoginError(null);
    setIsLoggingIn(true);
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password, totp })
      });
      const data = await readJsonResponse<{ error?: string; authenticated?: boolean; csrfToken?: string }>(res);
      if (res.ok && data.authenticated) {
        setIsAuthenticated(true);
        setCsrfToken(data.csrfToken || '');
        setPassword('');
        setTotp('');
      } else {
        setLoginError(data.error || 'Autentikasi gagal. Periksa password dan kode TOTP Anda.');
      }
    } catch {
      setLoginError('Koneksi ke server gagal. Silakan coba lagi.');
    } finally {
      setIsLoggingIn(false);
    }
  }

  async function handleLogout() {
    try {
      await fetch('/api/admin/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-csrf': csrfToken
        }
      });
    } finally {
      setIsAuthenticated(false);
      setCsrfToken('');
      setPortfolioData(null);
      setMessages([]);
      setSaveStatus(null);
      if (onLogout) onLogout();
    }
  }

  async function loadPortfolioData() {
    setIsFetchingData(true);
    setSaveStatus(null);
    try {
      const res = await fetch('/api/admin/data');
      if (res.ok) {
        const json = await readJsonResponse<{ data: Record<Language, LocalizedPortfolioData & { seo?: Record<string, unknown> }> }>(res);
        setPortfolioData(json.data);
        const refreshed = json.data[selectedLocale] as unknown as Record<string, unknown>;
        const collectionValue = refreshed[selectedCollection];
        const refreshedItems = Array.isArray(collectionValue) ? collectionValue as Array<{ id?: string }> : [];
        const nextId = ['profile','copy','seo'].includes(selectedCollection) ? selectedCollection : String(refreshedItems[0]?.id ?? '');
        setSelectedItemId(nextId);
        const selectedValue = ['profile','copy','seo'].includes(selectedCollection) ? collectionValue : refreshedItems[0];
        setItemDraft(JSON.stringify(selectedValue ?? {}, null, 2));
      } else {
        const failure = await readJsonResponse<{ error?: string }>(res);
        setSaveStatus({ ok: false, message: failure.error || `Gagal memuat data dari spreadsheet (HTTP ${res.status}).` });
      }
    } catch (error) {
      setSaveStatus({ ok: false, message: error instanceof Error ? error.message : 'Gagal menghubungi server admin.' });
    } finally {
      setIsFetchingData(false);
    }
  }

  async function persistPortfolio(nextData = portfolioData) {
    if (!nextData) return;
    setIsSavingData(true);
    setSaveStatus(null);
    try {
      const res = await fetch('/api/admin/data', { method: 'PUT', headers: { 'Content-Type': 'application/json', 'x-admin-csrf': csrfToken }, body: JSON.stringify({ data: nextData }) });
      const result = await readJsonResponse<{ ok?: boolean; error?: string }>(res);
      if (!res.ok || !result.ok) throw new Error(result.error || 'Gagal menyimpan perubahan ke spreadsheet.');
      setPortfolioData(nextData);
      setSaveStatus({ ok: true, message: 'Perubahan tersimpan ke Spreadsheet.' });
    } catch (error) { setSaveStatus({ ok: false, message: error instanceof Error ? error.message : 'Kesalahan jaringan saat menyimpan data.' }); }
    finally { setIsSavingData(false); }
  }

  async function handleSavePortfolio() {
    if (!portfolioData) return;
    try {
      const parsed = JSON.parse(itemDraft) as unknown;
      if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error('Konten harus berupa objek JSON.');
      const next = structuredClone(portfolioData);
      const record = next[selectedLocale] as unknown as Record<string, unknown>;
      if (['profile','copy','seo'].includes(selectedCollection)) record[selectedCollection] = parsed;
      else {
        const items = selectedItems();
        if (!selectedItemId || !items.some((item) => item.id === selectedItemId)) throw new Error('Pilih item yang valid sebelum menyimpan.');
        if (!('id' in parsed) || String((parsed as { id: unknown }).id) !== selectedItemId) throw new Error('ID item tidak dapat diubah saat mengedit.');
        record[selectedCollection] = items.map((item) => item.id === selectedItemId ? parsed : item);
      }
      await persistPortfolio(next);
    } catch (error) {
      setSaveStatus({ ok: false, message: error instanceof Error ? error.message : 'Format JSON tidak valid.' });
    }
  }

  async function initializePortfolio(migrate = false) {
    setIsSavingData(true); setSaveStatus(null);
    try {
      const res = await fetch(migrate ? '/api/admin/migrate-legacy' : '/api/admin/initialize', { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-admin-csrf': csrfToken } });
      const payload = await readJsonResponse<{ error?: string }>(res);
      if (!res.ok) throw new Error(payload.error || 'Inisialisasi gagal.');
      await loadPortfolioData();
      setSaveStatus({ ok: true, message: migrate ? 'Data legacy berhasil dimigrasikan.' : 'Tab portfolio berhasil diisi dengan data awal.' });
    } catch (error) { setSaveStatus({ ok: false, message: error instanceof Error ? error.message : 'Inisialisasi gagal.' }); }
    finally { setIsSavingData(false); }
  }

  function collectionItems(data: typeof portfolioData, locale: Language, collection: PortfolioCollection): Array<{ id?: string; [key: string]: unknown }> {
    if (!data) return [];
    const value = (data[locale] as unknown as Record<string, unknown>)?.[collection];
    return Array.isArray(value) ? value as unknown as Array<{ id?: string; [key: string]: unknown }> : [];
  }

  function selectedItems(): Array<{ id?: string; [key: string]: unknown }> {
    return collectionItems(portfolioData, selectedLocale, selectedCollection);
  }

  function applyDraft(value: unknown) {
    if (!portfolioData) return;
    const next = structuredClone(portfolioData);
    const localeData = next[selectedLocale] as unknown as Record<string, unknown>;
    if (selectedCollection === 'profile' || selectedCollection === 'copy' || selectedCollection === 'seo') localeData[selectedCollection] = value;
    else localeData[selectedCollection] = selectedItems().map((item) => item.id === selectedItemId ? value : item);
    setPortfolioData(next);
  }

  function changeDraft(value: string) {
    setItemDraft(value);
    try {
      const parsed = JSON.parse(value) as unknown;
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) applyDraft(parsed);
    } catch { /* Allow an incomplete JSON draft; save will report the syntax error. */ }
  }

  useEffect(() => {
    if (!portfolioData) return;
    const record = portfolioData[selectedLocale] as unknown as Record<string, unknown>;
    const value = ['profile','copy','seo'].includes(selectedCollection) ? record[selectedCollection] : selectedItems().find((item) => item.id === selectedItemId);
    setItemDraft(JSON.stringify(value ?? {}, null, 2));
  }, [portfolioData, selectedLocale, selectedCollection, selectedItemId]);

  function addCollectionItem() {
    if (!portfolioData || ['profile', 'copy', 'seo'].includes(selectedCollection)) return;
    const next = structuredClone(portfolioData);
    const localeData = next[selectedLocale] as unknown as Record<string, unknown>;
    const items = selectedItems();
    const item = items.length ? structuredClone(items[0]) : { title: 'Item baru' };
    item.id = `new-${crypto.randomUUID()}`;
    for (const key of Object.keys(item)) {
      const value = item[key];
      if (Array.isArray(value)) item[key] = [];
      else if (typeof value === 'boolean') item[key] = false;
      else if (typeof value === 'number') item[key] = 0;
      else if (typeof value === 'string' && key !== 'id' && !['filterKey', 'actionState', 'platform'].includes(key)) {
        item[key] = ['title', 'name', 'role'].includes(key) ? 'Item baru' : '';
      }
    }
    localeData[selectedCollection] = [...items, item];
    setPortfolioData(next);
    setSelectedItemId(item.id);
    setItemDraft(JSON.stringify(item, null, 2));
  }

  function deleteSelectedItem() {
    if (!portfolioData || ['profile', 'copy', 'seo'].includes(selectedCollection)) return;
    if (!window.confirm('Hapus item ini secara permanen?')) return;
    const next = structuredClone(portfolioData);
    (next[selectedLocale] as unknown as Record<string, unknown>)[selectedCollection] = selectedItems().filter((item) => item.id !== selectedItemId);
    const remaining = ((next[selectedLocale] as unknown as Record<string, unknown>)[selectedCollection] as Array<{ id?: string }>);
    setPortfolioData(next);
    const nextItem = remaining[0];
    setSelectedItemId(String(nextItem?.id ?? ''));
    setItemDraft(JSON.stringify(nextItem ?? {}, null, 2));
  }

  async function loadMessages() {
    setIsFetchingMessages(true);
    try {
      const res = await fetch('/api/admin/messages');
      if (res.ok) {
        const json = await readJsonResponse<{ messages: ContactMessageRecord[] }>(res);
        setMessages(json.messages || []);
      }
    } catch {
      // Ignore
    } finally {
      setIsFetchingMessages(false);
    }
  }

  async function updateMessageStatus(id: string, status: ContactMessageRecord['status']) {
    try {
      const res = await fetch(`/api/admin/messages/${encodeURIComponent(id)}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-csrf': csrfToken
        },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        setMessages((prev) =>
          prev.map((msg) => (msg.id === id ? { ...msg, status } : msg))
        );
      }
    } catch {
      // Ignore
    }
  }

  // Loading state
  if (isAuthenticated === null) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-[#F5F5F7] dark:bg-[#000000]">
        <div className="flex items-center gap-3 text-sm text-[#86868B]">
          <RefreshCw className="h-4 w-4 animate-spin text-[#0071E3] dark:text-[#2997FF]" />
          <span>Memeriksa keamanan sesi...</span>
        </div>
      </div>
    );
  }

  // Login view
  if (!isAuthenticated) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-[#F5F5F7] px-4 py-16 dark:bg-[#000000]">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: APPLE_EASE }}
          className="w-full max-w-md rounded-3xl border border-black/[0.06] bg-white p-8 shadow-2xl backdrop-blur-xl sm:p-10 dark:border-white/[0.08] dark:bg-[#1D1D1F]/90"
        >
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#0071E3]/10 text-[#0071E3] dark:bg-[#2997FF]/15 dark:text-[#2997FF]">
              <ShieldCheck className="h-7 w-7" />
            </div>
            <h1 className="font-[var(--font-display)] text-2xl font-semibold tracking-tight text-[#1D1D1F] dark:text-[#F5F5F7]">
              Admin Security Gate
            </h1>
            <p className="mt-2 text-xs text-[#86868B] dark:text-[#A1A1A6]">
              Akses terbatas dengan autentikasi ganda (Password + TOTP)
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label
                htmlFor="admin-password"
                className="mb-1.5 block text-xs font-medium text-[#1D1D1F] dark:text-[#F5F5F7]"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="admin-password"
                  name="password"
                  type="password"
                  disabled={isLoggingIn}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan password admin"
                  className="w-full rounded-xl border border-black/10 bg-[#F5F5F7] px-4 py-3 pl-10 text-sm text-[#1D1D1F] transition-all focus:border-[#0071E3] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0071E3]/20 dark:border-white/10 dark:bg-black/30 dark:text-[#F5F5F7] dark:focus:border-[#2997FF] dark:focus:bg-[#1D1D1F]"
                />
                <Lock className="pointer-events-none absolute left-3.5 top-3.5 h-4 w-4 text-[#86868B]" />
              </div>
            </div>

            <div>
              <label
                htmlFor="admin-totp"
                className="mb-1.5 block text-xs font-medium text-[#1D1D1F] dark:text-[#F5F5F7]"
              >
                Kode TOTP Authenticator (6 Digit)
              </label>
              <div className="relative">
                <input
                  id="admin-totp"
                  name="totp"
                  type="text"
                  disabled={isLoggingIn}
                  required
                  inputMode="numeric"
                  pattern="[0-9]{6}"
                  maxLength={6}
                  autoComplete="one-time-code"
                  value={totp}
                  onChange={(e) => setTotp(e.target.value)}
                  placeholder="123456"
                  className="w-full rounded-xl border border-black/10 bg-[#F5F5F7] px-4 py-3 pl-10 font-[var(--font-mono)] text-sm tracking-widest text-[#1D1D1F] transition-all focus:border-[#0071E3] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0071E3]/20 dark:border-white/10 dark:bg-black/30 dark:text-[#F5F5F7] dark:focus:border-[#2997FF] dark:focus:bg-[#1D1D1F]"
                />
                <KeyRound className="pointer-events-none absolute left-3.5 top-3.5 h-4 w-4 text-[#86868B]" />
              </div>
            </div>

            <AnimatePresence>
              {loginError && (
                <motion.div
                  role="alert"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex items-center gap-2 rounded-xl bg-red-500/10 p-3 text-xs text-red-600 dark:bg-red-500/20 dark:text-red-400"
                >
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{loginError}</span>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.button
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isLoggingIn}
              className="flex w-full min-h-[46px] items-center justify-center gap-2 rounded-xl bg-[#0071E3] px-6 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#0077ED] disabled:opacity-50 dark:bg-[#2997FF] dark:text-black dark:hover:bg-[#52ABFF]"
            >
              {isLoggingIn ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>Memverifikasi...</span>
                </>
              ) : (
                <span>Masuk ke Dashboard</span>
              )}
            </motion.button>
          </form>
        </motion.div>
      </div>
    );
  }

  // Dashboard view
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#F5F5F7] pb-24 pt-8 text-[#1D1D1F] dark:bg-[#000000] dark:text-[#F5F5F7]">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Header bar */}
        <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#0071E3] dark:text-[#2997FF]">
              <ShieldCheck className="h-4 w-4" />
              <span>Admin Management Hub</span>
            </div>
            <h1 className="mt-1 font-[var(--font-display)] text-3xl font-bold tracking-tight sm:text-4xl">
              Portal Data Portfolio
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <a href="/" className="inline-flex min-h-[40px] items-center rounded-xl border border-black/10 bg-white/80 px-4 py-2 text-xs font-medium transition-colors hover:bg-black/5 dark:border-white/10 dark:bg-[#1D1D1F] dark:hover:bg-white/10">Kembali ke Website</a>
            <button
              onClick={handleLogout}
              className="inline-flex min-h-[40px] items-center gap-2 rounded-xl border border-black/10 bg-white/80 px-4 py-2 text-xs font-medium text-red-600 transition-colors hover:bg-red-50 dark:border-white/10 dark:bg-[#1D1D1F] dark:text-red-400 dark:hover:bg-red-950/30"
            >
              <LogOut className="h-4 w-4" />
              <span>Keluar</span>
            </button>
          </div>
        </header>

        {/* Navigation tabs */}
        <div role="tablist" aria-label="Menu Admin" className="mb-8 flex border-b border-black/[0.08] dark:border-white/[0.08]">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'portfolio'}
            aria-controls="admin-panel-portfolio"
            id="admin-tab-portfolio"
            onClick={() => setActiveTab('portfolio')}
            className={`flex items-center gap-2 border-b-2 px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === 'portfolio'
                ? 'border-[#0071E3] text-[#0071E3] dark:border-[#2997FF] dark:text-[#2997FF]'
                : 'border-transparent text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-[#F5F5F7]'
            }`}
          >
            <FileJson className="h-4 w-4" />
            <span>Konten Portfolio (Spreadsheet)</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'messages'}
            aria-controls="admin-panel-messages"
            id="admin-tab-messages"
            onClick={() => setActiveTab('messages')}
            className={`flex items-center gap-2 border-b-2 px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === 'messages'
                ? 'border-[#0071E3] text-[#0071E3] dark:border-[#2997FF] dark:text-[#2997FF]'
                : 'border-transparent text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-[#F5F5F7]'
            }`}
          >
            <Inbox className="h-4 w-4" />
            <span>Pesan Kontak ({messages.length})</span>
          </button>
        </div>

        {activeTab === 'portfolio' && (
          <motion.div role="tabpanel" id="admin-panel-portfolio" aria-labelledby="admin-tab-portfolio" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} className="space-y-5">
            <section className="rounded-3xl border border-black/[0.06] bg-white p-5 shadow-sm dark:border-white/[0.08] dark:bg-[#1D1D1F]">
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div><h2 className="font-[var(--font-display)] text-xl font-semibold">Content Studio</h2><p className="mt-1 text-sm text-[#86868B]">Kelola konten terstruktur untuk setiap bahasa. Data tersimpan di tab spreadsheet privat.</p></div>
                <div className="flex flex-wrap gap-2">
                  <button type="button" onClick={loadPortfolioData} className="min-h-[40px] rounded-xl border border-black/10 px-4 text-sm">Muat Ulang</button>
                  <button type="button" onClick={() => initializePortfolio(false)} disabled={isSavingData} className="min-h-[40px] rounded-xl border border-black/10 px-4 text-sm">Isi spreadsheet kosong</button>
                  <button type="button" onClick={() => initializePortfolio(true)} disabled={isSavingData} className="min-h-[40px] rounded-xl border border-black/10 px-4 text-sm">Migrasi data lama</button>
                </div>
              </div>
              {saveStatus && <div role={saveStatus.ok ? 'status' : 'alert'} className={`mt-4 rounded-xl p-3 text-sm ${saveStatus.ok ? 'bg-emerald-500/10 text-emerald-700' : 'bg-red-500/10 text-red-700'}`}>{saveStatus.message}</div>}
            </section>
            {portfolioData ? <section className="grid gap-5 lg:grid-cols-[240px_1fr]">
              <aside className="rounded-3xl border border-black/[0.06] bg-white p-3 dark:border-white/[0.08] dark:bg-[#1D1D1F]">
                <label htmlFor="admin-locale-select" className="mb-2 block px-3 pt-2 text-xs font-semibold uppercase tracking-wide text-[#86868B]">Bahasa</label>
                <select id="admin-locale-select" value={selectedLocale} onChange={(e) => { setSelectedLocale(e.target.value as Language); setSelectedItemId(['profile','copy','seo'].includes(selectedCollection) ? selectedCollection : '');  }} className="mb-4 min-h-[42px] w-full rounded-xl border border-black/10 bg-[#F5F5F7] px-3 text-sm dark:bg-black/30">
                  {(['id','en','ja','ko','zh-CN'] as Language[]).map((lang) => <option key={lang} value={lang}>{lang}</option>)}
                </select>
                <nav aria-label="Bagian konten" className="space-y-1">{COLLECTIONS.map((section) => <button key={section.key} type="button" onClick={() => { setSelectedCollection(section.key); setSelectedItemId(['profile','copy','seo'].includes(section.key) ? section.key : '');  }} className={`flex min-h-[42px] w-full items-center justify-between rounded-xl px-3 text-left text-sm ${selectedCollection === section.key ? 'bg-[#0071E3]/10 font-semibold text-[#0071E3] dark:text-[#2997FF]' : 'hover:bg-black/5 dark:hover:bg-white/5'}`}><span>{section.label}</span><span className="text-xs text-[#86868B]">{['profile','copy','seo'].includes(section.key) ? '1' : collectionItems(portfolioData, selectedLocale, section.key).length}</span></button>)}</nav>
              </aside>
              <div className="rounded-3xl border border-black/[0.06] bg-white p-5 shadow-sm dark:border-white/[0.08] dark:bg-[#1D1D1F]">
                <div className="mb-5 flex flex-wrap items-center justify-between gap-3"><div><h3 className="text-lg font-semibold">{COLLECTIONS.find((item) => item.key === selectedCollection)?.label}</h3><p className="mt-1 text-xs text-[#86868B]">Tab {COLLECTIONS.find((item) => item.key === selectedCollection)?.tab}</p></div><div className="flex gap-2">{!['profile','copy','seo'].includes(selectedCollection) && <button type="button" onClick={addCollectionItem} className="min-h-[40px] rounded-xl border border-black/10 px-4 text-sm">Tambah item</button>}<button type="button" onClick={handleSavePortfolio} disabled={isSavingData} className="min-h-[40px] rounded-xl bg-[#0071E3] px-5 text-sm font-semibold text-white disabled:opacity-50">{isSavingData ? 'Menyimpan…' : 'Simpan Perubahan'}</button></div></div>
                <div className={`grid min-w-0 gap-4 ${['profile','copy','seo'].includes(selectedCollection) ? 'grid-cols-1' : 'md:grid-cols-[220px_minmax(0,1fr)]'}`}>
                  {!['profile','copy','seo'].includes(selectedCollection) && <div className="max-h-[60vh] space-y-1 overflow-auto rounded-2xl bg-[#F5F5F7] p-2 dark:bg-black/25">{selectedItems().map((item, index) => <button key={item.id ?? index} type="button" onClick={() => { setSelectedItemId(String(item.id ?? index)); setItemDraft(JSON.stringify(item, null, 2)); }} className={`w-full rounded-xl px-3 py-3 text-left text-sm ${String(item.id ?? index) === selectedItemId ? 'bg-white font-medium shadow-sm dark:bg-white/10' : 'hover:bg-white/70 dark:hover:bg-white/5'}`}>{String(item.title || item.role || item.name || item.id || `Item ${index + 1}`)}</button>)}</div>}
                  <div className="w-full min-w-0 space-y-4">
                    <textarea aria-label="Editor bidang konten" rows={18} value={itemDraft} onChange={(e) => changeDraft(e.target.value)} className="w-full rounded-2xl border border-black/10 bg-[#FAFAFA] p-4 font-[var(--font-mono)] text-xs leading-relaxed focus:border-[#0071E3] focus:outline-none focus:ring-2 focus:ring-[#0071E3]/20 dark:border-white/10 dark:bg-black/40" />
                    {!['profile','copy','seo'].includes(selectedCollection) && selectedItemId && <button type="button" onClick={deleteSelectedItem} className="min-h-[40px] rounded-xl border border-red-500/20 px-4 text-sm text-red-600">Hapus item</button>}
                    <p className="text-xs text-[#86868B]">Editor objek per item. Untuk gambar proyek dan profil, isi URL HTTPS publik. Perubahan tersimpan saat menekan “Simpan Perubahan”.</p>
                  </div>
                </div>
              </div>
            </section> : <div className="rounded-3xl border border-black/[0.06] bg-white p-8 text-center dark:bg-[#1D1D1F]"><h3 className="font-semibold">Spreadsheet belum memiliki data portfolio</h3><p className="mt-2 text-sm text-[#86868B]">Gunakan “Isi spreadsheet kosong” untuk menyalin konten awal dari aplikasi, atau “Migrasi data lama” jika tab Portfolio lama sudah berisi JSON.</p></div>}
          </motion.div>
        )}

        {/* Tab 2: Contact Messages Inbox */}
        {activeTab === 'messages' && (
          <motion.div
            role="tabpanel"
            id="admin-panel-messages"
            aria-labelledby="admin-tab-messages"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between">
              <h2 className="font-[var(--font-display)] text-lg font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]">
                Daftar Pesan Masuk
              </h2>
              <button
                type="button"
                onClick={loadMessages}
                disabled={isFetchingMessages}
                className="inline-flex min-h-[38px] items-center gap-2 rounded-xl border border-black/10 bg-white px-4 py-2 text-xs font-medium text-[#1D1D1F] transition-colors hover:bg-black/5 dark:border-white/10 dark:bg-[#1D1D1F] dark:text-[#F5F5F7]"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${isFetchingMessages ? 'animate-spin' : ''}`} />
                <span>Segarkan</span>
              </button>
            </div>

            {messages.length === 0 ? (
              <div className="rounded-3xl border border-black/[0.06] bg-white p-12 text-center text-sm text-[#86868B] dark:border-white/[0.08] dark:bg-[#1D1D1F]">
                Belum ada pesan formulir kontak yang tersimpan di sheet.
              </div>
            ) : (
              <div className="grid gap-4">
                {messages.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-2xl border border-black/[0.06] bg-white p-6 shadow-sm dark:border-white/[0.08] dark:bg-[#1D1D1F]"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-black/[0.06] pb-3 dark:border-white/[0.08]">
                      <div>
                        <span className="font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]">{item.name}</span>
                        <span className="ml-2 text-xs text-[#86868B]">({item.email})</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-[#86868B]">
                          {new Date(item.submittedAt).toLocaleString('id-ID')}
                        </span>
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium ${
                            item.status === 'unread'
                              ? 'bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400'
                              : item.status === 'read'
                              ? 'bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400'
                              : 'bg-zinc-500/10 text-zinc-600 dark:bg-zinc-500/20 dark:text-zinc-400'
                          }`}
                        >
                          {item.status}
                        </span>
                      </div>
                    </div>

                    <div className="mt-3">
                      <p className="text-xs font-semibold text-[#0071E3] dark:text-[#2997FF]">
                        [{item.purpose}] {item.subject}
                      </p>
                      <p className="mt-2 text-sm leading-relaxed text-[#424245] dark:text-[#D1D1D6]">
                        {item.message}
                      </p>
                    </div>

                    <div className="mt-4 flex items-center justify-end gap-2 border-t border-black/[0.04] pt-3 dark:border-white/[0.04]">
                      {item.status === 'unread' && (
                        <button
                          type="button"
                          onClick={() => updateMessageStatus(item.id, 'read')}
                          className="rounded-lg bg-black/5 px-3 py-1.5 text-xs font-medium text-[#1D1D1F] hover:bg-black/10 dark:bg-white/10 dark:text-[#F5F5F7] dark:hover:bg-white/20"
                        >
                          Tandai Sudah Dibaca
                        </button>
                      )}
                      {item.status !== 'archived' && (
                        <button
                          type="button"
                          onClick={() => updateMessageStatus(item.id, 'archived')}
                          className="rounded-lg bg-black/5 px-3 py-1.5 text-xs font-medium text-[#86868B] hover:bg-black/10 dark:bg-white/10 dark:hover:bg-white/20"
                        >
                          Arsipkan
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
