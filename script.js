const WEBSITE_URL = "https://uhnw-aesthetics.com";
const REQUEST_EMAIL = "request@uhnw-aesthetics.com";
const FORM_ENDPOINT = "";
const AUTO_REDIRECT_SECONDS = 0;

const requestOverlay = document.querySelector("#request");
const requestForm = document.querySelector("#requestForm");
const formStatus = document.querySelector("#formStatus");
const openRequestLinks = document.querySelectorAll("[data-open-request]");
const closeRequestButtons = document.querySelectorAll("[data-close-request]");
const websiteLink = document.querySelector("#websiteLink");

const isConfiguredUrl = (value) => {
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
};

const isConfiguredEmail = (value) => (
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
);

const openRequest = () => {
  requestOverlay.hidden = false;
  requestOverlay.setAttribute("aria-hidden", "false");
  document.body.classList.add("request-open");
};

const closeRequest = () => {
  requestOverlay.setAttribute("aria-hidden", "true");
  requestOverlay.hidden = true;
  document.body.classList.remove("request-open");
  if (window.location.hash === "#request") {
    history.pushState(null, "", `${window.location.pathname}${window.location.search}`);
  }
  document.querySelector("#primaryLink")?.focus();
};

openRequestLinks.forEach((link) => {
  link.addEventListener("click", (event) => {
    event.preventDefault();
    if (window.location.hash !== "#request") {
      history.pushState(null, "", "#request");
    }
    openRequest();
  });
});

closeRequestButtons.forEach((button) => {
  button.addEventListener("click", closeRequest);
});

requestOverlay.addEventListener("click", (event) => {
  if (event.target === requestOverlay) {
    closeRequest();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !requestOverlay.hidden) {
    closeRequest();
  }
});

window.addEventListener("popstate", () => {
  if (window.location.hash === "#request") {
    openRequest();
  } else if (!requestOverlay.hidden) {
    requestOverlay.setAttribute("aria-hidden", "true");
    requestOverlay.hidden = true;
    document.body.classList.remove("request-open");
  }
});

if (window.location.hash === "#request") {
  openRequest();
}

if (isConfiguredUrl(WEBSITE_URL)) {
  websiteLink.href = WEBSITE_URL;
} else {
  websiteLink.setAttribute("aria-disabled", "true");
  websiteLink.tabIndex = -1;
}

requestForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const formData = new FormData(requestForm);
  const payload = Object.fromEntries(formData.entries());

  if (FORM_ENDPOINT) {
    formStatus.textContent = "Sending request...";

    try {
      const response = await fetch(FORM_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Request failed");
      }

      requestForm.reset();
      formStatus.textContent = "Request sent. Thank you.";
    } catch {
      formStatus.textContent = "The request could not be sent. Please try again or use email.";
    }

    return;
  }

  if (!isConfiguredEmail(REQUEST_EMAIL)) {
    formStatus.textContent = "Add your email address in script.js to activate request sending.";
    return;
  }

  const subject = encodeURIComponent("Private review request");
  const body = encodeURIComponent(
    [
      `Name: ${payload.name || ""}`,
      `Email: ${payload.email || ""}`,
      `Preferred city: ${payload.city || ""}`,
      `Review type: ${payload.reviewType || ""}`,
      "",
      "Context:",
      payload.context || "",
    ].join("\n")
  );

  window.location.href = `mailto:${REQUEST_EMAIL}?subject=${subject}&body=${body}`;
  formStatus.textContent = "Opening your email client...";
});

if (isConfiguredUrl(WEBSITE_URL) && AUTO_REDIRECT_SECONDS > 0) {
  window.setTimeout(() => {
    window.location.assign(WEBSITE_URL);
  }, AUTO_REDIRECT_SECONDS * 1000);
}
