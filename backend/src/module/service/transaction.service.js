import pool from "../../common/config/db.js";

export async function findAllTransactions() {
  const [rows] = await pool.query(`
    SELECT
      t.*,
      p.portfolio_name,
      s.symbol,
      s.company_name
    FROM Stock_Transactions t
    JOIN Portfolios p ON t.portfolio_id = p.portfolio_id
    JOIN Stocks s ON t.stock_id = s.stock_id
    ORDER BY t.transaction_id DESC
  `);

  return rows;
}

export async function findTransactionById(id) {
  const [rows] = await pool.execute(
    `
    SELECT
      t.*,
      p.portfolio_name,
      s.symbol,
      s.company_name
    FROM Stock_Transactions t
    JOIN Portfolios p ON t.portfolio_id = p.portfolio_id
    JOIN Stocks s ON t.stock_id = s.stock_id
    WHERE t.transaction_id = ?
    `,
    [id]
  );

  return rows[0] ?? null;
}

export async function insertTransaction(data) {
  const {
    portfolio_id,
    stock_id,
    transaction_type,
    quantity,
    price,
    transaction_date,
  } = data;

  const [result] = await pool.execute(
    `INSERT INTO Stock_Transactions
      (portfolio_id, stock_id, transaction_type, quantity, price, transaction_date)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      portfolio_id,
      stock_id,
      transaction_type,
      quantity,
      price,
      transaction_date,
    ]
  );

  return findTransactionById(result.insertId);
}

export async function modifyTransaction(id, data) {
  const existing = await findTransactionById(id);

  if (!existing) return null;

  const {
    portfolio_id,
    stock_id,
    transaction_type,
    quantity,
    price,
    transaction_date,
  } = data;

  await pool.execute(
    `UPDATE Stock_Transactions
     SET portfolio_id = ?,
         stock_id = ?,
         transaction_type = ?,
         quantity = ?,
         price = ?,
         transaction_date = ?
     WHERE transaction_id = ?`,
    [
      portfolio_id,
      stock_id,
      transaction_type,
      quantity,
      price,
      transaction_date,
      id,
    ]
  );

  return findTransactionById(id);
}

export async function removeTransaction(id) {
  const [result] = await pool.execute(
    "DELETE FROM Stock_Transactions WHERE transaction_id = ?",
    [id]
  );

  return result.affectedRows > 0;
}