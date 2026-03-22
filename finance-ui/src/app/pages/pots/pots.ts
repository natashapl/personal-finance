import { Component, signal, inject, computed, effect, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgOptimizedImage } from '@angular/common';
import { PotsService, Pot } from '../../core/services/pots.service';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { FocusTrapDirective } from '../../core/directives/focus-trap.directive';
import { parseServerErrors } from '../../core/utils/parse-server-errors';
import { THEME_COLORS } from '../budgets/budgets';

type ModalType = 'add-edit' | 'money' | 'delete' | null;

@Component({
  selector: 'app-pots',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, NgOptimizedImage, FocusTrapDirective],
  templateUrl: './pots.html',
  styleUrl: './pots.scss'
})
export class Pots {
  private svc = inject(PotsService);
  private toast = inject(ToastService);
  readonly auth = inject(AuthService);

  pots = signal<Pot[]>([]);
  loading = signal(true);
  activeModal = signal<ModalType>(null);
  editingPot = signal<Pot | null>(null);
  activePot = signal<Pot | null>(null);
  moneyAction = signal<'add' | 'withdraw'>('add');
  moneyAmount = signal(0);
  activeMenuId = signal<number | null>(null);

  readonly colors = THEME_COLORS;
  form = signal({ name: '', target_amount: 0, theme_color: '#277C78' });
  formTouched = signal(false);
  moneyTouched = signal(false);
  totalSaved = computed(() => this.pots().reduce((s, p) => s + p.saved_amount, 0));

  formErrors = computed(() => {
    const f = this.form();
    const errors: { name?: string; target_amount?: string } = {};
    if (!f.name.trim()) errors.name = 'Pot name is required.';
    if (!f.target_amount || f.target_amount <= 0) errors.target_amount = 'Target amount must be greater than zero.';
    return errors;
  });

  moneyErrors = computed(() => {
    const amount = this.moneyAmount();
    const pot = this.activePot();
    const errors: { amount?: string } = {};
    if (!amount || amount <= 0) {
      errors.amount = 'Amount must be greater than zero.';
    } else if (this.moneyAction() === 'withdraw' && pot && amount > pot.saved_amount) {
      errors.amount = `Cannot withdraw more than the saved amount (${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(pot.saved_amount)}).`;
    }
    return errors;
  });

  constructor() {
    this.load();
    effect(() => {
      if (!this.loading()) this.toast.announce('Pots loaded');
    });
  }

  load() {
    this.loading.set(true);
    this.svc.getPots().subscribe({
      next: (data) => { this.pots.set(data); this.loading.set(false); },
      error: (err) => {
        this.loading.set(false);
        this.toast.show('error', parseServerErrors(err).general);
      }
    });
  }

  openAdd() {
    this.editingPot.set(null);
    this.form.set({ name: '', target_amount: 0, theme_color: '#277C78' });
    this.formTouched.set(false);
    this.activeModal.set('add-edit');
    this.activeMenuId.set(null);
  }

  openEdit(p: Pot) {
    this.editingPot.set(p);
    this.form.set({ name: p.name, target_amount: p.target_amount, theme_color: p.theme_color });
    this.formTouched.set(false);
    this.activeModal.set('add-edit');
    this.activeMenuId.set(null);
  }

  savePot() {
    this.formTouched.set(true);
    if (Object.keys(this.formErrors()).length > 0) return;
    const editing = this.editingPot();
    const obs = editing
      ? this.svc.updatePot(editing.id, this.form())
      : this.svc.createPot(this.form());
    obs.subscribe({
      next: () => {
        this.activeModal.set(null);
        this.toast.show('success', editing ? 'Pot updated.' : 'Pot created.');
        this.load();
      },
      error: (err) => {
        this.toast.show('error', parseServerErrors(err).general);
      }
    });
  }

  openMoney(p: Pot, action: 'add' | 'withdraw') {
    this.activePot.set(p);
    this.moneyAction.set(action);
    this.moneyAmount.set(0);
    this.moneyTouched.set(false);
    this.activeModal.set('money');
    this.activeMenuId.set(null);
  }

  confirmMoney() {
    this.moneyTouched.set(true);
    if (Object.keys(this.moneyErrors()).length > 0) return;
    const pot = this.activePot()!;
    const amount = this.moneyAmount();
    const action = this.moneyAction();
    const obs = action === 'add'
      ? this.svc.addMoney(pot.id, amount)
      : this.svc.withdrawMoney(pot.id, amount);
    obs.subscribe({
      next: () => {
        this.activeModal.set(null);
        this.toast.show('success', action === 'add' ? 'Money added to pot.' : 'Money withdrawn from pot.');
        this.load();
      },
      error: (err) => {
        this.toast.show('error', parseServerErrors(err).general);
      }
    });
  }

  openDelete(p: Pot) {
    this.activePot.set(p);
    this.activeModal.set('delete');
    this.activeMenuId.set(null);
  }

  doDelete() {
    const pot = this.activePot();
    if (!pot) return;
    this.svc.deletePot(pot.id).subscribe({
      next: () => {
        this.activeModal.set(null);
        this.toast.show('success', 'Pot deleted.');
        this.load();
      },
      error: (err) => {
        this.toast.show('error', parseServerErrors(err).general);
      }
    });
  }

  toggleMenu(id: number) {
    this.activeMenuId.update(cur => cur === id ? null : id);
  }

  close() { this.activeModal.set(null); this.formTouched.set(false); this.moneyTouched.set(false); }

  getProgressPercent(saved: number, target: number): number {
    if (!target) return 0;
    return Math.min((saved / target) * 100, 100);
  }

  getNewPercent(pot: Pot): number {
    const amount = this.moneyAmount();
    if (!amount) return this.getProgressPercent(pot.saved_amount, pot.target_amount);
    const newSaved = this.moneyAction() === 'add'
      ? pot.saved_amount + amount
      : pot.saved_amount - amount;
    return this.getProgressPercent(Math.max(0, newSaved), pot.target_amount);
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  }
}
