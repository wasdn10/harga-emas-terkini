// scraper.js - Backend Scraper for Gold Price Data

const express = require("express");
const puppeteer = require("puppeteer");
const cors = require("cors");

const app = express();
app.use(cors()); // Enable Cross-Origin Requests
app.use(express.json()); // Parse JSON Bodies

const PORT = 3000;

// Scraper Configuration
const SCRAPE_URL = "https://example-trading-website.com"; // Replace with target URL
const GOLD_PRICE_SELECTOR = ".gold-price-selector"; // Replace with the appropriate CSS selector

// Scraper Function for Live Gold Prices
async function scrapeGoldPrice() {
    let browser;
    try {
        browser = await puppeteer.launch({ headless: true });
        const page = await browser.newPage();
        await page.goto(SCRAPE_URL, { waitUntil: "networkidle2" });

        // Scrape Gold Price
        const goldPrice = await page.$eval(GOLD_PRICE_SELECTOR, (el) => el.textContent.trim());
        const priceInUSD = parseFloat(goldPrice.replace(/[^0-9.]/g, ""));

        if (isNaN(priceInUSD)) throw new Error("Invalid gold price format.");

        console.log(`Scraped Gold Price: ${priceInUSD} USD/oz`);
        return { price: priceInUSD, currency: "USD", source: SCRAPE_URL };
    } catch (error) {
        console.error("Error scraping gold price:", error.message);
        return { error: "Failed to fetch gold price" };
    } finally {
        if (browser) await browser.close();
    }
}

// Scraper Function for Historical Data
async function scrapeHistoricalData() {
    // Placeholder: Customize this function to scrape historical data if needed
    const sampleData = [
        { date: "2024-12-01", price: 1820 },
        { date: "2024-12-02", price: 1825 },
        { date: "2024-12-03", price: 1830 },
    ];
    console.log("Scraped Historical Data:", sampleData);
    return sampleData;
}

// API Endpoint for Live Gold Price
app.get("/api/live-price", async (req, res) => {
    const data = await scrapeGoldPrice();
    if (data.error) {
        res.status(500).json(data);
    } else {
        res.json(data);
    }
});

// API Endpoint for Historical Data
app.get("/api/historical-data", async (req, res) => {
    const data = await scrapeHistoricalData();
    res.json(data);
});

// API Endpoint for Health Check
app.get("/api/health", (req, res) => {
    res.json({ status: "Server is running", time: new Date().toISOString() });
});

// Error Handling Middleware
app.use((err, req, res, next) => {
    console.error("Error:", err.message);
    res.status(500).json({ error: "Internal Server Error" });
});

// Start Server
app.listen(PORT, () => {
    console.log(`Scraper API running on http://localhost:${PORT}`);
});
