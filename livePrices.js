// livePrice.js - Fetch Live Gold Price with Advanced Features

// DOM Elements
const goldPriceElement = document.getElementById("gold-price");
const lastUpdatedElement = document.getElementById("last-updated");

// API Configuration
const SCRAPE_URL = "https://example-trading-website.com"; // Replace with the actual website URL
const CURRENCY_API_URL = "https://api.exchangerate-api.com/v4/latest/USD"; // Free currency conversion API
const DEFAULT_CURRENCY = "USD";

// Fetch Gold Price from Target Website (Web Scraping)
async function scrapeGoldPrice() {
    try {
        const response = await fetch(SCRAPE_URL);
        if (!response.ok) throw new Error("Failed to fetch gold price from the target website.");

        const html = await response.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, "text/html");

        // Scrape the gold price using a specific CSS selector
        const goldPrice = parseFloat(doc.querySelector(".gold-price-selector").textContent.trim());
        if (isNaN(goldPrice)) throw new Error("Gold price data is invalid or unavailable.");

        logMessage(`Gold price fetched successfully: ${goldPrice} USD/oz`, "success");
        return goldPrice;
    } catch (error) {
        logMessage(`Error scraping gold price: ${error.message}`, "error");
        return null;
    }
}

// Fetch Exchange Rate for Currency Conversion
async function fetchExchangeRate(base = "USD", target = DEFAULT_CURRENCY) {
    try {
        const response = await fetch(CURRENCY_API_URL);
        if (!response.ok) throw new Error("Failed to fetch exchange rate data.");

        const data = await response.json();
        const rate = data.rates[target];
        if (!rate) throw new Error(`Exchange rate for ${target} is unavailable.`);

        logMessage(`Exchange rate fetched: 1 ${base} = ${rate.toFixed(2)} ${target}`, "success");
        return rate;
    } catch (error) {
        logMessage(`Error fetching exchange rate: ${error.message}`, "error");
        return null;
    }
}

// Convert Gold Price to User-Selected Currency
async function convertGoldPrice(priceInUSD) {
    const rate = await fetchExchangeRate("USD", userPreferences.currency);
    if (!rate) return null;

    const convertedPrice = priceInUSD * rate;
    logMessage(
        `Gold price converted: ${priceInUSD} USD = ${convertedPrice.toFixed(2)} ${userPreferences.currency}`,
        "success"
    );
    return convertedPrice;
}

// Update Gold Price on the Page
async function updateGoldPrice() {
    try {
        const goldPriceInUSD = await scrapeGoldPrice();
        if (!goldPriceInUSD) {
            goldPriceElement.textContent = "N/A";
            lastUpdatedElement.textContent = "Failed to update.";
            return;
        }

        let displayPrice = `${goldPriceInUSD.toFixed(2)} USD/oz`;

        // Convert price if user-selected currency is not USD
        if (userPreferences.currency !== "USD") {
            const convertedPrice = await convertGoldPrice(goldPriceInUSD);
            if (convertedPrice) {
                displayPrice = `${convertedPrice.toFixed(2)} ${userPreferences.currency}/oz`;
            } else {
                logMessage("Failed to convert gold price. Showing USD price.", "warning");
            }
        }

        // Update DOM Elements
        goldPriceElement.textContent = displayPrice;
        lastUpdatedElement.textContent = `Last updated: ${new Date().toLocaleTimeString()}`;

        logMessage("Gold price updated successfully.", "success");
    } catch (error) {
        logMessage(`Error updating gold price: ${error.message}`, "error");
    }
}

// Auto-Refresh Mechanism
let autoRefreshInterval;
function startAutoRefresh() {
    clearInterval(autoRefreshInterval);

    logMessage(`Auto-refresh set to ${userPreferences.refreshRate} minutes.`, "info");
    autoRefreshInterval = setInterval(updateGoldPrice, userPreferences.refreshRate * 60000);

    // Fetch immediately
    updateGoldPrice();
}

// Log System Integration
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

// Create Log Container if Missing
function createLogContainer() {
    const container = document.createElement("div");
    container.id = "alerts-container";
    document.body.appendChild(container);
    return container;
}

// Initialization
function initializeLivePrice() {
    logMessage("Initializing live gold price updates...", "info");
    updateGoldPrice();
    startAutoRefresh();
}

// Start Script
initializeLivePrice();
