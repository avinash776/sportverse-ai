// ==================================================
// SportVerse AI - Dashboard Page
// Main hub with stats, recent activity, quick actions
// ==================================================

import { motion } from 'framer-motion';
import {
    ArrowRight,
    Brain,
    Clock,
    Play,
    Star,
    Target,
    TrendingUp,
    Trophy,
    Users,
    Video
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const StatCard = ({ icon: Icon, label, value, color, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className="card p-6"
  >
    <div className="flex items-center justify-between mb-3">
      <div className={`w-12 h-12 rounded-xl bg-${color}/10 flex items-center justify-center`}>
        <Icon className={`text-${color}`} size={24} />
      </div>
      <TrendingUp className="text-green-500" size={16} />
    </div>
    <p className="text-2xl font-bold text-gray-900">{value}</p>
    <p className="text-sm text-gray-500">{label}</p>
  </motion.div>
);

const QuickAction = ({ icon: Icon, title, desc, to, color }) => (
  <Link to={to}>
    <motion.div whileHover={{ scale: 1.02 }} className="card-hover p-5 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center flex-shrink-0`}>
        <Icon className="text-white" size={22} />
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-gray-900">{title}</h3>
        <p className="text-sm text-gray-500 truncate">{desc}</p>
      </div>
      <ArrowRight className="text-gray-400" size={18} />
    </motion.div>
  </Link>
);

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ videos: 0, plans: 0, posts: 0, groups: 0 });
  const [recentVideos, setRecentVideos] = useState([]);
  const [recentPlans, setRecentPlans] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [videosRes, plansRes] = await Promise.allSettled([
          api.get('/video/my-videos'),
          api.get('/trainer/my-plans'),
        ]);
        const videos = videosRes.status === 'fulfilled' ? videosRes.value.data.videos || [] : [];
        const plans = plansRes.status === 'fulfilled' ? plansRes.value.data.plans || [] : [];

        setRecentVideos(videos.slice(0, 3));
        setRecentPlans(plans.slice(0, 3));
        setStats({
          videos: videos.length,
          plans: plans.length,
          posts: 0,
          groups: 0,
        });
      } catch (err) {
        console.error('Dashboard fetch error', err);
      }
    };
    fetchData();
  }, []);

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good Morning';
    if (h < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold font-display text-gray-900">
          {getGreeting()}, {user?.name?.split(' ')[0] || 'Athlete'}! 👋
        </h1>
        <p className="text-gray-500 mt-1">Here's your training overview for today</p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Video} label="Videos Analyzed" value={stats.videos} color="sport-blue" delay={0.1} />
        <StatCard icon={Brain} label="Training Plans" value={stats.plans} color="sport-purple" delay={0.15} />
        <StatCard icon={Users} label="Community Posts" value={stats.posts} color="sport-green" delay={0.2} />
        <StatCard icon={Trophy} label="Groups Joined" value={stats.groups} color="sport-orange" delay={0.25} />
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <QuickAction icon={Video} title="Analyze Video" desc="Upload & get AI feedback" to="/personalized-trainer" color="from-sport-blue to-blue-600" />
          <QuickAction icon={Brain} title="AI Training Plan" desc="Generate personalized plan" to="/ai-trainer" color="from-sport-purple to-purple-600" />
          <QuickAction icon={Users} title="Community" desc="Connect with athletes" to="/community" color="from-sport-green to-green-600" />
          {user?.role === 'coach' && (
            <QuickAction icon={Trophy} title="Coach Portal" desc="Manage tournaments & events" to="/coach-portal" color="from-sport-orange to-orange-600" />
          )}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Videos */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-900 flex items-center gap-2"><Play size={18} /> Recent Videos</h3>
            <Link to="/personalized-trainer" className="text-sm text-primary-600 hover:underline">View all</Link>
          </div>
          {recentVideos.length > 0 ? (
            <div className="space-y-3">
              {recentVideos.map((v) => (
                <div key={v.id} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                  <div className="w-10 h-10 rounded-lg bg-sport-blue/10 flex items-center justify-center">
                    <Video className="text-sport-blue" size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-gray-900 truncate">{v.original_name || 'Video'}</p>
                    <p className="text-xs text-gray-500">{v.sport} • {v.status}</p>
                  </div>
                  {v.analysis_result && (
                    <span className="text-sm font-bold text-sport-green">
                      {(() => { try { const r = typeof v.analysis_result === 'string' ? JSON.parse(v.analysis_result) : v.analysis_result; return (r?.performance_analysis?.overall_score || '—') + '%'; } catch { return '—'; } })()}
                    </span>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Video className="mx-auto text-gray-300 mb-2" size={32} />
              <p className="text-sm text-gray-400">No videos yet. Upload one to get started!</p>
            </div>
          )}
        </motion.div>

        {/* Recent Plans */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-900 flex items-center gap-2"><Target size={18} /> Training Plans</h3>
            <Link to="/ai-trainer" className="text-sm text-primary-600 hover:underline">View all</Link>
          </div>
          {recentPlans.length > 0 ? (
            <div className="space-y-3">
              {recentPlans.map((p) => (
                <div key={p.id} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                  <div className="w-10 h-10 rounded-lg bg-sport-purple/10 flex items-center justify-center">
                    <Brain className="text-sport-purple" size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-gray-900 truncate">{p.sport} Training</p>
                    <p className="text-xs text-gray-500">Level: {p.skill_level} • Goal: {p.goal}</p>
                  </div>
                  <Clock className="text-gray-400" size={14} />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Brain className="mx-auto text-gray-300 mb-2" size={32} />
              <p className="text-sm text-gray-400">No plans yet. Generate your first AI plan!</p>
            </div>
          )}
        </motion.div>
      </div>

      {/* Motivation / Tip */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="bg-gradient-to-r from-primary-500 via-sport-blue to-sport-green rounded-2xl p-6 text-white relative overflow-hidden"
      >
        {/* Sport background decoration */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <img src="https://images.unsplash.com/photo-1461896836934-bbe8e2b3d6c0?w=800&h=300&fit=crop" alt="" className="w-full h-full object-cover" />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <Star className="text-yellow-300" size={22} />
            <h3 className="font-bold text-lg">Daily Motivation</h3>
          </div>
          <p className="opacity-90">
            "Champions aren't made in gyms. Champions are made from something deep inside them — a desire, a dream, a vision."
            <span className="block mt-1 text-sm opacity-70">— Muhammad Ali</span>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
