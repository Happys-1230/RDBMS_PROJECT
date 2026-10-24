
import {
  findAllStocks,
  findStockById,
  insertStock,
  modifyStock,
  removeStock,
} from "../service/stock.service.js";

const isValidId = (id) =>
  /^\d+$/.test(String(id)) &&
  Number(id) > 0 &&
  Number.isSafeInteger(Number(id));

function validateStock(data) {
  if (typeof data.symbol !== "string" || !data.symbol.trim()) {
    return "Stock symbol is required.";
  }

  if (data.symbol.trim().length > 15) {
    return "Stock symbol cannot exceed 15 characters.";
  }

  if (
    typeof data.company_name !== "string" ||
    !data.company_name.trim()
  ) {
    return "Company name is required.";
  }

  if (data.company_name.trim().length > 100) {
    return "Company name cannot exceed 100 characters.";
  }

  if (
    data.current_price === undefined ||
    data.current_price === null ||
    data.current_price === "" ||
    !Number.isFinite(Number(data.current_price)) ||
    Number(data.current_price) < 0
  ) {
    return "Current price must be a valid non-negative number.";
  }

  if (Number(data.current_price) > 9999999999.99) {
    return "Current price exceeds the allowed range.";
  }

  return null;
}

function handleError(res, error) {
  console.error("Stock API error:", error.message);

  if (error.code === "ER_DUP_ENTRY") {
    return res.status(409).json({
      message: "A stock with this symbol already exists.",
    });
  }

  if (error.code === "ER_ROW_IS_REFERENCED_2") {
    return res.status(409).json({
      message: "Cannot delete this stock because transactions reference it.",
    });
  }

  return res.status(500).json({
    message: "An internal server error occurred.",
  });
}

// GET /api/stocks
export async function getAllStocks(req, res) {
  try {
    const stocks = await findAllStocks();
    return res.status(200).json(stocks);
  } catch (error) {
    return handleError(res, error);
  }
}

// GET /api/stocks/:id
export async function getStockById(req, res) {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ message: "Invalid stock ID." });
    }

    const stock = await findStockById(Number(req.params.id));

    if (!stock) {
      return res.status(404).json({ message: "Stock not found." });
    }

    return res.status(200).json(stock);
  } catch (error) {
    return handleError(res, error);
  }
}

// POST /api/stocks
export async function createStock(req, res) {
  try {
    const validationError = validateStock(req.body);

    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    const stock = await insertStock({
      symbol: req.body.symbol.trim().toUpperCase(),
      company_name: req.body.company_name.trim(),
      current_price: Number(req.body.current_price),
    });

    return res.status(201).json({
      message: "Stock created successfully.",
      stock,
    });
  } catch (error) {
    return handleError(res, error);
  }
}

// PUT /api/stocks/:id
export async function updateStock(req, res) {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ message: "Invalid stock ID." });
    }

    const validationError = validateStock(req.body);

    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    const stock = await modifyStock(Number(req.params.id), {
      symbol: req.body.symbol.trim().toUpperCase(),
      company_name: req.body.company_name.trim(),
      current_price: Number(req.body.current_price),
    });

    if (!stock) {
      return res.status(404).json({ message: "Stock not found." });
    }

    return res.status(200).json({
      message: "Stock updated successfully.",
      stock,
    });
  } catch (error) {
    return handleError(res, error);
  }
}

// DELETE /api/stocks/:id
export async function deleteStock(req, res) {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ message: "Invalid stock ID." });
    }

    const deleted = await removeStock(Number(req.params.id));

    if (!deleted) {
      return res.status(404).json({ message: "Stock not found." });
    }

    return res.status(200).json({
      message: "Stock deleted successfully.",
    });
  } catch (error) {
    return handleError(res, error);
  }
}

