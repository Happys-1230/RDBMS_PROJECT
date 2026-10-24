import {
  findAllTransactions,
  findTransactionById,
  insertTransaction,
  modifyTransaction,
  removeTransaction,
} from "../service/transaction.service.js";

function isValidId(id) {
  return /^\d+$/.test(id) && Number.isSafeInteger(Number(id)) && Number(id) > 0;
}

function validateTransaction(data) {
  const {
    portfolio_id,
    stock_id,
    transaction_type,
    quantity,
    price,
    transaction_date,
  } = data;

  if (
    !Number.isSafeInteger(portfolio_id) ||
    portfolio_id <= 0 ||
    !Number.isSafeInteger(stock_id) ||
    stock_id <= 0
  ) {
    return "Valid portfolio_id and stock_id are required.";
  }

  if (!["BUY", "SELL"].includes(transaction_type)) {
    return "transaction_type must be BUY or SELL.";
  }

  if (!Number.isSafeInteger(quantity) || quantity <= 0) {
    return "quantity must be a positive integer.";
  }

  if (
    typeof price !== "number" ||
    !Number.isFinite(price) ||
    price < 0 ||
    price > 9999999999.99
  ) {
    return "price must be a valid non-negative number.";
  }

  if (
    typeof transaction_date !== "string" ||
    !/^\d{4}-\d{2}-\d{2}$/.test(transaction_date)
  ) {
    return "transaction_date must use YYYY-MM-DD format.";
  }

  const date = new Date(`${transaction_date}T00:00:00Z`);

  if (
    Number.isNaN(date.getTime()) ||
    date.toISOString().slice(0, 10) !== transaction_date
  ) {
    return "transaction_date must be a valid calendar date.";
  }

  return null;
}

function handleError(res, error) {
  console.error("Transaction API error:", error.message);

  if (error.code === "ER_NO_REFERENCED_ROW_2") {
    return res.status(400).json({
      success: false,
      message: "The specified portfolio_id or stock_id does not exist.",
    });
  }

  if (error.code === "ER_CHECK_CONSTRAINT_VIOLATED") {
    return res.status(400).json({
      success: false,
      message: "Transaction data violates a database constraint.",
    });
  }

  return res.status(500).json({
    success: false,
    message: "Internal server error.",
  });
}

export async function getAllTransactions(req, res) {
  try {
    const transactions = await findAllTransactions();

    return res.status(200).json({
      success: true,
      count: transactions.length,
      data: transactions,
    });
  } catch (error) {
    return handleError(res, error);
  }
}

export async function getTransactionById(req, res) {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid transaction ID.",
      });
    }

    const transaction = await findTransactionById(Number(req.params.id));

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found.",
      });
    }

    return res.status(200).json({
      success: true,
      data: transaction,
    });
  } catch (error) {
    return handleError(res, error);
  }
}

export async function createTransaction(req, res) {
  try {
    const validationError = validateTransaction(req.body);

    if (validationError) {
      return res.status(400).json({
        success: false,
        message: validationError,
      });
    }

    const transaction = await insertTransaction(req.body);

    return res.status(201).json({
      success: true,
      message: "Transaction created successfully.",
      data: transaction,
    });
  } catch (error) {
    return handleError(res, error);
  }
}

export async function updateTransaction(req, res) {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid transaction ID.",
      });
    }

    const validationError = validateTransaction(req.body);

    if (validationError) {
      return res.status(400).json({
        success: false,
        message: validationError,
      });
    }

    const transaction = await modifyTransaction(
      Number(req.params.id),
      req.body
    );

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Transaction updated successfully.",
      data: transaction,
    });
  } catch (error) {
    return handleError(res, error);
  }
}

export async function deleteTransaction(req, res) {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid transaction ID.",
      });
    }

    const deleted = await removeTransaction(Number(req.params.id));

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Transaction deleted successfully.",
    });
  } catch (error) {
    return handleError(res, error);
  }
}