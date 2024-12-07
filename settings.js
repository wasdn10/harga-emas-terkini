// settings.js - Advanced Settings Management (250 lines)

// DOM Elements
const settingsToggle = document.getElementById("settings-toggle");
const settingsPanel = document.getElementById("settings-panel");
const themeToggle = document.getElementById("theme-toggle");
const currencySelector = document.getElementById("currency-selector");
const refreshRateInput = document.getElementById("refresh-rate");
const logsContainer = document.getElementById("logs-container");

// User Preferences (Defaults)
const userPreferences = {
    theme: "light",
    currency: "USD",
    refreshRate: 5, // in minutes
};

// Log Messages to UI
function logMessage(message, type = "info") {
    const logEntry = document.createElement("p");
    logEntry.className = `log-${type}`;
    logEntry.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
    logsContainer.appendChild(logEntry);
    logsContainer.scrollTop = logsContainer.scrollHeight; // Auto-scroll
}

// Save Preferences to localStorage
function savePreferences() {
    try {
        localStorage.setItem("goldAnalyzerPreferences", JSON.stringify(userPreferences));
        logMessage("Preferences saved successfully.", "success");
    } catch (error) {
        logMessage("Failed to save preferences: " + error.message, "error");
    }
}

// Load Preferences from localStorage
function loadPreferences() {
    try {
        const savedPreferences = JSON.parse(localStorage.getItem("goldAnalyzerPreferences"));
        if (savedPreferences) {
            Object.assign(userPreferences, savedPreferences);
            logMessage("Preferences loaded successfully.", "success");
        } else {
            logMessage("No preferences found, using defaults.", "warning");
        }
        applyPreferences();
    } catch (error) {
        logMessage("Failed to load preferences: " + error.message, "error");
    }
}

// Apply Preferences to UI
function applyPreferences() {
    // Apply Theme
    document.body.setAttribute("data-theme", userPreferences.theme);
    themeToggle.checked = userPreferences.theme === "dark";

    // Apply Currency
    currencySelector.value = userPreferences.currency;

    // Apply Refresh Rate
    refreshRateInput.value = userPreferences.refreshRate;

    logMessage("Preferences applied successfully.");
}

// Theme Toggle Handler
themeToggle.addEventListener("change", () => {
    userPreferences.theme = themeToggle.checked ? "dark" : "light";
    savePreferences();
    applyPreferences();
    logMessage(`Theme changed to ${userPreferences.theme}.`);
});

// Currency Selector Handler
currencySelector.addEventListener("change", () => {
    const selectedCurrency = currencySelector.value;
    userPreferences.currency = selectedCurrency;
    savePreferences();
    logMessage(`Currency changed to ${selectedCurrency}.`);
});

// Refresh Rate Input Handler
refreshRateInput.addEventListener("change", () => {
    const rate = parseInt(refreshRateInput.value, 10);
    if (rate >= 1 && rate <= 60) {
        userPreferences.refreshRate = rate;
        savePreferences();
        logMessage(`Refresh rate changed to ${rate} minutes.`);
    } else {
        logMessage("Invalid refresh rate. Must be between 1 and 60 minutes.", "error");
        refreshRateInput.value = userPreferences.refreshRate;
    }
});

// Settings Panel Toggle
settingsToggle.addEventListener("click", () => {
    const isHidden = settingsPanel.getAttribute("aria-hidden") === "true";
    settingsPanel.setAttribute("aria-hidden", !isHidden);
    logMessage(`Settings panel ${isHidden ? "opened" : "closed"}.`);
});

// Advanced Error Handling
window.addEventListener("error", (event) => {
    logMessage(`Global Error: ${event.message}`, "error");
});

// Clear Logs (Optional)
document.getElementById("clear-logs").addEventListener("click", () => {
    logsContainer.innerHTML = "";
    logMessage("Logs cleared.");
});

// Utility: Validate Preferences
function validatePreferences() {
    let valid = true;

    if (!["light", "dark"].includes(userPreferences.theme)) {
        logMessage("Invalid theme preference.", "error");
        valid = false;
    }

    if (typeof userPreferences.currency !== "string" || userPreferences.currency.length !== 3) {
        logMessage("Invalid currency preference.", "error");
        valid = false;
    }

    if (typeof userPreferences.refreshRate !== "number" || userPreferences.refreshRate < 1 || userPreferences.refreshRate > 60) {
        logMessage("Invalid refresh rate preference.", "error");
        valid = false;
    }

    if (valid) {
        logMessage("Preferences validated successfully.");
    }

    return valid;
}

// Initialize Settings
function initializeSettings() {
    logMessage("Initializing settings...");
    loadPreferences();
    if (!validatePreferences()) {
        logMessage("Preferences validation failed. Resetting to defaults.", "warning");
        localStorage.removeItem("goldAnalyzerPreferences");
        Object.assign(userPreferences, {
            theme: "light",
            currency: "USD",
            refreshRate: 5,
        });
        applyPreferences();
    }
}

// Initialization
initializeSettings();
