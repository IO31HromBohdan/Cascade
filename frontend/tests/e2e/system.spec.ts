import { test, expect } from '@playwright/test';

test('create task via UI', async ({ page }) => {
  await page.goto('/');
  await page.getByTestId('add-task').click();
  await page.getByTestId('task-title').fill('E2E task');
  await page.getByTestId('task-description').fill('created by playwright');
  await page.getByTestId('task-save').click();
  await expect(page.getByText('E2E task').first()).toBeVisible();
});

test('task persists after reload', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText('E2E task').first()).toBeVisible();
});
