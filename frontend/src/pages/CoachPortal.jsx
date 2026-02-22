// ==================================================
// SportVerse AI - Coach Portal Page
// Dashboard, tournaments, events, player management
// ==================================================

import { AnimatePresence, motion } from 'framer-motion';
import {
    BarChart3,
    Calendar,
    Clock,
    MapPin,
    Megaphone,
    Plus,
    Search,
    Shield,
    Trophy,
    UserCheck,
    Users,
    X
} from 'lucide-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function CoachPortal() {
  const { user } = useAuth();
  const [tab, setTab] = useState('dashboard');
  const [stats, setStats] = useState({});
  const [tournaments, setTournaments] = useState([]);
  const [events, setEvents] = useState([]);
  const [players, setPlayers] = useState([]);
  const [showCreate, setShowCreate] = useState(null); // 'tournament' | 'event' | 'announcement' | null
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [isVerified, setIsVerified] = useState(user?.is_verified_coach);

  useEffect(() => {
    fetchDashboard();
    fetchTournaments();
    fetchEvents();
  }, []);

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
      const { data } = await api.get(`/coach/players?search=${search}`);
      setPlayers(data.players || []);
    } catch (err) { console.error(err); }
  };

  const handleSelfVerify = async () => {
    try {
      await api.post('/coach/self-verify');
      toast.success('Coach verification activated!');
      setIsVerified(true);
    } catch (err) { toast.error('Verification failed'); }
  };

  const handleCreate = async () => {
    setLoading(true);
    try {
      if (showCreate === 'tournament') {
        await api.post('/coach/tournaments', form);
        toast.success('Tournament created!');
        fetchTournaments();
      } else if (showCreate === 'event') {
        await api.post('/coach/events', form);
        toast.success('Event created!');
        fetchEvents();
      } else if (showCreate === 'announcement') {
        await api.post('/coach/announcements', form);
        toast.success('Announcement posted!');
      }
      setShowCreate(null);
      setForm({});
      fetchDashboard();
    } catch (err) { toast.error(err.response?.data?.error || 'Action failed'); }
    finally { setLoading(false); }
  };

  const handleJoinEvent = async (eventId) => {
    try {
      await api.post(`/coach/events/${eventId}/join`);
      toast.success('Joined event!');
      fetchEvents();
    } catch (err) { toast.error(err.response?.data?.error || 'Failed'); }
  };

  const TABS = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'tournaments', label: 'Tournaments', icon: Trophy },
    { id: 'events', label: 'Events', icon: Calendar },
    { id: 'players', label: 'Players', icon: Users },
  ];

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold font-display text-gray-900">🏆 Coach Portal</h1>
        <p className="text-gray-500 mt-1">Manage tournaments, events, and connect with players</p>
      </motion.div>

      {/* Verification Banner */}
      {!isVerified && (
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="text-orange-500" size={20} />
            <div>
              <p className="font-medium text-orange-800">Coach Verification Required</p>
              <p className="text-sm text-orange-600">Verify your coaching credentials to unlock all features</p>
            </div>
          </div>
          <button onClick={handleSelfVerify} className="bg-orange-500 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-orange-600">
            Verify Now
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto">
        {TABS.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`px-4 py-2.5 rounded-xl font-medium text-sm transition-all flex items-center gap-1.5 whitespace-nowrap ${
              tab === t.id ? 'bg-sport-orange text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
            <t.icon size={16} /> {t.label}
          </button>
        ))}
      </div>

      {/* DASHBOARD TAB */}
      {tab === 'dashboard' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Tournaments', value: stats.tournaments_count || 0, icon: Trophy, color: 'sport-orange' },
              { label: 'Events', value: stats.events_count || 0, icon: Calendar, color: 'sport-blue' },
              { label: 'Players', value: stats.total_players || 0, icon: Users, color: 'sport-green' },
              { label: 'Status', value: isVerified ? 'Verified' : 'Pending', icon: Shield, color: isVerified ? 'sport-green' : 'sport-orange' },
            ].map((s, i) => (
              <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="card p-5">
                <div className={`w-10 h-10 rounded-xl bg-${s.color}/10 flex items-center justify-center mb-3`}>
                  <s.icon className={`text-${s.color}`} size={20} />
                </div>
                <p className="text-2xl font-bold text-gray-900">{s.value}</p>
                <p className="text-sm text-gray-500">{s.label}</p>
              </motion.div>
            ))}
          </div>

          <div className="flex gap-3">
            <button onClick={() => { setShowCreate('tournament'); setForm({ name: '', sport: 'cricket', location: '', start_date: '', end_date: '', max_teams: 8, description: '' }); }}
              className="btn-primary flex items-center gap-2"><Plus size={16} /> New Tournament</button>
            <button onClick={() => { setShowCreate('event'); setForm({ title: '', sport: 'cricket', event_date: '', location: '', description: '' }); }}
              className="bg-sport-blue text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-blue-600 flex items-center gap-2">
              <Plus size={16} /> New Event
            </button>
            <button onClick={() => { setShowCreate('announcement'); setForm({ title: '', content: '' }); }}
              className="bg-sport-purple text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-purple-600 flex items-center gap-2">
              <Megaphone size={16} /> Announce
            </button>
          </div>
        </div>
      )}

      {/* TOURNAMENTS TAB */}
      {tab === 'tournaments' && (
        <div className="space-y-4">
          <button onClick={() => { setShowCreate('tournament'); setForm({ name: '', sport: 'cricket', location: '', start_date: '', end_date: '', max_teams: 8, description: '' }); }}
            className="btn-primary flex items-center gap-2"><Plus size={16} /> Create Tournament</button>
          {tournaments.length > 0 ? tournaments.map((t) => (
            <div key={t.id} className="card-hover p-5">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-gray-900 flex items-center gap-2">
                    <Trophy className="text-sport-orange" size={18} /> {t.name}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">{t.description}</p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                    <span className="capitalize">{t.sport}</span>
                    <span className="flex items-center gap-1"><MapPin size={12} /> {t.location}</span>
                    <span className="flex items-center gap-1"><Calendar size={12} /> {new Date(t.start_date).toLocaleDateString()}</span>
                    <span className="flex items-center gap-1"><Users size={12} /> Max {t.max_teams} teams</span>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  t.status === 'upcoming' ? 'bg-blue-100 text-blue-700' : t.status === 'ongoing' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                  {t.status}
                </span>
              </div>
            </div>
          )) : (
            <div className="text-center py-12 card">
              <Trophy className="mx-auto text-gray-300 mb-3" size={48} />
              <p className="text-gray-400">No tournaments yet</p>
            </div>
          )}
        </div>
      )}

      {/* EVENTS TAB */}
      {tab === 'events' && (
        <div className="space-y-4">
          <button onClick={() => { setShowCreate('event'); setForm({ title: '', sport: 'cricket', event_date: '', location: '', description: '' }); }}
            className="btn-primary flex items-center gap-2"><Plus size={16} /> Create Event</button>
          {events.length > 0 ? events.map((e) => (
            <div key={e.id} className="card-hover p-5">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-gray-900 flex items-center gap-2">
                    <Calendar className="text-sport-blue" size={18} /> {e.title}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">{e.description}</p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                    <span className="capitalize">{e.sport}</span>
                    <span className="flex items-center gap-1"><MapPin size={12} /> {e.location}</span>
                    <span className="flex items-center gap-1"><Clock size={12} /> {new Date(e.event_date).toLocaleDateString()}</span>
                  </div>
                </div>
                <button onClick={() => handleJoinEvent(e.id)} className="btn-primary text-sm">Join</button>
              </div>
            </div>
          )) : (
            <div className="text-center py-12 card">
              <Calendar className="mx-auto text-gray-300 mb-3" size={48} />
              <p className="text-gray-400">No events yet</p>
            </div>
          )}
        </div>
      )}

      {/* PLAYERS TAB */}
      {tab === 'players' && (
        <div className="space-y-4">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input value={search} onChange={(e) => setSearch(e.target.value)}
                placeholder="Search players by name or sport..." className="input-field pl-9"
                onKeyDown={(e) => e.key === 'Enter' && searchPlayers()} />
            </div>
            <button onClick={searchPlayers} className="btn-primary text-sm">Search</button>
          </div>
          {players.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {players.map((p) => (
                <div key={p.id} className="card-hover p-5 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-sport-green to-sport-blue flex items-center justify-center text-white font-bold">
                    {p.name?.[0]}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{p.name}</p>
                    <p className="text-sm text-gray-500 capitalize">{p.sport} • {p.skill_level}</p>
                  </div>
                  <UserCheck className="text-sport-green" size={18} />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 card">
              <Users className="mx-auto text-gray-300 mb-3" size={48} />
              <p className="text-gray-400">Search for players by name or sport</p>
            </div>
          )}
        </div>
      )}

      {/* Create Modal */}
      <AnimatePresence>
        {showCreate && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowCreate(null)}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              className="bg-white rounded-2xl p-6 w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-900 capitalize">Create {showCreate}</h3>
                <button onClick={() => setShowCreate(null)}><X size={18} className="text-gray-400" /></button>
              </div>
              <div className="space-y-3">
                {showCreate === 'tournament' && (
                  <>
                    <input value={form.name || ''} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Tournament name" className="input-field" />
                    <select value={form.sport || 'cricket'} onChange={(e) => setForm({ ...form, sport: e.target.value })} className="input-field">
                      {['cricket', 'football', 'badminton', 'tennis', 'basketball'].map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <input value={form.location || ''} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="Location" className="input-field" />
                    <div className="grid grid-cols-2 gap-3">
                      <input type="date" value={form.start_date || ''} onChange={(e) => setForm({ ...form, start_date: e.target.value })} className="input-field" />
                      <input type="date" value={form.end_date || ''} onChange={(e) => setForm({ ...form, end_date: e.target.value })} className="input-field" />
                    </div>
                    <input type="number" value={form.max_teams || 8} onChange={(e) => setForm({ ...form, max_teams: parseInt(e.target.value) })} placeholder="Max teams" className="input-field" />
                    <textarea value={form.description || ''} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Description" rows={2} className="input-field resize-none" />
                  </>
                )}
                {showCreate === 'event' && (
                  <>
                    <input value={form.title || ''} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Event title" className="input-field" />
                    <select value={form.sport || 'cricket'} onChange={(e) => setForm({ ...form, sport: e.target.value })} className="input-field">
                      {['cricket', 'football', 'badminton', 'tennis', 'basketball'].map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <input type="datetime-local" value={form.event_date || ''} onChange={(e) => setForm({ ...form, event_date: e.target.value })} className="input-field" />
                    <input value={form.location || ''} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="Location" className="input-field" />
                    <textarea value={form.description || ''} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Description" rows={2} className="input-field resize-none" />
                  </>
                )}
                {showCreate === 'announcement' && (
                  <>
                    <input value={form.title || ''} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Announcement title" className="input-field" />
                    <textarea value={form.content || ''} onChange={(e) => setForm({ ...form, content: e.target.value })} placeholder="Announcement content" rows={4} className="input-field resize-none" />
                  </>
                )}
              </div>
              <button onClick={handleCreate} disabled={loading}
                className="btn-primary w-full mt-4 disabled:opacity-50">
                {loading ? 'Creating...' : `Create ${showCreate}`}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
