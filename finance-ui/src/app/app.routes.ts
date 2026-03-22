import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'overview', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login').then(m => m.Login)
  },
  {
    path: 'signup',
    loadComponent: () => import('./pages/signup/signup').then(m => m.Signup)
  },
  {
    path: 'overview',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/overview/overview').then(m => m.Overview)
  },
  {
    path: 'transactions',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/transactions/transactions').then(m => m.Transactions)
  },
  {
    path: 'budgets',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/budgets/budgets').then(m => m.Budgets)
  },
  {
    path: 'pots',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/pots/pots').then(m => m.Pots)
  },
  {
    path: 'recurring-bills',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/recurring-bills/recurring-bills').then(m => m.RecurringBills)
  },
  { path: '**', redirectTo: 'overview' }
];