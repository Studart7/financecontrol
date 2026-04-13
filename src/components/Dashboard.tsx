import React from 'react';
import { Icons } from '../lib/icons';
import { motion } from 'motion/react';
import { useFinance } from '../context/FinanceContext';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const Dashboard: React.FC = () => {
  const { goals, transactions } = useFinance();

  // Ensuring we compute totalGasto consistently from goals as `Metas.tsx` does
  const enrichedGoals = goals.map(goal => {
    const categoryTransactions = transactions.filter(t => t.cat.toLowerCase() === goal.title.toLowerCase());
    const val = categoryTransactions.reduce((acc, curr) => acc + curr.val, 0);
    return { ...goal, val };
  });

  const totalGasto = enrichedGoals.reduce((acc, curr) => acc + curr.val, 0);
  const totalMeta = enrichedGoals.reduce((acc, curr) => acc + curr.meta, 0);
  const totalProgress = totalMeta > 0 ? (totalGasto / totalMeta) * 100 : 0;
  
  // Configuração da Distribuição de Gastos com SVG dinamico
  const distItems = enrichedGoals.map(g => {
     const pt = totalGasto > 0 ? (g.val / totalGasto) * 100 : 0;
     // SVG colors mapping based on tailwind classes just for visuals if needed, 
     // but we can map hex colors so the SVG circles can render properly natively:
     let hexColor = '#95433b'; // default error/primaryish
     if (g.color.includes('primary')) hexColor = '#7a5336';
     if (g.color.includes('tertiary')) hexColor = '#d7c3b6';
     if (g.color.includes('secondary')) hexColor = '#6e5a56';
     if (g.color.includes('outline')) hexColor = '#eae2cb';
     if (g.color.includes('error')) hexColor = '#c44536';
     
     return {
        label: g.title,
        val: `${Math.round(pt)}%`,
        rawVal: pt,
        color: g.color || 'bg-surface-variant',
        hexColor
     };
  }).sort((a,b) => b.rawVal - a.rawVal);

  let accumulatedOffset = 0;
  const svgCircles = distItems.filter(item => item.rawVal > 0).map((item, index) => {
      // Circle circumference for R=12 is approx 75.398
      const circumference = 2 * Math.PI * 12;
      const strokeDasharray = `${(item.rawVal / 100) * circumference} ${circumference}`;
      const strokeDashoffset = -accumulatedOffset;
      accumulatedOffset += (item.rawVal / 100) * circumference;
      
      return (
        <circle 
          key={index}
          cx="16" cy="16" fill="transparent" r="12" 
          stroke={item.hexColor} 
          strokeDasharray={strokeDasharray} 
          strokeDashoffset={strokeDashoffset} 
          strokeWidth="8"
          className="transition-all duration-1000 ease-out"
        ></circle>
      );
  });

  // Gasto vs Meta
  const gastoMetaItems = enrichedGoals.map(goal => {
     const maxVal = Math.max(goal.val, goal.meta);
     const progPct = maxVal > 0 ? (goal.val / maxVal) * 100 : 0;
     const metaPct = maxVal > 0 ? (goal.meta / maxVal) * 100 : 0;
     return {
        label: goal.title,
        val: `R$ ${goal.val.toLocaleString('pt-BR')} / R$ ${goal.meta.toLocaleString('pt-BR')}`,
        gastoNum: goal.val,
        metaNum: goal.meta,
        progress: `${Math.min(progPct, 100)}%`,
        meta: `${Math.min(metaPct, 100)}%`
     }
  });

  const exportPDF = () => {
    const doc = new jsPDF('p', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    let y = margin;

    // --- Header band ---
    doc.setFillColor(149, 67, 59); // #95433b primary
    doc.rect(0, 0, pageWidth, 36, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.text('FinanceControl', margin, 16);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Relatório Financeiro Executivo', margin, 24);
    const today = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
    doc.text(`Gerado em ${today}`, pageWidth - margin, 24, { align: 'right' });
    
    y = 48;

    // --- Executive Summary ---
    doc.setTextColor(31, 28, 13); // on-surface
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('Resumo Executivo', margin, y);
    y += 10;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(80, 80, 80);

    const summaryData = [
      ['Total Gasto no Período', `R$ ${totalGasto.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`],
      ['Meta Total', `R$ ${totalMeta.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`],
      ['Progresso do Orçamento', `${Math.round(totalProgress)}%`],
      ['Situação', totalGasto > totalMeta ? 'Acima do Orçamento' : 'Dentro do Orçamento'],
      ['Média Diária', `R$ ${Math.round(totalGasto / 30).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`],
      ['Total de Transações', `${transactions.length}`],
    ];

    autoTable(doc, {
      startY: y,
      head: [['Indicador', 'Valor']],
      body: summaryData,
      margin: { left: margin, right: margin },
      theme: 'grid',
      headStyles: { fillColor: [149, 67, 59], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 9 },
      bodyStyles: { fontSize: 9, textColor: [50, 50, 50] },
      alternateRowStyles: { fillColor: [250, 245, 235] },
      columnStyles: { 0: { fontStyle: 'bold', cellWidth: 80 } },
    });

    y = (doc as any).lastAutoTable.finalY + 14;

    // --- Distribution ---
    doc.setTextColor(31, 28, 13);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('Distribuição de Gastos por Categoria', margin, y);
    y += 8;

    const distData = distItems.filter(d => d.rawVal > 0).map(d => [
      d.label,
      d.val,
      `R$ ${enrichedGoals.find(g => g.title === d.label)?.val.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}`,
    ]);

    autoTable(doc, {
      startY: y,
      head: [['Categoria', '% do Total', 'Valor (R$)']],
      body: distData,
      margin: { left: margin, right: margin },
      theme: 'striped',
      headStyles: { fillColor: [122, 83, 54], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 9 },
      bodyStyles: { fontSize: 9, textColor: [50, 50, 50] },
      alternateRowStyles: { fillColor: [250, 245, 235] },
    });

    y = (doc as any).lastAutoTable.finalY + 14;

    // --- Budget Comparison ---
    doc.setTextColor(31, 28, 13);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('Comparativo: Gasto vs Meta', margin, y);
    y += 8;

    const budgetData = gastoMetaItems.map(item => {
      const diff = item.metaNum - item.gastoNum;
      const status = diff >= 0 ? 'Dentro' : 'Acima';
      return [
        item.label,
        `R$ ${item.gastoNum.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
        `R$ ${item.metaNum.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
        `R$ ${Math.abs(diff).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
        status,
      ];
    });

    autoTable(doc, {
      startY: y,
      head: [['Categoria', 'Gasto', 'Meta', 'Diferença', 'Status']],
      body: budgetData,
      margin: { left: margin, right: margin },
      theme: 'grid',
      headStyles: { fillColor: [149, 67, 59], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 9 },
      bodyStyles: { fontSize: 9, textColor: [50, 50, 50] },
      alternateRowStyles: { fillColor: [250, 245, 235] },
      didParseCell: (data: any) => {
        if (data.section === 'body' && data.column.index === 4) {
          if (data.cell.raw === 'Acima') {
            data.cell.styles.textColor = [186, 26, 26];
            data.cell.styles.fontStyle = 'bold';
          } else {
            data.cell.styles.textColor = [34, 120, 60];
            data.cell.styles.fontStyle = 'bold';
          }
        }
      }
    });

    // --- Footer ---
    const pageCount = doc.internal.pages.length - 1;
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.setFont('helvetica', 'normal');
      doc.text(`FinanceControl © ${new Date().getFullYear()} — Documento gerado automaticamente. Uso exclusivo para consulta pessoal.`, margin, doc.internal.pageSize.getHeight() - 10);
      doc.text(`Página ${i} de ${pageCount}`, pageWidth - margin, doc.internal.pageSize.getHeight() - 10, { align: 'right' });
    }

    doc.save(`FinanceControl_Relatorio_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  return (
    <motion.main 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-7xl mx-auto px-8 py-10 space-y-10"
    >
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <span className="font-body text-xs uppercase tracking-[0.2em] text-secondary opacity-70">Painel Executivo</span>
          <h1 className="font-headline text-5xl font-extrabold text-on-surface tracking-tight mt-1">Resumo Financeiro</h1>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={exportPDF}
            className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-br from-primary to-primary-container text-surface-container-lowest font-semibold rounded-lg shadow-sm hover:shadow-md transition-all active:scale-[0.98]"
          >
            <Icons.Download size={20} />
            Exportar PDF
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        <div className="md:col-span-8 bg-surface-container-lowest p-8 rounded-xl shadow-[0_32px_64px_-15px_rgba(31,28,13,0.06)] relative overflow-hidden flex flex-col justify-between min-h-[320px]">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-20 -mt-20 blur-3xl"></div>
          <div className="relative z-10">
            <p className="font-body text-sm font-bold text-secondary uppercase tracking-widest mb-4">Total Gasto no Período</p>
            <div className="flex items-baseline gap-4">
              <h2 className="font-headline text-6xl font-bold text-primary tracking-tighter">
                R$ {totalGasto.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </h2>
              <div className="flex items-center gap-1 text-tertiary bg-surface-container-low px-2 py-1 rounded-full text-xs font-bold">
                <Icons.TrendingDown size={14} />
                12%
              </div>
            </div>
            <p className="text-secondary font-body mt-2 max-w-md">Seus gastos estão {totalGasto > totalMeta ? 'acima' : 'abaixo'} da meta projetada para este mês.</p>
          </div>
          <div className="relative z-10 mt-8">
            <div className="flex justify-between items-end mb-2">
              <span className="font-body text-xs font-bold text-secondary">Progresso do Orçamento Mensal</span>
              <span className="font-body text-sm font-bold text-primary">{Math.round(totalProgress)}% UTILIZADO</span>
            </div>
            <div className="w-full h-3 bg-surface-container-low rounded-full overflow-hidden">
              <div className={`h-full rounded-full transition-all duration-1000 ${totalProgress > 100 ? 'bg-error' : 'bg-gradient-to-r from-tertiary to-tertiary-container'}`} style={{ width: `${Math.min(totalProgress, 100)}%` }}></div>
            </div>
          </div>
        </div>

        <div className="md:col-span-4 bg-surface-container-low p-8 rounded-xl space-y-6">
          <h3 className="font-headline text-xl font-semibold text-on-surface">Insights do Mês</h3>
          <div className="space-y-4">
            {[
              { title: 'Aumento em Refeições', desc: 'Gastos com alimentação fora de casa subiram 25% esta semana.', icon: Icons.Warning, color: 'text-error', border: 'border-error' },
              { title: 'Oportunidade de Poupança', desc: 'Sua conta de energia está 15% menor que o previsto. Deseja investir o excedente?', icon: Icons.TrendingDown, color: 'text-tertiary', border: 'border-tertiary' },
              { title: 'Gasto Lazer Aumentando', desc: 'Cuidado extra com as atividades culturais e shows esse mês.', icon: Icons.Outros || Icons.Warning, color: 'text-primary', border: 'border-primary' },
            ].map((insight, i) => {
              const InsightIcon = insight.icon;
              return (
              <div key={i} className={`flex gap-4 p-4 bg-surface-container-lowest rounded-lg border-l-4 ${insight.border} shadow-sm`}>
                <InsightIcon className={insight.color} size={20} />
                <div>
                  <p className="font-body text-sm font-bold text-on-surface">{insight.title}</p>
                  <p className="text-xs text-secondary mt-1">{insight.desc}</p>
                </div>
              </div>
            )})}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-surface-container-lowest p-8 rounded-xl shadow-sm flex flex-col md:flex-row gap-8 items-center">
          <div className="w-48 h-48 relative flex items-center justify-center">
            <svg className="absolute inset-0 w-full h-full transform -rotate-90" viewBox="0 0 32 32">
              {svgCircles}
              <circle cx="16" cy="16" className="fill-surface-container-lowest" r="8"></circle>
            </svg>
            <div className="flex flex-col items-center relative z-10">
              <span className="font-headline text-2xl font-bold text-on-surface">{distItems.filter(i => i.rawVal > 0).length}</span>
              <span className="font-body text-[10px] uppercase text-secondary">Categorias</span>
            </div>
          </div>
          <div className="flex-1 w-full space-y-4">
            <h3 className="font-headline text-lg font-semibold mb-2">Distribuição de Gastos</h3>
            <div className="space-y-3">
              {distItems.slice(0,5).map((item, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
                    <span className="font-body text-sm text-on-surface">{item.label}</span>
                  </div>
                  <span className="font-body font-bold text-on-surface">{item.val}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-surface-container-lowest p-8 rounded-xl shadow-sm space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="font-headline text-lg font-semibold">Gasto vs Meta</h3>
            <div className="flex gap-4">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span className="text-[10px] font-body text-secondary uppercase">Gasto</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-surface-variant rounded-full"></div>
                <span className="text-[10px] font-body text-secondary uppercase">Meta</span>
              </div>
            </div>
          </div>
          <div className="space-y-6 h-48 overflow-y-auto pr-2">
            {gastoMetaItems.map((item, i) => (
              <div key={i} className="space-y-1">
                <div className="flex justify-between text-xs font-body uppercase text-secondary mb-1">
                  <span>{item.label}</span>
                  <span className="text-primary font-bold">{item.val}</span>
                </div>
                <div className="relative h-2 bg-surface-container-low rounded-full overflow-hidden">
                  <div className="absolute inset-y-0 left-0 bg-surface-variant z-0 rounded-full transition-all duration-1000" style={{ width: item.meta }}></div>
                  <div className="absolute inset-y-0 left-0 bg-primary z-10 rounded-full transition-all duration-1000" style={{ width: item.progress }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        {[
          { label: 'Média Diária', val: `R$ ${Math.round(totalGasto / 30)}`, icon: Icons.Inicio, border: 'border-b-2 border-primary' },
          { label: 'Maior Gasto (Dia)', val: 'R$ 600,00', icon: Icons.ShoppingBag, border: 'border-b-2 border-primary' },
          { label: 'Freq. Transações', val: `${transactions.length} no mês`, icon: Icons.History, border: 'border-b-2 border-primary' },
          { label: 'Economia Projetada', val: 'R$ 320,00', icon: Icons.Metas, color: 'text-tertiary', border: 'border-b-2 border-primary' },
        ].map((card, i) => (
          <div key={i} className={`bg-surface-container-low p-6 rounded-lg flex flex-col gap-2 ${card.border || ''}`}>
            <card.icon className={card.color || 'text-secondary'} size={20} />
            <span className="font-body text-xs font-bold text-secondary uppercase opacity-70">{card.label}</span>
            <span className="font-headline text-xl font-bold text-on-surface">{card.val}</span>
          </div>
        ))}
      </div>
    </motion.main>
  );
};
