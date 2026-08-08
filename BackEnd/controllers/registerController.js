const Alumni = require("../models/alumniModel");

const getRegisterStatus = (req, res) => {
  res.json({ message: "Register route ready" });
};

const getAllRegistrations = async (req, res) => {
  try {
    const registrations = await Alumni.find().sort({ createdAt: -1 });

    res.json({
      success: true,
      data: registrations
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

const getPublicRegistrations = async (req, res) => {
  try {
    const registrations = await Alumni.find()
      .select("name graduationYear membershipPlan")
      .sort({ graduationYear: -1, createdAt: -1 });

    const formatted = registrations.map((user) => ({
      name: user.name,
      batch: user.graduationYear,
      membershipStatus: user.membershipPlan ? "Member" : "Non-member",
      registrationStatus: "Registered"
    }));

    res.json({
      success: true,
      data: formatted
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

const registerAlumni = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      graduationYear,
      group,
      membershipPlan
    } = req.body;

    const registrationData = {
      name,
      email,
      phone,
      graduationYear: Number(graduationYear),
      group,
      membershipPlan
    };

    const savedRegistration = await Alumni.create(registrationData);

    res.json({
      success: true,
      message: "Registration saved",
      data: savedRegistration
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

module.exports = {
  getAllRegistrations,
  getPublicRegistrations,
  getRegisterStatus,
  registerAlumni
};
