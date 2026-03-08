import crypto from "crypto";
import { ENV } from "./_core/env";

const NETWORK = process.env.ZELLO_NETWORK ?? "airpark";
const BASE_URL = `https://${NETWORK}.zellowork.com`;
const USERNAME = process.env.ZELLO_USERNAME ?? "";
const PASSWORD = process.env.ZELLO_PASSWORD ?? "";

// Session management — reuse sid across calls
let currentSid: string | null = null;
let sidExpiresAt = 0;

/** Get a fresh token + sid from Zello */
async function getToken(): Promise<{ token: string; sid: string }> {
  const res = await fetch(`${BASE_URL}/user/gettoken`);
  const data = await res.json();
  if (data.status !== "OK") throw new Error(`Zello gettoken failed: ${data.status}`);
  return { token: data.token, sid: data.sid };
}

/** Authenticate and get a valid session */
async function authenticate(): Promise<string> {
  // Reuse session if still valid (sessions last ~10 min, we refresh every 8)
  if (currentSid && Date.now() < sidExpiresAt) return currentSid;

  const apiKey = ENV.zelloApiKey;
  if (!apiKey) throw new Error("ZELLO_API_KEY not configured");
  if (!USERNAME) throw new Error("ZELLO_USERNAME not configured");
  if (!PASSWORD) throw new Error("ZELLO_PASSWORD not configured");

  const { token, sid } = await getToken();

  // Hash: md5(md5(password) + token + api_key)
  const md5pass = crypto.createHash("md5").update(PASSWORD).digest("hex");
  const combined = md5pass + token + apiKey;
  const authHash = crypto.createHash("md5").update(combined).digest("hex");

  const params = new URLSearchParams({ username: USERNAME, password: authHash });
  const res = await fetch(`${BASE_URL}/user/login?sid=${sid}`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params.toString(),
  });
  const data = await res.json();
  if (data.status !== "OK") throw new Error(`Zello login failed: ${data.status}`);

  currentSid = sid;
  sidExpiresAt = Date.now() + 8 * 60 * 1000; // 8 minutes
  return sid;
}

/** Helper to make authenticated GET requests */
async function zelloGet(path: string, params?: Record<string, string>): Promise<any> {
  const sid = await authenticate();
  const url = new URL(`${BASE_URL}/${path}`);
  url.searchParams.set("sid", sid);
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      url.searchParams.set(k, v);
    }
  }
  const res = await fetch(url.toString());
  const data = await res.json();

  // If session expired, retry once
  if (data.code === "301") {
    currentSid = null;
    sidExpiresAt = 0;
    const newSid = await authenticate();
    url.searchParams.set("sid", newSid);
    const retryRes = await fetch(url.toString());
    return retryRes.json();
  }

  return data;
}

// ============ PUBLIC API ============

export interface ZelloUser {
  name: string;
  email: string;
  phone: string;
  fullName: string;
  job: string;
  admin: boolean;
  channels: string[];
  geotrackingOff: boolean;
}

export interface ZelloLocation {
  username: string;
  displayName: string;
  latitude: number;
  longitude: number;
  speed: number; // km/h
  heading: number;
  altitude: number;
  batteryLevel: number;
  chargingStatus: number;
  signalStrength: number;
  accuracy: number;
  status: string;
  lastReport: number; // epoch seconds
  lastReportDelay: number;
}

export interface ZelloChannel {
  name: string;
  count: number;
  isShared: boolean;
  isDispatch: boolean;
}

function isZelloConfigured(): boolean {
  return !!(ENV.zelloApiKey && USERNAME && PASSWORD);
}

/** Get all users in the network */
export async function getZelloUsers(): Promise<ZelloUser[]> {
  if (!isZelloConfigured()) return [];
  const data = await zelloGet("user/get");
  if (data.status !== "OK") throw new Error(`Zello user/get failed: ${data.status}`);
  return (data.users || []).map((u: any) => ({
    name: u.name,
    email: u.email || "",
    phone: u.phone || u.profile_phone || "",
    fullName: u.full_name || u.name,
    job: u.job || "",
    admin: !!u.admin,
    channels: u.channels || [],
    geotrackingOff: !!u.geotracking_off,
  }));
}

/** Get all channels */
export async function getZelloChannels(): Promise<ZelloChannel[]> {
  if (!isZelloConfigured()) return [];
  const data = await zelloGet("channel/get");
  if (data.status !== "OK") throw new Error(`Zello channel/get failed: ${data.status}`);
  return (data.channels || []).map((c: any) => ({
    name: c.name,
    count: parseInt(c.count, 10) || 0,
    isShared: !!c.is_shared,
    isDispatch: !!c.is_dispatch,
  }));
}

/** Get current GPS locations of all active users */
export async function getZelloLocations(): Promise<ZelloLocation[]> {
  if (!isZelloConfigured()) return [];
  const data = await zelloGet("location/get", { filter: "none", max: "100" });
  if (data.status !== "OK") throw new Error(`Zello location/get failed: ${data.status}`);
  return (data.locations || []).map((l: any) => ({
    username: l.username || l.name || "",
    displayName: l.display_name || l.username || "",
    latitude: parseFloat(l.latitude) || 0,
    longitude: parseFloat(l.longitude) || 0,
    speed: (parseFloat(l.speed) || 0) * 3.6, // m/s to km/h
    heading: parseFloat(l.heading) || 0,
    altitude: parseFloat(l.altitude) || 0,
    batteryLevel: parseInt(l.battery_level, 10) || 0,
    chargingStatus: parseInt(l.charging_status, 10) || 0,
    signalStrength: parseInt(l.signal_strength, 10) || 0,
    accuracy: parseFloat(l.accuracy) || 0,
    status: l.status || "unknown",
    lastReport: parseInt(l.last_report, 10) || 0,
    lastReportDelay: parseInt(l.last_report_delay, 10) || 0,
  }));
}

/** Get location history for a specific user */
export async function getZelloUserHistory(
  username: string,
  startTs: number,
  endTs: number
): Promise<any> {
  if (!isZelloConfigured()) return { locations: [] };
  const data = await zelloGet(`location/getuser/${encodeURIComponent(username)}/history`, {
    start_ts: String(startTs),
    end_ts: String(endTs),
    format: "geojson",
    speedUnits: "kmh",
  });
  return data;
}

/** Get current location for a specific user */
export async function getZelloUserLocation(username: string): Promise<any> {
  if (!isZelloConfigured()) return { locations: [] };
  const data = await zelloGet(`location/getuser/${encodeURIComponent(username)}`);
  return data;
}
