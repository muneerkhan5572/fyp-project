import "server-only";
import { env } from "@/env";

export type SentimentResult = {
  label: "positive" | "negative";
  score: number;
};

export async function requestSentiment(
  texts: string[],
): Promise<SentimentResult[]> {
  const response = await fetch(`${env.ML_SERVICE_URL}/sentiment`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Internal-Api-Key": env.ML_SERVICE_API_KEY,
    },
    body: JSON.stringify({ texts }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Sentiment service error (${response.status}): ${body}`);
  }

  const data = await response.json();
  return data.results;
}
