// indicators.js - Technical Indicators with Advanced Features

// DOM Elements
const indicatorSettingsForm = document.getElementById("indicator-settings");
const rsiToggle = document.getElementById("rsi-toggle");
const macdToggle = document.getElementById("macd-toggle");
const smaToggle = document.getElementById("sma-toggle");
const bollingerToggle = document.getElementById("bollinger-toggle");
const rsiPeriodInput = document.getElementById("rsi-period");
const smaPeriodInput = document.getElementById("sma-period");
const bollingerPeriodInput = document.getElementById("bollinger-period");

// Default Indicator Configurations
const indicatorsConfig = {
    rsi: { enabled: true, period: 14, data: [] },
    macd: { enabled: true, fastPeriod: 12, slowPeriod: 26, signalPeriod: 9, data: [] },
    sma: { enabled: true, period: 30, data: [] },
    bollinger: { enabled: true, period: 20, data: [] },
};

// Calculate RSI
function calculateRSI(prices) {
    return technicalindicators.RSI.calculate({
        values: prices,
        period: indicatorsConfig.rsi.period,
    });
}

// Calculate MACD
function calculateMACD(prices) {
    return technicalindicators.MACD.calculate({
        values: prices,
        fastPeriod: indicatorsConfig.macd.fastPeriod,
        slowPeriod: indicatorsConfig.macd.slowPeriod,
        signalPeriod: indicatorsConfig.macd.signalPeriod,
    });
}

// Calculate SMA
function calculateSMA(prices) {
    return technicalindicators.SMA.calculate({
        values: prices,
        period: indicatorsConfig.sma.period,
    });
}

// Calculate Bollinger Bands
function calculateBollingerBands(prices) {
    return technicalindicators.BollingerBands.calculate({
        values: prices,
        period: indicatorsConfig.bollinger.period,
        stdDev: 2,
    });
}

// Fetch Historical Data and Calculate Indicators
async function fetchDataAndCalculateIndicators(period) {
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

    if (indicatorsConfig.bollinger.enabled) {
        indicatorsConfig.bollinger.data = calculateBollingerBands(prices);
    }

    return { historicalData, prices };
}

// Render Chart with Indicators
async function renderChartWithIndicators(period) {
    const { historicalData, prices } = await fetchDataAndCalculateIndicators(period);
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

    // Add MACD Histogram
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

    // Add Bollinger Bands
    if (indicatorsConfig.bollinger.enabled) {
        const bollingerData = indicatorsConfig.bollinger.data;
        datasets.push({
            label: "Bollinger Upper Band",
            data: bollingerData.map((d) => d.upper),
            borderColor: "rgba(255, 99, 132, 0.5)",
            borderWidth: 1.5,
            tension: 0.4,
        });
        datasets.push({
            label: "Bollinger Lower Band",
            data: bollingerData.map((d) => d.lower),
            borderColor: "rgba(75, 192, 192, 0.5)",
            borderWidth: 1.5,
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

    logMessage("Chart with indicators rendered successfully.", "success");
}

// Update Indicator Settings
indicatorSettingsForm.addEventListener("input", async (event) => {
    const target = event.target;

    if (target.id === "rsi-period") indicatorsConfig.rsi.period = parseInt(target.value, 10);
    if (target.id === "sma-period") indicatorsConfig.sma.period = parseInt(target.value, 10);
    if (target.id === "bollinger-period") indicatorsConfig.bollinger.period = parseInt(target.value, 10);

    await renderChartWithIndicators(currentPeriod);
});

// Toggle Indicator Visibility
indicatorSettingsForm.addEventListener("change", async (event) => {
    const target = event.target;

    if (target.id === "rsi-toggle") indicatorsConfig.rsi.enabled = target.checked;
    if (target.id === "macd-toggle") indicatorsConfig.macd.enabled = target.checked;
    if (target.id === "sma-toggle") indicatorsConfig.sma.enabled = target.checked;
    if (target.id === "bollinger-toggle") indicatorsConfig.bollinger.enabled = target.checked;

    await renderChartWithIndicators(currentPeriod);
});

// Initialize Chart with Indicators
function initializeIndicators() {
    logMessage("Initializing indicators...", "info");
    renderChartWithIndicators(currentPeriod);
}

initializeIndicators();
