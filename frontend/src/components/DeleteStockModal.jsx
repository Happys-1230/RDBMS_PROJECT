
import { AlertTriangle, X } from "lucide-react";

export default function DeleteStockModal({
  stock,
  onConfirm,
  onCancel,
}) {
  if (!stock) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <section
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="delete-stock-title"
        className="w-full max-w-md rounded-2xl border border-slate-700 bg-[#121c27] p-6 shadow-2xl"
      >
        <div className="flex items-start justify-between">
          <div className="grid h-12 w-12 place-items-center rounded-xl bg-rose-400/10 text-rose-400">
            <AlertTriangle size={23} />
          </div>

          <button
            onClick={onCancel}
            aria-label="Cancel deletion"
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            <X size={19} />
          </button>
        </div>

        <h2
          id="delete-stock-title"
          className="mt-5 text-xl font-bold text-white"
        >
          Delete stock?
        </h2>

        <p className="mt-3 text-sm leading-6 text-slate-400">
          Are you sure you want to delete{" "}
          <strong className="text-slate-200">
            {stock.company_name} ({stock.symbol})
          </strong>
          ? This action cannot be undone.
        </p>

        <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            onClick={onCancel}
            className="rounded-xl border border-slate-700 px-4 py-3 text-sm font-semibold text-slate-300 hover:bg-slate-800"
          >
            Cancel
          </button>

          <button
            onClick={onConfirm}
            className="rounded-xl bg-rose-500 px-4 py-3 text-sm font-bold text-white hover:bg-rose-400"
          >
            Delete Stock
          </button>
        </div>
      </section>
    </div>
  );
}
