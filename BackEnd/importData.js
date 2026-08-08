const path = require("path");
const fs = require("fs");
const mongoose = require("mongoose");
const XLSX = require("xlsx");
require("dotenv").config();

const Alumni = require("./models/alumniModel");

function resolveWorkbookPath() {
  const preferredPath = path.resolve(__dirname, "data", "alumni.xlsx");
  const fallbackPath = path.resolve(
    __dirname,
    "..",
    "Copy of Alumni_Information_Responses_25-11-201726revised.xlsx"
  );

  if (fs.existsSync(preferredPath)) {
    return preferredPath;
  }

  if (fs.existsSync(fallbackPath)) {
    return fallbackPath;
  }

  throw new Error(
    "Excel file not found. Place it at BackEnd/data/alumni.xlsx or keep the existing project root workbook."
  );
}

function normalizeKey(key) {
  return String(key || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function cleanRow(row) {
  const cleanedRow = {};

  Object.entries(row || {}).forEach(([key, value]) => {
    if (!key || /^Unnamed/i.test(String(key).trim())) {
      return;
    }

    cleanedRow[key] = value;
  });

  return cleanedRow;
}

function buildNormalizedRow(row) {
  const normalized = {};

  Object.entries(cleanRow(row)).forEach(([key, value]) => {
    normalized[normalizeKey(key)] = value;
  });

  return normalized;
}

function getValue(normalizedRow, exactKeys, partialKeys = []) {
  for (const key of exactKeys) {
    if (normalizedRow[key] !== undefined && normalizedRow[key] !== null && normalizedRow[key] !== "") {
      return normalizedRow[key];
    }
  }

  const rowKeys = Object.keys(normalizedRow);

  for (const partialKey of partialKeys) {
    const match = rowKeys.find((key) => key.includes(partialKey));

    if (match && normalizedRow[match] !== undefined && normalizedRow[match] !== null && normalizedRow[match] !== "") {
      return normalizedRow[match];
    }
  }

  return "";
}

function toCleanString(value) {
  return String(value || "").trim();
}

function toYear(value) {
  const year = Number.parseInt(String(value || "").trim(), 10);
  return Number.isFinite(year) ? year : undefined;
}

function mapRow(row) {
  const normalizedRow = buildNormalizedRow(row);

  const name = toCleanString(getValue(
    normalizedRow,
    ["name", "full name", "alumni name"],
    ["name"]
  ));

  const graduationYear = toYear(getValue(
    normalizedRow,
    ["batch", "year", "graduation year", "passing year", "pass out year"],
    ["batch", "year", "graduation", "passing"]
  ));

  const membershipPlan = toCleanString(getValue(
    normalizedRow,
    ["membership", "member", "subscription", "membership plan", "plan"],
    ["membership", "member", "subscription", "plan"]
  ));

  const group = toCleanString(getValue(
    normalizedRow,
    ["group", "department", "section", "stream"],
    ["group", "department", "section", "stream"]
  ));

  const email = toCleanString(getValue(
    normalizedRow,
    ["email", "email address", "mail id"],
    ["email", "mail"]
  ));

  const phone = toCleanString(getValue(
    normalizedRow,
    ["phone", "phone number", "mobile", "mobile number", "contact number"],
    ["phone", "mobile", "contact"]
  ));

  return {
    name,
    graduationYear,
    membershipPlan,
    group,
    email,
    phone
  };
}

async function importData() {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const workbookPath = resolveWorkbookPath();
    const workbook = XLSX.readFile(workbookPath);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(sheet, { defval: "" });

    console.log("Using Excel file:", workbookPath);
    console.log("Total rows:", data.length);
    console.log("First row:", data[0]);

    const formatted = data.map(mapRow);
    const cleaned = formatted.filter((user) => user.name);

    console.log("Formatted sample:", formatted[0]);

    await Alumni.deleteMany({});
    const result = await Alumni.insertMany(cleaned);

    console.log("Inserted count:", result.length);
    console.log(`Data imported successfully. Imported ${cleaned.length} records.`);
    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

importData();
