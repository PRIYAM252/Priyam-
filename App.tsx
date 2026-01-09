
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  ChatMessage, 
  UserProfile, 
  ModerationLog, 
  ModerationAction, 
  ViolationType,
  ModerationResult
} from './types';
import { INITIAL_USERS, MUTE_LEVELS } from './constants';
import { analyzeMessage } from './services/geminiService';
import ChatInterface from './components/ChatInterface';
import Dashboard from './components/Dashboard';

const App: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [users, setUsers] = useState<UserProfile[]>(
    INITIAL_USERS.map(u => ({
      ...u,
      warningCount: 0,
      muteCount: 0,
      isMuted: false,
      muteUntil: null
    }))
  );
  const [logs, setLogs] = useState<ModerationLog[]>([]);
  const [currentUserIdx, setCurrentUserIdx] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Mute checker
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setUsers(prev => prev.map(user => {
        if (user.isMuted && user.muteUntil && now > user.muteUntil) {
          // Add unmuted log
          const newLog: ModerationLog = {
            id: Math.random().toString(36).substr(2, 9),
            timestamp: now,
            userId: user.id,
            username: user.username,
            action: ModerationAction.NOTHING,
            reason: 'Mute duration expired automatically.',
            content: 'SYSTEM UNMUTE',
          };
          setLogs(l => [newLog, ...l]);
          return { ...user, isMuted: false, muteUntil: null };
        }
        return user;
      }));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleSendMessage = async (content: string) => {
    const user = users[currentUserIdx];
    if (user.isMuted) return;

    const msgId = Math.random().toString(36).substr(2, 9);
    const newMessage: ChatMessage = {
      id: msgId,
      userId: user.id,
      username: user.username,
      content,
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, newMessage]);
    setIsAnalyzing(true);

    try {
      const modResult = await analyzeMessage(content);
      
      if (modResult.action !== ModerationAction.NOTHING) {
        processModeration(user, content, modResult);
        
        // Update message with moderation info
        setMessages(prev => prev.map(m => 
          m.id === msgId ? { ...m, moderation: modResult } : m
        ));
      }
    } catch (err) {
      console.error("Moderation failed", err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const processModeration = (user: UserProfile, content: string, result: ModerationResult) => {
    const now = Date.now();
    let finalAction = result.action;
    let duration = 0;

    setUsers(prev => prev.map(u => {
      if (u.id === user.id) {
        const newWarningCount = u.warningCount + (finalAction === ModerationAction.WARN ? 1 : 0);
        
        // Auto-escalation logic
        if (newWarningCount >= 3 && finalAction === ModerationAction.WARN) {
          finalAction = ModerationAction.MUTE;
        }

        if (finalAction === ModerationAction.MUTE) {
          const muteLevel = MUTE_LEVELS[Math.min(u.muteCount, MUTE_LEVELS.length - 1)];
          duration = result.suggestedMuteDurationMinutes || muteLevel.duration;
          const muteUntil = now + (duration * 60 * 1000);
          
          return {
            ...u,
            warningCount: 0, // Reset warnings on mute
            muteCount: u.muteCount + 1,
            isMuted: true,
            muteUntil
          };
        }

        return { ...u, warningCount: newWarningCount };
      }
      return u;
    }));

    // Log action
    const newLog: ModerationLog = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: now,
      userId: user.id,
      username: user.username,
      action: finalAction,
      reason: result.reason,
      content,
      duration: finalAction === ModerationAction.MUTE ? duration : undefined
    };

    setLogs(l => [newLog, ...l]);
  };

  const switchUser = () => {
    setCurrentUserIdx((prev) => (prev + 1) % users.length);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col lg:flex-row p-4 gap-6 max-w-[1600px] mx-auto">
      {/* Sidebar: Dashboard & Stats */}
      <div className="w-full lg:w-1/3 flex flex-col gap-6">
        <Dashboard 
          users={users} 
          logs={logs} 
        />
      </div>

      {/* Main: Chat & Controls */}
      <div className="w-full lg:w-2/3 flex flex-col gap-6 h-[85vh] lg:h-auto">
        <div className="bg-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-slate-700 flex-1">
          {/* Header */}
          <div className="p-4 bg-slate-800 border-b border-slate-700 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <h1 className="text-xl font-bold text-white tracking-tight">SentinelAI Chatroom</h1>
            </div>
            <button 
              onClick={switchUser}
              className="bg-indigo-600 hover:bg-indigo-500 transition px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2"
            >
              <span className="opacity-70">Posting as:</span> {users[currentUserIdx].username}
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
            </button>
          </div>

          <ChatInterface 
            messages={messages} 
            onSendMessage={handleSendMessage} 
            currentUser={users[currentUserIdx]}
            isAnalyzing={isAnalyzing}
          />
        </div>

        {/* User Alert Area */}
        {users[currentUserIdx].isMuted && (
          <div className="bg-red-900/40 border border-red-500/50 p-4 rounded-xl flex items-center gap-4 text-red-200">
            <div className="bg-red-500 p-2 rounded-full">
               <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <p className="font-bold">You are currently muted</p>
              <p className="text-sm opacity-90">Reason: Persistent violations or severe toxicity. Mute ends at {new Date(users[currentUserIdx].muteUntil!).toLocaleTimeString()}.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
