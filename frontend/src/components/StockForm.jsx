
import { useEffect, useState } from "react";
import { X } from "lucide-react";

const initialForm = {
  company_name: "",
  symbol: "",
  current_price: "",
};

export default function StockForm({ stock, onSave, onCancel }) {
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");

  useEffect(() => {
    if (stock) {
      setForm({
        company_name: stock.company_name,
        symbol: stock.symbol,
        current_price: String(stock.current_price),
      });
    } else {
      setForm(initialForm);
    }

    setError("");
  }, [stock]);

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: name === "symbol" ? value.toUpperCase() : value,
    }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    setError("");

    const companyName = form.company_name.trim();
    const symbol = form.symbol.trim();
    const price = Number(form.current_price);

    if (!companyName || !symbol || form.current_price === "") {
      setError("Please fill in all fields.");
      return;
    }

    if (!/^[A-Z0-9.-]{1,15}$/.test(symbol)) {
      setError("Use a valid symbol with up to 15 letters, numbers, dots or hyphens.");
      return;
    }

    if (!Number.isFinite(price) || price < 0) {
      setError("Price must be a valid, non-negative number.");
      return;
    }

    onSave({
      ...(stock ? { stock_id: stock.stock_id } : {}),
      company_name: companyName,
      symbol,
      current_price: price,
    });
  }

  const inputClass =
    "mt-2 w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-emerald-400";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/70 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onCancel();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="stock-form-title"
        className="my-auto w-full max-w-lg rounded-2xl border border-slate-700 bg-[#121c27] p-6 shadow-2xl sm:p-7"
      >
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h2
              id="stock-form-title"
              className="text-xl font-bold text-white"
            >
              {stock ? "Edit Stock" : "Add New Stock"}
            </h2>
            <p className="mt-2 text-sm text-slate-400">
              Enter the stock information below.
            </p>
          </div>

          <button
            type="button"
            onClick={onCancel}
            aria-label="Close form"
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label
              htmlFor="company_name"
              className="text-sm font-medium text-slate-300"
            >
              Company name
            </label>
            <input
              id="company_name"
              name="company_name"
              value={form.company_name}
              onChange={handleChange}
              maxLength={100}
              placeholder="e.g. Reliance Industries"
              className={inputClass}
              required
              autoFocus
            />
          </div>

          <div>
            <label
              htmlFor="symbol"
              className="text-sm font-medium text-slate-300"
            >
              Stock symbol
            </label>
            <input
              id="symbol"
              name="symbol"
              value={form.symbol}
              onChange={handleChange}
              maxLength={15}
              placeholder="e.g. RELIANCE"
              className={inputClass}
              required
            />
          </div>

          <div>
            <label
              htmlFor="current_price"
              className="text-sm font-medium text-slate-300"
            >
              Current price (₹)
            </label>
            <input
              id="current_price"
              name="current_price"
              type="number"
              min="0"
              step="0.01"
              value={form.current_price}
              onChange={handleChange}
              placeholder="e.g. 1450.00"
              className={inputClass}
              required
            />
          </div>

          {error && (
            <p role="alert" className="text-sm text-rose-400">
              {error}
            </p>
          )}

          <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onCancel}
              className="rounded-xl border border-slate-700 px-4 py-3 text-sm font-semibold text-slate-300 hover:bg-slate-800"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="rounded-xl bg-emerald-400 px-5 py-3 text-sm font-bold text-slate-950 hover:bg-emerald-300"
            >
              {stock ? "Save Changes" : "Add Stock"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
