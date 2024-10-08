import { test, expect } from '@playwright/test';

// Typ do przechowywania wartości formularza
interface FormData {
  [key: string]: string | boolean;
}

// Przykładowe dane do uzupełniania formularza
const formData: FormData = {
  username: 'JanKowalski',
  email: 'jan.kowalski@example.com',
  description: 'To jest przykładowa wiadomość.',
  agree: true,
  gender: 'male',
};

test('Powinno wypełnić wszystkie pola formularza', async ({ page }) => {
  // Przejdź na stronę z formularzem
  await page.goto('https://example.com/form');

  // Wyszukaj wszystkie pola input oraz textarea
  const inputFields = await page.$$('input, textarea');

  // Iteruj przez każde pole input i textarea
  for (const inputField of inputFields) {
    const inputType = await inputField.getAttribute('type');
    const fieldName = await inputField.getAttribute('name');

    if (!fieldName) continue;

    // Obsłuż tekstowe pola input
    if (inputType === 'text' || inputType === null) {
      await inputField.fill(formData[fieldName] as string);
    }

    // Obsłuż pole email
    if (inputType === 'email') {
      await inputField.fill(formData.email as string);
    }

    // Obsłuż checkboxy
    if (inputType === 'checkbox') {
      const checked = formData[fieldName] as boolean;
      const isChecked = await inputField.isChecked();
      if (checked !== isChecked) {
        await inputField.check();
      }
    }

    // Obsłuż przyciski radiowe
    if (inputType === 'radio') {
      if (formData[fieldName] === await inputField.getAttribute('value')) {
        await inputField.check();
      }
    }
  }

  // Wypełnij wszystkie pola textarea
  const textareas = await page.$$('textarea');
  for (const textarea of textareas) {
    const fieldName = await textarea.getAttribute('name');
    if (fieldName && formData[fieldName]) {
      await textarea.fill(formData[fieldName] as string);
    }
  }

  // Sprawdź, czy formularz został prawidłowo wypełniony
  for (const key in formData) {
    const fieldValue = formData[key];
    if (typeof fieldValue === 'string') {
      const inputField = await page.$(`[name="${key}"]`);
      expect(await inputField?.inputValue()).toBe(fieldValue);
    } else if (typeof fieldValue === 'boolean') {
      const checkboxField = await page.$(`[name="${key}"]`);
      expect(await checkboxField?.isChecked()).toBe(fieldValue);
    }
  }
});