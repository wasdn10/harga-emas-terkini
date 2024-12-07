// script.js

// DOM Elements
const settingsToggle = document.getElementById("settings-toggle");
const settingsPanel = document.getElementById("settings-panel");
const themeToggle = document.getElementById("theme-toggle");
const currencySelector = document.getElementById("currency-selector");
const refreshRateInput = document.getElementById("refresh-rate");
const goldPriceElement = document.getElementById("gold-price");
const alertsContainer = document.getElementById("alerts-container");

// User Preferences (Defaults)
const userPreferences = {
    theme: "light",
    currency: "USD",
    refreshRate: 5,
};

// Load Preferences from localStorage
function loadPreferences() {
    const savedPreferences = JSON.parse(localStorage.getItem("goldAnalyzerPreferences"));
    if (savedPreferences) {
        Object.assign(userPreferences, savedPreferences);
        applyPreferences();
    }
}

// Save Preferences to localStorage
function savePreferences() {
    localStorage.setItem("goldAnalyzerPreferences", JSON.stringify(userPreferences));
}

// Apply Preferences
function applyPreferences() {
    // Theme
    document.body.setAttribute("data-theme", userPreferences.theme);
    themeToggle.checked = userPreferences.theme === "dark";

    // Currency
    currencySelector.value = userPreferences.currency;

    // Refresh Rate
    refreshRateInput.value = userPreferences.refreshRate;
}

// Toggle Settings Panel
settingsToggle.addEventListener("click", () => {
    const isHidden = settingsPanel.getAttribute("aria-hidden") === "true";
    settingsPanel.setAttribute("aria-hidden", !isHidden);
});

// Theme Toggle
themeToggle.addEventListener("change", (e) => {
    userPreferences.theme = e.target.checked ? "dark" : "light";
    applyPreferences();
    savePreferences();
});

// Currency Selector
currencySelector.addEventListener("change", (e) => {
    userPreferences.currency = e.target.value;
    savePreferences();
    fetchGoldPrice(); // Refresh price in selected currency
});

// Refresh Rate Handler
refreshRateInput.addEventListener("change", (e) => {
    const rate = parseInt(e.target.value, 10);
    if (rate >= 1 && rate <= 60) {
        userPreferences.refreshRate = rate;
        savePreferences();
        restartAutoRefresh();
    } else {
        alert("Refresh rate must be between 1 and 60 minutes.");
        refreshRateInput.value = userPreferences.refreshRate;
    }
});

// Fetch Gold Price
async function fetchGoldPrice() {
    try {
        const response = await fetch(
            `https://metals-api.com/api/latest?access_key=your_api_key&base=${userPreferences.currency}&symbols=XAU`
        );
        if (!response.ok) throw new Error("Failed to fetch gold price");

        const data = await response.json();
        const goldPrice = data.rates["XAU"];
        updateGoldPrice(goldPrice);
    } catch (error) {
        showError("Unable to fetch gold price. Please try again later.");
    }
}

// Update Gold Price on Page
function updateGoldPrice(price) {
    goldPriceElement.textContent = price.toFixed(2);
}

// Show Alerts
function showAlert(message) {
    const alertElement = document.createElement("p");
    alertElement.textContent = message;
    alertElement.className = "alert";
    alertsContainer.appendChild(alertElement);

    setTimeout(() => {
        alertElement.remove();
    }, 5000); // Auto-remove alert after 5 seconds
}

// Show Error Notification
function showError(message) {
    showAlert(message);
    console.error(message);
}

// Auto-Refresh Handler
let autoRefreshInterval;
function restartAutoRefresh() {
    if (autoRefreshInterval) clearInterval(autoRefreshInterval);
    autoRefreshInterval = setInterval(fetchGoldPrice, userPreferences.refreshRate * 60000);
}

// Initialize App
function initializeApp() {
    loadPreferences();
    fetchGoldPrice();
    restartAutoRefresh();
}

// Initialize on Load
initializeApp();

