import { test, expect, selectors } from "@playwright/test";
import standardUserProducts from "../testData/standardUser.json";

test("Order all products", async ({ page }) => {
  //"SignIn to www.saucedemo.com"
  await page.goto("https://www.saucedemo.com/");
  await expect(page).toHaveTitle(/Swag Labs/);
  await page.getByPlaceholder("Username").fill("standard_user");
  await page.getByPlaceholder("Password").fill("secret_sauce");
  await page.getByRole("button", { name: "Login" }).click({ button: "left" });
  await expect(page.getByText("Products")).toBeVisible();
  selectors.setTestIdAttribute("data-test");

  // "Verify all products
  for (const products of standardUserProducts) {
    await expect(
      page.getByText(products.inventory_item_name).first()
    ).toBeVisible();
    await expect(
      page.getByText(products.inventory_item_desc).first()
    ).toBeVisible();
  }

  //"Add to cart all products"
  for (const products of standardUserProducts) {
    await page.getByText(products.inventory_item_name).first().click();
    await expect(
      page.getByText(products.inventory_item_name).first()
    ).toBeVisible();
    await expect(
      page.getByText(products.inventory_item_desc).first()
    ).toBeVisible();
    await page.getByText("Add to cart").click();
    await expect(page.getByText("Remove")).toBeVisible();
    await page.getByTestId("back-to-products").click();
  }
  await page.getByTestId("shopping-cart-link").click();

  // "Verify all added products in cart
  let full_price = 0;
  await expect(page.getByText("Your Cart")).toBeVisible();

  for (const products of standardUserProducts) {
    await expect(
      page.getByText(products.inventory_item_name).first()
    ).toBeVisible();
    await expect(
      page.getByText(products.inventory_item_desc).first()
    ).toBeVisible();
    await expect(
      page.getByText(products.inventory_item_price).first()
    ).toBeVisible();
    full_price = full_price + parseFloat(products.inventory_item_price);
  }
  await page.getByTestId("checkout").click();

  //"Checkout application"
  const randomNum = Math.random().toString().substr(2, 4);
  await expect(page.getByText("Checkout: Your Information")).toBeVisible();
  await page.getByTestId("firstName").fill("FirstName" + randomNum);
  await page.getByTestId("lastName").fill("LastName" + randomNum);
  await page.getByTestId("postalCode").fill(randomNum);
  await page.getByTestId("continue").click();

  // "Checkout: Overview"
  const keyWordlist = [
    "Checkout: Overview",
    "Payment Information:",
    "Shipping Information:",
    "Free Pony Express Delivery!",
    "Price Total",
  ];

  for (let i = 0; i < keyWordlist.length; i++) {
    const keyWord = keyWordlist[i];

    await expect(page.getByText(keyWord)).toBeVisible();
  }
  await expect(
    page.getByText("Item total: $" + full_price.toFixed(2))
  ).toBeVisible();
  await page.getByTestId("finish").click();

  // "Verify confirmation page"
  await expect(page.getByText("Thank you for your order!")).toBeVisible();
  await expect(
    page.getByText(
      "Your order has been dispatched, and will arrive just as fast as the pony can get there!"
    )
  ).toBeVisible();
});
