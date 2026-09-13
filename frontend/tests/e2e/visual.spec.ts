import { expect, test } from "@playwright/test";

const pages = [
  { path: "/", heading: /yükseköğretim program atlası/i, screenshot: "anasayfa" },
  { path: "/universite", heading: /üniversiteler/i, screenshot: "universiteler" },
  { path: "/programlar", heading: /programlar/i, screenshot: "programlar" },
  { path: "/tercih", heading: /tercih sihirbazı/i, screenshot: "tercih-sihirbazi" },
  { path: "/netler", heading: /net sihirbazı/i, screenshot: "net-sihirbazi" },
  { path: "/giris", heading: /giriş yap/i, screenshot: "giris" },
  { path: "/kayit", heading: /kayıt ol/i, screenshot: "kayit" },
  { path: "/listem", heading: /giriş gerekli/i, screenshot: "tercih-listesi" },
];

for (const entry of pages) {
  test(`${entry.path} renders without viewport overflow`, async ({ page }, testInfo) => {
    const pageErrors: string[] = [];
    page.on("pageerror", (error) => pageErrors.push(error.message));

    const response = await page.goto(entry.path, { waitUntil: "networkidle" });
    expect(response?.status()).toBeLessThan(400);
    await expect(page.getByRole("heading", { name: entry.heading }).first()).toBeVisible();

    const layout = await page.evaluate(() => ({
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      offenders: [...document.querySelectorAll("body *")]
        .filter((element) => element.getBoundingClientRect().right > document.documentElement.clientWidth + 1)
        .slice(0, 5)
        .map((element) => `${element.tagName.toLowerCase()}.${element.className}`),
    }));
    expect(layout.overflow, `Overflowing elements: ${layout.offenders.join(", ")}`).toBeLessThanOrEqual(1);
    expect(pageErrors).toEqual([]);

    await page.screenshot({ path: testInfo.outputPath(`${entry.screenshot}.png`), fullPage: true });
  });
}

test("net calculation and preference wizard return usable results", async ({ page }) => {
  await page.goto("/netler");
  const tytPanel = page.getByRole("heading", { name: "TYT", exact: true }).locator("..").locator("..");
  await tytPanel.locator('input[type="number"]').nth(0).fill("20");
  await tytPanel.locator('input[type="number"]').nth(1).fill("4");
  await expect(page.getByText("19.00", { exact: true })).toHaveCount(2);

  await page.goto("/tercih");
  await page.getByPlaceholder("Örn. 50000").fill("50000");
  await page.getByRole("button", { name: "Program Bul" }).click();
  await expect(page.getByText(/180 program bulundu/i)).toBeVisible();
  await expect(page.getByText("Güçlü", { exact: true }).first()).toBeVisible();
  await expect(page.getByText("Dengeli", { exact: true }).first()).toBeVisible();
  await expect(page.getByText("Zorlayıcı", { exact: true }).first()).toBeVisible();
});
