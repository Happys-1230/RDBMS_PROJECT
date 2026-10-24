import { useEffect, useMemo, useState } from "react";
import {
  BriefcaseBusiness,
  Plus,
  Search,
  Wallet,
  TrendingUp,
  IndianRupee,
  Pencil,
  Trash2,
  X,
  ArrowLeft,
  MoreHorizontal,
  CalendarDays,
  RefreshCw,
} from "lucide-react";
import { portfoliosAPI, investorsAPI } from "../api/api.js";

const RISK_PROFILES = ["Conservative", "Moderate", "Aggressive"];

function rowsFromResponse(response) {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.portfolios)) return response.portfolios;
  if (Array.isArray(response?.investors)) return response.investors;
  return [];
}

function normalizePortfolio(row, investors = []) {
  const investorId = Number(row.investor_id ?? row.investorId ?? row.investor?.investor_id ?? row.investor?.id ?? 0);
  const matchedInvestor = investors.find((investor) => Number(investor.investor_id ?? investor.id) === investorId);
  return {
    id: Number(row.portfolio_id ?? row.id),
    investorId,
    name: row.portfolio_name ?? row.name ?? "Untitled Portfolio",
    investor: row.investor_name ?? row.investorName ?? row.investor?.name ?? matchedInvestor?.name ?? matchedInvestor?.full_name ?? (investorId ? `Investor #${investorId}` : "Unassigned"),
    risk: row.risk_profile ?? row.riskProfile ?? row.risk ?? "Moderate",
    createdAt: row.created_at ?? row.createdAt ?? null,
  };
}

function formatDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", year: "numeric" }).format(date);
}

const formatCurrency = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);

function SummaryCard({ title, value, description, icon: Icon }) {
  return (
    <article className="rounded-2xl border border-slate-800 bg-[#121c27] p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm text-slate-400">{title}</p>
          <h2 className="mt-3 break-words text-2xl font-bold text-white">
            {value}
          </h2>
          <p className="mt-2 text-xs text-slate-500">{description}</p>
        </div>

        <div className="rounded-xl bg-emerald-400/10 p-3 text-emerald-300">
          <Icon size={21} />
        </div>
      </div>
    </article>
  );
}

function PortfolioForm({ portfolio, investors, onClose, onSave, saving }) {
  const [name, setName] = useState(portfolio?.name ?? "");
  const [investorId, setInvestorId] = useState(portfolio?.investorId ? String(portfolio.investorId) : "");
  const [risk, setRisk] = useState(RISK_PROFILES.includes(portfolio?.risk) ? portfolio.risk : "Moderate");
  const [error, setError] = useState("");
  const fieldClass = "mt-2 w-full rounded-xl border border-slate-700 bg-[#0b1119] px-3 py-3 text-sm text-white outline-none focus:border-emerald-400 disabled:cursor-not-allowed disabled:opacity-60";

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    if (!name.trim()) { setError("Portfolio name is required."); return; }
    if (!investorId) { setError("Please select an investor."); return; }
    try {
      await onSave({ portfolio_name: name.trim(), investor_id: Number(investorId), risk_profile: risk });
    } catch (saveError) {
      setError(saveError?.message || "Could not save the portfolio. Please try again.");
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <section className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-slate-700 bg-[#121c27] p-5 shadow-2xl sm:p-7">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-white">{portfolio ? "Edit Portfolio" : "Create Portfolio"}</h2>
            <p className="mt-1 text-sm text-slate-400">Enter the portfolio details below.</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Close form" className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-300">Portfolio name *</label>
            <input required maxLength={100} value={name} onChange={(event) => setName(event.target.value)} placeholder="e.g. Long-Term Growth" className={fieldClass} />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-300">Investor *</label>
            <select required value={investorId} onChange={(event) => setInvestorId(event.target.value)} className={fieldClass} disabled={investors.length === 0}>
              <option value="">{investors.length ? "Select an investor" : "No investors available"}</option>
              {investors.map((investor) => {
                const id = investor.investor_id ?? investor.id;
                const label = investor.name ?? investor.full_name ?? investor.investor_name ?? `Investor #${id}`;
                return <option key={id} value={id}>{label}</option>;
              })}
            </select>
            {investors.length === 0 && <p className="mt-2 text-xs text-amber-300">Create an investor first, then assign them to a portfolio.</p>}
          </div>
          <div>
            <label className="text-sm font-medium text-slate-300">Risk profile</label>
            <select value={risk} onChange={(event) => setRisk(event.target.value)} className={fieldClass}>
              {RISK_PROFILES.map((profile) => <option key={profile} value={profile}>{profile}</option>)}
            </select>
          </div>
          <p className="rounded-xl border border-slate-700/80 bg-[#0b1119] p-3 text-xs leading-5 text-slate-400">Your current Portfolios table stores the portfolio name, investor, risk profile, and creation date. Investment values and descriptions are not stored in this table.</p>
          {error && <p role="alert" className="text-sm text-rose-300">{error}</p>}
          <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
            <button type="button" onClick={onClose} className="rounded-xl border border-slate-700 px-4 py-3 text-sm font-semibold text-slate-300 hover:bg-slate-800">Cancel</button>
            <button type="submit" disabled={saving || investors.length === 0} className="rounded-xl bg-emerald-400 px-5 py-3 text-sm font-bold text-slate-950 hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-60">{saving ? "Saving..." : portfolio ? "Save Changes" : "Create Portfolio"}</button>
          </div>
        </form>
      </section>
    </div>
  );
}

function PortfolioDetails({ portfolio, onBack, onEdit }) {
  return (
    <div className="space-y-6">
      <button onClick={onBack} className="inline-flex items-center gap-2 text-sm text-slate-400 transition hover:text-white"><ArrowLeft size={17} /> Back to Portfolios</button>
      <section className="flex flex-col justify-between gap-4 rounded-2xl border border-slate-800 bg-[#121c27] p-6 sm:flex-row sm:items-center">
        <div>
          <div className="mb-3 flex items-center gap-3">
            <div className="rounded-xl bg-emerald-400/10 p-3 text-emerald-300"><BriefcaseBusiness size={24} /></div>
            <span className="rounded-full bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-300">Saved in database</span>
          </div>
          <h1 className="text-2xl font-bold text-white">{portfolio.name}</h1>
          <p className="mt-2 text-sm text-slate-400">Investor: {portfolio.investor}</p>
          <p className="mt-2 text-sm text-slate-500">Created: {formatDate(portfolio.createdAt)}</p>
        </div>
        <button onClick={onEdit} className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800"><Pencil size={16} /> Edit Portfolio</button>
      </section>
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard title="Portfolio ID" value={portfolio.id} description="Database record ID" icon={BriefcaseBusiness} />
        <SummaryCard title="Investor" value={portfolio.investor} description={`Investor ID: ${portfolio.investorId || "—"}`} icon={Wallet} />
        <SummaryCard title="Risk Profile" value={portfolio.risk} description="Configured risk preference" icon={TrendingUp} />
        <SummaryCard title="Created On" value={formatDate(portfolio.createdAt)} description="Portfolio creation date" icon={CalendarDays} />
      </section>
      <section className="rounded-2xl border border-slate-800 bg-[#121c27] p-6">
        <h2 className="font-semibold text-white">Portfolio information</h2>
        <p className="mt-2 text-sm leading-6 text-slate-400">This view displays the information stored for this portfolio in MySQL. Invested capital, live valuation, returns, and stock holdings are not shown as they are not columns in the current Portfolios table.</p>
      </section>
    </div>
  );
}

export default function Portfolios() {
  const [portfolios, setPortfolios] = useState([]);
  const [investors, setInvestors] = useState([]);
  const [search, setSearch] = useState("");
  const [riskFilter, setRiskFilter] = useState("ALL");
  const [showForm, setShowForm] = useState(false);
  const [editingPortfolio, setEditingPortfolio] = useState(null);
  const [selectedPortfolio, setSelectedPortfolio] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function loadData() {
    setLoading(true);
    setError("");
    try {
      const [portfolioResponse, investorResponse] = await Promise.all([portfoliosAPI.getAll(), investorsAPI.getAll()]);
      const investorRows = rowsFromResponse(investorResponse);
      const portfolioRows = rowsFromResponse(portfolioResponse);
      setInvestors(investorRows);
      const normalized = portfolioRows.map((row) => normalizePortfolio(row, investorRows));
      setPortfolios(normalized);
      setSelectedPortfolio((current) => current ? normalized.find((item) => item.id === current.id) ?? null : null);
    } catch (loadError) {
      setError(loadError?.message || "Could not load portfolios. Check that your backend is running and the API routes are available.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadData(); }, []);

  const filteredPortfolios = useMemo(() => {
    const term = search.trim().toLowerCase();
    return portfolios.filter((portfolio) => {
      const matchesSearch = portfolio.name.toLowerCase().includes(term) || portfolio.investor.toLowerCase().includes(term);
      const matchesRisk = riskFilter === "ALL" || portfolio.risk === riskFilter;
      return matchesSearch && matchesRisk;
    });
  }, [portfolios, search, riskFilter]);

  async function savePortfolio(formData) {
    setSaving(true);
    setError("");
    try {
      if (editingPortfolio) {
        await portfoliosAPI.update(editingPortfolio.id, formData);
        setNotice("Portfolio updated successfully.");
      } else {
        await portfoliosAPI.create(formData);
        setNotice("Portfolio created successfully.");
      }
      setShowForm(false);
      setEditingPortfolio(null);
      await loadData();
    } catch (saveError) {
      throw saveError;
    } finally {
      setSaving(false);
    }
  }

  function openEdit(portfolio) { setEditingPortfolio(portfolio); setShowForm(true); }

  async function deletePortfolio() {
    if (!deleteTarget || deleting) return;
    setDeleting(true);
    setError("");
    try {
      await portfoliosAPI.delete(deleteTarget.id);
      if (selectedPortfolio?.id === deleteTarget.id) setSelectedPortfolio(null);
      setDeleteTarget(null);
      setNotice("Portfolio deleted successfully.");
      await loadData();
    } catch (deleteError) {
      setError(deleteError?.message || "Could not delete this portfolio. It may be linked to other records.");
    } finally {
      setDeleting(false);
    }
  }

  if (selectedPortfolio) {
    const currentPortfolio = portfolios.find((item) => item.id === selectedPortfolio.id) ?? selectedPortfolio;
    return (
      <div className="space-y-6">
        {error && <div role="alert" className="rounded-xl border border-rose-400/20 bg-rose-400/5 px-4 py-3 text-sm text-rose-300">{error}</div>}
        <PortfolioDetails portfolio={currentPortfolio} onBack={() => setSelectedPortfolio(null)} onEdit={() => openEdit(currentPortfolio)} />
        {showForm && <PortfolioForm portfolio={editingPortfolio} investors={investors} saving={saving} onClose={() => { setShowForm(false); setEditingPortfolio(null); }} onSave={savePortfolio} />}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
        <div>
          <p className="mb-2 text-[10px] font-bold tracking-[2px] text-emerald-300">STOCKWISE WORKSPACE</p>
          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">Portfolios</h1>
          <p className="mt-2 text-sm text-slate-400">Manage your investment portfolios in one place.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button onClick={loadData} disabled={loading} className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 px-4 py-3 text-sm font-semibold text-slate-200 transition hover:bg-slate-800 disabled:opacity-60"><RefreshCw size={16} className={loading ? "animate-spin" : ""} /> Refresh</button>
          <button onClick={() => { setEditingPortfolio(null); setShowForm(true); }} className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-400 px-4 py-3 text-sm font-bold text-slate-950 transition hover:bg-emerald-300"><Plus size={18} /> Create Portfolio</button>
        </div>
      </section>

      {notice && <div className="flex items-center justify-between gap-3 rounded-xl border border-emerald-400/20 bg-emerald-400/5 px-4 py-3 text-sm text-emerald-300">{notice}<button onClick={() => setNotice("")} aria-label="Dismiss notification" className="rounded p-1 hover:bg-emerald-400/10"><X size={16} /></button></div>}
      {error && <div role="alert" className="flex items-start justify-between gap-3 rounded-xl border border-rose-400/20 bg-rose-400/5 px-4 py-3 text-sm text-rose-300"><span>{error}</span><button onClick={() => setError("")} aria-label="Dismiss error" className="rounded p-1 hover:bg-rose-400/10"><X size={16} /></button></div>}

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard title="Total Portfolios" value={portfolios.length} description="Records loaded from MySQL" icon={BriefcaseBusiness} />
        <SummaryCard title="Conservative" value={portfolios.filter((p) => p.risk === "Conservative").length} description="Conservative risk profile" icon={Wallet} />
        <SummaryCard title="Moderate" value={portfolios.filter((p) => p.risk === "Moderate").length} description="Moderate risk profile" icon={IndianRupee} />
        <SummaryCard title="Aggressive" value={portfolios.filter((p) => p.risk === "Aggressive").length} description="Aggressive risk profile" icon={TrendingUp} />
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-800 bg-[#121c27]">
        <div className="flex flex-col gap-4 border-b border-slate-800 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div><h2 className="font-semibold text-white">All Portfolios</h2><p className="mt-1 text-xs text-slate-400">Search and manage your investment portfolios.</p></div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative"><Search size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search portfolios..." aria-label="Search portfolios" className="w-full rounded-xl border border-slate-700 bg-[#0b1119] py-2.5 pl-9 pr-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-emerald-400 sm:w-60" /></div>
            <select value={riskFilter} onChange={(event) => setRiskFilter(event.target.value)} aria-label="Filter by risk level" className="rounded-xl border border-slate-700 bg-[#0b1119] px-3 py-2.5 text-sm text-slate-200 outline-none focus:border-emerald-400">
              <option value="ALL">All risk levels</option>{RISK_PROFILES.map((risk) => <option key={risk} value={risk}>{risk}</option>)}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px] text-left text-sm">
            <thead className="bg-[#0e1722] text-[11px] uppercase tracking-wider text-slate-500"><tr><th className="px-5 py-4 font-semibold">Portfolio</th><th className="px-5 py-4 font-semibold">Investor</th><th className="px-5 py-4 font-semibold">Portfolio ID</th><th className="px-5 py-4 font-semibold">Created</th><th className="px-5 py-4 font-semibold">Risk</th><th className="px-5 py-4 font-semibold">Actions</th></tr></thead>
            <tbody className="divide-y divide-slate-800/80">
              {loading && <tr><td colSpan={6} className="px-5 py-12 text-center text-sm text-slate-400">Loading portfolios...</td></tr>}
              {!loading && filteredPortfolios.map((portfolio) => (
                <tr key={portfolio.id} className="transition hover:bg-slate-800/30">
                  <td className="px-5 py-4"><button onClick={() => setSelectedPortfolio(portfolio)} className="text-left font-semibold text-white hover:text-emerald-300">{portfolio.name}</button><p className="mt-1 text-xs text-slate-500">Portfolio record</p></td>
                  <td className="px-5 py-4 text-slate-300">{portfolio.investor}</td>
                  <td className="px-5 py-4 whitespace-nowrap text-slate-300">{portfolio.id}</td>
                  <td className="px-5 py-4 whitespace-nowrap text-slate-300">{formatDate(portfolio.createdAt)}</td>
                  <td className="px-5 py-4"><span className={`rounded-lg px-2.5 py-1.5 text-xs font-semibold ${portfolio.risk === "Conservative" ? "bg-sky-400/10 text-sky-300" : portfolio.risk === "Aggressive" ? "bg-rose-400/10 text-rose-300" : "bg-amber-400/10 text-amber-300"}`}>{portfolio.risk}</span></td>
                  <td className="px-5 py-4"><div className="flex items-center gap-1">
                    <button onClick={() => openEdit(portfolio)} aria-label={`Edit ${portfolio.name}`} className="rounded-lg p-2 text-slate-400 hover:bg-slate-700 hover:text-white"><Pencil size={16} /></button>
                    <button onClick={() => setDeleteTarget(portfolio)} aria-label={`Delete ${portfolio.name}`} className="rounded-lg p-2 text-slate-400 hover:bg-rose-400/10 hover:text-rose-300"><Trash2 size={16} /></button>
                    <button onClick={() => setSelectedPortfolio(portfolio)} aria-label={`View ${portfolio.name}`} className="rounded-lg p-2 text-slate-400 hover:bg-slate-700 hover:text-white"><MoreHorizontal size={17} /></button>
                  </div></td>
                </tr>
              ))}
              {!loading && filteredPortfolios.length === 0 && <tr><td colSpan={6} className="px-5 py-12 text-center text-sm text-slate-500">No portfolios found. Try another search or filter.</td></tr>}
            </tbody>
          </table>
        </div>
        <div className="border-t border-slate-800 px-5 py-4 text-xs text-slate-500">Showing {filteredPortfolios.length} of {portfolios.length} portfolios · Live database records</div>
      </section>

      {showForm && <PortfolioForm portfolio={editingPortfolio} investors={investors} saving={saving} onClose={() => { setShowForm(false); setEditingPortfolio(null); }} onSave={savePortfolio} />}

      {deleteTarget && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"><section className="w-full max-w-md rounded-2xl border border-slate-700 bg-[#121c27] p-6">
        <div className="mb-4 grid h-12 w-12 place-items-center rounded-xl bg-rose-400/10 text-rose-300"><Trash2 size={22} /></div>
        <h2 className="text-lg font-bold text-white">Delete portfolio?</h2>
        <p className="mt-2 text-sm leading-6 text-slate-400">Are you sure you want to delete "{deleteTarget.name}"? This permanently deletes the database record if the backend accepts the request.</p>
        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button onClick={() => setDeleteTarget(null)} disabled={deleting} className="rounded-xl border border-slate-700 px-4 py-3 text-sm font-semibold text-slate-300 hover:bg-slate-800">Cancel</button>
          <button onClick={deletePortfolio} disabled={deleting} className="rounded-xl bg-rose-500 px-4 py-3 text-sm font-bold text-white hover:bg-rose-400 disabled:opacity-60">{deleting ? "Deleting..." : "Delete Portfolio"}</button>
        </div>
      </section></div>}
    </div>
  );
}
