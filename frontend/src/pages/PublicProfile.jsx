// ==================================================
// SportVerse AI - Public Profile Page (Read-only)
// View another user's profile
// ==================================================

import { motion } from 'framer-motion';
import {
    Activity,
    ArrowLeft,
    Award,
    MapPin,
    Shield,
    Star,
    User
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../services/api';

export default function PublicProfile() {
  const { userId } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await api.get(`/users/${userId}`);
        setProfile(data.user);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [userId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-16">
        <User className="mx-auto text-gray-300 mb-4" size={48} />
        <h2 className="text-xl font-bold text-gray-900">User Not Found</h2>
        <p className="text-gray-500 mt-1">This profile doesn't exist or has been removed.</p>
        <Link to="/community" className="btn-primary mt-4 inline-flex items-center gap-2">
          <ArrowLeft size={16} /> Back to Community
        </Link>
      </div>
    );
  }

  let skills = [];
  try { skills = profile.skills ? JSON.parse(profile.skills) : []; } catch { skills = []; }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Link to="/community" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700">
        <ArrowLeft size={16} /> Back to Community
      </Link>

      {/* Profile Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-sport-green via-sport-blue to-primary-600" />
        <div className="px-6 pb-6">
          <div className="flex flex-col sm:flex-row items-start gap-4 -mt-12">
            <div className="w-24 h-24 rounded-2xl border-4 border-white shadow-lg bg-gradient-to-br from-primary-400 to-sport-blue flex items-center justify-center text-white text-3xl font-bold overflow-hidden">
              {profile.avatar_url ? (
                <img src={profile.avatar_url} alt="avatar" className="w-full h-full object-cover" />
              ) : (
                profile.name?.[0] || '?'
              )}
            </div>
            <div className="flex-1 mt-2 sm:mt-6">
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-bold text-gray-900">{profile.name}</h2>
                {profile.role === 'coach' && (
                  <span className="flex items-center gap-1 text-xs bg-sport-orange/10 text-sport-orange px-2 py-1 rounded-full font-semibold">
                    <Shield size={12} /> Coach
                  </span>
                )}
              </div>
              {profile.bio && <p className="text-gray-600 mt-2">{profile.bio}</p>}
              <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                {profile.sport && <span className="flex items-center gap-1 capitalize"><Activity size={14} /> {profile.sport}</span>}
                {profile.location && <span className="flex items-center gap-1"><MapPin size={14} /> {profile.location}</span>}
                {profile.skill_level && <span className="flex items-center gap-1 capitalize"><Star size={14} /> {profile.skill_level}</span>}
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card p-5">
          <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2"><Activity size={18} /> Sport Info</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-gray-500">Sport</span><span className="font-medium capitalize">{profile.sport || '—'}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Skill Level</span><span className="font-medium capitalize">{profile.skill_level || '—'}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Role</span><span className="font-medium capitalize">{profile.role}</span></div>
          </div>
        </div>
        <div className="card p-5">
          <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2"><Award size={18} /> Skills</h3>
          {skills.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {skills.map((s) => (
                <span key={s} className="bg-primary-50 text-primary-700 px-3 py-1 rounded-full text-sm">{s}</span>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400">No skills listed.</p>
          )}
        </div>
      </div>
    </div>
  );
}
