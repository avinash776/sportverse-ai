// ==================================================
// SportVerse AI - Find Players Page
// Post game requests, join others, find teammates
// ==================================================

import { AnimatePresence, motion } from 'framer-motion';
import {
    Award,
    BadgeCheck,
    Calendar,
    Clock,
    Filter,
    Gamepad2,
    MapPin,
    Plus,
    Search,
    Shield,
    Star,
    Trophy,
    UserMinus,
    UserPlus,
    Users,
    X
} from 'lucide-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const SPORTS = [
  { value: '', label: 'All Sports', emoji: '🏅' },
  { value: 'cricket', label: 'Cricket', emoji: '🏏' },
  { value: 'football', label: 'Football', emoji: '⚽' },
  { value: 'badminton', label: 'Badminton', emoji: '🏸' },
  { value: 'tennis', label: 'Tennis', emoji: '🎾' },
  { value: 'basketball', label: 'Basketball', emoji: '🏀' },
  { value: 'volleyball', label: 'Volleyball', emoji: '🏐' },
  { value: 'hockey', label: 'Hockey', emoji: '🏑' },
  { value: 'table_tennis', label: 'Table Tennis', emoji: '🏓' },
  { value: 'swimming', label: 'Swimming', emoji: '🏊' },
];

const SKILL_LEVELS = [
  { value: 'any', label: 'Any Level', color: 'gray' },
  { value: 'beginner', label: 'Beginner', color: 'green' },
  { value: 'intermediate', label: 'Intermediate', color: 'blue' },
  { value: 'advanced', label: 'Advanced', color: 'orange' },
];

export default function FindPlayers() {
  const { user } = useAuth();
  const myId = user?.id || user?._id;

  const [requests, setRequests] = useState([]);
  const [myRequests, setMyRequests] = useState([]);
  const [tournaments, setTournaments] = useState([]);
  const [events, setEvents] = useState([]);
  const [tab, setTab] = useState('browse'); // browse | my | pro
  const [showCreate, setShowCreate] = useState(false);
  const [loading, setLoading] = useState(false);

  // Filters
  const [filterSport, setFilterSport] = useState('');
  const [filterLocation, setFilterLocation] = useState('');

  // New Request form
  const [form, setForm] = useState({
    game_name: '',
    sport: 'cricket',
    location: '',
    date: '',
    time: '',
    players_required: 2,
    skill_level: 'any',
    description: '',
    contact_info: '',
  });

  useEffect(() => { fetchRequests(); fetchMyRequests(); fetchProEvents(); }, [filterSport, filterLocation]);

  const fetchRequests = async () => {
    try {
      const params = new URLSearchParams();
      if (filterSport) params.append('sport', filterSport);
      if (filterLocation) params.append('location', filterLocation);
      const q = params.toString() ? `?${params.toString()}` : '';
      const { data } = await api.get(`/game-requests${q}`);
      setRequests(data.requests || []);
    } catch (err) { console.error(err); }
  };

  const fetchMyRequests = async () => {
    try {
      const { data } = await api.get('/game-requests/my');
      setMyRequests(data.requests || []);
    } catch (err) { console.error(err); }
  };

  const fetchProEvents = async () => {
    try {
      const sportParam = filterSport ? `?sport=${filterSport}` : '';
      const [tourRes, eventRes] = await Promise.all([
        api.get(`/game-requests/tournaments${sportParam}`),
        api.get(`/game-requests/events${sportParam}`),
      ]);
      setTournaments(tourRes.data.tournaments || []);
      setEvents(eventRes.data.events || []);
    } catch (err) { console.error(err); }
  };

  const handleJoinEvent = async (eventId) => {
    try {
      await api.post(`/game-requests/events/${eventId}/join`);
      toast.success('Registered for event! 🎉');
      fetchProEvents();
    } catch (err) { toast.error(err.response?.data?.error || 'Failed to join event'); }
  };

  const handleCreate = async () => {
    if (!form.game_name.trim() || !form.location.trim() || !form.date || !form.time) {
      toast.error('Please fill in all required fields');
      return;
    }
    setLoading(true);
    try {
      await api.post('/game-requests', form);
      toast.success('Game request posted! 🎮');
      setForm({ game_name: '', sport: 'cricket', location: '', date: '', time: '', players_required: 2, skill_level: 'any', description: '', contact_info: '' });
      setShowCreate(false);
      fetchRequests();
      fetchMyRequests();
    } catch (err) { toast.error(err.response?.data?.error || 'Failed to create request'); }
    finally { setLoading(false); }
  };

  const handleJoin = async (id) => {
    try {
      await api.post(`/game-requests/${id}/join`);
      toast.success('Joined the game! 🤝');
      fetchRequests();
      fetchMyRequests();
    } catch (err) { toast.error(err.response?.data?.error || 'Failed to join'); }
  };

  const handleLeave = async (id) => {
    try {
      await api.post(`/game-requests/${id}/leave`);
      toast.success('Left the game');
      fetchRequests();
      fetchMyRequests();
    } catch (err) { toast.error(err.response?.data?.error || 'Failed to leave'); }
  };

  const handleCancel = async (id) => {
    try {
      await api.delete(`/game-requests/${id}`);
      toast.success('Request cancelled');
      fetchRequests();
      fetchMyRequests();
    } catch (err) { toast.error('Failed to cancel'); }
  };

  const hasJoined = (req) => {
    return req.players_joined?.some(p => {
      const pId = p._id || p.id || p;
      return pId?.toString() === myId?.toString();
    });
  };

  const isCreator = (req) => {
    const cId = req.creator_id?._id || req.creator_id;
    return cId?.toString() === myId?.toString();
  };

  const getSportEmoji = (sport) => SPORTS.find(s => s.value === sport)?.emoji || '🏅';

  const getSkillColor = (level) => {
    const colors = { any: 'bg-gray-100 text-gray-600', beginner: 'bg-green-100 text-green-700', intermediate: 'bg-blue-100 text-blue-700', advanced: 'bg-orange-100 text-orange-700' };
    return colors[level] || colors.any;
  };

  const renderRequestCard = (req, showActions = true) => {
    const totalJoined = req.players_joined?.length || 0;
    const needed = req.players_required || 0;
    const spotsLeft = Math.max(0, needed - totalJoined);
    const progressPercent = needed > 0 ? Math.min(100, (totalJoined / needed) * 100) : 0;
    const isFull = spotsLeft === 0;
    const joined = hasJoined(req);
    const creator = isCreator(req);
    const creatorName = req.creator_id?.name || req.creator_name || 'Unknown';

    return (
      <motion.div key={req._id || req.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
        className="card p-5 hover:shadow-md transition-all group">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            {/* Sport badge + title */}
            <div className="flex items-center gap-2 flex-wrap mb-2">
              <span className="text-2xl">{getSportEmoji(req.sport)}</span>
              <h3 className="font-bold text-gray-900 text-lg">{req.game_name}</h3>
              {req.status === 'full' && <span className="text-[10px] bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-bold">FULL</span>}
              {joined && !creator && <span className="text-[10px] bg-primary-100 text-primary-600 px-2 py-0.5 rounded-full font-bold">JOINED</span>}
              {creator && <span className="text-[10px] bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full font-bold">YOUR POST</span>}
            </div>

            {/* Info row */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500">
              <span className="flex items-center gap-1"><MapPin size={14} className="text-red-400" /> {req.location}</span>
              <span className="flex items-center gap-1"><Calendar size={14} className="text-blue-400" /> {new Date(req.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
              <span className="flex items-center gap-1"><Clock size={14} className="text-green-400" /> {req.time}</span>
            </div>

            {/* Skill level */}
            <div className="flex items-center gap-2 mt-2">
              <span className={`text-[11px] px-2 py-0.5 rounded-full font-semibold capitalize ${getSkillColor(req.skill_level)}`}>
                {req.skill_level || 'Any'} level
              </span>
              <span className="text-xs text-gray-400 capitalize flex items-center gap-1"><Gamepad2 size={12} /> {req.sport}</span>
            </div>

            {/* Description */}
            {req.description && <p className="text-sm text-gray-600 mt-2 leading-relaxed">{req.description}</p>}

            {/* Contact */}
            {req.contact_info && joined && (
              <p className="text-xs text-primary-600 mt-1">📞 {req.contact_info}</p>
            )}

            {/* Posted by */}
            <p className="text-xs text-gray-400 mt-2">
              Posted by <span className="font-medium text-gray-600">{creatorName}</span>
            </p>
          </div>

          {/* Players Progress */}
          <div className="flex-shrink-0 w-24 text-center">
            <div className="relative w-16 h-16 mx-auto">
              <svg className="w-16 h-16 -rotate-90">
                <circle cx="32" cy="32" r="28" fill="none" stroke="#e5e7eb" strokeWidth="4" />
                <circle cx="32" cy="32" r="28" fill="none" stroke={isFull ? '#ef4444' : '#6366f1'} strokeWidth="4"
                  strokeDasharray={`${2 * Math.PI * 28}`} strokeDashoffset={`${2 * Math.PI * 28 * (1 - progressPercent / 100)}`}
                  strokeLinecap="round" className="transition-all duration-500" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-lg font-bold text-gray-900">{totalJoined}</span>
                <span className="text-[9px] text-gray-400">/ {needed}</span>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-1 font-medium">
              {isFull ? <span className="text-red-500">Full</span> : `${spotsLeft} spot${spotsLeft !== 1 ? 's' : ''} left`}
            </p>
          </div>
        </div>

        {/* Players joined avatars */}
        {totalJoined > 0 && (
          <div className="flex items-center gap-1 mt-3 pt-3 border-t border-gray-100">
            <Users size={14} className="text-gray-400 mr-1" />
            {req.players_joined?.slice(0, 6).map((p, i) => {
              const pName = p.name || 'User';
              return (
                <div key={p._id || i} className="w-7 h-7 -ml-1.5 first:ml-0 rounded-full bg-gradient-to-br from-primary-300 to-sport-blue flex items-center justify-center text-white text-[10px] font-bold border-2 border-white" title={pName}>
                  {p.avatar ? <img src={p.avatar} alt="" className="w-full h-full rounded-full object-cover" /> : pName[0]?.toUpperCase()}
                </div>
              );
            })}
            {totalJoined > 6 && <span className="text-xs text-gray-400 ml-1">+{totalJoined - 6} more</span>}
          </div>
        )}

        {/* Actions */}
        {showActions && (
          <div className="flex gap-2 mt-3">
            {creator ? (
              <button onClick={() => handleCancel(req._id || req.id)}
                className="text-sm text-red-500 hover:text-red-700 font-medium px-3 py-2 hover:bg-red-50 rounded-xl transition-colors">
                Cancel Request
              </button>
            ) : joined ? (
              <button onClick={() => handleLeave(req._id || req.id)}
                className="flex items-center gap-1.5 text-sm text-red-500 hover:text-red-700 font-medium px-3 py-2 hover:bg-red-50 rounded-xl transition-colors">
                <UserMinus size={14} /> Leave Game
              </button>
            ) : !isFull ? (
              <button onClick={() => handleJoin(req._id || req.id)}
                className="flex items-center gap-1.5 btn-primary text-sm">
                <UserPlus size={14} /> Join Game
              </button>
            ) : (
              <span className="text-sm text-gray-400 font-medium px-3 py-2">Game is full</span>
            )}
          </div>
        )}
      </motion.div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-sport-green via-sport-blue to-primary-600 p-6 text-white">
          <div className="absolute top-0 right-0 opacity-10 text-[120px] font-bold select-none -mt-4 mr-2">🎮</div>
          <div className="relative z-10">
            <h1 className="text-3xl font-bold font-display flex items-center gap-3">
              <Gamepad2 size={32} /> Find Players
            </h1>
            <p className="text-white/80 mt-1">Looking for teammates? Post a game or join others!</p>
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="flex items-center gap-3">
        <div className="flex gap-2 bg-gray-100/80 p-1.5 rounded-2xl flex-1">
          {[
            { id: 'browse', label: 'Browse Games', emoji: '🔍' },
            { id: 'pro', label: 'Pro Events', emoji: '🏆' },
            { id: 'my', label: 'My Games', emoji: '🎯' },
          ].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                tab === t.id ? 'bg-white text-primary-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}>
              <span>{t.emoji}</span> {t.label}
            </button>
          ))}
        </div>
        <button onClick={() => setShowCreate(true)}
          className="btn-primary text-sm flex items-center gap-1.5 whitespace-nowrap">
          <Plus size={16} /> Post Game
        </button>
      </div>

      {/* Create Game Request Modal */}
      <AnimatePresence>
        {showCreate && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className="card p-6 border-2 border-primary-100">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                <Trophy size={20} className="text-primary-500" /> Post a Game Request
              </h3>
              <button onClick={() => setShowCreate(false)} className="p-1.5 hover:bg-gray-100 rounded-lg">
                <X size={18} className="text-gray-400" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1 block">Game Name *</label>
                <input value={form.game_name} onChange={e => setForm({ ...form, game_name: e.target.value })}
                  placeholder="e.g., Morning Cricket Match" className="input-field" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1 block">Sport *</label>
                <select value={form.sport} onChange={e => setForm({ ...form, sport: e.target.value })} className="input-field">
                  {SPORTS.filter(s => s.value).map(s => <option key={s.value} value={s.value}>{s.emoji} {s.label}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1 block">Location *</label>
                <input value={form.location} onChange={e => setForm({ ...form, location: e.target.value })}
                  placeholder="e.g., Hitech City Ground" className="input-field" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1 block">Date *</label>
                  <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })}
                    min={new Date().toISOString().split('T')[0]} className="input-field" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1 block">Time *</label>
                  <input type="time" value={form.time} onChange={e => setForm({ ...form, time: e.target.value })} className="input-field" />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1 block">Players Required</label>
                <input type="number" value={form.players_required} onChange={e => setForm({ ...form, players_required: parseInt(e.target.value) || 2 })}
                  min={1} max={50} className="input-field" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1 block">Skill Level</label>
                <select value={form.skill_level} onChange={e => setForm({ ...form, skill_level: e.target.value })} className="input-field">
                  {SKILL_LEVELS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="text-xs font-semibold text-gray-600 mb-1 block">Description</label>
                <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                  placeholder="Any details about the game, rules, equipment needed..." rows={2} className="input-field resize-none" />
              </div>
              <div className="md:col-span-2">
                <label className="text-xs font-semibold text-gray-600 mb-1 block">Contact Info (shown to joined players)</label>
                <input value={form.contact_info} onChange={e => setForm({ ...form, contact_info: e.target.value })}
                  placeholder="Phone number or WhatsApp" className="input-field" />
              </div>
            </div>

            <button onClick={handleCreate} disabled={loading}
              className="btn-primary w-full mt-5 flex items-center justify-center gap-2 disabled:opacity-50">
              {loading ? 'Posting...' : <><Gamepad2 size={16} /> Post Game Request</>}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ============ BROWSE TAB ============ */}
      {tab === 'browse' && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <Filter size={16} className="text-gray-400" />
            <div className="flex gap-2 overflow-x-auto pb-1">
              {SPORTS.map(s => (
                <button key={s.value} onClick={() => setFilterSport(s.value)}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                    filterSport === s.value
                      ? 'bg-primary-500 text-white shadow-md'
                      : 'bg-white text-gray-500 border border-gray-200 hover:border-primary-300'
                  }`}>
                  <span>{s.emoji}</span> {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Location filter */}
          <div className="relative max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
            <input value={filterLocation} onChange={e => setFilterLocation(e.target.value)}
              placeholder="Filter by location..." className="input-field pl-9 text-sm" />
          </div>

          {/* Request Cards */}
          {requests.length > 0 ? (
            <div className="space-y-4">
              {requests.map(req => renderRequestCard(req))}
            </div>
          ) : (
            <div className="text-center py-16 card">
              <div className="w-16 h-16 mx-auto rounded-full bg-green-50 flex items-center justify-center mb-4">
                <Gamepad2 className="text-green-300" size={32} />
              </div>
              <p className="text-gray-500 font-medium">No game requests found</p>
              <p className="text-gray-400 text-sm mt-1">Be the first to post a game!</p>
              <button onClick={() => setShowCreate(true)} className="btn-primary text-sm mt-4 inline-flex items-center gap-1.5">
                <Plus size={14} /> Post Game Request
              </button>
            </div>
          )}
        </div>
      )}

      {/* ============ PRO EVENTS TAB ============ */}
      {tab === 'pro' && (
        <div className="space-y-6">
          {/* Info Banner */}
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
            <Shield size={20} className="text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-amber-800">Professional Coach Events</p>
              <p className="text-xs text-amber-600 mt-0.5">Tournaments & events created by verified coaches. Join to train with professionals!</p>
            </div>
          </div>

          {/* Sport Filter */}
          <div className="flex flex-wrap items-center gap-2">
            <Filter size={16} className="text-gray-400" />
            <div className="flex gap-2 overflow-x-auto pb-1">
              {SPORTS.map(s => (
                <button key={s.value} onClick={() => setFilterSport(s.value)}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                    filterSport === s.value
                      ? 'bg-amber-500 text-white shadow-md'
                      : 'bg-white text-gray-500 border border-gray-200 hover:border-amber-300'
                  }`}>
                  <span>{s.emoji}</span> {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tournaments Section */}
          {tournaments.length > 0 && (
            <div>
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-3">
                <Trophy size={20} className="text-amber-500" /> Tournaments
              </h3>
              <div className="space-y-4">
                {tournaments.map(t => (
                  <motion.div key={t.id || t._id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
                    className="card p-5 hover:shadow-md transition-all border-l-4 border-amber-400">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        {/* Title + Badges */}
                        <div className="flex items-center gap-2 flex-wrap mb-2">
                          <span className="text-2xl">{getSportEmoji(t.sport)}</span>
                          <h3 className="font-bold text-gray-900 text-lg">{t.name}</h3>
                          <span className="inline-flex items-center gap-1 text-[10px] bg-gradient-to-r from-amber-100 to-orange-100 text-amber-700 px-2.5 py-0.5 rounded-full font-bold border border-amber-200">
                            <Award size={10} /> TOURNAMENT
                          </span>
                          <span className="inline-flex items-center gap-1 text-[10px] bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 px-2.5 py-0.5 rounded-full font-bold border border-blue-200">
                            <BadgeCheck size={10} /> Professional Coach
                          </span>
                        </div>

                        {/* Info row */}
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500">
                          <span className="flex items-center gap-1"><MapPin size={14} className="text-red-400" /> {t.location || 'TBA'}</span>
                          <span className="flex items-center gap-1"><Calendar size={14} className="text-blue-400" /> {new Date(t.start_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                          {t.end_date && (
                            <span className="flex items-center gap-1"><Calendar size={14} className="text-green-400" /> to {new Date(t.end_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                          )}
                        </div>

                        {/* Description */}
                        {t.description && <p className="text-sm text-gray-600 mt-2 leading-relaxed">{t.description}</p>}

                        {/* Coach info */}
                        <div className="flex items-center gap-2 mt-3 pt-2 border-t border-gray-100">
                          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white text-[10px] font-bold border-2 border-white">
                            {t.coach_avatar ? <img src={t.coach_avatar} alt="" className="w-full h-full rounded-full object-cover" /> : (t.coach_name?.[0]?.toUpperCase() || 'C')}
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-medium text-gray-700">{t.coach_name || 'Coach'}</span>
                            {t.coach_verified && <BadgeCheck size={14} className="text-blue-500" />}
                            <span className="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded font-medium">Coach</span>
                          </div>
                        </div>
                      </div>

                      {/* Teams Info */}
                      <div className="flex-shrink-0 w-24 text-center">
                        <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center">
                          <Trophy size={24} className="text-amber-600" />
                        </div>
                        {t.max_teams && (
                          <p className="text-xs text-gray-500 mt-1 font-medium">
                            {t.teams?.length || 0} / {t.max_teams} teams
                          </p>
                        )}
                        <span className={`inline-block mt-1 text-[10px] px-2 py-0.5 rounded-full font-bold capitalize ${
                          t.status === 'upcoming' ? 'bg-green-100 text-green-700' : t.status === 'ongoing' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
                        }`}>{t.status}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Events Section */}
          {events.length > 0 && (
            <div>
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-3">
                <Star size={20} className="text-purple-500" /> Coach Events
              </h3>
              <div className="space-y-4">
                {events.map(ev => {
                  const spotsLeft = ev.spots_left ?? Math.max(0, (ev.max_participants || 30) - (ev.participants?.length || 0));
                  const isFull = spotsLeft <= 0;
                  const alreadyJoined = ev.participants?.some(p => {
                    const pId = p._id || p.id || p;
                    return pId?.toString() === myId?.toString();
                  });

                  return (
                    <motion.div key={ev.id || ev._id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
                      className="card p-5 hover:shadow-md transition-all border-l-4 border-purple-400">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          {/* Title + Badges */}
                          <div className="flex items-center gap-2 flex-wrap mb-2">
                            <span className="text-2xl">{getSportEmoji(ev.sport)}</span>
                            <h3 className="font-bold text-gray-900 text-lg">{ev.title}</h3>
                            {ev.event_type && (
                              <span className="text-[10px] bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-bold uppercase">{ev.event_type}</span>
                            )}
                            <span className="inline-flex items-center gap-1 text-[10px] bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 px-2.5 py-0.5 rounded-full font-bold border border-blue-200">
                              <BadgeCheck size={10} /> Professional Coach
                            </span>
                            {alreadyJoined && <span className="text-[10px] bg-green-100 text-green-600 px-2 py-0.5 rounded-full font-bold">REGISTERED</span>}
                          </div>

                          {/* Info row */}
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500">
                            <span className="flex items-center gap-1"><MapPin size={14} className="text-red-400" /> {ev.location || 'TBA'}</span>
                            <span className="flex items-center gap-1"><Calendar size={14} className="text-blue-400" /> {new Date(ev.event_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                            <span className="flex items-center gap-1"><Clock size={14} className="text-green-400" /> {new Date(ev.event_date).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>

                          {/* Description */}
                          {ev.description && <p className="text-sm text-gray-600 mt-2 leading-relaxed">{ev.description}</p>}

                          {/* Coach info */}
                          <div className="flex items-center gap-2 mt-3 pt-2 border-t border-gray-100">
                            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-400 to-indigo-500 flex items-center justify-center text-white text-[10px] font-bold border-2 border-white">
                              {ev.coach_avatar ? <img src={ev.coach_avatar} alt="" className="w-full h-full rounded-full object-cover" /> : (ev.coach_name?.[0]?.toUpperCase() || 'C')}
                            </div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-medium text-gray-700">{ev.coach_name || 'Coach'}</span>
                              {ev.coach_verified && <BadgeCheck size={14} className="text-blue-500" />}
                              <span className="text-[10px] bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded font-medium">Coach</span>
                            </div>
                          </div>
                        </div>

                        {/* Spots + Join */}
                        <div className="flex-shrink-0 w-28 text-center">
                          <div className="relative w-16 h-16 mx-auto">
                            <svg className="w-16 h-16 -rotate-90">
                              <circle cx="32" cy="32" r="28" fill="none" stroke="#e5e7eb" strokeWidth="4" />
                              <circle cx="32" cy="32" r="28" fill="none" stroke={isFull ? '#ef4444' : '#8b5cf6'} strokeWidth="4"
                                strokeDasharray={`${2 * Math.PI * 28}`} strokeDashoffset={`${2 * Math.PI * 28 * (1 - ((ev.participants?.length || 0) / (ev.max_participants || 30)))}`}
                                strokeLinecap="round" className="transition-all duration-500" />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                              <span className="text-lg font-bold text-gray-900">{ev.participants?.length || 0}</span>
                              <span className="text-[9px] text-gray-400">/ {ev.max_participants || 30}</span>
                            </div>
                          </div>
                          <p className="text-xs text-gray-500 mt-1 font-medium">
                            {isFull ? <span className="text-red-500">Full</span> : `${spotsLeft} spot${spotsLeft !== 1 ? 's' : ''}`}
                          </p>
                          {!alreadyJoined && !isFull ? (
                            <button onClick={() => handleJoinEvent(ev.id || ev._id)}
                              className="mt-2 flex items-center justify-center gap-1 w-full text-xs font-semibold bg-purple-600 text-white py-1.5 px-3 rounded-xl hover:bg-purple-700 transition-colors">
                              <UserPlus size={12} /> Join
                            </button>
                          ) : alreadyJoined ? (
                            <span className="mt-2 inline-block text-[10px] text-green-600 font-bold">✅ Joined</span>
                          ) : null}
                        </div>
                      </div>

                      {/* Participants avatars */}
                      {ev.participants?.length > 0 && (
                        <div className="flex items-center gap-1 mt-3 pt-3 border-t border-gray-100">
                          <Users size={14} className="text-gray-400 mr-1" />
                          {ev.participants?.slice(0, 6).map((p, i) => {
                            const pName = p.name || 'User';
                            return (
                              <div key={p._id || i} className="w-7 h-7 -ml-1.5 first:ml-0 rounded-full bg-gradient-to-br from-purple-300 to-indigo-400 flex items-center justify-center text-white text-[10px] font-bold border-2 border-white" title={pName}>
                                {p.avatar ? <img src={p.avatar} alt="" className="w-full h-full rounded-full object-cover" /> : pName[0]?.toUpperCase()}
                              </div>
                            );
                          })}
                          {(ev.participants?.length || 0) > 6 && <span className="text-xs text-gray-400 ml-1">+{ev.participants.length - 6} more</span>}
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Empty state */}
          {tournaments.length === 0 && events.length === 0 && (
            <div className="text-center py-16 card">
              <div className="w-16 h-16 mx-auto rounded-full bg-amber-50 flex items-center justify-center mb-4">
                <Trophy className="text-amber-300" size={32} />
              </div>
              <p className="text-gray-500 font-medium">No professional events yet</p>
              <p className="text-gray-400 text-sm mt-1">Check back later for coach-hosted tournaments & events</p>
            </div>
          )}
        </div>
      )}

      {/* ============ MY GAMES TAB ============ */}
      {tab === 'my' && (
        <div className="space-y-4">
          {myRequests.length > 0 ? myRequests.map(req => renderRequestCard(req)) : (
            <div className="text-center py-16 card">
              <div className="w-16 h-16 mx-auto rounded-full bg-primary-50 flex items-center justify-center mb-4">
                <Trophy className="text-primary-300" size={32} />
              </div>
              <p className="text-gray-500 font-medium">No games yet</p>
              <p className="text-gray-400 text-sm mt-1">Post a game request or join one from the Browse tab</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
