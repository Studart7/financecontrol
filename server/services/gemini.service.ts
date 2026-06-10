import { GoogleGenAI } from '@google/genai';

const MODELS = ['gemini-2.5-flash', 'gemini-2.0-flash'];

function getAI() {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    throw new Error("Nenhuma chave de API encontrada. Defina GEMINI_API_KEY ou GOOGLE_API_KEY no arquivo .env");
  }
  return new GoogleGenAI({ apiKey });
}

async function callGeminiWithFallback(ai: GoogleGenAI, contents: any[], responseMimeType = "application/json") {
  let lastError: any = null;
  for (const model of MODELS) {
    try {
      console.log(`Trying model: ${model}`);
      const response = await ai.models.generateContent({
        model,
        contents,
        config: { responseMimeType }
      });
      let text = response.text;
      if (!text) throw new Error("No text returned from Gemini");
      text = text.replace(/```json/gi, '').replace(/```/g, '').trim();
      return JSON.parse(text);
    } catch (error: any) {
      console.error(`Model ${model} failed:`, error.message || error);
      lastError = error;
      if (error.status === 503 || error.message?.includes('503')) continue;
      throw error;
    }
  }
  throw lastError;
}

export async function processReceipt(fileBuffer: Buffer, mimeType: string) {
  const ai = getAI();

  const prompt = `Extraia as seguintes informações deste recibo/nota fiscal:
- O nome do estabelecimento (ou loja/serviço)
- O valor total (em formato numérico ex: 120.50)
- A data da emissão da nota no formato YYYY-MM-DD. Se não houver, tente deduzir ou retorne null.
- Uma categoria sugerida para a despesa. Escolha APENAS uma das opções a seguir:
  ['Alimentação', 'Moradia', 'Transporte', 'Lazer', 'Saúde', 'Educação', 'Geral']

Devolva a resposta EXCLUSIVAMENTE em formato JSON.
Formato exato esperado:
{
  "establishment": "Nome da Loja",
  "category": "Alimentação",
  "val": 150.00,
  "date": "2024-05-20"
}`;

  try {
    const parsed = await callGeminiWithFallback(ai, [
      { inlineData: { data: fileBuffer.toString("base64"), mimeType } },
      prompt
    ]);
    return {
      establishment: parsed.establishment || "Desconhecido",
      category: parsed.category || "Geral",
      val: typeof parsed.val === 'number' ? parsed.val : parseFloat(parsed.val) || 0,
      date: parsed.date || null
    };
  } catch (error: any) {
    console.error("Error processing receipt:", error);
    throw new Error(error.message || "Erro na integração com IA para leitura da nota.");
  }
}



export async function processChatTransactions(text: string, allowedCategories: string[]) {
  const ai = getAI();
  const today = new Date().toISOString().split('T')[0];

  const prompt = `Você é um assistente financeiro inteligente. O usuário vai descrever um ou mais gastos em linguagem natural.
Sua tarefa é extrair essas transações e formatá-las em JSON.

Texto do usuário: "${text}"

Regras:
1. Extraia CADA gasto mencionado como um objeto separado na lista.
2. "name": O nome/estabelecimento (ex: "Ifood", "Farmácia", "Uber").
3. "val": O valor numérico do gasto (ex: 240.00). Se não for especificado, tente deduzir ou coloque 0.
4. "cat": A categoria mais apropriada. Você DEVE escolher EXATAMENTE UMA das seguintes opções disponíveis nas metas do usuário: [${allowedCategories.join(', ')}]. Se nenhuma se encaixar perfeitamente, escolha a mais genérica ou retorne "Geral".
5. "date": A data da transação em formato YYYY-MM-DD. Se o usuário não disser a data (como "ontem", "dia 15"), assuma a data de hoje: ${today}.

Devolva EXCLUSIVAMENTE um JSON com o seguinte formato exato:
{
  "transactions": [
    {
      "name": "Nome",
      "val": 150.00,
      "cat": "Categoria Escolhida",
      "date": "2024-05-20"
    }
  ]
}`;

  try {
    const parsed = await callGeminiWithFallback(ai, [prompt]);
    if (!parsed || !Array.isArray(parsed.transactions)) {
      throw new Error("Resposta inválida do Gemini (array não encontrado).");
    }
    
    return parsed.transactions.map((tx: any) => ({
      name: tx.name || "Gasto não identificado",
      val: typeof tx.val === 'number' ? tx.val : parseFloat(tx.val) || 0,
      cat: tx.cat || "Geral",
      date: tx.date || today
    }));
  } catch (error: any) {
    console.error("Error processing chat transactions:", error);
    throw new Error(error.message || "Erro na integração com IA para leitura do chat.");
  }
}
