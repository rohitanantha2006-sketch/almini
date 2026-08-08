const API_BASE_URL = ["localhost", "127.0.0.1"].includes(window.location.hostname)
  ? "http://localhost:3001"
  : "";

document.addEventListener("DOMContentLoaded", () => {
  initializeMotionPreferences();
  initializeMobileNavigation();
  initializeSmoothScrolling();
  initializeScrollAnimations();
  initializeStatCounters();
  initializeMembershipPlanSelection();
  initializeRegistrationFormValidation();
  initializeRazorpayPlaceholder();
});

const REGISTER_API_URL = `${API_BASE_URL}/api/register`;

function initializeMotionPreferences() {
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (!prefersReducedMotion) {
    document.body.classList.add("motion-safe");
  }
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
    if (mobileBreakpoint.matches) {
      setMenuState(false);
      navMenu.hidden = false;
      return;
    }

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

  navMenu.querySelectorAll("a[href^='#']").forEach((link) => {
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

function initializeSmoothScrolling() {
  const internalLinks = document.querySelectorAll("a[href^='#']");

  internalLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      const targetId = link.getAttribute("href");

      if (!targetId || targetId === "#") {
        return;
      }

      const targetElement = document.querySelector(targetId);

      if (!targetElement) {
        return;
      }

      event.preventDefault();

      targetElement.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
    });
  });
}

function initializeScrollAnimations() {
  const revealElements = document.querySelectorAll(".reveal-on-scroll");
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (!revealElements.length) {
    return;
  }

  if (prefersReducedMotion || !("IntersectionObserver" in window)) {
    revealElements.forEach((element) => {
      element.classList.add("is-visible");
    });
    return;
  }

  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) {
        return;
      }

      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
    });
  }, {
    threshold: 0.18,
    rootMargin: "0px 0px -8% 0px"
  });

  revealElements.forEach((element) => {
    revealObserver.observe(element);
  });
}

function initializeStatCounters() {
  const statsSection = document.querySelector(".stats-section");
  const counters = document.querySelectorAll(".stat-card__number[data-counter]");
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (!statsSection || !counters.length) {
    return;
  }

  function setFinalValues() {
    counters.forEach((counter) => {
      const targetValue = Number(counter.dataset.counter || 0);
      const suffix = counter.dataset.suffix || "";
      counter.textContent = `${formatCounterValue(targetValue)}${suffix}`;
    });
  }

  if (prefersReducedMotion || !("IntersectionObserver" in window)) {
    setFinalValues();
    return;
  }

  const counterObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) {
        return;
      }

      counters.forEach((counter) => {
        animateCounter(counter, 2000);
      });

      observer.unobserve(entry.target);
    });
  }, {
    threshold: 0.3
  });

  counterObserver.observe(statsSection);
}

function animateCounter(element, duration) {
  const targetValue = Number(element.dataset.counter || 0);
  const suffix = element.dataset.suffix || "";
  const startTime = performance.now();

  function updateCounter(currentTime) {
    const progress = Math.min((currentTime - startTime) / duration, 1);
    const easedProgress = 1 - Math.pow(1 - progress, 3);
    const currentValue = Math.round(targetValue * easedProgress);

    element.textContent = `${formatCounterValue(currentValue)}${suffix}`;

    if (progress < 1) {
      window.requestAnimationFrame(updateCounter);
    }
  }

  window.requestAnimationFrame(updateCounter);
}

function formatCounterValue(value) {
  return new Intl.NumberFormat("en-IN").format(value);
}

function initializeMembershipPlanSelection() {
  const planButtons = document.querySelectorAll("[data-plan-select]");
  const membershipPlanField = document.getElementById("membership-plan");
  const registrationSection = document.getElementById("registration");
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (!planButtons.length || !membershipPlanField || !registrationSection) {
    return;
  }

  planButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const selectedPlan = button.dataset.planSelect;

      if (!selectedPlan) {
        return;
      }

      membershipPlanField.value = selectedPlan;
      membershipPlanField.dispatchEvent(new Event("change", { bubbles: true }));

      registrationSection.scrollIntoView({
        behavior: prefersReducedMotion ? "auto" : "smooth",
        block: "start"
      });

      window.setTimeout(() => {
        membershipPlanField.focus({ preventScroll: true });
      }, prefersReducedMotion ? 0 : 300);
    });
  });
}

function initializeRegistrationFormValidation() {
  const form = document.querySelector(".registration-form");

  if (!form) {
    return;
  }

  const submitButton = form.querySelector('button[type="submit"]');

  const fields = {
    fullName: form.querySelector("#full-name"),
    email: form.querySelector("#email-address"),
    phone: form.querySelector("#phone-number"),
    graduationYear: form.querySelector("#graduation-year"),
    membershipPlan: form.querySelector("#membership-plan"),
    group: form.querySelector("#group")
  };

  const feedback = document.createElement("p");
  feedback.className = "form-feedback";
  feedback.setAttribute("aria-live", "polite");
  form.appendChild(feedback);

  form.addEventListener("submit", async (event) => {
    const errors = [];
    const currentYear = new Date().getFullYear();

    // Stop the browser from reloading the page when the form is submitted.
    event.preventDefault();

    clearFieldErrors(Object.values(fields));

    if (!fields.fullName.value.trim()) {
      errors.push({
        field: fields.fullName,
        message: "Please enter your full name."
      });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email.value.trim())) {
      errors.push({
        field: fields.email,
        message: "Please enter a valid email address."
      });
    }

    if (!/^\+?[0-9\s-]{10,15}$/.test(fields.phone.value.trim())) {
      errors.push({
        field: fields.phone,
        message: "Please enter a valid phone number."
      });
    }

    const graduationYear = Number(fields.graduationYear.value);
    if (!Number.isInteger(graduationYear) || graduationYear < 1900 || graduationYear > currentYear) {
      errors.push({
        field: fields.graduationYear,
        message: `Please enter a graduation year between 1900 and ${currentYear}.`
      });
    }

    if (!fields.membershipPlan.value) {
      errors.push({
        field: fields.membershipPlan,
        message: "Please select a membership plan."
      });
    }

    if (!fields.group.value.trim()) {
      errors.push({
        field: fields.group,
        message: "Please enter your group."
      });
    }

    if (errors.length > 0) {
      showValidationErrors(errors, feedback);
      errors[0].field.focus();
      return;
    }

    // Build a clean JSON payload from the form fields.
    const payload = {
      name: fields.fullName.value.trim(),
      email: fields.email.value.trim(),
      phone: fields.phone.value.trim(),
      graduationYear: fields.graduationYear.value.trim(),
      group: fields.group.value.trim(),
      membershipPlan: fields.membershipPlan.value
    };

    try {
      if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = "Submitting...";
      }

      feedback.textContent = "Submitting your registration...";
      feedback.dataset.state = "";

      // Send the registration to the backend as JSON.
      const response = await fetch(REGISTER_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify(payload)
      });

      const result = await response.json().catch(() => null);

      if (!response.ok) {
        const errorMessage = result && result.message
          ? result.message
          : "Something went wrong while submitting the form.";
        throw new Error(errorMessage);
      }

      feedback.textContent = "Registration submitted successfully.";
      feedback.dataset.state = "success";
      form.reset();
    } catch (error) {
      feedback.textContent = error.message || "Unable to submit the form right now.";
      feedback.dataset.state = "error";
    } finally {
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = "Submit Registration";
      }
    }
  });
}

function clearFieldErrors(fields) {
  fields.forEach((field) => {
    if (!field) {
      return;
    }

    field.removeAttribute("aria-invalid");
    field.removeAttribute("aria-describedby");

    const nextElement = field.nextElementSibling;
    if (nextElement && nextElement.classList.contains("form-error")) {
      nextElement.remove();
    }
  });
}

function showValidationErrors(errors, feedback) {
  feedback.textContent = "Please correct the highlighted fields and try again.";
  feedback.dataset.state = "error";

  errors.forEach(({ field, message }) => {
    if (!field) {
      return;
    }

    const errorId = `${field.id}-error`;
    const errorMessage = document.createElement("span");
    errorMessage.className = "form-error";
    errorMessage.id = errorId;
    errorMessage.textContent = message;

    field.setAttribute("aria-invalid", "true");
    field.setAttribute("aria-describedby", errorId);
    field.insertAdjacentElement("afterend", errorMessage);
  });
}

function initializeRazorpayPlaceholder() {
  const subscribeButton = document.getElementById("razorpay-subscribe");

  if (!subscribeButton) {
    return;
  }

  subscribeButton.addEventListener("click", function () {
    alert("Razorpay integration will be connected here.");
  });
}
