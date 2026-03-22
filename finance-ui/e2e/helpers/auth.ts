import { type Page } from '@playwright/test';

export async function loginAsDemo(page: Page) {
  await page.goto('/login');
  await page.getByRole('button', { name: 'View Demo' }).click();
  await page.waitForURL('**/overview');
}

/** Creates a fresh account via the signup UI and lands on /overview already logged in. */
export async function signUpAs(page: Page): Promise<{ email: string; password: string }> {
  const email = `test-${Date.now()}@finance-test.com`;
  const password = 'testpass123';
  await page.goto('/signup');
  await page.getByLabel('Name').fill('Test User');
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Create Password').fill(password);
  await page.getByRole('button', { name: 'Create Account' }).click();
  await page.waitForURL('**/overview');
  return { email, password };
}

export async function loginAs(page: Page, email: string, password: string) {
  await page.goto('/login');
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password').fill(password);
  await page.getByRole('button', { name: 'Login' }).click();
  await page.waitForURL('**/overview');
}

export async function signOut(page: Page) {
  await page.getByRole('button', { name: 'Sign out' }).click();
  await page.waitForURL('**/login');
}
