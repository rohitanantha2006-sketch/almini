const razorpayConfig = require("../config/razorpay");

const processWebhook = async (payload) => {
  return {
    status: "placeholder",
    provider: "razorpay",
    configured: razorpayConfig.isConfigured,
    payload
  };
};

module.exports = {
  processWebhook
};
