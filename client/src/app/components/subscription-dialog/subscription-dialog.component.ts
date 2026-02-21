import { Component, inject, input, output, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { ExpenseService } from '../../services/expense.service';
import { Expense, SubscriptionGroup, SubscriptionExclusion } from '../../models/expense.model';

@Component({
  selector: 'app-subscription-dialog',
  imports: [FormsModule, CurrencyPipe, DatePipe],
  templateUrl: './subscription-dialog.component.html',
  styleUrl: './subscription-dialog.component.scss',
})
export class SubscriptionDialogComponent implements OnInit {
  private expenseService = inject(ExpenseService);

  year = input.required<number>();
  month = input<number | null>(null);

  closed = output<boolean>();

  groups = signal<SubscriptionGroup[]>([]);
  exclusions = signal<SubscriptionExclusion[]>([]);
  expandedKeys = signal<Set<string>>(new Set());
  loading = signal(false);
  dataChanged = false;

  // Editing state: which transaction is being excluded (by _id)
  editingTxnId = signal<string | null>(null);
  editingPattern = signal('');
  editingGroup = signal<SubscriptionGroup | null>(null);

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.loading.set(true);
    this.expenseService.getSubscriptionTransactions(this.year(), this.month()).subscribe({
      next: (groups) => {
        this.groups.set(groups);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
    this.expenseService.getSubscriptionExclusions().subscribe((exclusions) => {
      this.exclusions.set(exclusions);
    });
  }

  toggleExpand(key: string) {
    const current = new Set(this.expandedKeys());
    if (current.has(key)) {
      current.delete(key);
    } else {
      current.add(key);
    }
    this.expandedKeys.set(current);
  }

  isExpanded(key: string): boolean {
    return this.expandedKeys().has(key);
  }

  startExclude(txn: Expense, group: SubscriptionGroup) {
    this.editingTxnId.set(txn._id);
    this.editingPattern.set(txn.description);
    this.editingGroup.set(group);
  }

  cancelExclude() {
    this.editingTxnId.set(null);
    this.editingPattern.set('');
    this.editingGroup.set(null);
  }

  confirmExclude() {
    const pattern = this.editingPattern().trim();
    const group = this.editingGroup();
    if (!pattern || !group) return;

    this.expenseService.addSubscriptionExclusion(pattern, group.key, group.label).subscribe(() => {
      this.dataChanged = true;
      this.cancelExclude();
      this.loadData();
    });
  }

  reinclude(exclusion: SubscriptionExclusion) {
    this.expenseService.removeSubscriptionExclusion(exclusion._id).subscribe(() => {
      this.dataChanged = true;
      this.loadData();
    });
  }

  close() {
    this.closed.emit(this.dataChanged);
  }

  onBackdropClick(event: MouseEvent) {
    if ((event.target as HTMLElement).classList.contains('dialog-backdrop')) {
      this.close();
    }
  }
}
