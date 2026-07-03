import React, { createContext, useContext, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { AlertTriangle, X } from 'lucide-react';
import { GlassCard } from '../components/GlassCard';
import { Button } from '../components/Button';

const ConfirmContext = createContext();

export const useConfirm = () => useContext(ConfirmContext);

export const ConfirmProvider = ({ children }) => {
  const [confirmState, setConfirmState] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    isDestructive: true,
    resolve: null,
  });

  const confirm = useCallback((options) => {
    return new Promise((resolve) => {
      setConfirmState({
        isOpen: true,
        title: options.title || 'Are you sure?',
        message: options.message || 'This action cannot be undone.',
        confirmText: options.confirmText || 'Confirm',
        cancelText: options.cancelText || 'Cancel',
        isDestructive: options.isDestructive !== false,
        resolve,
      });
    });
  }, []);

  const handleConfirm = () => {
    if (confirmState.resolve) confirmState.resolve(true);
    setConfirmState(prev => ({ ...prev, isOpen: false }));
  };

  const handleCancel = () => {
    if (confirmState.resolve) confirmState.resolve(false);
    setConfirmState(prev => ({ ...prev, isOpen: false }));
  };

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      {confirmState.isOpen && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm overflow-y-auto animate-fade-in flex items-center justify-center p-4">
          <GlassCard className="w-full max-w-sm p-6 relative overflow-hidden animate-scale-in" variant="heavy">
            <div className={`h-1 absolute top-0 left-0 right-0 ${confirmState.isDestructive ? 'bg-destructive' : 'bg-primary'}`} />
            
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3 text-foreground">
                <div className={`p-2 rounded-xl ${confirmState.isDestructive ? 'bg-destructive/15 text-destructive' : 'bg-primary/15 text-primary'}`}>
                  <AlertTriangle size={20} />
                </div>
                <h3 className="font-bold text-lg leading-tight">{confirmState.title}</h3>
              </div>
              <button
                onClick={handleCancel}
                className="text-muted-foreground hover:text-foreground p-1 rounded-full transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            
            <p className="text-muted-foreground text-sm mb-6 leading-relaxed">
              {confirmState.message}
            </p>
            
            <div className="flex gap-3">
              <Button type="button" variant="secondary" onClick={handleCancel} className="flex-1 h-11">
                {confirmState.cancelText}
              </Button>
              <Button 
                type="button" 
                onClick={handleConfirm} 
                className={`flex-1 h-11 border-none ${confirmState.isDestructive ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-destructive/20' : ''}`}
              >
                {confirmState.confirmText}
              </Button>
            </div>
          </GlassCard>
        </div>,
        document.body
      )}
    </ConfirmContext.Provider>
  );
};
