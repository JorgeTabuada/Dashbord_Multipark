// Discover MultiPark API endpoints
const API_KEY = process.env.MULTIPARK_API_KEY;
const BASE = process.env.MULTIPARK_API_URL || "https://api.multipark.pt/api/v1/bookings-api";

const endpoints = [
  // Bookings
  { method: "GET", path: "/bookings" },
  { method: "GET", path: "/bookings/" },
  { method: "GET", path: "/" },
  { method: "GET", path: "" },
  // Without bookings-api prefix
  { method: "GET", path: "/booking" },
  // Availability
  { method: "GET", path: "/availability" },
  { method: "GET", path: "/availability?checkIn=2026-03-10T10:00:00Z&checkOut=2026-03-15T10:00:00Z" },
  // Vehicles
  { method: "GET", path: "/vehicles" },
  { method: "GET", path: "/vehicle" },
  // Clients
  { method: "GET", path: "/clients" },
  { method: "GET", path: "/client" },
  // Movements
  { method: "GET", path: "/movements" },
  { method: "GET", path: "/parking" },
  // Stats / dashboard
  { method: "GET", path: "/stats" },
  { method: "GET", path: "/dashboard" },
  // Services
  { method: "GET", path: "/services" },
  { method: "GET", path: "/extra-services" },
  // Pricing
  { method: "GET", path: "/pricing" },
  { method: "GET", path: "/prices" },
  // Try base URL variations
  { method: "GET", path: "/health" },
  { method: "GET", path: "/status" },
  { method: "GET", path: "/api-docs" },
  { method: "GET", path: "/docs" },
  { method: "GET", path: "/swagger" },
  { method: "GET", path: "/openapi.json" },
];

// Also try without the bookings-api prefix
const ALT_BASE = "https://api.multipark.pt/api/v1";
const altEndpoints = [
  { method: "GET", path: "/bookings" },
  { method: "GET", path: "/bookings-api" },
  { method: "GET", path: "/vehicles" },
  { method: "GET", path: "/clients" },
  { method: "GET", path: "/docs" },
  { method: "GET", path: "/swagger" },
  { method: "GET", path: "/openapi.json" },
];

async function probe(base, method, path) {
  try {
    const url = `${base}${path}`;
    const res = await fetch(url, {
      method,
      headers: {
        "X-Api-Key": API_KEY,
        "Content-Type": "application/json",
      },
    });
    let body = "";
    try {
      const text = await res.text();
      body = text.slice(0, 300);
    } catch {}
    return { url, status: res.status, body };
  } catch (err) {
    return { url: `${base}${path}`, status: "ERR", body: err.message };
  }
}

async function main() {
  console.log("=== Probing MultiPark API endpoints ===\n");
  console.log(`Base URL: ${BASE}`);
  console.log(`API Key: ${API_KEY?.slice(0, 15)}...`);
  console.log("");

  console.log("--- Main base URL ---");
  for (const ep of endpoints) {
    const r = await probe(BASE, ep.method, ep.path);
    const icon = r.status === 200 ? "✅" : r.status === 404 ? "❌" : "⚠️";
    console.log(`${icon} ${ep.method} ${r.url} → ${r.status}`);
    if (r.status !== 404 && r.status !== "ERR") {
      console.log(`   Body: ${r.body}`);
    }
  }

  console.log("\n--- Alt base URL (without bookings-api) ---");
  for (const ep of altEndpoints) {
    const r = await probe(ALT_BASE, ep.method, ep.path);
    const icon = r.status === 200 ? "✅" : r.status === 404 ? "❌" : "⚠️";
    console.log(`${icon} ${ep.method} ${r.url} → ${r.status}`);
    if (r.status !== 404 && r.status !== "ERR") {
      console.log(`   Body: ${r.body}`);
    }
  }

  // Try the root domain too
  console.log("\n--- Root domain ---");
  const rootEndpoints = [
    { method: "GET", path: "/api" },
    { method: "GET", path: "/api/v1" },
    { method: "GET", path: "/api/docs" },
  ];
  for (const ep of rootEndpoints) {
    const r = await probe("https://api.multipark.pt", ep.method, ep.path);
    const icon = r.status === 200 ? "✅" : r.status === 404 ? "❌" : "⚠️";
    console.log(`${icon} ${ep.method} ${r.url} → ${r.status}`);
    if (r.status !== 404 && r.status !== "ERR") {
      console.log(`   Body: ${r.body}`);
    }
  }
}

main().catch(console.error);
