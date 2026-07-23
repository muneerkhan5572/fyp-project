import { expect, test } from "@playwright/test";

test("login page renders the login form", async ({ page }) => {
  await page.goto("/login");

  await expect(
    page.getByText("Login to your account", { exact: true }),
  ).toBeVisible();
  await expect(page.getByLabel("Email")).toBeVisible();
  await expect(page.getByLabel("Password", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Login" })).toBeVisible();
});

test("submitting an empty login form shows validation errors", async ({
  page,
}) => {
  await page.goto("/login");

  await page.getByRole("button", { name: "Login" }).click();

  await expect(page.getByLabel("Email")).toHaveAttribute(
    "aria-invalid",
    "true",
  );
});
