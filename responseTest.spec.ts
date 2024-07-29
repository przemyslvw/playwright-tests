import { test, expect } from '@playwright/test';

test('submit form and check response status', async ({ page }) => {
  // Przejdź do strony z formularzem
  await page.goto('https://example.com/form-page');

  // Wypełnij formularz (przykładowe pola formularza)
  await page.fill('#input-name', 'Jan Kowalski');
  await page.fill('#input-email', 'jan.kowalski@example.com');
  await page.fill('#input-message', 'To jest przykładowa wiadomość.');

  // Przechwyć żądanie wysyłki formularza
  const [response] = await Promise.all([
    page.waitForResponse(response => response.url().includes('/submit-form') && response.status() === 200),
    page.click('button[type="submit"]'),  // Kliknięcie przycisku wysyłania formularza
  ]);

  // Sprawdź status odpowiedzi
  expect(response.status()).toBe(200);

  // Dodatkowe sprawdzenie np. treści odpowiedzi, jeśli jest potrzebne
  const responseBody = await response.json();
  expect(responseBody).toHaveProperty('success', true);
});