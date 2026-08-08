const API_BASE_URL = ["localhost", "127.0.0.1"].includes(window.location.hostname)
  ? "http://localhost:3001"
  : "";
const LOGOUT_API = `${API_BASE_URL}/api/auth/logout`;

document.getElementById("logoutBtn")?.addEventListener("click", async () => {
  try {
    await fetch(LOGOUT_API, {
      method: "POST",
      credentials: "include"
    });

    alert("Logged out");
    window.location.reload();
  } catch (error) {
    alert("Unable to log out right now.");
  }
});
