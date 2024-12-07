// chart.js - Interactive Historical Chart with Filters (250 Lines)

// DOM Elements
const chartCanvas = document.getElementById("price-chart").getContext("2d");
const filterButtons = document.createElement("div");
filterButtons.id = "chart-filters";
filterButtons.innerHTML = `
    <button data-period="7">Last 7 Days</button>
    <button data-period="30" class="active">Last 30 Days</button>
    <button data-period="365">Last 1 Year</button>
    <button id="export-csv">Export Data</button>
`;
document.getElementById("chart").appendChild(filterButtons);

// Chart.js Plugins (Zoom and Pan)
Chart.register(Chart.Zoom);

// Configuration
let goldChart;
let currentPeriod = 30; // Default period: 30 days

// Fetch Historical Data
async function fetchHistoricalData(period) {
    logAlert(`Fetching historical data for the last ${period} days...`);
    try {
        const endDate = new Date().toISOString().split("T")[0];
        const startDate = new Date(Date.now() - period * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

        const response = await fetch(
            `https://www.example.com/historical-data?start_date=${startDate}&end_date=${endDate}`
        ); // Replace with the real URL
        if (!response.ok) throw new Error("Failed to fetch historical data.");

        const data = await response.json();
        const processedData = data.map((entry) => ({
            date: entry.date,
            price: parseFloat(entry.price),
        }));

        logAlert(`Fetched ${processedData.length} data points successfully.`, "success");
        return processedData;
    } catch (error) {
        logAlert(`Error fetching historical data: ${error.message}`, "error");
        return [];
    }
}

// Render Chart
async function renderChart(period) {
    const data = await fetchHistoricalData(period);
    if (!data.length) {
        logAlert("No data available for the selected period.", "warning");
        return;
    }

    const labels = data.map((entry) => entry.date);
    const prices = data.map((entry) => entry.price);

    // Destroy existing chart if present
    if (goldChart) goldChart.destroy();

    goldChart = new Chart(chartCanvas, {
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
            },
        },
    });

    logAlert("Chart rendered successfully.", "success");
}

// Handle Filter Buttons
document.getElementById("chart-filters").addEventListener("click", async (event) => {
    const button = event.target;
    const period = parseInt(button.getAttribute("data-period"), 10);

    if (period) {
        document.querySelectorAll("#chart-filters button").forEach((btn) => btn.classList.remove("active"));
        button.classList.add("active");

        currentPeriod = period;
        await renderChart(period);
    }
});

// Export Data as CSV
document.getElementById("export-csv").addEventListener("click", async () => {
    const data = await fetchHistoricalData(currentPeriod);
    if (!data.length) {
        logAlert("No data available to export.", "warning");
        return;
    }

    const csvContent = "Date,Price\n" + data.map((entry) => `${entry.date},${entry.price}`).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `gold_prices_${currentPeriod}_days.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    logAlert("Data exported successfully as CSV.", "success");
});

// Initialization
function initializeChart() {
    logAlert("Initializing chart...");
    renderChart(currentPeriod);
}

initializeChart();

