async function fetchLiveGoldPrice() {
    try {
        const response = await fetch("/api/live-price");
        if (!response.ok) throw new Error("Failed to fetch live gold price.");

        const data = await response.json();
        document.getElementById("gold-price").textContent = `${data.price} ${data.currency}`;
    } catch (error) {
        console.error("Error fetching live gold price:", error);
    }
}

fetchLiveGoldPrice();
