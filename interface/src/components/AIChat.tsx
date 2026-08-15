import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Sparkles } from 'lucide-react';
import { api } from '../lib/api';

type Message = { role: 'user' | 'assistant', content: string };

export function AIChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: "Hi! I'm your wedding assistant. Ask me anything about your tasks, venues, or inspiration!" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsLoading(true);

    try {
      const res = await api.post('/api/chat', { message: userMsg, history: messages });
      setMessages(prev => [...prev, { role: 'assistant', content: res.data.reply }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I couldn't connect to my brain. Check if the backend is running!" }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-20 md:bottom-6 right-4 md:right-8 z-50 flex flex-col items-end">
      {/* Chat Window */}
      {isOpen && (
        <div className="bg-bg-elevated w-[90vw] md:w-[400px] h-[520px] max-h-[70vh] rounded-2xl shadow-2xl border border-border-default flex flex-col mb-4 overflow-hidden animate-fade-in">
          {/* Header */}
          <div className="bg-bg-base/80 backdrop-blur-sm px-5 py-4 border-b border-border-subtle flex justify-between items-center">
            <div className="flex items-center gap-2.5">
              <div className="bg-accent/15 p-1.5 rounded-lg">
                <Sparkles size={16} className="text-accent" />
              </div>
              <h3 className="font-semibold text-text-primary text-sm">Wedding Assistant</h3>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-text-tertiary hover:text-text-primary bg-white/5 p-2 rounded-lg transition-colors">
              <X size={14} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-[14px] leading-relaxed ${
                  msg.role === 'user'
                  ? 'bg-gradient-to-r from-yellow-600/80 via-amber-500/80 to-yellow-600/80 text-white rounded-br-sm'
                  : 'bg-white/8 text-text-secondary border border-border-subtle rounded-bl-sm'
                }`}>
                  {msg.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white/8 text-text-tertiary rounded-2xl rounded-bl-sm px-4 py-2.5 text-sm flex gap-1 items-center border border-border-subtle">
                  <span className="animate-bounce">.</span><span className="animate-bounce" style={{animationDelay: '0.1s'}}>.</span><span className="animate-bounce" style={{animationDelay: '0.2s'}}>.</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSend} className="p-3 bg-bg-base/50 border-t border-border-subtle">
            <div className="flex relative">
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Ask about your plans..."
                className="input pl-4 pr-12 py-2.5 text-[14px] rounded-xl"
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-gradient-to-r from-yellow-600 via-amber-500 to-yellow-600 text-white p-1.5 rounded-lg hover:opacity-90 disabled:opacity-30 transition-all"
              >
                <Send size={16} />
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-gradient-to-r from-yellow-600 via-amber-500 to-yellow-600 text-white p-4 rounded-2xl shadow-lg hover:shadow-xl hover:scale-105 transition-all active:scale-95 animate-pulse-glow"
        >
          <MessageCircle size={24} />
        </button>
      )}
    </div>
  );
}
