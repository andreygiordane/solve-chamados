import { useEffect } from 'react';
import { X } from 'lucide-react';

const Toast = ({ message, type = 'info', onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => onClose(), 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColors = {
    info: 'bg-slate-800 border-slate-600 text-white',
    success: 'bg-emerald-600 border-emerald-500 text-white',
    warning: 'bg-orange-600 border-orange-500 text-white',
    refresh: 'bg-cyan-600 border-cyan-500 text-white',
    error: 'bg-red-600 border-red-500 text-white'
  };

  return (
    <div className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 flex items-center gap-3 px-6 py-3 rounded-full shadow-2xl border ${bgColors[type]} animate-fade-in-down transition-all`}>
      <span className="text-sm font-medium">{message}</span>
      <button onClick={onClose} className="hover:bg-white/20 rounded-full p-1 transition-colors">
        <X className="w-3 h-3" />
      </button>
    </div>
  );
};

export default Toast;