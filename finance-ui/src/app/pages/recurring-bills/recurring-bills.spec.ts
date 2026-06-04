import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { RecurringBills } from './recurring-bills';
import { TransactionsService, RecurringBill } from '../../core/services/transactions.service';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';

const makeBill = (overrides: Partial<RecurringBill> = {}): RecurringBill => ({
  id: 1, name: 'Netflix', amount: -15.99, category: 'Entertainment',
  date: '2025-01-05', avatar: '', recurring: true,
  paid: false, due_soon: false, day_of_month: 5,
  ...overrides
});

describe('RecurringBills', () => {
  let component: RecurringBills;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecurringBills],
      providers: [
        provideHttpClient(),
        provideRouter([]),
        { provide: TransactionsService, useValue: { getRecurringBills: vi.fn().mockReturnValue(of([])), deleteTransaction: vi.fn().mockReturnValue(of(undefined)) } },
        { provide: AuthService, useValue: { isDemo: () => false } },
        { provide: ToastService, useValue: { show: vi.fn(), announce: vi.fn() } }
      ]
    }).compileComponents();

    component = TestBed.createComponent(RecurringBills).componentInstance;
  });

  afterEach(() => TestBed.resetTestingModule());

  describe('getDayOrdinal()', () => {
    it.each([
      [1,  '1st'],  [2,  '2nd'],  [3,  '3rd'],  [4,  '4th'],
      [11, '11th'], [12, '12th'], [13, '13th'],
      [21, '21st'], [22, '22nd'], [23, '23rd'], [31, '31st']
    ])('day %i → "%s"', (day, expected) => {
      expect(component.getDayOrdinal(day)).toBe(expected);
    });
  });

  describe('formatCurrency()', () => {
    it('formats a positive amount', () => expect(component.formatCurrency(25.5)).toBe('$25.50'));
    it('formats a negative amount as its absolute value', () => expect(component.formatCurrency(-50)).toBe('$50.00'));
    it('formats zero', () => expect(component.formatCurrency(0)).toBe('$0.00'));
    it('includes commas for large amounts', () => expect(component.formatCurrency(1500)).toBe('$1,500.00'));
  });

  describe('computed totals', () => {
    beforeEach(() => {
      component.bills.set([
        makeBill({ id: 1, amount: -15.99, paid: true,  due_soon: false }),
        makeBill({ id: 2, amount: -9.99,  paid: false, due_soon: true  }),
        makeBill({ id: 3, amount: -30,    paid: false, due_soon: false }),
      ]);
    });

    it('totalBills sums all absolute amounts', () => expect(component.totalBills()).toBeCloseTo(55.98));
    it('paidTotal sums only paid bills',       () => expect(component.paidTotal()).toBeCloseTo(15.99));
    it('upcomingTotal sums only unpaid bills', () => expect(component.upcomingTotal()).toBeCloseTo(39.99));
    it('dueSoonTotal sums only due_soon bills',() => expect(component.dueSoonTotal()).toBeCloseTo(9.99));

    it('all totals are 0 when bills list is empty', () => {
      component.bills.set([]);
      expect(component.totalBills()).toBe(0);
      expect(component.paidTotal()).toBe(0);
      expect(component.upcomingTotal()).toBe(0);
      expect(component.dueSoonTotal()).toBe(0);
    });
  });
});
