const express = require("express");
const {
  getWebhookStatus,
  handleWebhook
} = require("../controllers/paymentController");

const router = express.Router();

router.get("/", getWebhookStatus);
router.post("/", handleWebhook);

module.exports = router;
