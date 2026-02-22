// ==================================================
// SportVerse AI - Messages Page (Direct Messaging)
// WhatsApp-style personal chat with online/offline, text, feed share
// ==================================================

import { AnimatePresence, motion } from 'framer-motion';
import {
    ArrowLeft,
    Check,
    CheckCheck,
    MessageCircle,
    Phone,
    Search,
    Send,
    Share2,
    Video,
    X
} from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { io } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

export default function Messages() {
  const { user, token } = useAuth();
  const myId = user?.id || user?._id;

  // Navigation & data
  const [conversations, setConversations] = useState([]);
  const [activeConvo, setActiveConvo] = useState(null);
  const [messages, setMessages] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const [typing, setTyping] = useState(false);
  const [unreadTotal, setUnreadTotal] = useState(0);

  // New conversation
  const [showNewChat, setShowNewChat] = useState(false);
  const [userSearch, setUserSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);

  // Input
  const [chatInput, setChatInput] = useState('');
  const [socket, setSocket] = useState(null);
  const chatEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // ---- Socket ----
  useEffect(() => {
    if (!token) return;
    const s = io(SOCKET_URL, { auth: { token } });
    s.on('connect', () => console.log('DM socket connected'));

    s.on('online_users', (userIds) => {
      setOnlineUsers(new Set(userIds));
    });
    s.on('user_online', (userId) => {
      setOnlineUsers(prev => new Set([...prev, userId]));
    });
    s.on('user_offline', (userId) => {
      setOnlineUsers(prev => { const n = new Set(prev); n.delete(userId); return n; });
    });
    s.on('new_dm', (msg) => {
      setMessages(prev => {
        // Only add if it's for the active conversation
        if (msg.conversation_id === activeConvo?._id) {
          return [...prev, msg];
        }
        return prev;
      });
      // Refresh conversations list for latest message preview
      fetchConversations();
    });
    s.on('user_typing', ({ userName, conversationId }) => {
      if (conversationId && conversationId === activeConvo?._id) {
        setTyping(userName);
        setTimeout(() => setTyping(false), 2500);
      }
    });

    setSocket(s);
    return () => { s.disconnect(); };
  }, [token, activeConvo?._id]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => { fetchConversations(); }, []);

  // ---- API Calls ----
  const fetchConversations = async () => {
    try {
      const { data } = await api.get('/dm/conversations');
      setConversations(data.conversations || []);
      // Get total unread
      const { data: unread } = await api.get('/dm/unread-count');
      setUnreadTotal(unread.total || 0);
    } catch (err) { console.error(err); }
  };

  const openConversation = async (convo) => {
    setActiveConvo(convo);
    setShowNewChat(false);
    try {
      const { data } = await api.get(`/dm/conversation/${convo._id}/messages`);
      setMessages(data.messages || []);
      // Mark as read via socket
      if (socket) socket.emit('mark_read', { conversationId: convo._id });
      fetchConversations(); // refresh unread counts
    } catch (err) { console.error(err); }
  };

  const startNewConversation = async (otherUser) => {
    const otherUserId = otherUser._id || otherUser.id;
    try {
      const { data } = await api.post('/dm/conversation', { userId: otherUserId });
      setShowNewChat(false);
      setUserSearch('');
      setSearchResults([]);
      await fetchConversations();
      // Find the conversation and open it
      const convo = { ...data.conversation, other_user: otherUser };
      openConversation(convo);
    } catch (err) { toast.error('Failed to start conversation'); }
  };

  const searchUsers = useCallback(async (query) => {
    if (!query.trim()) { setSearchResults([]); return; }
    setSearchLoading(true);
    try {
      const { data } = await api.get(`/users?search=${encodeURIComponent(query)}`);
      // Filter out self
      setSearchResults((data.users || []).filter(u => (u._id || u.id) !== myId));
    } catch (err) { console.error(err); }
    finally { setSearchLoading(false); }
  }, [myId]);

  useEffect(() => {
    const timer = setTimeout(() => searchUsers(userSearch), 300);
    return () => clearTimeout(timer);
  }, [userSearch, searchUsers]);

  // ---- Send Message ----
  const sendMessage = async (type = 'text') => {
    if (!chatInput.trim() || !activeConvo) return;
    try {
      if (socket) {
        socket.emit('send_dm', {
          conversationId: activeConvo._id,
          content: chatInput.trim(),
          type,
        });
      } else {
        await api.post(`/dm/conversation/${activeConvo._id}/messages`, {
          content: chatInput.trim(),
          type,
        });
        const { data } = await api.get(`/dm/conversation/${activeConvo._id}/messages`);
        setMessages(data.messages || []);
      }
      setChatInput('');
      fetchConversations();
    } catch (err) { toast.error('Failed to send message'); }
  };

  const handleTyping = () => {
    if (!socket || !activeConvo) return;
    const otherUser = getOtherUser(activeConvo);
    socket.emit('typing', {
      conversationId: activeConvo._id,
      toUserId: otherUser?._id || otherUser?.id,
    });
  };

  // ---- Helpers ----
  const getOtherUser = (convo) => {
    if (convo.other_user) return convo.other_user;
    return convo.participants?.find(p => {
      const pId = p._id || p.id || p;
      return pId?.toString() !== myId?.toString();
    });
  };

  const isOnline = (userId) => onlineUsers.has(userId?.toString?.() || userId);

  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    const now = new Date();
    const isToday = d.toDateString() === now.toDateString();
    if (isToday) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const yesterday = new Date(now); yesterday.setDate(now.getDate() - 1);
    if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  };

  // ---- Mobile: show chat or list ----
  const showChat = !!activeConvo;

  return (
    <div className="flex h-[calc(100vh-7rem)] bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
      {/* ============ LEFT: Conversations List ============ */}
      <div className={`${showChat ? 'hidden md:flex' : 'flex'} flex-col w-full md:w-96 border-r border-gray-100`}>
        {/* Header */}
        <div className="px-5 py-4 border-b bg-gradient-to-r from-primary-50 to-blue-50">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <MessageCircle size={22} className="text-primary-500" /> Messages
            </h2>
            <button onClick={() => setShowNewChat(true)}
              className="p-2 bg-primary-500 text-white rounded-full hover:bg-primary-600 transition-colors shadow-sm">
              <Send size={16} />
            </button>
          </div>
          {unreadTotal > 0 && (
            <p className="text-xs text-primary-600 mt-1 font-medium">{unreadTotal} unread message{unreadTotal > 1 ? 's' : ''}</p>
          )}
        </div>

        {/* New Chat Search */}
        <AnimatePresence>
          {showNewChat && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
              className="border-b overflow-hidden">
              <div className="p-3">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-sm font-semibold text-gray-700">New Conversation</h3>
                  <button onClick={() => { setShowNewChat(false); setUserSearch(''); setSearchResults([]); }}
                    className="ml-auto p-1 hover:bg-gray-100 rounded">
                    <X size={14} className="text-gray-400" />
                  </button>
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                  <input value={userSearch} onChange={e => setUserSearch(e.target.value)}
                    placeholder="Search users by name..." autoFocus
                    className="w-full pl-9 pr-3 py-2 rounded-lg bg-gray-50 border border-gray-200 text-sm focus:border-primary-400 outline-none" />
                </div>
                {searchLoading && <p className="text-xs text-gray-400 mt-2 px-1">Searching...</p>}
                {searchResults.length > 0 && (
                  <div className="mt-2 max-h-48 overflow-y-auto space-y-1">
                    {searchResults.map(u => (
                      <button key={u._id || u.id} onClick={() => startNewConversation(u)}
                        className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-primary-50 transition-colors text-left">
                        <div className="relative">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-400 to-sport-blue flex items-center justify-center text-white text-sm font-bold">
                            {u.avatar ? <img src={u.avatar} alt="" className="w-full h-full rounded-full object-cover" /> : u.name?.[0]?.toUpperCase()}
                          </div>
                          {isOnline(u._id || u.id) && (
                            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-800">{u.name}</p>
                          <p className="text-xs text-gray-400 capitalize">{u.role || 'athlete'}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto">
          {conversations.length > 0 ? conversations.map(convo => {
            const other = getOtherUser(convo);
            const otherId = other?._id || other?.id;
            const online = isOnline(otherId);
            const isActive = activeConvo?._id === convo._id;
            return (
              <button key={convo._id} onClick={() => openConversation(convo)}
                className={`w-full flex items-center gap-3 px-4 py-3.5 border-b border-gray-50 hover:bg-gray-50 transition-colors text-left ${
                  isActive ? 'bg-primary-50 border-l-3 border-l-primary-500' : ''
                }`}>
                <div className="relative flex-shrink-0">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-400 to-sport-blue flex items-center justify-center text-white font-bold">
                    {other?.avatar ? <img src={other.avatar} alt="" className="w-full h-full rounded-full object-cover" /> : other?.name?.[0]?.toUpperCase() || '?'}
                  </div>
                  {online && <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-gray-900 text-sm truncate">{other?.name || 'Unknown'}</span>
                    <span className="text-[10px] text-gray-400 flex-shrink-0">{formatTime(convo.last_message_at)}</span>
                  </div>
                  <div className="flex items-center justify-between mt-0.5">
                    <p className="text-xs text-gray-500 truncate max-w-[180px]">
                      {convo.last_sender_id?.toString() === myId?.toString() && <span className="text-gray-400">You: </span>}
                      {convo.last_message || 'Start chatting...'}
                    </p>
                    {convo.unread_count > 0 && (
                      <span className="ml-2 text-[10px] w-5 h-5 flex items-center justify-center bg-primary-500 text-white rounded-full font-bold flex-shrink-0">
                        {convo.unread_count > 9 ? '9+' : convo.unread_count}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            );
          }) : (
            <div className="flex flex-col items-center justify-center h-full text-center px-6">
              <div className="w-16 h-16 rounded-full bg-primary-50 flex items-center justify-center mb-4">
                <MessageCircle size={28} className="text-primary-300" />
              </div>
              <p className="text-gray-500 font-medium">No messages yet</p>
              <p className="text-gray-400 text-xs mt-1">Click the send button above to start a conversation</p>
            </div>
          )}
        </div>
      </div>

      {/* ============ RIGHT: Chat Area ============ */}
      <div className={`${showChat ? 'flex' : 'hidden md:flex'} flex-col flex-1`}>
        {activeConvo ? (() => {
          const other = getOtherUser(activeConvo);
          const otherId = other?._id || other?.id;
          const online = isOnline(otherId);
          return (
            <>
              {/* Chat Header */}
              <div className="flex items-center gap-3 px-5 py-3 border-b bg-white">
                <button onClick={() => setActiveConvo(null)} className="md:hidden p-1.5 hover:bg-gray-100 rounded-lg">
                  <ArrowLeft size={20} className="text-gray-500" />
                </button>
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-sport-blue flex items-center justify-center text-white font-bold text-sm">
                    {other?.avatar ? <img src={other.avatar} alt="" className="w-full h-full rounded-full object-cover" /> : other?.name?.[0]?.toUpperCase() || '?'}
                  </div>
                  {online && <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-900 text-sm truncate">{other?.name || 'Unknown'}</h3>
                  <p className={`text-xs ${online ? 'text-green-500' : 'text-gray-400'}`}>
                    {typing ? <span className="italic text-primary-500">{typing} is typing...</span> : (online ? 'Online' : 'Offline')}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <button className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-primary-500 transition-colors" title="Voice call">
                    <Phone size={18} />
                  </button>
                  <button className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-primary-500 transition-colors" title="Video call">
                    <Video size={18} />
                  </button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-2" style={{
                backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%239C92AC\' fill-opacity=\'0.02\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
                backgroundColor: '#f8fafc'
              }}>
                {messages.length === 0 && (
                  <div className="text-center py-16">
                    <div className="w-16 h-16 mx-auto rounded-full bg-primary-100 flex items-center justify-center mb-3">
                      <MessageCircle size={28} className="text-primary-400" />
                    </div>
                    <p className="text-gray-400 text-sm">No messages yet</p>
                    <p className="text-gray-300 text-xs mt-1">Say hello! 👋</p>
                  </div>
                )}

                {messages.map((msg, i) => {
                  const isMe = msg.sender_id?.toString() === myId?.toString();
                  const showDate = i === 0 || new Date(msg.created_at || msg.createdAt).toDateString() !== new Date(messages[i - 1]?.created_at || messages[i - 1]?.createdAt).toDateString();
                  return (
                    <div key={msg._id || i}>
                      {showDate && (
                        <div className="text-center my-3">
                          <span className="text-[10px] text-gray-400 bg-white px-3 py-1 rounded-full shadow-sm border border-gray-100">
                            {new Date(msg.created_at || msg.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                          </span>
                        </div>
                      )}
                      <div className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[75%] px-3.5 py-2.5 text-sm shadow-sm ${
                          isMe
                            ? 'bg-gradient-to-br from-primary-500 to-primary-600 text-white rounded-2xl rounded-br-sm'
                            : 'bg-white text-gray-800 rounded-2xl rounded-bl-sm border border-gray-100'
                        }`}>
                          {msg.type === 'feed_share' && msg.shared_post_id && (
                            <div className={`mb-2 p-2 rounded-lg text-xs ${isMe ? 'bg-white/10' : 'bg-gray-50'}`}>
                              <Share2 size={12} className="inline mr-1" /> Shared a post
                            </div>
                          )}
                          {msg.type === 'video_call' && (
                            <div className={`mb-1 flex items-center gap-1.5 text-xs ${isMe ? 'text-white/70' : 'text-gray-500'}`}>
                              <Video size={12} /> Video Call
                            </div>
                          )}
                          <p className="whitespace-pre-wrap">{msg.content}</p>
                          <div className={`flex items-center justify-end gap-1 mt-1 ${isMe ? 'text-white/50' : 'text-gray-400'}`}>
                            <span className="text-[10px]">
                              {msg.created_at || msg.createdAt ? new Date(msg.created_at || msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                            </span>
                            {isMe && (msg.read ? <CheckCheck size={12} className="text-blue-300" /> : <Check size={12} />)}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={chatEndRef} />
              </div>

              {/* Chat Input */}
              <div className="px-4 py-3 border-t bg-white">
                <div className="flex items-end gap-2">
                  <input
                    value={chatInput}
                    onChange={e => { setChatInput(e.target.value); handleTyping(); }}
                    onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                    placeholder="Type a message..."
                    className="flex-1 px-4 py-2.5 rounded-full bg-gray-50 border border-gray-200 focus:border-primary-400 focus:bg-white outline-none text-sm transition-all"
                  />
                  <button onClick={() => sendMessage()} disabled={!chatInput.trim()}
                    className="p-2.5 rounded-full bg-gradient-to-r from-primary-500 to-sport-blue text-white disabled:opacity-40 hover:shadow-lg transition-all">
                    <Send size={18} />
                  </button>
                </div>
              </div>
            </>
          );
        })() : (
          <div className="flex-1 flex flex-col items-center justify-center text-center px-8">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary-100 to-blue-100 flex items-center justify-center mb-6">
              <MessageCircle size={40} className="text-primary-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-800">SportVerse Messenger</h3>
            <p className="text-gray-400 text-sm mt-2 max-w-xs">Select a conversation or start a new one to chat with fellow athletes</p>
          </div>
        )}
      </div>
    </div>
  );
}
