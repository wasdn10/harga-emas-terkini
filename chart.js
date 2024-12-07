// chart.js - Interactive Historical Chart with Advanced Features

// DOM Elements
const ctx = document.getElementById("price-chart").getContext("2d");
const chartControls = document.getElementById("chart-controls");
const exportCsvButton = document.getElementById("export-csv");

// Default Configuration
let goldChart;
let currentPeriod = 30; // Default to 30 days of historical data

// Fetch Historical Data
async function fetchHistoricalData(period) {
    logMessage(`Fetching historical data for the last ${period} days...`, "info");

    try {
        const endDate = new Date().toISOString().split("T")[0];
        const startDate = new Date(Date.now() - period * 24 * 60 * 60 * 1000)
            .toISOString()
            .split("T")[0];

        const response = await fetch(`/api/historical-data?start=${startDate}&end=${endDate}`);
        if (!response.ok) throw new Error("Failed to fetch historical data.");

        const data = await response.json();
        logMessage(`Fetched ${data.length} data points successfully.`, "success");

        return data.map(entry => ({
            date: entry.date,
            price: entry.price,
        }));
    } catch (error) {
        logMessage(`Error fetching historical data: ${error.message}`, "error");
        return [];
    }
}

// Render Chart
async function renderChart(period) {
    const data = await fetchHistoricalData(period);

    if (!data.length) {
        logMessage("No historical data available for the selected period.", "warning");
        return;
    }

    const labels = data.map(entry => entry.date);
    const prices = data.map(entry => entry.price);

    // Destroy existing chart if present
    if (goldChart) goldChart.destroy();

    // Create new chart
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
                        label: context => `Price: ${context.raw.toFixed(2)} ${userPreferences.currency}`,
                    },
                },
            },
        },
    });

    logMessage("Chart rendered successfully.", "success");
}

// Export Data as CSV
exportCsvButton.addEventListener("click", async () => {
    const data = await fetchHistoricalData(currentPeriod);

    if (!data.length) {
        logMessage("No data available to export.", "warning");
        return;
    }

    const csvContent = "Date,Price\n" + data.map(d => `${d.date},${d.price}`).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `gold_prices_${currentPeriod}_days.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    logMessage("Historical data exported as CSV successfully.", "success");
});

// Handle Filter Buttons
chartControls.addEventListener("click", async event => {
    const button = event.target;
    const period = parseInt(button.getAttribute("data-period"), 10);

    if (period) {
        document.querySelectorAll("#chart-controls button").forEach(btn => btn.classList.remove("active"));
        button.classList.add("active");

        currentPeriod = period;
        await renderChart(period);
    }
});

// Log Messages
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
function initializeChart() {
    logMessage("Initializing historical chart...", "info");
    renderChart(currentPeriod);
}

initializeChart();
