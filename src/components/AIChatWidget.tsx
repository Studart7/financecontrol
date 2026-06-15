import React, { useState } from 'react';
import { Icons } from '../lib/icons';
import { motion } from 'motion/react';
import { FullAIChat } from './FullAIChat';

export const AIChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  return (
    <>
      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            if (isOpen || isFullscreen) {
              setIsOpen(false);
              setIsFullscreen(false);
            } else {
              setIsOpen(true);
            }
          }}
          className="w-14 h-14 bg-gradient-to-br from-primary to-primary-container text-white rounded-full shadow-xl flex items-center justify-center hover:shadow-2xl transition-shadow"
        >
          {isOpen || isFullscreen ? <Icons.Close size={24} /> : <Icons.Bot size={24} />}
        </motion.button>
      </div>

      {/* Unified Chat Interface */}
      <FullAIChat 
        isOpen={isOpen || isFullscreen}
        isMini={!isFullscreen}
        onClose={() => {
          setIsOpen(false);
          setIsFullscreen(false);
        }}
        onExpand={() => {
          setIsFullscreen(true);
          setIsOpen(false);
        }}
        onShrink={() => {
          setIsFullscreen(false);
          setIsOpen(true);
        }}
      />
    </>
  );
};
