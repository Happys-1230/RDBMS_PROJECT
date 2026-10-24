import express from "express";
import {
  getAllStocks,
  getStockById,
  createStock,
  updateStock,
  deleteStock,
} from "../controller/stock.controller.js";

const router = express.Router();

router.get("/", getAllStocks);
router.get("/:id", getStockById);
router.post("/", createStock);
router.put("/:id", updateStock);
router.delete("/:id", deleteStock);

export default router;

