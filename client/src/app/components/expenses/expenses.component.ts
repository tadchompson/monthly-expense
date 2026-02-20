import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { ExpenseService } from '../../services/expense.service';
import { Expense } from '../../models/expense.model';

@Component({
  selector: 'app-expenses',
  imports: [FormsModule, CurrencyPipe, DatePipe],
  templateUrl: './expenses.component.html',
  styleUrl: './expenses.component.scss',
})
export class ExpensesComponent implements OnInit {
  private expenseService = inject(ExpenseService);

  expenses = signal<Expense[]>([]);
  selectedMonth = signal(new Date().getMonth() + 1);
  selectedYear = signal(new Date().getFullYear());

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
        this.loadExpenses();
      },
      error: () => this.loadExpenses(),
    });
  }

  loadExpenses() {
    this.expenseService
      .getExpenses(this.selectedMonth(), this.selectedYear())
      .subscribe((data) => this.expenses.set(data));
  }

  onFilterChange() {
    this.loadExpenses();
  }

  deleteExpense(id: string) {
    this.expenseService.deleteExpense(id).subscribe(() => {
      this.expenses.update((list) => list.filter((e) => e._id !== id));
    });
  }

  deleteAll() {
    if (!confirm('Delete ALL expenses? This cannot be undone.')) return;
    this.expenseService.deleteAll().subscribe(() => {
      this.expenses.set([]);
    });
  }
}
