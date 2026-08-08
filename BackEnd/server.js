require("dotenv").config();

const express = require("express");
const cors = require("cors");

const registerRoute = require("./routes/registerRoute");
const webhookRoute = require("./routes/webhookRoute");
const authRoute = require("./routes/authRoute");
const connectDB = require("./config/db");

const app = express();
const PORT = process.env.PORT || 3001;

const allowedOrigins = new Set([
  "http://localhost:5500",
  "http://127.0.0.1:5500"
]);

if (process.env.FRONTEND_ORIGIN) {
  allowedOrigins.add(process.env.FRONTEND_ORIGIN);
}

app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.has(origin)) {
      return callback(null, true);
    }

    return callback(new Error("Origin not allowed by CORS"));
  },
  credentials: true
}));
app.use(express.json());

let bootstrapPromise;

function bootstrap() {
  if (!bootstrapPromise) {
    bootstrapPromise = connectDB();
  }

  return bootstrapPromise;
}

app.use(async (req, res, next) => {
  try {
    await bootstrap();
    return next();
  } catch (error) {
    console.error("MongoDB connection failed:", error);
    return res.status(500).json({ success: false, message: "Database connection failed" });
  }
});

app.get("/", (req, res) => {
  res.send("Alumni backend running");
});

app.use("/api/auth", authRoute);
app.use("/api/register", registerRoute);
app.use("/api/webhook", webhookRoute);

if (require.main === module) {
  bootstrap()
    .then(() => {
      app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
      });
    })
    .catch((error) => {
      console.error("Startup failed:", error);
      process.exit(1);
    });
}

module.exports = app;
