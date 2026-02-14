import { Router, Request, Response } from 'express';
import multer from 'multer';
import crypto from 'crypto';
import { Expense } from '../models/expense.model';
import { parseCsv } from '../services/csv-parser.service';

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
