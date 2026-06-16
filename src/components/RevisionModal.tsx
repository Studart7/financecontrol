import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Icons } from '../lib/icons';

interface RevisionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { date: string; name: string; cat: string; val: number }) => void;
  onSkip?: () => void;
  queuePosition?: number;
  queueTotal?: number;
  initialData: {
    date: string;
    name: string;
    cat: string;
    val: number;
    preview: string | null;
  } | null;
}

export const RevisionModal: React.FC<RevisionModalProps> = ({ isOpen, onClose, onSave, onSkip, queuePosition, queueTotal, initialData }) => {
  const [formData, setFormData] = useState({
    date: '',
    name: '',
    cat: '',
    val: 0
  });

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  if (!isOpen) return null;

  const hasMultiple = queueTotal && queueTotal > 1;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-surface-dim/80 backdrop-blur-sm">
        <motion.div
          key={queuePosition}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-surface-container-lowest p-6 rounded-2xl shadow-xl w-full max-w-sm border border-outline-variant/20"
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-headline font-bold text-on-surface">Revisar Leitura</h2>
            <button onClick={onClose} className="text-secondary hover:text-primary transition-colors">
              <Icons.Close size={20} />
            </button>
          </div>

          {hasMultiple && (
            <div className="flex items-center gap-2 mb-4">
              <div className="flex-1 flex gap-1">
                {Array.from({ length: queueTotal! }).map((_, i) => (
                  <div
                    key={i}
                    className={`h-1.5 flex-1 rounded-full transition-colors ${
                      i < (queuePosition || 0) ? 'bg-primary' : 'bg-surface-container-low'
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs font-bold text-secondary whitespace-nowrap">
                {queuePosition} de {queueTotal}
              </span>
            </div>
          )}

          <p className="text-sm text-secondary mb-6">
            {hasMultiple
              ? `Gasto ${queuePosition} de ${queueTotal} encontrado na imagem. Verifique e confirme.`
              : 'A Inteligência Artificial extraiu os seguintes dados da nota. Verifique e edite se necessário antes de salvar.'
            }
          </p>

          {initialData?.preview && (
            <div className="mb-6 rounded-xl overflow-hidden border border-outline-variant/30 flex justify-center bg-surface-container-low h-48">
              <img src={initialData.preview} alt="Nota Fiscal" className="object-contain h-full" />
            </div>
          )}

          <div className="space-y-4 mb-8">
            <div>
              <label className="block text-xs font-bold font-body text-secondary mb-1">DATA</label>
              <input
                type="text"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full bg-surface-container-low border-b-2 border-outline-variant focus:border-primary px-3 py-2 outline-none rounded-t text-sm font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-bold font-body text-secondary mb-1">ESTABELECIMENTO</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-surface-container-low border-b-2 border-outline-variant focus:border-primary px-3 py-2 outline-none rounded-t text-sm font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-bold font-body text-secondary mb-1">CATEGORIA</label>
              <input
                type="text"
                value={formData.cat}
                onChange={(e) => setFormData({ ...formData, cat: e.target.value })}
                className="w-full bg-surface-container-low border-b-2 border-outline-variant focus:border-primary px-3 py-2 outline-none rounded-t text-sm font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-bold font-body text-secondary mb-1">VALOR (R$)</label>
              <input
                type="number"
                value={formData.val}
                onChange={(e) => setFormData({ ...formData, val: parseFloat(e.target.value) })}
                className="w-full bg-surface-container-low border-b-2 border-outline-variant focus:border-primary px-3 py-2 outline-none rounded-t text-sm font-medium"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3">
            {hasMultiple && onSkip ? (
              <button onClick={onSkip} className="px-5 py-2.5 text-sm font-medium text-secondary hover:bg-surface-container-low rounded-lg transition-colors">
                Pular
              </button>
            ) : (
              <button onClick={onClose} className="px-5 py-2.5 text-sm font-medium text-secondary hover:bg-surface-container-low rounded-lg transition-colors">
                Cancelar
              </button>
            )}
            <button onClick={() => onSave(formData)} className="px-5 py-2.5 text-sm font-bold bg-primary text-surface-container-lowest rounded-lg hover:bg-primary-container transition-colors shadow-sm">
              Confirmar
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
