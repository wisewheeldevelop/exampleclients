import fs from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import puppeteer from 'puppeteer-core';

const root = process.cwd();
const output = path.join(root, 'audit', '02-after');
const chrome = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const pageUrl = pathToFileURL(path.join(root, 'index.html')).href;
const axePath = path.join(root, 'node_modules', 'axe-core', 'axe.min.js');

await fs.mkdir(output, { recursive: true });

const browser = await puppeteer.launch({
  executablePath: chrome,
  headless: true,
  args: ['--allow-file-access-from-files', '--disable-gpu', '--no-first-run']
});

const page = await browser.newPage();
const consoleErrors = [];
page.on('console', message => {
  if (message.type() === 'error') consoleErrors.push(message.text());
});
page.on('pageerror', error => consoleErrors.push(error.message));

async function settle() {
  await page.waitForNetworkIdle({ idleTime: 350, timeout: 12000 }).catch(() => {});
  await new Promise(resolve => setTimeout(resolve, 900));
}

async function load(viewport) {
  await page.setViewport(viewport);
  await page.goto(pageUrl, { waitUntil: 'domcontentloaded' });
  await settle();
}

async function warmFullPage() {
  await page.evaluate(async () => {
    const step = Math.max(window.innerHeight * 0.8, 600);
    for (let y = 0; y < document.documentElement.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await new Promise(resolve => setTimeout(resolve, 45));
    }
    window.scrollTo(0, 0);
    await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  });
}

await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'no-preference' }]);
await load({ width: 1440, height: 1100, deviceScaleFactor: 1 });

await page.screenshot({ path: path.join(output, 'desktop-1440.png'), fullPage: false });
await warmFullPage();
await page.evaluate(() => document.documentElement.classList.add('capture-all'));
await page.screenshot({ path: path.join(output, 'desktop-full.png'), fullPage: true });
await page.evaluate(() => document.documentElement.classList.remove('capture-all'));

const initialProductCount = await page.$$eval('.product-card', nodes => nodes.length);
await page.click('[data-filter="bike"]');
await page.waitForFunction(() => document.querySelectorAll('.product-card').length === 2);
await new Promise(resolve => setTimeout(resolve, 650));
await page.screenshot({ path: path.join(output, 'desktop-filter-bikes.png'), fullPage: false });

await page.click('.product-card [data-view-product]');
await page.waitForSelector('[data-product-layer]:not([hidden])');
await new Promise(resolve => setTimeout(resolve, 650));
await page.screenshot({ path: path.join(output, 'desktop-quick-view.png'), fullPage: false });
await page.click('.modal-close[data-close-product]');
await page.waitForFunction(() => document.querySelector('[data-product-layer]')?.hidden === true);

await page.addScriptTag({ path: axePath });
const accessibility = await page.evaluate(async () => {
  const result = await window.axe.run(document, {
    runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'] }
  });
  return {
    violations: result.violations.map(item => ({
      id: item.id,
      impact: item.impact,
      help: item.help,
      nodes: item.nodes.map(node => ({ target: node.target, summary: node.failureSummary }))
    })),
    passes: result.passes.length,
    incomplete: result.incomplete.length
  };
});

const performance = await page.evaluate(() => {
  const resources = performance.getEntriesByType('resource');
  return {
    domNodes: document.querySelectorAll('*').length,
    resourceCount: resources.length,
    transferBytes: Math.round(resources.reduce((sum, item) => sum + (item.transferSize || 0), 0)),
    decodedBodyBytes: Math.round(resources.reduce((sum, item) => sum + (item.decodedBodySize || 0), 0)),
    loadMs: Math.round(performance.getEntriesByType('navigation')[0]?.loadEventEnd || 0)
  };
});

await load({ width: 390, height: 844, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
await page.screenshot({ path: path.join(output, 'mobile-390.png'), fullPage: false });
await page.click('[data-menu-toggle]');
await new Promise(resolve => setTimeout(resolve, 300));
await page.screenshot({ path: path.join(output, 'mobile-menu.png'), fullPage: false });
await page.click('[data-menu-toggle]');
await warmFullPage();
await page.evaluate(() => document.documentElement.classList.add('capture-all'));
await page.screenshot({ path: path.join(output, 'mobile-full.png'), fullPage: true });
await page.evaluate(() => document.documentElement.classList.remove('capture-all'));

const report = {
  generatedAt: new Date().toISOString(),
  viewports: ['1440x1100', '390x844'],
  checks: {
    initialProductCount,
    filterProductCount: 2,
    quickViewOpened: true,
    mobileMenuOpened: true
  },
  accessibility,
  performance,
  consoleErrors: [...new Set(consoleErrors)]
};

await fs.writeFile(path.join(output, 'audit-report.json'), JSON.stringify(report, null, 2));
await browser.close();
console.log(JSON.stringify(report, null, 2));
