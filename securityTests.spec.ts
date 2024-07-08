import { chromium, Page } from 'playwright';

async function testSQLInjection(page: Page, url: string, formSelector: string, inputSelector: string, submitSelector: string) {
  await page.goto(url);
  await page.fill(inputSelector, "' OR '1'='1");
  await page.click(submitSelector);
  // Tu można dodać logikę sprawdzającą wynik
  const content = await page.content();
  if (content.includes("error") || content.includes("syntax")) {
    console.log("Potential SQL Injection vulnerability detected.");
  } else {
    console.log("No SQL Injection vulnerability detected.");
  }
}

async function testXSS(page: Page, url: string, formSelector: string, inputSelector: string, submitSelector: string) {
  await page.goto(url);
  const xssPayload = "<script>alert('XSS')</script>";
  await page.fill(inputSelector, xssPayload);
  await page.click(submitSelector);
  // Sprawdzanie, czy payload został uruchomiony
  const alertText = await page.waitForEvent('dialog').then(dialog => dialog.message());
  if (alertText === 'XSS') {
    console.log("Potential XSS vulnerability detected.");
  } else {
    console.log("No XSS vulnerability detected.");
  }
}

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  const url = 'http://example.com/form'; // Zamień na URL twojego formularza
  const formSelector = '#form'; // Zamień na selektor twojego formularza
  const inputSelector = '#input'; // Zamień na selektor twojego pola tekstowego
  const submitSelector = '#submit'; // Zamień na selektor twojego przycisku submit

  await testSQLInjection(page, url, formSelector, inputSelector, submitSelector);
  await testXSS(page, url, formSelector, inputSelector, submitSelector);

  await browser.close();
})();
