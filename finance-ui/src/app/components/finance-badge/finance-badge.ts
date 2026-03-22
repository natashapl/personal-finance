import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('finance-badge')
export class FinanceBadge extends LitElement {

  declare status: string;
  declare label: string;

  static override properties = {
    status: { type: String },
    label: { type: String }
  };

  constructor() {
    super();
    this.status = 'on-track';
    this.label = '';
  }

  static override styles = css`
    :host { display: inline-block; }

    .badge {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 4px 10px;
      border-radius: 20px;
      font-size: 11px;
      font-weight: 600;
      font-family: 'Public Sans', sans-serif;
      letter-spacing: 0.02em;
    }

    .badge--on-track {
      background: #e8f5e9;
      color: #277c78;
    }

    .badge--over-budget {
      background: #fdecea;
      color: #c94736;
    }

    .badge--warning {
      background: #fff8e1;
      color: #b8860b;
    }

    .dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: currentColor;
    }
  `;

  override render() {
    const text = this.label || this.getDefaultLabel();
    return html`
      <span class="badge badge--${this.status}">
        <span class="dot"></span>
        ${text}
      </span>
    `;
  }

  private getDefaultLabel(): string {
    switch (this.status) {
      case 'on-track': return 'On Track';
      case 'over-budget': return 'Over Budget';
      case 'warning': return 'Warning';
      default: return '';
    }
  }
}