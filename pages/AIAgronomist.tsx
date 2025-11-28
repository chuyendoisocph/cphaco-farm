
import React, { useState, useRef, useEffect } from 'react';
import { getGeminiAdvice } from '../services/geminiService';
import { useFarm } from '../context/FarmContext';
import { Bot, Send, User, Loader2, Sparkles } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface Message {
  id: string;
  role: 'user' | 'ai';
  content: string;
}

const AIAgronomist = () => {
  const { fields } = useFarm();
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', role: 'ai', content: 'Xin chào bà con! Tôi là Trợ lý nông nghiệp CPHACO. Bà con cần tư vấn về cây trồng, phân bón hay thời tiết hôm nay?' }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { id: Date.now().toString(), role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Provide context about the first field if available (simplified for demo)
    const contextData = fields.length > 0 ? { field: fields[0] } : undefined;

    const responseText = await getGeminiAdvice(input, contextData);

    const aiMessage: Message = { id: (Date.now() + 1).toString(), role: 'ai', content: responseText || "Xin lỗi, tôi không thể trả lời lúc này." };
    setMessages(prev => [...prev, aiMessage]);
    setIsLoading(false);
  };

  const suggestions = [
    "Đất xám Bình Dương nên trồng cây gì?",
    "Lịch bón phân cho cây sầu riêng mùa mưa?",
    "Cách phòng trừ rầy nâu hại lúa?",
    "Sau khi thu hoạch cải xanh nên trồng gì?"
  ];

  return (
    <div className="h-[calc(100vh-80px)] md:h-[calc(100vh-60px)] flex flex-col bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden">
      {/* Header */}
      <div className="p-4 bg-gradient-to-r from-agri-600 to-cyan-500 text-white flex items-center gap-3 shadow-md">
        <div className="p-2 bg-white/20 rounded-full backdrop-blur-sm">
            <Sparkles size={24} className="text-yellow-300" />
        </div>
        <div>
            <h2 className="font-bold text-lg">Trợ Lý CPHACO</h2>
            <p className="text-xs text-blue-50 opacity-90">Kỹ sư nông nghiệp 24/7</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
        {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`flex items-start max-w-[85%] md:max-w-[70%] gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm ${msg.role === 'user' ? 'bg-slate-200' : 'bg-gradient-to-br from-agri-500 to-cyan-500 text-white'}`}>
                        {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                    </div>
                    <div className={`p-3 rounded-2xl text-sm shadow-sm ${msg.role === 'user' ? 'bg-agri-600 text-white rounded-tr-none' : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none'}`}>
                        <ReactMarkdown >{msg.content}</ReactMarkdown>
                    </div>
                </div>
            </div>
        ))}
        {isLoading && (
             <div className="flex justify-start">
                 <div className="flex items-center gap-2 bg-white border border-slate-200 p-3 rounded-2xl rounded-tl-none shadow-sm">
                     <Loader2 size={16} className="animate-spin text-agri-600" />
                     <span className="text-sm text-slate-500">Đang suy nghĩ...</span>
                 </div>
             </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-slate-100">
        {messages.length < 3 && (
            <div className="flex gap-2 overflow-x-auto pb-3 mb-2 no-scrollbar">
                {suggestions.map((s, i) => (
                    <button key={i} onClick={() => setInput(s)} className="whitespace-nowrap px-3 py-1 bg-agri-50 hover:bg-agri-100 text-agri-700 text-xs rounded-full border border-agri-200 transition-colors font-medium">
                        {s}
                    </button>
                ))}
            </div>
        )}
        <form onSubmit={handleSend} className="flex gap-2">
            <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Nhập câu hỏi..." 
                className="flex-1 p-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-agri-500 focus:border-transparent shadow-sm"
                disabled={isLoading}
            />
            <button 
                type="submit" 
                disabled={!input.trim() || isLoading}
                className="bg-gradient-to-r from-agri-600 to-cyan-500 hover:from-agri-700 hover:to-cyan-600 disabled:opacity-50 text-white p-3 rounded-xl transition-all shadow-md transform hover:scale-105"
            >
                <Send size={20} />
            </button>
        </form>
      </div>
    </div>
  );
};

export default AIAgronomist;