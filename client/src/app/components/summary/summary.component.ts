import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CurrencyPipe } from '@angular/common';
import { ExpenseService } from '../../services/expense.service';
import { CategorySummary } from '../../models/expense.model';

@Component({
  selector: 'app-summary',
  imports: [FormsModule, CurrencyPipe],
  templateUrl: './summary.component.html',
  styleUrl: './summary.component.scss',
})
export class SummaryComponent implements OnInit {
  private expenseService = inject(ExpenseService);

  summary = signal<CategorySummary[]>([]);
  selectedMonth = signal(new Date().getMonth() + 1);
  selectedYear = signal(new Date().getFullYear());

  grandTotal = computed(() =>
    this.summary().reduce((sum, cat) => sum + cat.total, 0)
  );

  months = [
    { value: 1, label: 'January' },
    { value: 2, label: 'February' },
    { value: 3, label: 'March' },
    { value: 4, label: 'April' },
    { value: 5, label: 'May' },
    { value: 6, label: 'June' },
    { value: 7, label: 'July' },
    { value: 8, label: 'August' },
    { value: 9, label: 'September' },
    { value: 10, label: 'October' },
    { value: 11, label: 'November' },
    { value: 12, label: 'December' },
  ];

  years: number[] = [];

  ngOnInit() {
    const currentYear = new Date().getFullYear();
    for (let y = currentYear; y >= currentYear - 5; y--) {
      this.years.push(y);
    }
    this.expenseService.getLatestPeriod().subscribe({
      next: ({ month, year }) => {
        this.selectedMonth.set(month);
        this.selectedYear.set(year);
        if (!this.years.includes(year)) {
          this.years.unshift(year);
        }
        this.loadSummary();
      },
      error: () => this.loadSummary(),
    });
  }

  loadSummary() {
    this.expenseService
      .getSummary(this.selectedMonth(), this.selectedYear())
      .subscribe((data) => this.summary.set(data));
  }

  onFilterChange() {
    this.loadSummary();
  }
}
