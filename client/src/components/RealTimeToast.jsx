import React, { useEffect } from 'react';
import { useSocket } from '../context/SocketContext';
import { ShoppingBag, AlertTriangle, X } from 'lucide-react';

const RealTimeToast = () => {
  const { latestAlert, dismissAlert } = useSocket();

  useEffect(() => {
    if (latestAlert) {
      const timer = setTimeout(() => {
        dismissAlert();
      }, 7000);
      return () => clearTimeout(timer);
    }
  }, [latestAlert]);

  if (!latestAlert) return null;

  const isStock = latestAlert.type === 'stock';

  return (
    <div className="fixed bottom-5 left-5 z-50 max-w-sm w-full animate-bounce duration-300">
      <div
        className={`p-4 rounded-2xl shadow-2xl border flex items-start gap-3 backdrop-blur-md ${
          isStock
            ? 'bg-amber-900/90 text-amber-100 border-amber-500'
            : 'bg-emerald-900/90 text-emerald-100 border-emerald-500'
        }`}
      >
        <div
          className={`p-2 rounded-xl shrink-0 ${
            isStock ? 'bg-amber-500/20 text-amber-300' : 'bg-emerald-500/20 text-emerald-300'
          }`}
        >
          {isStock ? <AlertTriangle className="w-6 h-6" /> : <ShoppingBag className="w-6 h-6" />}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-bold text-sm text-white">{latestAlert.title}</h4>
          <p className="text-xs mt-1 text-slate-200 leading-relaxed break-words">
            {latestAlert.message}
          </p>
          <span className="text-[10px] opacity-75 mt-1 block">الآن</span>
        </div>
        <button
          onClick={dismissAlert}
          className="text-slate-400 hover:text-white transition p-1"
          aria-label="إغلاق"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default RealTimeToast;
