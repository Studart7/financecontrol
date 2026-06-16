import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Icons } from '../lib/icons';
import { useFinance } from '../context/FinanceContext';
import { motion, AnimatePresence } from 'motion/react';

const API_URL = 'http://localhost:3001/api';

interface ChatMessage {
  id: number;
  role: 'user' | 'model';
  text: string;
  createdAt: string;
}

interface FullAIChatProps {
  isOpen: boolean;
  isMini?: boolean;
  onClose: () => void;
  onExpand?: () => void;
  onShrink?: () => void;
}

export const FullAIChat: React.FC<FullAIChatProps> = ({ isOpen, isMini, onClose, onExpand, onShrink }) => {
  const { refreshData } = useFinance();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    if (isOpen) {
      loadHistory();
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const loadHistory = async () => {
    setIsLoadingHistory(true);
    try {
      const res = await fetch(`${API_URL}/chat/history`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
      }
    } catch (error) {
      console.error('Error loading chat history:', error);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const clearHistory = async () => {
    try {
      await fetch(`${API_URL}/chat/history`, { method: 'DELETE' });
      setMessages([]);
    } catch (error) {
      console.error('Error clearing history:', error);
    }
  };

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || isLoading) return;

    const tempUserMsg: ChatMessage = {
      id: Date.now(),
      role: 'user',
      text,
      createdAt: new Date().toISOString()
    };
    setMessages(prev => [...prev, tempUserMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch(`${API_URL}/gemini/manager`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Erro ao processar mensagem.');
      }

      const aiMsg: ChatMessage = {
        id: Date.now() + 1,
        role: 'model',
        text: data.reply,
        createdAt: new Date().toISOString()
      };
      setMessages(prev => [...prev, aiMsg]);

      if (data.dataChanged) {
        await refreshData();
      }
    } catch (error: any) {
      const errorMsg: ChatMessage = {
        id: Date.now() + 1,
        role: 'model',
        text: `❌ Erro: ${error.message || 'Falha ao se comunicar com o assistente.'}`,
        createdAt: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  const formatMessageText = (text: string) => {
    return text.split('\n').map((line, i) => {
      const boldLine = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      return <p key={i} className="mb-1" dangerouslySetInnerHTML={{ __html: boldLine }} />;
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: isMini ? 20 : 0, scale: isMini ? 0.95 : 1 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: isMini ? 20 : 0, scale: isMini ? 0.95 : 1 }}
          transition={{ duration: 0.2 }}
          className={
            isMini
              ? "fixed bottom-24 right-6 z-50 w-[360px] h-[600px] max-h-[80vh] flex flex-col bg-surface rounded-3xl shadow-2xl border border-outline-variant/30 overflow-hidden"
              : "fixed inset-0 z-[100] flex flex-col bg-surface"
          }
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-primary to-primary-container px-4 py-3 flex items-center justify-between shadow-lg flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center">
                <Icons.Bot size={18} className="text-white" />
              </div>
              <div>
                <h1 className="text-white font-headline font-bold text-sm">Secretário IA</h1>
                {!isMini && <p className="text-white/60 text-xs font-body">Seu assistente inteligente de finanças</p>}
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={clearHistory}
                className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                title="Nova conversa"
              >
                <Icons.Reset size={16} />
              </button>
              {isMini && onExpand && (
                <button
                  onClick={onExpand}
                  className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                  title="Expandir"
                >
                  <Icons.Maximize size={16} />
                </button>
              )}
              {!isMini && onShrink && (
                <button
                  onClick={onShrink}
                  className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                  title="Reduzir"
                >
                  <Icons.Minimize size={16} />
                </button>
              )}
              <button
                onClick={onClose}
                className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                title="Fechar"
              >
                <Icons.Close size={16} />
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto">
            <div className={`max-w-3xl mx-auto px-4 py-6 space-y-6 ${isMini ? 'text-sm' : ''}`}>
              {isLoadingHistory ? (
                <div className="flex items-center justify-center py-20">
                  <div className="w-8 h-8 border-3 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                    <Icons.Bot size={32} className="text-primary" />
                  </div>
                  <h2 className="text-lg font-headline font-bold text-on-surface mb-2">
                    Olá! Eu sou seu Secretário Financeiro 👋
                  </h2>
                  <p className="text-secondary text-sm max-w-sm leading-relaxed mb-6">
                    Posso criar e gerenciar seus gastos e metas, consultar suas finanças e oferecer conselhos. Experimente me pedir algo!
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-md">
                    {[
                      "Meus gastos deste mês?",
                      "Crie uma meta de 3000",
                      "Adicione 50 no Ifood",
                      "Dicas para economizar"
                    ].map((suggestion, i) => (
                      <button
                        key={i}
                        onClick={() => { setInput(suggestion); inputRef.current?.focus(); }}
                        className="text-left p-2.5 bg-surface-container-low border border-outline-variant/20 rounded-xl text-xs text-on-surface hover:bg-surface-variant/50 hover:border-primary/30 transition-all"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                messages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                      {/* Avatar */}
                      <div className={`w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center ${
                        msg.role === 'user' 
                          ? 'bg-primary/10 text-primary' 
                          : 'bg-tertiary/10 text-tertiary'
                      }`}>
                        {msg.role === 'user' 
                          ? <Icons.Account size={16} />
                          : <Icons.Bot size={16} />
                        }
                      </div>
                      {/* Bubble */}
                      <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                        msg.role === 'user'
                          ? 'bg-primary text-white rounded-tr-md'
                          : 'bg-surface-container-low border border-outline-variant/20 text-on-surface rounded-tl-md'
                      }`}>
                        <div className="chat-message-content">
                          {formatMessageText(msg.text)}
                        </div>
                        <p className={`text-[10px] mt-1.5 ${
                          msg.role === 'user' ? 'text-white/50' : 'text-secondary/50'
                        }`}>
                          {formatTime(msg.createdAt)}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}

              {/* Typing indicator */}
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-start"
                >
                  <div className="flex gap-3 items-start">
                    <div className="w-8 h-8 rounded-lg bg-tertiary/10 flex items-center justify-center flex-shrink-0">
                      <Icons.Bot size={16} className="text-tertiary" />
                    </div>
                    <div className="bg-surface-container-low border border-outline-variant/20 rounded-2xl rounded-tl-md px-5 py-4">
                      <div className="flex gap-1.5">
                        <span className="w-2 h-2 bg-secondary/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                        <span className="w-2 h-2 bg-secondary/40 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                        <span className="w-2 h-2 bg-secondary/40 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Input Area */}
          <div className="flex-shrink-0 bg-surface/80 backdrop-blur-md border-t border-outline-variant/10">
            <div className={`max-w-3xl mx-auto px-4 ${isMini ? 'py-3' : 'py-5'}`}>
              <div className="relative flex items-end w-full bg-surface-container-low border border-outline-variant/40 rounded-3xl shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary/50 transition-all duration-300">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={e => {
                    setInput(e.target.value);
                    e.target.style.height = '52px';
                    const scrollHeight = e.target.scrollHeight;
                    e.target.style.height = scrollHeight > 52 ? `${Math.min(scrollHeight, 150)}px` : '52px';
                  }}
                  onKeyDown={handleKeyDown}
                  placeholder="Mensagem para o Secretário IA..."
                  className="w-full bg-transparent px-6 py-4 pr-14 text-sm outline-none resize-none text-on-surface placeholder-secondary/50"
                  style={{ minHeight: '52px', height: '52px' }}
                  disabled={isLoading}
                />
                <div className="absolute right-2 bottom-2">
                  <button
                    onClick={sendMessage}
                    disabled={!input.trim() || isLoading}
                    className="w-9 h-9 flex items-center justify-center bg-primary text-white rounded-full shadow-md hover:bg-primary-container hover:scale-105 active:scale-95 transition-all duration-200 disabled:opacity-30 disabled:hover:scale-100 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    ) : (
                      <Icons.Send size={16} className={input.trim() ? "translate-x-0.5" : ""} />
                    )}
                  </button>
                </div>
              </div>
              <div className="mt-2.5 text-center">
                <span className="text-[10px] text-secondary/50 font-medium">
                  A IA pode cometer erros. Verifique as informações importantes.
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
