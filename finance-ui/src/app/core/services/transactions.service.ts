import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
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

export interface RecurringBill extends Transaction {
  paid: boolean;
  due_soon: boolean;
  day_of_month: number;
}

export interface TransactionResponse {
  transactions: Transaction[];
  meta: { total: number; page: number; per_page: number; total_pages: number };
}

@Injectable({ providedIn: 'root' })
export class TransactionsService {
  private http = inject(HttpClient);
  private url = `${environment.apiUrl}/transactions`;

  getTransactions(page = 1, search = '', category = '', sort = 'latest'): Observable<TransactionResponse> {
    let params = new HttpParams().set('page', page).set('sort', sort);
    if (search) params = params.set('search', search);
    if (category) params = params.set('category', category);
    return this.http.get<TransactionResponse>(this.url, { params });
  }

  getRecurringBills(search = '', sort = 'latest'): Observable<RecurringBill[]> {
    let params = new HttpParams().set('sort', sort);
    if (search) params = params.set('search', search);
    return this.http.get<RecurringBill[]>(`${this.url}/recurring`, { params });
  }

  deleteTransaction(id: number): import('rxjs').Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }

  createTransaction(payload: {
    name: string;
    amount: number;
    category: string;
    date: string;
    recurring: boolean;
    avatar: string;
  }): Observable<Transaction> {
    return this.http.post<Transaction>(this.url, { transaction: payload });
  }
}
