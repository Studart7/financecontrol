import React, { useState, useEffect } from 'react';
import { Icons } from '../lib/icons';
import { motion, AnimatePresence } from 'motion/react';

interface NavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenProfile: () => void;
}

export const Navbar: React.FC<NavProps> = ({ activeTab, setActiveTab, onOpenProfile }) => {
  const [isDark, setIsDark] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Sync state with actual class on mount
  useEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'));
  }, []);

  const toggleTheme = () => {
    document.documentElement.classList.toggle('dark');
    setIsDark(prev => !prev);
  };

  const tabs = [
    { id: 'inicio', label: 'Início' },
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'metas', label: 'Metas' },
    { id: 'planilha', label: 'Planilha' },
  ];

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
    setIsMenuOpen(false);
  };

  return (
    <header className="bg-surface sticky top-0 z-50">
      <div className="flex justify-between items-center w-full px-8 py-4 max-w-7xl mx-auto border-b border-outline-variant/10 md:border-none">
        {/* Left: Mobile Hamburger & Logo */}
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden text-primary p-2 hover:bg-surface-container-low rounded-lg transition-colors"
            aria-label="Menu"
          >
            {isMenuOpen ? <Icons.Close size={24} /> : <Icons.Menu size={24} />}
          </button>
          <div 
            className="text-2xl font-bold tracking-tight text-primary font-headline cursor-pointer select-none" 
            onClick={() => handleTabClick('inicio')}
          >
            FinanceControl
          </div>
        </div>

        {/* Center: Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
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

        {/* Right: Actions */}
        <div className="flex items-center gap-2 md:gap-4">
          <button 
            onClick={toggleTheme}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="text-primary p-2 hover:bg-surface-container-low rounded-full transition-transform active:opacity-80 relative w-10 h-10 flex items-center justify-center overflow-hidden"
          >
            <AnimatePresence mode="wait" initial={false}>
              {(isDark && !isHovered) || (!isDark && isHovered) ? (
                <motion.div
                  key="moon"
                  initial={{ rotate: -90, opacity: 0, scale: 0.5 }}
                  animate={{ rotate: 0, opacity: 1, scale: 1 }}
                  exit={{ rotate: 90, opacity: 0, scale: 0.5 }}
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                >
                  <Icons.DarkMode size={22} />
                </motion.div>
              ) : (
                <motion.div
                  key="sun"
                  initial={{ rotate: 90, opacity: 0, scale: 0.5 }}
                  animate={{ rotate: 0, opacity: 1, scale: 1 }}
                  exit={{ rotate: -90, opacity: 0, scale: 0.5 }}
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                >
                  <Icons.Sun size={22} />
                </motion.div>
              )}
            </AnimatePresence>
          </button>
          <button 
            onClick={onOpenProfile}
            className="text-primary p-2 hover:bg-surface-container-low rounded-full transition-transform active:opacity-80 scale-95"
          >
            <Icons.Account size={24} />
          </button>
        </div>
      </div>

      {/* Mobile Top-down Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="md:hidden fixed inset-0 top-[73px] bg-black/20 backdrop-blur-[2px] z-40"
            />
            {/* Menu List */}
            <motion.div
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -50, opacity: 0 }}
              className="md:hidden absolute w-full bg-surface border-b border-outline-variant/20 shadow-xl z-50 overflow-hidden"
            >
              <div className="flex flex-col py-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => handleTabClick(tab.id)}
                    className={`flex items-center gap-4 px-8 py-4 text-left font-headline font-bold text-lg transition-colors border-l-4 ${
                      activeTab === tab.id 
                        ? 'text-primary bg-primary/5 border-primary' 
                        : 'text-secondary bg-transparent border-transparent'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
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
