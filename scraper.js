// scraper.js - Enhanced Scraper with Live Prices and Historical Data

const express = require("express");
const puppeteer = require("puppeteer");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 3000;
const SCRAPE_URL = "https://example-trading-website.com";

// Scrape Live Gold Price
async function scrapeGoldPrice() {
    const browser = await puppeteer.launch({ headless: true });
    try {
        const page = await browser.newPage();
        await page.goto(SCRAPE_URL, { waitUntil: "networkidle2" });

        const priceText = await page.$eval(".gold-price-selector", (el) => el.textContent.trim());
        const price = parseFloat(priceText.replace(/[^0-9.]/g, ""));
        if (isNaN(price)) throw new Error("Invalid gold price.");

        return { price, currency: "USD" };
    } catch (error) {
        console.error("Error scraping gold price:", error.message);
        return { error: "Failed to fetch gold price." };
    } finally {
        await browser.close();
    }
}

// API Endpoint for Live Gold Price
app.get("/api/live-price", async (req, res) => {
    const data = await scrapeGoldPrice();
    if (data.error) res.status(500).json(data);
    else res.json(data);
});

// Start Server
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
