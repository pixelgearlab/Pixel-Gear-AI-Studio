
import React, { useEffect } from 'react';
import { CheckCircleIcon, ExclamationTriangleIcon } from './icons';

interface ToastProps {
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000); // Auto-close after 3 seconds

    return () => {
      clearTimeout(timer);
    };
  }, [onClose]);

  const typeStyles = {
    success: {
      icon: <CheckCircleIcon className="w-6 h-6 text-green-400" />,
      borderColor: 'border-green-500/30',
    },
    error: {
      icon: <ExclamationTriangleIcon className="w-6 h-6 text-red-400" />,
      borderColor: 'border-red-500/30',
    },
  };

  const { icon, borderColor } = typeStyles[type];

  return (
    <>
      <div
        className={`fixed bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-3 w-auto max-w-sm p-4 rounded-xl bg-slate-800/80 backdrop-blur-lg border ${borderColor} shadow-2xl z-50 animate-toast-in`}
      >
        {icon}
        <p className="text-white font-medium">{message}</p>
      </div>
      <style>{`
        @keyframes toast-in {
          from {
            opacity: 0;
            transform: translate(-50%, 20px);
          }
          to {
            opacity: 1;
            transform: translate(-50%, 0);
          }
        }
        .animate-toast-in {
          animation: toast-in 0.3s ease-out forwards;
        }
      `}</style>
    </>
  );
};
