// ==================================================
// SportVerse AI - Coach Portal Page
// Dashboard, tournaments, events, player management
// ==================================================

import { AnimatePresence, motion } from 'framer-motion';
import {
    Award,
    BarChart3,
    Calendar,
    CheckCircle,
    Clock,
    MapPin,
    Megaphone,
    Plus,
    Search,
    Shield,
    Star,
    Trash2,
    Trophy,
    UserCheck,
    Users,
    X
} from 'lucide-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const SPORTS = ['cricket', 'football', 'badminton', 'tennis', 'basketball', 'volleyball', 'hockey', 'table_tennis', 'swimming'];
const EVENT_TYPES = [
  { value: 'training', label: 'Training Camp', emoji: '🏋️' },
  { value: 'tournament', label: 'Tournament', emoji: '🏆' },
  { value: 'meetup', label: 'Meetup', emoji: '🤝' },
  { value: 'workshop', label: 'Workshop', emoji: '📚' },
];

export default function CoachPortal() {
  const { user, updateUser } = useAuth();
  const [tab, setTab] = useState('dashboard');
  const [stats, setStats] = useState({});
  const [tournaments, setTournaments] = useState([]);
  const [events, setEvents] = useState([]);
  const [players, setPlayers] = useState([]);
  const [showCreate, setShowCreate] = useState(null);
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [sportFilter, setSportFilter] = useState('');

  useEffect(() => {
    activateCoachRole();
    fetchDashboard();
    fetchTournaments();
    fetchEvents();
  }, []);

  // Auto-activate coach role when visiting portal
  const activateCoachRole = async () => {
    if (user?.role !== 'coach' && user?.role !== 'admin') {
      try {
        await api.post('/coach/self-verify');
        if (updateUser) {
          updateUser({ ...user, role: 'coach', coach_verified: true });
        }
      } catch (err) {
        console.error('Coach activation error:', err);
      }
    }
  };

  const fetchDashboard = async () => {
    try {
      const { data } = await api.get('/coach/dashboard');
      setStats(data);
    } catch (err) { console.error(err); }
  };

  const fetchTournaments = async () => {
    try {
      const { data } = await api.get('/coach/tournaments');
      setTournaments(data.tournaments || []);
    } catch (err) { console.error(err); }
  };

  const fetchEvents = async () => {
    try {
      const { data } = await api.get('/coach/events');
      setEvents(data.events || []);
    } catch (err) { console.error(err); }
  };

  const searchPlayers = async () => {
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (sportFilter) params.append('sport', sportFilter);
      const { data } = await api.get(`/coach/players?${params.toString()}`);
      setPlayers(data.players || []);
    } catch (err) { console.error(err); }
  };

  const handleCreate = async () => {
    setLoading(true);
    try {
      if (showCreate === 'tournament') {
        if (!form.name?.trim()) { toast.error('Tournament name is required'); setLoading(false); return; }
        if (!form.sport) { toast.error('Sport is required'); setLoading(false); return; }
        await api.post('/coach/tournaments', form);
        toast.success('🏆 Tournament created successfully!');
        fetchTournaments();
      } else if (showCreate === 'event') {
        if (!form.title?.trim()) { toast.error('Event title is required'); setLoading(false); return; }
        await api.post('/coach/events', form);
        toast.success('📅 Event created successfully!');
        fetchEvents();
      } else if (showCreate === 'announcement') {
        if (!form.title?.trim() || !form.content?.trim()) { toast.error('Title and content required'); setLoading(false); return; }
        await api.post('/coach/announcements', form);
        toast.success('📢 Announcement posted!');
      }
      setShowCreate(null);
      setForm({});
      fetchDashboard();
    } catch (err) {
      console.error('Create error:', err);
      toast.error(err.response?.data?.error || 'Action failed');
    }
    finally { setLoading(false); }
  };

  const handleDeleteTournament = async (id) => {
    toast.success('Tournament removed');
    setTournaments(prev => prev.filter(t => (t.id || t._id) !== id));
  };

  const handleDeleteEvent = async (id) => {
    toast.success('Event removed');
    setEvents(prev => prev.filter(e => (e.id || e._id) !== id));
  };

  const TABS = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3, emoji: '📊' },
    { id: 'tournaments', label: 'Tournaments', icon: Trophy, emoji: '🏆' },
    { id: 'events', label: 'Events', icon: Calendar, emoji: '📅' },
    { id: 'players', label: 'Players', icon: Users, emoji: '👥' },
    { id: 'announcements', label: 'Announce', icon: Megaphone, emoji: '📢' },
  ];

  const getSportEmoji = (sport) => {
    const map = { cricket: '🏏', football: '⚽', badminton: '🏸', tennis: '🎾', basketball: '🏀', volleyball: '🏐', hockey: '🏑', table_tennis: '🏓', swimming: '🏊' };
    return map[sport] || '🏅';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 p-6 text-white">
          <div className="absolute top-0 right-0 opacity-10 text-[120px] font-bold select-none -mt-4 mr-2">🏆</div>
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold font-display flex items-center gap-3">
                <Shield size={32} /> Coach Portal
              </h1>
              <p className="text-white/80 mt-1">Manage tournaments, events, and connect with players</p>
            </div>
            <div className="hidden md:flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2">
              <Award size={18} className="text-yellow-200" />
              <div>
                <p className="text-sm font-bold">Coach Account</p>
                <p className="text-[10px] text-white/70 flex items-center gap-1">
                  <CheckCircle size={10} /> Active
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {TABS.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`px-4 py-2.5 rounded-xl font-medium text-sm transition-all flex items-center gap-1.5 whitespace-nowrap ${
              tab === t.id ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
            <span>{t.emoji}</span> {t.label}
          </button>
        ))}
      </div>

      {/* ============ DASHBOARD TAB ============ */}
      {tab === 'dashboard' && (
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Tournaments', value: stats.tournaments_count || stats.stats?.tournamentsCreated || 0, icon: Trophy, color: 'from-amber-400 to-orange-500' },
              { label: 'Events', value: stats.events_count || stats.stats?.eventsHosted || 0, icon: Calendar, color: 'from-blue-400 to-indigo-500' },
              { label: 'Players Found', value: stats.total_players || 0, icon: Users, color: 'from-green-400 to-emerald-500' },
              { label: 'Posts', value: stats.stats?.postsCount || 0, icon: Megaphone, color: 'from-purple-400 to-pink-500' },
            ].map((s, i) => (
              <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                className="card p-5 hover:shadow-md transition-all">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center mb-3 shadow-lg`}>
                  <s.icon className="text-white" size={22} />
                </div>
                <p className="text-3xl font-bold text-gray-900">{s.value}</p>
                <p className="text-sm text-gray-500 mt-0.5">{s.label}</p>
              </motion.div>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="card p-6">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Star size={18} className="text-amber-500" /> Quick Actions
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button onClick={() => { setShowCreate('tournament'); setForm({ name: '', sport: 'cricket', location: '', start_date: '', end_date: '', max_teams: 8, description: '' }); }}
                className="flex items-center gap-3 p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-200 hover:shadow-md transition-all group">
                <div className="w-10 h-10 rounded-lg bg-amber-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Trophy size={18} className="text-white" />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-gray-900 text-sm">New Tournament</p>
                  <p className="text-xs text-gray-500">Create a competition</p>
                </div>
              </button>

              <button onClick={() => { setShowCreate('event'); setForm({ title: '', sport: 'cricket', event_date: '', event_type: 'training', location: '', max_participants: 30, description: '' }); }}
                className="flex items-center gap-3 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 hover:shadow-md transition-all group">
                <div className="w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Calendar size={18} className="text-white" />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-gray-900 text-sm">New Event</p>
                  <p className="text-xs text-gray-500">Host a training event</p>
                </div>
              </button>

              <button onClick={() => { setShowCreate('announcement'); setForm({ title: '', content: '', sport: '' }); }}
                className="flex items-center gap-3 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200 hover:shadow-md transition-all group">
                <div className="w-10 h-10 rounded-lg bg-purple-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Megaphone size={18} className="text-white" />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-gray-900 text-sm">Announce</p>
                  <p className="text-xs text-gray-500">Post an announcement</p>
                </div>
              </button>
            </div>
          </div>

          {/* Upcoming Events Preview */}
          {stats.upcomingEvents?.length > 0 && (
            <div className="card p-6">
              <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                <Clock size={18} className="text-blue-500" /> Upcoming Events
              </h3>
              <div className="space-y-2">
                {stats.upcomingEvents.map((e, i) => (
                  <div key={e.id || i} className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl">
                    <Calendar size={16} className="text-blue-500" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{e.title}</p>
                      <p className="text-xs text-gray-500">{new Date(e.event_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                    </div>
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium capitalize">{e.event_type || 'event'}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent Players Preview */}
          {stats.recentPlayers?.length > 0 && (
            <div className="card p-6">
              <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                <Users size={18} className="text-green-500" /> Recent Players
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {stats.recentPlayers.slice(0, 10).map((p) => (
                  <div key={p.id || p._id} className="flex items-center gap-2 p-2.5 bg-gray-50 rounded-xl">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                      {p.avatar ? <img src={p.avatar} alt="" className="w-full h-full rounded-full object-cover" /> : p.name?.[0]?.toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-gray-900 truncate">{p.name}</p>
                      <p className="text-[10px] text-gray-400 capitalize">{p.sport || 'Player'}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ============ TOURNAMENTS TAB ============ */}
      {tab === 'tournaments' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Trophy size={20} className="text-amber-500" /> Your Tournaments
            </h2>
            <button onClick={() => { setShowCreate('tournament'); setForm({ name: '', sport: 'cricket', location: '', start_date: '', end_date: '', max_teams: 8, description: '' }); }}
              className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:shadow-lg transition-all flex items-center gap-2">
              <Plus size={16} /> Create Tournament
            </button>
          </div>

          {tournaments.length > 0 ? tournaments.map((t) => (
            <motion.div key={t.id || t._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="card p-5 hover:shadow-md transition-all border-l-4 border-amber-400">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="text-xl">{getSportEmoji(t.sport)}</span>
                    <h3 className="font-bold text-gray-900 text-lg">{t.name}</h3>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold capitalize ${
                      t.status === 'upcoming' ? 'bg-green-100 text-green-700' : t.status === 'ongoing' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
                    }`}>{t.status}</span>
                  </div>
                  {t.description && <p className="text-sm text-gray-500 mt-1">{t.description}</p>}
                  <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-gray-400">
                    <span className="capitalize flex items-center gap-1">{getSportEmoji(t.sport)} {t.sport}</span>
                    {t.location && <span className="flex items-center gap-1"><MapPin size={12} className="text-red-400" /> {t.location}</span>}
                    {t.start_date && <span className="flex items-center gap-1"><Calendar size={12} className="text-blue-400" /> {new Date(t.start_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>}
                    {t.end_date && <span>to {new Date(t.end_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>}
                    <span className="flex items-center gap-1"><Users size={12} className="text-green-400" /> Max {t.max_teams} teams</span>
                  </div>
                </div>
                <button onClick={() => handleDeleteTournament(t.id || t._id)} className="p-2 text-gray-300 hover:text-red-500 transition-colors">
                  <Trash2 size={16} />
                </button>
              </div>
            </motion.div>
          )) : (
            <div className="text-center py-16 card">
              <div className="w-16 h-16 mx-auto rounded-full bg-amber-50 flex items-center justify-center mb-4">
                <Trophy className="text-amber-300" size={32} />
              </div>
              <p className="text-gray-500 font-medium">No tournaments yet</p>
              <p className="text-gray-400 text-sm mt-1">Create your first tournament to get started</p>
              <button onClick={() => { setShowCreate('tournament'); setForm({ name: '', sport: 'cricket', location: '', start_date: '', end_date: '', max_teams: 8, description: '' }); }}
                className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-2 rounded-xl text-sm font-semibold mt-4 inline-flex items-center gap-2">
                <Plus size={14} /> Create Tournament
              </button>
            </div>
          )}
        </div>
      )}

      {/* ============ EVENTS TAB ============ */}
      {tab === 'events' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Calendar size={20} className="text-blue-500" /> Your Events
            </h2>
            <button onClick={() => { setShowCreate('event'); setForm({ title: '', sport: 'cricket', event_date: '', event_type: 'training', location: '', max_participants: 30, description: '' }); }}
              className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:shadow-lg transition-all flex items-center gap-2">
              <Plus size={16} /> Create Event
            </button>
          </div>

          {events.length > 0 ? events.map((e) => {
            const participantCount = e.participants?.length || 0;
            const maxP = e.max_participants || 30;
            return (
              <motion.div key={e.id || e._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className="card p-5 hover:shadow-md transition-all border-l-4 border-blue-400">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="text-xl">{getSportEmoji(e.sport)}</span>
                      <h3 className="font-bold text-gray-900 text-lg">{e.title}</h3>
                      {e.event_type && (
                        <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-bold uppercase">{e.event_type}</span>
                      )}
                    </div>
                    {e.description && <p className="text-sm text-gray-500 mt-1">{e.description}</p>}
                    <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-gray-400">
                      {e.sport && <span className="capitalize flex items-center gap-1">{getSportEmoji(e.sport)} {e.sport}</span>}
                      {e.location && <span className="flex items-center gap-1"><MapPin size={12} className="text-red-400" /> {e.location}</span>}
                      {e.event_date && <span className="flex items-center gap-1"><Clock size={12} className="text-blue-400" /> {new Date(e.event_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} {new Date(e.event_date).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>}
                    </div>
                    {/* Participant progress bar */}
                    <div className="flex items-center gap-2 mt-2">
                      <Users size={14} className="text-gray-400" />
                      <div className="flex-1 max-w-[200px] h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full transition-all" style={{ width: `${Math.min(100, (participantCount / maxP) * 100)}%` }} />
                      </div>
                      <span className="text-xs text-gray-500 font-medium">{participantCount}/{maxP}</span>
                    </div>
                  </div>
                  <button onClick={() => handleDeleteEvent(e.id || e._id)} className="p-2 text-gray-300 hover:text-red-500 transition-colors">
                    <Trash2 size={16} />
                  </button>
                </div>
              </motion.div>
            );
          }) : (
            <div className="text-center py-16 card">
              <div className="w-16 h-16 mx-auto rounded-full bg-blue-50 flex items-center justify-center mb-4">
                <Calendar className="text-blue-300" size={32} />
              </div>
              <p className="text-gray-500 font-medium">No events yet</p>
              <p className="text-gray-400 text-sm mt-1">Host your first training event or workshop</p>
              <button onClick={() => { setShowCreate('event'); setForm({ title: '', sport: 'cricket', event_date: '', event_type: 'training', location: '', max_participants: 30, description: '' }); }}
                className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-4 py-2 rounded-xl text-sm font-semibold mt-4 inline-flex items-center gap-2">
                <Plus size={14} /> Create Event
              </button>
            </div>
          )}
        </div>
      )}

      {/* ============ PLAYERS TAB ============ */}
      {tab === 'players' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input value={search} onChange={(e) => setSearch(e.target.value)}
                placeholder="Search players by name..."
                className="input-field pl-9"
                onKeyDown={(e) => e.key === 'Enter' && searchPlayers()} />
            </div>
            <select value={sportFilter} onChange={(e) => setSportFilter(e.target.value)} className="input-field max-w-[180px]">
              <option value="">All Sports</option>
              {SPORTS.map(s => <option key={s} value={s}>{getSportEmoji(s)} {s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
            </select>
            <button onClick={searchPlayers} className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:shadow-lg transition-all flex items-center gap-2">
              <Search size={16} /> Search
            </button>
          </div>

          {players.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {players.map((p) => (
                <motion.div key={p.id || p._id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                  className="card p-5 hover:shadow-md transition-all flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center text-white font-bold text-lg flex-shrink-0 overflow-hidden">
                    {p.avatar ? <img src={p.avatar} alt="" className="w-full h-full object-cover" /> : p.name?.[0]?.toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900">{p.name}</p>
                    <p className="text-sm text-gray-500 capitalize">{p.sport || 'No sport'} • {p.skill_level || 'Beginner'}</p>
                    {p.location && <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5"><MapPin size={10} /> {p.location}</p>}
                    {p.bio && <p className="text-xs text-gray-400 mt-1 truncate">{p.bio}</p>}
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <UserCheck className="text-green-500" size={18} />
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold capitalize ${
                      p.skill_level === 'advanced' ? 'bg-orange-100 text-orange-700' :
                      p.skill_level === 'intermediate' ? 'bg-blue-100 text-blue-700' :
                      'bg-green-100 text-green-700'
                    }`}>{p.skill_level || 'beginner'}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 card">
              <div className="w-16 h-16 mx-auto rounded-full bg-green-50 flex items-center justify-center mb-4">
                <Users className="text-green-300" size={32} />
              </div>
              <p className="text-gray-500 font-medium">Search for players</p>
              <p className="text-gray-400 text-sm mt-1">Find players by name, sport, or skill level</p>
            </div>
          )}
        </div>
      )}

      {/* ============ ANNOUNCEMENTS TAB ============ */}
      {tab === 'announcements' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Megaphone size={20} className="text-purple-500" /> Announcements
            </h2>
            <button onClick={() => { setShowCreate('announcement'); setForm({ title: '', content: '', sport: '' }); }}
              className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:shadow-lg transition-all flex items-center gap-2">
              <Plus size={16} /> New Announcement
            </button>
          </div>

          <div className="card p-6">
            <p className="text-gray-500 text-center py-8">
              Announcements appear in the Community feed for all players to see.
              <br />
              <span className="text-sm text-gray-400">Click "New Announcement" to post one.</span>
            </p>
          </div>
        </div>
      )}

      {/* ============ CREATE MODAL ============ */}
      <AnimatePresence>
        {showCreate && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowCreate(null)}>
            <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
              className="bg-white rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                  {showCreate === 'tournament' && <><Trophy size={20} className="text-amber-500" /> Create Tournament</>}
                  {showCreate === 'event' && <><Calendar size={20} className="text-blue-500" /> Create Event</>}
                  {showCreate === 'announcement' && <><Megaphone size={20} className="text-purple-500" /> Post Announcement</>}
                </h3>
                <button onClick={() => setShowCreate(null)} className="p-1.5 hover:bg-gray-100 rounded-lg">
                  <X size={18} className="text-gray-400" />
                </button>
              </div>

              <div className="space-y-4">
                {/* TOURNAMENT FORM */}
                {showCreate === 'tournament' && (
                  <>
                    <div>
                      <label className="text-xs font-semibold text-gray-600 mb-1 block">Tournament Name *</label>
                      <input value={form.name || ''} onChange={(e) => setForm({ ...form, name: e.target.value })}
                        placeholder="e.g., Inter-City Cricket Championship" className="input-field" />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-600 mb-1 block">Sport *</label>
                      <select value={form.sport || 'cricket'} onChange={(e) => setForm({ ...form, sport: e.target.value })} className="input-field">
                        {SPORTS.map((s) => <option key={s} value={s}>{getSportEmoji(s)} {s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-600 mb-1 block">Location</label>
                      <input value={form.location || ''} onChange={(e) => setForm({ ...form, location: e.target.value })}
                        placeholder="e.g., Rajiv Gandhi Stadium, Hyderabad" className="input-field" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-semibold text-gray-600 mb-1 block">Start Date</label>
                        <input type="date" value={form.start_date || ''} onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                          min={new Date().toISOString().split('T')[0]} className="input-field" />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-gray-600 mb-1 block">End Date</label>
                        <input type="date" value={form.end_date || ''} onChange={(e) => setForm({ ...form, end_date: e.target.value })}
                          min={form.start_date || new Date().toISOString().split('T')[0]} className="input-field" />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-600 mb-1 block">Max Teams</label>
                      <input type="number" value={form.max_teams || 8} onChange={(e) => setForm({ ...form, max_teams: parseInt(e.target.value) || 8 })}
                        min={2} max={64} className="input-field" />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-600 mb-1 block">Description</label>
                      <textarea value={form.description || ''} onChange={(e) => setForm({ ...form, description: e.target.value })}
                        placeholder="Tournament rules, prizes, format..." rows={3} className="input-field resize-none" />
                    </div>
                  </>
                )}

                {/* EVENT FORM */}
                {showCreate === 'event' && (
                  <>
                    <div>
                      <label className="text-xs font-semibold text-gray-600 mb-1 block">Event Title *</label>
                      <input value={form.title || ''} onChange={(e) => setForm({ ...form, title: e.target.value })}
                        placeholder="e.g., Weekend Cricket Training Camp" className="input-field" />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-600 mb-1 block">Event Type</label>
                      <div className="grid grid-cols-2 gap-2">
                        {EVENT_TYPES.map(et => (
                          <button key={et.value} type="button" onClick={() => setForm({ ...form, event_type: et.value })}
                            className={`p-2.5 rounded-xl border-2 text-sm font-medium transition-all flex items-center gap-2 ${
                              form.event_type === et.value
                                ? 'border-blue-500 bg-blue-50 text-blue-700'
                                : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}>
                            <span>{et.emoji}</span> {et.label}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-600 mb-1 block">Sport</label>
                      <select value={form.sport || 'cricket'} onChange={(e) => setForm({ ...form, sport: e.target.value })} className="input-field">
                        {SPORTS.map((s) => <option key={s} value={s}>{getSportEmoji(s)} {s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-600 mb-1 block">Date & Time</label>
                      <input type="datetime-local" value={form.event_date || ''} onChange={(e) => setForm({ ...form, event_date: e.target.value })}
                        min={new Date().toISOString().slice(0, 16)} className="input-field" />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-600 mb-1 block">Location</label>
                      <input value={form.location || ''} onChange={(e) => setForm({ ...form, location: e.target.value })}
                        placeholder="e.g., KBR Park Ground, Hyderabad" className="input-field" />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-600 mb-1 block">Max Participants</label>
                      <input type="number" value={form.max_participants || 30} onChange={(e) => setForm({ ...form, max_participants: parseInt(e.target.value) || 30 })}
                        min={2} max={500} className="input-field" />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-600 mb-1 block">Description</label>
                      <textarea value={form.description || ''} onChange={(e) => setForm({ ...form, description: e.target.value })}
                        placeholder="What will be covered, what to bring, skill level required..." rows={3} className="input-field resize-none" />
                    </div>
                  </>
                )}

                {/* ANNOUNCEMENT FORM */}
                {showCreate === 'announcement' && (
                  <>
                    <div>
                      <label className="text-xs font-semibold text-gray-600 mb-1 block">Title *</label>
                      <input value={form.title || ''} onChange={(e) => setForm({ ...form, title: e.target.value })}
                        placeholder="e.g., New training sessions starting this week!" className="input-field" />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-600 mb-1 block">Sport (optional)</label>
                      <select value={form.sport || ''} onChange={(e) => setForm({ ...form, sport: e.target.value })} className="input-field">
                        <option value="">General (All Sports)</option>
                        {SPORTS.map((s) => <option key={s} value={s}>{getSportEmoji(s)} {s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-600 mb-1 block">Content *</label>
                      <textarea value={form.content || ''} onChange={(e) => setForm({ ...form, content: e.target.value })}
                        placeholder="Write your announcement here. This will be visible to all players in the community feed."
                        rows={5} className="input-field resize-none" />
                    </div>
                  </>
                )}
              </div>

              <button onClick={handleCreate} disabled={loading}
                className={`w-full mt-5 py-3 rounded-xl text-sm font-bold text-white transition-all disabled:opacity-50 flex items-center justify-center gap-2 ${
                  showCreate === 'tournament' ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:shadow-lg' :
                  showCreate === 'event' ? 'bg-gradient-to-r from-blue-500 to-indigo-500 hover:shadow-lg' :
                  'bg-gradient-to-r from-purple-500 to-pink-500 hover:shadow-lg'
                }`}>
                {loading ? (
                  <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Creating...</span>
                ) : (
                  <>
                    {showCreate === 'tournament' && <><Trophy size={16} /> Create Tournament</>}
                    {showCreate === 'event' && <><Calendar size={16} /> Create Event</>}
                    {showCreate === 'announcement' && <><Megaphone size={16} /> Post Announcement</>}
                  </>
                )}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
