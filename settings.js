// settings.js - Advanced Settings Management

// DOM Elements
const settingsToggle = document.getElementById("settings-toggle");
const settingsPanel = document.getElementById("settings-panel");
const themeToggle = document.getElementById("theme-toggle");
const currencySelector = document.getElementById("currency-selector");
const refreshRateInput = document.getElementById("refresh-rate");
const saveSettingsButton = document.getElementById("save-settings");
const clearLogsButton = document.getElementById("clear-logs");

// User Preferences (Defaults)
const userPreferences = {
    theme: "light",
    currency: "USD",
    refreshRate: 5, // minutes
};

// Log Messages to UI
function logMessage(message, type = "info") {
    const logContainer = document.getElementById("alerts-container") || createLogContainer();
    const logEntry = document.createElement("div");
    logEntry.className = `log log-${type}`;
    logEntry.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
    logContainer.appendChild(logEntry);
    logContainer.scrollTop = logContainer.scrollHeight;

    // Auto-remove logs after 10 seconds
    setTimeout(() => logEntry.remove(), 10000);
}

// Create Log Container
function createLogContainer() {
    const container = document.createElement("div");
    container.id = "alerts-container";
    document.body.appendChild(container);
    return container;
}

// Save Preferences to localStorage
function savePreferences() {
    try {
        localStorage.setItem("goldAnalyzerPreferences", JSON.stringify(userPreferences));
        logMessage("Preferences saved successfully.", "success");
    } catch (error) {
        logMessage("Error saving preferences: " + error.message, "error");
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
            logMessage("No preferences found. Using defaults.", "warning");
        }
        applyPreferences();
    } catch (error) {
        logMessage("Error loading preferences: " + error.message, "error");
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

// Toggle Settings Panel Visibility
settingsToggle.addEventListener("click", () => {
    const isHidden = settingsPanel.getAttribute("aria-hidden") === "true";
    settingsPanel.setAttribute("aria-hidden", !isHidden);
    logMessage(`Settings panel ${isHidden ? "opened" : "closed"}.`);
});

// Handle Theme Change
themeToggle.addEventListener("change", () => {
    userPreferences.theme = themeToggle.checked ? "dark" : "light";
    savePreferences();
    applyPreferences();
    logMessage(`Theme changed to ${userPreferences.theme}.`);
});

// Handle Currency Change
currencySelector.addEventListener("change", () => {
    const selectedCurrency = currencySelector.value;
    userPreferences.currency = selectedCurrency;
    savePreferences();
    logMessage(`Currency changed to ${selectedCurrency}.`);
});

// Handle Refresh Rate Change
refreshRateInput.addEventListener("change", () => {
    const rate = parseInt(refreshRateInput.value, 10);
    if (rate >= 1 && rate <= 60) {
        userPreferences.refreshRate = rate;
        savePreferences();
        logMessage(`Refresh rate updated to ${rate} minutes.`);
    } else {
        logMessage("Invalid refresh rate. Must be between 1 and 60 minutes.", "error");
        refreshRateInput.value = userPreferences.refreshRate;
    }
});

// Save Settings Button
saveSettingsButton.addEventListener("click", () => {
    savePreferences();
    logMessage("Settings saved manually.", "success");
});

// Clear Logs Button
clearLogsButton.addEventListener("click", () => {
    const logContainer = document.getElementById("alerts-container");
    if (logContainer) logContainer.innerHTML = "";
    logMessage("Logs cleared.", "info");
});

// Advanced Error Handling
window.addEventListener("error", (event) => {
    logMessage(`Global error: ${event.message}`, "error");
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
        logMessage("Preferences validated successfully.", "success");
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

// Initialize on Load
initializeSettings();
