const express = require("express");
const {
  buildLogoutCookie,
  buildSessionCookie
} = require("../utils/adminAuth");

const router = express.Router();

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@gmail.com";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "1234";

router.post("/login", (req, res) => {
  const { email, password } = req.body;

  if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
    res.setHeader("Set-Cookie", buildSessionCookie(email));
    return res.json({ success: true, message: "Login successful" });
  }

  return res.status(401).json({ success: false, message: "Invalid credentials" });
});

router.post("/logout", (req, res) => {
  res.setHeader("Set-Cookie", buildLogoutCookie());
  return res.json({ success: true, message: "Logged out" });
});

module.exports = router;
