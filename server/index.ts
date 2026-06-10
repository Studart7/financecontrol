import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env.local first, then fallback to .env
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config();
import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import multer from 'multer';
import { processReceipt, processChatTransactions } from './services/gemini.service';

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



app.post('/api/gemini/chat', async (req, res) => {
  try {
    const { text, categories } = req.body;
    if (!text) {
      return res.status(400).json({ error: 'Texto não fornecido.' });
    }
    const result = await processChatTransactions(text, categories || []);
    res.json({ transactions: result });
  } catch (error: any) {
    console.error('Error processing chat:', error);
    res.status(500).json({ error: error.message || 'Failed to process chat input' });
  }
});

// ===== SETTINGS (API Key) =====

import fs from 'fs';

app.get('/api/settings/api-key', (_req, res) => {
  const key = process.env.GEMINI_API_KEY || '';
  if (!key) return res.json({ configured: false, maskedKey: '' });
  const masked = key.substring(0, 8) + '...' + key.substring(key.length - 4);
  res.json({ configured: true, maskedKey: masked });
});

app.put('/api/settings/api-key', async (req, res) => {
  try {
    const { apiKey } = req.body;
    if (!apiKey || typeof apiKey !== 'string' || apiKey.trim().length < 10) {
      return res.status(400).json({ error: 'Chave de API inválida.' });
    }

    const envPath = path.resolve(process.cwd(), '.env.local');
    let envContent = '';
    
    try {
      envContent = fs.readFileSync(envPath, 'utf-8');
    } catch {
      envContent = '';
    }

    // Replace or add the GEMINI_API_KEY line
    const keyLine = `GEMINI_API_KEY="${apiKey.trim()}"`;
    if (envContent.includes('GEMINI_API_KEY=')) {
      envContent = envContent.replace(/GEMINI_API_KEY=.*$/m, keyLine);
    } else {
      envContent = envContent.trimEnd() + '\n' + keyLine + '\n';
    }

    fs.writeFileSync(envPath, envContent, 'utf-8');
    
    // Update in-memory so no restart is needed
    process.env.GEMINI_API_KEY = apiKey.trim();

    const masked = apiKey.substring(0, 8) + '...' + apiKey.substring(apiKey.length - 4);
    res.json({ success: true, maskedKey: masked });
  } catch (error: any) {
    console.error('Error saving API key:', error);
    res.status(500).json({ error: 'Falha ao salvar a chave.' });
  }
});

app.post('/api/settings/test-api-key', async (req, res) => {
  try {
    const { apiKey } = req.body;
    const keyToTest = apiKey || process.env.GEMINI_API_KEY;
    
    if (!keyToTest) {
      return res.status(400).json({ success: false, error: 'Nenhuma chave fornecida.' });
    }

    const { GoogleGenAI } = await import('@google/genai');
    const ai = new GoogleGenAI({ apiKey: keyToTest });
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: ['Responda apenas "ok"'],
      config: { responseMimeType: 'text/plain' }
    });

    if (response.text) {
      res.json({ success: true, message: 'Conexão com Gemini estabelecida com sucesso!' });
    } else {
      res.json({ success: false, error: 'Sem resposta do Gemini.' });
    }
  } catch (error: any) {
    console.error('Error testing API key:', error);
    res.status(500).json({ success: false, error: error.message || 'Falha ao testar a chave.' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
