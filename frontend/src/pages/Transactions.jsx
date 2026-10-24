import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Search,
  Plus,
  X,
  ArrowLeftRight,
  IndianRupee,
  CalendarDays,
  Filter,
  Pencil,
  Trash2,
  RefreshCw,
} from "lucide-react";

import { transactionsAPI, stocksAPI, portfoliosAPI } from "../api/api";

const currency = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(value) || 0);

const formatDate = (date) => {
  if (!date) return "—";
  const value = String(date).slice(0, 10);
  const parsed = new Date(`${value}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

function getRows(response, possibleKeys = []) {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.data)) return response.data;
  for (const key of possibleKeys) {
    if (Array.isArray(response?.[key])) return response[key];
  }
  return [];
}

function normalizeStock(stock) {
  return {
    ...stock,
    stock_id: Number(stock.stock_id ?? stock.id),
    company_name: stock.company_name ?? stock.companyName ?? stock.name ?? "",
    symbol: stock.symbol ?? "",
    current_price: Number(stock.current_price ?? stock.currentPrice ?? 0),
  };
}

function normalizePortfolio(portfolio) {
  return {
    ...portfolio,
    portfolio_id: Number(portfolio.portfolio_id ?? portfolio.id),
    portfolio_name:
      portfolio.portfolio_name ?? portfolio.name ?? portfolio.portfolioName ?? "",
    investor_name: portfolio.investor_name ?? portfolio.investorName ?? "",
  };
}

function normalizeTransaction(transaction) {
  const stock = transaction.stock ?? {};
  const portfolio = transaction.portfolio ?? {};
  const stockId = Number(transaction.stock_id ?? stock.stock_id ?? transaction.stockId);
  const portfolioId = Number(
    transaction.portfolio_id ?? portfolio.portfolio_id ?? transaction.portfolioId
  );

  return {
    ...transaction,
    transaction_id: Number(
      transaction.transaction_id ?? transaction.id ?? transaction.transactionId
    ),
    portfolio_id: portfolioId,
    stock_id: stockId,
    transaction_type: String(
      transaction.transaction_type ?? transaction.type ?? "BUY"
    ).toUpperCase(),
    quantity: Number(transaction.quantity) || 0,
    price: Number(transaction.price) || 0,
    transaction_date: String(
      transaction.transaction_date ?? transaction.date ?? ""
    ).slice(0, 10),
    company:
      transaction.company_name ??
      transaction.company ??
      transaction.stock_name ??
      stock.company_name ??
      "",
    symbol: transaction.symbol ?? stock.symbol ?? "",
    portfolio_name:
      transaction.portfolio_name ?? portfolio.portfolio_name ?? "",
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

function TransactionForm({
  transaction,
  stocks,
  portfolios,
  onClose,
  onSave,
  saving,
}) {
  const [portfolioId, setPortfolioId] = useState(
    transaction?.portfolio_id ? String(transaction.portfolio_id) : String(portfolios[0]?.portfolio_id ?? "")
  );
  const [stockId, setStockId] = useState(
    transaction?.stock_id ? String(transaction.stock_id) : String(stocks[0]?.stock_id ?? "")
  );
  const [type, setType] = useState(transaction?.transaction_type ?? "BUY");
  const [quantity, setQuantity] = useState(
    transaction ? String(transaction.quantity) : "1"
  );
  const [price, setPrice] = useState(
    transaction ? String(transaction.price) : String(stocks[0]?.current_price ?? "")
  );
  const [date, setDate] = useState(
    transaction?.transaction_date ??
      new Date().toISOString().slice(0, 10)
  );
  const [error, setError] = useState("");

  const selectedStock = stocks.find(
    (stock) => String(stock.stock_id) === String(stockId)
  );

  function handleStockChange(value) {
    setStockId(value);
    const stock = stocks.find((item) => String(item.stock_id) === String(value));
    if (stock && !transaction) setPrice(String(stock.current_price ?? ""));
  }

  function handleSubmit(event) {
    event.preventDefault();
    setError("");

    const qty = Number(quantity);
    const transactionPrice = Number(price);

    if (!portfolioId || !portfolios.some((item) => String(item.portfolio_id) === String(portfolioId))) {
      setError("Please select a valid portfolio.");
      return;
    }
    if (!stockId || !stocks.some((item) => String(item.stock_id) === String(stockId))) {
      setError("Please select a valid stock.");
      return;
    }
    if (!Number.isInteger(qty) || qty <= 0) {
      setError("Quantity must be a positive whole number.");
      return;
    }
    if (!Number.isFinite(transactionPrice) || transactionPrice < 0) {
      setError("Price must be zero or greater.");
      return;
    }
    if (!date) {
      setError("Please select a transaction date.");
      return;
    }

    onSave({
      portfolio_id: Number(portfolioId),
      stock_id: Number(stockId),
      transaction_type: type,
      quantity: qty,
      price: transactionPrice,
      transaction_date: date,
    });
  }

  const fieldClass =
    "mt-2 w-full rounded-xl border border-slate-700 bg-[#0b1119] px-3 py-3 text-sm text-white outline-none focus:border-emerald-400";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !saving) onClose();
      }}
    >
      <section className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-slate-700 bg-[#121c27] p-5 shadow-2xl sm:p-7">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-white">
              {transaction ? "Edit Transaction" : "New Transaction"}
            </h2>
            <p className="mt-1 text-sm text-slate-400">
              Record a stock purchase or sale.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close form"
            disabled={saving}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </div>

        {(!stocks.length || !portfolios.length) && (
          <p className="mt-5 rounded-xl border border-amber-400/20 bg-amber-400/5 p-3 text-sm text-amber-200">
            You need at least one stock and one portfolio in the database before recording a transaction.
          </p>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          <div>
            <label className="text-sm font-medium text-slate-300">
              Transaction type
            </label>
            <div className="mt-2 grid grid-cols-2 gap-3">
              {["BUY", "SELL"].map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setType(item)}
                  className={`rounded-xl border px-4 py-3 text-sm font-bold transition ${
                    type === item
                      ? item === "BUY"
                        ? "border-emerald-400 bg-emerald-400/10 text-emerald-300"
                        : "border-rose-400 bg-rose-400/10 text-rose-300"
                      : "border-slate-700 text-slate-400 hover:bg-slate-800"
                  }`}
                >
                  {item === "BUY" ? (
                    <ArrowDownLeft className="mr-2 inline" size={17} />
                  ) : (
                    <ArrowUpRight className="mr-2 inline" size={17} />
                  )}
                  {item}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-slate-300">
              Portfolio *
            </label>
            <select
              required
              value={portfolioId}
              onChange={(event) => setPortfolioId(event.target.value)}
              className={fieldClass}
            >
              <option value="">Select a portfolio</option>
              {portfolios.map((portfolio) => (
                <option key={portfolio.portfolio_id} value={portfolio.portfolio_id}>
                  {portfolio.portfolio_name}
                  {portfolio.investor_name ? ` — ${portfolio.investor_name}` : ""}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-slate-300">Stock *</label>
            <select
              required
              value={stockId}
              onChange={(event) => handleStockChange(event.target.value)}
              className={fieldClass}
            >
              <option value="">Select a stock</option>
              {stocks.map((stock) => (
                <option key={stock.stock_id} value={stock.stock_id}>
                  {stock.symbol} — {stock.company_name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-slate-300">Quantity *</label>
              <input
                type="number"
                min="1"
                step="1"
                required
                value={quantity}
                onChange={(event) => setQuantity(event.target.value)}
                className={fieldClass}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-300">
                Price per share (₹) *
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                required
                value={price}
                onChange={(event) => setPrice(event.target.value)}
                className={fieldClass}
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-slate-300">
              Transaction date *
            </label>
            <input
              type="date"
              required
              value={date}
              onChange={(event) => setDate(event.target.value)}
              className={fieldClass}
            />
          </div>

          <div className="rounded-xl border border-slate-700 bg-[#0b1119] p-4">
            <p className="text-sm text-slate-400">Total transaction value</p>
            <p className="mt-2 text-2xl font-bold text-white">
              {currency(Math.max(0, Number(quantity) || 0) * Math.max(0, Number(price) || 0))}
            </p>
            {selectedStock && (
              <p className="mt-1 text-xs text-slate-500">
                Selected stock: {selectedStock.symbol}
              </p>
            )}
          </div>

          {error && (
            <p role="alert" className="text-sm text-rose-300">
              {error}
            </p>
          )}

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="rounded-xl border border-slate-700 px-4 py-3 text-sm font-semibold text-slate-300 hover:bg-slate-800 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || !stocks.length || !portfolios.length}
              className="rounded-xl bg-emerald-400 px-5 py-3 text-sm font-bold text-slate-950 hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? "Saving..." : transaction ? "Save Changes" : "Save Transaction"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

export default function Transactions() {
  const [transactionList, setTransactionList] = useState([]);
  const [stocks, setStocks] = useState([]);
  const [portfolios, setPortfolios] = useState([]);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("ALL");
  const [showForm, setShowForm] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [deletingTransaction, setDeletingTransaction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pageError, setPageError] = useState("");
  const [notice, setNotice] = useState("");

  const loadData = useCallback(async () => {
    setLoading(true);
    setPageError("");

    const results = await Promise.allSettled([
      transactionsAPI.getAll(),
      stocksAPI.getAll(),
      portfoliosAPI.getAll(),
    ]);

    const [transactionsResult, stocksResult, portfoliosResult] = results;
    const failures = [];

    if (transactionsResult.status === "fulfilled") {
      setTransactionList(
        getRows(transactionsResult.value, ["transactions"]).map(normalizeTransaction)
      );
    } else {
      failures.push(
        getErrorMessage(
          transactionsResult.reason,
          "Unable to load transactions."
        )
      );
    }

    if (stocksResult.status === "fulfilled") {
      setStocks(getRows(stocksResult.value, ["stocks"]).map(normalizeStock));
    } else {
      failures.push(getErrorMessage(stocksResult.reason, "Unable to load stocks."));
    }

    if (portfoliosResult.status === "fulfilled") {
      setPortfolios(
        getRows(portfoliosResult.value, ["portfolios"]).map(normalizePortfolio)
      );
    } else {
      failures.push(
        getErrorMessage(portfoliosResult.reason, "Unable to load portfolios.")
      );
    }

    if (failures.length) setPageError(failures.join(" "));
    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredTransactions = useMemo(() => {
    const term = search.trim().toLowerCase();

    return transactionList
      .filter((transaction) => {
        const id = String(transaction.transaction_id ?? "");
        const matchesSearch =
          id.toLowerCase().includes(term) ||
          transaction.company.toLowerCase().includes(term) ||
          transaction.symbol.toLowerCase().includes(term) ||
          transaction.portfolio_name.toLowerCase().includes(term);

        const matchesType =
          filterType === "ALL" || transaction.transaction_type === filterType;

        return matchesSearch && matchesType;
      })
      .sort(
        (a, b) =>
          b.transaction_date.localeCompare(a.transaction_date) ||
          b.transaction_id - a.transaction_id
      );
  }, [transactionList, search, filterType]);

  const totalBuys = transactionList.filter(
    (transaction) => transaction.transaction_type === "BUY"
  ).length;

  const totalSells = transactionList.filter(
    (transaction) => transaction.transaction_type === "SELL"
  ).length;

  const totalValue = transactionList.reduce(
    (sum, transaction) =>
      sum + transaction.quantity * transaction.price,
    0
  );

  function openAddForm() {
    setEditingTransaction(null);
    setNotice("");
    setPageError("");
    setShowForm(true);
  }

  function openEditForm(transaction) {
    setEditingTransaction(transaction);
    setNotice("");
    setPageError("");
    setShowForm(true);
  }

  function closeForm() {
    if (saving) return;
    setShowForm(false);
    setEditingTransaction(null);
  }

  async function saveTransaction(formData) {
    setNotice("");
    setPageError("");
    setSaving(true);

    try {
      if (editingTransaction) {
        await transactionsAPI.update(editingTransaction.transaction_id, formData);
        setNotice(`Transaction #${editingTransaction.transaction_id} updated successfully.`);
      } else {
        await transactionsAPI.create(formData);
        setNotice("Transaction created successfully.");
      }

      setShowForm(false);
      setEditingTransaction(null);
      await loadData();
    } catch (error) {
      setPageError(
        getErrorMessage(
          error,
          `Unable to ${editingTransaction ? "update" : "create"} the transaction.`
        )
      );
    } finally {
      setSaving(false);
    }
  }

  async function confirmDelete() {
    if (!deletingTransaction) return;

    setPageError("");
    setNotice("");

    try {
      await transactionsAPI.delete(deletingTransaction.transaction_id);
      setNotice(`Transaction #${deletingTransaction.transaction_id} deleted successfully.`);
      setDeletingTransaction(null);
      await loadData();
    } catch (error) {
      setPageError(getErrorMessage(error, "Unable to delete the transaction."));
    }
  }

  return (
    <div className="space-y-6">
      <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="mb-2 text-[10px] font-bold tracking-[2px] text-emerald-300">
            STOCKWISE WORKSPACE
          </p>
          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Transactions
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            Track and manage your stock purchases and sales.
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            onClick={loadData}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 px-4 py-3 text-sm font-semibold text-slate-200 transition hover:bg-slate-800 disabled:opacity-60"
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
            New Transaction
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

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 2xl:grid-cols-4">
        <SummaryCard
          title="Total Transactions"
          value={loading ? "—" : transactionList.length}
          description="All recorded transactions"
          icon={ArrowLeftRight}
        />
        <SummaryCard
          title="Buy Orders"
          value={loading ? "—" : totalBuys}
          description="Purchase transactions"
          icon={ArrowDownLeft}
        />
        <SummaryCard
          title="Sell Orders"
          value={loading ? "—" : totalSells}
          description="Sale transactions"
          icon={ArrowUpRight}
        />
        <SummaryCard
          title="Transaction Value"
          value={loading ? "—" : currency(totalValue)}
          description="Combined gross transaction value"
          icon={IndianRupee}
        />
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-800 bg-[#121c27]">
        <div className="flex flex-col gap-4 border-b border-slate-800 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-semibold text-white">Transaction History</h2>
            <p className="mt-1 text-xs text-slate-400">
              Review your recorded stock activity.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative">
              <Search
                size={17}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
              />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search transactions..."
                aria-label="Search transactions"
                className="w-full rounded-xl border border-slate-700 bg-[#0b1119] py-2.5 pl-9 pr-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-emerald-400 sm:w-64"
              />
            </div>

            <div className="relative">
              <Filter
                size={15}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <select
                value={filterType}
                onChange={(event) => setFilterType(event.target.value)}
                aria-label="Filter transaction type"
                className="w-full appearance-none rounded-xl border border-slate-700 bg-[#0b1119] py-2.5 pl-9 pr-8 text-sm text-slate-200 outline-none focus:border-emerald-400"
              >
                <option value="ALL">All types</option>
                <option value="BUY">Buy only</option>
                <option value="SELL">Sell only</option>
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px] text-left text-sm">
            <thead className="bg-[#0e1722] text-[11px] uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-5 py-4 font-semibold">Transaction</th>
                <th className="px-5 py-4 font-semibold">Portfolio</th>
                <th className="px-5 py-4 font-semibold">Stock</th>
                <th className="px-5 py-4 font-semibold">Type</th>
                <th className="px-5 py-4 font-semibold">Quantity</th>
                <th className="px-5 py-4 font-semibold">Price</th>
                <th className="px-5 py-4 font-semibold">Total amount</th>
                <th className="px-5 py-4 font-semibold">Date</th>
                <th className="px-5 py-4 font-semibold">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-800/80">
              {!loading &&
                filteredTransactions.map((transaction) => (
                  <tr
                    key={transaction.transaction_id}
                    className="transition hover:bg-slate-800/30"
                  >
                    <td className="px-5 py-4 font-medium text-slate-300">
                      #{transaction.transaction_id}
                    </td>
                    <td className="px-5 py-4 text-slate-300">
                      {transaction.portfolio_name || `Portfolio #${transaction.portfolio_id}`}
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-semibold text-white">
                        {transaction.symbol || `Stock #${transaction.stock_id}`}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {transaction.company || "Stock"}
                      </p>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-bold ${
                          transaction.transaction_type === "BUY"
                            ? "bg-emerald-400/10 text-emerald-300"
                            : "bg-rose-400/10 text-rose-300"
                        }`}
                      >
                        {transaction.transaction_type === "BUY" ? (
                          <ArrowDownLeft size={14} />
                        ) : (
                          <ArrowUpRight size={14} />
                        )}
                        {transaction.transaction_type}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-slate-300">{transaction.quantity}</td>
                    <td className="px-5 py-4 whitespace-nowrap text-slate-300">
                      {currency(transaction.price)}
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap font-semibold text-white">
                      {currency(transaction.quantity * transaction.price)}
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap text-slate-400">
                      <CalendarDays size={14} className="mr-2 inline text-slate-500" />
                      {formatDate(transaction.transaction_date)}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => openEditForm(transaction)}
                          aria-label={`Edit transaction ${transaction.transaction_id}`}
                          className="rounded-lg p-2 text-slate-400 hover:bg-slate-700 hover:text-white"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeletingTransaction(transaction)}
                          aria-label={`Delete transaction ${transaction.transaction_id}`}
                          className="rounded-lg p-2 text-slate-400 hover:bg-rose-400/10 hover:text-rose-300"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

              {!loading && filteredTransactions.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-5 py-12 text-center text-sm text-slate-500">
                    No transactions found. Try changing your search or filter.
                  </td>
                </tr>
              )}

              {loading && (
                <tr>
                  <td colSpan={9} className="px-5 py-12 text-center text-sm text-slate-400">
                    Loading transactions from the database...
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col gap-2 border-t border-slate-800 px-5 py-4 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <span>
            Showing {filteredTransactions.length} of {transactionList.length} transactions
          </span>
          <span>Live database records</span>
        </div>
      </section>

      {showForm && (
        <TransactionForm
          transaction={editingTransaction}
          stocks={stocks}
          portfolios={portfolios}
          onClose={closeForm}
          onSave={saveTransaction}
          saving={saving}
        />
      )}

      {deletingTransaction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <section className="w-full max-w-md rounded-2xl border border-slate-700 bg-[#121c27] p-6">
            <div className="mb-4 grid h-12 w-12 place-items-center rounded-xl bg-rose-400/10 text-rose-300">
              <Trash2 size={22} />
            </div>
            <h2 className="text-lg font-bold text-white">Delete transaction?</h2>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              Are you sure you want to delete transaction #{deletingTransaction.transaction_id}? This action removes the record from the database.
            </p>
            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setDeletingTransaction(null)}
                className="rounded-xl border border-slate-700 px-4 py-3 text-sm font-semibold text-slate-300 hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="rounded-xl bg-rose-500 px-4 py-3 text-sm font-bold text-white hover:bg-rose-400"
              >
                Delete Transaction
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
