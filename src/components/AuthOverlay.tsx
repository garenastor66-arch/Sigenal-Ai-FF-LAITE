import { motion } from 'motion/react';
import { Sparkles, LogIn } from 'lucide-react';

interface AuthOverlayProps {
  onSignIn: () => void;
  isLoading: boolean;
  error?: string | null;
}

export default function AuthOverlay({ onSignIn, isLoading, error }: AuthOverlayProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#020617]">
      <div className="absolute inset-0 overflow-hidden bg-[radial-gradient(circle_at_50%_50%,#3b82f61a,transparent_50%),radial-gradient(circle_at_80%_20%,#a855f71a,transparent_50%)]"></div>
      
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full p-12 glass-panel rounded-[2.5rem] text-center border-white/5 relative z-10"
      >
        <div className="w-24 h-24 bg-gradient-to-tr from-slate-900 to-slate-800 rounded-3xl flex items-center justify-center mx-auto mb-10 shadow-[0_0_50px_-12px_rgba(168,85,247,0.4)] relative overflow-hidden group border border-white/10">
          <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/20 to-blue-500/20 animate-pulse"></div>
          <span className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-b from-purple-400 to-blue-400 relative z-10 select-none">S</span>
        </div>
        
        <h1 className="text-4xl font-black mb-3 tracking-tighter text-white">Sigenal AI</h1>
        <p className="text-purple-400 mb-2 font-bold text-lg">الذكاء الذي يتذكرك</p>
        <p className="text-slate-500 mb-8 text-sm">مساعدك الذكي في كل لحظة</p>
        
        {error && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm font-bold"
            dir="rtl"
          >
            {error}
          </motion.div>
        )}
        
        <button
          onClick={onSignIn}
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-4 bg-white text-slate-950 font-black py-4.5 rounded-2xl hover:bg-slate-100 transition-all active:scale-95 disabled:opacity-50 shadow-[0_20px_40px_-15px_rgba(255,255,255,0.1)] mb-6"
        >
          {isLoading ? (
            <span className="w-6 h-6 border-3 border-slate-900/20 border-t-slate-900 rounded-full animate-spin"></span>
          ) : (
            <>
              <LogIn size={22} strokeWidth={3} />
              تسجيل الدخول باستخدام جوجل
            </>
          )}
        </button>
        
        <div className="flex items-center justify-center gap-6 mt-4">
          <div className="flex flex-col items-center gap-1">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">آمن</span>
          </div>
          <div className="w-px h-4 bg-white/5"></div>
          <div className="flex flex-col items-center gap-1">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">سهولة</span>
          </div>
          <div className="w-px h-4 bg-white/5"></div>
          <div className="flex flex-col items-center gap-1">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">تحديثات</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
