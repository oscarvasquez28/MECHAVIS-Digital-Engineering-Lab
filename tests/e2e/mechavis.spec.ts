import { test, expect } from "@playwright/test";

test("home renders hero with 3D shaft and technical metadata", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1, name: /MECHAVIS/i })).toBeVisible();
  await expect(page.getByRole("heading", { name: /Digital\s*Engineering Lab/i })).toBeVisible();
  await expect(page.locator("canvas").first()).toBeVisible();
  await expect(page.getByText("IS-1042")).toBeVisible();
  await expect(page.getByText("AISI 4140")).toBeVisible();
  await expect(page.getByText(/INSPECTED/)).toBeVisible();
});

test("component explorer filters and navigates to a detail page", async ({ page }) => {
  await page.goto("/components");
  await expect(page.getByText("Explore the engineering")).toBeVisible();
  await page.getByLabel("Search components").fill("coil");
  await expect(page.getByText("01 RESULTS")).toBeVisible();
  await page.getByRole("link", { name: /Induction Coil/ }).first().click();
  await expect(page).toHaveURL(/induction-coil/);
  await expect(page.getByRole("heading", { name: "Induction Coil" }).first()).toBeVisible();
  await expect(page.getByLabel(/interactive 3D model/i)).toBeVisible();
});

test("engineering viewer controls: explode, section, wireframe, measure, reset", async ({ page }) => {
  await page.goto("/components/input-shaft");
  await expect(page.getByLabel("3D controls")).toBeVisible();
  await page.getByLabel("Explode").click();
  await expect(page.getByText("EXPLODED VIEW")).toBeVisible();
  await expect(page.getByLabel("Exploded view percentage")).toBeVisible();
  await page.getByLabel("Section").click();
  await expect(page.getByText("VISUAL SECTION")).toBeVisible();
  await page.getByLabel("Wireframe").click();
  await page.getByLabel("Measure").click();
  await expect(page.getByText(/SELECT FIRST POINT/)).toBeVisible();
  await page.getByLabel("Reset").click();
  await expect(page.getByText("VISUAL SECTION")).not.toBeVisible();
});

test("hotspot focus shows technical tooltip", async ({ page }) => {
  await page.goto("/components/input-shaft");
  await page.getByRole("button", { name: /Shoulder fillet/ }).click();
  await expect(page.locator(".hotspot-tooltip")).toBeVisible();
  await expect(page.locator(".hotspot-tooltip")).toContainText("Surface finish");
});

test("analysis modes update the model and metrics", async ({ page }) => {
  await page.goto("/analysis?component=induction-coil");
  await expect(page.getByRole("heading", { name: "Induction Coil" })).toBeVisible();
  await page.getByRole("button", { name: "Thermal" }).click();
  await expect(page.getByText("°C").first()).toBeVisible();
  await page.getByLabel("Play thermal ramp").click();
  await page.waitForTimeout(400);
  await expect(page.getByLabel("Pause thermal ramp")).toBeVisible();
  await page.getByRole("button", { name: "Wear" }).click();
  await expect(page.getByText(/wear risk/i).first()).toBeVisible();
});

test("AI assistant answers contextually and focuses a region", async ({ page }) => {
  await page.goto("/ai?component=input-shaft");
  await page.getByRole("button", { name: /Critical regions/ }).click();
  await expect(page.getByText("MECHAVIS / SIMULATED RESPONSE").last()).toBeVisible();
  await expect(page.getByRole("button", { name: /Locate on model/ }).first()).toBeVisible();
  await expect(page.getByText(/Focused:/)).toBeVisible();
});

test("comparison workspace renders two models and a recommendation", async ({ page }) => {
  await page.goto("/compare");
  await expect(page.getByLabel("Component A", { exact: true })).toHaveValue("input-shaft");
  await expect(page.getByLabel("Component B", { exact: true })).toHaveValue("alloy-shaft");
  await expect(page.getByText(/ILLUSTRATIVE SHORTLIST|CLOSE RESULT|REFERENCE LEAD/)).toBeVisible();
  await page.getByRole("button", { name: "Strength first" }).click();
  await expect(page.getByText(/strength-focused/i)).toBeVisible();
});

test("command palette opens with CMD+K and runs a viewer command", async ({ page }) => {
  await page.goto("/components/precision-bearing");
  await page.keyboard.press("Meta+k");
  await expect(page.getByPlaceholder(/Type a command/)).toBeVisible();
  await page.getByPlaceholder(/Type a command/).fill("exploded");
  await page.getByRole("option", { name: /Toggle exploded view/ }).click();
  await expect(page.getByText("EXPLODED VIEW")).toBeVisible();
});

test("unknown component shows not-found state", async ({ page }) => {
  await page.goto("/components/nonexistent-part");
  await expect(page.getByText("Outside the assembly.")).toBeVisible();
});
