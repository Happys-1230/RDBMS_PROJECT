
import {
  findAllPortfolios,
  findPortfolioById,
  insertPortfolio,
  modifyPortfolio,
  removePortfolio,
} from "../service/portfolio.service.js";

const isValidId = (id) =>
  /^\d+$/.test(String(id)) &&
  Number(id) > 0 &&
  Number.isSafeInteger(Number(id));

const validRiskProfiles = ["Conservative", "Moderate", "Aggressive"];

function validatePortfolio(data) {
  if (!isValidId(String(data.investor_id ?? ""))) {
    return "A valid investor_id is required.";
  }

  if (
    typeof data.portfolio_name !== "string" ||
    !data.portfolio_name.trim()
  ) {
    return "Portfolio name is required.";
  }

  if (
    data.risk_profile !== undefined &&
    !validRiskProfiles.includes(data.risk_profile)
  ) {
    return "Risk profile must be Conservative, Moderate, or Aggressive.";
  }

  return null;
}

function handleError(res, error) {
  console.error("Portfolio API error:", error.message);

  if (error.code === "ER_NO_REFERENCED_ROW_2") {
    return res.status(400).json({
      message: "The specified investor does not exist.",
    });
  }

  if (error.code === "ER_ROW_IS_REFERENCED_2") {
    return res.status(409).json({
      message: "Cannot delete this portfolio because transactions reference it.",
    });
  }

  if (
    error.code === "ER_DATA_TOO_LONG" ||
    error.code === "ER_TRUNCATED_WRONG_VALUE" ||
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

// GET /api/portfolios
export async function getAllPortfolios(req, res) {
  try {
    const portfolios = await findAllPortfolios();
    return res.status(200).json(portfolios);
  } catch (error) {
    return handleError(res, error);
  }
}

// GET /api/portfolios/:id
export async function getPortfolioById(req, res) {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ message: "Invalid portfolio ID." });
    }

    const portfolio = await findPortfolioById(Number(req.params.id));

    if (!portfolio) {
      return res.status(404).json({ message: "Portfolio not found." });
    }

    return res.status(200).json(portfolio);
  } catch (error) {
    return handleError(res, error);
  }
}

// POST /api/portfolios
export async function createPortfolio(req, res) {
  try {
    const validationError = validatePortfolio(req.body);

    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    const portfolio = await insertPortfolio({
      investor_id: Number(req.body.investor_id),
      portfolio_name: req.body.portfolio_name.trim(),
      risk_profile: req.body.risk_profile,
    });

    return res.status(201).json({
      message: "Portfolio created successfully.",
      portfolio,
    });
  } catch (error) {
    return handleError(res, error);
  }
}

// PUT /api/portfolios/:id
export async function updatePortfolio(req, res) {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ message: "Invalid portfolio ID." });
    }

    const validationError = validatePortfolio(req.body);

    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    const portfolio = await modifyPortfolio(Number(req.params.id), {
      investor_id: Number(req.body.investor_id),
      portfolio_name: req.body.portfolio_name.trim(),
      risk_profile: req.body.risk_profile,
    });

    if (!portfolio) {
      return res.status(404).json({ message: "Portfolio not found." });
    }

    return res.status(200).json({
      message: "Portfolio updated successfully.",
      portfolio,
    });
  } catch (error) {
    return handleError(res, error);
  }
}

// DELETE /api/portfolios/:id
export async function deletePortfolio(req, res) {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ message: "Invalid portfolio ID." });
    }

    const deleted = await removePortfolio(Number(req.params.id));

    if (!deleted) {
      return res.status(404).json({ message: "Portfolio not found." });
    }

    return res.status(200).json({
      message: "Portfolio deleted successfully.",
    });
  } catch (error) {
    return handleError(res, error);
  }
}
