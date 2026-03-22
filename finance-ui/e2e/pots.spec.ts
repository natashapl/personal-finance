import { test, expect } from '@playwright/test';
import { signUpAs } from './helpers/auth';

test.describe('Pots', () => {
  test.beforeEach(async ({ page }) => {
    await signUpAs(page);
    await page.goto('/pots');
    await expect(page.getByRole('heading', { name: 'Pots' })).toBeVisible();
    // Wait for initial GET /api/pots to complete so no stale responses interfere with later waitForResponse calls
    await expect(page.locator('.empty-state')).toBeVisible();
  });

  test('shows the pots page', async ({ page }) => {
    await expect(page.getByRole('button', { name: '+ Add New Pot' })).toBeVisible();
  });

  test('can create a pot', async ({ page }) => {
    await page.getByRole('button', { name: '+ Add New Pot' }).click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();

    await dialog.getByLabel('Pot Name').fill('Holiday Fund');
    await dialog.getByLabel('Target Amount').fill('1500');
    await dialog.getByRole('button', { name: 'Add Pot' }).click();

    await expect(page.getByRole('status')).toContainText('Pot created');
    await expect(page.getByText('Holiday Fund')).toBeVisible();
  });

  test('can add money to a pot', async ({ page }) => {
    // Create a pot first
    await page.getByRole('button', { name: '+ Add New Pot' }).click();
    await page.getByRole('dialog').getByLabel('Pot Name').fill('Add Money Pot');
    await page.getByRole('dialog').getByLabel('Target Amount').fill('500');
    await page.getByRole('dialog').getByRole('button', { name: 'Add Pot' }).click();
    await expect(page.getByRole('status')).toContainText('Pot created');

    // Click + Add Money on the new pot
    const pot = page.locator('.pot-card', { hasText: 'Add Money Pot' });
    await pot.getByRole('button', { name: '+ Add Money' }).click();

    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await dialog.getByLabel(/Amount to Add/i).fill('100');
    await dialog.getByRole('button', { name: 'Confirm Addition' }).click();

    // Use filter so a still-visible "Pot created" toast doesn't interfere
    await expect(page.getByRole('status').filter({ hasText: 'Money added to pot' })).toBeVisible();
  });

  test('can withdraw money from a pot', async ({ page }) => {
    // Create a pot
    await page.getByRole('button', { name: '+ Add New Pot' }).click();
    await page.getByRole('dialog').getByLabel('Pot Name').fill('Withdraw Pot');
    await page.getByRole('dialog').getByLabel('Target Amount').fill('500');
    await page.getByRole('dialog').getByRole('button', { name: 'Add Pot' }).click();
    await expect(page.getByRole('status').filter({ hasText: 'Pot created' })).toBeVisible();

    // Add money — auto-wait on the button ensures pot card is visible (loading done) before clicking
    const pot = page.locator('.pot-card', { hasText: 'Withdraw Pot' });
    await pot.getByRole('button', { name: '+ Add Money' }).click();
    await page.getByRole('dialog').getByLabel(/Amount to Add/i).fill('200');
    await page.getByRole('dialog').getByRole('button', { name: 'Confirm Addition' }).click();
    await expect(page.getByRole('status').filter({ hasText: 'Money added to pot' })).toBeVisible();

    // Wait for pot card to reappear after the reload triggered by add-money
    await expect(pot).toBeVisible();
    await pot.getByRole('button', { name: 'Withdraw', exact: true }).click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await dialog.getByLabel(/Amount to Withdraw/i).fill('50');
    await dialog.getByRole('button', { name: 'Confirm Withdrawal' }).click();

    await expect(page.getByRole('status').filter({ hasText: 'Money withdrawn from pot' })).toBeVisible();
  });

  test('withdraw rejects amount exceeding saved balance', async ({ page }) => {
    await page.getByRole('button', { name: '+ Add New Pot' }).click();
    await page.getByRole('dialog').getByLabel('Pot Name').fill('Empty Pot');
    await page.getByRole('dialog').getByLabel('Target Amount').fill('500');
    await page.getByRole('dialog').getByRole('button', { name: 'Add Pot' }).click();
    await expect(page.getByRole('status')).toContainText('Pot created');

    const pot = page.locator('.pot-card', { hasText: 'Empty Pot' });
    await pot.getByRole('button', { name: 'Withdraw', exact: true }).click();
    await page.getByRole('dialog').getByLabel(/Amount to Withdraw/i).fill('9999');
    await page.getByRole('dialog').getByRole('button', { name: 'Confirm Withdrawal' }).click();

    await expect(page.getByRole('alert')).toContainText('Cannot withdraw more than');
  });

  test('can delete a pot', async ({ page }) => {
    await page.getByRole('button', { name: '+ Add New Pot' }).click();
    await page.getByRole('dialog').getByLabel('Pot Name').fill('Delete Me');
    await page.getByRole('dialog').getByLabel('Target Amount').fill('100');
    await page.getByRole('dialog').getByRole('button', { name: 'Add Pot' }).click();
    await expect(page.getByRole('status')).toContainText('Pot created');

    const pot = page.locator('.pot-card', { hasText: 'Delete Me' });
    await pot.getByRole('button', { name: /Options for/ }).click();
    await page.getByRole('menuitem', { name: 'Delete Pot' }).click();

    const confirm = page.getByRole('alertdialog');
    await confirm.getByRole('button', { name: 'Yes, Confirm Deletion' }).click();

    // Use filter so a still-visible "Pot created" toast doesn't interfere
    await expect(page.getByRole('status').filter({ hasText: 'Pot deleted' })).toBeVisible();
    await expect(page.getByText('Delete Me')).not.toBeVisible();
  });
});
