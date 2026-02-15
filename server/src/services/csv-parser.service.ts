import { parse } from 'csv-parse/sync';

export interface ParsedExpense {
  date: string;
  description: string;
  amount: number;
  merchant: string;
  category: string;
}

export function parseCsv(csvContent: string): ParsedExpense[] {
  const records = parse(csvContent, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  });

  return records
    .map((record: Record<string, string>) => {
      // Common CSV column name mappings — adjust as needed for your credit card format
      const date = record['Date'] || record['Transaction Date'] || record['date'] || '';
      const description =
        record['Description'] || record['Transaction Description'] || record['description'] || '';
      const rawAmount = parseFloat(
        record['Amount'] || record['Debit'] || record['amount'] || '0'
      );
      const merchant = record['Merchant'] || record['Name'] || record['merchant'] || description;
      const category = record['Category'] || record['category'] || 'Uncategorized';

      return { date, description, amount: rawAmount, merchant, category };
    })
    .filter((expense: ParsedExpense) => {
      // Chase CSVs: negative = purchases, positive = payments/credits. Skip payments.
      return expense.amount < 0;
    })
    .map((expense: ParsedExpense) => ({
      // Store purchases as positive values
      ...expense,
      amount: Math.abs(expense.amount),
    }));
}
