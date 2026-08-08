const sendRegistrationConfirmation = async (alumniPayload) => {
  return {
    status: "placeholder",
    sent: false,
    recipient: alumniPayload.email || null
  };
};

module.exports = {
  sendRegistrationConfirmation
};
