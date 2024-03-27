import { test, expect, selectors } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("https://www.saucedemo.com/");

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/Swag Labs/);
});

test("Verify all usernames", async ({ page }) => {
  const keyWordlist = [
    "standard_user",
    "locked_out_user",
    "problem_user",
    "performance_glitch_user",
    "error_user",
    "visual_user",
  ];

  for (let i = 0; i < keyWordlist.length; i++) {
    const keyWord = keyWordlist[i];

    await page.getByPlaceholder("Username").fill(keyWord);
    await page.getByPlaceholder("Password").fill("secret_sauce");
    // Click the get started link.
    await page.getByText("Login").click({ button: "left" });
    if (keyWord == "locked_out_user") {
      await page
        .getByText("Epic sadface: Sorry, this user has been locked out.")
        .isVisible();
      await expect(page).toHaveTitle(/Swag Labs/);
    } else {
      await page.getByText("Products").isVisible();
      await page.getByText("Open Menu").click({ button: "left" });
      await page.getByText("Logout").click({ button: "left" });
      await expect(page).toHaveTitle(/Swag Labs/);
    }
  }
});

test("Incorrect login credentials", async ({ page }) => {
  await page.getByPlaceholder("Username").fill("wrongLogin");
  await page.getByPlaceholder("Password").fill("wrongPassword");
  // Click the get started link.
  await page.getByRole("button", { name: "Login" }).click({ button: "left" });
  await expect(
    page.getByText(
      "Epic sadface: Username and password do not match any user in this service"
    )
  ).toBeVisible();
});
