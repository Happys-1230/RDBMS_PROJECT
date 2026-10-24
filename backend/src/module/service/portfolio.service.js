import pool from "../../common/config/db.js";


export async function findAllPortfolios() {
  const [rows] = await pool.query(`
    SELECT
      p.portfolio_id,
      p.investor_id,
      i.name AS investor_name,
      p.portfolio_name,
      p.risk_profile,
      p.created_at
    FROM Portfolios p
    INNER JOIN Investors i ON p.investor_id = i.investor_id
    ORDER BY p.portfolio_id DESC
  `);

  return rows;
}


export async function findPortfolioById(id) {
  const [rows] = await pool.execute(
    `SELECT
       p.portfolio_id,
       p.investor_id,
       i.name AS investor_name,
       p.portfolio_name,
       p.risk_profile,
       p.created_at
     FROM Portfolios p
     INNER JOIN Investors i ON p.investor_id = i.investor_id
     WHERE p.portfolio_id = ?`,
    [id]
  );

  return rows[0] ?? null;
}

// Create a portfolio
export async function insertPortfolio(data) {
  const { investor_id, portfolio_name, risk_profile } = data;

  const [result] = await pool.execute(
    `INSERT INTO Portfolios
      (investor_id, portfolio_name, risk_profile)
     VALUES (?, ?, ?)`,
    [investor_id, portfolio_name, risk_profile ?? "Moderate"]
  );

  return findPortfolioById(result.insertId);
}


export async function modifyPortfolio(id, data) {
  const existing = await findPortfolioById(id);

  if (!existing) {
    return null;
  }

  const { investor_id, portfolio_name, risk_profile } = data;

  await pool.execute(
    `UPDATE Portfolios
     SET investor_id = ?, portfolio_name = ?, risk_profile = ?
     WHERE portfolio_id = ?`,
    [investor_id, portfolio_name, risk_profile ?? "Moderate", id]
  );

  return findPortfolioById(id);
}


export async function removePortfolio(id) {
  const [result] = await pool.execute(
    "DELETE FROM Portfolios WHERE portfolio_id = ?",
    [id]
  );

  return result.affectedRows > 0;
}
