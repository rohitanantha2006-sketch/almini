const razorpayService = require("../services/razorpayService");

const getWebhookStatus = (req, res) => {
  res.json({ message: "Webhook route ready" });
};

const handleWebhook = async (req, res) => {
  try {
    const result = await razorpayService.processWebhook(req.body);

    res.status(200).json({
      message: "Webhook placeholder processed",
      data: result
    });
  } catch (error) {
    res.status(400).json({
      message: "Unable to process webhook placeholder",
      error: error.message
    });
  }
};

module.exports = {
  getWebhookStatus,
  handleWebhook
};
