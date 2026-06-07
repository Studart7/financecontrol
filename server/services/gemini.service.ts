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

interface TransactionInput {
  date: string;
  name: string;
  cat: string;
  val: number;
}

export async function generateFinancialInsights(transactions: TransactionInput[]) {
  const ai = getAI();

  const totalGasto = transactions.reduce((sum, t) => sum + t.val, 0);
  const categorySummary: Record<string, number> = {};
  transactions.forEach(t => {
    categorySummary[t.cat] = (categorySummary[t.cat] || 0) + t.val;
  });

  const summaryText = Object.entries(categorySummary)
    .map(([cat, val]) => `${cat}: R$ ${val.toFixed(2)}`)
    .join('\n');

  const prompt = `Você é um consultor financeiro pessoal brasileiro especialista. Analise os dados financeiros abaixo e forneça conselhos personalizados.

DADOS DO USUÁRIO:
- Total gasto no mês: R$ ${totalGasto.toFixed(2)}
- Total de transações: ${transactions.length}
- Distribuição por categoria:
${summaryText || 'Nenhuma transação registrada.'}

INSTRUÇÕES:
1. Gere exatamente 3 "insights" (observações sobre os gastos do usuário). Cada insight deve ter: title (curto, 3-5 palavras), description (1 frase de conselho prático), type (um de: "warning", "opportunity", "info").
2. Gere exatamente 2 "recommendations" (sugestões de metas financeiras). Cada recomendação deve ter: title (nome da meta sugerida), description (1 frase explicando o benefício), suggestedValue (valor numérico em R$ sugerido para a meta), priority (um de: "high", "medium").

${transactions.length === 0 ? 'Como não há transações, crie insights genéricos motivacionais sobre finanças pessoais e recomende metas iniciais.' : ''}

Responda EXCLUSIVAMENTE com JSON no formato:
{
  "insights": [
    { "title": "...", "description": "...", "type": "warning|opportunity|info" }
  ],
  "recommendations": [
    { "title": "...", "description": "...", "suggestedValue": 500, "priority": "high|medium" }
  ]
}`;

  try {
    const parsed = await callGeminiWithFallback(ai, [prompt]);

    const insights = (parsed.insights || []).slice(0, 3).map((i: any) => ({
      title: i.title || "Dica",
      description: i.description || "",
      type: i.type || "info"
    }));

    const recommendations = (parsed.recommendations || []).slice(0, 2).map((r: any) => ({
      title: r.title || "Meta Sugerida",
      description: r.description || "",
      suggestedValue: typeof r.suggestedValue === 'number' ? r.suggestedValue : parseFloat(r.suggestedValue) || 200,
      priority: r.priority || "medium"
    }));

    return { insights, recommendations };
  } catch (error: any) {
    console.error("Error generating insights:", error);
    // Return safe fallback
    return {
      insights: [
        { title: "Comece a Registrar", description: "Adicione suas despesas para receber análises personalizadas da IA.", type: "info" },
        { title: "Defina Metas", description: "Crie metas de gastos por categoria para manter o controle.", type: "opportunity" },
        { title: "Acompanhe Tendências", description: "Com mais dados, a IA identificará padrões nos seus gastos.", type: "info" }
      ],
      recommendations: [
        { title: "Fundo de Emergência", description: "Ter uma reserva para imprevistos é essencial para segurança financeira.", suggestedValue: 500, priority: "high" },
        { title: "Meta de Economia", description: "Defina um valor mensal para poupar e acelere seus objetivos.", suggestedValue: 200, priority: "medium" }
      ]
    };
  }
}
