
import { ArrowUpRight } from "lucide-react";

const formatCurrency = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);

export default function HoldingsTable({ holdings, onViewAll }) {
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-800 bg-[#121c27]">
      <div className="flex items-center justify-between gap-3 p-5">
        <div>
          <h3 className="font-semibold text-white">Your Holdings</h3>
          <p className="mt-1 text-xs text-slate-400">
            A summary of your stock positions.
          </p>
        </div>

        <button
          onClick={onViewAll}
          className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-emerald-300 hover:text-emerald-200"
        >
          View all <ArrowUpRight size={15} />
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[650px] text-left text-sm">
          <thead className="border-y border-slate-800 bg-slate-900/30 text-[10px] tracking-wider text-slate-500">
            <tr>
              <th className="px-5 py-4 font-medium">STOCK</th>
              <th className="px-4 py-4 font-medium">SHARES</th>
              <th className="px-4 py-4 font-medium">PRICE</th>
              <th className="px-4 py-4 font-medium">MARKET VALUE</th>
              <th className="px-5 py-4 font-medium">CHANGE</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-800/80">
            {holdings.map((stock) => {
              const positive = stock.change.startsWith("+");

              return (
                <tr
                  key={stock.symbol}
                  className="transition hover:bg-slate-800/30"
                >
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-emerald-400/10 text-xs font-bold text-emerald-300">
                        {stock.symbol.slice(0, 2)}
                      </div>

                      <div>
                        <p className="font-semibold text-slate-100">
                          {stock.symbol}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          {stock.company}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-4 text-slate-300">
                    {stock.shares}
                  </td>

                  <td className="px-4 py-4 text-slate-300">
                    {formatCurrency(stock.price)}
                  </td>

                  <td className="px-4 py-4 font-medium text-white">
                    {formatCurrency(stock.value)}
                  </td>

                  <td
                    className={`px-5 py-4 text-xs font-semibold ${
                      positive ? "text-emerald-300" : "text-rose-400"
                    }`}
                  >
                    {stock.change}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
