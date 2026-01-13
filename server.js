const express = require("express");
const mysql = require("mysql2/promise");
require("dotenv").config();

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT || 3306),
};

/* =========================
   GET: Categories
   (for dropdown + filter)
========================= */
app.get("/categories", async (req, res) => {
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);

    const [rows] = await connection.execute(
      `SELECT id, name, green_plan_focus, description
       FROM categories
       ORDER BY id ASC`
    );

    return res.json(rows);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server cannot fetch categories" });
  } finally {
    if (connection) await connection.end();
  }
});

/* =========================
   GET: Fetch all habits
   (returns category_name too)
========================= */
app.get("/habits", async (req, res) => {
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);

    const [rows] = await connection.execute(
      `SELECT 
         h.id,
         h.title,
         h.category_id,
         c.name AS category_name,
         h.date,
         h.notes
       FROM habits h
       JOIN categories c ON h.category_id = c.id
       ORDER BY h.date DESC, h.id DESC`
    );

    return res.json(rows);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server cannot fetch all habits" });
  } finally {
    if (connection) await connection.end();
  }
});

/* =========================
   POST: Create habit
========================= */
app.post("/habits", async (req, res) => {
  let connection;
  try {
    const { title, category_id, date, notes } = req.body;

    if (!title || !category_id || !date) {
      return res
        .status(400)
        .json({ message: "Missing required fields: title, category_id, date" });
    }

    connection = await mysql.createConnection(dbConfig);

    const [result] = await connection.execute(
      `INSERT INTO habits (title, category_id, date, notes)
       VALUES (?, ?, ?, ?)`,
      [title, category_id, date, notes || null]
    );

    return res.status(201).json({
      message: "Habit created successfully",
      habitId: result.insertId,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server cannot create habit" });
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
      return res
        .status(400)
        .json({ message: "Missing required fields: title, category_id, date" });
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
    return res.status(500).json({ message: "Server cannot update habit" });
  } finally {
    if (connection) await connection.end();
  }
});

/* =========================
   DELETE: Delete habit by id
========================= */
app.delete("/habits/:id", async (req, res) => {
  let connection;
  try {
    const { id } = req.params;

    connection = await mysql.createConnection(dbConfig);

    const [result] = await connection.execute(
      `DELETE FROM habits WHERE id = ?`,
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Habit not found" });
    }

    return res.json({ message: "Habit deleted successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server cannot delete habit" });
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
