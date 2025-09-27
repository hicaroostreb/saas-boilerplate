import { test, expect } from '@playwright/test';

test('debug page structure', async ({ page }) => {
  await page.goto('/auth/sign-up');
  
  // Descobrir todos os elementos de título
  const titles = await page.locator('h1, h2, h3, h4, h5, h6, [class*="title"], [class*="heading"]').all();
  console.log('Títulos encontrados:', titles.length);
  
  for (let i = 0; i < titles.length; i++) {
    const text = await titles[i].textContent();
    const tagName = await titles[i].evaluate(el => el.tagName);
    console.log(`${i + 1}. ${tagName}: "${text}"`);
  }
  
  // Descobrir estrutura dos campos
  const inputs = await page.locator('input').all();
  console.log('\nCampos encontrados:', inputs.length);
  
  for (let i = 0; i < inputs.length; i++) {
    const name = await inputs[i].getAttribute('name');
    const type = await inputs[i].getAttribute('type');
    const id = await inputs[i].getAttribute('id');
    console.log(`${i + 1}. name="${name}" type="${type}" id="${id}"`);
  }
});
