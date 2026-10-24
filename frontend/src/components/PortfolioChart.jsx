
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const formatCurrency = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);

export default function PortfolioChart({ data }) {
  return (
    <div className="h-64 w-full sm:h-72">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 10, right: 8, left: 8, bottom: 0 }}
        >
          <defs>
            <linearGradient
              id="portfolioFill"
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop
                offset="0%"
                stopColor="#34d399"
                stopOpacity={0.25}
              />
              <stop
                offset="100%"
                stopColor="#34d399"
                stopOpacity={0}
              />
            </linearGradient>
          </defs>

          <CartesianGrid
            stroke="#26313e"
            strokeDasharray="4 4"
            vertical={false}
          />

          <XAxis
            dataKey="month"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#94a3b8", fontSize: 12 }}
          />

          <YAxis
            width={52}
            tickFormatter={(value) => `₹${value / 100000}L`}
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#94a3b8", fontSize: 11 }}
          />

          <Tooltip
            formatter={(value) => [
              formatCurrency(value),
              "Portfolio value",
            ]}
            contentStyle={{
              backgroundColor: "#101720",
              border: "1px solid #334155",
              borderRadius: "12px",
              color: "#fff",
            }}
          />

          <Area
            type="monotone"
            dataKey="value"
            stroke="#34d399"
            strokeWidth={3}
            fill="url(#portfolioFill)"
            activeDot={{ r: 5 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
