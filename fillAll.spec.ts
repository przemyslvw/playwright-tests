import { test, expect, Page } from '@playwright/test';

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

async function fillInputField(page: Page, inputField: ElementHandle<Element>, fieldName: string, inputType: string | null) {
  switch (inputType) {
    case 'text':
    case null:
      await inputField.fill(formData[fieldName] as string);
      break;
    case 'email':
      await inputField.fill(formData.email as string);
      break;
    case 'checkbox':
      const checked = formData[fieldName] as boolean;
      const isChecked = await inputField.isChecked();
      if (checked !== isChecked) {
        await inputField.check();
      }
      break;
    case 'radio':
      if (formData[fieldName] === await inputField.getAttribute('value')) {
        await inputField.check();
      }
      break;
  }
}

async function fillTextArea(page: Page, textarea: ElementHandle<Element>, fieldName: string) {
  if (formData[fieldName]) {
    await textarea.fill(formData[fieldName] as string);
  }
}

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

    await fillInputField(page, inputField, fieldName, inputType);
  }

  // Wypełnij wszystkie pola textarea
  const textareas = await page.$$('textarea');
  for (const textarea of textareas) {
    const fieldName = await textarea.getAttribute('name');
    if (fieldName) {
      await fillTextArea(page, textarea, fieldName);
    }
  }

  // Sprawdź, czy formularz został prawidłowo wypełniony
  for (const key in formData) {
    const fieldValue = formData[key];
    const inputField = await page.$(`[name="${key}"]`);

    if (typeof fieldValue === 'string') {
      expect(await inputField?.inputValue()).toBe(fieldValue);
    } else if (typeof fieldValue === 'boolean') {
      expect(await inputField?.isChecked()).toBe(fieldValue);
    }
  }
});