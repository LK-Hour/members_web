require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
const app = express();
app.use(cors());
app.use(express.json());
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});
// Helper function for error handling
const handleError = (res, err) => {
  console.error(err.message);
  res.status(500).send("Server error");
};
// // Endpoint ทดสอบ
// app.get("/", (req, res) => {
//   res.send("Hello, LK HOUR🙋‍♂️!");
// });

//test API
app.get("/", (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to LK Hour</title>
      <style>
        body {
          font-family: 'Segoe UI', system-ui, sans-serif;
          background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
          height: 100vh;
          margin: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
        }
        .container {
          padding: 3rem;
          background: rgba(255, 255, 255, 0.95);
          border-radius: 1rem;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
          backdrop-filter: blur(10px);
        }
        h1 {
          color: #2c3e50;
          font-size: 2.5rem;
          margin-bottom: 1rem;
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        p {
          color: #34495e;
          font-size: 1.2rem;
          margin-top: 1.5rem;
        }
        .emoji {
          font-size: 2.2rem;
          animation: fadeIn 1.5s ease-in;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>
          <span class="emoji">👋</span>
          Welcome to LK Hour!
          <span class="emoji">🌟</span>
        </h1>
        <p>Your journey with premium timekeeping starts here</p>
        <small style="color: #7f8c8d; margin-top: 2rem; display: block;">
          Server timestamp: ${Date.now()} | Service: LK Hour Web Gateway
        </small>
      </div>
    </body>
    </html>
  `);
});

// Login endpoint
app.post("/login", async (req, res) => {
  const { email_mem, password_mem } = req.body;
  try {
    const result = await pool.query(
      "SELECT * FROM members WHERE email_mem = $1",
      [email_mem]
    );
    if (result.rows.length === 0) {
      return res.status(404).send("User not found");
    }

    const user = result.rows[0];
    if (password_mem != user.password_mem) {
      return res.status(401).send("Invalid credentials");
    }
    res.status(200).send({ message: "Login successful", user });
  } catch (err) {
    handleError(res, err);
  }
});

// Search members by name
app.post("/members/search", async (req, res) => {
  const { name_mem } = req.body;
  try {
    const result = await pool.query(
      "SELECT * FROM members WHERE name_mem ILIKE $1",
      [`%${name_mem}%`]
    );
    res.status(200).json(result.rows);
  } catch (err) {
    handleError(res, err);
  }
});
app.post("/members/searchid", async (req, res) => {
  const { id_mem } = req.body;
  try {
    const result = await pool.query("SELECT * FROM members WHERE id_mem = $1", [
      id_mem,
    ]);
    const user = result.rows[0];
    res.status(200).send({ user });
  } catch (err) {
    handleError(res, err);
  }
});
// Add a new member
app.post("/membersadd", async (req, res) => {
  const {
    name_mem,
    email_mem,
    password_mem,
    sex_mem,
    birthday_mem,
    phone_mem,
    address_mem,
    zipcode_mem,
    country_mem,
  } = req.body;
  try {
    await pool.query(
      "INSERT INTO members (name_mem, email_mem, password_mem, " +
        "sex_mem, birthday_mem, phone_mem, address_mem, zipcode_mem, country_mem) " +
        "VALUES ($1, $2, $3, " +
        "$4, $5, $6, $7, $8, $9)",
      [
        name_mem,
        email_mem,
        password_mem,
        sex_mem,
        birthday_mem,
        phone_mem,
        address_mem,
        zipcode_mem,
        country_mem,
      ]
    );
    res.status(201).send("Member added");
  } catch (err) {
    handleError(res, err);
  }
});
// Edit a member's data
app.put("/membersedit", async (req, res) => {
  const {
    id_mem,
    name_mem,
    email_mem,
    password_mem,
    sex_mem,
    birthday_mem,
    phone_mem,
    address_mem,
    zipcode_mem,
    country_mem,
  } = req.body;
  try {
    const updates = [];
    const values = [];
    if (name_mem) {
      updates.push(`name_mem = $${updates.length + 1}`);
      values.push(name_mem);
    }
    if (email_mem) {
      updates.push(`email_mem = $${updates.length + 1}`);
      values.push(email_mem);
    }
    if (password_mem) {
      updates.push(`password_mem = $${updates.length + 1}`);
      values.push(password_mem);
    }
    if (sex_mem) {
      updates.push(`sex_mem = $${updates.length + 1}`);
      values.push(sex_mem);
    }
    if (birthday_mem) {
      updates.push(`birthday_mem = $${updates.length + 1}`);
      values.push(birthday_mem);
    }
    if (phone_mem) {
      updates.push(`phone_mem = $${updates.length + 1}`);
      values.push(phone_mem);
    }
    if (address_mem) {
      updates.push(`address_mem = $${updates.length + 1}`);
      values.push(address_mem);
    }
    if (zipcode_mem) {
      updates.push(`zipcode_mem = $${updates.length + 1}`);
      values.push(zipcode_mem);
    }
    if (country_mem) {
      updates.push(`country_mem = $${updates.length + 1}`);
      values.push(country_mem);
    }

    if (updates.length === 0) {
      return res.status(400).send("No fields to update");
    }
    values.push(id_mem);
    await pool.query(
      `UPDATE members SET ${updates.join(", ")} WHERE id_mem = $${
        values.length
      }`,
      values
    );
    res.status(200).send("Member updated");
  } catch (err) {
    handleError(res, err);
  }
});
// Delete a member
app.delete("/membersdel", async (req, res) => {
  const { id_mem } = req.body;
  try {
    await pool.query("DELETE FROM members WHERE id_mem = $1", [id_mem]);
    res.status(200).send("Member deleted");
  } catch (err) {
    handleError(res, err);
  }
});
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
