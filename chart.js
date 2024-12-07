// chart.js - Combined Historical Chart and Technical Indicators

// DOM Elements
const ctx = document.getElementById("price-chart").getContext("2d");
const chartControls = document.getElementById("chart-controls");
const exportCsvButton = document.getElementById("export-csv");

// Default Configuration
let goldChart;
let currentPeriod = 30; // Default to 30 days of historical data

// Fetch Historical Data with Indicators
async function fetchHistoricalDataWithIndicators(period) {
    try {
        const response = await fetch(`/api/historical-data?period=${period}`);
        if (!response.ok) throw new Error("Failed to fetch historical data.");

        const data = await response.json();
        const prices = data.map((entry) => entry.price);
        const dates = data.map((entry) => entry.date);

        // Calculate Indicators
        const indicators = {
            rsi: calculateRSI(prices),
            sma: calculateSMA(prices),
            bollinger: calculateBollingerBands(prices),
        };

        return { dates, prices, indicators };
    } catch (error) {
        console.error("Error fetching historical data with indicators:", error);
        return null;
    }
}

// Render Combined Chart
async function renderCombinedChart(period) {
    const data = await fetchHistoricalDataWithIndicators(period);
    if (!data) {
        console.error("Failed to fetch data for the chart.");
        return;
    }

    const { dates, prices, indicators } = data;

    // Destroy existing chart
    if (goldChart) goldChart.destroy();

    // Create new chart with data and indicators
    goldChart = new Chart(ctx, {
        type: "line",
        data: {
            labels: dates,
            datasets: [
                {
                    label: "Gold Price (USD)",
                    data: prices,
                    borderColor: "gold",
                    backgroundColor: "rgba(255, 215, 0, 0.2)",
                    borderWidth: 2,
                },
                {
                    label: `RSI`,
                    data: indicators.rsi,
                    borderColor: "blue",
                    borderWidth: 1.5,
                    hidden: !indicatorsConfig.rsi.enabled,
                },
                {
                    label: `SMA`,
                    data: indicators.sma,
                    borderColor: "green",
                    borderWidth: 2,
                    hidden: !indicatorsConfig.sma.enabled,
                },
                {
                    label: "Bollinger Upper",
                    data: indicators.bollinger.map((band) => band.upper),
                    borderColor: "red",
                    borderWidth: 1.5,
                },
                {
                    label: "Bollinger Lower",
                    data: indicators.bollinger.map((band) => band.lower),
                    borderColor: "blue",
                    borderWidth: 1.5,
                },
            ],
        },
        options: {
            responsive: true,
            scales: {
                x: { title: { display: true, text: "Date" } },
                y: { title: { display: true, text: "Price (USD)" } },
            },
        },
    });
}

// Initialize Chart
function initializeChart() {
    renderCombinedChart(currentPeriod);
}

initializeChart();
