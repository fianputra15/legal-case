"use client";
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { ConfirmationModal } from '../ui/confirmation-modal';

interface ModalConfig {
  title: ReactNode;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'default' | 'destructive';
  onConfirm: () => void | Promise<void>;
}

interface ModalContextType {
  showModal: (config: ModalConfig) => void;
  hideModal: () => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

interface ModalProviderProps {
  children: ReactNode;
}

export const ModalProvider: React.FC<ModalProviderProps> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [config, setConfig] = useState<ModalConfig | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const showModal = (modalConfig: ModalConfig) => {
    setConfig(modalConfig);
    setIsOpen(true);
  };

  const hideModal = () => {
    setIsOpen(false);
    setIsLoading(false);
    setTimeout(() => setConfig(null), 300); // Allow animation to complete
  };

  const handleConfirm = async () => {
    if (!config) return;
    
    try {
      setIsLoading(true);
      await config.onConfirm();
      hideModal();
    } catch (error) {
      console.error('Modal confirm error:', error);
      // Don't hide modal on error, let the onConfirm handler deal with it
      setIsLoading(false);
    }
  };

  return (
    <ModalContext.Provider value={{ showModal, hideModal }}>
      {children}
      {config && (
        <ConfirmationModal
          isOpen={isOpen}
          onClose={hideModal}
          onConfirm={handleConfirm}
          title={config.title}
          description={config.description}
          confirmText={config.confirmText}
          cancelText={config.cancelText}
          variant={config.variant}
          isLoading={isLoading}
        />
      )}
    </ModalContext.Provider>
  );
};

export const useModal = (): ModalContextType => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('useModal must be used within a ModalProvider');
  }
  return context;
}