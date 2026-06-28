const express = require("express");
const pool = require("../db/pool");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ status: "ok", database: "connected" });
  } catch (error) {
    console.error("Health check failed:", error.message);
    res.status(500).json({
      status: "error",
      database: "disconnected",
      message: "Database connection failed",
    });
  }
});

module.exports = router;
