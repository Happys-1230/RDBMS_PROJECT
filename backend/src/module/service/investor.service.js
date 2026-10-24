import pool from "../../common/config/db.js";

export async function findAllInvestors() {
  const [rows] = await pool.query(
    "SELECT * FROM Investors ORDER BY investor_id DESC"
  );

  return rows;
}

export async function findInvestorById(id) {
  const [rows] = await pool.execute(
    "SELECT * FROM Investors WHERE investor_id = ?",
    [id]
  );

  return rows[0] ?? null;
}

export async function insertInvestor(data) {
  const { name, email, phone, joined_date, status } = data;

  const [result] = await pool.execute(
    `INSERT INTO Investors
      (name, email, phone, joined_date, status)
     VALUES (?, ?, ?, ?, ?)`,
    [
      name,
      email ?? null,
      phone ?? null,
      joined_date ?? null,
      status ?? "Active",
    ]
  );

  return findInvestorById(result.insertId);
}

export async function modifyInvestor(id, data) {
  // Check existence first, even if the update changes no values
  const existingInvestor = await findInvestorById(id);

  if (!existingInvestor) {
    return null;
  }

  const { name, email, phone, joined_date, status } = data;

  await pool.execute(
    `UPDATE Investors
     SET name = ?, email = ?, phone = ?, joined_date = ?, status = ?
     WHERE investor_id = ?`,
    [
      name,
      email ?? null,
      phone ?? null,
      joined_date ?? null,
      status ?? "Active",
      id,
    ]
  );

  return findInvestorById(id);
}

export async function removeInvestor(id) {
  const [result] = await pool.execute(
    "DELETE FROM Investors WHERE investor_id = ?",
    [id]
  );

  return result.affectedRows > 0;
}

