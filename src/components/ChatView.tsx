import { motion, AnimatePresence } from 'motion/react';
import { Send, Sparkles, Brain, Menu } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { Message, MessageRole, ChatSession } from '../types';

interface ChatViewProps {
  chat: ChatSession | null;
  messages: Message[];
  isTyping: boolean;
  onSendMessage: (content: string) => void;
  onOpenMenu: () => void;
}

const QUICK_PROMPTS = [
  "اشرح لي الذكاء الاصطناعي ببساطة",
  "اكتب لي خطة عمل لمشروع صغير",
  "ما هي أفضل طرق للتعلم السريع؟",
  "ترجم هذا النص إلى الإنجليزية"
];

export default function ChatView({ chat, messages, isTyping, onSendMessage, onOpenMenu }: ChatViewProps) {
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: 'smooth'
    });
  }, [messages, isTyping]);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isTyping) return;
    onSendMessage(input);
    setInput('');
  };

  const handlePromptClick = (prompt: string) => {
    onSendMessage(prompt);
  };

  if (!chat) {
    return (
      <div className="flex-1 flex flex-col bg-[#040712] overflow-hidden" dir="rtl">
        <header className="h-20 flex items-center px-8 border-b border-white/5">
          <div className="flex-1 text-center pr-10 lg:pr-0">
            <h1 className="text-xl font-bold text-white/90">Sigenal AI</h1>
          </div>
          <button 
            onClick={onOpenMenu}
            className="p-2 text-slate-400 lg:hidden"
          >
            <Menu size={24} />
          </button>
        </header>

        <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-lg"
          >
            <div className="text-right mb-12">
              <h2 className="text-2xl font-bold text-white mb-2">مرحبًا 👋!</h2>
              <p className="text-slate-400 text-lg">كيف يمكنني مساعدتك اليوم؟</p>
            </div>

            <div className="space-y-3">
              {QUICK_PROMPTS.map((prompt, idx) => (
                <motion.button
                  key={idx}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  onClick={() => handlePromptClick(prompt)}
                  className="action-chip"
                >
                  {prompt}
                </motion.button>
              ))}
            </div>
          </motion.div>
        </div>

        <div className="p-6">
          <form 
            onSubmit={handleSubmit}
            className="relative max-w-3xl mx-auto"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="اكتب رسالتك..."
              className="w-full bg-slate-900/80 border border-white/10 rounded-[2rem] px-8 py-5 pr-14 focus:outline-none input-glow transition-all text-right text-white placeholder:text-slate-600 shadow-2xl"
            />
            <button
              type="submit"
              disabled={!input.trim() || isTyping}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center hover:bg-purple-500 disabled:opacity-50 transition-all shadow-lg shadow-purple-500/30 active:scale-95"
            >
              <Send size={20} className="rotate-180" />
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-[#040712] overflow-hidden" dir="rtl">
      <header className="h-16 flex items-center px-8 border-b border-white/5 bg-[#040712]/80 backdrop-blur-md z-10">
        <button 
          onClick={onOpenMenu}
          className="p-2 text-slate-400 lg:hidden ml-4"
        >
          <Menu size={20} />
        </button>
        <h3 className="font-bold text-base tracking-tight truncate flex-1 text-right">{chat.title}</h3>
        <div className="flex items-center gap-2 text-xs font-bold text-purple-400 bg-purple-400/10 px-3 py-1.5 rounded-full border border-purple-400/20 mr-4">
          <Brain size={14} />
          ذاكرة نشطة
        </div>
      </header>

      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-6 py-8 space-y-6"
      >
        {messages.map((m) => (
          <motion.div
            key={m.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={m.role === MessageRole.USER ? 'flex justify-start' : 'flex justify-end'}
          >
            <div className={m.role === MessageRole.USER ? 'chat-bubble-user text-right' : 'chat-bubble-ai text-right'}>
              <div className="markdown-body">
                <ReactMarkdown>{m.content}</ReactMarkdown>
              </div>
              <p className="text-[10px] opacity-40 mt-2 text-left">
                {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </motion.div>
        ))}
        {isTyping && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-end"
          >
            <div className="chat-bubble-ai p-5 flex items-center gap-2">
              <span className="w-2 h-2 bg-purple-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
              <span className="w-2 h-2 bg-purple-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
              <span className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"></span>
            </div>
          </motion.div>
        )}
      </div>

      <div className="p-6">
        <form 
          onSubmit={handleSubmit}
          className="relative max-w-4xl mx-auto"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="اكتب رسالتك..."
            className="w-full bg-slate-900/80 border border-white/10 rounded-[2rem] px-8 py-5 pr-14 focus:outline-none input-glow transition-all text-right text-white placeholder:text-slate-600 shadow-2xl"
          />
          <button
            type="submit"
            disabled={!input.trim() || isTyping}
            className="absolute left-3 top-1/2 -translate-y-1/2 w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center hover:bg-purple-500 disabled:opacity-50 transition-all shadow-lg shadow-purple-500/30 active:scale-95"
          >
            <Send size={20} className="rotate-180" />
          </button>
        </form>
      </div>
    </div>
  );
}
