import { Router, Request, Response } from 'express';
import multer from 'multer';
import crypto from 'crypto';
import { Expense } from '../models/expense.model';
import { parseCsv } from '../services/csv-parser.service';
import { SUBSCRIPTION_REGEX } from '../services/subscription.service';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

// POST /api/expenses/upload — Upload a CSV file
router.post('/upload', upload.single('file'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'No file uploaded' });
      return;
    }

    const csvContent = req.file.buffer.toString('utf-8');
    const parsed = parseCsv(csvContent);
    const batchId = crypto.randomUUID();

    const expenses = parsed.map((item) => ({
      date: new Date(item.date),
      description: item.description,
      amount: item.amount,
      merchant: item.merchant,
      category: item.category,
      uploadBatchId: batchId,
    }));

    const saved = await Expense.insertMany(expenses);
    res.status(201).json({ message: `Imported ${saved.length} expenses`, batchId });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to process CSV' });
  }
});

// POST /api/expenses/manual — Add a manual entry (income or expense)
router.post('/manual', async (req: Request, res: Response) => {
  try {
    const { type, category, description, amount, month, year } = req.body;

    if (!category || !description || amount == null || !month || !year) {
      res.status(400).json({ error: 'Missing required fields: category, description, amount, month, year' });
      return;
    }

    const expense = await Expense.create({
      date: new Date(Number(year), Number(month) - 1, 1),
      description,
      amount: Math.abs(Number(amount)),
      category,
      merchant: description,
      uploadBatchId: 'manual',
      type: type || 'expense',
    });

    res.status(201).json({ message: 'Manual entry added', expense });
  } catch (error) {
    console.error('Manual entry error:', error);
    res.status(500).json({ error: 'Failed to add manual entry' });
  }
});

// GET /api/expenses — Get all expenses with optional filters
router.get('/', async (req: Request, res: Response) => {
  try {
    const { month, year, category } = req.query;
    const filter: Record<string, unknown> = {};

    if (month && year) {
      const startDate = new Date(Number(year), Number(month) - 1, 1);
      const endDate = new Date(Number(year), Number(month), 1);
      filter.date = { $gte: startDate, $lt: endDate };
    }

    if (category) {
      filter.category = category;
    }

    const expenses = await Expense.find(filter).sort({ date: -1 });
    res.json(expenses);
  } catch (error) {
    console.error('Fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch expenses' });
  }
});

// GET /api/expenses/summary — Get spending summary by category
router.get('/summary', async (req: Request, res: Response) => {
  try {
    const { month, year } = req.query;
    const match: Record<string, unknown> = {};

    if (month && year) {
      const startDate = new Date(Number(year), Number(month) - 1, 1);
      const endDate = new Date(Number(year), Number(month), 1);
      match.date = { $gte: startDate, $lt: endDate };
    }

    const summary = await Expense.aggregate([
      { $match: match },
      { $group: { _id: '$category', total: { $sum: '$amount' }, count: { $sum: 1 } } },
      { $sort: { total: -1 } },
    ]);

    res.json(summary);
  } catch (error) {
    console.error('Summary error:', error);
    res.status(500).json({ error: 'Failed to generate summary' });
  }
});

// GET /api/expenses/latest-period — Get the most recent month/year with data
router.get('/latest-period', async (_req: Request, res: Response) => {
  try {
    const latest = await Expense.findOne().sort({ date: -1 }).lean();
    if (!latest) {
      res.json({ month: new Date().getMonth() + 1, year: new Date().getFullYear() });
      return;
    }
    const d = new Date(latest.date);
    res.json({ month: d.getMonth() + 1, year: d.getFullYear() });
  } catch (error) {
    console.error('Latest period error:', error);
    res.status(500).json({ error: 'Failed to fetch latest period' });
  }
});

// GET /api/expenses/years — Get distinct years that have data
router.get('/years', async (_req: Request, res: Response) => {
  try {
    const years = await Expense.aggregate([
      { $group: { _id: { $year: '$date' } } },
      { $sort: { _id: -1 } },
    ]);
    res.json(years.map((y) => y._id));
  } catch (error) {
    console.error('Years error:', error);
    res.status(500).json({ error: 'Failed to fetch years' });
  }
});

// GET /api/expenses/dashboard?year=&month= — Aggregated dashboard data for a year (optionally filtered by month)
router.get('/dashboard', async (req: Request, res: Response) => {
  try {
    const year = Number(req.query.year) || new Date().getFullYear();
    const month = req.query.month ? Number(req.query.month) : null;

    const yearStartDate = new Date(year, 0, 1);
    const yearEndDate = new Date(year + 1, 0, 1);
    const yearDateMatch = { date: { $gte: yearStartDate, $lt: yearEndDate } };

    // When month is provided, narrow stats/sections to that month only
    const filteredDateMatch = month
      ? { date: { $gte: new Date(year, month - 1, 1), $lt: new Date(year, month, 1) } }
      : yearDateMatch;

    // Chart data always uses full year range
    const yearExpenseMatch = { ...yearDateMatch, type: { $ne: 'income' } };
    const yearIncomeMatch = { ...yearDateMatch, type: 'income' };

    // Filtered matches for sections that drill down
    const filteredExpenseMatch = { ...filteredDateMatch, type: { $ne: 'income' } };
    const filteredIncomeMatch = { ...filteredDateMatch, type: 'income' };

    const [monthlyTrend, categoryBreakdown, topMerchants, largestTransactions, monthlyIncome, subscriptionAgg] = await Promise.all([
      // Always full year for chart
      Expense.aggregate([
        { $match: yearExpenseMatch },
        {
          $group: {
            _id: { $month: '$date' },
            total: { $sum: '$amount' },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
      Expense.aggregate([
        { $match: filteredExpenseMatch },
        {
          $group: {
            _id: '$category',
            total: { $sum: '$amount' },
            count: { $sum: 1 },
          },
        },
        { $sort: { total: -1 } },
      ]),
      Expense.aggregate([
        { $match: filteredExpenseMatch },
        {
          $group: {
            _id: '$merchant',
            total: { $sum: '$amount' },
            count: { $sum: 1 },
          },
        },
        { $sort: { total: -1 } },
        { $limit: 10 },
      ]),
      Expense.find(filteredExpenseMatch).sort({ amount: -1 }).limit(10).lean(),
      // Always full year for chart
      Expense.aggregate([
        { $match: yearIncomeMatch },
        {
          $group: {
            _id: { $month: '$date' },
            total: { $sum: '$amount' },
          },
        },
        { $sort: { _id: 1 } },
      ]),
      // Subscription total — match common subscription services by description
      Expense.aggregate([
        {
          $match: {
            ...filteredExpenseMatch,
            description: {
              $regex: SUBSCRIPTION_REGEX,
            },
          },
        },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
    ]);

    // Stats use filtered data when month is set, full year otherwise
    const filteredTrend = month
      ? monthlyTrend.filter((m) => m._id === month)
      : monthlyTrend;
    const filteredIncome = month
      ? monthlyIncome.filter((m) => m._id === month)
      : monthlyIncome;

    const yearTotal = filteredTrend.reduce((sum, m) => sum + m.total, 0);
    const incomeTotal = filteredIncome.reduce((sum, m) => sum + m.total, 0);
    const transactionCount = filteredTrend.reduce((sum, m) => sum + m.count, 0);
    const monthsUploaded = month ? (filteredTrend.length > 0 ? 1 : 0) : monthlyTrend.length;
    const avgMonthly = monthsUploaded > 0 ? yearTotal / monthsUploaded : 0;
    const subscriptionTotal = subscriptionAgg.length > 0 ? subscriptionAgg[0].total : 0;

    res.json({
      yearTotal: Math.round(yearTotal * 100) / 100,
      avgMonthly: Math.round(avgMonthly * 100) / 100,
      transactionCount,
      monthsUploaded,
      incomeTotal: Math.round(incomeTotal * 100) / 100,
      netBalance: Math.round((incomeTotal - yearTotal) * 100) / 100,
      subscriptionTotal: Math.round(subscriptionTotal * 100) / 100,
      monthlyTrend: monthlyTrend.map((m) => ({
        month: m._id,
        total: Math.round(m.total * 100) / 100,
        count: m.count,
      })),
      monthlyIncome: monthlyIncome.map((m) => ({
        month: m._id,
        total: Math.round(m.total * 100) / 100,
      })),
      categoryBreakdown: categoryBreakdown.map((c) => ({
        category: c._id,
        total: Math.round(c.total * 100) / 100,
        count: c.count,
      })),
      topMerchants: topMerchants
        .filter((m) => m._id)
        .map((m) => ({
          merchant: m._id,
          total: Math.round(m.total * 100) / 100,
          count: m.count,
        })),
      largestTransactions,
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ error: 'Failed to generate dashboard data' });
  }
});

// DELETE /api/expenses — Delete all expenses
router.delete('/', async (_req: Request, res: Response) => {
  try {
    const result = await Expense.deleteMany({});
    res.json({ message: `Deleted ${result.deletedCount} expenses` });
  } catch (error) {
    console.error('Delete all error:', error);
    res.status(500).json({ error: 'Failed to delete expenses' });
  }
});

// DELETE /api/expenses/:id — Delete a single expense
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    await Expense.findByIdAndDelete(req.params.id);
    res.json({ message: 'Expense deleted' });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ error: 'Failed to delete expense' });
  }
});

export default router;
