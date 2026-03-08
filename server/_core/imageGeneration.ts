/**
 * Image generation helper using OpenAI-compatible API (DALL-E)
 */
import { storagePut } from "../storage";

export type GenerateImageOptions = {
  prompt: string;
  originalImages?: Array<{
    url?: string;
    b64Json?: string;
    mimeType?: string;
  }>;
};

export type GenerateImageResponse = {
  url?: string;
};

export async function generateImage(
  options: GenerateImageOptions
): Promise<GenerateImageResponse> {
  const apiUrl = process.env.LLM_API_URL || process.env.OPENAI_API_URL;
  const apiKey = process.env.LLM_API_KEY || process.env.OPENAI_API_KEY;

  if (!apiUrl) throw new Error("LLM_API_URL or OPENAI_API_URL is not configured");
  if (!apiKey) throw new Error("LLM_API_KEY or OPENAI_API_KEY is not configured");

  const baseUrl = apiUrl.endsWith("/") ? apiUrl : `${apiUrl}/`;
  const fullUrl = new URL("v1/images/generations", baseUrl).toString();

  const response = await fetch(fullUrl, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "dall-e-3",
      prompt: options.prompt,
      n: 1,
      size: "1024x1024",
      response_format: "b64_json",
    }),
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(
      `Image generation failed (${response.status} ${response.statusText})${detail ? `: ${detail}` : ""}`
    );
  }

  const result = (await response.json()) as {
    data: Array<{ b64_json: string }>;
  };

  const base64Data = result.data[0].b64_json;
  const buffer = Buffer.from(base64Data, "base64");

  const { url } = await storagePut(
    `generated/${Date.now()}.png`,
    buffer,
    "image/png"
  );

  return { url };
}
