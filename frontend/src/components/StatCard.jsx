
import {
  Wallet,
  ChartNoAxesCombined,
  TrendingUp,
  Layers3,
  ArrowUpRight,
} from "lucide-react";

const icons = {
  wallet: Wallet,
  investment: ChartNoAxesCombined,
  returns: TrendingUp,
  holdings: Layers3,
};

const formatCurrency = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);

export default function StatCard({ stat }) {
  const Icon = icons[stat.icon];

  const isMoney = stat.icon !== "holdings";

  return (
    <article className="min-w-0 rounded-2xl border border-slate-800 bg-[#121c27] p-4 transition hover:border-slate-700 sm:p-5">
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs leading-5 text-slate-400 sm:text-sm">
          {stat.title}
        </p>

        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-emerald-400/10 text-emerald-300">
          <Icon size={19} />
        </div>
      </div>

      <h2 className="mt-5 break-words text-xl font-bold tracking-tight text-white sm:text-2xl">
        {isMoney
          ? formatCurrency(stat.value)
          : stat.value.toLocaleString("en-IN")}
      </h2>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-300">
          <ArrowUpRight size={14} />
          {stat.change}
        </span>
        <span className="text-xs text-slate-500">
          {stat.description}
        </span>
      </div>
    </article>
  );
}
