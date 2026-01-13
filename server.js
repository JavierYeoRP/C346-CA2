const express = require("express");
const mysql = require("mysql2/promise");
require("dotenv").config();

const app = express();
app.use(express.json()); // ✅ must call ()

const PORT = process.env.PORT || 3000;

// ✅ Correct mysql2 config keys
const dbConfig = {
  host: process.env.DB_HOST,          // e.g. "localhost" / Aiven host
  user: process.env.DB_USER,          // e.g. "root"
  password: process.env.DB_PASSWORD,  // e.g. "password"
  database: process.env.DB_NAME,      // e.g. "green_habits_db"
  port: Number(process.env.DB_PORT || 3306),
};

/* =========================
   GET: Fetch all habits
   (FlatList)
========================= */
app.get("/habits", async (req, res) => {
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);

    const [rows] = await connection.execute("SELECT * FROM habits ORDER BY date DESC, id DESC");

    if (rows.length === 0) {
      return res.json([]); // ✅ return empty list, not affectedRows
    }

    return res.json(rows);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Server cannot fetch all habits",
    });
  } finally {
    if (connection) await connection.end();
  }
});

/* =========================
   PUT: Update habit by id
========================= */
app.put("/habits/:id", async (req, res) => {
  let connection;
  try {
    const { id } = req.params;
    const { title, category_id, date, notes } = req.body;

    if (!title || !category_id || !date) {
      return res.status(400).json({
        message: "Missing required fields: title, category_id, date",
      });
    }

    connection = await mysql.createConnection(dbConfig);

    const [result] = await connection.execute(
      `UPDATE habits
       SET title = ?, category_id = ?, date = ?, notes = ?
       WHERE id = ?`,
      [title, category_id, date, notes || null, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Habit not found" });
    }

    return res.json({ message: "Habit updated successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Server cannot update habit",
    });
  } finally {
    if (connection) await connection.end();
  }
});

/* =========================
   Start Server
========================= */
app.listen(PORT, () => {
  console.log(`✅ Server running at port ${PORT}`);
});
