
import express from "express";
import cors from "cors";

import investorRoutes from "./module/routes/investors.routes.js";
import portfolioRoutes from "./module/routes/portfolio.routes.js";
import stockRoutes from "./module/routes/stock.routes.js";
import transactionRoutes from "./module/routes/transaction.routes.js";

const app = express();

// Global middleware
app.use(
  cors({
    origin: "http://localhost:5173",
  })
);

app.use(express.json());

// Root route
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "StockWise backend is running!",
  });
});

// API routes
app.use("/api/investors", investorRoutes);
app.use("/api/portfolios", portfolioRoutes);
app.use("/api/stocks", stockRoutes);
app.use("/api/transactions", transactionRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "API route not found",
  });
});

export default app;




