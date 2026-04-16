import { chromium, devices } from "playwright";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const baseUrl = process.env.SNAPSHOT_URL || "http://localhost:3000";
const outputDir = path.join(process.cwd(), "_snapshots", new Date().toISOString().replace(/[:.]/g, "-"));

const viewports = [
  { name: "desktop", viewport: { width: 1440, height: 1100 }, deviceScaleFactor: 1 },
  { name: "mobile", ...devices["iPhone 14 Pro"] },
];

const homepageShots = [
  { name: "hero-curtain", yRatio: 0, wait: 900, fullPage: false },
  { name: "hero-open", yRatio: 0.42, wait: 3000, fullPage: false },
  { name: "experience", selector: "#experience", wait: 900, fullPage: false },
  { name: "begin", selector: "#begin", wait: 900, fullPage: false },
  { name: "proof", selector: "#press", wait: 900, fullPage: false },
  { name: "homepage-full", yRatio: 0, wait: 1200, fullPage: true },
];

const routeShots = [
  { name: "design", url: "/design", wait: 900, fullPage: true },
];

async function hideDynamicChrome(page) {
  await page.addStyleTag({
    content: `
      *, *::before, *::after { caret-color: transparent !important; }
      html { scroll-behavior: auto !important; }
    `,
  });
}

async function scrollToShot(page, shot) {
  if (shot.selector) {
    await page.locator(shot.selector).scrollIntoViewIfNeeded();
    await page.evaluate(() => window.scrollBy(0, -24));
    return;
  }

  await page.evaluate((ratio) => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    window.scrollTo(0, Math.max(0, max * ratio));
  }, shot.yRatio ?? 0);
}

async function main() {
  await mkdir(outputDir, { recursive: true });
  const browser = await chromium.launch();

  for (const viewport of viewports) {
    const context = await browser.newContext({
      ...viewport,
      reducedMotion: "no-preference",
    });
    const page = await context.newPage();
    page.setDefaultTimeout(45000);

    for (const shot of homepageShots) {
      await page.goto(new URL("/", baseUrl).toString(), { waitUntil: "networkidle" });
      await hideDynamicChrome(page);
      await scrollToShot(page, shot);
      await page.waitForTimeout(shot.wait);
      await page.screenshot({
        path: path.join(outputDir, `${viewport.name}-${shot.name}.png`),
        fullPage: shot.fullPage,
      });
    }

    for (const shot of routeShots) {
      await page.goto(new URL(shot.url, baseUrl).toString(), { waitUntil: "networkidle" });
      await hideDynamicChrome(page);
      await page.waitForTimeout(shot.wait);
      await page.screenshot({
        path: path.join(outputDir, `${viewport.name}-${shot.name}.png`),
        fullPage: shot.fullPage,
      });
    }

    await context.close();
  }

  await browser.close();
  console.log(`Snapshots written to ${outputDir}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
