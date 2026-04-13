import React, { useState } from 'react';
import { Icons } from '../lib/icons';
import { motion, AnimatePresence } from 'motion/react';
import { useFinance } from '../context/FinanceContext';

interface ProfileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

type SidebarView = 'menu' | 'personal' | 'notifications' | 'settings' | 'privacy';

export const ProfileSidebar: React.FC<ProfileSidebarProps> = ({ isOpen, onClose }) => {
  const [activeView, setActiveView] = useState<SidebarView>('menu');
  const { transactions, goals } = useFinance();

  const navigateTo = (view: SidebarView) => setActiveView(view);
  const goBack = () => setActiveView('menu');

  // Close and reset
  const handleClose = () => {
    onClose();
    setTimeout(() => setActiveView('menu'), 300);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 z-[70] bg-on-surface/30 backdrop-blur-[2px]"
          />
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed top-0 right-0 bottom-0 z-[80] w-full max-w-sm bg-surface border-l border-outline-variant/20 shadow-2xl flex flex-col"
          >
            <AnimatePresence mode="wait" initial={false}>
              {activeView === 'menu' && <MainMenu key="menu" onClose={handleClose} navigateTo={navigateTo} transactions={transactions} goals={goals} />}
              {activeView === 'personal' && <PersonalDataView key="personal" goBack={goBack} />}
              {activeView === 'notifications' && <NotificationsView key="notifications" goBack={goBack} />}
              {activeView === 'settings' && <SettingsView key="settings" goBack={goBack} />}
              {activeView === 'privacy' && <PrivacyView key="privacy" goBack={goBack} />}
            </AnimatePresence>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
};

// =======================================
// MAIN MENU
// =======================================
interface MainMenuProps {
  onClose: () => void;
  navigateTo: (view: SidebarView) => void;
  transactions: any[];
  goals: any[];
}

const MainMenu: React.FC<MainMenuProps> = ({ onClose, navigateTo, transactions, goals }) => (
  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.15 }} className="flex flex-col h-full">
    <div className="p-6 border-b border-outline-variant/15">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-headline text-lg font-bold text-on-surface">Meu Perfil</h2>
        <button onClick={onClose} className="p-2 text-secondary hover:text-primary hover:bg-surface-container-low rounded-full transition-all">
          <Icons.Close size={20} />
        </button>
      </div>
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-primary-container flex items-center justify-center shadow-md">
          <span className="text-2xl font-headline font-bold text-white">MR</span>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-headline font-bold text-on-surface text-lg truncate">Marcelo Ribeiro</h3>
          <p className="text-sm text-secondary truncate">marcelo@financecontrol.app</p>
          <div className="flex items-center gap-1.5 mt-1">
            <div className="w-2 h-2 bg-tertiary rounded-full"></div>
            <span className="text-[10px] font-bold text-tertiary uppercase tracking-wider">Plano Premium</span>
          </div>
        </div>
      </div>
    </div>

    <div className="grid grid-cols-3 gap-px bg-outline-variant/10 border-b border-outline-variant/15">
      {[
        { label: 'Recibos', value: String(transactions.length) },
        { label: 'Metas', value: String(goals.length) },
        { label: 'Score', value: '84' },
      ].map((stat) => (
        <div key={stat.label} className="bg-surface p-4 text-center">
          <span className="block font-headline text-xl font-bold text-primary">{stat.value}</span>
          <span className="text-[10px] font-body text-secondary uppercase tracking-wider font-bold">{stat.label}</span>
        </div>
      ))}
    </div>

    <nav className="flex-1 overflow-y-auto py-4 px-3">
      <div className="mb-2">
        <p className="px-3 text-[10px] font-bold text-secondary uppercase tracking-widest mb-2">Conta</p>
        <SidebarItem icon={Icons.Account} label="Dados Pessoais" onClick={() => navigateTo('personal')} />
        <SidebarItem icon={Icons.Privacy} label="Privacidade & Segurança" onClick={() => navigateTo('privacy')} />
        <SidebarItem icon={Icons.Notifications} label="Notificações" badge="3" onClick={() => navigateTo('notifications')} />
      </div>
      <div className="h-px bg-outline-variant/15 mx-3 my-3"></div>
      <div className="mb-2">
        <p className="px-3 text-[10px] font-bold text-secondary uppercase tracking-widest mb-2">Preferências</p>
        <SidebarItem icon={Icons.Settings} label="Configurações Gerais" onClick={() => navigateTo('settings')} />
        <SidebarItem icon={Icons.Star} label="Plano & Assinatura" accent />
      </div>
    </nav>

    <div className="p-4 border-t border-outline-variant/15">
      <p className="text-[10px] text-secondary text-center mt-1 opacity-60">FinanceControl v1.0.0</p>
    </div>
  </motion.div>
);

// =======================================
// PERSONAL DATA VIEW
// =======================================
const PersonalDataView: React.FC<{ goBack: () => void }> = ({ goBack }) => {
  const [name, setName] = useState('Marcelo Ribeiro');
  const [email, setEmail] = useState('marcelo@financecontrol.app');
  const [phone, setPhone] = useState('+55 (11) 98765-4321');
  const [birth, setBirth] = useState('15/03/1992');

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.15 }} className="flex flex-col h-full">
      <SubHeader title="Dados Pessoais" goBack={goBack} />
      <div className="flex-1 overflow-y-auto p-6 space-y-5">
        <div className="flex justify-center mb-2">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-primary-container flex items-center justify-center shadow-md">
            <span className="text-3xl font-headline font-bold text-white">MR</span>
          </div>
        </div>

        <FormField label="Nome completo" value={name} onChange={setName} />
        <FormField label="E-mail" value={email} onChange={setEmail} type="email" />
        <FormField label="Telefone" value={phone} onChange={setPhone} type="tel" />
        <FormField label="Data de nascimento" value={birth} onChange={setBirth} />

        <div className="pt-4">
          <button className="w-full bg-gradient-to-br from-primary to-primary-container text-surface-container-lowest font-bold py-3 rounded-lg shadow-sm hover:shadow-md transition-all active:scale-[0.98]">
            Salvar Alterações
          </button>
        </div>
      </div>
    </motion.div>
  );
};

// =======================================
// NOTIFICATIONS VIEW
// =======================================
const NotificationsView: React.FC<{ goBack: () => void }> = ({ goBack }) => {
  const [notifs, setNotifs] = useState([
    { id: 1, title: 'Meta ultrapassada', desc: 'Alimentação atingiu 108% da meta mensal.', time: 'Há 2 horas', read: false, icon: Icons.Warning, color: 'text-error' },
    { id: 2, title: 'Recibo processado', desc: 'Transação de R$ 450,00 no Outback registrada.', time: 'Há 5 horas', read: false, icon: Icons.Check, color: 'text-tertiary' },
    { id: 3, title: 'Novo relatório disponível', desc: 'Seu relatório mensal de Outubro está pronto.', time: 'Ontem', read: false, icon: Icons.Planilha, color: 'text-primary' },
    { id: 4, title: 'Dica de economia', desc: 'Reduza 15% em transporte usando caronas compartilhadas.', time: '3 dias atrás', read: true, icon: Icons.Lightbulb, color: 'text-tertiary' },
  ]);

  const markAllRead = () => setNotifs(prev => prev.map(n => ({ ...n, read: true })));
  const unreadCount = notifs.filter(n => !n.read).length;

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.15 }} className="flex flex-col h-full">
      <SubHeader title="Notificações" goBack={goBack}>
        {unreadCount > 0 && (
          <button onClick={markAllRead} className="text-xs font-bold text-primary hover:text-primary-container transition-colors">
            Marcar todas como lidas
          </button>
        )}
      </SubHeader>
      <div className="flex-1 overflow-y-auto">
        {notifs.map(n => {
          const NIcon = n.icon;
          return (
            <div 
              key={n.id} 
              className={`flex gap-4 p-5 border-b border-outline-variant/10 transition-colors ${!n.read ? 'bg-primary/5' : ''}`}
              onClick={() => setNotifs(prev => prev.map(nn => nn.id === n.id ? { ...nn, read: true } : nn))}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${!n.read ? 'bg-primary/10' : 'bg-surface-container-low'}`}>
                <NIcon size={18} className={n.color} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className={`font-body text-sm ${!n.read ? 'font-bold text-on-surface' : 'font-medium text-secondary'} truncate`}>{n.title}</p>
                  {!n.read && <div className="w-2 h-2 bg-primary rounded-full shrink-0"></div>}
                </div>
                <p className="text-xs text-secondary mt-0.5 line-clamp-2">{n.desc}</p>
                <p className="text-[10px] text-secondary/60 mt-1">{n.time}</p>
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
};

// =======================================
// SETTINGS VIEW
// =======================================
const SettingsView: React.FC<{ goBack: () => void }> = ({ goBack }) => {
  const [currency, setCurrency] = useState('BRL');
  const [language, setLanguage] = useState('pt-BR');
  const [autoCateg, setAutoCateg] = useState(true);
  const [compactView, setCompactView] = useState(false);

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.15 }} className="flex flex-col h-full">
      <SubHeader title="Configurações Gerais" goBack={goBack} />
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <div>
          <p className="text-[10px] font-bold text-secondary uppercase tracking-widest mb-3">Regional</p>
          <SelectField label="Moeda padrão" value={currency} onChange={setCurrency} options={[{ v: 'BRL', l: 'Real (R$)' }, { v: 'USD', l: 'Dollar (US$)' }, { v: 'EUR', l: 'Euro (€)' }]} />
          <SelectField label="Idioma" value={language} onChange={setLanguage} options={[{ v: 'pt-BR', l: 'Português (BR)' }, { v: 'en-US', l: 'English (US)' }, { v: 'es', l: 'Español' }]} />
        </div>

        <div className="h-px bg-outline-variant/15"></div>

        <div>
          <p className="text-[10px] font-bold text-secondary uppercase tracking-widest mb-3">Processamento</p>
          <ToggleField label="Categorização automática por IA" desc="Detecta a categoria de novos recibos automaticamente." value={autoCateg} onChange={setAutoCateg} />
          <ToggleField label="Visualização compacta na Planilha" desc="Exibe mais transações por página com linhas menores." value={compactView} onChange={setCompactView} />
        </div>

        <div className="pt-2">
          <button className="w-full bg-gradient-to-br from-primary to-primary-container text-surface-container-lowest font-bold py-3 rounded-lg shadow-sm hover:shadow-md transition-all active:scale-[0.98]">
            Salvar Configurações
          </button>
        </div>
      </div>
    </motion.div>
  );
};

// =======================================
// PRIVACY VIEW
// =======================================
const PrivacyView: React.FC<{ goBack: () => void }> = ({ goBack }) => {
  const [twoFactor, setTwoFactor] = useState(false);
  const [biometric, setBiometric] = useState(true);
  const [dataSharing, setDataSharing] = useState(false);

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.15 }} className="flex flex-col h-full">
      <SubHeader title="Privacidade & Segurança" goBack={goBack} />
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <div>
          <p className="text-[10px] font-bold text-secondary uppercase tracking-widest mb-3">Autenticação</p>
          <ToggleField label="Autenticação de dois fatores" desc="Proteja sua conta com verificação em dois passos." value={twoFactor} onChange={setTwoFactor} />
          <ToggleField label="Acesso biométrico" desc="Use impressão digital ou Face ID para acessar." value={biometric} onChange={setBiometric} />
        </div>

        <div className="h-px bg-outline-variant/15"></div>

        <div>
          <p className="text-[10px] font-bold text-secondary uppercase tracking-widest mb-3">Dados</p>
          <ToggleField label="Compartilhamento de dados" desc="Permite análise anônima para melhorar o serviço." value={dataSharing} onChange={setDataSharing} />
        </div>

        <div className="h-px bg-outline-variant/15"></div>

        <div>
          <p className="text-[10px] font-bold text-secondary uppercase tracking-widest mb-3">Ações</p>
          <button className="w-full py-3 text-sm font-bold text-secondary border border-outline-variant/30 rounded-lg hover:bg-surface-container-low transition-all mb-3">
            Alterar Senha
          </button>
          <button className="w-full py-3 text-sm font-bold text-error border border-error/30 rounded-lg hover:bg-error/5 transition-all">
            Excluir Minha Conta
          </button>
        </div>
      </div>
    </motion.div>
  );
};

// =======================================
// SHARED SUB-COMPONENTS
// =======================================
const SubHeader: React.FC<{ title: string; goBack: () => void; children?: React.ReactNode }> = ({ title, goBack, children }) => (
  <div className="p-6 border-b border-outline-variant/15">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <button onClick={goBack} className="p-2 text-secondary hover:text-primary hover:bg-surface-container-low rounded-full transition-all">
          <Icons.ChevronLeft size={20} />
        </button>
        <h2 className="font-headline text-lg font-bold text-on-surface">{title}</h2>
      </div>
      {children}
    </div>
  </div>
);

const FormField: React.FC<{ label: string; value: string; onChange: (v: string) => void; type?: string }> = ({ label, value, onChange, type = 'text' }) => (
  <div className="space-y-1.5">
    <label className="font-body text-[10px] text-secondary uppercase font-bold tracking-widest ml-1">{label}</label>
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      className="w-full bg-surface-container-low border-b-2 border-outline-variant focus:border-primary transition-all p-3 text-on-surface font-body font-medium rounded-t outline-none"
    />
  </div>
);

const SelectField: React.FC<{ label: string; value: string; onChange: (v: string) => void; options: { v: string; l: string }[] }> = ({ label, value, onChange, options }) => (
  <div className="flex items-center justify-between py-3">
    <span className="font-body text-sm text-on-surface">{label}</span>
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className="bg-surface-container-low border border-outline-variant/30 rounded-lg px-3 py-1.5 text-sm font-body text-on-surface outline-none focus:border-primary appearance-none cursor-pointer pr-6"
    >
      {options.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
    </select>
  </div>
);

const ToggleField: React.FC<{ label: string; desc: string; value: boolean; onChange: (v: boolean) => void }> = ({ label, desc, value, onChange }) => (
  <div className="flex items-start gap-4 py-3">
    <div className="flex-1">
      <p className="font-body text-sm font-medium text-on-surface">{label}</p>
      <p className="font-body text-xs text-secondary mt-0.5">{desc}</p>
    </div>
    <button
      onClick={() => onChange(!value)}
      className={`relative w-11 h-6 rounded-full transition-colors shrink-0 mt-0.5 ${value ? 'bg-primary' : 'bg-outline-variant/40'}`}
    >
      <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${value ? 'left-[22px]' : 'left-0.5'}`}></div>
    </button>
  </div>
);

interface SidebarItemProps {
  icon: React.FC<{ size?: number; className?: string }>;
  label: string;
  badge?: string;
  accent?: boolean;
  onClick?: () => void;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ icon: Icon, label, badge, accent, onClick }) => (
  <button onClick={onClick} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left hover:bg-surface-container-low transition-all group">
    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${accent ? 'bg-primary/10' : 'bg-surface-container-low group-hover:bg-surface-variant/50'} transition-colors`}>
      <Icon size={16} className={accent ? 'text-primary' : 'text-secondary group-hover:text-primary'} />
    </div>
    <span className={`flex-1 font-body text-sm font-medium ${accent ? 'text-primary' : 'text-on-surface'}`}>{label}</span>
    {badge && (
      <span className="px-2 py-0.5 text-[10px] font-bold bg-primary text-white rounded-full">{badge}</span>
    )}
    <Icons.ChevronRight size={14} className="text-secondary/40 group-hover:text-secondary transition-colors" />
  </button>
);
