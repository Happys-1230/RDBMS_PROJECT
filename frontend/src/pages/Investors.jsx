import { useEffect, useMemo, useState } from "react";
import { investorsAPI } from "../api/api.js";
import {
  Search,
  Plus,
  Users,
  UserRound,
  Wallet,
  Pencil,
  Trash2,
  Eye,
  X,
  ArrowLeft,
  Mail,
  Phone,
  CalendarDays,
  Filter,
} from "lucide-react";

const emptyForm = {
  name: "",
  email: "",
  phone: "",
  joinedDate: new Date().toISOString().slice(0, 10),
  status: "Active",
};

function normalizeInvestor(row) {
  return {
    id: row.investor_id,
    name: row.name ?? "",
    email: row.email ?? "",
    phone: row.phone ?? "",
    joinedDate: row.joined_date
      ? String(row.joined_date).slice(0, 10)
      : "",
    status: row.status ?? "Active",
   
    portfolioValue: null,
    riskProfile: "Managed per portfolio",
  };
}

const money = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(amount) || 0);

const inputClass =
  "mt-1.5 w-full rounded-xl border border-slate-700 bg-[#0b1119] px-3.5 py-2.5 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/10";

function SummaryCard({ title, value, subtitle, icon: Icon }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-[#121c27] p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-slate-400">{title}</p>

        <div className="rounded-xl bg-emerald-400/10 p-2.5 text-emerald-300">
          <Icon size={20} />
        </div>
      </div>

      <h3 className="mt-4 text-2xl font-bold text-white">{value}</h3>
      <p className="mt-1 text-xs text-slate-500">{subtitle}</p>
    </div>
  );
}

function InvestorFormModal({ investor, onClose, onSave }) {
  const [form, setForm] = useState(
    investor
      ? { ...emptyForm, ...investor }
      : { ...emptyForm }
  );
  const [error, setError] = useState("");

  const updateField = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!form.name.trim() || !form.email.trim()) {
      setError("Investor name and email are required.");
      return;
    }

    try {
      await onSave({
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        joinedDate: form.joinedDate,
        status: form.status,
      });
    } catch (apiError) {
      setError(apiError.message || "Could not save investor.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/70 p-4 backdrop-blur-sm">
      <div className="my-auto w-full max-w-xl rounded-2xl border border-slate-800 bg-[#121c27] shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 p-5">
          <div>
            <h2 className="text-lg font-bold text-white">
              {investor ? "Edit Investor" : "Add New Investor"}
            </h2>
            <p className="mt-1 text-sm text-slate-400">
              Enter the investor's information below.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-800 hover:text-white"
            aria-label="Close form"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 p-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-medium text-slate-300">
              Full Name *
              <input
                name="name"
                value={form.name}
                onChange={updateField}
                className={inputClass}
                placeholder="Enter full name"
                required
              />
            </label>

            <label className="text-sm font-medium text-slate-300">
              Email Address *
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={updateField}
                className={inputClass}
                placeholder="name@example.com"
                required
              />
            </label>

            <label className="text-sm font-medium text-slate-300">
              Phone Number
              <input
                name="phone"
                value={form.phone}
                onChange={updateField}
                className={inputClass}
                placeholder="+91 ..."
              />
            </label>

            <label className="text-sm font-medium text-slate-300">
              Joined Date
              <input
                name="joinedDate"
                type="date"
                value={form.joinedDate}
                onChange={updateField}
                className={inputClass}
                required
              />
            </label>

          </div>

          <p className="rounded-lg border border-slate-700 bg-[#0b1119] p-3 text-xs leading-5 text-slate-400">
            Portfolio value and risk profile are managed through portfolios and
            transactions, so they are not edited on this investor form.
          </p>

          {error && (
            <p
              role="alert"
              className="rounded-lg border border-red-400/20 bg-red-400/10 p-3 text-sm text-red-300"
            >
              {error}
            </p>
          )}

          <div className="flex justify-end gap-3 border-t border-slate-800 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-700 px-4 py-2.5 text-sm font-semibold text-slate-300 transition hover:bg-slate-800"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="rounded-xl bg-emerald-400 px-4 py-2.5 text-sm font-bold text-slate-950 transition hover:bg-emerald-300"
            >
              {investor ? "Save Changes" : "Add Investor"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function DeleteInvestorModal({ investor, onClose, onConfirm }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-[#121c27] p-6 shadow-2xl">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-400/10 text-red-400">
          <Trash2 size={22} />
        </div>

        <h2 className="text-lg font-bold text-white">Delete Investor?</h2>

        <p className="mt-2 text-sm leading-6 text-slate-400">
          Are you sure you want to delete{" "}
          <span className="font-semibold text-slate-100">
            {investor.name}
          </span>
          ? This action cannot be undone.
        </p>

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="rounded-xl border border-slate-700 px-4 py-2.5 text-sm font-semibold text-slate-300 transition hover:bg-slate-800"
          >
            Cancel
          </button>

          <button
            onClick={onConfirm}
            className="rounded-xl bg-red-500 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-red-400"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

function InvestorDetails({ investor, onBack, onEdit }) {
  const detailItems = [
    { label: "Email Address", value: investor.email, icon: Mail },
    {
      label: "Phone Number",
      value: investor.phone || "Not provided",
      icon: Phone,
    },
    { label: "Joined Date", value: investor.joinedDate, icon: CalendarDays },
    { label: "Risk Profile", value: "Managed per portfolio", icon: Wallet },
  ];

  return (
    <div className="space-y-6">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-sm font-semibold text-slate-400 transition hover:text-emerald-300"
      >
        <ArrowLeft size={17} />
        Back to Investors
      </button>

      <div className="rounded-2xl border border-slate-800 bg-[#121c27] p-6 shadow-sm">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-400/10 text-xl font-bold text-emerald-300">
              {investor.name
                .split(" ")
                .map((part) => part[0])
                .join("")
                .slice(0, 2)
                .toUpperCase()}
            </div>

            <div>
              <h1 className="text-2xl font-bold text-white">
                {investor.name}
              </h1>
              <p className="mt-1 text-sm text-slate-400">{investor.email}</p>

              <span
                className={`mt-2 inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${investor.status === "Active"
                    ? "bg-emerald-400/10 text-emerald-300"
                    : "bg-slate-700 text-slate-300"
                  }`}
              >
                {investor.status}
              </span>
            </div>
          </div>

          <button
            onClick={onEdit}
            className="flex items-center justify-center gap-2 rounded-xl bg-emerald-400 px-4 py-2.5 text-sm font-bold text-slate-950 transition hover:bg-emerald-300"
          >
            <Pencil size={16} />
            Edit Investor
          </button>
        </div>

        <div className="mt-7 rounded-xl border border-slate-800 bg-[#0b1119] p-5">
          <p className="text-sm text-slate-400">Total Portfolio Value</p>
          <p className="mt-2 text-lg font-bold text-white">
            Calculated from portfolio holdings
          </p>
        </div>

        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          {detailItems.map(({ label, value, icon: Icon }) => (
            <div key={label} className="flex items-start gap-3">
              <div className="rounded-lg bg-slate-800 p-2 text-emerald-300">
                <Icon size={18} />
              </div>

              <div>
                <p className="text-xs text-slate-500">{label}</p>
                <p className="mt-1 break-all text-sm font-semibold text-slate-200">
                  {value}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Investors() {
  const [investors, setInvestors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [modalInvestor, setModalInvestor] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [selectedInvestorId, setSelectedInvestorId] = useState(null);

  const loadInvestors = async () => {
    setLoading(true);
    setApiError("");

    try {
      const result = await investorsAPI.getAll();

      // The current backend returns an array directly.
      // This also supports a future { data: [...] } response.
      const investorRows = Array.isArray(result)
        ? result
        : Array.isArray(result?.data)
          ? result.data
          : [];

      setInvestors(investorRows.map(normalizeInvestor));
    } catch (error) {
      setApiError(error.message || "Unable to load investors.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInvestors();
  }, []);

  const selectedInvestor = investors.find(
    (investor) => investor.id === selectedInvestorId
  );

  const filteredInvestors = useMemo(() => {
    const term = search.trim().toLowerCase();

    return investors.filter((investor) => {
      const matchesSearch =
        investor.name.toLowerCase().includes(term) ||
        investor.email.toLowerCase().includes(term) ||
        investor.phone.toLowerCase().includes(term);

      const matchesStatus =
        statusFilter === "All" || investor.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [investors, search, statusFilter]);

  const activeCount = investors.filter(
    (investor) => investor.status === "Active"
  ).length;

 
  const totalPortfolio = null;

  const openAddForm = () => {
    setModalInvestor(null);
    setShowForm(true);
  };

  const openEditForm = (investor) => {
    setModalInvestor(investor);
    setShowForm(true);
  };

  const saveInvestor = async (formData) => {
    const payload = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone || null,
      joined_date: formData.joinedDate,
      status: formData.status,
    };

    if (modalInvestor) {
      await investorsAPI.update(modalInvestor.id, payload);
    } else {
      await investorsAPI.create(payload);
    }

    await loadInvestors();
    setShowForm(false);
    setModalInvestor(null);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;

    setApiError("");

    try {
      await investorsAPI.delete(deleteTarget.id);

      if (selectedInvestorId === deleteTarget.id) {
        setSelectedInvestorId(null);
      }

      setDeleteTarget(null);
      await loadInvestors();
    } catch (error) {
      setApiError(error.message || "Could not delete investor.");
      setDeleteTarget(null);
    }
  };

  if (selectedInvestor) {
    return (
      <div className="min-h-screen space-y-6 bg-[#0b1119] p-4 sm:p-6 lg:p-8">
        <InvestorDetails
          investor={selectedInvestor}
          onBack={() => setSelectedInvestorId(null)}
          onEdit={() => openEditForm(selectedInvestor)}
        />

        {showForm && (
          <InvestorFormModal
            investor={modalInvestor}
            onClose={() => {
              setShowForm(false);
              setModalInvestor(null);
            }}
            onSave={saveInvestor}
          />
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen space-y-6 bg-[#0b1119] p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm font-medium text-emerald-300">Management</p>

          <h1 className="mt-1 text-2xl font-bold text-white sm:text-3xl">
            Investors
          </h1>

          <p className="mt-2 text-sm text-slate-400">
            Manage investor profiles and monitor their portfolio values.
          </p>
        </div>

        <button
          onClick={openAddForm}
          className="flex items-center justify-center gap-2 rounded-xl bg-emerald-400 px-4 py-3 text-sm font-bold text-slate-950 shadow-sm transition hover:bg-emerald-300"
        >
          <Plus size={18} />
          Add Investor
        </button>
      </div>

      {apiError && (
        <div
          role="alert"
          className="rounded-xl border border-red-400/20 bg-red-400/10 p-4 text-sm text-red-300"
        >
          {apiError}
          <button
            type="button"
            onClick={loadInvestors}
            className="ml-3 font-semibold underline underline-offset-2"
          >
            Retry
          </button>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <SummaryCard
          title="Total Investors"
          value={investors.length}
          subtitle="All registered investors"
          icon={Users}
        />

        <SummaryCard
          title="Active Investors"
          value={activeCount}
          subtitle="Currently marked active"
          icon={UserRound}
        />

        <SummaryCard
          title="Total Portfolio Value"
          value={money(totalPortfolio)}
          subtitle="Combined investor portfolio values"
          icon={Wallet}
        />
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-800 bg-[#121c27] shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-800 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-sm">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
            />

            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search name, email, or phone..."
              className="w-full rounded-xl border border-slate-700 bg-[#0b1119] py-2.5 pl-10 pr-3 text-sm text-slate-100 outline-none placeholder:text-slate-500 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/10"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter size={17} className="text-slate-500" />

            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="rounded-xl border border-slate-700 bg-[#0b1119] px-3 py-2.5 text-sm text-slate-200 outline-none focus:border-emerald-400"
              aria-label="Filter by investor status"
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px] text-left">
            <thead className="bg-[#0b1119]">
              <tr>
                {[
                  "Investor",
                  "Contact",
                  "Portfolio Value",
                  "Risk Profile",
                  "Status",
                  "Actions",
                ].map((heading) => (
                  <th
                    key={heading}
                    className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500"
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-800">
              {loading && (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-sm text-slate-400">
                    Loading investors...
                  </td>
                </tr>
              )}

              {!loading && filteredInvestors.map((investor) => (
                <tr
                  key={investor.id}
                  className="transition hover:bg-slate-800/40"
                >
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-400/10 text-sm font-bold text-emerald-300">
                        {investor.name
                          .split(" ")
                          .map((part) => part[0])
                          .join("")
                          .slice(0, 2)
                          .toUpperCase()}
                      </div>

                      <div>
                        <p className="font-semibold text-slate-100">
                          {investor.name}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          Joined {investor.joinedDate}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="px-5 py-4">
                    <p className="text-sm text-slate-300">{investor.email}</p>
                    <p className="mt-1 text-xs text-slate-500">
                      {investor.phone || "No phone provided"}
                    </p>
                  </td>

                  <td className="px-5 py-4 font-semibold text-slate-100">
                    {money(investor.portfolioValue)}
                  </td>

                  <td className="px-5 py-4">
                    <span className="rounded-full border border-slate-700 bg-slate-800/70 px-2.5 py-1.5 text-xs font-medium text-slate-300">
                      {investor.riskProfile}
                    </span>
                  </td>

                  <td className="px-5 py-4">
                    <span
                      className={`rounded-full px-2.5 py-1.5 text-xs font-semibold ${investor.status === "Active"
                          ? "bg-emerald-400/10 text-emerald-300"
                          : "bg-slate-800 text-slate-400"
                        }`}
                    >
                      {investor.status}
                    </span>
                  </td>

                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setSelectedInvestorId(investor.id)}
                        title="View details"
                        aria-label={`View ${investor.name}`}
                        className="rounded-lg p-2 text-slate-400 transition hover:bg-emerald-400/10 hover:text-emerald-300"
                      >
                        <Eye size={17} />
                      </button>

                      <button
                        onClick={() => openEditForm(investor)}
                        title="Edit investor"
                        aria-label={`Edit ${investor.name}`}
                        className="rounded-lg p-2 text-slate-400 transition hover:bg-amber-400/10 hover:text-amber-300"
                      >
                        <Pencil size={17} />
                      </button>

                      <button
                        onClick={() => setDeleteTarget(investor)}
                        title="Delete investor"
                        aria-label={`Delete ${investor.name}`}
                        className="rounded-lg p-2 text-slate-400 transition hover:bg-red-400/10 hover:text-red-300"
                      >
                        <Trash2 size={17} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {!loading && filteredInvestors.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center">
                    <Users size={28} className="mx-auto text-slate-600" />

                    <p className="mt-3 font-semibold text-slate-200">
                      No investors found
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
                      Try another search or change the status filter.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="border-t border-slate-800 px-5 py-3 text-sm text-slate-500">
          Showing {filteredInvestors.length} of {investors.length} investors
        </div>
      </div>

      {showForm && (
        <InvestorFormModal
          investor={modalInvestor}
          onClose={() => {
            setShowForm(false);
            setModalInvestor(null);
          }}
          onSave={saveInvestor}
        />
      )}

      {deleteTarget && (
        <DeleteInvestorModal
          investor={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onConfirm={confirmDelete}
        />
      )}
    </div>
  );
}