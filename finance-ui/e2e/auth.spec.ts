import { test, expect } from '@playwright/test';
import { loginAsDemo, signUpAs, signOut } from './helpers/auth';

test.describe('Authentication', () => {
  test('redirects unauthenticated users to login', async ({ page }) => {
    await page.goto('/overview');
    await expect(page).toHaveURL(/\/login/);
  });

  test('demo login lands on overview', async ({ page }) => {
    await loginAsDemo(page);
    await expect(page).toHaveURL(/\/overview/);
    await expect(page.getByRole('heading', { name: 'Overview' })).toBeVisible();
  });

  test('demo user cannot mutate data', async ({ page }) => {
    await loginAsDemo(page);
    await page.goto('/budgets');
    await page.getByRole('button', { name: '+ Add New Budget' }).click();
    await expect(page.getByText('Demo account is view-only')).toBeVisible();
  });

  test('invalid credentials show an error', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('Email').fill('nobody@example.com');
    await page.getByLabel('Password', { exact: true }).fill('wrongpassword');
    await page.getByRole('button', { name: 'Login' }).click();
    await expect(page.locator('.auth-card__error')).toBeVisible();
    await expect(page.locator('.auth-card__error')).toContainText('Invalid');
  });

  test('signup creates an account and lands on overview', async ({ page }) => {
    await signUpAs(page);
    await expect(page).toHaveURL(/\/overview/);
  });

  test('sign out redirects to login', async ({ page }) => {
    await signUpAs(page);
    await signOut(page);
    await expect(page).toHaveURL(/\/login/);
  });

  test('cannot access protected routes after signing out', async ({ page }) => {
    await signUpAs(page);
    await signOut(page);
    await page.goto('/budgets');
    await expect(page).toHaveURL(/\/login/);
  });
});
