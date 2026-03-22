import { test, expect } from '@playwright/test';
import { loginAsDemo, signUpAs } from './helpers/auth';

test.describe('Transactions — demo data', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsDemo(page);
    await page.goto('/transactions');
    await expect(page.getByRole('heading', { name: 'Transactions' })).toBeVisible();
  });

  test('shows the transactions list', async ({ page }) => {
    await expect(page.locator('.txn-row').first()).toBeVisible();
  });

  test('search filters results', async ({ page }) => {
    await expect(page.locator('.txn-row').first()).toBeVisible();
    await Promise.all([
      page.waitForResponse(r => r.url().includes('/api/transactions') && r.url().includes('Emma')),
      page.getByLabel('Search transactions').fill('Emma'),
    ]);
    await expect(page.locator('.txn-row').first()).toBeVisible();
    const names = page.locator('.txn-row__name');
    for (const name of await names.all()) {
      await expect(name).toContainText('Emma');
    }
  });

  test('category filter narrows results', async ({ page }) => {
    await page.getByLabel('Category').selectOption('Entertainment');
    await expect(page.locator('.txn-row__category').first()).toContainText('Entertainment');
  });

  test('pagination controls are present for large lists', async ({ page }) => {
    await expect(page.getByRole('navigation', { name: 'Transaction pages' })).toBeVisible();
  });
});

test.describe('Transactions — mutations', () => {
  test.beforeEach(async ({ page }) => {
    await signUpAs(page);
    await page.goto('/transactions');
  });

  test('can add a transaction', async ({ page }) => {
    await page.getByRole('button', { name: '+ New Transaction' }).click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();

    await dialog.getByLabel(/Recipient/i).fill('Coffee Shop');
    await dialog.getByLabel('Amount').fill('4.50');
    await dialog.getByRole('button', { name: 'Add Transaction' }).click();

    await expect(page.getByRole('status')).toContainText('Transaction added');
    await expect(dialog).not.toBeVisible();
    await expect(page.getByText('Coffee Shop')).toBeVisible();
  });

  test('form validation rejects empty name', async ({ page }) => {
    await page.getByRole('button', { name: '+ New Transaction' }).click();
    await page.getByRole('dialog').getByLabel('Amount').fill('10');
    await page.getByRole('dialog').getByRole('button', { name: 'Add Transaction' }).click();
    await expect(page.getByRole('alert').first()).toContainText('Name is required');
  });

  test('can delete a transaction', async ({ page }) => {
    // Add one first
    await page.getByRole('button', { name: '+ New Transaction' }).click();
    await page.getByRole('dialog').getByLabel(/Recipient/i).fill('To Delete');
    await page.getByRole('dialog').getByLabel('Amount').fill('1');
    await page.getByRole('dialog').getByRole('button', { name: 'Add Transaction' }).click();
    await expect(page.getByRole('status')).toContainText('Transaction added');

    // Open its menu and delete
    const row = page.locator('.txn-row', { hasText: 'To Delete' }).first();
    await row.getByRole('button', { name: /Options for/ }).click();
    await page.getByRole('menuitem', { name: 'Delete Transaction' }).click();

    const confirm = page.getByRole('alertdialog');
    await confirm.getByRole('button', { name: 'Yes, Confirm Deletion' }).click();

    // Use filter so a still-visible "Transaction added" toast doesn't interfere
    await expect(page.getByRole('status').filter({ hasText: 'Transaction deleted' })).toBeVisible();
    await expect(page.locator('.txn-row', { hasText: 'To Delete' })).not.toBeVisible();
  });
});
