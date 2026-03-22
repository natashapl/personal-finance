import { Component, signal, inject, computed, effect, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { NgOptimizedImage } from '@angular/common';
import { BudgetsService, Budget } from '../../core/services/budgets.service';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { FocusTrapDirective } from '../../core/directives/focus-trap.directive';
import { parseServerErrors } from '../../core/utils/parse-server-errors';

export const THEME_COLORS = [
  { label: 'Green',      value: '#277C78' },
  { label: 'Yellow',     value: '#F2CDAC' },
  { label: 'Cyan',       value: '#82C9D7' },
  { label: 'Navy',       value: '#626070' },
  { label: 'Red',        value: '#C94736' },
  { label: 'Purple',     value: '#826CB0' },
  { label: 'Turquoise',  value: '#597C7C' },
  { label: 'Brown',      value: '#93674F' },
  { label: 'Magenta',    value: '#934F6F' },
  { label: 'Blue',       value: '#3F82B2' },
  { label: 'Navy Grey',  value: '#97A0AC' },
  { label: 'Army Green', value: '#7F9161' },
  { label: 'Gold',       value: '#CAB361' },
  { label: 'Orange',     value: '#BE6C49' }
];

export const BUDGET_CATEGORIES = [
  'Entertainment', 'Bills', 'Groceries', 'Dining Out',
  'Transportation', 'Personal Care', 'Education',
  'Lifestyle', 'Shopping', 'General'
];

@Component({
  selector: 'app-budgets',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, RouterLink, NgOptimizedImage, FocusTrapDirective],
  templateUrl: './budgets.html',
  styleUrl: './budgets.scss'
})
export class Budgets {
  private svc = inject(BudgetsService);
  private toast = inject(ToastService);
  readonly auth = inject(AuthService);

  budgets = signal<Budget[]>([]);
  loading = signal(true);
  showForm = signal(false);
  showDeleteConfirm = signal(false);
  editingBudget = signal<Budget | null>(null);
  deletingId = signal<number | null>(null);
  activeMenuId = signal<number | null>(null);

  readonly colors = THEME_COLORS;
  readonly categories = BUDGET_CATEGORIES;

  form = signal({
    category: 'Entertainment',
    max_amount: 0,
    theme_color: '#277C78'
  });
  formTouched = signal(false);

  formErrors = computed(() => {
    const f = this.form();
    const errors: { max_amount?: string } = {};
    if (!f.max_amount || f.max_amount <= 0) errors.max_amount = 'Maximum spend must be greater than zero.';
    return errors;
  });

  totalLimit = computed(() => this.budgets().reduce((s, b) => s + b.max_amount, 0));
  totalSpent = computed(() => this.budgets().reduce((s, b) => s + b.spent, 0));

  limitSegments = computed(() =>
    this.donutSegments(this.budgets().map(b => ({ value: b.max_amount, color: b.theme_color })), 33, 44, 0)
  );
  spentSegments = computed(() =>
    this.donutSegments(this.budgets().map(b => ({ value: b.max_amount, color: b.theme_color })), 27, 33, 0)
  );

  constructor() {
    this.load();
    effect(() => {
      if (!this.loading()) this.toast.announce('Budgets loaded');
    });
  }

  load() {
    this.loading.set(true);
    this.svc.getBudgets().subscribe({
      next: (data) => { this.budgets.set(data); this.loading.set(false); },
      error: (err) => {
        this.loading.set(false);
        this.toast.show('error', parseServerErrors(err).general);
      }
    });
  }

  openAdd() {
    this.editingBudget.set(null);
    this.form.set({ category: 'Entertainment', max_amount: 0, theme_color: '#277C78' });
    this.formTouched.set(false);
    this.showForm.set(true);
    this.activeMenuId.set(null);
  }

  openEdit(b: Budget) {
    this.editingBudget.set(b);
    this.form.set({ category: b.category, max_amount: b.max_amount, theme_color: b.theme_color });
    this.formTouched.set(false);
    this.showForm.set(true);
    this.activeMenuId.set(null);
  }

  save() {
    this.formTouched.set(true);
    if (Object.keys(this.formErrors()).length > 0) return;

    const editing = this.editingBudget();
    const obs = editing
      ? this.svc.updateBudget(editing.id, this.form())
      : this.svc.createBudget(this.form());

    obs.subscribe({
      next: () => {
        this.showForm.set(false);
        this.toast.show('success', editing ? 'Budget updated.' : 'Budget added.');
        this.load();
      },
      error: (err) => {
        this.toast.show('error', parseServerErrors(err).general);
      }
    });
  }

  confirmDelete(id: number) {
    this.deletingId.set(id);
    this.showDeleteConfirm.set(true);
    this.activeMenuId.set(null);
  }

  doDelete() {
    const id = this.deletingId();
    if (!id) return;
    this.svc.deleteBudget(id).subscribe({
      next: () => {
        this.showDeleteConfirm.set(false);
        this.toast.show('success', 'Budget deleted.');
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

  closeForm() { this.showForm.set(false); this.formTouched.set(false); }
  closeDelete() { this.showDeleteConfirm.set(false); }

  getProgressPercent(spent: number, max: number): number {
    if (!max) return 0;
    return Math.min((spent / max) * 100, 100);
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  }

  getAvatarPath(avatar: string): string {
    if (!avatar) return '/assets/images/avatars/placeholder.svg';
    return `/assets/images/avatars/${avatar}`;
  }

  onAvatarError(event: Event): void {
    (event.target as HTMLImageElement).src = '/assets/images/avatars/placeholder.svg';
  }

  getColorLabel(value: string): string {
    return this.colors.find(c => c.value === value)?.label ?? value;
  }

  formatDate(dateStr: string): string {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  private polarToXY(angleDeg: number, r: number): [number, number] {
    const rad = (angleDeg - 90) * Math.PI / 180;
    return [50 + r * Math.cos(rad), 50 + r * Math.sin(rad)];
  }

  private arcPath(startDeg: number, endDeg: number, innerR: number, outerR: number): string {
    if (endDeg - startDeg >= 360) endDeg = startDeg + 359.99;
    const large = endDeg - startDeg > 180 ? 1 : 0;
    const [ox1, oy1] = this.polarToXY(startDeg, outerR);
    const [ox2, oy2] = this.polarToXY(endDeg, outerR);
    const [ix2, iy2] = this.polarToXY(endDeg, innerR);
    const [ix1, iy1] = this.polarToXY(startDeg, innerR);
    return `M${ox1},${oy1} A${outerR},${outerR} 0 ${large} 1 ${ox2},${oy2} L${ix2},${iy2} A${innerR},${innerR} 0 ${large} 0 ${ix1},${iy1} Z`;
  }

  donutSegments(items: { value: number; color: string }[], innerR: number, outerR: number, gapDeg = 1.5): { path: string; color: string }[] {
    const total = items.reduce((s, i) => s + i.value, 0);
    if (!total) return [];
    let angle = 0;
    return items.map(item => {
      const sweep = (item.value / total) * 360;
      const seg = { path: this.arcPath(angle + gapDeg / 2, angle + sweep - gapDeg / 2, innerR, outerR), color: item.color };
      angle += sweep;
      return seg;
    });
  }
}
