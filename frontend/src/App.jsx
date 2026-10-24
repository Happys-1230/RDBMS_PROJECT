import { useState } from "react";
import { Search, Bell, Plus, TrendingUp } from "lucide-react";

import Sidebar from "./components/Sidebar.jsx";
import StatCard from "./components/StatCard.jsx";
import PortfolioChart from "./components/PortfolioChart.jsx";
import HoldingsTable from "./components/HoldingsTable.jsx";
import TransactionsTable from "./components/TransactionsTable.jsx";

import Stocks from "./pages/Stocks.jsx";
import Transactions from "./pages/Transactions.jsx";
import Portfolios from "./pages/Portfolios.jsx";
import Investors from "./pages/Investors.jsx";

import {
  stats,
  performanceData,
  holdings,
  transactions,
} from "./data/dashboardData.js";

function Dashboard({ onNavigate }) {
  const [period, setPeriod] = useState("6m");

  const periodMonths = {
    "1m": 1,
    "3m": 3,
    "6m": 6,
  };

  const chartData = performanceData.slice(-periodMonths[period]);

  return (
    <div className="space-y-6">
      <section className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
        <div>
          <p className="mb-2 text-[10px] font-bold tracking-[2px] text-slate-500">
            SATURDAY, 24 OCTOBER 2026
          </p>

          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Good evening, Investor 👋
          </h1>

          <p className="mt-2 text-sm text-slate-400">
            Here's what's happening with your investments.
          </p>
        </div>

        <button
          onClick={() => onNavigate("Transactions")}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-400 px-4 py-3 text-sm font-bold text-slate-950 transition hover:bg-emerald-300"
        >
          <Plus size={18} />
          New Transaction
        </button>
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 2xl:grid-cols-4">
        {stats.map((stat) => (
          <StatCard key={stat.title} stat={stat} />
        ))}
      </section>

      <section className="grid grid-cols-1 gap-5 2xl:grid-cols-[1.8fr_1fr]">
        <article className="min-w-0 rounded-2xl border border-slate-800 bg-[#121c27] p-5 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h3 className="font-semibold text-white">
                Portfolio Performance
              </h3>
              <p className="mt-1 text-xs text-slate-400">
                Track your investment value over time.
              </p>
            </div>

            <select
              value={period}
              onChange={(event) => setPeriod(event.target.value)}
              className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-slate-200 outline-none focus:border-emerald-400"
              aria-label="Chart period"
            >
              <option value="1m">1 month</option>
              <option value="3m">3 months</option>
              <option value="6m">6 months</option>
            </select>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <h2 className="text-2xl font-bold text-white">
              ₹12,84,500
            </h2>

            <span className="rounded-lg bg-emerald-400/10 px-2 py-1 text-xs font-semibold text-emerald-300">
              <TrendingUp className="mr-1 inline" size={14} />
              +22.33%
            </span>
          </div>

          <p className="mb-2 mt-1 text-xs text-slate-500">
            Overall return · Sample data
          </p>

          <PortfolioChart data={chartData} />
        </article>

        <article className="rounded-2xl border border-slate-800 bg-[#121c27] p-5 sm:p-6">
          <h3 className="font-semibold text-white">Portfolio Overview</h3>
          <p className="mt-1 text-xs text-slate-400">
            Your investment summary.
          </p>

          <div className="mt-7 space-y-6">
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs text-slate-400">Total invested</span>
              <strong className="text-sm text-white">₹10,50,000</strong>
            </div>

            <div className="flex items-center justify-between gap-3">
              <span className="text-xs text-slate-400">Current value</span>
              <strong className="text-sm text-white">₹12,84,500</strong>
            </div>

            <div className="flex items-center justify-between gap-3">
              <span className="text-xs text-slate-400">Net returns</span>
              <strong className="text-sm text-emerald-300">+₹2,34,500</strong>
            </div>
          </div>

          <div className="mt-8 flex items-start gap-3 rounded-xl border border-emerald-400/20 bg-emerald-400/5 p-4">
            <TrendingUp className="shrink-0 text-emerald-300" size={20} />

            <div>
              <p className="text-sm font-semibold text-white">
                Portfolio update
              </p>
              <p className="mt-1 text-xs leading-5 text-slate-400">
                This summary uses fictional development figures.
              </p>
            </div>
          </div>
        </article>
      </section>

      <HoldingsTable
        holdings={holdings}
        onViewAll={() => onNavigate("Stocks")}
      />

      <TransactionsTable
        transactions={transactions}
        onViewAll={() => onNavigate("Transactions")}
      />
    </div>
  );
}

export default function App() {
  const [activePage, setActivePage] = useState("Dashboard");

  return (
    <div className="min-h-screen bg-[#0b1119] text-slate-100">
      <Sidebar
        activePage={activePage}
        onNavigate={setActivePage}
      />

      <div className="min-w-0 lg:ml-64">
        <header className="sticky top-0 z-10 flex h-[68px] items-center justify-between border-b border-slate-800 bg-[#0b1119]/95 px-4 backdrop-blur sm:px-7">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            Workspace
            <span>/</span>
            <span className="font-medium text-slate-200">
              {activePage}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              aria-label="Search"
              className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white"
            >
              <Search size={19} />
            </button>

            <button
              aria-label="Notifications"
              className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white"
            >
              <Bell size={19} />
            </button>

            <div className="grid h-9 w-9 place-items-center rounded-full bg-slate-700 text-xs font-bold text-emerald-200">
              NG
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-[1700px] p-4 sm:p-7">
          {activePage === "Dashboard" ? (
            <Dashboard onNavigate={setActivePage} />
          ) : activePage === "Stocks" ? (
            <Stocks />
          ) : activePage === "Transactions" ? (
            <Transactions />
          ) : activePage === "Portfolios" ? (
            <Portfolios />
          ) : activePage === "Investors" ? (
            <Investors />
          ) : (
            <section className="rounded-2xl border border-slate-800 bg-[#121c27] p-6 sm:p-8">
              <p className="text-[10px] font-bold tracking-[2px] text-emerald-300">
                STOCKWISE WORKSPACE
              </p>

              <h1 className="mt-3 text-2xl font-bold text-white">
                {activePage}
              </h1>

              <p className="mt-3 max-w-xl text-sm leading-6 text-slate-400">
                This module will be implemented next.
              </p>

              <button
                onClick={() => setActivePage("Dashboard")}
                className="mt-6 rounded-xl bg-emerald-400 px-4 py-3 text-sm font-bold text-slate-950 hover:bg-emerald-300"
              >
                Back to Dashboard
              </button>
            </section>
          )}
        </main>
      </div>
    </div>
  );
}
