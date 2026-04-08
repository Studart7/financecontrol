import React from 'react';
import { Icons } from '../lib/icons';
import { motion } from 'motion/react';

interface InicioProps {
  onOpenModal: () => void;
}

export const Inicio: React.FC<InicioProps> = ({ onOpenModal }) => {
  return (
    <motion.main 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-screen pt-12 pb-24 px-6 md:px-12 max-w-7xl mx-auto"
    >
      <div className="mb-16 max-w-3xl">
        <h1 className="font-headline text-5xl md:text-7xl font-bold text-on-surface leading-[1.1] mb-6 tracking-tight">
          Assuma o controle de suas finanças em <span className="text-primary italic">segundos.</span>
        </h1>
        <p className="text-secondary text-lg md:text-xl font-light max-w-xl">
          Transforme seus comprovantes e recibos em inteligência financeira imediata. O legado da sua saúde financeira começa aqui.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 bg-surface-container-low p-1 rounded-lg">
          <div className="bg-surface-container-lowest rounded-lg border-2 border-dashed border-outline-variant h-[450px] flex flex-col items-center justify-center text-center p-12 transition-all hover:border-primary group">
            <div className="w-20 h-20 bg-surface-container-low rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Icons.Upload className="text-primary" size={40} />
            </div>
            <h2 className="font-headline text-2xl font-semibold mb-3 text-on-surface">Arraste e solte seus recibos</h2>
            <p className="text-secondary mb-8 max-w-md">Formatos aceitos: PDF, JPEG, PNG. Limite de 10MB por arquivo para garantir a precisão do processamento.</p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button 
                onClick={onOpenModal}
                className="bg-gradient-to-br from-primary to-primary-container text-white px-8 py-4 rounded font-bold tracking-wide shadow-lg shadow-primary/10 hover:opacity-90 transition-all flex items-center gap-2"
              >
                <Icons.Add size={20} />
                Selecionar Arquivos
              </button>
              <button className="px-8 py-4 text-secondary font-semibold hover:bg-surface-container-low rounded transition-colors flex items-center gap-2">
                <Icons.Planilha size={20} />
                Acessar planilha existente
              </button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 flex flex-col gap-8">
          <div className="bg-surface-container-low p-8 rounded-lg shadow-sm">
            <h3 className="font-headline text-xl font-semibold mb-4 text-on-surface">Pronto para processar?</h3>
            <p className="text-secondary text-sm mb-6 leading-relaxed">Nossa IA editorial analisa cada linha do seu comprovante para categorizar gastos automaticamente.</p>
            <button className="w-full bg-surface-container-lowest border border-outline-variant text-secondary font-bold py-4 rounded hover:bg-white hover:text-primary transition-all flex items-center justify-center gap-2 mb-4">
              <Icons.Language size={20} />
              Enviar para Análise
            </button>
            <div className="mt-8">
              <div className="flex justify-between items-end mb-2">
                <span className="font-body text-[10px] uppercase tracking-widest text-secondary font-bold">Quota Mensal de IA</span>
                <span className="font-body text-[10px] text-tertiary font-bold">85%</span>
              </div>
              <div className="h-1 w-full bg-surface-variant rounded-full overflow-hidden">
                <div className="h-full bg-tertiary rounded-full" style={{ width: '85%' }}></div>
              </div>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-lg aspect-square lg:aspect-auto flex-grow min-h-[240px]">
            <img 
              alt="Financial planning" 
              className="absolute inset-0 w-full h-full object-cover grayscale brightness-50" 
              src="https://picsum.photos/seed/planning/600/600"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-on-surface/80 to-transparent p-8 flex flex-col justify-end">
              <span className="text-primary-container text-xs font-bold uppercase tracking-[0.2em] mb-2">Dica Financeira</span>
              <h4 className="text-white font-headline text-lg font-bold">Mantenha a consistência.</h4>
              <p className="text-white/80 text-sm mt-2">Uploads diários aumentam a precisão das suas projeções anuais em até 40%.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-24 pt-12 border-t border-outline-variant/20">
        <div className="flex flex-wrap items-center justify-center gap-12 grayscale opacity-60">
          <div className="flex items-center gap-2">
            <Icons.Security size={20} className="text-secondary" />
            <span className="font-body text-[10px] uppercase font-bold tracking-widest text-secondary">SSL Encrypted</span>
          </div>
          <div className="flex items-center gap-2">
            <Icons.Privacy size={20} className="text-secondary" />
            <span className="font-body text-[10px] uppercase font-bold tracking-widest text-secondary">LGPD Compliant</span>
          </div>
          <div className="flex items-center gap-2">
            <Icons.Security size={20} className="text-secondary" />
            <span className="font-body text-[10px] uppercase font-bold tracking-widest text-secondary">256-Bit Security</span>
          </div>
          <div className="flex items-center gap-2">
            <Icons.Cloud size={20} className="text-secondary" />
            <span className="font-body text-[10px] uppercase font-bold tracking-widest text-secondary">Secure Cloud Backup</span>
          </div>
        </div>
      </div>
    </motion.main>
  );
};
