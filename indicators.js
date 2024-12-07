// indicators.js - Technical Indicators with Chart Overlays (250 Lines)

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
        <input type="checkbox" id="sma-toggle" checked> Show SMA
    </label>
    <div id="indicator-settings">
        <label for="rsi-period">RSI Period:</label>
        <input type="number" id="rsi-period" value="14" min="1" max="50">
        <label for="sma-period">SMA Period:</label>
        <input type="number" id="sma-period" value="30" min="1" max="365">
    </div>
`;
document.getElementById("technical-analysis").appendChild(indicatorControls);

// Default Indicator Configurations
const indicatorsConfig = {
    rsi: { enabled: true, period: 14, data: [] },
    macd: { enabled: true, fastPeriod: 12, slowPeriod: 26, signalPeriod: 9, data: [] },
    sma: { enabled: true, period: 30, data: [] },
};

// Calculate RSI (Relative Strength Index)
function calculateRSI(prices) {
    return technicalindicators.RSI.calculate({
        values: prices,
        period: indicatorsConfig.rsi.period,
    });
}

// Calculate MACD (Moving Average Convergence Divergence)
function calculateMACD(prices) {
    return technicalindicators.MACD.calculate({
        values: prices,
        fastPeriod: indicatorsConfig.macd.fastPeriod,
        slowPeriod: indicatorsConfig.macd.slowPeriod,
        signalPeriod: indicatorsConfig.macd.signalPeriod,
    });
}

// Calculate SMA (Simple Moving Average)
function calculateSMA(prices) {
    return technicalindicators.SMA.calculate({
        values: prices,
        period: indicatorsConfig.sma.period,
    });
}

// Fetch Historical Data with Indicators
async function fetchDataWithIndicators(period) {
    const historicalData = await fetchHistoricalData(period);
    const prices = historicalData.map((entry) => entry.price);

    if (indicatorsConfig.rsi.enabled) {
        indicatorsConfig.rsi.data = calculateRSI(prices);
    }

    if (indicatorsConfig.macd.enabled) {
        indicatorsConfig.macd.data = calculateMACD(prices);
    }

    if (indicatorsConfig.sma.enabled) {
        indicatorsConfig.sma.data = calculateSMA(prices);
    }

    return { historicalData, prices };
}

// Render Chart with Indicators
async function renderChartWithIndicators(period) {
    const { historicalData, prices } = await fetchDataWithIndicators(period);
    const labels = historicalData.map((entry) => entry.date);

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

    if (indicatorsConfig.sma.enabled) {
        datasets.push({
            label: `SMA (Period: ${indicatorsConfig.sma.period})`,
            data: indicatorsConfig.sma.data,
            borderColor: "green",
            borderWidth: 2,
            tension: 0.4,
        });
    }

    // Destroy existing chart if present
    if (goldChart) goldChart.destroy();

    // Create new chart
    goldChart = new Chart(chartCanvas, {
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

    logAlert("Chart with indicators rendered successfully.", "success");
}

// Toggle Indicator Visibility
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

// Initialization
function initializeIndicators() {
    logAlert("Initializing indicators...");
    renderChartWithIndicators(currentPeriod);
}

initializeIndicators();
