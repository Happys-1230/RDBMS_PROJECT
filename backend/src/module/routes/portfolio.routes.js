
import express from "express";

import {
  getAllPortfolios,
  getPortfolioById,
  createPortfolio,
  updatePortfolio,
  deletePortfolio,
} from "../controller/portfolio.controller.js";

const router = express.Router();

router.get("/", getAllPortfolios);
router.get("/:id", getPortfolioById);
router.post("/", createPortfolio);
router.put("/:id", updatePortfolio);
router.delete("/:id", deletePortfolio);

export default router;
