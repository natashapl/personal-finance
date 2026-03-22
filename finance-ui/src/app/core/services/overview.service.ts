import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Transaction {
  id: number;
  name: string;
  amount: number;
  category: string;
  date: string;
  avatar: string;
  recurring: boolean;
}

export interface Budget {
  id: number;
  category: string;
  max_amount: number;
  theme_color: string;
  spent: number;
}

export interface Pot {
  id: number;
  name: string;
  target_amount: number;
  saved_amount: number;
  theme_color: string;
}

export interface OverviewData {
  balance: { current: number; income: number; expenses: number };
  latest_transactions: Transaction[];
  budgets: Budget[];
  pots: { total_saved: number; pots: Pot[] };
  recurring_bills: { paid: number; upcoming: number; due_soon: number };
}

@Injectable({ providedIn: 'root' })
export class OverviewService {
  private http = inject(HttpClient);

  getOverview(): Observable<OverviewData> {
    return this.http.get<OverviewData>(`${environment.apiUrl}/overview`);
  }
}
