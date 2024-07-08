import { chromium, Page } from 'playwright';

async function testSQLInjection(page: Page, url: string, inputSelector: string, submitSelector: string) {
  await page.goto(url);
  await page.fill(inputSelector, "' OR '1'='1");
  await page.click(submitSelector);
  const content = await page.content();
  if (content.includes("error") || content.includes("syntax")) {
    console.log("Potential SQL Injection vulnerability detected.");
  } else {
    console.log("No SQL Injection vulnerability detected.");
  }
}

async function testXSS(page: Page, url: string, inputSelector: string, submitSelector: string) {
  await page.goto(url);
  const xssPayload = "<script>alert('XSS')</script>";
  await page.fill(inputSelector, xssPayload);
  await page.click(submitSelector);
  try {
    const alertText = await page.waitForEvent('dialog').then(dialog => {
      const message = dialog.message();
      dialog.dismiss();
      return message;
    });
    if (alertText === 'XSS') {
      console.log("Potential XSS vulnerability detected.");
    } else {
      console.log("No XSS vulnerability detected.");
    }
  } catch {
    console.log("No XSS vulnerability detected.");
  }
}

async function testCSRF(page: Page, url: string, csrfTokenSelector: string) {
  await page.goto(url);
  const csrfToken = await page.getAttribute(csrfTokenSelector, 'value');
  if (csrfToken) {
    console.log("CSRF token found. CSRF protection might be implemented.");
  } else {
    console.log("No CSRF token found. Potential CSRF vulnerability detected.");
  }
}

async function testOpenRedirect(page: Page, url: string, redirectParam: string) {
  const redirectUrl = `${url}?${redirectParam}=http://malicious.com`;
  await page.goto(redirectUrl);
  if (page.url() === 'http://malicious.com') {
    console.log("Potential Open Redirect vulnerability detected.");
  } else {
    console.log("No Open Redirect vulnerability detected.");
  }
}

async function testPathTraversal(page: Page, url: string, inputSelector: string, submitSelector: string) {
  await page.goto(url);
  await page.fill(inputSelector, "../../../../etc/passwd");
  await page.click(submitSelector);
  const content = await page.content();
  if (content.includes("root:") && content.includes("/bin/bash")) {
    console.log("Potential Path Traversal vulnerability detected.");
  } else {
    console.log("No Path Traversal vulnerability detected.");
  }
}

async function testCommandInjection(page: Page, url: string, inputSelector: string, submitSelector: string) {
  await page.goto(url);
  await page.fill(inputSelector, "test; ls -la");
  await page.click(submitSelector);
  const content = await page.content();
  if (content.includes("total") && content.includes("drwx")) {
    console.log("Potential Command Injection vulnerability detected.");
  } else {
    console.log("No Command Injection vulnerability detected.");
  }
}

async function testLDAPInjection(page: Page, url: string, inputSelector: string, submitSelector: string) {
  await page.goto(url);
  await page.fill(inputSelector, "*)(&)");
  await page.click(submitSelector);
  const content = await page.content();
  if (content.includes("ldap") && content.includes("error")) {
    console.log("Potential LDAP Injection vulnerability detected.");
  } else {
    console.log("No LDAP Injection vulnerability detected.");
  }
}

async function testHTTPHeaderInjection(page: Page, url: string) {
  await page.goto(url, {
    headers: {
      "Custom-Header": "value\r\nXInjected: Injected"
    }
  });
  const response = await page.waitForResponse(response => response.status() === 200);
  const headers = response.headers();
  if (headers['XInjected']) {
    console.log("Potential HTTP Header Injection vulnerability detected.");
  } else {
    console.log("No HTTP Header Injection vulnerability detected.");
  }
}

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  const url = 'http://example.com/form'; // Zamień na URL twojego formularza
  const inputSelector = '#input'; // Zamień na selektor twojego pola tekstowego
  const submitSelector = '#submit'; // Zamień na selektor twojego przycisku submit
  const csrfTokenSelector = 'input[name="csrf_token"]'; // Zamień na selektor pola CSRF tokena, jeśli jest
  const redirectParam = 'redirect'; // Zamień na nazwę parametru do testowania Open Redirect

  await testSQLInjection(page, url, inputSelector, submitSelector);
  await testXSS(page, url, inputSelector, submitSelector);
  await testCSRF(page, url, csrfTokenSelector);
  await testOpenRedirect(page, url, redirectParam);
  await testPathTraversal(page, url, inputSelector, submitSelector);
  await testCommandInjection(page, url, inputSelector, submitSelector);
  await testLDAPInjection(page, url, inputSelector, submitSelector);
  await testHTTPHeaderInjection(page, url);

  await browser.close();
})();
