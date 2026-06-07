import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import multer from 'multer';
import { processReceipt, generateFinancialInsights } from './services/gemini.service';

const app = express();
const prisma = new PrismaClient();
const upload = multer({ storage: multer.memoryStorage() });

app.use(cors());
app.use(express.json());

// ===== TRANSACTIONS =====

app.get('/api/transactions', async (_req, res) => {
  try {
    const transactions = await prisma.transaction.findMany({ orderBy: { id: 'desc' } });
    res.json(transactions);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

app.post('/api/transactions', async (req, res) => {
  try {
    const data = req.body;
    const val = typeof data.val === 'string' ? parseFloat(data.val) : data.val;
    const transaction = await prisma.transaction.create({
      data: { date: data.date, name: data.name, cat: data.cat, val, status: data.status, iconKey: data.iconKey || 'Outros' }
    });
    res.status(201).json(transaction);
  } catch (error) {
    console.error('Error creating transaction:', error);
    res.status(500).json({ error: 'Failed to create transaction' });
  }
});

app.put('/api/transactions/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const data = req.body;
    const val = typeof data.val === 'string' ? parseFloat(data.val) : data.val;
    const transaction = await prisma.transaction.update({
      where: { id },
      data: { date: data.date, name: data.name, cat: data.cat, val, status: data.status, iconKey: data.iconKey }
    });
    res.json(transaction);
  } catch (error) {
    console.error('Error updating transaction:', error);
    res.status(500).json({ error: 'Failed to update transaction' });
  }
});

app.delete('/api/transactions/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await prisma.transaction.delete({ where: { id } });
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting transaction:', error);
    res.status(500).json({ error: 'Failed to delete transaction' });
  }
});

// ===== GOALS =====

app.get('/api/goals', async (_req, res) => {
  try {
    const goals = await prisma.goal.findMany({ orderBy: { id: 'desc' } });
    res.json(goals);
  } catch (error) {
    console.error('Error fetching goals:', error);
    res.status(500).json({ error: 'Failed to fetch goals' });
  }
});

app.post('/api/goals', async (req, res) => {
  try {
    const data = req.body;
    const goal = await prisma.goal.create({
      data: {
        title: data.title,
        meta: typeof data.meta === 'string' ? parseFloat(data.meta) : data.meta,
        color: data.color || 'bg-tertiary',
        iconKey: data.iconKey || 'Metas',
        iconColor: data.iconColor || 'text-tertiary',
        iconBg: data.iconBg || 'bg-tertiary/10',
        tipIconKey: data.tipIconKey || 'Lightbulb',
        tip: data.tip || ''
      }
    });
    res.status(201).json(goal);
  } catch (error) {
    console.error('Error creating goal:', error);
    res.status(500).json({ error: 'Failed to create goal' });
  }
});

app.put('/api/goals/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const data = req.body;
    const updateData: any = {};
    if (data.title !== undefined) updateData.title = data.title;
    if (data.meta !== undefined) updateData.meta = typeof data.meta === 'string' ? parseFloat(data.meta) : data.meta;
    if (data.color !== undefined) updateData.color = data.color;
    if (data.iconKey !== undefined) updateData.iconKey = data.iconKey;
    if (data.iconColor !== undefined) updateData.iconColor = data.iconColor;
    if (data.iconBg !== undefined) updateData.iconBg = data.iconBg;
    if (data.tipIconKey !== undefined) updateData.tipIconKey = data.tipIconKey;
    if (data.tip !== undefined) updateData.tip = data.tip;

    const goal = await prisma.goal.update({ where: { id }, data: updateData });
    res.json(goal);
  } catch (error) {
    console.error('Error updating goal:', error);
    res.status(500).json({ error: 'Failed to update goal' });
  }
});

app.delete('/api/goals/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await prisma.goal.delete({ where: { id } });
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting goal:', error);
    res.status(500).json({ error: 'Failed to delete goal' });
  }
});

// ===== AI =====

app.post('/api/process-receipt', upload.single('receipt'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    const result = await processReceipt(req.file.buffer, req.file.mimetype);
    res.json(result);
  } catch (error: any) {
    console.error('Error processing receipt:', error);
    res.status(500).json({ error: error.message || 'Failed to process receipt' });
  }
});

app.post('/api/ai/insights', async (req, res) => {
  try {
    const { transactions } = req.body;
    const result = await generateFinancialInsights(transactions || []);
    res.json(result);
  } catch (error: any) {
    console.error('Error generating insights:', error);
    res.status(500).json({ error: error.message || 'Failed to generate insights' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
