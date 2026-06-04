import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { of } from 'rxjs';
import { Pots } from './pots';
import { PotsService, Pot } from '../../core/services/pots.service';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';

const makePot = (overrides: Partial<Pot> = {}): Pot => ({
  id: 1, name: 'Vacation', target_amount: 1000, saved_amount: 200, theme_color: '#277C78',
  ...overrides
});

describe('Pots', () => {
  let component: Pots;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Pots],
      providers: [
        provideHttpClient(),
        { provide: PotsService, useValue: { getPots: vi.fn().mockReturnValue(of([])), createPot: vi.fn().mockReturnValue(of({})), updatePot: vi.fn().mockReturnValue(of({})), deletePot: vi.fn().mockReturnValue(of(undefined)), addMoney: vi.fn().mockReturnValue(of({})), withdrawMoney: vi.fn().mockReturnValue(of({})) } },
        { provide: AuthService, useValue: { isDemo: () => false } },
        { provide: ToastService, useValue: { show: vi.fn(), announce: vi.fn() } }
      ]
    }).compileComponents();

    component = TestBed.createComponent(Pots).componentInstance;
  });

  afterEach(() => TestBed.resetTestingModule());

  describe('getProgressPercent()', () => {
    it('returns 0 when nothing is saved', () => {
      expect(component.getProgressPercent(0, 100)).toBe(0);
    });

    it('returns 50 when half the target is saved', () => {
      expect(component.getProgressPercent(50, 100)).toBe(50);
    });

    it('returns 100 when target is fully met', () => {
      expect(component.getProgressPercent(100, 100)).toBe(100);
    });

    it('caps at 100 when saved exceeds target', () => {
      expect(component.getProgressPercent(150, 100)).toBe(100);
    });

    it('returns 0 when target is 0 (division guard)', () => {
      expect(component.getProgressPercent(0, 0)).toBe(0);
    });
  });

  describe('getNewPercent()', () => {
    const pot = makePot({ saved_amount: 50, target_amount: 100 });

    it('returns current percent when amount is 0', () => {
      component.moneyAmount.set(0);
      component.moneyAction.set('add');
      expect(component.getNewPercent(pot)).toBe(50);
    });

    it('returns increased percent after adding money', () => {
      component.moneyAmount.set(25);
      component.moneyAction.set('add');
      expect(component.getNewPercent(pot)).toBe(75);
    });

    it('returns decreased percent after withdrawing money', () => {
      component.moneyAmount.set(25);
      component.moneyAction.set('withdraw');
      expect(component.getNewPercent(pot)).toBe(25);
    });

    it('clamps to 0 when withdrawal exceeds saved amount', () => {
      component.moneyAmount.set(200);
      component.moneyAction.set('withdraw');
      expect(component.getNewPercent(pot)).toBe(0);
    });

    it('clamps to 100 when adding pushes beyond target', () => {
      component.moneyAmount.set(200);
      component.moneyAction.set('add');
      expect(component.getNewPercent(pot)).toBe(100);
    });
  });

  describe('moneyErrors computed', () => {
    const pot = makePot({ saved_amount: 30, target_amount: 100 });

    beforeEach(() => component.activePot.set(pot));

    it('reports error when amount is 0', () => {
      component.moneyAmount.set(0);
      expect(component.moneyErrors().amount).toBe('Amount must be greater than zero.');
    });

    it('reports error when amount is negative', () => {
      component.moneyAmount.set(-10);
      expect(component.moneyErrors().amount).toBe('Amount must be greater than zero.');
    });

    it('returns no error when adding any positive amount', () => {
      component.moneyAmount.set(500);
      component.moneyAction.set('add');
      expect(component.moneyErrors()).toEqual({});
    });

    it('returns no error when withdrawing up to saved amount', () => {
      component.moneyAmount.set(30);
      component.moneyAction.set('withdraw');
      expect(component.moneyErrors()).toEqual({});
    });

    it('reports error when withdrawing more than saved amount', () => {
      component.moneyAmount.set(31);
      component.moneyAction.set('withdraw');
      expect(component.moneyErrors().amount).toContain('Cannot withdraw more than');
      expect(component.moneyErrors().amount).toContain('$30.00');
    });
  });

  describe('formErrors computed', () => {
    const blankForm = { name: '', target_amount: 0, theme_color: '#277C78' };

    it('reports both errors on a blank form', () => {
      component.form.set(blankForm);
      expect(component.formErrors().name).toBe('Pot name is required.');
      expect(component.formErrors().target_amount).toBe('Target amount must be greater than zero.');
    });

    it('reports name error when name is whitespace only', () => {
      component.form.set({ ...blankForm, name: '   ', target_amount: 100 });
      expect(component.formErrors().name).toBe('Pot name is required.');
      expect(component.formErrors().target_amount).toBeUndefined();
    });

    it('reports target_amount error when amount is zero', () => {
      component.form.set({ ...blankForm, name: 'Vacation', target_amount: 0 });
      expect(component.formErrors().target_amount).toBe('Target amount must be greater than zero.');
      expect(component.formErrors().name).toBeUndefined();
    });

    it('returns no errors for a valid form', () => {
      component.form.set({ name: 'Vacation', target_amount: 500, theme_color: '#277C78' });
      expect(component.formErrors()).toEqual({});
    });
  });

  describe('totalSaved computed', () => {
    it('sums saved_amount across all pots', () => {
      component.pots.set([
        makePot({ id: 1, saved_amount: 100 }),
        makePot({ id: 2, saved_amount: 250 }),
        makePot({ id: 3, saved_amount: 50 }),
      ]);
      expect(component.totalSaved()).toBe(400);
    });

    it('returns 0 when pots list is empty', () => {
      component.pots.set([]);
      expect(component.totalSaved()).toBe(0);
    });
  });
});
