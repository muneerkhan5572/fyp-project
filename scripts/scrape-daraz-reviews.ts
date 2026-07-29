import { writeFileSync } from "node:fs";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { products } from "@/lib/db/schema";

const SEARCH_URL = "https://www.daraz.pk/catalog/";
const REVIEW_URL = "https://my.daraz.pk/pdp/review/getReviewList";
const REVIEW_PAGE_SIZE = 20;
const MAX_REVIEW_PAGES = 5;
const REQUEST_DELAY_MS = 400;
const MONTHS: Record<string, string> = {
  Jan: "01",
  Feb: "02",
  Mar: "03",
  Apr: "04",
  May: "05",
  Jun: "06",
  Jul: "07",
  Aug: "08",
  Sep: "09",
  Oct: "10",
  Nov: "11",
  Dec: "12",
};

type SearchListItem = {
  itemId: string;
  name: string;
  review: string;
  ratingScore: string;
};

type ReviewItem = {
  reviewContent: string;
  rating: number;
  reviewTime: string;
};

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function tokenize(value: string): Set<string> {
  return new Set(
    value
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter((token) => token.length > 2),
  );
}

function overlapScore(a: Set<string>, b: Set<string>): number {
  let count = 0;
  for (const token of a) {
    if (b.has(token)) {
      count++;
    }
  }
  return count;
}

function parseDarazDate(value: string): string | null {
  const match = /^(\d{1,2})\s+([A-Za-z]{3})\s+(\d{4})$/.exec(value.trim());
  if (!match) {
    return null;
  }
  const [, day, monthName, year] = match;
  const month = MONTHS[monthName];
  if (!month) {
    return null;
  }
  return `${year}-${month}-${day.padStart(2, "0")}`;
}

function csvEscape(value: string): string {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

async function searchListings(query: string): Promise<SearchListItem[]> {
  const url = `${SEARCH_URL}?q=${encodeURIComponent(query)}&ajax=true`;
  const response = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0" },
  });
  if (!response.ok) {
    throw new Error(
      `Daraz search failed for "${query}" (${response.status}) — the endpoint may have changed.`,
    );
  }
  const data = await response.json();
  const listItems = data?.mods?.listItems;
  if (!Array.isArray(listItems)) {
    throw new Error(
      `Unexpected Daraz search response shape for "${query}" — the undocumented API may have changed.`,
    );
  }
  return listItems;
}

function pickBestMatch(
  productName: string,
  listings: SearchListItem[],
): SearchListItem | null {
  if (listings.length === 0) {
    return null;
  }
  const productTokens = tokenize(productName);
  let best = listings[0];
  let bestScore = -1;
  for (const listing of listings) {
    const score = overlapScore(productTokens, tokenize(listing.name));
    if (score > bestScore) {
      bestScore = score;
      best = listing;
    }
  }
  return bestScore > 0 ? best : listings[0];
}

async function fetchReviews(itemId: string): Promise<ReviewItem[]> {
  const collected: ReviewItem[] = [];
  for (let page = 1; page <= MAX_REVIEW_PAGES; page++) {
    const url = `${REVIEW_URL}?itemId=${itemId}&pageSize=${REVIEW_PAGE_SIZE}&filter=0&sort=0&pageNo=${page}`;
    const response = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0" },
    });
    if (!response.ok) {
      throw new Error(
        `Daraz review fetch failed for itemId ${itemId} page ${page} (${response.status}).`,
      );
    }
    const data = await response.json();
    if (data?.success !== true || !Array.isArray(data?.model?.items)) {
      throw new Error(
        `Unexpected Daraz review response shape for itemId ${itemId} — the undocumented API may have changed.`,
      );
    }
    const items = data.model.items as {
      reviewContent: string | null;
      rating: number | null;
      reviewTime: string | null;
    }[];
    if (items.length === 0) {
      break;
    }
    for (const item of items) {
      if (item.reviewContent?.trim()) {
        collected.push({
          reviewContent: item.reviewContent.trim(),
          rating: item.rating ?? 0,
          reviewTime: item.reviewTime ?? "",
        });
      }
    }
    const totalPages = data.model.paging?.totalPages ?? page;
    if (page >= totalPages) {
      break;
    }
    await sleep(REQUEST_DELAY_MS);
  }
  return collected;
}

async function main() {
  const datasetId = process.argv[2];
  if (!datasetId) {
    console.error("Usage: pnpm scrape:daraz-reviews <datasetId> [outputPath]");
    process.exit(1);
  }
  const outputPath = process.argv[3] ?? "reviews.csv";

  const datasetProducts = await db
    .select({ id: products.id, name: products.name, sku: products.sku })
    .from(products)
    .where(eq(products.datasetId, datasetId));

  if (datasetProducts.length === 0) {
    console.error("No products found for this dataset.");
    process.exit(1);
  }

  const rows: string[] = ["sku,review_date,review_text,rating"];
  let matchedCount = 0;
  let skippedCount = 0;

  for (const product of datasetProducts) {
    console.info(`\nSearching Daraz for: ${product.name} (${product.sku})`);
    let listings: SearchListItem[];
    try {
      listings = await searchListings(product.name);
    } catch (error) {
      console.error(`  Search failed: ${(error as Error).message}`);
      skippedCount++;
      continue;
    }

    const match = pickBestMatch(product.name, listings);
    if (!match) {
      console.info("  No matching Daraz listing found — skipping.");
      skippedCount++;
      continue;
    }
    console.info(
      `  Matched: "${match.name}" (itemId ${match.itemId}, ${match.review} reviews, rating ${match.ratingScore})`,
    );

    await db
      .update(products)
      .set({ externalSource: "daraz", externalId: match.itemId })
      .where(eq(products.id, product.id));

    await sleep(REQUEST_DELAY_MS);

    let reviewItems: ReviewItem[];
    try {
      reviewItems = await fetchReviews(match.itemId);
    } catch (error) {
      console.error(`  Review fetch failed: ${(error as Error).message}`);
      skippedCount++;
      continue;
    }
    console.info(`  Pulled ${reviewItems.length} reviews.`);
    matchedCount++;

    for (const review of reviewItems) {
      const date = parseDarazDate(review.reviewTime) ?? "";
      rows.push(
        [
          csvEscape(product.sku),
          date,
          csvEscape(review.reviewContent),
          review.rating > 0 ? String(review.rating) : "",
        ].join(","),
      );
    }

    await sleep(REQUEST_DELAY_MS);
  }

  writeFileSync(outputPath, `${rows.join("\n")}\n`, "utf-8");
  console.info(
    `\nDone. Matched ${matchedCount}/${datasetProducts.length} products (${skippedCount} skipped). Wrote ${rows.length - 1} review rows to ${outputPath}.`,
  );
  console.info(
    "Upload this file via the Reviews import card on the dataset's Import page.",
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
