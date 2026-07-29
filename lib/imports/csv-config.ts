import type { ImportType } from "@/lib/imports/run-import";

export const IMPORT_TYPE_LABELS: Record<ImportType, string> = {
  products: "Products",
  sales: "Sales",
  traffic: "Traffic",
  reviews: "Reviews",
};

export const IMPORT_COLUMNS: Record<ImportType, string[]> = {
  products: ["name", "sku", "category", "price", "cost", "stock"],
  sales: ["sku", "date", "quantity", "revenue"],
  traffic: ["sku", "date", "views"],
  reviews: ["sku", "review_date", "review_text", "rating"],
};

export const IMPORT_DESCRIPTIONS: Record<ImportType, string> = {
  products: "Create or update products by SKU.",
  sales: "Daily sales by SKU and date.",
  traffic: "Daily page views by SKU and date.",
  reviews: "Customer reviews by SKU, scored for sentiment on import.",
};

export const IMPORT_TEMPLATE_HREFS: Record<ImportType, string> = {
  products: "/templates/products-template.csv",
  sales: "/templates/sales-template.csv",
  traffic: "/templates/traffic-template.csv",
  reviews: "/templates/reviews-template.csv",
};
