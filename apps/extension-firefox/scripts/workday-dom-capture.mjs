#!/usr/bin/env node
/**
 * Workday DOM Capture - Uses Playwright to navigate, screenshot, and run DOM inspection
 * Run: npx playwright test scripts/workday-dom-capture.mjs
 * Or: node scripts/workday-dom-capture.mjs (requires: npm install playwright)
 */
import { chromium } from 'playwright';
import { writeFileSync, mkdirSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = join(__dirname, '../../.workday-capture');
mkdirSync(OUTPUT_DIR, { recursive: true });

const INSPECTION_SCRIPT = `
(function() {
  const report = {};
  
  const inputs = document.querySelectorAll('input:not([type="hidden"]), select, textarea');
  report.inputs = Array.from(inputs).map(el => ({
    tag: el.tagName,
    type: el.type || null,
    id: el.id || null,
    name: el.name || null,
    placeholder: el.placeholder || null,
    ariaLabel: el.getAttribute('aria-label'),
    ariaLabelledBy: el.getAttribute('aria-labelledby'),
    dataAutomationId: el.getAttribute('data-automation-id'),
    role: el.getAttribute('role'),
    value: el.value ? '[HAS VALUE]' : null,
    labelFor: el.id ? (document.querySelector('label[for="' + el.id.replace(/"/g, '\\\\"') + '"]')?.textContent?.trim() || null) : null,
    workdayLabel: (() => {
      const formField = el.closest('[data-automation-id="formField"]');
      if (!formField) return null;
      return formField.querySelector('[data-automation-id="label"]')?.textContent?.trim() || null;
    })(),
    parentAutomationId: el.parentElement?.getAttribute('data-automation-id') || 
                        el.parentElement?.parentElement?.getAttribute('data-automation-id') || null,
    nearbyText: (el.type === 'checkbox') ? (() => {
      const parent = el.closest('[class*="checkbox"], [data-automation-id], label') || el.parentElement;
      return parent?.textContent?.trim()?.substring(0, 100) || null;
    })() : null
  }));
  
  const automationIds = new Set();
  document.querySelectorAll('[data-automation-id]').forEach(el => {
    automationIds.add(el.getAttribute('data-automation-id'));
  });
  report.automationIds = Array.from(automationIds);
  
  const heading = document.querySelector('h1, h2, [data-automation-id="headingText"]');
  report.pageHeading = heading?.textContent?.trim() || null;
  
  return report;
})();
`;

const URL = 'https://expedia.wd108.myworkdayjobs.com/en-US/search/job/USA---California---San-Jose/Principal-Software-Development-Engineer_R-99477-1/apply?source=LinkedIn';

async function captureStep(page, stepName, stepIndex) {
  console.log(`\n--- ${stepName} ---`);
  
  // Wait for form to be ready
  await page.waitForSelector('input, select, textarea', { timeout: 15000 }).catch(() => {});
  await page.waitForTimeout(3000); // Extra wait for Workday JS
  
  // Screenshot
  const screenshotPath = join(OUTPUT_DIR, `step-${stepIndex}-${stepName.replace(/\s+/g, '-')}.png`);
  await page.screenshot({ path: screenshotPath, fullPage: true });
  console.log(`  Screenshot: ${screenshotPath}`);
  
  // Run inspection
  const report = await page.evaluate((script) => {
    return eval(script);
  }, INSPECTION_SCRIPT);
  
  report.stepName = stepName;
  report.stepIndex = stepIndex;
  report.url = page.url();
  
  const jsonPath = join(OUTPUT_DIR, `step-${stepIndex}-${stepName.replace(/\s+/g, '-')}.json`);
  writeFileSync(jsonPath, JSON.stringify(report, null, 2));
  console.log(`  JSON: ${jsonPath}`);
  
  return report;
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();
  
  const allReports = [];
  
  try {
    console.log('Navigating to Workday application...');
    await page.goto(URL, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(5000); // Workday needs time to render
    
    let stepIdx = 0;
    
    // Step 0: Initial page (Apply options: Apply Manually, Autofill with Resume, etc.)
    allReports.push(await captureStep(page, 'Initial-Landing', stepIdx++));
    
    // Click "Apply Manually" to get to the Create Account / form flow
    const applyManuallyBtn = page.locator('[data-automation-id="applyManually"], button:has-text("Apply Manually"), a:has-text("Apply Manually")').first();
    if (await applyManuallyBtn.isVisible().catch(() => false)) {
      await applyManuallyBtn.click();
      await page.waitForTimeout(5000);
      allReports.push(await captureStep(page, 'Create-Account', stepIdx++));
      
      // Look for "Create Account" tab/button (if we're on sign-in vs create)
      const createAccountBtn = page.locator('text=Create Account').first();
      if (await createAccountBtn.isVisible().catch(() => false)) {
        await createAccountBtn.click();
        await page.waitForTimeout(4000);
        allReports.push(await captureStep(page, 'Create-Account-Form', stepIdx++));
      }
      
      // Try "Continue" to advance to My Information
      const continueBtn = page.locator('button:has-text("Continue"), button:has-text("Next"), [data-automation-id*="continue"], a:has-text("Continue")').first();
      if (await continueBtn.isVisible().catch(() => false)) {
        await continueBtn.click();
        await page.waitForTimeout(5000);
        allReports.push(await captureStep(page, 'My-Information', stepIdx++));
        
        // Try "Save and Continue" for My Experience
        const saveContinueBtn = page.locator('button:has-text("Save and Continue"), button:has-text("Save & Continue")').first();
        if (await saveContinueBtn.isVisible().catch(() => false)) {
          await saveContinueBtn.click();
          await page.waitForTimeout(5000);
          allReports.push(await captureStep(page, 'My-Experience', stepIdx++));
        }
      }
    }
    
    // Write combined report
    const combinedPath = join(OUTPUT_DIR, 'all-reports.json');
    writeFileSync(combinedPath, JSON.stringify(allReports, null, 2));
    console.log(`\nCombined report: ${combinedPath}`);
    
  } catch (err) {
    console.error('Error:', err.message);
    // Still try to capture current state
    try {
      const fallback = await captureStep(page, 'Fallback-Error', 99);
      allReports.push(fallback);
    } catch (e) {}
  } finally {
    await browser.close();
  }
  
  return allReports;
}

main().then(reports => {
  console.log('\n=== ALL JSON OUTPUT ===\n');
  reports.forEach((r, i) => {
    console.log(`\n--- STEP ${i}: ${r.stepName} ---`);
    console.log(JSON.stringify(r, null, 2));
  });
});
