import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-toast',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './toast.scss',
  template: `
    <div class="toast-container">
      @for (toast of toastSvc.toasts(); track toast.id) {
        <div
          class="toast"
          [class.toast--success]="toast.type === 'success'"
          [class.toast--error]="toast.type === 'error'"
          [attr.role]="toast.type === 'error' ? 'alert' : 'status'"
        >
          <span class="toast__message">{{ toast.message }}</span>
          <button
            class="toast__close"
            (click)="toastSvc.dismiss(toast.id)"
            aria-label="Dismiss notification"
          >✕</button>
        </div>
      }
    </div>
    <div class="sr-only" aria-live="polite" aria-atomic="true">{{ toastSvc.statusMessage() }}</div>
  `
})
export class Toast {
  readonly toastSvc = inject(ToastService);
}
