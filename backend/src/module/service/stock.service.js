import pool from "../../common/config/db.js";


export async function findAllStocks() {
  const [rows] = await pool.query(
    "SELECT * FROM Stocks ORDER BY stock_id DESC"
  );

  return rows;
}


export async function findStockById(id) {
  const [rows] = await pool.execute(
    "SELECT * FROM Stocks WHERE stock_id = ?",
    [id]
  );

  return rows[0] ?? null;
}


export async function insertStock(data) {
  const { symbol, company_name, current_price } = data;

  const [result] = await pool.execute(
    `INSERT INTO Stocks (symbol, company_name, current_price)
     VALUES (?, ?, ?)`,
    [symbol, company_name, current_price]
  );

  return findStockById(result.insertId);
}


export async function modifyStock(id, data) {
  const existing = await findStockById(id);

  if (!existing) {
    return null;
  }

  const { symbol, company_name, current_price } = data;

  await pool.execute(
    `UPDATE Stocks
     SET symbol = ?, company_name = ?, current_price = ?
     WHERE stock_id = ?`,
    [symbol, company_name, current_price, id]
  );

  return findStockById(id);
}


export async function removeStock(id) {
  const [result] = await pool.execute(
    "DELETE FROM Stocks WHERE stock_id = ?",
    [id]
  );

  return result.affectedRows > 0;
}
