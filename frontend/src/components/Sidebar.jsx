
import {
  LayoutDashboard,
  BriefcaseBusiness,
  ChartNoAxesCombined,
  ArrowLeftRight,
  Users,
  Settings,
  CircleHelp,
  Wallet,
} from "lucide-react";

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard },
  { label: "Portfolios", icon: BriefcaseBusiness },
  { label: "Stocks", icon: ChartNoAxesCombined },
  { label: "Transactions", icon: ArrowLeftRight },
  { label: "Investors", icon: Users },
];

export default function Sidebar({ activePage, onNavigate }) {
  return (
    <aside className="flex w-full flex-col border-b border-slate-800 bg-[#101720] p-4 lg:fixed lg:inset-y-0 lg:left-0 lg:z-20 lg:w-64 lg:border-r lg:border-b-0 lg:p-5">
      <div className="mb-6 flex items-center gap-3 lg:mb-10">
        <div className="grid h-11 w-11 place-items-center rounded-xl bg-emerald-400 text-slate-950">
          <Wallet size={23} />
        </div>

        <div>
          <h2 className="font-bold tracking-tight text-white">
            Stockwise
          </h2>
          <p className="mt-1 text-[9px] tracking-[2px] text-slate-400">
            PORTFOLIO MANAGER
          </p>
        </div>
      </div>

      <p className="mb-3 hidden px-3 text-[10px] font-semibold tracking-[2px] text-slate-500 lg:block">
        WORKSPACE
      </p>

      <nav className="flex gap-1 overflow-x-auto lg:flex-col">
        {navItems.map(({ label, icon: Icon }) => {
          const active = activePage === label;

          return (
            <button
              key={label}
              onClick={() => onNavigate(label)}
              className={`flex shrink-0 items-center gap-3 rounded-xl px-3 py-3 text-left text-sm transition ${
                active
                  ? "bg-emerald-400/10 font-semibold text-emerald-300"
                  : "text-slate-400 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <Icon size={19} />
              <span>{label}</span>
            </button>
          );
        })}
      </nav>

      <div className="mt-5 hidden lg:mt-auto lg:block">
        <button
          onClick={() => onNavigate("Help")}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm text-slate-400 hover:bg-slate-800 hover:text-white"
        >
          <CircleHelp size={19} />
          Help & Support
        </button>

        <button
          onClick={() => onNavigate("Settings")}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm text-slate-400 hover:bg-slate-800 hover:text-white"
        >
          <Settings size={19} />
          Settings
        </button>

        <div className="mt-4 flex items-center gap-3 border-t border-slate-800 pt-5">
          <div className="grid h-10 w-10 place-items-center rounded-full bg-slate-700 text-xs font-bold text-emerald-200">
            NG
          </div>

          <div>
            <p className="text-sm font-semibold text-white">
              Demo Investor
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Portfolio Owner
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
