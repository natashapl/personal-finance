import { Component, signal, inject, computed, effect, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { NgOptimizedImage } from '@angular/common';
import { TransactionsService, RecurringBill } from '../../core/services/transactions.service';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { FocusTrapDirective } from '../../core/directives/focus-trap.directive';
import { parseServerErrors } from '../../core/utils/parse-server-errors';

@Component({
  selector: 'app-recurring-bills',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, NgOptimizedImage, RouterLink, FocusTrapDirective],
  templateUrl: './recurring-bills.html',
  styleUrl: './recurring-bills.scss'
})
export class RecurringBills {
  private svc = inject(TransactionsService);
  private toast = inject(ToastService);
  readonly auth = inject(AuthService);

  bills = signal<RecurringBill[]>([]);
  loading = signal(true);
  search = signal('');
  sort = signal('latest');
  activeMenuId = signal<number | null>(null);
  deletingId = signal<number | null>(null);
  deletingName = signal('');
  showDeleteConfirm = signal(false);

  readonly sortOptions = [
    { value: 'latest',  label: 'Latest' },
    { value: 'oldest',  label: 'Oldest' },
    { value: 'a_to_z',  label: 'A to Z' },
    { value: 'z_to_a',  label: 'Z to A' },
    { value: 'highest', label: 'Highest' },
    { value: 'lowest',  label: 'Lowest' }
  ];

  totalBills = computed(() => this.bills().reduce((s, b) => s + Math.abs(b.amount), 0));
  paidTotal  = computed(() => this.bills().filter(b => b.paid).reduce((s, b) => s + Math.abs(b.amount), 0));
  upcomingTotal = computed(() => this.bills().filter(b => !b.paid).reduce((s, b) => s + Math.abs(b.amount), 0));
  dueSoonTotal  = computed(() => this.bills().filter(b => b.due_soon).reduce((s, b) => s + Math.abs(b.amount), 0));

  constructor() {
    this.load();
    effect(() => {
      if (!this.loading()) this.toast.announce('Recurring bills loaded');
    });
  }

  load() {
    this.loading.set(true);
    this.svc.getRecurringBills(this.search(), this.sort()).subscribe({
      next: (data) => { this.bills.set(data); this.loading.set(false); },
      error: (err) => {
        this.loading.set(false);
        this.toast.show('error', parseServerErrors(err).general);
      }
    });
  }

  onSearch() { this.load(); }
  onSortChange() { this.load(); }

  toggleMenu(id: number) {
    this.activeMenuId.update(cur => cur === id ? null : id);
  }

  openDelete(b: RecurringBill) {
    this.deletingId.set(b.id);
    this.deletingName.set(b.name);
    this.showDeleteConfirm.set(true);
    this.activeMenuId.set(null);
  }

  doDelete() {
    if (this.auth.isDemo()) return;
    const id = this.deletingId();
    if (!id) return;
    this.svc.deleteTransaction(id).subscribe({
      next: () => {
        this.showDeleteConfirm.set(false);
        this.toast.show('success', 'Bill deleted.');
        this.load();
      },
      error: (err) => {
        this.toast.show('error', parseServerErrors(err).general);
      }
    });
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Math.abs(amount));
  }

  getAvatarPath(avatar: string): string {
    if (!avatar) return '/assets/images/avatars/placeholder.svg';
    return `/assets/images/avatars/${avatar}`;
  }

  onAvatarError(event: Event): void {
    (event.target as HTMLImageElement).src = '/assets/images/avatars/placeholder.svg';
  }

  getDayOrdinal(day: number): string {
    const s = ['th', 'st', 'nd', 'rd'];
    const v = day % 100;
    return day + (s[(v - 20) % 10] || s[v] || s[0]);
  }
}
