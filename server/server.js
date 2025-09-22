const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");

const app = express();
app.use(cors());
app.use(express.json());

// Connect to Azure PostgreSQL
const pool = new Pool({
  user: "your_db_user",
  host: "your-db-host.postgres.database.azure.com",
  database: "your_db_name",
  password: "your_db_password",
  port: 5432,
  ssl: { rejectUnauthorized: false },
});

// GET all products
app.get("/api/products", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM products");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

// UPDATE price using PLU as primary key
app.put("/api/products/:plu_number", async (req, res) => {
  const { plu_number } = req.params;
  const { price } = req.body;

  try {
    const result = await pool.query(
      "UPDATE products SET price = $1 WHERE plu_number = $2 RETURNING *",
      [price, plu_number]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.json({ message: "Price updated", product: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));