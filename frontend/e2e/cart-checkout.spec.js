import { expect, test } from "@playwright/test";

test("cliente agrega producto al carrito y confirma compra", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Iniciar Sesion" }).click();
  await page.getByRole("button", { name: "Agregar" }).first().click();
  await page.getByLabel("Carrito").click();
  await page.getByRole("button", { name: "Finalizar Compra" }).click();

  await expect(page.getByRole("heading", { name: "Compra realizada correctamente" })).toBeVisible();
});
