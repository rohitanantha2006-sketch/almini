const API_BASE_URL = ["localhost", "127.0.0.1"].includes(window.location.hostname)
  ? "http://localhost:3001"
  : "";
const PUBLIC_ALUMNI_API_URL = `${API_BASE_URL}/api/register/public`;
const ADMIN_ALUMNI_API_URL = `${API_BASE_URL}/api/register/all`;

document.addEventListener("DOMContentLoaded", () => {
  initializeMobileNavigation();
  loadAlumni();
});

function initializeMobileNavigation() {
  const navToggle = document.querySelector(".navbar__toggle");
  const navMenu = document.querySelector(".navbar__menu");

  if (!navToggle || !navMenu) {
    return;
  }

  const mobileBreakpoint = window.matchMedia("(max-width: 768px)");

  function setMenuState(isOpen) {
    navToggle.setAttribute("aria-expanded", String(isOpen));
    navMenu.classList.toggle("is-open", isOpen);
  }

  function syncNavigationState() {
    setMenuState(false);
    navMenu.hidden = false;
  }

  navToggle.addEventListener("click", () => {
    if (!mobileBreakpoint.matches) {
      return;
    }

    const isExpanded = navToggle.getAttribute("aria-expanded") === "true";
    setMenuState(!isExpanded);
  });

  navMenu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      if (!mobileBreakpoint.matches) {
        return;
      }

      setMenuState(false);
    });
  });

  if (typeof mobileBreakpoint.addEventListener === "function") {
    mobileBreakpoint.addEventListener("change", syncNavigationState);
  } else {
    mobileBreakpoint.addListener(syncNavigationState);
  }

  syncNavigationState();
}

async function loadAlumni() {
  const container = document.getElementById("alumni-container");
  const isAdminView = document.body.dataset.view === "admin";

  if (!container) {
    return;
  }

  showMessage(container, "Loading alumni...");

  try {
    const requestUrl = isAdminView ? ADMIN_ALUMNI_API_URL : PUBLIC_ALUMNI_API_URL;
    const requestOptions = isAdminView ? { credentials: "include" } : {};
    const response = await fetch(requestUrl, requestOptions);

    if (!response.ok) {
      throw new Error("Request failed");
    }

    const result = await response.json();
    const alumniList = Array.isArray(result.data) ? result.data : [];

    if (!result.success || alumniList.length === 0) {
      showMessage(container, "No alumni found");
      return;
    }

    const groupedAlumni = groupByYear(alumniList);
    renderAlumni(container, groupedAlumni, isAdminView);
  } catch (error) {
    showMessage(container, "Unable to load alumni data");
  }
}

function groupByYear(alumniList) {
  const grouped = {};

  alumniList.forEach((alumni) => {
    const year = alumni.graduationYear || alumni.batch || "Unknown";

    if (!grouped[year]) {
      grouped[year] = [];
    }

    grouped[year].push(alumni);
  });

  return Object.entries(grouped)
    .sort((firstBatch, secondBatch) => Number(secondBatch[0]) - Number(firstBatch[0]));
}

function renderAlumni(container, groupedAlumni, isAdminView) {
  container.textContent = "";

  groupedAlumni.forEach(([year, alumniList]) => {
    const batchSection = document.createElement("section");
    batchSection.className = "batch alumni-batch";

    const batchHeader = document.createElement("button");
    batchHeader.className = "batch-header";
    batchHeader.type = "button";
    batchHeader.setAttribute("aria-expanded", "false");

    const batchTitle = document.createElement("span");
    batchTitle.className = "batch-header__title";
    batchTitle.textContent = `Batch ${year}`;

    const batchArrow = document.createElement("span");
    batchArrow.className = "batch-header__arrow";
    batchArrow.textContent = "\u25BC";
    batchArrow.setAttribute("aria-hidden", "true");

    batchHeader.appendChild(batchTitle);
    batchHeader.appendChild(batchArrow);

    const batchContent = document.createElement("div");
    batchContent.className = "batch-content hidden";

    const table = createAlumniTable(alumniList, isAdminView);
    batchContent.appendChild(table);

    batchHeader.addEventListener("click", () => {
      const isHidden = batchContent.classList.toggle("hidden");
      batchHeader.setAttribute("aria-expanded", String(!isHidden));
      batchArrow.textContent = isHidden ? "\u25BC" : "\u25B2";
    });

    batchSection.appendChild(batchHeader);
    batchSection.appendChild(batchContent);
    container.appendChild(batchSection);
  });
}

function createAlumniTable(alumniList, isAdminView) {
  const table = document.createElement("table");
  table.className = "alumni-table";

  const tableHead = document.createElement("thead");
  const headRow = document.createElement("tr");

  const headings = isAdminView
    ? ["Name", "Email", "Membership Plan", "Status"]
    : ["Name", "Membership Status", "Registration Status"];

  headings.forEach((headingText) => {
    const heading = document.createElement("th");
    heading.scope = "col";
    heading.textContent = headingText;
    headRow.appendChild(heading);
  });

  tableHead.appendChild(headRow);
  table.appendChild(tableHead);

  const tableBody = document.createElement("tbody");

  alumniList.forEach((alumni) => {
    const row = document.createElement("tr");

    row.appendChild(createTableCell(alumni.name || "Unnamed Alumni"));

    if (isAdminView) {
      const emailCell = document.createElement("td");

      if (alumni.email) {
        const emailLink = document.createElement("a");
        emailLink.href = `mailto:${alumni.email}`;
        emailLink.textContent = alumni.email;
        emailCell.appendChild(emailLink);
      } else {
        emailCell.textContent = "Not provided";
      }

      row.appendChild(emailCell);
      row.appendChild(createTableCell(formatMembershipPlan(alumni.membershipPlan)));
      row.appendChild(createTableCell("Registered"));
    } else {
      row.appendChild(createTableCell(alumni.membershipStatus || "Non-member"));
      row.appendChild(createTableCell(alumni.registrationStatus || "Registered"));
    }

    tableBody.appendChild(row);
  });

  table.appendChild(tableBody);

  return table;
}

function createTableCell(text) {
  const cell = document.createElement("td");
  cell.textContent = text;
  return cell;
}

function showMessage(container, message) {
  container.textContent = "";

  const messageElement = document.createElement("p");
  messageElement.className = "alumni-message";
  messageElement.textContent = message;

  container.appendChild(messageElement);
}

function formatMembershipPlan(plan) {
  if (!plan) {
    return "Not specified";
  }

  return `${plan.charAt(0).toUpperCase()}${plan.slice(1)} Plan`;
}
