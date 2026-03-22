import { Component, signal, inject, computed, effect, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgOptimizedImage } from '@angular/common';
import { OverviewService, OverviewData } from '../../core/services/overview.service';
import { ToastService } from '../../core/services/toast.service';

export interface DonutSegment { path: string; color: string; }

@Component({
  selector: 'app-overview',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, NgOptimizedImage],
  templateUrl: './overview.html',
  styleUrl: './overview.scss'
})
export class Overview {
  private overviewService = inject(OverviewService);
  private toast = inject(ToastService);

  data = signal<OverviewData | null>(null);
  loading = signal(true);
  error = signal(false);

  budgetTotal = computed(() => {
    const d = this.data();
    return d ? d.budgets.reduce((s, b) => s + b.max_amount, 0) : 0;
  });

  budgetSpent = computed(() => {
    const d = this.data();
    return d ? d.budgets.reduce((s, b) => s + b.spent, 0) : 0;
  });

  limitSegments = computed((): DonutSegment[] => {
    const d = this.data();
    if (!d) return [];
    return this.donutSegments(d.budgets.map(b => ({ value: b.max_amount, color: b.theme_color })), 33, 44, 0);
  });

  spentSegments = computed((): DonutSegment[] => {
    const d = this.data();
    if (!d) return [];
    return this.donutSegments(d.budgets.map(b => ({ value: b.max_amount, color: b.theme_color })), 27, 33, 0);
  });

  constructor() {
    this.overviewService.getOverview().subscribe({
      next: (data) => { this.data.set(data); this.loading.set(false); },
      error: () => { this.error.set(true); this.loading.set(false); }
    });
    effect(() => {
      if (!this.loading()) this.toast.announce('Overview loaded');
    });
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

  private donutSegments(
    items: { value: number; color: string }[],
    innerR: number, outerR: number,
    gapDeg = 1.5
  ): DonutSegment[] {
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


  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  }

  getProgressPercent(spent: number, max: number): number {
    if (!max) return 0;
    return Math.min((spent / max) * 100, 100);
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
