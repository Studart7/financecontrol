import { Transaction, Goal, AIInsight, AIRecommendation } from '../context/FinanceContext';

export function generateLocalInsights(transactions: Transaction[], goals: Goal[]): AIInsight[] {
  if (transactions.length === 0) {
    return [
      {
        title: "Nenhum Gasto Registrado",
        description: "Adicione despesas neste mês para receber análises detalhadas.",
        type: "info"
      }
    ];
  }

  const insights: AIInsight[] = [];
  const totalSpent = transactions.reduce((sum, t) => sum + t.val, 0);

  // 1. Group by category
  const catTotals: Record<string, number> = {};
  transactions.forEach(t => {
    catTotals[t.cat] = (catTotals[t.cat] || 0) + t.val;
  });

  // 2. Find the highest spending category
  let maxCat = '';
  let maxCatVal = 0;
  Object.entries(catTotals).forEach(([cat, val]) => {
    if (val > maxCatVal) {
      maxCat = cat;
      maxCatVal = val;
    }
  });

  if (maxCatVal > 0) {
    insights.push({
      title: "Maior Concentração",
      description: `Seu maior gasto este mês é em ${maxCat} (R$ ${maxCatVal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}).`,
      type: "info"
    });
  }

  // 3. Compare with Goals
  Object.entries(catTotals).forEach(([cat, val]) => {
    const goal = goals.find(g => g.title === cat);
    if (goal) {
      const percentage = (val / goal.meta) * 100;
      if (percentage >= 100) {
        insights.push({
          title: "Meta Ultrapassada",
          description: `Você estourou a meta de ${cat} em R$ ${(val - goal.meta).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}.`,
          type: "warning"
        });
      } else if (percentage >= 80) {
        insights.push({
          title: "Atenção ao Orçamento",
          description: `A categoria ${cat} atingiu ${Math.round(percentage)}% da meta. Pegue leve!`,
          type: "warning"
        });
      } else if (percentage <= 30 && goal.meta > 0 && transactions.length > 5) {
        // Se tem várias transações e gastou pouco na meta
        insights.push({
          title: "Boa Economia",
          description: `Você usou apenas ${Math.round(percentage)}% da sua meta de ${cat}. Excelente!`,
          type: "opportunity"
        });
      }
    }
  });

  // Take top 3 most relevant insights
  // Priority: warning > opportunity > info
  return insights.sort((a, b) => {
    const score = { warning: 3, opportunity: 2, info: 1 };
    return score[b.type] - score[a.type];
  }).slice(0, 3);
}

export function generateLocalRecommendations(
  transactions: Transaction[], 
  goals: Goal[], 
  acceptedRecommendations: string[]
): AIRecommendation[] {
  const recommendations: AIRecommendation[] = [];

  const hasGoal = (title: string) => goals.some(g => g.title.toLowerCase() === title.toLowerCase());
  const isAccepted = (title: string) => acceptedRecommendations.includes(title);

  const canSuggest = (title: string) => !hasGoal(title) && !isAccepted(title);

  // 1. Group transactions by category to find patterns
  const catTotals: Record<string, number> = {};
  transactions.forEach(t => {
    catTotals[t.cat] = (catTotals[t.cat] || 0) + t.val;
  });

  // Suggest goals for heavily used categories that don't have goals yet
  Object.entries(catTotals).forEach(([cat, val]) => {
    if (val > 100 && cat !== 'Geral' && canSuggest(cat)) {
      recommendations.push({
        id: cat,
        title: cat,
        description: `Notamos gastos expressivos em ${cat}. Estabelecer um teto ajudará no controle.`,
        suggestedValue: Math.round(val * 1.1),
        priority: val > 500 ? "high" : "medium"
      });
    }
  });

  // Suggest standard healthy goals if not present
  if (canSuggest("Reserva de Emergência")) {
    recommendations.push({
      id: "reserva_emergencia",
      title: "Reserva de Emergência",
      description: "Ter um fundo para imprevistos é o passo número um para a segurança financeira.",
      suggestedValue: 500,
      priority: "high"
    });
  }

  if (canSuggest("Investimentos") && canSuggest("Poupança")) {
    recommendations.push({
      id: "investimentos",
      title: "Investimentos",
      description: "Pague-se primeiro! Defina uma meta para guardar dinheiro todo mês.",
      suggestedValue: 300,
      priority: "medium"
    });
  }

  return recommendations.sort((a, b) => a.priority === 'high' ? -1 : 1).slice(0, 2);
}
