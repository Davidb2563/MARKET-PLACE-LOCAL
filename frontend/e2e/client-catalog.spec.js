import { expect, test } from "@playwright/test";

test("cliente inicia sesion y ve catalogo", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Iniciar Sesion" }).click();

  await expect(page.getByRole("heading", { name: "Productos cerca de ti" })).toBeVisible();
  await expect(page.getByText("Cafe especial de origen")).toBeVisible();
});
