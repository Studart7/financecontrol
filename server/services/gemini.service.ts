import { GoogleGenAI } from '@google/genai';
import { PrismaClient } from '@prisma/client';

const MODELS = ['gemini-2.5-flash', 'gemini-2.0-flash'];

const prisma = new PrismaClient();

function getAI() {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    throw new Error("Nenhuma chave de API encontrada. Defina GEMINI_API_KEY ou GOOGLE_API_KEY no arquivo .env");
  }
  return new GoogleGenAI({ apiKey });
}

function handleError(error: any) {
  let errMsg = error?.message || String(error);
  if (error?.status === 429 || errMsg.includes('429') || errMsg.includes('quota')) {
    return new Error("Limite de uso da IA excedido (Erro 429). Aguarde 1 minuto e tente novamente.");
  }
  if (typeof errMsg === 'string' && errMsg.startsWith('{')) {
    try {
      const parsed = JSON.parse(errMsg);
      if (parsed.error?.message) {
        errMsg = parsed.error.message;
        if (errMsg.includes('429') || errMsg.includes('quota')) {
          return new Error("Limite de uso da IA excedido (Erro 429). Aguarde 1 minuto e tente novamente.");
        }
        return new Error(errMsg);
      }
    } catch (e) {}
  }
  return new Error(errMsg);
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
      throw handleError(error);
    }
  }
  throw handleError(lastError);
}

export async function processReceipt(fileBuffer: Buffer, mimeType: string) {
  const ai = getAI();

  const prompt = `Você é um assistente financeiro especialista em extrair dados de documentos financeiros.
O arquivo enviado pode ser uma NOTA FISCAL, RECIBO, BOLETO, FATURA, PRINT DE TELA de aplicativo (como iFood, Uber, bancos, etc.), ou QUALQUER OUTRO documento que contenha informações sobre um gasto ou pagamento.

Analise a imagem com atenção e extraia as seguintes informações:
- O nome do estabelecimento, serviço ou empresa (ex: "iFood", "Claro", "Farmácia São Paulo", "CPFL Energia")
- O valor total em formato numérico (ex: 120.50). Para boletos, use o valor do documento. Para prints, use o valor total visível.
- A data de emissão/vencimento no formato YYYY-MM-DD. Se não houver data visível, retorne null.
- Uma categoria sugerida para a despesa. Escolha APENAS uma das opções a seguir:
  ['Alimentação', 'Moradia', 'Transporte', 'Lazer', 'Saúde', 'Educação', 'Geral']
- O status do pagamento: "Liquidado" ou "Pendente".
  REGRA PARA BOLETOS PARCELADOS: Se o documento for um boleto com informações de parcelas (ex: "Parcela 3/12", "3 de 10"), e NÃO for a ÚLTIMA parcela (ex: parcela 3 de 12 → ainda faltam 9), o status DEVE ser "Pendente".
  Se for a última parcela (ex: "Parcela 12/12") ou se não houver informação de parcelas (nota fiscal, recibo simples), o status deve ser "Liquidado".
- Se houver informação de parcelas, extraia também: "installmentCurrent" (parcela atual, ex: 3) e "installmentTotal" (total de parcelas, ex: 12). Se não houver parcelas, retorne null para ambos.

Devolva a resposta EXCLUSIVAMENTE em formato JSON.
Formato exato esperado:
{
  "establishment": "Nome da Loja/Serviço",
  "category": "Categoria",
  "val": 150.00,
  "date": "2024-05-20",
  "status": "Liquidado",
  "installmentCurrent": null,
  "installmentTotal": null
}`;

  try {
    const parsed = await callGeminiWithFallback(ai, [
      { inlineData: { data: fileBuffer.toString("base64"), mimeType } },
      prompt
    ]);

    const installmentCurrent = parsed.installmentCurrent ? Number(parsed.installmentCurrent) : null;
    const installmentTotal = parsed.installmentTotal ? Number(parsed.installmentTotal) : null;

    let status: string = parsed.status || 'Liquidado';
    if (installmentCurrent && installmentTotal && installmentCurrent < installmentTotal) {
      status = 'Pendente';
    }

    let establishment = parsed.establishment || 'Desconhecido';
    if (installmentCurrent && installmentTotal) {
      establishment = `${establishment} (${installmentCurrent}/${installmentTotal})`;
    }

    return {
      establishment,
      category: parsed.category || "Geral",
      val: typeof parsed.val === 'number' ? parsed.val : parseFloat(parsed.val) || 0,
      date: parsed.date || null,
      status,
      installmentCurrent,
      installmentTotal
    };
  } catch (error: any) {
    console.error("Error processing receipt:", error);
    throw new Error(error.message || "Erro na integração com IA para leitura do documento.");
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
4. "cat": A categoria mais apropriada. Você DEVE escolher preferencialmente uma das seguintes opções disponíveis: [${allowedCategories.join(', ')}]. Se nenhuma se encaixar e for realmente necessário, você pode inferir uma nova categoria curta.
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

// ===== AI MANAGER (SECRETARY) =====

const TOOL_DECLARATIONS = [
  {
    name: "listTransactions",
    description: "Lista todas as transações (gastos) do banco de dados. Útil para consultar gastos atuais do usuário antes de alterar ou informar valores.",
    parameters: { type: "object" as const, properties: {}, required: [] }
  },
  {
    name: "createTransaction",
    description: "Cria uma nova transação (gasto) no banco de dados.",
    parameters: {
      type: "object" as const,
      properties: {
        name: { type: "string", description: "Nome do gasto/estabelecimento" },
        val: { type: "number", description: "Valor do gasto" },
        cat: { type: "string", description: "Categoria do gasto" },
        date: { type: "string", description: "Data no formato YYYY-MM-DD" },
        status: { type: "string", description: "Status: Liquidado ou Pendente", enum: ["Liquidado", "Pendente"] }
      },
      required: ["name", "val", "cat"]
    }
  },
  {
    name: "updateTransaction",
    description: "Atualiza uma transação existente pelo ID.",
    parameters: {
      type: "object" as const,
      properties: {
        id: { type: "number", description: "ID da transação a atualizar" },
        name: { type: "string", description: "Novo nome (opcional)" },
        val: { type: "number", description: "Novo valor (opcional)" },
        cat: { type: "string", description: "Nova categoria (opcional)" },
        date: { type: "string", description: "Nova data (opcional)" },
        status: { type: "string", description: "Novo status (opcional)" }
      },
      required: ["id"]
    }
  },
  {
    name: "deleteTransaction",
    description: "Deleta uma transação pelo ID.",
    parameters: {
      type: "object" as const,
      properties: {
        id: { type: "number", description: "ID da transação a deletar" }
      },
      required: ["id"]
    }
  },
  {
    name: "listGoals",
    description: "Lista todas as metas financeiras do banco de dados.",
    parameters: { type: "object" as const, properties: {}, required: [] }
  },
  {
    name: "createGoal",
    description: "Cria uma nova meta financeira.",
    parameters: {
      type: "object" as const,
      properties: {
        title: { type: "string", description: "Título da meta" },
        meta: { type: "number", description: "Valor alvo da meta" },
        tip: { type: "string", description: "Dica ou descrição da meta (opcional)" }
      },
      required: ["title", "meta"]
    }
  },
  {
    name: "updateGoal",
    description: "Atualiza uma meta existente pelo ID.",
    parameters: {
      type: "object" as const,
      properties: {
        id: { type: "number", description: "ID da meta a atualizar" },
        title: { type: "string", description: "Novo título (opcional)" },
        meta: { type: "number", description: "Novo valor alvo (opcional)" },
        tip: { type: "string", description: "Nova dica (opcional)" }
      },
      required: ["id"]
    }
  },
  {
    name: "deleteGoal",
    description: "Deleta uma meta pelo ID.",
    parameters: {
      type: "object" as const,
      properties: {
        id: { type: "number", description: "ID da meta a deletar" }
      },
      required: ["id"]
    }
  }
];

async function executeTool(name: string, args: any): Promise<any> {
  const today = new Date().toISOString().split('T')[0];

  switch (name) {
    case "listTransactions": {
      const txs = await prisma.transaction.findMany({ orderBy: { id: 'desc' }, take: 50 });
      return txs;
    }
    case "createTransaction": {
      const tx = await prisma.transaction.create({
        data: {
          name: args.name,
          val: args.val,
          cat: args.cat,
          date: args.date || today,
          status: args.status || 'Liquidado',
          iconKey: 'Outros'
        }
      });
      return { success: true, transaction: tx };
    }
    case "updateTransaction": {
      const updateData: any = {};
      if (args.name !== undefined) updateData.name = args.name;
      if (args.val !== undefined) updateData.val = args.val;
      if (args.cat !== undefined) updateData.cat = args.cat;
      if (args.date !== undefined) updateData.date = args.date;
      if (args.status !== undefined) updateData.status = args.status;
      const tx = await prisma.transaction.update({ where: { id: args.id }, data: updateData });
      return { success: true, transaction: tx };
    }
    case "deleteTransaction": {
      await prisma.transaction.delete({ where: { id: args.id } });
      return { success: true, deleted: args.id };
    }
    case "listGoals": {
      const goals = await prisma.goal.findMany({ orderBy: { id: 'desc' } });
      return goals;
    }
    case "createGoal": {
      const goal = await prisma.goal.create({
        data: {
          title: args.title,
          meta: args.meta,
          tip: args.tip || ''
        }
      });
      return { success: true, goal };
    }
    case "updateGoal": {
      const updateData: any = {};
      if (args.title !== undefined) updateData.title = args.title;
      if (args.meta !== undefined) updateData.meta = args.meta;
      if (args.tip !== undefined) updateData.tip = args.tip;
      const goal = await prisma.goal.update({ where: { id: args.id }, data: updateData });
      return { success: true, goal };
    }
    case "deleteGoal": {
      await prisma.goal.delete({ where: { id: args.id } });
      return { success: true, deleted: args.id };
    }
    default:
      return { error: `Tool ${name} not found` };
  }
}

export interface ManagerChatResult {
  reply: string;
  dataChanged: boolean;
}

export async function processManagerChat(
  history: { role: string; text: string }[],
  userMessage: string
): Promise<ManagerChatResult> {
  const ai = getAI();
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (!apiKey) throw new Error("API key not configured");

  const systemInstruction = `Você é o Secretário Financeiro IA do FinanceControl. Você é amigável, prestativo e fala em português brasileiro.

Suas capacidades:
- Consultar, criar, atualizar e deletar transações (gastos) do usuário
- Consultar, criar, atualizar e deletar metas financeiras
- Oferecer conselhos financeiros baseados nos dados do usuário
- Responder perguntas sobre finanças pessoais

## REGRA CRÍTICA: COMO METAS E TRANSAÇÕES SE RELACIONAM

No FinanceControl, o progresso de uma meta é medido pelas transações cuja categoria (cat) é igual ao título da meta.
Exemplo: se a meta é "Viagem" com valor alvo de R$3000, o progresso é a soma de todas as transações com cat="Viagem".

PORTANTO:
- Quando o usuário diz que "guardou", "separou", "investiu" ou "economizou" dinheiro para uma meta, você DEVE criar uma TRANSAÇÃO (createTransaction) com:
  - name: descrição do aporte (ex: "Aporte CDB Banco Inter", "Poupança Viagem")
  - val: o valor guardado
  - cat: o TÍTULO EXATO da meta (ex: "Viagem")
  - status: "Liquidado"
- Use listGoals para verificar que a meta existe e pegar o título exato antes de criar a transação.
- Assim o progresso da meta será atualizado automaticamente na interface.

Regras gerais:
1. Quando o usuário pedir para criar/alterar/deletar algo, USE as ferramentas disponíveis para executar a ação no banco de dados.
2. Antes de alterar ou deletar, consulte os dados existentes (listTransactions/listGoals) para encontrar o item correto pelo nome ou contexto.
3. Sempre confirme a ação realizada ao usuário de forma clara.
4. Para categorias de gastos, prefira: Alimentação, Moradia, Transporte, Lazer, Saúde, Educação, Geral. Mas se a transação for um aporte para uma meta, use o TÍTULO DA META como categoria.
5. Seja conciso nas respostas mas sempre informativo.
6. Se o usuário perguntar algo fora do escopo financeiro, responda educadamente que seu foco é em finanças.
7. Use emojis ocasionalmente para tornar a conversa mais agradável.
8. Para boletos parcelados, se o usuário mencionar que NÃO é a última parcela, use status "Pendente". Se for a última parcela ou pagamento único, use "Liquidado".`;

  const contents: any[] = [];

  for (const msg of history.slice(-20)) {
    contents.push({
      role: msg.role === 'model' ? 'model' : 'user',
      parts: [{ text: msg.text }]
    });
  }

  contents.push({
    role: 'user',
    parts: [{ text: userMessage }]
  });

  let dataChanged = false;
  let lastError: any = null;

  for (const model of MODELS) {
    try {
      console.log(`[Manager] Trying model: ${model}`);

      const response = await ai.models.generateContent({
        model,
        contents,
        config: {
          systemInstruction,
          tools: [{ functionDeclarations: TOOL_DECLARATIONS as any }]
        }
      });

      let currentResponse = response;
      let maxIterations = 10;

      while (maxIterations-- > 0) {
        const candidate = currentResponse.candidates?.[0];
        if (!candidate) break;

        const parts = candidate.content?.parts || [];
        const functionCalls = parts.filter((p: any) => p.functionCall);

        if (functionCalls.length === 0) {
          const textPart = parts.find((p: any) => p.text);
          return {
            reply: textPart?.text || "Entendido! Posso ajudar com mais alguma coisa?",
            dataChanged
          };
        }

        const functionResponses: any[] = [];

        for (const part of functionCalls) {
          const fc = (part as any).functionCall;
          console.log(`[Manager] Calling tool: ${fc.name}`, fc.args);
          
          try {
            const result = await executeTool(fc.name, fc.args || {});
            if (['createTransaction', 'updateTransaction', 'deleteTransaction', 'createGoal', 'updateGoal', 'deleteGoal'].includes(fc.name)) {
              dataChanged = true;
            }
            functionResponses.push({
              functionResponse: {
                name: fc.name,
                response: result
              }
            });
          } catch (toolError: any) {
            functionResponses.push({
              functionResponse: {
                name: fc.name,
                response: { error: toolError.message || 'Erro ao executar a ação.' }
              }
            });
          }
        }

        contents.push({ role: 'model', parts });
        contents.push({ role: 'user', parts: functionResponses });

        currentResponse = await ai.models.generateContent({
          model,
          contents,
          config: {
            systemInstruction,
            tools: [{ functionDeclarations: TOOL_DECLARATIONS as any }]
          }
        });
      }

      const finalCandidate = currentResponse.candidates?.[0];
      const finalText = finalCandidate?.content?.parts?.find((p: any) => p.text);
      return {
        reply: finalText?.text || "Pronto! Ação realizada com sucesso.",
        dataChanged
      };

    } catch (error: any) {
      console.error(`[Manager] Model ${model} failed:`, error.message || error);
      lastError = error;
      if (error.status === 503 || error.message?.includes('503')) continue;
      throw handleError(error);
    }
  }

  throw handleError(lastError || new Error("All models failed"));
}
