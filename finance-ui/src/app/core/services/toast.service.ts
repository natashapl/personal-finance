import { Injectable, signal } from '@angular/core';

export type ToastType = 'success' | 'error';

export interface Toast {
  id: number;
  type: ToastType;
  message: string;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private counter = 0;

  readonly toasts = signal<Toast[]>([]);
  readonly statusMessage = signal('');

  show(type: ToastType, message: string): void {
    const id = ++this.counter;
    this.toasts.update(ts => [...ts, { id, type, message }]);
    setTimeout(() => this.dismiss(id), 4000);
  }

  dismiss(id: number): void {
    this.toasts.update(ts => ts.filter(t => t.id !== id));
  }

  announce(message: string): void {
    this.statusMessage.set(message);
    setTimeout(() => this.statusMessage.set(''), 100);
  }
}
