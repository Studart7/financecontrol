import { useState } from 'react';
import { Navbar, Footer } from './components/Layout';
import { Inicio } from './components/Inicio';
import { Dashboard } from './components/Dashboard';
import { Metas } from './components/Metas';
import { Planilha } from './components/Planilha';
import { RevisionModal } from './components/RevisionModal';
import { FinanceProvider } from './context/FinanceContext';

export default function App() {
  const [activeTab, setActiveTab] = useState('inicio');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const renderContent = () => {
    switch (activeTab) {
      case 'inicio':
        return <Inicio onOpenModal={() => setIsModalOpen(true)} />;
      case 'dashboard':
        return <Dashboard />;
      case 'metas':
        return <Metas />;
      case 'planilha':
        return <Planilha />;
      default:
        return <Inicio onOpenModal={() => setIsModalOpen(true)} />;
    }
  };

  return (
    <FinanceProvider>
      <div className="min-h-screen flex flex-col bg-surface">
        <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
        <div className="flex-grow">
          {renderContent()}
        </div>
        <Footer />
        
        <RevisionModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
        />
      </div>
    </FinanceProvider>
  );
}
