import React, { useState, useRef, useEffect } from 'react';
import { Icons } from '../lib/icons';
import { useFinance } from '../context/FinanceContext';
import { motion, AnimatePresence } from 'motion/react';

const API_URL = 'http://localhost:3001/api';

export const AIChatWidget: React.FC = () => {
  const { goals, addTransaction } = useFinance();
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Clear success message after 3 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!message.trim() || isLoading) return;

    setIsLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      const categories = goals.map(g => g.title);
      
      const res = await fetch(`${API_URL}/gemini/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: message, categories })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Erro ao processar mensagem.');
      }

      if (data.transactions && Array.isArray(data.transactions)) {
        let count = 0;
        for (const tx of data.transactions) {
          const matchedGoal = goals.find(g => g.title.toLowerCase() === (tx.cat || '').toLowerCase());
          const newTx = {
            id: Date.now() + Math.floor(Math.random() * 1000), // temp id
            date: tx.date || new Date().toISOString().split('T')[0],
            name: tx.name,
            cat: matchedGoal ? matchedGoal.title : 'Geral',
            val: tx.val,
            status: 'Liquidado' as const,
            iconKey: matchedGoal ? matchedGoal.iconKey : 'Outros'
          };
          addTransaction(newTx);
          count++;
        }
        
        setSuccessMessage(`${count} gasto(s) adicionado(s) com sucesso!`);
        setMessage(''); // Clear input after success
      } else {
        throw new Error('Nenhuma transação encontrada na resposta.');
      }
    } catch (err: any) {
      setError(err.message || 'Erro inesperado.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="bg-surface border border-outline-variant/30 shadow-2xl rounded-2xl w-[340px] mb-4 overflow-hidden flex flex-col"
          >
            <div className="bg-gradient-to-br from-primary to-primary-container p-4 text-white flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Icons.Lightbulb size={20} />
                <h3 className="font-headline font-bold text-sm">Assistente de Gastos IA</h3>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-white/70 hover:text-white transition-colors"
              >
                <Icons.Close size={20} />
              </button>
            </div>
            
            <div className="p-4 bg-surface-container-lowest flex-1 max-h-[300px] overflow-y-auto">
              <p className="text-xs text-secondary mb-4 leading-relaxed">
                Escreva seus gastos e eu os organizarei automaticamente. Ex: <span className="italic text-on-surface font-medium">"Ifood 45, farmácia 120 e cinema 80 reais"</span>.
              </p>

              {successMessage && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-4 p-3 bg-tertiary/10 border border-tertiary/20 text-tertiary rounded-xl text-xs font-medium flex items-center gap-2">
                  <Icons.Check size={16} />
                  {successMessage}
                </motion.div>
              )}

              {error && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-4 p-3 bg-error/10 border border-error/20 text-error rounded-xl text-xs font-medium flex items-center gap-2">
                  <Icons.Warning size={16} />
                  {error}
                </motion.div>
              )}
            </div>

            <form onSubmit={handleSubmit} className="p-3 bg-surface border-t border-outline-variant/20 flex gap-2 items-end">
              <textarea
                ref={inputRef}
                value={message}
                onChange={e => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Descreva seus gastos..."
                className="flex-1 bg-surface-container-low border border-outline-variant/30 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-primary resize-none min-h-[44px] max-h-[120px]"
                rows={1}
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={!message.trim() || isLoading}
                className="p-3 bg-primary text-white rounded-xl shadow-sm hover:bg-primary-container transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <Icons.TrendingUp size={20} />
                )}
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-gradient-to-br from-primary to-primary-container text-white rounded-full shadow-xl flex items-center justify-center hover:shadow-2xl transition-shadow"
      >
        {isOpen ? <Icons.Close size={24} /> : <Icons.Receipt size={24} />}
      </motion.button>
    </div>
  );
};
