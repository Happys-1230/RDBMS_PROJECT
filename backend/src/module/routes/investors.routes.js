import express from "express";

import {
  getAllInvestors,
  getInvestorById,
  createInvestor,
  updateInvestor,
  deleteInvestor,
} from "../controller/investor.controller.js";

const router = express.Router();

router.get("/", getAllInvestors);
router.get("/:id", getInvestorById);
router.post("/", createInvestor);
router.put("/:id", updateInvestor);
router.delete("/:id", deleteInvestor);

export default router;
