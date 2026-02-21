import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Expense, CategorySummary, UploadResponse, DashboardData, ManualEntry, SubscriptionGroup, SubscriptionExclusion } from '../models/expense.model';

@Injectable({ providedIn: 'root' })
export class ExpenseService {
  private http = inject(HttpClient);
  private base = '/api/expenses';

  upload(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<UploadResponse>(`${this.base}/upload`, formData);
  }

  addManualEntry(entry: ManualEntry) {
    return this.http.post<{ message: string; expense: Expense }>(`${this.base}/manual`, entry);
  }

  getExpenses(month?: number, year?: number) {
    let params = new HttpParams();
    if (month) params = params.set('month', month);
    if (year) params = params.set('year', year);
    return this.http.get<Expense[]>(this.base, { params });
  }

  getSummary(month?: number, year?: number) {
    let params = new HttpParams();
    if (month) params = params.set('month', month);
    if (year) params = params.set('year', year);
    return this.http.get<CategorySummary[]>(`${this.base}/summary`, { params });
  }

  deleteExpense(id: string) {
    return this.http.delete<{ message: string }>(`${this.base}/${id}`);
  }

  deleteAll() {
    return this.http.delete<{ message: string }>(this.base);
  }

  getDashboard(year: number, month?: number | null) {
    let params = new HttpParams().set('year', year);
    if (month) params = params.set('month', month);
    return this.http.get<DashboardData>(`${this.base}/dashboard`, { params });
  }

  getYears() {
    return this.http.get<number[]>(`${this.base}/years`);
  }

  getLatestPeriod() {
    return this.http.get<{ month: number; year: number }>(`${this.base}/latest-period`);
  }

  // Subscription endpoints
  private subBase = '/api/subscriptions';

  getSubscriptionTransactions(year: number, month?: number | null) {
    let params = new HttpParams().set('year', year);
    if (month) params = params.set('month', month);
    return this.http.get<SubscriptionGroup[]>(`${this.subBase}/transactions`, { params });
  }

  getSubscriptionExclusions() {
    return this.http.get<SubscriptionExclusion[]>(`${this.subBase}/exclusions`);
  }

  addSubscriptionExclusion(description: string, patternKey: string, label: string) {
    return this.http.post<SubscriptionExclusion>(`${this.subBase}/exclusions`, { description, patternKey, label });
  }

  removeSubscriptionExclusion(id: string) {
    return this.http.delete<{ message: string }>(`${this.subBase}/exclusions/${id}`);
  }
}
