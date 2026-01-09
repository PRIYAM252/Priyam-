
import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, UserProfile, ModerationAction } from '../types';

interface ChatInterfaceProps {
  messages: ChatMessage[];
  onSendMessage: (content: string) => void;
  currentUser: UserProfile;
  isAnalyzing: boolean;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ 
  messages, 
  onSendMessage, 
  currentUser,
  isAnalyzing 
}) => {
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isAnalyzing]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !currentUser.isMuted) {
      onSendMessage(input.trim());
      setInput('');
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-800/50 backdrop-blur-sm">
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth"
      >
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-4">
             <div className="p-4 rounded-full bg-slate-700/50">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
             </div>
             <p className="text-lg font-medium">No messages yet. Start chatting!</p>
             <p className="text-sm max-w-xs text-center">SentinelAI is watching to ensure a safe and respectful environment for everyone.</p>
          </div>
        )}

        {messages.map((msg) => (
          <div key={msg.id} className="flex flex-col">
            <div className={`flex items-start gap-3 ${msg.userId === currentUser.id ? 'flex-row-reverse' : ''}`}>
              <img 
                src={`https://picsum.photos/seed/${msg.userId}/60`} 
                alt={msg.username} 
                className="w-10 h-10 rounded-full border-2 border-slate-700 shadow-md"
              />
              <div className={`max-w-[70%] ${msg.userId === currentUser.id ? 'items-end' : 'items-start'}`}>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold text-slate-400">{msg.username}</span>
                  <span className="text-[10px] text-slate-500">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <div className={`px-4 py-3 rounded-2xl shadow-sm ${
                  msg.userId === currentUser.id 
                    ? 'bg-indigo-600 text-white rounded-tr-none' 
                    : 'bg-slate-700 text-slate-100 rounded-tl-none'
                } ${msg.moderation?.action !== ModerationAction.NOTHING && msg.moderation ? 'ring-2 ring-red-500/50' : ''}`}>
                  {msg.content}
                </div>
              </div>
            </div>

            {/* Moderation Badge on message */}
            {msg.moderation && msg.moderation.action !== ModerationAction.NOTHING && (
              <div className={`mt-2 flex ${msg.userId === currentUser.id ? 'justify-end' : 'justify-start'}`}>
                <div className={`text-[10px] flex items-center gap-1.5 px-2 py-1 rounded-full border border-red-500/30 bg-red-500/10 text-red-400 font-semibold uppercase tracking-wider`}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {msg.moderation.action}: {msg.moderation.violationType}
                </div>
              </div>
            )}
          </div>
        ))}

        {isAnalyzing && (
          <div className="flex items-center gap-2 text-slate-500 italic text-sm animate-pulse ml-12">
            <div className="flex gap-1">
              <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce"></span>
              <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce [animation-delay:0.2s]"></span>
              <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce [animation-delay:0.4s]"></span>
            </div>
            SentinelAI is analyzing...
          </div>
        )}
      </div>

      <div className="p-4 bg-slate-800/80 border-t border-slate-700">
        <form onSubmit={handleSubmit} className="flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={currentUser.isMuted}
            placeholder={currentUser.isMuted ? "You are currently muted..." : "Type a message... try being toxic to test the AI!"}
            className={`flex-1 bg-slate-700 border border-slate-600 text-white px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition shadow-inner ${currentUser.isMuted ? 'opacity-50 cursor-not-allowed' : ''}`}
          />
          <button
            type="submit"
            disabled={!input.trim() || currentUser.isMuted}
            className={`bg-indigo-600 text-white p-3 rounded-xl transition hover:bg-indigo-500 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </form>
        <p className="text-[10px] text-slate-500 mt-2 text-center">
          SentinelAI uses Gemini 3 Flash to detect violations and maintain community standards.
        </p>
      </div>
    </div>
  );
};

export default ChatInterface;
