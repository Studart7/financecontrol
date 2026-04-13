import React, { useRef, useState, useCallback } from 'react';
import { Icons } from '../lib/icons';
import { motion, AnimatePresence } from 'motion/react';
import type { ConfirmedFile } from './RevisionModal';

export interface UploadedFile {
  id: string;
  file: File;
  preview: string | null; // data URL for images, null for PDFs
  name: string;
  size: string;
  type: string;
}

interface InicioProps {
  onSendForAnalysis: (files: UploadedFile[]) => void;
  confirmedFiles: ConfirmedFile[];
  onClearConfirmed: () => void;
}

const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const ACCEPTED_TYPES = ['application/pdf', 'image/jpeg', 'image/png'];
const ACCEPTED_EXTENSIONS = '.pdf,.jpg,.jpeg,.png';

export const Inicio: React.FC<InicioProps> = ({ onSendForAnalysis, confirmedFiles, onClearConfirmed }) => {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFiles = useCallback((fileList: FileList | null) => {
    if (!fileList) return;

    const validFiles = Array.from(fileList).filter(f => ACCEPTED_TYPES.includes(f.type));

    validFiles.forEach(file => {
      const uploadedFile: UploadedFile = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        file,
        preview: null,
        name: file.name,
        size: formatFileSize(file.size),
        type: file.type,
      };

      // Generate preview for images
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setFiles(prev => prev.map(f => 
            f.id === uploadedFile.id ? { ...f, preview: e.target?.result as string } : f
          ));
        };
        reader.readAsDataURL(file);
      }

      setFiles(prev => [...prev, uploadedFile]);
    });
  }, []);

  const handleSelectFiles = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    processFiles(e.target.files);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    processFiles(e.dataTransfer.files);
  }, [processFiles]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  const handleSendForAnalysis = () => {
    if (files.length === 0) return;
    onSendForAnalysis(files);
    setFiles([]); // Clear files after sending so confirmation can take over
  };

  const handleNewUpload = () => {
    onClearConfirmed();
    setFiles([]);
  };

  const hasFiles = files.length > 0;
  const hasConfirmed = confirmedFiles.length > 0;

  return (
    <motion.main 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-screen pt-12 pb-24 px-6 md:px-12 max-w-7xl mx-auto"
    >
      {/* Hidden native file input */}
      <input 
        ref={fileInputRef}
        type="file" 
        accept={ACCEPTED_EXTENSIONS}
        multiple
        onChange={handleFileChange}
        className="hidden"
      />

      <div className="mb-16 max-w-3xl">
        <h1 className="font-headline text-5xl md:text-7xl font-bold text-on-surface leading-[1.1] mb-6 tracking-tight">
          Assuma o controle de suas finanças em <span className="text-primary italic">segundos.</span>
        </h1>
        <p className="text-secondary text-lg md:text-xl font-light max-w-xl">
          Transforme seus comprovantes e recibos em inteligência financeira imediata. O legado da sua saúde financeira começa aqui.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8">
          <div 
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={`bg-surface-container-lowest rounded-xl border-2 border-dashed transition-all shadow-sm min-h-[450px] flex flex-col ${
              isDragging 
                ? 'border-primary bg-primary/5 scale-[1.01]' 
                : hasFiles 
                  ? 'border-outline-variant/50' 
                  : 'border-outline-variant hover:border-primary'
            }`}
          >
            {hasConfirmed ? (
              /* Confirmation state — transactions created */
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex-1 flex flex-col p-8"
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 bg-tertiary/10 rounded-full flex items-center justify-center">
                    <Icons.Check size={28} className="text-tertiary" />
                  </div>
                  <div>
                    <h3 className="font-headline text-xl font-bold text-on-surface">
                      {confirmedFiles.length} {confirmedFiles.length === 1 ? 'transação registrada' : 'transações registradas'}
                    </h3>
                    <p className="text-sm text-secondary">Os recibos foram processados e adicionados à planilha com sucesso.</p>
                  </div>
                </div>

                <div className="space-y-3 mb-8 max-h-[260px] overflow-y-auto">
                  {confirmedFiles.map((cf, i) => (
                    <div key={i} className="flex items-center gap-4 bg-surface-container-low p-4 rounded-lg border-l-4 border-tertiary">
                      <div className="flex-1 min-w-0">
                        <p className="font-body font-semibold text-on-surface text-sm truncate">{cf.establishment}</p>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-xs text-secondary">{cf.fileName}</span>
                          <span className="text-xs text-secondary px-2 py-0.5 bg-surface-variant/50 rounded-full uppercase font-bold tracking-wider">{cf.category}</span>
                        </div>
                      </div>
                      <span className="font-headline font-bold text-primary whitespace-nowrap">R$ {cf.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                    </div>
                  ))}
                </div>

                <button 
                  onClick={handleNewUpload}
                  className="bg-gradient-to-br from-primary to-primary-container text-surface-container-lowest px-8 py-4 rounded-lg font-bold tracking-wide shadow-lg shadow-primary/10 hover:shadow-md transition-all flex items-center gap-2 active:scale-[0.98] self-center"
                >
                  <Icons.Upload size={20} />
                  Processar Novos Recibos
                </button>
              </motion.div>
            ) : !hasFiles ? (
              /* Empty state — dropzone */
              <div className="flex-1 flex flex-col items-center justify-center text-center p-12 group">
                <div className="w-20 h-20 bg-surface-container-low rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Icons.Upload className="text-primary" size={40} />
                </div>
                <h2 className="font-headline text-2xl font-semibold mb-3 text-on-surface">Arraste e solte seus recibos</h2>
                <p className="text-secondary mb-8 max-w-md">Formatos aceitos: PDF, JPEG, PNG. Limite de 10MB por arquivo para garantir a precisão do processamento.</p>
                <button 
                  onClick={handleSelectFiles}
                  className="bg-gradient-to-br from-primary to-primary-container text-surface-container-lowest px-8 py-4 rounded-lg font-bold tracking-wide shadow-lg shadow-primary/10 hover:shadow-md transition-all flex items-center gap-2 active:scale-[0.98]"
                >
                  <Icons.Add size={20} />
                  Selecionar Arquivos
                </button>
              </div>
            ) : (
              /* Files loaded state */
              <div className="flex flex-col h-full">
                {/* Header */}
                <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-outline-variant/20">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <Icons.Upload className="text-primary" size={20} />
                    </div>
                    <div>
                      <h3 className="font-headline font-bold text-on-surface">
                        {files.length} {files.length === 1 ? 'arquivo selecionado' : 'arquivos selecionados'}
                      </h3>
                      <p className="text-xs text-secondary">Prontos para processamento pela IA</p>
                    </div>
                  </div>
                  <button 
                    onClick={handleSelectFiles}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-primary border border-primary/30 rounded-lg hover:bg-primary/5 transition-all"
                  >
                    <Icons.Add size={16} />
                    Adicionar
                  </button>
                </div>

                {/* File list */}
                <div className="flex-1 overflow-y-auto p-6 space-y-3">
                  <AnimatePresence>
                    {files.map((f) => (
                      <motion.div 
                        key={f.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="flex items-center gap-4 bg-surface-container-low p-4 rounded-lg group/item"
                      >
                        {/* Thumbnail */}
                        <div className="w-14 h-14 rounded-lg overflow-hidden bg-surface-variant flex items-center justify-center flex-shrink-0">
                          {f.preview ? (
                            <img src={f.preview} alt={f.name} className="w-full h-full object-cover" />
                          ) : (
                            <Icons.Planilha size={24} className="text-primary" />
                          )}
                        </div>

                        {/* File info */}
                        <div className="flex-1 min-w-0">
                          <p className="font-body font-semibold text-on-surface text-sm truncate">{f.name}</p>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-xs text-secondary">{f.size}</span>
                            <span className="text-xs text-secondary px-2 py-0.5 bg-surface-variant/50 rounded-full uppercase font-bold tracking-wider">
                              {f.type.split('/')[1]}
                            </span>
                          </div>
                        </div>

                        {/* Check + remove */}
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-tertiary/10 rounded-full flex items-center justify-center">
                            <Icons.Check size={14} className="text-tertiary" />
                          </div>
                          <button 
                            onClick={() => removeFile(f.id)}
                            className="p-2 text-secondary hover:text-error rounded-lg opacity-0 group-hover/item:opacity-100 transition-all"
                          >
                            <Icons.Close size={16} />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>

                {/* Drag more hint */}
                <div className="px-6 pb-4 pt-2 border-t border-outline-variant/10">
                  <p className="text-xs text-secondary text-center italic">Arraste mais arquivos aqui ou clique em "Adicionar" acima</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-4 flex flex-col gap-8">
          <div className="bg-surface-container-low p-8 rounded-lg shadow-sm">
            <h3 className="font-headline text-xl font-semibold mb-4 text-on-surface">Pronto para processar?</h3>
            <p className="text-secondary text-sm mb-6 leading-relaxed">Nossa IA editorial analisa cada linha do seu comprovante para categorizar gastos automaticamente.</p>
            <button 
              onClick={handleSendForAnalysis}
              disabled={!hasFiles}
              className={`w-full font-bold py-4 rounded-lg transition-all flex items-center justify-center gap-2 mb-4 ${
                hasFiles 
                  ? 'bg-gradient-to-br from-primary to-primary-container text-surface-container-lowest shadow-sm hover:shadow-md active:scale-[0.98]' 
                  : 'bg-surface-container-lowest border border-outline-variant text-secondary cursor-not-allowed opacity-60'
              }`}
            >
              <Icons.Language size={20} />
              Enviar para Análise
            </button>
            {hasFiles && (
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-xs text-tertiary text-center font-medium"
              >
                {files.length} {files.length === 1 ? 'recibo' : 'recibos'} {files.length === 1 ? 'será processado' : 'serão processados'}
              </motion.p>
            )}
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
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent p-8 flex flex-col justify-end">
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
