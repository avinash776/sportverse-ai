// ==================================================
// SportVerse AI - Chat Window Component
// Real-time chat using Socket.io
// ==================================================

import { MessageCircle, Send, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function ChatWindow({ roomId, roomName, onClose }) {
  const { user, token } = useAuth();
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(null);
  const [connected, setConnected] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    if (!token || !roomId) return;

    // Fetch message history
    api.get(`/chat/messages/${roomId}`)
      .then(({ data }) => setMessages(data.messages || []))
      .catch(console.error);

    // Connect socket
    const s = io(SOCKET_URL, { auth: { token } });

    s.on('connect', () => {
      setConnected(true);
      s.emit('join_room', roomId);
    });

    s.on('new_message', (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    s.on('user_typing', ({ userName }) => {
      setTyping(userName);
      setTimeout(() => setTyping(null), 2000);
    });

    s.on('disconnect', () => setConnected(false));

    setSocket(s);
    return () => { s.disconnect(); };
  }, [token, roomId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = () => {
    if (!input.trim() || !socket) return;
    socket.emit('send_message', { roomId, content: input.trim() });
    setInput('');
  };

  const handleTyping = () => {
    if (socket) socket.emit('typing', { roomId });
  };

  return (
    <div className="fixed bottom-4 right-4 w-96 h-[500px] bg-white rounded-2xl shadow-2xl border flex flex-col z-50">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-primary-500 to-sport-blue rounded-t-2xl">
        <div className="flex items-center gap-2 text-white">
          <MessageCircle size={18} />
          <span className="font-semibold">{roomName || 'Chat'}</span>
          {connected && <span className="w-2 h-2 rounded-full bg-green-400" />}
        </div>
        <button onClick={onClose} className="text-white/70 hover:text-white"><X size={18} /></button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && (
          <p className="text-center text-sm text-gray-400 mt-8">No messages yet. Start the conversation!</p>
        )}
        {messages.map((msg, i) => {
          const isMe = msg.user_id === user?.id;
          return (
            <div key={msg.id || i} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[75%] px-3 py-2 rounded-2xl text-sm ${
                isMe ? 'bg-primary-500 text-white rounded-br-md' : 'bg-gray-100 text-gray-800 rounded-bl-md'}`}>
                {!isMe && <p className="text-xs font-semibold mb-0.5 text-primary-600">{msg.user_name}</p>}
                <p>{msg.content}</p>
                <p className={`text-[10px] mt-0.5 ${isMe ? 'text-white/60' : 'text-gray-400'}`}>
                  {msg.created_at ? new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                </p>
              </div>
            </div>
          );
        })}
        {typing && (
          <p className="text-xs text-gray-400 italic">{typing} is typing...</p>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="p-3 border-t">
        <div className="flex gap-2">
          <input value={input} onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { handleTyping(); if (e.key === 'Enter') sendMessage(); }}
            placeholder="Type a message..." className="input-field flex-1 text-sm py-2" />
          <button onClick={sendMessage} disabled={!input.trim()}
            className="btn-primary p-2 disabled:opacity-50">
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
