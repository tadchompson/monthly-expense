import { Router, Request, Response } from 'express';
import { Expense } from '../models/expense.model';
import { SubscriptionExclusion } from '../models/subscription-exclusion.model';
import {
  SUBSCRIPTION_PATTERNS,
  SUBSCRIPTION_REGEX,
  matchSubscription,
  buildExclusionRegex,
} from '../services/subscription.service';

const router = Router();

// GET /api/subscriptions/transactions?year=&month= — List subscription transactions grouped by pattern
router.get('/transactions', async (req: Request, res: Response) => {
  try {
    const year = Number(req.query.year) || new Date().getFullYear();
    const month = req.query.month ? Number(req.query.month) : null;

    const dateMatch = month
      ? { date: { $gte: new Date(year, month - 1, 1), $lt: new Date(year, month, 1) } }
      : { date: { $gte: new Date(year, 0, 1), $lt: new Date(year + 1, 0, 1) } };

    // Get exclusion patterns (contains matching)
    const exclusions = await SubscriptionExclusion.find().lean();
    const exclusionRegex = buildExclusionRegex(exclusions.map((e) => e.description));

    // Fetch matching transactions, filtering out excluded descriptions
    const matchFilter: Record<string, unknown> = {
      ...dateMatch,
      type: { $ne: 'income' },
    };

    if (exclusionRegex) {
      matchFilter.$and = [
        { description: { $regex: SUBSCRIPTION_REGEX } },
        { description: { $not: exclusionRegex } },
      ];
    } else {
      matchFilter.description = { $regex: SUBSCRIPTION_REGEX };
    }

    const transactions = await Expense.find(matchFilter)
      .sort({ date: -1 })
      .lean();

    // Group by pattern key
    const groups = new Map<string, { key: string; label: string; transactions: any[]; total: number }>();

    for (const txn of transactions) {
      const key = matchSubscription(txn.description);
      if (!key) continue;

      if (!groups.has(key)) {
        const pattern = SUBSCRIPTION_PATTERNS.find((p) => p.key === key)!;
        groups.set(key, { key, label: pattern.label, transactions: [], total: 0 });
      }
      const group = groups.get(key)!;
      group.transactions.push(txn);
      group.total += txn.amount;
    }

    // Sort by highest total first, round totals
    const result = [...groups.values()]
      .map((g) => ({ ...g, total: Math.round(g.total * 100) / 100 }))
      .sort((a, b) => b.total - a.total);

    res.json(result);
  } catch (error) {
    console.error('Subscription transactions error:', error);
    res.status(500).json({ error: 'Failed to fetch subscription transactions' });
  }
});

// GET /api/subscriptions/exclusions — List all exclusions
router.get('/exclusions', async (_req: Request, res: Response) => {
  try {
    const exclusions = await SubscriptionExclusion.find().sort({ label: 1 }).lean();
    res.json(exclusions);
  } catch (error) {
    console.error('Get exclusions error:', error);
    res.status(500).json({ error: 'Failed to fetch exclusions' });
  }
});

// POST /api/subscriptions/exclusions — Add an exclusion by transaction description
router.post('/exclusions', async (req: Request, res: Response) => {
  try {
    const { description, patternKey, label } = req.body;

    if (!description || !patternKey || !label) {
      res.status(400).json({ error: 'Missing required fields: description, patternKey, label' });
      return;
    }

    const exclusion = await SubscriptionExclusion.findOneAndUpdate(
      { description },
      { description, patternKey, label },
      { upsert: true, new: true }
    );

    res.status(201).json(exclusion);
  } catch (error) {
    console.error('Add exclusion error:', error);
    res.status(500).json({ error: 'Failed to add exclusion' });
  }
});

// DELETE /api/subscriptions/exclusions/:id — Remove an exclusion
router.delete('/exclusions/:id', async (req: Request, res: Response) => {
  try {
    await SubscriptionExclusion.findByIdAndDelete(req.params.id);
    res.json({ message: 'Exclusion removed' });
  } catch (error) {
    console.error('Remove exclusion error:', error);
    res.status(500).json({ error: 'Failed to remove exclusion' });
  }
});

export default router;
