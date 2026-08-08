const express = require("express");
const {
  getAllRegistrations,
  getPublicRegistrations,
  registerAlumni,
  getRegisterStatus
} = require("../controllers/registerController");
const { requireAdmin } = require("../utils/adminAuth");

const router = express.Router();

router.get("/all", requireAdmin, getAllRegistrations);
router.get("/public", getPublicRegistrations);
router.get("/", getRegisterStatus);
router.post("/", registerAlumni);

module.exports = router;
