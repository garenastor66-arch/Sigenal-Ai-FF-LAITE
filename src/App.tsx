/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, signIn, signOut } from './lib/firebase';
import { dbService } from './services/db';
import { aiService } from './services/ai';
import { UserProfile, ChatSession, Message, MessageRole } from './types';
import Sidebar from './components/Sidebar';
import ChatView from './components/ChatView';
import AuthOverlay from './components/AuthOverlay';

export default function App() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [chats, setChats] = useState<ChatSession[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setError(null);
      if (firebaseUser) {
        try {
          const userProfile = await dbService.ensureUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
          });
          setUser(userProfile);
          const userChats = await dbService.getChats(firebaseUser.uid);
          setChats(userChats);
        } catch (err) {
          console.error("Auth init error:", err);
          setError("فشل الاتصال بقاعدة البيانات. يرجى التأكد من اتصال الإنترنت وإعادة المحاولة.");
        }
      } else {
        setUser(null);
        setChats([]);
        setCurrentChatId(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    let unsubscribe: () => void;
    if (currentChatId) {
      unsubscribe = dbService.subscribeToMessages(currentChatId, (msgs) => {
        setMessages(msgs);
      });
    } else {
      setMessages([]);
    }
    return () => unsubscribe?.();
  }, [currentChatId]);

  const handleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      await signIn();
    } catch (error: any) {
      console.error("Login failed:", error);
      setError("فشل تسجيل الدخول. يرجى المحاولة مرة أخرى.");
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
  };

  const handleNewChat = async () => {
    if (!user) return;
    const chatId = await dbService.createChat(user.uid, "New Conversation");
    const updatedChats = await dbService.getChats(user.uid);
    setChats(updatedChats);
    setCurrentChatId(chatId);
  };

  const handleSendMessage = async (content: string) => {
    if (!user || !currentChatId) return;

    // Save user message
    await dbService.saveMessage(currentChatId, MessageRole.USER, content);

    // If it's the first message, generate a title
    const currentChat = chats.find(c => c.id === currentChatId);
    if (currentChat && (currentChat.title === "New Conversation" || !currentChat.title)) {
      aiService.generateTitle(content).then(async (title) => {
        const { doc, updateDoc } = await import('firebase/firestore');
        const { db } = await import('./lib/firebase');
        await updateDoc(doc(db, 'chats', currentChatId), { title });
        setChats(prev => prev.map(c => c.id === currentChatId ? { ...c, title } : c));
      });
    }

    setIsTyping(true);
    try {
      const chatMessages = [...messages, { role: MessageRole.USER, content } as Message];
      const aiResponse = await aiService.chat(chatMessages, user.memory);
      await dbService.saveMessage(currentChatId, MessageRole.MODEL, aiResponse);
      
      // Update AI's memory of the user every 5 messages
      if (chatMessages.length % 5 === 0) {
        const updatedMemory = await aiService.extractMemory(chatMessages, user.memory);
        if (updatedMemory !== user.memory) {
          await dbService.updateMemory(user.uid, updatedMemory);
          setUser(prev => prev ? { ...prev, memory: updatedMemory } : null);
        }
      }
    } catch (error) {
      console.error("AI Error:", error);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSelectChat = (id: string) => {
    setCurrentChatId(id);
  };

  if (loading && !user) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-slate-950">
        <div className="w-12 h-12 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <AuthOverlay onSignIn={handleLogin} isLoading={loading} error={error} />;
  }

  return (
    <div className="h-screen w-screen flex overflow-hidden bg-[#040712]">
      <Sidebar 
        user={user}
        chats={chats}
        currentChatId={currentChatId}
        onSelectChat={(id) => {
          handleSelectChat(id);
          setSidebarOpen(false);
        }}
        onNewChat={() => {
          handleNewChat();
          setSidebarOpen(false);
        }}
        onSignOut={handleSignOut}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <main className="flex-1 overflow-hidden relative">
        <ChatView 
          chat={chats.find(c => c.id === currentChatId) || null}
          messages={messages}
          isTyping={isTyping}
          onSendMessage={handleSendMessage}
          onOpenMenu={() => setSidebarOpen(true)}
        />
      </main>
    </div>
  );
}
