import { Component, signal, inject, computed, effect, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { NgOptimizedImage } from '@angular/common';
import { TransactionsService, Transaction } from '../../core/services/transactions.service';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { FocusTrapDirective } from '../../core/directives/focus-trap.directive';
import { parseServerErrors } from '../../core/utils/parse-server-errors';

interface NewTransactionForm {
  type: 'income' | 'expense';
  name: string;
  amount: number;
  category: string;
  recurring: boolean;
}

@Component({
  selector: 'app-transactions',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, NgOptimizedImage, RouterLink, FocusTrapDirective],
  templateUrl: './transactions.html',
  styleUrl: './transactions.scss'
})
export class Transactions {
  private svc = inject(TransactionsService);
  private route = inject(ActivatedRoute);
  private toast = inject(ToastService);
  auth = inject(AuthService);

  transactions = signal<Transaction[]>([]);
  loading = signal(true);
  currentPage = signal(1);
  totalPages = signal(1);
  total = signal(0);
  search = signal('');
  category = signal('');
  sort = signal('latest');

  // New transaction modal
  showForm = signal(false);
  saving = signal(false);
  formTouched = signal(false);
  form = signal<NewTransactionForm>({
    type: 'expense',
    name: '',
    amount: 0,
    category: 'General',
    recurring: false
  });

  // Delete modal
  activeMenuId = signal<number | null>(null);
  deletingId = signal<number | null>(null);
  deletingName = signal('');
  showDeleteConfirm = signal(false);

  formErrors = computed(() => {
    const f = this.form();
    const errors: { name?: string; amount?: string } = {};
    if (!f.name.trim()) errors.name = 'Name is required.';
    if (f.amount <= 0) errors.amount = 'Amount must be greater than zero.';
    return errors;
  });

  readonly formCategories = [
    'Entertainment', 'Bills', 'Groceries',
    'Dining Out', 'Transportation', 'Personal Care',
    'Education', 'Lifestyle', 'Shopping', 'General'
  ];

  readonly categories = [
    'All Transactions', 'Entertainment', 'Bills', 'Groceries',
    'Dining Out', 'Transportation', 'Personal Care',
    'Education', 'Lifestyle', 'Shopping', 'General'
  ];

  readonly sortOptions = [
    { value: 'latest',  label: 'Latest' },
    { value: 'oldest',  label: 'Oldest' },
    { value: 'a_to_z',  label: 'A to Z' },
    { value: 'z_to_a',  label: 'Z to A' },
    { value: 'highest', label: 'Highest' },
    { value: 'lowest',  label: 'Lowest' }
  ];

  constructor() {
    const cat = this.route.snapshot.queryParamMap.get('category');
    if (cat) this.category.set(cat);
    this.load();
    effect(() => {
      if (!this.loading()) this.toast.announce('Transactions loaded');
    });
  }

  load() {
    this.loading.set(true);
    const cat = this.category() === 'All Transactions' ? '' : this.category();
    this.svc.getTransactions(this.currentPage(), this.search(), cat, this.sort()).subscribe({
      next: (res) => {
        this.transactions.set(res.transactions);
        this.totalPages.set(res.meta.total_pages);
        this.total.set(res.meta.total);
        this.loading.set(false);
      },
      error: (err) => {
        this.loading.set(false);
        this.toast.show('error', parseServerErrors(err).general);
      }
    });
  }

  onSearch() { this.currentPage.set(1); this.load(); }
  onFilterChange() { this.currentPage.set(1); this.load(); }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
      this.load();
    }
  }

  getPageNumbers(): number[] {
    const total = this.totalPages();
    const cur = this.currentPage();
    const pages: number[] = [];
    if (total <= 5) {
      for (let i = 1; i <= total; i++) pages.push(i);
    } else {
      let start = Math.max(1, cur - 2);
      let end = Math.min(total, start + 4);
      start = Math.max(1, end - 4);
      for (let i = start; i <= end; i++) pages.push(i);
    }
    return pages;
  }

  // ── New transaction modal ──────────────────────────────────────────────────

  openAdd() {
    this.form.set({ type: 'expense', name: '', amount: 0, category: 'General', recurring: false });
    this.formTouched.set(false);
    this.showForm.set(true);
  }

  closeForm() { this.showForm.set(false); }

  save() {
    this.formTouched.set(true);
    if (Object.keys(this.formErrors()).length > 0) return;

    const f = this.form();
    const today = new Date();
    const dateStr = today.toISOString().split('T')[0];
    const signedAmount = f.type === 'income' ? Math.abs(f.amount) : -Math.abs(f.amount);

    this.saving.set(true);
    this.svc.createTransaction({
      name: f.name.trim(),
      amount: signedAmount,
      category: f.category,
      date: dateStr,
      recurring: f.recurring,
      avatar: ''
    }).subscribe({
      next: () => {
        this.saving.set(false);
        this.showForm.set(false);
        this.toast.show('success', 'Transaction added.');
        this.currentPage.set(1);
        this.load();
      },
      error: (err) => {
        this.saving.set(false);
        this.toast.show('error', parseServerErrors(err).general);
      }
    });
  }

  // ── Delete ─────────────────────────────────────────────────────────────────

  toggleMenu(id: number) {
    this.activeMenuId.update(cur => cur === id ? null : id);
  }

  openDeleteTxn(t: Transaction) {
    this.deletingId.set(t.id);
    this.deletingName.set(t.name);
    this.showDeleteConfirm.set(true);
    this.activeMenuId.set(null);
  }

  doDeleteTxn() {
    if (this.auth.isDemo()) return;
    const id = this.deletingId();
    if (!id) return;
    this.svc.deleteTransaction(id).subscribe({
      next: () => {
        this.showDeleteConfirm.set(false);
        this.toast.show('success', 'Transaction deleted.');
        this.load();
      },
      error: (err) => {
        this.toast.show('error', parseServerErrors(err).general);
      }
    });
  }

  // ── Helpers ────────────────────────────────────────────────────────────────

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

  formatDate(dateStr: string): string {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  }
}
