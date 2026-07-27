import "server-only";
import {
  type ClassifyResult,
  requestClassification,
} from "@/lib/ml/classification-client";

export type MlClassificationResult =
  | { success: true; results: ClassifyResult[] }
  | { success: false; error: string };

type VelocityProduct = {
  sku: string;
  unitsVelocity: number;
  revenueVelocity: number;
};

export async function runMlClassification(
  products: VelocityProduct[],
): Promise<MlClassificationResult> {
  try {
    const results = await requestClassification(products);
    return { success: true, results };
  } catch {
    return {
      success: false,
      error:
        "Couldn't reach the classification service. Falling back to threshold-based classification.",
    };
  }
}
