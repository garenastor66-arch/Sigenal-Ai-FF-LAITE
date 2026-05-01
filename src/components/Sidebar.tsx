import { motion } from 'motion/react';
import { LogOut, Plus, MessageSquare, Brain, User, ChevronRight } from 'lucide-react';
import { ChatSession, UserProfile } from '../types';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface SidebarProps {
  user: UserProfile;
  chats: ChatSession[];
  currentChatId: string | null;
  onSelectChat: (id: string) => void;
  onNewChat: () => void;
  onSignOut: () => void;
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ user, chats, currentChatId, onSelectChat, onNewChat, onSignOut, isOpen, onClose }: SidebarProps) {
  return (
    <>
      <div 
        className={cn(
          "fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />
      
      <aside className={cn(
        "fixed inset-y-0 left-0 w-80 flex flex-col bg-[#040712] border-r border-white/5 z-50 lg:relative lg:z-0 lg:translate-x-0 transition-transform duration-300 ease-in-out",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-purple-600 flex items-center justify-center font-bold text-xl shadow-lg shadow-purple-500/20">
              S
            </div>
            <div className="flex-1">
              <h1 className="font-bold text-lg leading-tight tracking-tight">Sigenal AI</h1>
              <p className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold italic">Remembers Everything</p>
            </div>
            <button 
              onClick={onClose}
              className="lg:hidden p-2 text-slate-500 hover:text-white"
            >
              <ChevronRight className="rotate-180" />
            </button>
          </div>

          <button
            onClick={onNewChat}
            className="w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-500 text-white font-semibold py-3.5 rounded-xl transition-all shadow-lg shadow-purple-500/20 active:scale-95"
          >
            <Plus size={18} />
            محادثة جديدة
          </button>
        </div>

      <div className="flex-1 overflow-y-auto px-4 py-2 space-y-1">
        {chats.map((chat) => (
          <button
            key={chat.id}
            onClick={() => onSelectChat(chat.id)}
            className={cn(
              "w-full text-right p-3 rounded-xl flex items-center gap-3 group transition-all",
              currentChatId === chat.id 
                ? "bg-white/10 text-white" 
                : "text-slate-400 hover:bg-white/5 hover:text-white"
            )}
            dir="rtl"
          >
            <MessageSquare size={16} className={cn("shrink-0", currentChatId === chat.id ? "text-purple-400" : "text-slate-500")} />
            <span className="truncate text-sm font-medium flex-1">{chat.title || "محادثة غير معنونة"}</span>
          </button>
        ))}
        {chats.length === 0 && (
          <div className="text-center py-12 px-4">
            <MessageSquare className="mx-auto text-slate-800 mb-2" size={32} />
            <p className="text-xs text-slate-500">لا توجد محادثات بعد</p>
          </div>
        )}
      </div>

      <div className="p-4 mt-auto">
        <div className="p-4 rounded-2xl bg-white/5 border border-white/5 mb-4" dir="rtl">
          <div className="flex items-center gap-2 mb-2">
            <Brain size={14} className="text-purple-400" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-purple-300">الذاكرة النشطة</span>
          </div>
          <p className="text-[11px] text-slate-400 line-clamp-3 italic leading-relaxed">
            {user.memory || "أنا أتعلم باستمرار... تحدث معي لبناء ذاكرتي."}
          </p>
        </div>

        <div className="flex items-center gap-3 px-2">
          <div className="w-8 h-8 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center overflow-hidden">
            <User size={16} className="text-slate-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold truncate">{user.displayName || "Explorer"}</p>
            <p className="text-[10px] text-slate-500 truncate">{user.email}</p>
          </div>
          <button 
            onClick={onSignOut}
            className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
    </>
  );
}
