import "server-only";
import { env } from "@/env";

export type ClassifyProductInput = {
  sku: string;
  unitsVelocity: number;
  revenueVelocity: number;
};

export type ClassifyResult = {
  sku: string;
  classification: "high-demand" | "normal" | "slow-mover";
};

export async function requestClassification(
  products: ClassifyProductInput[],
): Promise<ClassifyResult[]> {
  const response = await fetch(`${env.ML_SERVICE_URL}/classify`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Internal-Api-Key": env.ML_SERVICE_API_KEY,
    },
    body: JSON.stringify({ products }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(
      `Classification service error (${response.status}): ${body}`,
    );
  }

  const data = await response.json();
  return data.results;
}
