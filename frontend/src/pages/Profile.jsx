// ==================================================
// SportVerse AI - Profile Page (Editable)
// User profile with stats, skills, training history
// ==================================================

import { motion } from 'framer-motion';
import {
    Activity,
    Award,
    Brain,
    Camera,
    Edit3,
    Save,
    Shield,
    Star,
    Trophy,
    Video,
    X
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function Profile() {
  const { user, updateUser } = useAuth();
  const fileRef = useRef(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    name: '', bio: '', sport: '', skill_level: '', location: '',
  });
  const [skills, setSkills] = useState([]);
  const [newSkill, setNewSkill] = useState('');
  const [stats, setStats] = useState({ videos: 0, plans: 0 });
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || '',
        bio: user.bio || '',
        sport: user.sport || '',
        skill_level: user.skill_level || 'beginner',
        location: user.location || '',
      });
      try {
        try { setSkills(user.skills ? (typeof user.skills === 'string' ? JSON.parse(user.skills) : user.skills) : []); } catch { setSkills([]); }
      } catch { setSkills([]); }
    }
    fetchStats();
  }, [user]);

  const fetchStats = async () => {
    try {
      const [v, p] = await Promise.allSettled([
        api.get('/video/my-videos'),
        api.get('/trainer/my-plans'),
      ]);
      setStats({
        videos: v.status === 'fulfilled' ? (v.value.data.videos?.length || 0) : 0,
        plans: p.status === 'fulfilled' ? (p.value.data.plans?.length || 0) : 0,
      });
    } catch (err) { console.error(err); }
  };

  const handleSave = async () => {
    try {
      const { data } = await api.put('/users/profile', {
        ...form,
        skills: JSON.stringify(skills),
      });
      updateUser(data.user);
      toast.success('Profile updated!');
      setEditing(false);
    } catch (err) { toast.error('Failed to update profile'); }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('avatar', file);
      const { data } = await api.post('/users/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      updateUser(data.user);
      toast.success('Avatar updated!');
    } catch (err) { toast.error('Upload failed'); }
    finally { setUploading(false); }
  };

  const addSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill('');
    }
  };

  const removeSkill = (s) => setSkills(skills.filter((x) => x !== s));

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold font-display text-gray-900">👤 My Profile</h1>
      </motion.div>

      {/* Profile Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-primary-500 via-sport-blue to-sport-green" />
        <div className="px-6 pb-6">
          <div className="flex flex-col sm:flex-row items-start gap-4 -mt-12">
            <div className="relative">
              <div className="w-24 h-24 rounded-2xl border-4 border-white shadow-lg bg-gradient-to-br from-primary-400 to-sport-blue flex items-center justify-center text-white text-3xl font-bold overflow-hidden">
                {user?.avatar_url ? (
                  <img src={user.avatar_url} alt="avatar" className="w-full h-full object-cover" />
                ) : (
                  user?.name?.[0] || '?'
                )}
              </div>
              <button onClick={() => fileRef.current?.click()}
                className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-white shadow-md flex items-center justify-center hover:bg-gray-50">
                <Camera size={14} className="text-gray-600" />
              </button>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
            </div>
            <div className="flex-1 mt-2 sm:mt-6">
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-bold text-gray-900">{user?.name}</h2>
                {user?.role === 'coach' && (
                  <span className="flex items-center gap-1 text-xs bg-sport-orange/10 text-sport-orange px-2 py-1 rounded-full font-semibold">
                    <Shield size={12} /> Coach
                  </span>
                )}
              </div>
              <p className="text-gray-500">{user?.email}</p>
              {form.bio && !editing && <p className="text-sm text-gray-600 mt-2">{form.bio}</p>}
            </div>
            <button onClick={() => setEditing(!editing)}
              className={`mt-2 sm:mt-6 flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium ${
                editing ? 'bg-red-50 text-red-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
              {editing ? <><X size={14} /> Cancel</> : <><Edit3 size={14} /> Edit Profile</>}
            </button>
          </div>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { icon: Video, label: 'Videos', value: stats.videos, color: 'sport-blue' },
          { icon: Brain, label: 'Plans', value: stats.plans, color: 'sport-purple' },
          { icon: Trophy, label: 'Achievements', value: 0, color: 'sport-orange' },
          { icon: Star, label: 'Rating', value: '—', color: 'sport-yellow' },
        ].map((s) => (
          <div key={s.label} className="card p-4 text-center">
            <s.icon className={`mx-auto text-${s.color} mb-2`} size={22} />
            <p className="text-xl font-bold text-gray-900">{s.value}</p>
            <p className="text-xs text-gray-500">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Edit Form */}
      {editing && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card p-6 space-y-4">
          <h3 className="font-bold text-gray-900">Edit Profile</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })}
                placeholder="City, Country" className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Primary Sport</label>
              <select value={form.sport} onChange={(e) => setForm({ ...form, sport: e.target.value })} className="input-field">
                <option value="">Select Sport</option>
                {['cricket', 'football', 'badminton', 'tennis', 'basketball'].map((s) => (
                  <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Skill Level</label>
              <select value={form.skill_level} onChange={(e) => setForm({ ...form, skill_level: e.target.value })} className="input-field">
                {['beginner', 'intermediate', 'advanced', 'professional'].map((l) => (
                  <option key={l} value={l}>{l.charAt(0).toUpperCase() + l.slice(1)}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
            <textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })}
              placeholder="Tell us about yourself..." rows={3} className="input-field resize-none" />
          </div>

          {/* Skills */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Skills</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {skills.map((s) => (
                <span key={s} className="bg-primary-100 text-primary-700 px-3 py-1 rounded-full text-sm flex items-center gap-1">
                  {s}
                  <button onClick={() => removeSkill(s)}><X size={12} /></button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input value={newSkill} onChange={(e) => setNewSkill(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                placeholder="Add a skill" className="input-field flex-1" />
              <button onClick={addSkill} className="btn-primary text-sm">Add</button>
            </div>
          </div>

          <button onClick={handleSave} className="btn-primary flex items-center gap-2">
            <Save size={18} /> Save Changes
          </button>
        </motion.div>
      )}

      {/* Profile Info Cards */}
      {!editing && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="card p-5">
            <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2"><Activity size={18} /> Sport Info</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-gray-500">Sport</span><span className="font-medium capitalize">{form.sport || 'Not set'}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Skill Level</span><span className="font-medium capitalize">{form.skill_level || 'Not set'}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Location</span><span className="font-medium">{form.location || 'Not set'}</span></div>
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
              <p className="text-sm text-gray-400">No skills added yet. Edit profile to add skills.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
