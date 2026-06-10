import React, { useState, useRef, useEffect } from 'react';
import { Icons } from '../lib/icons';
import { useFinance } from '../context/FinanceContext';
import { MONTH_NAMES_PT, MONTH_NAMES_SHORT_PT } from '../utils/date';
import { motion, AnimatePresence } from 'motion/react';

export const MonthSelector: React.FC = () => {
  const { selectedMonth, setSelectedMonth } = useFinance();
  const [isOpen, setIsOpen] = useState(false);
  const [popoverYear, setPopoverYear] = useState(selectedMonth.year);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setPopoverYear(selectedMonth.year);
  }, [selectedMonth.year, isOpen]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const goToPrevMonth = () => {
    if (selectedMonth.month === 0) {
      setSelectedMonth({ month: 11, year: selectedMonth.year - 1 });
    } else {
      setSelectedMonth({ month: selectedMonth.month - 1, year: selectedMonth.year });
    }
  };

  const goToNextMonth = () => {
    if (selectedMonth.month === 11) {
      setSelectedMonth({ month: 0, year: selectedMonth.year + 1 });
    } else {
      setSelectedMonth({ month: selectedMonth.month + 1, year: selectedMonth.year });
    }
  };

  const selectMonth = (mIndex: number) => {
    setSelectedMonth({ month: mIndex, year: popoverYear });
    setIsOpen(false);
  };

  const goToCurrentMonth = () => {
    const now = new Date();
    setSelectedMonth({ month: now.getMonth(), year: now.getFullYear() });
    setIsOpen(false);
  };

  const now = new Date();
  const isCurrentMonthGlobal = selectedMonth.month === now.getMonth() && selectedMonth.year === now.getFullYear();

  return (
    <div className="relative" ref={containerRef}>
      <div className="flex items-center gap-1">
        <button
          onClick={goToPrevMonth}
          className="p-2 text-secondary hover:text-primary hover:bg-surface-container-low rounded-lg transition-all"
          aria-label="Mês anterior"
        >
          <Icons.ChevronLeft size={18} />
        </button>
        
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`flex items-center justify-center gap-2 px-4 py-1.5 font-body text-sm font-bold tracking-wide rounded-lg transition-all min-w-[160px] text-center ${
            isCurrentMonthGlobal 
              ? 'bg-primary/10 text-primary' 
              : 'bg-surface-container-low text-on-surface hover:bg-primary/5'
          }`}
        >
          {MONTH_NAMES_PT[selectedMonth.month]} {selectedMonth.year}
          <Icons.ChevronLeft className={`transition-transform duration-300 ${isOpen ? 'rotate-90' : '-rotate-90'}`} size={14} />
        </button>

        <button
          onClick={goToNextMonth}
          className="p-2 text-secondary hover:text-primary hover:bg-surface-container-low rounded-lg transition-all"
          aria-label="Próximo mês"
        >
          <Icons.ChevronRight size={18} />
        </button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute top-full mt-2 left-1/2 -translate-x-1/2 z-50 bg-surface border border-outline-variant/30 shadow-2xl rounded-xl p-4 w-64"
          >
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-outline-variant/20">
              <button onClick={() => setPopoverYear(y => y - 1)} className="p-1.5 text-secondary hover:text-primary hover:bg-surface-container-low rounded">
                <Icons.ChevronLeft size={16} />
              </button>
              <span className="font-headline font-bold text-on-surface">{popoverYear}</span>
              <button onClick={() => setPopoverYear(y => y + 1)} className="p-1.5 text-secondary hover:text-primary hover:bg-surface-container-low rounded">
                <Icons.ChevronRight size={16} />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2 mb-4">
              {MONTH_NAMES_SHORT_PT.map((mName, i) => {
                const isSelected = selectedMonth.month === i && selectedMonth.year === popoverYear;
                const isCurrent = now.getMonth() === i && now.getFullYear() === popoverYear;
                return (
                  <button
                    key={i}
                    onClick={() => selectMonth(i)}
                    className={`py-2 text-xs font-bold uppercase rounded transition-colors ${
                      isSelected ? 'bg-primary text-white shadow-sm' : 
                      isCurrent ? 'bg-primary/10 text-primary hover:bg-primary/20' : 
                      'bg-surface-container-lowest text-secondary hover:bg-surface-container-low hover:text-on-surface'
                    }`}
                  >
                    {mName}
                  </button>
                )
              })}
            </div>

            <button
              onClick={goToCurrentMonth}
              className="w-full py-2 text-xs font-bold text-secondary bg-surface-container-low hover:bg-surface-variant hover:text-primary transition-colors rounded-lg flex items-center justify-center gap-2"
            >
              <Icons.Calendar size={14} />
              Ir para o mês atual
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
