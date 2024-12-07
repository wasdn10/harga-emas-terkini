// livePrice.js - Fetch Live Gold Price and Convert to MYR (250 Lines)

// DOM Elements
const goldPriceElement = document.getElementById("gold-price");
const alertsContainer = document.getElementById("alerts-container");

// Logging Utility
function logAlert(message, type = "info") {
    const alertEntry = document.createElement("div");
    alertEntry.className = `alert-${type}`;
    alertEntry.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
    alertsContainer.appendChild(alertEntry);
    alertsContainer.scrollTop = alertsContainer.scrollHeight;

    // Auto-remove alerts after 10 seconds
    setTimeout(() => alertEntry.remove(), 10000);
}

// Fetch Gold Price from a Website (Scraping)
async function fetchGoldPrice() {
    logAlert("Fetching gold price...");
    try {
        const response = await fetch("https://www.example.com/gold-price"); // Replace with the actual target URL
        if (!response.ok) throw new Error("Failed to fetch gold price data.");

        const html = await response.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, "text/html");

        // Scrape the gold price (adjust the selector for the target website)
        const priceElement = doc.querySelector(".gold-price"); // Example class
        const priceInUSD = parseFloat(priceElement.textContent.replace(/[^0-9.]/g, ""));
        if (isNaN(priceInUSD)) throw new Error("Invalid price format.");

        logAlert(`Fetched gold price: ${priceInUSD.toFixed(2)} USD/oz`, "success");
        return priceInUSD;
    } catch (error) {
        logAlert(`Error fetching gold price: ${error.message}`, "error");
        return null;
    }
}

// Fetch Exchange Rate for MYR
async function fetchExchangeRate() {
    logAlert("Fetching USD to MYR exchange rate...");
    try {
        const response = await fetch("https://api.exchangerate-api.com/v4/latest/USD"); // Replace with a free currency API
        if (!response.ok) throw new Error("Failed to fetch exchange rate data.");

        const data = await response.json();
        const rateToMYR = data.rates.MYR;
        if (!rateToMYR) throw new Error("MYR exchange rate unavailable.");

        logAlert(`Fetched exchange rate: 1 USD = ${rateToMYR.toFixed(2)} MYR`, "success");
        return rateToMYR;
    } catch (error) {
        logAlert(`Error fetching exchange rate: ${error.message}`, "error");
        return null;
    }
}

// Convert USD to MYR
async function convertToMYR(priceInUSD) {
    const rateToMYR = await fetchExchangeRate();
    if (!rateToMYR) return null;
    const priceInMYR = priceInUSD * rateToMYR;
    logAlert(`Converted price to MYR: ${priceInMYR.toFixed(2)} MYR/oz`, "success");
    return priceInMYR;
}

// Update Gold Price on the Page
async function updateGoldPrice() {
    const priceInUSD = await fetchGoldPrice();
    if (!priceInUSD) {
        goldPriceElement.textContent = "N/A";
        return;
    }

    let priceToDisplay = `${priceInUSD.toFixed(2)} USD/oz`;

    // Convert to MYR if selected
    if (userPreferences.currency === "MYR") {
        const priceInMYR = await convertToMYR(priceInUSD);
        if (priceInMYR) {
            priceToDisplay = `${priceInMYR.toFixed(2)} MYR/oz`;
        } else {
            logAlert("Unable to convert to MYR.", "warning");
        }
    }

    // Update UI
    goldPriceElement.textContent = priceToDisplay;
}

// Auto-Refresh Mechanism
let autoRefreshInterval;

function restartAutoRefresh() {
    if (autoRefreshInterval) clearInterval(autoRefreshInterval);

    logAlert(`Setting auto-refresh to ${userPreferences.refreshRate} minutes.`);
    autoRefreshInterval = setInterval(() => {
        logAlert("Auto-refresh triggered.");
        updateGoldPrice();
    }, userPreferences.refreshRate * 60000);

    // Fetch immediately
    updateGoldPrice();
}

// Handle User Preference Change
currencySelector.addEventListener("change", () => {
    logAlert(`Currency changed to ${userPreferences.currency}. Refreshing price...`);
    updateGoldPrice();
});

// Initialize Live Price Updates
function initializeLivePrice() {
    logAlert("Initializing live price updates...");
    updateGoldPrice();
    restartAutoRefresh();
}

// Start Live Price Updates
initializeLivePrice();
