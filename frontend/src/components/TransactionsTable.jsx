
import {
  ArrowDownRight,
  ArrowUpRight,
} from "lucide-react";

const formatCurrency = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);

export default function TransactionsTable({ transactions, onViewAll }) {
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-800 bg-[#121c27]">
      <div className="flex items-center justify-between gap-3 p-5">
        <div>
          <h3 className="font-semibold text-white">
            Recent Transactions
          </h3>
          <p className="mt-1 text-xs text-slate-400">
            Your latest buy and sell activity.
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
              <th className="px-5 py-4 font-medium">TRANSACTION</th>
              <th className="px-4 py-4 font-medium">TYPE</th>
              <th className="px-4 py-4 font-medium">QUANTITY</th>
              <th className="px-4 py-4 font-medium">AMOUNT</th>
              <th className="px-5 py-4 font-medium">DATE</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-800/80">
            {transactions.map((transaction) => {
              const isBuy = transaction.type === "BUY";
              const amount = transaction.quantity * transaction.price;

              return (
                <tr
                  key={transaction.id}
                  className="transition hover:bg-slate-800/30"
                >
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl ${
                          isBuy
                            ? "bg-emerald-400/10 text-emerald-300"
                            : "bg-rose-400/10 text-rose-300"
                        }`}
                      >
                        {isBuy ? (
                          <ArrowDownRight size={18} />
                        ) : (
                          <ArrowUpRight size={18} />
                        )}
                      </div>

                      <div>
                        <p className="font-medium text-slate-100">
                          {transaction.company}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          {transaction.id}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-4">
                    <span
                      className={`rounded-md px-2 py-1 text-[10px] font-bold ${
                        isBuy
                          ? "bg-emerald-400/10 text-emerald-300"
                          : "bg-rose-400/10 text-rose-300"
                      }`}
                    >
                      {transaction.type}
                    </span>
                  </td>

                  <td className="px-4 py-4 text-slate-300">
                    {transaction.quantity} shares
                  </td>

                  <td className="px-4 py-4 font-medium text-white">
                    {formatCurrency(amount)}
                  </td>

                  <td className="px-5 py-4 text-xs text-slate-400">
                    {transaction.date}
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
