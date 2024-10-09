import { test, expect } from '@playwright/test';

test('powinien załadować stronę lub zwrócić timeout', async ({ page }) => {
  // Funkcja do załadowania strony
  const loadPage = async () => {
    await page.goto('https://example.com');
    return 'Strona załadowana';
  };

  // Funkcja, która zwróci timeout po określonym czasie (np. 5 sekund)
  const timeout = (ms: number) => new Promise<string>((_, reject) => {
    setTimeout(() => reject(new Error('Czas ładowania strony przekroczony')), ms);
  });

  // Promise.race - uruchomienie obu obietnic jednocześnie
  try {
    const result = await Promise.race([loadPage(), timeout(5000)]);
    console.log(result); // Jeśli strona załaduje się w czasie, to tu zobaczymy "Strona załadowana"
  } catch (error) {
    console.error(error); // Jeśli przekroczono czas, to tu wyświetli się błąd "Czas ładowania strony przekroczony"
  }
  
  // Sprawdzenie, czy strona jest faktycznie załadowana
  const title = await page.title();
  expect(title).toBe('Example Domain'); // Zmieniamy na tytuł rzeczywistej strony, którą testujemy
});