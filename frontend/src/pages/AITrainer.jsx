// ==================================================
// SportVerse AI - AI Trainer Page
// Generate personalised training plans using AI Agent
// ==================================================

import { AnimatePresence, motion } from 'framer-motion';
import {
    Award, BookOpen, Brain, Calendar,
    ChevronDown, ChevronUp,
    Dumbbell, ExternalLink, Flame,
    Heart,
    Loader2,
    Play,
    Target, Trash2, TrendingUp, Trophy,
    Youtube, Zap
} from 'lucide-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../services/api';
import { getActivityImage, getSportImages } from '../utils/sportImages';

/* ── Intensity badge ── */
const IntensityBadge = ({ level }) => {
  const l = (level || '').toLowerCase();
  const cfg = l.includes('high') || l.includes('intense')
    ? { emoji: '🔴', bg: 'bg-red-100', text: 'text-red-700' }
    : l.includes('medium') || l.includes('moderate')
    ? { emoji: '🟡', bg: 'bg-yellow-100', text: 'text-yellow-700' }
    : { emoji: '🟢', bg: 'bg-green-100', text: 'text-green-700' };
  return <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${cfg.bg} ${cfg.text}`}>{cfg.emoji} {level}</span>;
};

/* ── Expandable Day Card ── */
const DayCard = ({ day, data }) => {
  const [open, setOpen] = useState(false);
  const dayData = typeof data === 'string' ? { activities: [data] } : (Array.isArray(data) ? { activities: data } : data);
  const activities = dayData.activities || dayData.exercises || [];
  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
            <Calendar size={16} className="text-white" />
          </div>
          <div className="text-left">
            <p className="font-semibold text-gray-900 capitalize text-sm">{day}</p>
            {dayData.theme && <p className="text-[10px] text-indigo-600 font-medium">{dayData.theme}</p>}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {dayData.total_duration && <span className="text-[10px] bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full font-medium">⏱️ {dayData.total_duration}</span>}
          <span className="text-xs text-gray-400">{activities.length} activities</span>
          {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
      </button>
      {open && (
        <div className="border-t p-4 bg-gray-50 space-y-2">
          {activities.map((a, i) => {
            const act = typeof a === 'string' ? { name: a } : a;
            const actImg = getActivityImage(act.name || act.activity || '');
            return (
              <div key={i} className="flex items-start gap-3 p-3 bg-white rounded-lg border border-gray-100">
                {actImg ? (
                  <img src={actImg.url} alt="" className="w-10 h-10 rounded-lg object-cover flex-shrink-0" onError={(e) => { e.target.style.display = 'none'; }} />
                ) : (
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center flex-shrink-0">
                    <Flame size={14} className="text-white" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{act.name || act.activity || a}</p>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {act.duration && <span className="text-[10px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded font-medium">⏱️ {act.duration}</span>}
                    {act.sets_reps && <span className="text-[10px] bg-purple-50 text-purple-600 px-1.5 py-0.5 rounded font-medium">🔄 {act.sets_reps}</span>}
                    {act.rest_between && <span className="text-[10px] bg-cyan-50 text-cyan-600 px-1.5 py-0.5 rounded font-medium">⏸️ Rest: {act.rest_between}</span>}
                    {act.intensity && <IntensityBadge level={act.intensity} />}
                    {act.category && <span className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded font-medium">{act.category}</span>}
                  </div>
                  {act.description && <p className="text-xs text-gray-500 mt-1">{act.description}</p>}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

const SPORTS = ['cricket', 'football', 'badminton', 'tennis', 'basketball'];
const LEVELS = ['beginner', 'intermediate', 'advanced'];
const GOALS = [
  'Improve overall fitness',
  'Improve technique',
  'Build stamina',
  'Speed & agility',
  'Match preparation',
  'Injury recovery',
];

export default function AITrainer() {
  const [form, setForm] = useState({ sport: 'cricket', skill_level: 'intermediate', goal: GOALS[0], duration_weeks: 4 });
  const [generating, setGenerating] = useState(false);
  const [plans, setPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [expandedDay, setExpandedDay] = useState(null);

  useEffect(() => { fetchPlans(); }, []);

  const fetchPlans = async () => {
    try {
      const { data } = await api.get('/trainer/my-plans');
      setPlans(data.plans || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const { data } = await api.post('/trainer/generate-plan', form);
      toast.success('Training plan generated!');
      setSelectedPlan(data.plan_data || data.plan);
      fetchPlans();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to generate plan');
    } finally {
      setGenerating(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this plan?')) return;
    try {
      await api.delete(`/trainer/plan/${id}`);
      toast.success('Plan deleted');
      fetchPlans();
    } catch (err) {
      toast.error('Delete failed');
    }
  };

  const viewPlan = (plan) => {
    try {
      const data = typeof plan.plan_data === 'string' ? JSON.parse(plan.plan_data) : plan.plan_data;
      setSelectedPlan(data);
    } catch {
      setSelectedPlan(plan.plan_data);
    }
  };

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold font-display text-gray-900">🧠 AI Trainer</h1>
        <p className="text-gray-500 mt-1">Generate personalised training plans powered by our AI coaching agent</p>
      </motion.div>

      {/* Form */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Brain size={20} /> Create Training Plan
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sport</label>
            <select value={form.sport} onChange={(e) => setForm({ ...form, sport: e.target.value })} className="input-field">
              {SPORTS.map((s) => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Skill Level</label>
            <div className="flex gap-2">
              {LEVELS.map((l) => (
                <button key={l} type="button" onClick={() => setForm({ ...form, skill_level: l })}
                  className={`flex-1 py-2 rounded-xl border-2 text-sm font-medium transition-all capitalize ${
                    form.skill_level === l ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}>
                  {l}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Goal</label>
            <select value={form.goal} onChange={(e) => setForm({ ...form, goal: e.target.value })} className="input-field">
              {GOALS.map((g) => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Duration (weeks)</label>
            <input type="number" min="1" max="12" value={form.duration_weeks}
              onChange={(e) => setForm({ ...form, duration_weeks: parseInt(e.target.value) || 4 })}
              className="input-field" />
          </div>
        </div>

        <button onClick={handleGenerate} disabled={generating}
          className="btn-primary mt-6 flex items-center gap-2 disabled:opacity-50">
          {generating ? <Loader2 className="animate-spin" size={18} /> : <Dumbbell size={18} />}
          {generating ? 'Generating Plan...' : 'Generate Training Plan'}
        </button>
      </motion.div>

      {/* Selected Plan View */}
      <AnimatePresence>
        {selectedPlan && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">

            {/* Header Card */}
            <div className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Award size={24} className="text-yellow-500" /> Your Training Plan
                </h2>
                <button onClick={() => setSelectedPlan(null)} className="text-sm text-gray-500 hover:text-gray-700">✕ Close</button>
              </div>

              {selectedPlan.overview && (
                <div className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl mb-4">
                  <p className="text-sm text-gray-800 leading-relaxed">{selectedPlan.overview}</p>
                  {selectedPlan.plan_difficulty && (
                    <span className="inline-block mt-2 px-3 py-1 bg-white rounded-full text-xs font-bold text-indigo-600 shadow-sm">
                      {selectedPlan.plan_difficulty}
                    </span>
                  )}
                </div>
              )}

              {/* Sport Reference Images */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">📸 Training Reference</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {getSportImages(form.sport, 4).map((img, i) => (
                    <div key={i} className="sport-image-card">
                      <img src={img.url} alt={img.caption} loading="lazy" onError={(e) => { e.target.style.display = 'none'; }} />
                      <div className="sport-image-overlay">
                        <p className="text-white text-xs font-medium">{img.caption}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Weekly Schedule */}
            {selectedPlan.weekly_schedule && (
              <div className="card p-6">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Calendar size={18} className="text-indigo-500" /> Weekly Training Schedule
                </h3>
                <div className="space-y-2">
                  {Object.entries(selectedPlan.weekly_schedule).map(([day, data]) => (
                    <DayCard key={day} day={day} data={data} />
                  ))}
                </div>
              </div>
            )}

            {/* Drills */}
            {selectedPlan.drills?.length > 0 && (
              <div className="card p-6">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Dumbbell size={18} className="text-purple-500" /> Recommended Drills
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {selectedPlan.drills.map((drill, i) => {
                    const d = typeof drill === 'string' ? { name: drill } : drill;
                    const actImg = getActivityImage(d.name || '');
                    return (
                      <div key={i} className="p-4 bg-purple-50 rounded-xl border border-purple-100">
                        <div className="flex items-start gap-3">
                          {actImg ? (
                            <img src={actImg.url} alt="" className="w-12 h-12 rounded-lg object-cover flex-shrink-0" onError={(e) => { e.target.style.display = 'none'; }} />
                          ) : (
                            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-400 to-indigo-500 flex items-center justify-center flex-shrink-0">
                              <Dumbbell size={18} className="text-white" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-purple-900 text-sm flex items-center gap-1">
                              <span>{d.icon || '🏋️'}</span> {d.name || d.drill}
                            </p>
                            {d.description && <p className="text-xs text-purple-700 mt-1">{d.description}</p>}
                            {d.benefit && <p className="text-xs text-green-600 mt-1">✅ {d.benefit}</p>}
                            <div className="flex flex-wrap gap-1.5 mt-2">
                              {d.duration && <span className="text-[10px] bg-purple-100 text-purple-600 px-1.5 py-0.5 rounded font-medium">⏱️ {d.duration}</span>}
                              {d.difficulty && <span className="text-[10px] bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded font-medium">{d.difficulty}</span>}
                              {d.category && <span className="text-[10px] bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded font-medium">{d.category}</span>}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Key Focus Areas */}
            {selectedPlan.key_focus_areas?.length > 0 && (
              <div className="card p-6">
                <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2"><Target size={18} className="text-red-500" /> Key Focus Areas</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {selectedPlan.key_focus_areas.map((area, i) => {
                    const a = typeof area === 'string' ? { area } : area;
                    return (
                      <div key={i} className="p-3 bg-red-50 rounded-xl border border-red-100">
                        <p className="font-semibold text-red-800 text-sm">{a.area || area}</p>
                        {a.why && <p className="text-xs text-red-600 mt-1">{a.why}</p>}
                        {a.target_improvement && <p className="text-xs font-medium text-red-700 mt-1">📈 {a.target_improvement}</p>}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Warmup & Cooldown */}
            {selectedPlan.warmup_cooldown && (
              <div className="card p-6">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Zap size={18} className="text-orange-500" /> Warmup & Cooldown
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Warmup */}
                  {selectedPlan.warmup_cooldown.warmup?.length > 0 && (
                    <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-4 border border-orange-100">
                      <h4 className="font-bold text-orange-800 mb-3 flex items-center gap-2">
                        <Flame size={16} className="text-orange-500" /> Warmup Routine
                      </h4>
                      <div className="space-y-2">
                        {selectedPlan.warmup_cooldown.warmup.map((w, i) => {
                          const ex = typeof w === 'string' ? { exercise: w } : w;
                          return (
                            <div key={i} className="flex items-start gap-2 p-2.5 bg-white/70 rounded-lg">
                              <div className="w-6 h-6 rounded-full bg-orange-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                                <span className="text-white text-[10px] font-bold">{i + 1}</span>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-900">{ex.exercise || ex.name}</p>
                                {ex.duration && <span className="text-[10px] text-orange-600 font-medium">⏱️ {ex.duration}</span>}
                                {ex.description && <p className="text-xs text-gray-600 mt-0.5">{ex.description}</p>}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                  {/* Cooldown */}
                  {selectedPlan.warmup_cooldown.cooldown?.length > 0 && (
                    <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-xl p-4 border border-cyan-100">
                      <h4 className="font-bold text-cyan-800 mb-3 flex items-center gap-2">
                        <Heart size={16} className="text-cyan-500" /> Cooldown Routine
                      </h4>
                      <div className="space-y-2">
                        {selectedPlan.warmup_cooldown.cooldown.map((c, i) => {
                          const ex = typeof c === 'string' ? { exercise: c } : c;
                          return (
                            <div key={i} className="flex items-start gap-2 p-2.5 bg-white/70 rounded-lg">
                              <div className="w-6 h-6 rounded-full bg-cyan-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                                <span className="text-white text-[10px] font-bold">{i + 1}</span>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-900">{ex.exercise || ex.name}</p>
                                {ex.duration && <span className="text-[10px] text-cyan-600 font-medium">⏱️ {ex.duration}</span>}
                                {ex.description && <p className="text-xs text-gray-600 mt-0.5">{ex.description}</p>}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Nutrition Plan */}
            <div className="card p-6">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">🥗 Nutrition & Recovery</h3>
              {selectedPlan.nutrition_plan && typeof selectedPlan.nutrition_plan === 'object' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                  {selectedPlan.nutrition_plan.pre_workout && (
                    <div className="p-3 bg-green-50 rounded-xl border border-green-100">
                      <p className="text-xs font-bold text-green-800 mb-1">🥗 Pre-Workout</p>
                      <p className="text-xs text-green-700">{selectedPlan.nutrition_plan.pre_workout}</p>
                    </div>
                  )}
                  {selectedPlan.nutrition_plan.post_workout && (
                    <div className="p-3 bg-yellow-50 rounded-xl border border-yellow-100">
                      <p className="text-xs font-bold text-yellow-800 mb-1">🍌 Post-Workout</p>
                      <p className="text-xs text-yellow-700">{selectedPlan.nutrition_plan.post_workout}</p>
                    </div>
                  )}
                  {selectedPlan.nutrition_plan.hydration && (
                    <div className="p-3 bg-blue-50 rounded-xl border border-blue-100">
                      <p className="text-xs font-bold text-blue-800 mb-1">💧 Hydration</p>
                      <p className="text-xs text-blue-700">{selectedPlan.nutrition_plan.hydration}</p>
                    </div>
                  )}
                  {selectedPlan.nutrition_plan.supplements && (
                    <div className="p-3 bg-purple-50 rounded-xl border border-purple-100">
                      <p className="text-xs font-bold text-purple-800 mb-1">💊 Supplements</p>
                      <p className="text-xs text-purple-700">{selectedPlan.nutrition_plan.supplements}</p>
                    </div>
                  )}
                  {selectedPlan.nutrition_plan.daily_diet && (
                    <div className="md:col-span-2 p-3 bg-orange-50 rounded-xl border border-orange-100">
                      <p className="text-xs font-bold text-orange-800 mb-1">🍽️ Daily Diet</p>
                      <p className="text-xs text-orange-700">{selectedPlan.nutrition_plan.daily_diet}</p>
                    </div>
                  )}
                  {selectedPlan.nutrition_plan.foods_to_avoid && (
                    <div className="md:col-span-2 p-3 bg-red-50 rounded-xl border border-red-100">
                      <p className="text-xs font-bold text-red-800 mb-1">🚫 Foods to Avoid</p>
                      <p className="text-xs text-red-700">{selectedPlan.nutrition_plan.foods_to_avoid}</p>
                    </div>
                  )}
                </div>
              ) : selectedPlan.nutrition_advice ? (
                <div className="p-4 bg-green-50 rounded-xl mb-4 flex gap-4">
                  <img src="https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=120&h=80&fit=crop" alt="Nutrition" className="w-20 h-20 rounded-lg object-cover hidden sm:block" onError={(e) => { e.target.style.display = 'none'; }} />
                  <div>
                    <h4 className="font-medium text-green-700 mb-1">🥗 Nutrition Advice</h4>
                    <p className="text-sm text-green-800">{typeof selectedPlan.nutrition_advice === 'string' ? selectedPlan.nutrition_advice : JSON.stringify(selectedPlan.nutrition_advice)}</p>
                  </div>
                </div>
              ) : null}

              {/* Recovery Tips */}
              {selectedPlan.recovery_tips && typeof selectedPlan.recovery_tips === 'object' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {selectedPlan.recovery_tips.sleep && (
                    <div className="p-3 bg-indigo-50 rounded-xl border border-indigo-100">
                      <p className="text-xs font-bold text-indigo-800 mb-1">😴 Sleep</p>
                      <p className="text-xs text-indigo-700">{selectedPlan.recovery_tips.sleep}</p>
                    </div>
                  )}
                  {selectedPlan.recovery_tips.stretching && (
                    <div className="p-3 bg-teal-50 rounded-xl border border-teal-100">
                      <p className="text-xs font-bold text-teal-800 mb-1">🧘 Stretching</p>
                      <p className="text-xs text-teal-700">{selectedPlan.recovery_tips.stretching}</p>
                    </div>
                  )}
                  {selectedPlan.recovery_tips.rest_days && (
                    <div className="p-3 bg-blue-50 rounded-xl border border-blue-100">
                      <p className="text-xs font-bold text-blue-800 mb-1">📅 Rest Schedule</p>
                      <p className="text-xs text-blue-700">{selectedPlan.recovery_tips.rest_days}</p>
                    </div>
                  )}
                  {selectedPlan.recovery_tips.injury_prevention && (
                    <div className="p-3 bg-pink-50 rounded-xl border border-pink-100">
                      <p className="text-xs font-bold text-pink-800 mb-1">🩹 Injury Prevention</p>
                      <p className="text-xs text-pink-700">{selectedPlan.recovery_tips.injury_prevention}</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Weekly Goals & Progress */}
            {(selectedPlan.weekly_goals?.length > 0 || selectedPlan.progress_tracking) && (
              <div className="card p-6">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <TrendingUp size={18} className="text-amber-500" /> Weekly Goals & Progress
                </h3>

                {selectedPlan.weekly_goals?.length > 0 && (
                  <div className="space-y-2 mb-4">
                    {selectedPlan.weekly_goals.map((g, i) => {
                      const goal = typeof g === 'string' ? { goal: g, week: i + 1 } : g;
                      return (
                        <div key={i} className="flex items-start gap-3 p-3 bg-amber-50 rounded-xl border border-amber-100">
                          <div className="w-8 h-8 rounded-full bg-amber-400 flex items-center justify-center flex-shrink-0 shadow-sm">
                            <span className="text-white text-xs font-bold">W{goal.week || i + 1}</span>
                          </div>
                          <div>
                            <p className="font-semibold text-amber-900 text-sm">{goal.goal}</p>
                            {goal.focus && <p className="text-xs text-amber-600 mt-0.5">🎯 Focus: {goal.focus}</p>}
                            {goal.milestone && <p className="text-xs text-amber-700 mt-0.5">{goal.milestone}</p>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Progress Tracking */}
                {selectedPlan.progress_tracking && (
                  <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-100">
                    <h4 className="font-bold text-green-800 mb-3 flex items-center gap-2"><Trophy size={16} /> How to Track Progress</h4>
                    {(selectedPlan.progress_tracking.metrics_to_track || selectedPlan.progress_tracking.metrics) && (
                      <div className="mb-3">
                        <p className="text-[10px] text-green-600 font-bold uppercase mb-1.5">Key Metrics</p>
                        {Array.isArray(selectedPlan.progress_tracking.metrics_to_track || selectedPlan.progress_tracking.metrics) ? (
                          <div className="flex flex-wrap gap-2">
                            {(selectedPlan.progress_tracking.metrics_to_track || selectedPlan.progress_tracking.metrics).map((m, i) => (
                              <span key={i} className="text-xs bg-white text-green-700 px-2.5 py-1 rounded-lg font-medium border border-green-200">{m}</span>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-green-700">{selectedPlan.progress_tracking.metrics_to_track || selectedPlan.progress_tracking.metrics}</p>
                        )}
                      </div>
                    )}
                    {selectedPlan.progress_tracking.check_in_schedule && (
                      <div className="mb-3">
                        <p className="text-[10px] text-green-600 font-bold uppercase mb-1">📅 Check-In Schedule</p>
                        <p className="text-xs text-green-700 bg-white/60 p-2 rounded-lg">{selectedPlan.progress_tracking.check_in_schedule}</p>
                      </div>
                    )}
                    {selectedPlan.progress_tracking.signs_of_improvement && (
                      <div>
                        <p className="text-[10px] text-green-600 font-bold uppercase mb-1.5">Signs of Improvement</p>
                        {Array.isArray(selectedPlan.progress_tracking.signs_of_improvement) ? (
                          <div className="space-y-1">
                            {selectedPlan.progress_tracking.signs_of_improvement.map((s, i) => (
                              <p key={i} className="text-xs text-green-700 flex items-start gap-1.5">
                                <span className="flex-shrink-0">✅</span> <span>{s.replace(/^✅\s*/, '')}</span>
                              </p>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-green-700">{selectedPlan.progress_tracking.signs_of_improvement}</p>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Resources & Training Videos */}
            {selectedPlan.resources?.length > 0 && (
              <div className="card p-6">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Youtube size={20} className="text-red-500" /> Training Resources & Videos
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {selectedPlan.resources.map((r, i) => {
                    const res = typeof r === 'string' ? { title: r, url: r } : r;
                    const isYoutube = (res.url || '').includes('youtube');
                    return (
                      <a key={i} href={res.url || '#'} target="_blank" rel="noopener noreferrer"
                        className="flex items-start gap-3 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl hover:from-red-50 hover:to-orange-50 transition-all group border border-gray-100 hover:border-red-200">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${isYoutube ? 'bg-red-100 group-hover:bg-red-200' : 'bg-blue-100 group-hover:bg-blue-200'} transition-colors`}>
                          {isYoutube ? <Play size={18} className="text-red-600" /> : <BookOpen size={18} className="text-blue-600" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-800 group-hover:text-red-700 transition-colors leading-snug">{res.title || 'Training Resource'}</p>
                          {res.description && <p className="text-xs text-gray-500 mt-1">{res.description}</p>}
                          <div className="flex items-center gap-1 mt-1.5">
                            <ExternalLink size={10} className="text-gray-400" />
                            <span className="text-[10px] text-gray-400 font-medium">{isYoutube ? 'YouTube' : 'External Link'}</span>
                            {res.type && <span className="text-[10px] bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded ml-1 capitalize">{res.type}</span>}
                          </div>
                        </div>
                      </a>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Motivational Message */}
            {selectedPlan.motivational_message && (
              <div className="card p-4 bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50">
                <p className="text-sm font-bold text-indigo-900 text-center">💪 {selectedPlan.motivational_message}</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Saved Plans */}
      <div className="card p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <BookOpen size={20} /> My Training Plans ({plans.length})
        </h2>
        {plans.length > 0 ? (
          <div className="space-y-3">
            {plans.map((p) => (
              <div key={p.id} className="flex items-center gap-4 p-4 rounded-xl border border-gray-200 hover:border-primary-300 transition-colors">
                <div className="w-12 h-12 rounded-xl bg-sport-purple/10 flex items-center justify-center">
                  <Brain className="text-sport-purple" size={22} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 capitalize">{p.sport} Training Plan</p>
                  <p className="text-sm text-gray-500">Level: {p.skill_level} • Goal: {p.goal}</p>
                  <p className="text-xs text-gray-400">{new Date(p.created_at).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => viewPlan(p)} className="btn-primary text-sm py-1.5 px-3">View</button>
                  <button onClick={() => handleDelete(p.id)} className="p-2 text-gray-400 hover:text-red-500">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Brain className="mx-auto text-gray-300 mb-3" size={48} />
            <p className="text-gray-400">No training plans yet</p>
            <p className="text-sm text-gray-400 mt-1">Generate your first AI-powered plan above!</p>
          </div>
        )}
      </div>
    </div>
  );
}
