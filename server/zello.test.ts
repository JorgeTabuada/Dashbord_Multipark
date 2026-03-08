import { describe, it, expect } from "vitest";
import crypto from "crypto";

const NETWORK = "airpark";
const BASE_URL = `https://${NETWORK}.zellowork.com`;

describe("zello API", () => {
  it("ZELLO_API_KEY env is set", () => {
    const key = process.env.ZELLO_API_KEY;
    expect(key).toBeTruthy();
    expect(key!.length).toBeGreaterThan(10);
  });

  it("can get token from Zello API", async () => {
    const res = await fetch(`${BASE_URL}/user/gettoken`);
    const data = await res.json();
    expect(data.status).toBe("OK");
    expect(data.token).toBeTruthy();
    expect(data.sid).toBeTruthy();
  });

  it("can authenticate with Zello API", async () => {
    const apiKey = process.env.ZELLO_API_KEY!;
    const username = "admin";
    const password = "tutensdelembrardaspasses";

    // Step 1: Get token
    const tokenRes = await fetch(`${BASE_URL}/user/gettoken`);
    const tokenData = await tokenRes.json();
    expect(tokenData.status).toBe("OK");

    const { sid, token } = tokenData;

    // Step 2: Login with md5(md5(password) + token + api_key)
    const md5pass = crypto.createHash("md5").update(password).digest("hex");
    const combined = md5pass + token + apiKey;
    const authHash = crypto.createHash("md5").update(combined).digest("hex");

    const params = new URLSearchParams({ username, password: authHash });
    const loginRes = await fetch(`${BASE_URL}/user/login?sid=${sid}`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString(),
    });
    const loginData = await loginRes.json();
    expect(loginData.status).toBe("OK");
    expect(loginData.code).toBe("200");
  });
});
