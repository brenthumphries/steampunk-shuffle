import { expect, test, type TestInfo } from "@playwright/test";
import { openWithSave, QUIET_PRE_BIRTHDAY, readKey, START } from "./helpers/game";

// Install from the web (monthly plan 14 §3.1). The install page and the hub's
// one-time beer mat are Pages-only: the native bundle has no install page and
// never offers an install, so the Native project checks that they're absent.

const ANDROID_CHROME = "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Mobile Safari/537.36";
const IPHONE_SAFARI = "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1";
const OFFER_TEXT = "Keep the Bridge on your home screen?";

function isNative(testInfo: TestInfo): boolean {
  return /Native/.test(testInfo.project.name);
}

test.describe("install page on Android", () => {
  test.use({ userAgent: ANDROID_CHROME, viewport: { width: 412, height: 915 } });

  test("tells an Android phone to install, shows the QR code, and sends nothing off the device", async ({ page, context, baseURL }, testInfo) => {
    test.skip(isNative(testInfo), "the install page is a Pages-only entry");
    const origin = new URL(baseURL!).origin;
    const requests: string[] = [];
    context.on("request", (request) => requests.push(request.url()));

    await page.goto(`${START}install/`);
    await expect(page.getByRole("heading", { name: "Keep the Bridge on your home screen" })).toBeVisible();
    await expect(page.locator("section[data-platform='android']")).toBeVisible();
    await expect(page.locator("section[data-platform='iphone']")).toBeHidden();
    expect(await page.locator("img[alt^='QR code']").evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0)).toBe(true);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), "no sideways scroll at 412px").toBe(true);
    expect(requests.filter((url) => !url.startsWith(origin) && !url.startsWith("data:")), "requests to other origins").toEqual([]);
  });
});

test.describe("install page on iPhone", () => {
  test.use({ userAgent: IPHONE_SAFARI });

  test("shows the Add to Home Screen steps on an iPhone", async ({ page }, testInfo) => {
    test.skip(isNative(testInfo), "the install page is a Pages-only entry");
    await page.goto(`${START}install/`);
    await expect(page.locator("section[data-platform='iphone']")).toBeVisible();
    await expect(page.getByText("Add to Home Screen")).toBeVisible();
    await expect(page.locator("section[data-platform='android']")).toBeHidden();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  });
});

test.describe("hub install beer mat", () => {
  test.use({ userAgent: ANDROID_CHROME });

  test("offers the install once on Android Chrome, after the browser's prompt, and never in the native bundle", async ({ page }, testInfo) => {
    await page.clock.setFixedTime(QUIET_PRE_BIRTHDAY);
    await openWithSave(page, { tutorialDone: true });
    await expect(page.getByRole("button", { name: "Save & data" })).toBeVisible();

    // The browser's prompt arrives after load; stand in for it.
    const fireBrowserPrompt = () =>
      page.evaluate(() => {
        const event = new Event("beforeinstallprompt", { cancelable: true }) as Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> };
        event.prompt = () => {
          (window as unknown as { __installPrompted?: boolean }).__installPrompted = true;
          return Promise.resolve();
        };
        event.userChoice = Promise.resolve({ outcome: "accepted" });
        window.dispatchEvent(event);
      });
    await fireBrowserPrompt();
    // Re-render the hub, which is where the mat is decided.
    await page.getByRole("button", { name: "Save & data" }).click();
    await page.getByRole("button", { name: "Back to the taproom" }).click();

    if (isNative(testInfo)) {
      await expect(page.getByText(OFFER_TEXT)).toHaveCount(0);
      return;
    }

    await expect(page.getByText(OFFER_TEXT)).toBeVisible();
    expect(await readKey(page, "player")).toMatchObject({ installOfferSeen: true });
    await page.getByRole("button", { name: "Install app" }).click();
    await expect(page.getByText(OFFER_TEXT)).toHaveCount(0);
    expect(await page.evaluate(() => (window as unknown as { __installPrompted?: boolean }).__installPrompted)).toBe(true);

    // One time only: a fresh launch with the prompt offered again still shows no mat.
    await page.reload();
    await expect(page.getByRole("button", { name: "Save & data" })).toBeVisible();
    await fireBrowserPrompt();
    await page.getByRole("button", { name: "Save & data" }).click();
    await page.getByRole("button", { name: "Back to the taproom" }).click();
    await expect(page.getByRole("button", { name: "Save & data" })).toBeVisible();
    await expect(page.getByText(OFFER_TEXT)).toHaveCount(0);
  });
});
