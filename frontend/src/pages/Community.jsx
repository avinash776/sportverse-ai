// ==================================================
// SportVerse AI - Community Page (Full Hub)
// Feed, Groups, Group Chat — WhatsApp-style sports community
// ==================================================

import { AnimatePresence, motion } from 'framer-motion';
import {
    ArrowLeft,
    Globe,
    Heart,
    Image,
    MessageCircle,
    MessageSquare,
    Plus,
    Search,
    Send,
    UserPlus,
    Users,
    X,
} from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { io } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

const SPORT_BANNERS = [
  'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=800&h=300&fit=crop',
  'https://images.unsplash.com/photo-1553778263-73a83bab9b0c?w=800&h=300&fit=crop',
  'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=800&h=300&fit=crop',
  'https://images.unsplash.com/photo-1461896836934-bbe8e2b3d6c0?w=800&h=300&fit=crop',
];

const POST_TYPES = [
  { value: 'all', label: 'All Posts', emoji: '📢' },
  { value: 'general', label: 'General', emoji: '💬' },
  { value: 'looking_for_players', label: 'Looking for Players', emoji: '🏏' },
  { value: 'event', label: 'Events', emoji: '📅' },
  { value: 'announcement', label: 'Announcements', emoji: '📣' },
  { value: 'tournament', label: 'Tournaments', emoji: '🏆' },
];

const SPORTS = ['cricket', 'football', 'badminton', 'tennis', 'basketball', 'volleyball', 'hockey', 'general'];

export default function Community() {
  const { user, token } = useAuth();
  const [tab, setTab] = useState('feed');
  // Feed
  const [posts, setPosts] = useState([]);
  const [filter, setFilter] = useState('all');
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [newPost, setNewPost] = useState({ title: '', content: '', type: 'general', sport: '' });
  const [commentText, setCommentText] = useState({});
  const [expandedComments, setExpandedComments] = useState(null);
  const [postComments, setPostComments] = useState({});
  const [feedLoading, setFeedLoading] = useState(false);
  // Groups
  const [groups, setGroups] = useState([]);
  const [search, setSearch] = useState('');
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [newGroup, setNewGroup] = useState({ name: '', description: '', sport: 'cricket' });
  // Group Chat
  const [activeGroup, setActiveGroup] = useState(null);
  const [groupMessages, setGroupMessages] = useState([]);
  const [groupMembers, setGroupMembers] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [socket, setSocket] = useState(null);
  const [typing, setTyping] = useState(null);
  const chatEndRef = useRef(null);

  useEffect(() => { fetchPosts(); fetchGroups(); }, [filter]);

  // Socket connection for group chat
  useEffect(() => {
    if (!token) return;
    const s = io(SOCKET_URL, { auth: { token } });
    s.on('connect', () => console.log('Community socket connected'));
    s.on('new_message', (msg) => {
      setGroupMessages(prev => [...prev, msg]);
    });
    s.on('user_typing', ({ userName }) => {
      setTyping(userName);
      setTimeout(() => setTyping(null), 2000);
    });
    setSocket(s);
    return () => { s.disconnect(); };
  }, [token]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [groupMessages]);

  // ---- Feed ----
  const fetchPosts = async () => {
    try {
      const params = filter !== 'all' ? `?type=${filter}` : '';
      const { data } = await api.get(`/community/posts${params}`);
      setPosts(data.posts || []);
    } catch (err) { console.error(err); }
  };

  const handleCreatePost = async () => {
    if (!newPost.content.trim()) return;
    setFeedLoading(true);
    try {
      await api.post('/community/posts', {
        title: newPost.title || newPost.content.substring(0, 50),
        content: newPost.content,
        type: newPost.type,
        sport: newPost.sport || null,
      });
      toast.success('Post shared with the community! 🎉');
      setNewPost({ title: '', content: '', type: 'general', sport: '' });
      setShowCreatePost(false);
      fetchPosts();
    } catch (err) { toast.error('Failed to create post'); }
    finally { setFeedLoading(false); }
  };

  const handleLike = async (postId) => {
    try {
      await api.post(`/community/posts/${postId}/like`);
      fetchPosts();
    } catch (err) { console.error(err); }
  };

  const handleComment = async (postId) => {
    const text = commentText[postId];
    if (!text?.trim()) return;
    try {
      await api.post(`/community/posts/${postId}/comments`, { content: text });
      setCommentText({ ...commentText, [postId]: '' });
      fetchComments(postId);
      fetchPosts();
    } catch (err) { toast.error('Failed to comment'); }
  };

  const fetchComments = async (postId) => {
    try {
      const { data } = await api.get(`/community/posts/${postId}/comments`);
      setPostComments(prev => ({ ...prev, [postId]: data.comments || [] }));
    } catch (err) { console.error(err); }
  };

  const toggleComments = (postId) => {
    if (expandedComments === postId) {
      setExpandedComments(null);
    } else {
      setExpandedComments(postId);
      if (!postComments[postId]) fetchComments(postId);
    }
  };

  // ---- Groups ----
  const fetchGroups = async () => {
    try {
      const { data } = await api.get('/community/groups');
      setGroups(data.groups || []);
    } catch (err) { console.error(err); }
  };

  const handleCreateGroup = async () => {
    if (!newGroup.name.trim()) return;
    setFeedLoading(true);
    try {
      await api.post('/community/groups', newGroup);
      toast.success('Group created! 🏟️');
      setNewGroup({ name: '', description: '', sport: 'cricket' });
      setShowCreateGroup(false);
      fetchGroups();
    } catch (err) { toast.error('Failed to create group'); }
    finally { setFeedLoading(false); }
  };

  const handleJoinGroup = async (groupId) => {
    try {
      await api.post(`/community/groups/${groupId}/join`);
      toast.success('Joined group! 🤝');
      fetchGroups();
    } catch (err) { toast.error(err.response?.data?.error || 'Failed to join'); }
  };

  const handleLeaveGroup = async (groupId) => {
    try {
      await api.post(`/community/groups/${groupId}/leave`);
      toast.success('Left group');
      fetchGroups();
      if (activeGroup?.id === groupId || activeGroup?._id === groupId) {
        setActiveGroup(null);
      }
    } catch (err) { toast.error('Failed to leave'); }
  };

  // ---- Group Chat ----
  const openGroupChat = useCallback(async (group) => {
    const groupId = group._id || group.id;
    setActiveGroup(group);
    try {
      const [msgRes, memRes] = await Promise.all([
        api.get(`/chat/messages/${groupId}`),
        api.get(`/community/groups/${groupId}/members`),
      ]);
      setGroupMessages(msgRes.data.messages || []);
      setGroupMembers(memRes.data.members || []);
    } catch (err) { console.error(err); }
    if (socket) socket.emit('join_room', groupId);
  }, [socket]);

  const sendGroupMessage = () => {
    if (!chatInput.trim() || !socket || !activeGroup) return;
    const roomId = activeGroup._id || activeGroup.id;
    socket.emit('send_message', { roomId, content: chatInput.trim() });
    setChatInput('');
  };

  const filteredGroups = groups.filter(g =>
    g.name?.toLowerCase().includes(search.toLowerCase()) ||
    g.sport?.toLowerCase().includes(search.toLowerCase())
  );

  const isMember = (g) => {
    if (g.is_member) return true;
    return g.members?.some(m => {
      const mId = m.user_id?._id || m.user_id;
      return mId?.toString() === (user?.id || user?._id)?.toString();
    });
  };

  // ---- Render ----

  // Group chat view (full screen overlay within the page)
  if (activeGroup) {
    const groupId = activeGroup._id || activeGroup.id;
    return (
      <div className="flex flex-col h-[calc(100vh-7rem)] bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
        {/* Chat Header */}
        <div className="flex items-center gap-3 px-5 py-3.5 bg-gradient-to-r from-primary-600 via-sport-blue to-sport-green text-white border-b">
          <button onClick={() => { setActiveGroup(null); if (socket) socket.emit('leave_room', groupId); }}
            className="p-1.5 hover:bg-white/20 rounded-lg transition-colors">
            <ArrowLeft size={20} />
          </button>
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-lg font-bold">
            {activeGroup.name?.[0]}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-sm truncate">{activeGroup.name}</h3>
            <p className="text-xs text-white/70">{groupMembers.length} members • {activeGroup.sport || 'General'}</p>
          </div>
          <div className="flex items-center gap-1">
            <Users size={16} className="text-white/70" />
            <span className="text-xs text-white/70">{groupMembers.length}</span>
          </div>
        </div>

        {/* Messages area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2" style={{
          backgroundImage: 'radial-gradient(circle at 20% 80%, rgba(99,102,241,0.03) 0, transparent 50%), radial-gradient(circle at 80% 20%, rgba(16,185,129,0.03) 0, transparent 50%)',
          backgroundColor: '#f8fafc'
        }}>
          {groupMessages.length === 0 && (
            <div className="text-center py-16">
              <div className="w-16 h-16 mx-auto rounded-full bg-primary-100 flex items-center justify-center mb-3">
                <MessageCircle size={28} className="text-primary-400" />
              </div>
              <p className="text-gray-400 text-sm">No messages yet. Start the conversation!</p>
              <p className="text-gray-300 text-xs mt-1">Say hi to your group members 👋</p>
            </div>
          )}
          {groupMessages.map((msg, i) => {
            const isMe = (msg.user_id || msg.userId) === (user?.id || user?._id);
            const isSystem = msg.type === 'system';
            if (isSystem) return (
              <div key={msg.id || i} className="text-center">
                <span className="text-xs text-gray-400 bg-gray-100 px-3 py-1 rounded-full">{msg.content}</span>
              </div>
            );
            return (
              <div key={msg.id || i} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[70%] px-3.5 py-2.5 text-sm shadow-sm ${
                  isMe
                    ? 'bg-gradient-to-br from-primary-500 to-primary-600 text-white rounded-2xl rounded-br-md'
                    : 'bg-white text-gray-800 rounded-2xl rounded-bl-md border border-gray-100'}`}>
                  {!isMe && <p className="text-xs font-semibold mb-1 text-primary-600">{msg.user_name || msg.userName || 'User'}</p>}
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                  <p className={`text-[10px] mt-1 text-right ${isMe ? 'text-white/50' : 'text-gray-400'}`}>
                    {msg.created_at || msg.createdAt ? new Date(msg.created_at || msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                  </p>
                </div>
              </div>
            );
          })}
          {typing && <p className="text-xs text-gray-400 italic ml-2">{typing} is typing...</p>}
          <div ref={chatEndRef} />
        </div>

        {/* Chat Input */}
        <div className="px-4 py-3 border-t bg-white">
          <div className="flex gap-2 items-end">
            <input
              value={chatInput}
              onChange={e => setChatInput(e.target.value)}
              onKeyDown={e => {
                if (socket) socket.emit('typing', { roomId: groupId });
                if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendGroupMessage(); }
              }}
              placeholder="Type a message..."
              className="flex-1 px-4 py-2.5 rounded-full bg-gray-50 border border-gray-200 focus:border-primary-400 focus:bg-white outline-none text-sm transition-all"
            />
            <button onClick={sendGroupMessage} disabled={!chatInput.trim()}
              className="p-2.5 rounded-full bg-gradient-to-r from-primary-500 to-sport-blue text-white disabled:opacity-40 hover:shadow-lg transition-all">
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with sport banner */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary-600 via-sport-blue to-sport-green p-6 text-white">
          <div className="absolute inset-0 opacity-10">
            <img src={SPORT_BANNERS[Math.floor(Math.random() * SPORT_BANNERS.length)]} alt="" className="w-full h-full object-cover" />
          </div>
          <div className="relative z-10">
            <h1 className="text-3xl font-bold font-display">🏟️ Community Hub</h1>
            <p className="text-white/80 mt-1">Connect, share, and play with fellow athletes</p>
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-2 bg-gray-100/80 p-1.5 rounded-2xl">
        {[
          { id: 'feed', label: 'Feed', emoji: '📢' },
          { id: 'groups', label: 'Groups', emoji: '👥' },
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              tab === t.id ? 'bg-white text-primary-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}>
            <span>{t.emoji}</span> {t.label}
          </button>
        ))}
      </div>

      {/* ============ FEED TAB ============ */}
      {tab === 'feed' && (
        <div className="space-y-4">
          {/* Create Post Card */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="card p-4 cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => setShowCreatePost(true)}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-sport-blue flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                {user?.name?.[0]?.toUpperCase() || 'U'}
              </div>
              <div className="flex-1 bg-gray-50 rounded-full px-4 py-2.5 text-sm text-gray-400 hover:bg-gray-100 transition-colors">
                What's happening in your sports world?
              </div>
              <button className="p-2 text-primary-500 hover:bg-primary-50 rounded-full">
                <Image size={20} />
              </button>
            </div>
          </motion.div>

          {/* Filters */}
          <div className="flex gap-2 overflow-x-auto pb-1">
            {POST_TYPES.map(t => (
              <button key={t.value} onClick={() => setFilter(t.value)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                  filter === t.value
                    ? 'bg-primary-500 text-white shadow-md'
                    : 'bg-white text-gray-500 border border-gray-200 hover:border-primary-300 hover:text-primary-600'
                }`}>
                <span>{t.emoji}</span> {t.label}
              </button>
            ))}
          </div>

          {/* Create Post Modal */}
          <AnimatePresence>
            {showCreatePost && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                className="card p-5 border-2 border-primary-100">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-gray-900 text-lg">Create Post</h3>
                  <button onClick={() => setShowCreatePost(false)} className="p-1.5 hover:bg-gray-100 rounded-lg">
                    <X size={18} className="text-gray-400" />
                  </button>
                </div>
                <input value={newPost.title} onChange={e => setNewPost({ ...newPost, title: e.target.value })}
                  placeholder="Post title (optional)" className="input-field mb-3 text-sm" />
                <textarea value={newPost.content} onChange={e => setNewPost({ ...newPost, content: e.target.value })}
                  placeholder="Share your sports experience, tips, or updates..." rows={4} className="input-field resize-none text-sm" />
                <div className="flex flex-wrap items-center gap-3 mt-4">
                  <select value={newPost.type} onChange={e => setNewPost({ ...newPost, type: e.target.value })}
                    className="input-field w-auto text-sm py-2">
                    <option value="general">💬 General</option>
                    <option value="looking_for_players">🏏 Looking for Players</option>
                    <option value="event">📅 Event</option>
                    <option value="announcement">📣 Announcement</option>
                  </select>
                  <select value={newPost.sport} onChange={e => setNewPost({ ...newPost, sport: e.target.value })}
                    className="input-field w-auto text-sm py-2">
                    <option value="">Sport (optional)</option>
                    {SPORTS.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                  </select>
                  <button onClick={handleCreatePost} disabled={feedLoading || !newPost.content.trim()}
                    className="ml-auto btn-primary text-sm flex items-center gap-1.5 disabled:opacity-50">
                    <Send size={14} /> Share Post
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Posts List */}
          {posts.length > 0 ? posts.map(post => {
            const postId = post.id || post._id;
            return (
            <motion.div key={postId} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="card p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start gap-3">
                <div className="w-11 h-11 rounded-full bg-gradient-to-br from-primary-400 to-sport-blue flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow-sm">
                  {post.author_avatar ? (
                    <img src={post.author_avatar} alt="" className="w-full h-full rounded-full object-cover" />
                  ) : (
                    post.author_name?.[0]?.toUpperCase() || '?'
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-gray-900 text-sm">{post.author_name || 'User'}</span>
                    {post.author_role === 'coach' && (
                      <span className="text-[10px] bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded-full font-bold">COACH</span>
                    )}
                    <span className="text-xs text-gray-400">•</span>
                    <span className="text-xs text-gray-400">{new Date(post.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                    {post.type !== 'general' && (
                      <span className="text-[10px] bg-primary-100 text-primary-700 px-2 py-0.5 rounded-full font-semibold capitalize">
                        {post.type?.replace(/_/g, ' ')}
                      </span>
                    )}
                    {post.sport && (
                      <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-semibold capitalize">
                        {post.sport}
                      </span>
                    )}
                  </div>
                  {post.title && <h4 className="font-semibold text-gray-800 mt-1.5">{post.title}</h4>}
                  <p className="text-gray-700 mt-1 text-sm whitespace-pre-wrap leading-relaxed">{post.content}</p>

                  {post.image && (
                    <img src={post.image} alt="" className="mt-3 rounded-xl max-h-64 w-full object-cover" />
                  )}

                  {(post.location || post.event_date) && (
                    <div className="mt-2 flex gap-3 text-xs text-gray-500">
                      {post.location && <span>📍 {post.location}</span>}
                      {post.event_date && <span>📅 {new Date(post.event_date).toLocaleDateString()}</span>}
                      {post.max_players && <span>👥 {post.max_players} players needed</span>}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-5 mt-3 pt-2 border-t border-gray-50">
                    <button onClick={() => handleLike(postId)}
                      className={`flex items-center gap-1.5 text-sm font-medium transition-all ${
                        post.user_liked ? 'text-red-500' : 'text-gray-400 hover:text-red-500'
                      }`}>
                      <Heart size={17} fill={post.user_liked ? 'currentColor' : 'none'} />
                      {post.likes || post.likes_count || 0}
                    </button>
                    <button onClick={() => toggleComments(postId)}
                      className="flex items-center gap-1.5 text-sm font-medium text-gray-400 hover:text-primary-500 transition-colors">
                      <MessageSquare size={17} /> {post.comment_count || post.comments_count || 0}
                    </button>
                  </div>

                  {/* Comments */}
                  <AnimatePresence>
                    {expandedComments === postId && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                        className="mt-3 space-y-3 border-t pt-3 overflow-hidden">
                        {(postComments[postId] || []).map(c => (
                          <div key={c.id || c._id} className="flex items-start gap-2">
                            <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600 flex-shrink-0">
                              {c.author_avatar ? <img src={c.author_avatar} alt="" className="w-full h-full rounded-full object-cover" /> : c.author_name?.[0] || '?'}
                            </div>
                            <div className="bg-gray-50 rounded-xl px-3 py-2 flex-1">
                              <span className="text-xs font-semibold text-gray-700">{c.author_name}</span>
                              <p className="text-sm text-gray-600 mt-0.5">{c.content}</p>
                            </div>
                          </div>
                        ))}
                        <div className="flex gap-2">
                          <input value={commentText[postId] || ''}
                            onChange={e => setCommentText(prev => ({ ...prev, [postId]: e.target.value }))}
                            placeholder="Write a comment..." className="flex-1 px-3 py-2 rounded-full bg-gray-50 border border-gray-200 text-sm focus:border-primary-400 outline-none"
                            onKeyDown={e => e.key === 'Enter' && handleComment(postId)} />
                          <button onClick={() => handleComment(postId)}
                            className="p-2 rounded-full bg-primary-500 text-white hover:bg-primary-600 transition-colors">
                            <Send size={14} />
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          )}) : (
            <div className="text-center py-16 card">
              <div className="w-16 h-16 mx-auto rounded-full bg-primary-50 flex items-center justify-center mb-4">
                <MessageSquare className="text-primary-300" size={32} />
              </div>
              <p className="text-gray-500 font-medium">No posts yet</p>
              <p className="text-gray-400 text-sm mt-1">Be the first to share something with the community!</p>
            </div>
          )}
        </div>
      )}

      {/* ============ GROUPS TAB ============ */}
      {tab === 'groups' && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search groups by name or sport..." className="input-field pl-10" />
            </div>
            <button onClick={() => setShowCreateGroup(true)}
              className="btn-primary text-sm flex items-center gap-1.5 whitespace-nowrap">
              <Plus size={16} /> New Group
            </button>
          </div>

          {/* Create Group Modal */}
          <AnimatePresence>
            {showCreateGroup && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                className="card p-5 border-2 border-primary-100">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-gray-900 text-lg">Create a Group</h3>
                  <button onClick={() => setShowCreateGroup(false)} className="p-1.5 hover:bg-gray-100 rounded-lg">
                    <X size={18} className="text-gray-400" />
                  </button>
                </div>
                <div className="space-y-3">
                  <input value={newGroup.name} onChange={e => setNewGroup({ ...newGroup, name: e.target.value })}
                    placeholder="Group name (e.g., Mumbai Cricket Club)" className="input-field" />
                  <textarea value={newGroup.description} onChange={e => setNewGroup({ ...newGroup, description: e.target.value })}
                    placeholder="What's this group about?" rows={2} className="input-field resize-none" />
                  <select value={newGroup.sport} onChange={e => setNewGroup({ ...newGroup, sport: e.target.value })} className="input-field">
                    {SPORTS.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                  </select>
                  <button onClick={handleCreateGroup} disabled={feedLoading || !newGroup.name.trim()}
                    className="btn-primary text-sm disabled:opacity-50 w-full">Create Group</button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Groups Grid */}
          {filteredGroups.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredGroups.map(g => {
                const member = isMember(g);
                const gId = g._id || g.id;
                return (
                  <motion.div key={gId} initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
                    className="card-hover p-5 group">
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-sport-green to-sport-blue flex items-center justify-center text-white text-xl font-bold shadow-sm flex-shrink-0">
                        {g.name?.[0]?.toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-gray-900 group-hover:text-primary-600 transition-colors">{g.name}</h3>
                        <p className="text-sm text-gray-500 mt-0.5 line-clamp-2">{g.description || 'No description'}</p>
                        <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                          {g.sport && <span className="flex items-center gap-1 bg-green-50 text-green-600 px-2 py-0.5 rounded-full font-medium"><Globe size={10} /> {g.sport}</span>}
                          <span className="flex items-center gap-1"><Users size={12} /> {g.member_count || g.members?.length || 0} members</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-4">
                      {member ? (
                        <>
                          <button onClick={() => openGroupChat(g)}
                            className="flex-1 btn-primary text-sm flex items-center justify-center gap-1.5">
                            <MessageCircle size={14} /> Open Chat
                          </button>
                          <button onClick={() => handleLeaveGroup(gId)}
                            className="text-sm text-red-500 hover:text-red-700 font-medium px-3 py-2 hover:bg-red-50 rounded-xl transition-colors">
                            Leave
                          </button>
                        </>
                      ) : (
                        <button onClick={() => handleJoinGroup(gId)}
                          className="flex-1 btn-sport text-sm flex items-center justify-center gap-1.5">
                          <UserPlus size={14} /> Join Group
                        </button>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16 card">
              <div className="w-16 h-16 mx-auto rounded-full bg-green-50 flex items-center justify-center mb-4">
                <Users className="text-green-300" size={32} />
              </div>
              <p className="text-gray-500 font-medium">No groups found</p>
              <p className="text-gray-400 text-sm mt-1">Create one and invite your teammates!</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
