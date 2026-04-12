import { test } from "@playwright/test";
import path from "path";

test("capture blog overview", async ({ page }) => {
  await page.goto("/blog/");
  await page.waitForLoadState("networkidle");
  await page.screenshot({
    path: path.resolve(__dirname, "../screenshots/blog-overview.png"),
    fullPage: true,
  });
});
