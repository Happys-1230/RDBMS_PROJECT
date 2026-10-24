import { useEffect, useMemo, useState, useCallback } from "react";
import {
  Plus,
  Search,
  SlidersHorizontal,
  TrendingUp,
  Package,
  RefreshCw,
} from "lucide-react";

import StockForm from "../components/StockForm";
import StockTable from "../components/StockTable";
import DeleteStockModal from "../components/DeleteStockModal";
import { stocksAPI } from "../api/api";

const formatCurrency = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(value) || 0);

function getRows(response) {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.stocks)) return response.stocks;
  return [];
}

function normalizeStock(stock) {
  return {
    ...stock,
    stock_id: stock.stock_id ?? stock.id,
    company_name: stock.company_name ?? stock.companyName ?? "",
    symbol: stock.symbol ?? "",
    current_price: Number(stock.current_price ?? stock.currentPrice ?? 0),
  };
}

function getErrorMessage(error, fallback) {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    fallback
  );
}

export default function Stocks() {
  const [stocks, setStocks] = useState([]);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [showForm, setShowForm] = useState(false);
  const [editingStock, setEditingStock] = useState(null);
  const [deletingStock, setDeletingStock] = useState(null);
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pageError, setPageError] = useState("");

  const loadStocks = useCallback(async () => {
    setLoading(true);
    setPageError("");

    try {
      const response = await stocksAPI.getAll();
      setStocks(getRows(response).map(normalizeStock));
    } catch (error) {
      setPageError(
        getErrorMessage(
          error,
          "Unable to load stocks. Check that the backend is running."
        )
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStocks();
  }, [loadStocks]);

  const filteredStocks = useMemo(() => {
    const query = search.trim().toLowerCase();

    return stocks
      .filter(
        (stock) =>
          stock.company_name.toLowerCase().includes(query) ||
          stock.symbol.toLowerCase().includes(query)
      )
      .sort((a, b) => {
        if (sortBy === "price-low") {
          return a.current_price - b.current_price;
        }

        if (sortBy === "price-high") {
          return b.current_price - a.current_price;
        }

        return a.company_name.localeCompare(b.company_name);
      });
  }, [stocks, search, sortBy]);

  const averagePrice =
    stocks.length > 0
      ? stocks.reduce(
          (total, stock) => total + Number(stock.current_price || 0),
          0
        ) / stocks.length
      : 0;

  function openAddForm() {
    setEditingStock(null);
    setShowForm(true);
    setNotice("");
    setPageError("");
  }

  function openEditForm(stock) {
    setEditingStock(stock);
    setShowForm(true);
    setNotice("");
    setPageError("");
  }

  function closeForm() {
    if (saving) return;
    setShowForm(false);
    setEditingStock(null);
  }

  async function saveStock(formData) {
    setNotice("");
    setPageError("");

    const companyName = String(formData.company_name ?? "").trim();
    const symbol = String(formData.symbol ?? "").trim().toUpperCase();
    const price = Number(formData.current_price);

    if (!companyName || !symbol) {
      setPageError("Company name and stock symbol are required.");
      return;
    }

    if (!Number.isFinite(price) || price < 0) {
      setPageError("Please enter a valid stock price.");
      return;
    }

    const duplicate = stocks.some(
      (stock) =>
        stock.symbol.toLowerCase() === symbol.toLowerCase() &&
        String(stock.stock_id) !== String(editingStock?.stock_id)
    );

    if (duplicate) {
      setPageError(`The symbol ${symbol} already exists.`);
      return;
    }

    const payload = {
      company_name: companyName,
      symbol,
      current_price: price,
    };

    setSaving(true);

    try {
      if (editingStock) {
        await stocksAPI.update(editingStock.stock_id, payload);
        setNotice(`${symbol} updated successfully.`);
      } else {
        await stocksAPI.create(payload);
        setNotice(`${symbol} added successfully.`);
      }

      setShowForm(false);
      setEditingStock(null);
      await loadStocks();
    } catch (error) {
      setPageError(
        getErrorMessage(
          error,
          `Unable to ${editingStock ? "update" : "create"} this stock.`
        )
      );
    } finally {
      setSaving(false);
    }
  }

  async function confirmDelete() {
    if (!deletingStock) return;

    setNotice("");
    setPageError("");

    try {
      await stocksAPI.delete(deletingStock.stock_id);
      setNotice(`${deletingStock.symbol} deleted successfully.`);
      setDeletingStock(null);
      await loadStocks();
    } catch (error) {
      setPageError(
        getErrorMessage(error, "Unable to delete this stock.")
      );
    }
  }

  return (
    <div className="space-y-7">
      <section className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
        <div>
          <p className="mb-2 text-[10px] font-bold tracking-[2px] text-emerald-300">
            MARKET MANAGEMENT
          </p>

          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Stocks
          </h1>

          <p className="mt-2 text-sm text-slate-400">
            Manage the stocks available in your portfolio system.
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            onClick={loadStocks}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 px-4 py-3 text-sm font-semibold text-slate-200 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>

          <button
            type="button"
            onClick={openAddForm}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-400 px-4 py-3 text-sm font-bold text-slate-950 transition hover:bg-emerald-300"
          >
            <Plus size={18} />
            Add Stock
          </button>
        </div>
      </section>

      {notice && (
        <div
          role="status"
          className="flex items-center justify-between gap-3 rounded-xl border border-emerald-400/20 bg-emerald-400/5 px-4 py-3 text-sm text-emerald-300"
        >
          <span>{notice}</span>
          <button
            type="button"
            onClick={() => setNotice("")}
            className="text-xs text-slate-400 hover:text-white"
          >
            Dismiss
          </button>
        </div>
      )}

      {pageError && (
        <div
          role="alert"
          className="flex items-start justify-between gap-3 rounded-xl border border-rose-400/20 bg-rose-400/5 px-4 py-3 text-sm text-rose-300"
        >
          <span>{pageError}</span>
          <button
            type="button"
            onClick={() => setPageError("")}
            className="shrink-0 text-xs text-slate-400 hover:text-white"
          >
            Dismiss
          </button>
        </div>
      )}

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <article className="rounded-2xl border border-slate-800 bg-[#121c27] p-5">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-400">Total Stocks</span>
            <Package size={20} className="text-emerald-300" />
          </div>

          <p className="mt-5 text-3xl font-bold text-white">
            {loading ? "—" : stocks.length}
          </p>

          <p className="mt-2 text-xs text-slate-500">
            Stock records in your database
          </p>
        </article>

        <article className="rounded-2xl border border-slate-800 bg-[#121c27] p-5">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-400">Average Price</span>
            <TrendingUp size={20} className="text-emerald-300" />
          </div>

          <p className="mt-5 break-words text-2xl font-bold text-white">
            {loading ? "—" : formatCurrency(averagePrice)}
          </p>

          <p className="mt-2 text-xs text-slate-500">
            Average of listed stock prices
          </p>
        </article>

        <article className="rounded-2xl border border-slate-800 bg-[#121c27] p-5">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-400">Search Results</span>
            <Search size={20} className="text-emerald-300" />
          </div>

          <p className="mt-5 text-3xl font-bold text-white">
            {loading ? "—" : filteredStocks.length}
          </p>

          <p className="mt-2 text-xs text-slate-500">
            Matching stocks
          </p>
        </article>
      </section>

      <section className="rounded-2xl border border-slate-800 bg-[#121c27] p-4 sm:p-5">
        <div className="flex flex-col gap-3 md:flex-row">
          <div className="relative min-w-0 flex-1">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
            />

            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by company or stock symbol..."
              aria-label="Search stocks"
              className="w-full rounded-xl border border-slate-700 bg-slate-900 py-3 pl-11 pr-4 text-sm text-white outline-none placeholder:text-slate-500 focus:border-emerald-400"
            />
          </div>

          <div className="relative">
            <SlidersHorizontal
              size={16}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <select
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value)}
              aria-label="Sort stocks"
              className="w-full appearance-none rounded-xl border border-slate-700 bg-slate-900 py-3 pl-9 pr-9 text-sm text-slate-200 outline-none focus:border-emerald-400 md:w-52"
            >
              <option value="name">Sort by company</option>
              <option value="price-low">Price: Low to high</option>
              <option value="price-high">Price: High to low</option>
            </select>
          </div>
        </div>
      </section>

      {loading ? (
        <section className="rounded-2xl border border-slate-800 bg-[#121c27] px-5 py-12 text-center text-sm text-slate-400">
          Loading stocks from the database...
        </section>
      ) : (
        <StockTable
          stocks={filteredStocks}
          onEdit={openEditForm}
          onDelete={setDeletingStock}
        />
      )}

      {showForm && (
        <StockForm
          stock={editingStock}
          onSave={saveStock}
          onCancel={closeForm}
        />
      )}

      {deletingStock && (
        <DeleteStockModal
          stock={deletingStock}
          onConfirm={confirmDelete}
          onCancel={() => setDeletingStock(null)}
        />
      )}
    </div>
  );
}
