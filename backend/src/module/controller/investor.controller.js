import {
  findAllInvestors,
  findInvestorById,
  insertInvestor,
  modifyInvestor,
  removeInvestor,
} from "../service/investor.service.js";

const isValidId = (id) =>
  /^\d+$/.test(id) && Number(id) > 0 && Number.isSafeInteger(Number(id));

const isValidStatus = (status) =>
  status === undefined ||
  status === "Active" ||
  status === "Inactive";

function handleError(res, error) {
  console.error("Investor API error:", error.message);

  if (error.code === "ER_DUP_ENTRY") {
    return res.status(409).json({
      message: "An investor with this email already exists.",
    });
  }

  if (error.code === "ER_ROW_IS_REFERENCED_2") {
    return res.status(409).json({
      message:
        "Cannot delete this investor because portfolios are linked to them.",
    });
  }

  if (
    error.code === "ER_TRUNCATED_WRONG_VALUE" ||
    error.code === "ER_DATA_TOO_LONG" ||
    error.code === "ER_BAD_NULL_ERROR"
  ) {
    return res.status(400).json({
      message: "One or more supplied values are invalid.",
    });
  }

  return res.status(500).json({
    message: "An internal server error occurred.",
  });
}

// GET /api/investors
export async function getAllInvestors(req, res) {
  try {
    const investors = await findAllInvestors();
    return res.status(200).json(investors);
  } catch (error) {
    return handleError(res, error);
  }
}

// GET /api/investors/:id
export async function getInvestorById(req, res) {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ message: "Invalid investor ID." });
    }

    const investor = await findInvestorById(Number(req.params.id));

    if (!investor) {
      return res.status(404).json({ message: "Investor not found." });
    }

    return res.status(200).json(investor);
  } catch (error) {
    return handleError(res, error);
  }
}

// POST /api/investors
export async function createInvestor(req, res) {
  try {
    const { name, email, phone, joined_date, status } = req.body;

    if (typeof name !== "string" || !name.trim()) {
      return res.status(400).json({ message: "Name is required." });
    }

    if (!isValidStatus(status)) {
      return res.status(400).json({
        message: "Status must be Active or Inactive.",
      });
    }

    const investor = await insertInvestor({
      name: name.trim(),
      email,
      phone,
      joined_date,
      status,
    });

    return res.status(201).json({
      message: "Investor created successfully.",
      investor,
    });
  } catch (error) {
    return handleError(res, error);
  }
}

// PUT /api/investors/:id
export async function updateInvestor(req, res) {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ message: "Invalid investor ID." });
    }

    const { name, email, phone, joined_date, status } = req.body;

    if (typeof name !== "string" || !name.trim()) {
      return res.status(400).json({ message: "Name is required." });
    }

    if (!isValidStatus(status)) {
      return res.status(400).json({
        message: "Status must be Active or Inactive.",
      });
    }

    const investor = await modifyInvestor(Number(req.params.id), {
      name: name.trim(),
      email,
      phone,
      joined_date,
      status,
    });

    if (!investor) {
      return res.status(404).json({ message: "Investor not found." });
    }

    return res.status(200).json({
      message: "Investor updated successfully.",
      investor,
    });
  } catch (error) {
    return handleError(res, error);
  }
}

// DELETE /api/investors/:id
export async function deleteInvestor(req, res) {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ message: "Invalid investor ID." });
    }

    const deleted = await removeInvestor(Number(req.params.id));

    if (!deleted) {
      return res.status(404).json({ message: "Investor not found." });
    }

    return res.status(200).json({
      message: "Investor deleted successfully.",
    });
  } catch (error) {
    return handleError(res, error);
  }
}


