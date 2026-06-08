import { expect, test } from "@playwright/test";

test("vendedor crea un producto desde dashboard", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Vendedor" }).click();
  await page.getByRole("button", { name: "Iniciar Sesion" }).click();
  await page.locator(".page-heading").getByRole("button", { name: "Crear Producto" }).click();
  await page.getByLabel("Nombre").fill("Producto E2E");
  await page.getByLabel("Precio").fill("12000");
  await page.getByLabel("Stock").fill("6");
  await page.getByLabel("Ubicacion").fill("Bogota");
  await page.getByLabel("Descripcion").fill("Producto creado por prueba end to end");
  await page.getByRole("button", { name: "Guardar Producto" }).click();

  await expect(page.getByRole("heading", { name: "Gestion de productos" })).toBeVisible();
  await expect(page.getByText("Producto E2E")).toBeVisible();
});
