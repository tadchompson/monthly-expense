import { Component, computed, effect, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ExpenseService } from '../../services/expense.service';
import { ManualEntry } from '../../models/expense.model';

@Component({
  selector: 'app-upload',
  imports: [FormsModule],
  templateUrl: './upload.component.html',
  styleUrl: './upload.component.scss',
})
export class UploadComponent {
  private expenseService = inject(ExpenseService);

  // CSV upload state
  selectedFile = signal<File | null>(null);
  uploading = signal(false);
  message = signal('');
  error = signal(false);

  // Manual entry state
  manualCategory = signal('Paycheck');
  manualDescription = signal('');
  manualAmount = signal<number | null>(null);
  manualMonth = signal(new Date().getMonth() + 1);
  manualYear = signal(new Date().getFullYear());
  manualSubmitting = signal(false);
  manualMessage = signal('');
  manualError = signal(false);

  useCustomDescription = signal(false);

  private monthNames = [
    '', 'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  descriptionOptions = computed<string[]>(() => {
    const cat = this.manualCategory();
    const month = this.manualMonth();
    switch (cat) {
      case 'Paycheck': return ['Biweekly Paycheck'];
      case 'Transfer': return ['Mom Amazon Transfer'];
      case 'Rent': return [`${this.monthNames[month]} Rent`];
      case 'Utilities': return [`${this.monthNames[month]} Utilities`];
      default: return [];
    }
  });

  constructor() {
    // Reset description when category changes
    effect(() => {
      this.manualCategory(); // track
      this.manualDescription.set('');
      this.useCustomDescription.set(false);
    });
  }

  categories = [
    { label: 'Paycheck', type: 'income' as const },
    { label: 'Transfer', type: 'income' as const },
    { label: 'Rent', type: 'expense' as const },
    { label: 'Utilities', type: 'expense' as const },
  ];

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

  years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i);

  switchToCustomDescription() {
    this.useCustomDescription.set(true);
    this.manualDescription.set('');
  }

  onFileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    this.selectedFile.set(input.files?.[0] ?? null);
    this.message.set('');
  }

  upload() {
    const file = this.selectedFile();
    if (!file) return;

    this.uploading.set(true);
    this.message.set('');

    this.expenseService.upload(file).subscribe({
      next: (res) => {
        this.message.set(res.message);
        this.error.set(false);
        this.uploading.set(false);
        this.selectedFile.set(null);
      },
      error: (err) => {
        this.message.set(err.error?.error ?? 'Upload failed');
        this.error.set(true);
        this.uploading.set(false);
      },
    });
  }

  submitManualEntry() {
    const amount = this.manualAmount();
    if (!this.manualDescription() || amount == null || amount <= 0) return;

    const cat = this.categories.find((c) => c.label === this.manualCategory());
    const entry: ManualEntry = {
      type: cat?.type ?? 'expense',
      category: this.manualCategory(),
      description: this.manualDescription(),
      amount,
      month: this.manualMonth(),
      year: this.manualYear(),
    };

    this.manualSubmitting.set(true);
    this.manualMessage.set('');

    this.expenseService.addManualEntry(entry).subscribe({
      next: (res) => {
        this.manualMessage.set(res.message);
        this.manualError.set(false);
        this.manualSubmitting.set(false);
        this.manualDescription.set('');
        this.manualAmount.set(null);
      },
      error: (err) => {
        this.manualMessage.set(err.error?.error ?? 'Failed to add entry');
        this.manualError.set(true);
        this.manualSubmitting.set(false);
      },
    });
  }
}
