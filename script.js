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

// Advanced Chart with Chart.js

// DOM Elements
const ctx = document.getElementById("price-chart").getContext("2d");
const filterButtons = document.createElement("div");
filterButtons.id = "chart-filters";
filterButtons.innerHTML = `
    <button data-period="7">Last 7 Days</button>
    <button data-period="30" class="active">Last 30 Days</button>
    <button data-period="365">Last 1 Year</button>
    <button id="export-csv">Export Data</button>
`;
document.getElementById("chart").appendChild(filterButtons);

// Chart.js Plugins (Zoom and Export)
Chart.register(Chart.Zoom, Chart.DataLabels);

// API Config
const HISTORICAL_API_URL = "https://metals-api.com/api/timeseries";
const API_KEY = "your_api_key"; // Replace with your API key
let goldChart;
let currentPeriod = 30; // Default chart period (30 days)

// Fetch Historical Data
async function fetchHistoricalData(period) {
    const endDate = new Date().toISOString().split("T")[0]; // Today's date
    const startDate = new Date(Date.now() - period * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0]; // Period days ago

    try {
        const response = await fetch(
            `${HISTORICAL_API_URL}?access_key=${API_KEY}&base=${userPreferences.currency}&symbols=XAU&start_date=${startDate}&end_date=${endDate}`
        );

        if (!response.ok) throw new Error("Failed to fetch historical data");

        const data = await response.json();
        const prices = Object.entries(data.rates).map(([date, rates]) => ({
            date,
            price: rates["XAU"],
        }));
        return prices;
    } catch (error) {
        showError("Unable to fetch historical data. Please try again later.");
        return [];
    }
}

// Render Chart
function renderChart(data) {
    const labels = data.map((entry) => entry.date);
    const prices = data.map((entry) => entry.price);

    if (goldChart) goldChart.destroy(); // Destroy previous chart if it exists

    goldChart = new Chart(ctx, {
        type: "line",
        data: {
            labels: labels,
            datasets: [
                {
                    label: `Gold Price (${userPreferences.currency}/oz)`,
                    data: prices,
                    borderColor: "gold",
                    backgroundColor: "rgba(255, 215, 0, 0.2)",
                    borderWidth: 2,
                    tension: 0.4,
                },
            ],
        },
        options: {
            responsive: true,
            scales: {
                x: {
                    title: { display: true, text: "Date" },
                },
                y: {
                    title: { display: true, text: `Price (${userPreferences.currency})` },
                },
            },
            plugins: {
                zoom: {
                    zoom: {
                        wheel: { enabled: true },
                        pinch: { enabled: true },
                        mode: "x",
                    },
                    pan: {
                        enabled: true,
                        mode: "x",
                    },
                },
                tooltip: {
                    callbacks: {
                        label: (context) => `Price: ${context.raw.toFixed(2)} ${userPreferences.currency}`,
                    },
                },
            },
        },
    });
}

// Fetch and Render Chart for Default Period
async function updateChart(period) {
    currentPeriod = period;
    const data = await fetchHistoricalData(period);
    renderChart(data);
}

// Add Event Listeners for Filter Buttons
document.getElementById("chart-filters").addEventListener("click", async (event) => {
    const button = event.target;
    const period = parseInt(button.getAttribute("data-period"), 10);
    if (period) {
        document.querySelectorAll("#chart-filters button").forEach((btn) => btn.classList.remove("active"));
        button.classList.add("active");
        await updateChart(period);
    }
});

// Export Data as CSV
document.getElementById("export-csv").addEventListener("click", async () => {
    const data = await fetchHistoricalData(currentPeriod);
    const csvContent = "Date,Price\n" + data.map((d) => `${d.date},${d.price}`).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `gold_prices_${currentPeriod}_days.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
});

// Initialize Chart
updateChart(currentPeriod);


// Enhanced Technical Indicators Integration

// DOM Elements
const indicatorControls = document.createElement("div");
indicatorControls.id = "indicator-controls";
indicatorControls.innerHTML = `
    <h3>Technical Indicators</h3>
    <label>
        <input type="checkbox" id="rsi-toggle" checked> Show RSI
    </label>
    <label>
        <input type="checkbox" id="macd-toggle" checked> Show MACD
    </label>
    <label>
        <input type="checkbox" id="sma-toggle" checked> Show Moving Average
    </label>
    <div id="indicator-settings">
        <label for="rsi-period">RSI Period:</label>
        <input type="number" id="rsi-period" value="14" min="1" max="50">
        <label for="sma-period">SMA Period:</label>
        <input type="number" id="sma-period" value="30" min="1" max="365">
    </div>
`;
document.getElementById("technical-analysis").appendChild(indicatorControls);

// Default Indicator Settings
const indicatorsConfig = {
    rsi: { enabled: true, period: 14, data: [] },
    macd: { enabled: true, fastPeriod: 12, slowPeriod: 26, signalPeriod: 9, data: [] },
    sma: { enabled: true, period: 30, data: [] },
};

// Fetch Historical Data and Calculate Indicators
async function fetchDataAndCalculateIndicators(period) {
    const historicalData = await fetchHistoricalData(period);
    const prices = historicalData.map((entry) => entry.price);

    // RSI
    if (indicatorsConfig.rsi.enabled) {
        indicatorsConfig.rsi.data = technicalindicators.RSI.calculate({
            values: prices,
            period: indicatorsConfig.rsi.period,
        });
    }

    // MACD
    if (indicatorsConfig.macd.enabled) {
        indicatorsConfig.macd.data = technicalindicators.MACD.calculate({
            values: prices,
            fastPeriod: indicatorsConfig.macd.fastPeriod,
            slowPeriod: indicatorsConfig.macd.slowPeriod,
            signalPeriod: indicatorsConfig.macd.signalPeriod,
        });
    }

    // SMA
    if (indicatorsConfig.sma.enabled) {
        indicatorsConfig.sma.data = technicalindicators.SMA.calculate({
            values: prices,
            period: indicatorsConfig.sma.period,
        });
    }

    return historicalData;
}

// Render Chart with Indicators
async function renderChartWithIndicators(period) {
    const data = await fetchDataAndCalculateIndicators(period);
    const labels = data.map((entry) => entry.date);
    const prices = data.map((entry) => entry.price);

    const datasets = [
        {
            label: `Gold Price (${userPreferences.currency}/oz)`,
            data: prices,
            borderColor: "gold",
            backgroundColor: "rgba(255, 215, 0, 0.2)",
            borderWidth: 2,
            tension: 0.4,
        },
    ];

    // Add RSI
    if (indicatorsConfig.rsi.enabled) {
        datasets.push({
            label: `RSI (Period: ${indicatorsConfig.rsi.period})`,
            data: indicatorsConfig.rsi.data,
            borderColor: "blue",
            borderWidth: 1.5,
            tension: 0.4,
            yAxisID: "rsi",
        });
    }

    // Add MACD (Histogram)
    if (indicatorsConfig.macd.enabled) {
        datasets.push({
            label: "MACD Histogram",
            data: indicatorsConfig.macd.data.map((d) => d.MACD - d.signal),
            borderColor: "purple",
            backgroundColor: "rgba(128, 0, 128, 0.2)",
            borderWidth: 1.5,
            type: "bar",
            yAxisID: "macd",
        });
    }

    // Add SMA
    if (indicatorsConfig.sma.enabled) {
        datasets.push({
            label: `SMA (Period: ${indicatorsConfig.sma.period})`,
            data: indicatorsConfig.sma.data,
            borderColor: "green",
            borderWidth: 2,
            tension: 0.4,
        });
    }

    // Destroy previous chart
    if (goldChart) goldChart.destroy();

    // Create new chart
    goldChart = new Chart(ctx, {
        type: "line",
        data: { labels, datasets },
        options: {
            responsive: true,
            scales: {
                x: { title: { display: true, text: "Date" } },
                y: { title: { display: true, text: `Price (${userPreferences.currency})` } },
                rsi: { position: "right", title: { display: true, text: "RSI" }, grid: { drawOnChartArea: false } },
                macd: { position: "left", title: { display: true, text: "MACD Histogram" }, grid: { drawOnChartArea: false } },
            },
        },
    });
}

// Event Listeners for Indicator Toggles
document.getElementById("indicator-controls").addEventListener("change", async (event) => {
    const target = event.target;

    if (target.id === "rsi-toggle") indicatorsConfig.rsi.enabled = target.checked;
    if (target.id === "macd-toggle") indicatorsConfig.macd.enabled = target.checked;
    if (target.id === "sma-toggle") indicatorsConfig.sma.enabled = target.checked;

    await renderChartWithIndicators(currentPeriod);
});

// Update Indicator Settings
document.getElementById("indicator-settings").addEventListener("input", async (event) => {
    const target = event.target;

    if (target.id === "rsi-period") indicatorsConfig.rsi.period = parseInt(target.value, 10);
    if (target.id === "sma-period") indicatorsConfig.sma.period = parseInt(target.value, 10);

    await renderChartWithIndicators(currentPeriod);
});

// Initialize Chart with Default Period
renderChartWithIndicators(currentPeriod);
