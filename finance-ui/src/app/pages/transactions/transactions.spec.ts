import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter, ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { Transactions } from './transactions';
import { TransactionsService } from '../../core/services/transactions.service';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';

const emptyResponse = of({ transactions: [], meta: { total: 0, page: 1, per_page: 25, total_pages: 1 } });

describe('Transactions', () => {
  let component: Transactions;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Transactions],
      providers: [
        provideHttpClient(),
        provideRouter([]),
        { provide: TransactionsService, useValue: { getTransactions: vi.fn().mockReturnValue(emptyResponse), deleteTransaction: vi.fn().mockReturnValue(of(undefined)), createTransaction: vi.fn().mockReturnValue(of({})) } },
        { provide: AuthService, useValue: { isDemo: () => false } },
        { provide: ToastService, useValue: { show: vi.fn(), announce: vi.fn() } },
        { provide: ActivatedRoute, useValue: { snapshot: { queryParamMap: { get: () => null } } } }
      ]
    }).compileComponents();

    component = TestBed.createComponent(Transactions).componentInstance;
  });

  afterEach(() => TestBed.resetTestingModule());

  describe('getPageNumbers()', () => {
    it('returns all pages when total ≤ 5', () => {
      component.totalPages.set(3);
      component.currentPage.set(1);
      expect(component.getPageNumbers()).toEqual([1, 2, 3]);
    });

    it('returns exactly 5 pages when total = 5', () => {
      component.totalPages.set(5);
      component.currentPage.set(1);
      expect(component.getPageNumbers()).toEqual([1, 2, 3, 4, 5]);
    });

    it('starts at page 1 when on the first pages', () => {
      component.totalPages.set(10);
      component.currentPage.set(1);
      expect(component.getPageNumbers()).toEqual([1, 2, 3, 4, 5]);
    });

    it('centres the window around the current page', () => {
      component.totalPages.set(10);
      component.currentPage.set(5);
      expect(component.getPageNumbers()).toEqual([3, 4, 5, 6, 7]);
    });

    it('ends at the last page when near the end', () => {
      component.totalPages.set(10);
      component.currentPage.set(10);
      expect(component.getPageNumbers()).toEqual([6, 7, 8, 9, 10]);
    });

    it('always returns at most 5 pages', () => {
      component.totalPages.set(20);
      for (let p = 1; p <= 20; p++) {
        component.currentPage.set(p);
        expect(component.getPageNumbers().length).toBeLessThanOrEqual(5);
      }
    });
  });

  describe('formErrors computed', () => {
    const blankForm = { type: 'expense' as const, name: '', amount: 0, category: 'General', recurring: false };

    it('reports both errors when name and amount are blank', () => {
      component.form.set(blankForm);
      const errors = component.formErrors();
      expect(errors.name).toBe('Name is required.');
      expect(errors.amount).toBe('Amount must be greater than zero.');
    });

    it('reports name error when name is whitespace only', () => {
      component.form.set({ ...blankForm, name: '   ', amount: 10 });
      expect(component.formErrors().name).toBe('Name is required.');
      expect(component.formErrors().amount).toBeUndefined();
    });

    it('reports amount error when amount is zero', () => {
      component.form.set({ ...blankForm, name: 'Coffee', amount: 0 });
      expect(component.formErrors().amount).toBe('Amount must be greater than zero.');
      expect(component.formErrors().name).toBeUndefined();
    });

    it('reports amount error when amount is negative', () => {
      component.form.set({ ...blankForm, name: 'Coffee', amount: -5 });
      expect(component.formErrors().amount).toBe('Amount must be greater than zero.');
    });

    it('returns no errors for a valid form', () => {
      component.form.set({ ...blankForm, name: 'Coffee', amount: 4.5 });
      expect(component.formErrors()).toEqual({});
    });
  });

  describe('formatDate()', () => {
    it('formats an ISO date string to readable format', () => {
      expect(component.formatDate('2025-01-15')).toBe('15 Jan 2025');
    });

    it('formats end-of-year date correctly', () => {
      expect(component.formatDate('2024-12-31')).toBe('31 Dec 2024');
    });
  });
});
