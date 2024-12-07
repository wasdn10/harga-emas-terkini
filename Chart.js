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
