import React from 'react';
import { Icons } from '../lib/icons';

interface NavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Navbar: React.FC<NavProps> = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: 'inicio', label: 'Início' },
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'metas', label: 'Metas' },
    { id: 'planilha', label: 'Planilha' },
  ];

  return (
    <header className="bg-surface sticky top-0 z-50">
      <div className="flex justify-between items-center w-full px-8 py-4 max-w-7xl mx-auto">
        <div className="text-2xl font-bold tracking-tight text-primary font-headline cursor-pointer" onClick={() => setActiveTab('inicio')}>
          FinanceControl
        </div>
        <nav className="hidden md:flex items-center gap-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`font-headline font-bold text-lg transition-colors duration-200 ${
                activeTab === tab.id 
                  ? 'text-primary border-b-2 border-primary pb-1' 
                  : 'text-secondary hover:text-primary'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
        <div className="flex items-center gap-4">
          <button className="text-primary p-2 hover:bg-surface-container-low rounded-full transition-transform active:opacity-80 scale-95">
            <Icons.Language size={24} />
          </button>
          <button className="text-primary p-2 hover:bg-surface-container-low rounded-full transition-transform active:opacity-80 scale-95">
            <Icons.DarkMode size={24} />
          </button>
          <button className="text-primary p-2 hover:bg-surface-container-low rounded-full transition-transform active:opacity-80 scale-95">
            <Icons.Account size={24} />
          </button>
        </div>
      </div>
    </header>
  );
};

export const Footer: React.FC = () => {
  return (
    <footer className="bg-surface-container-low border-t border-outline-variant/20 py-12">
      <div className="flex flex-col items-center gap-4 w-full px-8 max-w-7xl mx-auto">
        <div className="text-sm font-medium text-secondary font-headline">
          FinanceControl
        </div>
        <div className="flex gap-6">
          <a className="font-body text-xs uppercase tracking-wider text-secondary opacity-80 hover:text-primary transition-opacity" href="#">Security</a>
          <a className="font-body text-xs uppercase tracking-wider text-secondary opacity-80 hover:text-primary transition-opacity" href="#">Privacy Policy</a>
          <a className="font-body text-xs uppercase tracking-wider text-secondary opacity-80 hover:text-primary transition-opacity" href="#">Terms of Service</a>
        </div>
        <div className="font-body text-xs uppercase tracking-wider text-secondary opacity-60">
          © 2024 FinanceControl. All rights reserved.
        </div>
      </div>
    </footer>
  );
};
