import { expect, test } from "@playwright/test";

test("student can register, manage a list, log out and log back in", async ({ page, request }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "The same authenticated workflow is viewport-independent.");

  const unique = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const email = `qa-${unique}@campusdata.local`;
  const password = `Qa-${unique}!`;
  let token: string | null = null;

  try {
    await page.goto("/kayit?redirect=/listem");
    await page.getByLabel("Ad Soyad").fill("QA Öğrencisi");
    await page.getByLabel("E-posta").fill(email);
    await page.getByLabel("Şifre", { exact: true }).fill(password);
    await page.getByLabel("Şifre Tekrar").fill(password);
    await page.getByRole("button", { name: "Kayıt Ol", exact: true }).click();
    await expect(page).toHaveURL(/\/listem$/);
    await expect(page.getByRole("heading", { name: "Tercih Listem" })).toBeVisible();

    await page.getByPlaceholder("Liste adı").fill("QA Tercihleri");
    await page.getByRole("button", { name: "Oluştur" }).click();
    await expect(page.getByText("QA Tercihleri", { exact: true }).first()).toBeVisible();

    await page.getByRole("button", { name: "Çıkış" }).click();
    await expect(page).toHaveURL("/");
    await expect(page.getByRole("link", { name: "Giriş Yap" })).toBeVisible();

    await page.goto("/giris?redirect=/listem");
    await page.getByLabel("E-posta").fill(email);
    await page.getByLabel("Şifre").fill(password);
    await page.getByRole("button", { name: "Giriş Yap", exact: true }).click();
    await expect(page.getByText("QA Tercihleri", { exact: true }).first()).toBeVisible();
    token = await page.evaluate(() => localStorage.getItem("token"));
  } finally {
    if (token) {
      await request.delete("http://127.0.0.1:8080/api/members/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
    }
  }
});
