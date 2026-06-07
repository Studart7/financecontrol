import { useState } from 'react';
import { Navbar, Footer } from './components/Layout';
import { Inicio } from './components/Inicio';
import { Dashboard } from './components/Dashboard';
import { Metas } from './components/Metas';
import { Planilha } from './components/Planilha';
import { ProfileSidebar } from './components/ProfileSidebar';
import { FinanceProvider } from './context/FinanceContext';

export default function App() {
  const [activeTab, setActiveTab] = useState('inicio');
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const renderContent = () => {
    switch (activeTab) {
      case 'inicio':
        return <Inicio />;
      case 'dashboard':
        return <Dashboard />;
      case 'metas':
        return <Metas />;
      case 'planilha':
        return <Planilha />;
      default:
        return <Inicio />;
    }
  };

  return (
    <FinanceProvider>
      <div className="min-h-screen flex flex-col bg-surface">
        <Navbar 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          onOpenProfile={() => setIsProfileOpen(true)}
        />
        <div className="flex-grow">
          {renderContent()}
        </div>
        <Footer />
        
        <ProfileSidebar
          isOpen={isProfileOpen}
          onClose={() => setIsProfileOpen(false)}
        />
      </div>
    </FinanceProvider>
  );
}
