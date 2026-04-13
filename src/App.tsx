import { useState } from 'react';
import { Navbar, Footer } from './components/Layout';
import { Inicio, UploadedFile } from './components/Inicio';
import { Dashboard } from './components/Dashboard';
import { Metas } from './components/Metas';
import { Planilha } from './components/Planilha';
import { RevisionModal, ConfirmedFile } from './components/RevisionModal';
import { ProfileSidebar } from './components/ProfileSidebar';
import { FinanceProvider } from './context/FinanceContext';

export default function App() {
  const [activeTab, setActiveTab] = useState('inicio');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [filesToAnalyze, setFilesToAnalyze] = useState<UploadedFile[]>([]);
  const [confirmedFiles, setConfirmedFiles] = useState<ConfirmedFile[]>([]);

  const handleSendForAnalysis = (files: UploadedFile[]) => {
    setFilesToAnalyze(files);
    setConfirmedFiles([]);
    setIsModalOpen(true);
  };

  const handleAnalysisComplete = (confirmed: ConfirmedFile[]) => {
    setConfirmedFiles(confirmed);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'inicio':
        return <Inicio onSendForAnalysis={handleSendForAnalysis} confirmedFiles={confirmedFiles} onClearConfirmed={() => setConfirmedFiles([])} />;
      case 'dashboard':
        return <Dashboard />;
      case 'metas':
        return <Metas />;
      case 'planilha':
        return <Planilha />;
      default:
        return <Inicio onSendForAnalysis={handleSendForAnalysis} confirmedFiles={confirmedFiles} onClearConfirmed={() => setConfirmedFiles([])} />;
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
        
        <RevisionModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)}
          files={filesToAnalyze}
          onComplete={handleAnalysisComplete}
        />

        <ProfileSidebar
          isOpen={isProfileOpen}
          onClose={() => setIsProfileOpen(false)}
        />
      </div>
    </FinanceProvider>
  );
}
