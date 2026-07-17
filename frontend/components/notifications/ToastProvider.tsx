'use client';
import { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { X, CheckCircle2, XCircle, Info } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  addToast: (message: string, type: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

const toastConfig = {
  success: {
    icon: CheckCircle2,
    bar: 'bg-emerald-500',
    iconClass: 'text-emerald-400',
    bg: 'bg-[#161B22] border-[#2D333B]',
  },
  error: {
    icon: XCircle,
    bar: 'bg-red-500',
    iconClass: 'text-red-400',
    bg: 'bg-[#161B22] border-[#2D333B]',
  },
  info: {
    icon: Info,
    bar: 'bg-blue-500',
    iconClass: 'text-blue-400',
    bg: 'bg-[#161B22] border-[#2D333B]',
  },
};

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, type: ToastType) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      {/* Toast container */}
      <div className="fixed bottom-5 right-5 z-[100] flex flex-col-reverse gap-2.5 max-w-sm w-full pointer-events-none">
        {toasts.map((toast) => {
          const cfg = toastConfig[toast.type];
          const Icon = cfg.icon;
          return (
            <div
              key={toast.id}
              className={cn(
                'flex items-start gap-3 p-4 rounded-xl border shadow-2xl pointer-events-auto animate-slide-in-top',
                cfg.bg
              )}
              style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}
            >
              {/* Colored side bar */}
              <div className={cn('w-0.5 self-stretch rounded-full flex-shrink-0', cfg.bar)} />
              <Icon className={cn('w-4 h-4 flex-shrink-0 mt-0.5', cfg.iconClass)} />
              <p className="flex-1 text-sm text-[#C9D1D9] leading-snug">{toast.message}</p>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-[#484F58] hover:text-[#8B949E] transition-colors flex-shrink-0 mt-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within ToastProvider');
  return context;
};
