import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

/**
 * @notice Provides the Toast state and trigger function across the layout hierarchy.
 * @dev Custom context container for displaying highly stylized, minimal Oat Milk themed notification indicators.
 */
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  /**
   * @notice Spawns a floating notification toast.
   * @param {string} message The text content to display inside the notification.
   * @param {'success' | 'error' | 'info'} type The aesthetic category style for the toast.
   */
  const showToast = useCallback((message, type = 'info') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);

    // Auto-remove toast after 4 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      
      {/* Floating Toasts Stack Container */}
      <div className="fixed bottom-5 right-5 z-[100] flex flex-col gap-3 max-w-sm w-full pointer-events-none">
        {toasts.map((toast) => {
          let styleClasses = '';
          let Icon = Info;

          if (toast.type === 'success') {
            styleClasses = 'bg-[#C1CDBC] border-[#A8B7A2] text-[#241E1A]';
            Icon = CheckCircle2;
          } else if (toast.type === 'error') {
            styleClasses = 'bg-[#DFA687] border-[#CF9273] text-[#241E1A]';
            Icon = AlertTriangle;
          } else {
            styleClasses = 'bg-[#FCF9F3] border-[#E5DAC9] text-[#241E1A]';
            Icon = Info;
          }

          return (
            <div
              key={toast.id}
              className={`pointer-events-auto flex items-start justify-between gap-3 p-4 rounded-2xl border shadow-lg transform transition-all duration-300 animate-slide-in ${styleClasses}`}
            >
              <div className="flex gap-2.5 items-start">
                <Icon className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span className="text-xs font-semibold leading-normal">{toast.message}</span>
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-[#241E1A] hover:opacity-75 transition-opacity"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

/**
 * @notice Custom hook for triggering Oat Milk themed notifications.
 * @dev Returns the trigger function: showToast(message, 'success' | 'error' | 'info')
 */
export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
