const crypto = require("crypto");

const COOKIE_NAME = "admin_session";
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

function getSessionSecret() {
  return process.env.ADMIN_SESSION_SECRET || "alumni-secret";
}

function createSignature(value) {
  return crypto
    .createHmac("sha256", getSessionSecret())
    .update(value)
    .digest("hex");
}

function encodeAdminSession(email) {
  const issuedAt = Date.now().toString();
  const payload = Buffer.from(`${email}|${issuedAt}`).toString("base64url");
  const signature = createSignature(payload);
  return `${payload}.${signature}`;
}

function parseCookies(cookieHeader = "") {
  return cookieHeader
    .split(";")
    .map((part) => part.trim())
    .filter(Boolean)
    .reduce((cookies, part) => {
      const separatorIndex = part.indexOf("=");

      if (separatorIndex === -1) {
        return cookies;
      }

      const key = part.slice(0, separatorIndex);
      const value = part.slice(separatorIndex + 1);
      cookies[key] = decodeURIComponent(value);
      return cookies;
    }, {});
}

function readAdminSession(req) {
  const cookies = parseCookies(req.headers.cookie);
  const token = cookies[COOKIE_NAME];

  if (!token) {
    return null;
  }

  const [payload, signature] = token.split(".");

  if (!payload || !signature || createSignature(payload) !== signature) {
    return null;
  }

  const decoded = Buffer.from(payload, "base64url").toString("utf8");
  const [email, issuedAt] = decoded.split("|");

  if (!email || !issuedAt) {
    return null;
  }

  if (Date.now() - Number(issuedAt) > SESSION_TTL_MS) {
    return null;
  }

  return {
    email,
    id: "admin"
  };
}

function buildSessionCookie(email) {
  const secure = process.env.NODE_ENV === "production";
  const token = encodeAdminSession(email);
  const parts = [
    `${COOKIE_NAME}=${encodeURIComponent(token)}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    `Max-Age=${Math.floor(SESSION_TTL_MS / 1000)}`
  ];

  if (secure) {
    parts.push("Secure");
  }

  return parts.join("; ");
}

function buildLogoutCookie() {
  const secure = process.env.NODE_ENV === "production";
  const parts = [
    `${COOKIE_NAME}=`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    "Max-Age=0"
  ];

  if (secure) {
    parts.push("Secure");
  }

  return parts.join("; ");
}

function requireAdmin(req, res, next) {
  const user = readAdminSession(req);

  if (!user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  req.user = user;
  return next();
}

module.exports = {
  buildLogoutCookie,
  buildSessionCookie,
  requireAdmin
};
