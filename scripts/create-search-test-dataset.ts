import { eq, sql } from "drizzle-orm";
import { env } from "@/env";
import { db } from "@/lib/db";
import { datasets, products, users } from "@/lib/db/schema";

const DEMO_EMAIL = "demo@example.com";
const DATASET_NAME = "Search Test";

type TestProduct = {
  name: string;
  sku: string;
  category: string;
  description: string;
  price: string;
  group: "should-match" | "decoy";
};

const TEST_PRODUCTS: TestProduct[] = [
  {
    name: "Bouncy Ball Set",
    sku: "STEST-001",
    category: "Toys",
    description:
      "A pack of colorful rubber balls, an affordable, fun surprise that's great for a child's birthday goodie bag.",
    price: "4.99",
    group: "should-match",
  },
  {
    name: "Building Bricks Bucket",
    sku: "STEST-002",
    category: "Toys",
    description:
      "A budget-friendly bucket of interlocking blocks kids can snap together, a popular low-cost present for young ones.",
    price: "9.5",
    group: "should-match",
  },
  {
    name: "Finger Puppet Pack",
    sku: "STEST-003",
    category: "Toys",
    description:
      "Cheap, cheerful little puppets perfect as a stocking-stuffer gift for a small child.",
    price: "3.25",
    group: "should-match",
  },
  {
    name: "Sticker Book",
    sku: "STEST-004",
    category: "Toys",
    description:
      "An inexpensive activity book full of stickers, ideal as a small present for a young kid.",
    price: "2.75",
    group: "should-match",
  },
  {
    name: "Wireless Noise-Cancelling Headphones",
    sku: "STEST-005",
    category: "Electronics",
    description:
      "Premium over-ear headphones with active noise cancellation and 30-hour battery life for audiophiles.",
    price: "249.99",
    group: "decoy",
  },
  {
    name: "Single-Origin Espresso Machine",
    sku: "STEST-006",
    category: "Kitchen",
    description:
      "A high-end espresso machine with a built-in grinder, designed for serious home coffee enthusiasts.",
    price: "389.0",
    group: "decoy",
  },
  {
    name: "Leather Office Chair",
    sku: "STEST-007",
    category: "Furniture",
    description:
      "An ergonomic leather executive chair built for long workdays at a professional desk.",
    price: "410.0",
    group: "decoy",
  },
  {
    name: "Men's Wool Overcoat",
    sku: "STEST-008",
    category: "Apparel",
    description:
      "A tailored wool overcoat for adults, designed for formal winter business wear.",
    price: "180.0",
    group: "decoy",
  },
];

function buildProductEmbeddingText(product: {
  name: string;
  category: string | null;
  description: string | null;
}) {
  return `${product.name} ${product.category ?? ""} ${product.description ?? ""}`
    .replace(/\s+/g, " ")
    .trim();
}

async function embedTexts(texts: string[]): Promise<(number[] | null)[]> {
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

async function main() {
  const [user] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, DEMO_EMAIL))
    .limit(1);

  if (!user) {
    throw new Error(
      `Demo user (${DEMO_EMAIL}) not found. Run "pnpm db:seed" first.`,
    );
  }

  const [alreadyExists] = await db
    .select({ id: datasets.id })
    .from(datasets)
    .where(
      sql`${datasets.userId} = ${user.id} and ${datasets.name} = ${DATASET_NAME}`,
    )
    .limit(1);

  let datasetId: string;
  if (alreadyExists) {
    datasetId = alreadyExists.id;
    console.info(`Reusing existing dataset ${DATASET_NAME} (${datasetId}).`);
  } else {
    const [created] = await db
      .insert(datasets)
      .values({ userId: user.id, name: DATASET_NAME })
      .returning({ id: datasets.id });
    datasetId = created.id;
    console.info(`Created dataset ${DATASET_NAME} (${datasetId}).`);
  }

  const embeddings = await embedTexts(
    TEST_PRODUCTS.map((product) => buildProductEmbeddingText(product)),
  );

  await db
    .insert(products)
    .values(
      TEST_PRODUCTS.map((product, index) => ({
        datasetId,
        name: product.name,
        sku: product.sku,
        category: product.category,
        description: product.description,
        price: product.price,
        embedding: embeddings[index] ?? null,
      })),
    )
    .onConflictDoUpdate({
      target: [products.datasetId, products.sku],
      set: {
        name: sql`excluded.name`,
        category: sql`excluded.category`,
        description: sql`excluded.description`,
        price: sql`excluded.price`,
        embedding: sql`excluded.embedding`,
        updatedAt: sql`now()`,
      },
    });

  console.info(`Inserted/updated ${TEST_PRODUCTS.length} test products.`);
  console.info(
    `\nGroups:\n  should-match: ${TEST_PRODUCTS.filter(
      (p) => p.group === "should-match",
    )
      .map((p) => p.name)
      .join(", ")}\n  decoy: ${TEST_PRODUCTS.filter((p) => p.group === "decoy")
      .map((p) => p.name)
      .join(", ")}`,
  );
  console.info(`\nDataset URL: /dashboard/${datasetId}/products`);
  console.info(`Login: ${DEMO_EMAIL} / DemoPass123!`);

  process.exit(0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
