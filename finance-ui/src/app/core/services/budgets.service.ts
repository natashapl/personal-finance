import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Budget {
  id: number;
  category: string;
  max_amount: number;
  theme_color: string;
  spent: number;
  latest_transactions: {
    id: number;
    name: string;
    amount: number;
    date: string;
    avatar: string;
    category: string;
  }[];
}

@Injectable({ providedIn: 'root' })
export class BudgetsService {
  private http = inject(HttpClient);
  private url = `${environment.apiUrl}/budgets`;

  getBudgets(): Observable<Budget[]> {
    return this.http.get<Budget[]>(this.url);
  }

  createBudget(budget: Partial<Budget>): Observable<Budget> {
    return this.http.post<Budget>(this.url, { budget });
  }

  updateBudget(id: number, budget: Partial<Budget>): Observable<Budget> {
    return this.http.patch<Budget>(`${this.url}/${id}`, { budget });
  }

  deleteBudget(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}
