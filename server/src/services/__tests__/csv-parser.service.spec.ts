import { describe, it, expect } from 'vitest';
import { parseCsv } from '../csv-parser.service';

describe('parseCsv', () => {
  it('should parse a standard Chase CSV with negative amounts as positive', () => {
    const csv = `Date,Description,Amount,Category
01/15/2026,WALMART SUPERCENTER,-45.67,Shopping
01/16/2026,TACO BELL,-8.99,Food & Drink`;

    const result = parseCsv(csv);
    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({
      date: '01/15/2026',
      description: 'WALMART SUPERCENTER',
      amount: 45.67,
      merchant: 'WALMART SUPERCENTER',
      category: 'Shopping',
    });
    expect(result[1].amount).toBe(8.99);
  });

  it('should filter out positive amounts (payments/credits)', () => {
    const csv = `Date,Description,Amount,Category
01/10/2026,AUTOMATIC PAYMENT,500.00,Payment
01/11/2026,TARGET,-23.45,Shopping`;

    const result = parseCsv(csv);
    expect(result).toHaveLength(1);
    expect(result[0].description).toBe('TARGET');
  });

  it('should filter out zero amounts', () => {
    const csv = `Date,Description,Amount,Category
01/10/2026,ZERO TRANSACTION,0.00,Shopping
01/11/2026,REAL PURCHASE,-10.00,Shopping`;

    const result = parseCsv(csv);
    expect(result).toHaveLength(1);
    expect(result[0].description).toBe('REAL PURCHASE');
  });

  it('should support "Transaction Date" column name', () => {
    const csv = `Transaction Date,Description,Amount,Category
02/01/2026,STARBUCKS,-5.50,Food & Drink`;

    const result = parseCsv(csv);
    expect(result).toHaveLength(1);
    expect(result[0].date).toBe('02/01/2026');
  });

  it('should support "Transaction Description" column name', () => {
    const csv = `Date,Transaction Description,Amount,Category
02/01/2026,COSTCO WHOLESALE,-120.00,Shopping`;

    const result = parseCsv(csv);
    expect(result[0].description).toBe('COSTCO WHOLESALE');
  });

  it('should support "Debit" column name for amount', () => {
    const csv = `Date,Description,Debit,Category
02/01/2026,SHELL GAS,-40.00,Gas`;

    const result = parseCsv(csv);
    expect(result[0].amount).toBe(40.00);
  });

  it('should use "Merchant" column when available', () => {
    const csv = `Date,Description,Amount,Category,Merchant
02/01/2026,AMZN MKTP US,-15.99,Shopping,Amazon`;

    const result = parseCsv(csv);
    expect(result[0].merchant).toBe('Amazon');
  });

  it('should default category to "Uncategorized" when missing', () => {
    const csv = `Date,Description,Amount
02/01/2026,RANDOM STORE,-25.00`;

    const result = parseCsv(csv);
    expect(result[0].category).toBe('Uncategorized');
  });

  it('should return empty array for headers-only CSV', () => {
    const csv = `Date,Description,Amount,Category`;
    const result = parseCsv(csv);
    expect(result).toHaveLength(0);
  });

  it('should return empty array for empty input', () => {
    const result = parseCsv('');
    expect(result).toHaveLength(0);
  });

  it('should handle amounts with extra decimal places', () => {
    const csv = `Date,Description,Amount,Category
01/01/2026,PRECISE STORE,-19.999,Shopping`;

    const result = parseCsv(csv);
    expect(result[0].amount).toBeCloseTo(19.999);
  });
});
