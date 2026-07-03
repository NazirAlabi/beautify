import React, { createContext, useContext, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';

const ToastContext = createContext();

export const useToast = () => useContext(ToastContext);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const addToast = useCallback((message, type = 'success', duration = 3000) => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, message, type }]);
    
    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, [removeToast]);

  const toast = {
    success: (message, duration) => addToast(message, 'success', duration),
    error: (message, duration) => addToast(message, 'error', duration),
    info: (message, duration) => addToast(message, 'info', duration),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      {typeof document !== 'undefined' && createPortal(
        <div className="fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 z-200 flex flex-col gap-2 w-full max-w-sm px-4 pointer-events-none">
          {toasts.map(t => (
            <div
              key={t.id}
              className={`pointer-events-auto flex items-center gap-3 p-4 rounded-2xl shadow-xl animate-fade-in-up border backdrop-blur-md ${
                t.type === 'success' 
                  ? 'bg-primary/95 text-white border-primary/20 shadow-[0_4px_20px_-4px_var(--color-primary)]' 
                  : t.type === 'error'
                    ? 'bg-destructive/95 text-white border-destructive/20 shadow-[0_4px_20px_-4px_var(--color-destructive)]'
                    : 'bg-info/95 text-white border-info/20 shadow-[0_4px_20px_-4px_var(--color-info)]'
              }`}
            >
              {t.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
              <span className="flex-1 text-sm font-medium">{t.message}</span>
              <button 
                onClick={() => removeToast(t.id)}
                className="opacity-70 hover:opacity-100 transition-opacity p-1"
              >
                <X size={16} />
              </button>
            </div>
          ))}
        </div>,
        document.body
      )}
    </ToastContext.Provider>
  );
};
