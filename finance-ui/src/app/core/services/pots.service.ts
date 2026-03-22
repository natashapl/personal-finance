import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Pot {
  id: number;
  name: string;
  target_amount: number;
  saved_amount: number;
  theme_color: string;
}

@Injectable({ providedIn: 'root' })
export class PotsService {
  private http = inject(HttpClient);
  private url = `${environment.apiUrl}/pots`;

  getPots(): Observable<Pot[]> {
    return this.http.get<Pot[]>(this.url);
  }

  createPot(pot: Partial<Pot>): Observable<Pot> {
    return this.http.post<Pot>(this.url, { pot });
  }

  updatePot(id: number, pot: Partial<Pot>): Observable<Pot> {
    return this.http.patch<Pot>(`${this.url}/${id}`, { pot });
  }

  addMoney(id: number, amount: number): Observable<Pot> {
    return this.http.patch<Pot>(`${this.url}/${id}`, { add_amount: amount });
  }

  withdrawMoney(id: number, amount: number): Observable<Pot> {
    return this.http.patch<Pot>(`${this.url}/${id}`, { withdraw_amount: amount });
  }

  deletePot(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}
