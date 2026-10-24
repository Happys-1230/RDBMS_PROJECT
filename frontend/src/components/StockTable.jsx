
import { Pencil, Trash2, PackageOpen } from "lucide-react";

const formatCurrency = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);

export default function StockTable({
  stocks,
  onEdit,
  onDelete,
}) {
  if (stocks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-700 bg-[#121c27] px-5 py-16 text-center">
        <PackageOpen size={36} className="text-slate-500" />

        <h3 className="mt-4 font-semibold text-white">
          No stocks found
        </h3>

        <p className="mt-2 text-sm text-slate-400">
          Try another search or add a new stock.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-800 bg-[#121c27]">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="border-b border-slate-800 bg-slate-900/40 text-[10px] tracking-wider text-slate-500">
            <tr>
              <th className="px-5 py-4 font-semibold">COMPANY</th>
              <th className="px-4 py-4 font-semibold">SYMBOL</th>
              <th className="px-4 py-4 font-semibold">CURRENT PRICE</th>
              <th className="px-4 py-4 font-semibold">STOCK ID</th>
              <th className="px-5 py-4 text-right font-semibold">
                ACTIONS
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-800/80">
            {stocks.map((stock) => (
              <tr
                key={stock.stock_id}
                className="transition hover:bg-slate-800/30"
              >
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-emerald-400/10 font-bold text-emerald-300">
                      {stock.symbol.slice(0, 2)}
                    </div>

                    <span className="font-medium text-slate-100">
                      {stock.company_name}
                    </span>
                  </div>
                </td>

                <td className="px-4 py-4">
                  <span className="rounded-md bg-slate-800 px-2 py-1 text-xs font-semibold text-slate-300">
                    {stock.symbol}
                  </span>
                </td>

                <td className="px-4 py-4 font-semibold text-white">
                  {formatCurrency(Number(stock.current_price))}
                </td>

                <td className="px-4 py-4 text-slate-400">
                  #{stock.stock_id}
                </td>

                <td className="px-5 py-4">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => onEdit(stock)}
                      aria-label={`Edit ${stock.symbol}`}
                      title="Edit stock"
                      className="rounded-lg border border-slate-700 p-2 text-slate-300 transition hover:border-emerald-400/50 hover:bg-emerald-400/10 hover:text-emerald-300"
                    >
                      <Pencil size={16} />
                    </button>

                    <button
                      onClick={() => onDelete(stock)}
                      aria-label={`Delete ${stock.symbol}`}
                      title="Delete stock"
                      className="rounded-lg border border-slate-700 p-2 text-slate-300 transition hover:border-rose-400/50 hover:bg-rose-400/10 hover:text-rose-300"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="border-t border-slate-800 px-5 py-4 text-xs text-slate-500">
        Showing {stocks.length} stock{stocks.length === 1 ? "" : "s"}
      </div>
    </div>
  );
}
