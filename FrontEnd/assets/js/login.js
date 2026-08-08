const BASE_URL = ["localhost", "127.0.0.1"].includes(window.location.hostname)
  ? "http://localhost:3001"
  : "";
const LOGIN_API_URL = `${BASE_URL}/api/auth/login`;

document.addEventListener("DOMContentLoaded", () => {
  initializeLoginForm();
  initializeMobileNavigation();
});

function initializeLoginForm() {
  const form = document.querySelector(".login-form");
  const message = document.getElementById("login-message");

  if (!form || !message) {
    return;
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.querySelector("#email").value.trim();
    const password = document.querySelector("#password").value;

    message.textContent = "";
    message.dataset.state = "";

    try {
      const response = await fetch(LOGIN_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      message.textContent = "Login successful. Redirecting...";
      message.dataset.state = "success";
      alert("Login successful");
      window.location.href = "admin.html";
    } catch (error) {
      message.textContent = error.message || "Unable to log in right now.";
      message.dataset.state = "error";
      alert(error.message || "Unable to log in right now.");
    }
  });
}

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
