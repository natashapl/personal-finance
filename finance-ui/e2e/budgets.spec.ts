import { test, expect } from '@playwright/test';
import { signUpAs } from './helpers/auth';

test.describe('Budgets', () => {
  test.beforeEach(async ({ page }) => {
    await signUpAs(page);
    await page.goto('/budgets');
    await expect(page.getByRole('heading', { name: 'Budgets' })).toBeVisible();
  });

  test('shows the budgets page', async ({ page }) => {
    await expect(page.getByRole('button', { name: '+ Add New Budget' })).toBeVisible();
  });

  test('can add a budget', async ({ page }) => {
    await page.getByRole('button', { name: '+ Add New Budget' }).click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();

    await dialog.getByLabel('Maximum Spend').fill('300');
    await dialog.getByRole('button', { name: 'Add Budget' }).click();

    await expect(page.getByRole('status')).toContainText('Budget added');
    await expect(dialog).not.toBeVisible();
  });

  test('can edit a budget', async ({ page }) => {
    // Add one first so we have something to edit
    await page.getByRole('button', { name: '+ Add New Budget' }).click();
    await page.getByRole('dialog').getByLabel('Maximum Spend').fill('100');
    await page.getByRole('dialog').getByRole('button', { name: 'Add Budget' }).click();
    await expect(page.getByRole('status')).toContainText('Budget added');

    // Open its ellipsis menu and click Edit
    const card = page.locator('.budget-card').last();
    await card.getByRole('button', { name: /Options for/ }).click();
    await page.getByRole('menuitem', { name: 'Edit Budget' }).click();

    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await dialog.getByLabel('Maximum Spend').fill('250');
    await dialog.getByRole('button', { name: 'Save Changes' }).click();

    // Use filter so a still-visible "Budget added" toast doesn't interfere
    await expect(page.getByRole('status').filter({ hasText: 'Budget updated' })).toBeVisible();
  });

  test('can delete a budget', async ({ page }) => {
    // Add one to delete
    await page.getByRole('button', { name: '+ Add New Budget' }).click();
    await page.getByRole('dialog').getByLabel('Maximum Spend').fill('50');
    await page.getByRole('dialog').getByRole('button', { name: 'Add Budget' }).click();
    await expect(page.getByRole('status')).toContainText('Budget added');

    const card = page.locator('.budget-card').last();
    await card.getByRole('button', { name: /Options for/ }).click();
    await page.getByRole('menuitem', { name: 'Delete Budget' }).click();

    const confirm = page.getByRole('alertdialog');
    await expect(confirm).toBeVisible();
    await confirm.getByRole('button', { name: 'Yes, Confirm Deletion' }).click();

    // Use filter so a still-visible "Budget added" toast doesn't interfere
    await expect(page.getByRole('status').filter({ hasText: 'Budget deleted' })).toBeVisible();
  });

  test('closing the modal without saving makes no changes', async ({ page }) => {
    await page.getByRole('button', { name: '+ Add New Budget' }).click();
    await page.getByRole('dialog').getByRole('button', { name: 'Close' }).click();
    await expect(page.getByRole('dialog')).not.toBeVisible();
    await expect(page.getByRole('status')).not.toBeVisible();
  });
});
