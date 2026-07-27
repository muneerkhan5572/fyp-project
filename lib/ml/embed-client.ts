import "server-only";
import { env } from "@/env";

export async function requestEmbeddings(texts: string[]): Promise<number[][]> {
  const response = await fetch(`${env.ML_SERVICE_URL}/embed`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Internal-Api-Key": env.ML_SERVICE_API_KEY,
    },
    body: JSON.stringify({ texts }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Embedding service error (${response.status}): ${body}`);
  }

  const data = await response.json();
  return data.vectors;
}
