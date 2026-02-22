// ==================================================
// SportVerse AI - Personalized Trainer (Video Analysis)
// Upload video → AI pose analysis → rich visual output
// ==================================================

import { AnimatePresence, motion } from 'framer-motion';
import {
    Award, BarChart3, BookOpen,
    Calendar, CheckCircle,
    ChevronDown, ChevronUp, Clock,
    Dumbbell, Flame, Heart,
    Loader2, Star,
    Target, Trash2, TrendingUp, Trophy,
    Upload, Video, Zap
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../services/api';
import { getActivityImage, getSportImages } from '../utils/sportImages';

const SPORTS = ['cricket', 'football', 'badminton', 'tennis', 'basketball'];

/* ───── Score Ring Component ───── */
const ScoreRing = ({ score, label, color, size = 100 }) => {
  const pct = score || 0;
  const r = (size - 20) / 2, c = 2 * Math.PI * r;
  const getGrade = (s) => s >= 90 ? 'A+' : s >= 80 ? 'A' : s >= 70 ? 'B+' : s >= 60 ? 'B' : s >= 50 ? 'C' : 'D';
  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#e5e7eb" strokeWidth="8" />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth="8"
          strokeDasharray={c} strokeDashoffset={c - (c * pct) / 100} strokeLinecap="round"
          className="transition-all duration-1000" />
      </svg>
      <div className="flex flex-col items-center -mt-[4.2rem] mb-4">
        <span className="text-2xl font-bold" style={{ color }}>{pct}%</span>
        <span className="text-[10px] font-semibold text-gray-400">{getGrade(pct)}</span>
      </div>
      <span className="text-xs text-gray-500 mt-1 font-medium">{label}</span>
    </div>
  );
};

/* ───── Intensity Badge ───── */
const IntensityBadge = ({ intensity }) => {
  const text = typeof intensity === 'string' ? intensity : 'Medium';
  const isLow = text.toLowerCase().includes('low');
  const isHigh = text.toLowerCase().includes('high');
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${
      isHigh ? 'bg-red-100 text-red-700' : isLow ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
    }`}>
      {isHigh ? '🔴' : isLow ? '🟢' : '🟡'} {text.replace(/🟢|🟡|🔴/g, '').trim() || (isHigh ? 'High' : isLow ? 'Low' : 'Medium')}
    </span>
  );
};

/* ───── Priority Badge ───── */
const PriorityBadge = ({ priority }) => {
  const p = (priority || 'medium').toLowerCase();
  return (
    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
      p === 'high' ? 'bg-red-100 text-red-600' : p === 'low' ? 'bg-blue-100 text-blue-600' : 'bg-orange-100 text-orange-600'
    }`}>
      {p === 'high' ? '🔥' : p === 'low' ? '💡' : '⚡'} {p}
    </span>
  );
};

/* ───── Day Card for Schedule ───── */
const DayCard = ({ day, data }) => {
  const [open, setOpen] = useState(false);
  const dayData = typeof data === 'object' && !Array.isArray(data) ? data : { activities: Array.isArray(data) ? data : [] };
  const activities = dayData.activities || (Array.isArray(data) ? data : []);
  const theme = dayData.theme || '';
  const totalDuration = dayData.total_duration || '';

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden bg-white hover:shadow-md transition-shadow">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between p-3 hover:bg-gray-50">
        <div className="flex items-center gap-2">
          <Calendar size={14} className="text-indigo-500" />
          <span className="font-semibold text-sm text-gray-900 capitalize">{day}</span>
          {theme && <span className="text-xs text-gray-500">{theme}</span>}
        </div>
        <div className="flex items-center gap-2">
          {totalDuration && <span className="text-[10px] bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full font-medium">{totalDuration}</span>}
          {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </div>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
            <div className="p-3 pt-0 space-y-2">
              {activities.map((a, i) => {
                const act = typeof a === 'string' ? { activity: a } : a;
                const actName = act.activity || act.name || JSON.stringify(act);
                const actImg = getActivityImage(actName);
                return (
                  <div key={i} className="flex items-start gap-3 p-2 bg-gray-50 rounded-lg">
                    {actImg ? (
                      <img src={actImg.url} alt="" className="w-10 h-10 rounded-lg object-cover flex-shrink-0" onError={(e) => { e.target.style.display = 'none'; }} />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center flex-shrink-0">
                        <Dumbbell size={16} className="text-white" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">{actName}</p>
                      {act.description && <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{act.description}</p>}
                      <div className="flex flex-wrap items-center gap-2 mt-1">
                        {act.duration && <span className="text-[10px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded font-medium flex items-center gap-0.5"><Clock size={8} /> {act.duration}</span>}
                        {act.sets_reps && <span className="text-[10px] bg-purple-50 text-purple-600 px-1.5 py-0.5 rounded font-medium">{act.sets_reps}</span>}
                        {(act.sets && act.reps) && <span className="text-[10px] bg-purple-50 text-purple-600 px-1.5 py-0.5 rounded font-medium">{act.sets} × {act.reps}</span>}
                        {act.intensity && <IntensityBadge intensity={act.intensity} />}
                        {act.focus_area && <span className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded font-medium">🎯 {act.focus_area}</span>}
                      </div>
                    </div>
                  </div>
                );
              })}
              {activities.length === 0 && <p className="text-xs text-gray-400 text-center py-2">Rest Day 🧘</p>}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function PersonalizedTrainer() {
  const fileRef = useRef(null);
  const [sport, setSport] = useState('cricket');
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [videos, setVideos] = useState([]);
  const [selectedResult, setSelectedResult] = useState(null);
  const [expandedVideo, setExpandedVideo] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => { fetchVideos(); }, []);

  const fetchVideos = async () => {
    try {
      const { data } = await api.get('/video/my-videos');
      setVideos(data.videos || []);
    } catch (err) { console.error(err); }
  };

  const handleUpload = async () => {
    if (!file) return toast.error('Please select a video file');
    setUploading(true);
    setUploadProgress(0);
    try {
      const formData = new FormData();
      formData.append('video', file);
      formData.append('sport', sport);
      const { data } = await api.post('/video/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (e) => setUploadProgress(Math.round((e.loaded * 100) / e.total)),
      });
      toast.success('Video uploaded! Starting AI analysis...');
      setFile(null);
      if (fileRef.current) fileRef.current.value = '';
      await handleAnalyze(data.video.id);
      fetchVideos();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Upload failed');
    } finally { setUploading(false); }
  };

  const [analysisStep, setAnalysisStep] = useState(0);

  const handleAnalyze = async (videoId) => {
    setAnalyzing(true);
    setAnalysisStep(1);

    // Simulate step progression while waiting for the backend
    const stepTimer = setInterval(() => {
      setAnalysisStep(prev => {
        if (prev >= 4) { clearInterval(stepTimer); return 4; }
        return prev + 1;
      });
    }, 8000); // advance step every ~8 seconds

    try {
      const { data } = await api.post(`/video/analyze/${videoId}`, {}, { timeout: 180000 });
      clearInterval(stepTimer);
      setAnalysisStep(0);
      toast.success('🎯 AI Analysis complete!');
      setSelectedResult(data.analysis);
      setActiveTab('overview');
      fetchVideos();
    } catch (err) {
      clearInterval(stepTimer);
      setAnalysisStep(0);
      const msg = err.code === 'ECONNABORTED'
        ? 'Analysis timed out — the video may be too long. Try a shorter clip.'
        : (err.response?.data?.error || 'Analysis failed');
      toast.error(msg);
    } finally { setAnalyzing(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this video?')) return;
    try {
      await api.delete(`/video/${id}`);
      toast.success('Video deleted');
      fetchVideos();
    } catch (err) { toast.error('Delete failed'); }
  };

  const getScoreColor = (s) => s >= 80 ? '#22c55e' : s >= 60 ? '#eab308' : '#ef4444';

  // Extract data safely
  const perf = selectedResult?.performance_analysis || selectedResult || {};
  const coaching = selectedResult?.coaching_feedback || {};
  const plan = selectedResult?.training_plan || {};

  const tabs = [
    { id: 'overview', label: '📊 Overview', icon: BarChart3 },
    { id: 'coaching', label: '🏆 Coaching', icon: Trophy },
    { id: 'drills', label: '🏋️ Drills', icon: Dumbbell },
    { id: 'schedule', label: '📅 Schedule', icon: Calendar },
    { id: 'nutrition', label: '🥗 Nutrition', icon: Heart },
    { id: 'progress', label: '📈 Progress', icon: TrendingUp },
  ];

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold font-display text-gray-900">🎥 Personalized Trainer</h1>
        <p className="text-gray-500 mt-1">Upload your training video and get AI-powered performance analysis with personalized coaching</p>
      </motion.div>

      {/* ═══ Upload Section ═══ */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Upload size={20} className="text-indigo-500" /> Upload Video
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sport</label>
            <select value={sport} onChange={(e) => setSport(e.target.value)} className="input-field">
              {SPORTS.map((s) => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Video File</label>
            <input ref={fileRef} type="file" accept="video/*"
              onChange={(e) => setFile(e.target.files[0])}
              className="input-field file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:bg-primary-50 file:text-primary-600 file:font-semibold file:cursor-pointer" />
          </div>
        </div>

        {file && (
          <div className="mt-3 p-3 bg-gray-50 rounded-xl flex items-center gap-3 text-sm">
            <Video className="text-sport-blue" size={18} />
            <span className="text-gray-700">{file.name}</span>
            <span className="text-gray-400">({(file.size / 1024 / 1024).toFixed(1)} MB)</span>
          </div>
        )}

        {uploading && (
          <div className="mt-3">
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-primary-500 to-sport-blue transition-all duration-300 rounded-full" style={{ width: `${uploadProgress}%` }} />
            </div>
            <p className="text-xs text-gray-500 mt-1">{uploadProgress}% uploaded</p>
          </div>
        )}

        {analyzing && (
          <div className="mt-4 p-5 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-100">
            <p className="font-bold text-indigo-900 mb-4 flex items-center gap-2">
              <Loader2 className="animate-spin" size={18} /> Analyzing Your Performance
            </p>
            <div className="space-y-3">
              {[
                { step: 1, icon: '📹', title: 'Reading video frames', desc: 'OpenCV is reading and sampling frames from your video' },
                { step: 2, icon: '🦴', title: 'Detecting body pose', desc: 'MediaPipe Pose model is tracking 33 body landmarks per frame' },
                { step: 3, icon: '📊', title: 'Extracting performance metrics', desc: 'Computing posture, technique, timing, consistency & balance scores' },
                { step: 4, icon: '🤖', title: 'AI Coach generating feedback', desc: 'Gemini AI agent is creating your personalized coaching report & training plan' },
              ].map(({ step, icon, title, desc }) => {
                const done = analysisStep > step;
                const active = analysisStep === step;
                return (
                  <div key={step} className={`flex items-start gap-3 p-3 rounded-lg transition-all duration-500 ${
                    done ? 'bg-green-50 border border-green-200' : active ? 'bg-white border border-indigo-200 shadow-sm' : 'opacity-40'
                  }`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-sm ${
                      done ? 'bg-green-500 text-white' : active ? 'bg-indigo-500 text-white animate-pulse' : 'bg-gray-200 text-gray-500'
                    }`}>
                      {done ? '✓' : icon}
                    </div>
                    <div>
                      <p className={`text-sm font-semibold ${done ? 'text-green-800' : active ? 'text-indigo-900' : 'text-gray-500'}`}>
                        {title}
                      </p>
                      <p className={`text-xs mt-0.5 ${done ? 'text-green-600' : active ? 'text-indigo-600' : 'text-gray-400'}`}>
                        {done ? 'Complete' : desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <button onClick={handleUpload} disabled={uploading || analyzing || !file}
          className="btn-primary mt-4 flex items-center gap-2 disabled:opacity-50">
          {uploading ? <Loader2 className="animate-spin" size={18} /> : analyzing ? <Loader2 className="animate-spin" size={18} /> : <Upload size={18} />}
          {uploading ? 'Uploading...' : analyzing ? 'AI Analyzing...' : 'Upload & Analyze'}
        </button>
      </motion.div>

      {/* ═══ Analysis Results ═══ */}
      <AnimatePresence>
        {selectedResult && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">

            {/* ── Header Card with Summary ── */}
            <div className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Award size={24} className="text-yellow-500" /> AI Analysis Results
                </h2>
                {coaching.overall_rating && (
                  <span className="text-2xl font-black bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    {coaching.overall_rating}
                  </span>
                )}
              </div>

              {coaching.summary && (
                <div className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl mb-4">
                  <p className="text-sm text-gray-800 leading-relaxed">{coaching.summary}</p>
                  {coaching.performance_level && (
                    <span className="inline-block mt-2 px-3 py-1 bg-white rounded-full text-xs font-bold text-indigo-600 shadow-sm">
                      Level: {coaching.performance_level}
                    </span>
                  )}
                </div>
              )}

              {/* Score Rings */}
              <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
                <ScoreRing score={Math.round(perf.overall_score || 0)} label="Overall" color={getScoreColor(perf.overall_score)} />
                <ScoreRing score={Math.round(perf.posture_score || 0)} label="Posture" color="#6366f1" />
                <ScoreRing score={Math.round(perf.technique_score || 0)} label="Technique" color="#3b82f6" />
                <ScoreRing score={Math.round(perf.timing_score || 0)} label="Timing" color="#8b5cf6" />
                <ScoreRing score={Math.round(perf.consistency_score || 0)} label="Consistency" color="#06b6d4" />
                <ScoreRing score={Math.round(perf.balance_score || 0)} label="Balance" color="#10b981" />
              </div>
            </div>

            {/* Sport Reference Images */}
            <div className="card p-4">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">📸 Sport Reference</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {getSportImages(sport, 4).map((img, i) => (
                  <div key={i} className="sport-image-card">
                    <img src={img.url} alt={img.caption} loading="lazy" onError={(e) => { e.target.style.display = 'none'; }} />
                    <div className="sport-image-overlay">
                      <p className="text-white text-xs font-medium">{img.caption}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Tab Navigation ── */}
            <div className="flex gap-1 overflow-x-auto pb-1 bg-white rounded-xl p-1 shadow-sm border border-gray-100">
              {tabs.map((tab) => (
                <button key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                    activeTab === tab.id
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}>
                  <tab.icon size={14} />
                  {tab.label}
                </button>
              ))}
            </div>

            {/* ── Tab Content ── */}
            <motion.div key={activeTab} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="card p-6">

              {/* ─── OVERVIEW TAB ─── */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  {/* Detected Issues */}
                  {perf.detected_issues?.length > 0 && (
                    <div>
                      <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2"><Target size={18} className="text-red-500" /> Detected Issues</h3>
                      <div className="space-y-2">
                        {perf.detected_issues.map((issue, i) => (
                          <div key={i} className="flex items-start gap-3 p-3 bg-red-50 rounded-lg border-l-4 border-red-400">
                            <span className="text-red-500 mt-0.5">⚠️</span>
                            <p className="text-sm text-red-800">{issue}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Strengths */}
                  {coaching.strengths?.length > 0 && (
                    <div>
                      <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2"><CheckCircle size={18} className="text-green-500" /> Your Strengths</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {coaching.strengths.map((s, i) => {
                          const strength = typeof s === 'string' ? { title: s } : s;
                          return (
                            <div key={i} className="p-3 bg-green-50 rounded-xl border border-green-100">
                              <div className="flex items-center gap-2">
                                <span className="text-lg">{strength.icon || '💪'}</span>
                                <p className="font-semibold text-green-800 text-sm">{strength.title}</p>
                              </div>
                              {strength.description && <p className="text-xs text-green-700 mt-1 ml-7">{strength.description}</p>}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Areas to Improve */}
                  {coaching.areas_to_improve?.length > 0 && (
                    <div>
                      <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2"><TrendingUp size={18} className="text-orange-500" /> Areas to Improve</h3>
                      <div className="space-y-3">
                        {coaching.areas_to_improve.map((a, i) => {
                          const area = typeof a === 'string' ? { title: a } : a;
                          return (
                            <div key={i} className="p-3 bg-orange-50 rounded-xl border border-orange-100">
                              <div className="flex items-center justify-between mb-1">
                                <div className="flex items-center gap-2">
                                  <span className="text-lg">{area.icon || '🎯'}</span>
                                  <p className="font-semibold text-orange-800 text-sm">{area.title}</p>
                                </div>
                                {area.priority && <PriorityBadge priority={area.priority} />}
                              </div>
                              {area.description && <p className="text-xs text-orange-700 mt-1 ml-7">{area.description}</p>}
                              {(area.current_score !== undefined && area.target_score !== undefined) && (
                                <div className="ml-7 mt-2">
                                  <div className="flex items-center gap-2 text-[10px] text-orange-600 font-medium mb-1">
                                    <span>Current: {area.current_score}%</span>
                                    <span>→</span>
                                    <span>Target: {area.target_score}%</span>
                                  </div>
                                  <div className="h-1.5 bg-orange-200 rounded-full overflow-hidden">
                                    <div className="h-full bg-gradient-to-r from-orange-400 to-green-400 rounded-full transition-all" style={{ width: `${(area.current_score / area.target_score) * 100}%` }} />
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Motivation */}
                  {coaching.motivation && (
                    <div className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl border border-yellow-200">
                      <p className="text-sm font-medium text-yellow-800">💬 {coaching.motivation}</p>
                    </div>
                  )}
                </div>
              )}

              {/* ─── COACHING TAB ─── */}
              {activeTab === 'coaching' && (
                <div className="space-y-6">
                  {/* Technique Tips */}
                  {coaching.technique_tips?.length > 0 && (
                    <div>
                      <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2"><BookOpen size={18} className="text-blue-500" /> Technique Tips</h3>
                      <div className="space-y-3">
                        {coaching.technique_tips.map((tip, i) => {
                          const t = typeof tip === 'string' ? { title: tip } : tip;
                          return (
                            <div key={i} className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                              <p className="font-semibold text-blue-900 text-sm flex items-center gap-2">
                                <span>{t.icon || '📌'}</span> {t.title}
                              </p>
                              {t.description && <p className="text-xs text-blue-700 mt-1">{t.description}</p>}
                              {(t.before || t.after) && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                                  {t.before && (
                                    <div className="p-2 bg-red-50 rounded-lg">
                                      <p className="text-xs text-red-700">{t.before}</p>
                                    </div>
                                  )}
                                  {t.after && (
                                    <div className="p-2 bg-green-50 rounded-lg">
                                      <p className="text-xs text-green-700">{t.after}</p>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Recovery Advice */}
                  {coaching.recovery_advice && (
                    <div>
                      <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2"><Heart size={18} className="text-pink-500" /> Recovery & Prevention</h3>
                      <div className="p-4 bg-pink-50 rounded-xl border border-pink-100">
                        {typeof coaching.recovery_advice === 'string' ? (
                          <p className="text-sm text-pink-800">{coaching.recovery_advice}</p>
                        ) : (
                          <>
                            <p className="font-semibold text-pink-900 text-sm mb-2">{coaching.recovery_advice.title}</p>
                            {coaching.recovery_advice.tips?.map((tip, i) => (
                              <p key={i} className="text-xs text-pink-700 mb-1">• {tip}</p>
                            ))}
                            {coaching.recovery_advice.rest_days_recommended && (
                              <p className="text-xs font-medium text-pink-600 mt-2">📅 Recommended rest days per week: {coaching.recovery_advice.rest_days_recommended}</p>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Nutrition Quick Tips */}
                  {coaching.nutrition_quick_tips?.length > 0 && (
                    <div>
                      <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">🥗 Quick Nutrition Tips</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {coaching.nutrition_quick_tips.map((tip, i) => (
                          <div key={i} className="p-3 bg-green-50 rounded-xl border border-green-100">
                            <p className="text-xs text-green-800">{tip}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ─── DRILLS TAB ─── */}
              {activeTab === 'drills' && (
                <div className="space-y-6">
                  {/* Coaching Drills */}
                  {coaching.specific_drills?.length > 0 && (
                    <div>
                      <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2"><Dumbbell size={18} className="text-purple-500" /> Recommended Drills</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {coaching.specific_drills.map((drill, i) => {
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
                                    <span>{d.icon || '🏋️'}</span> {d.name}
                                  </p>
                                  {d.description && <p className="text-xs text-purple-700 mt-1">{d.description}</p>}
                                  <div className="flex flex-wrap gap-1.5 mt-2">
                                    {d.duration && <span className="text-[10px] bg-purple-100 text-purple-600 px-1.5 py-0.5 rounded font-medium">⏱️ {d.duration}</span>}
                                    {d.sets_reps && <span className="text-[10px] bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded font-medium">🔄 {d.sets_reps}</span>}
                                    {d.difficulty && <span className="text-[10px] bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded font-medium">{d.difficulty}</span>}
                                    {d.focus_area && <span className="text-[10px] bg-green-100 text-green-600 px-1.5 py-0.5 rounded font-medium">🎯 {d.focus_area}</span>}
                                    {d.equipment && d.equipment !== 'None' && <span className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded font-medium">🧰 {d.equipment}</span>}
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ─── SCHEDULE TAB ─── */}
              {activeTab === 'schedule' && (
                <div className="space-y-6">
                  {plan.overview && (
                    <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl">
                      <p className="text-sm text-blue-800">{plan.overview}</p>
                      {plan.plan_difficulty && <span className="inline-block mt-2 text-xs font-bold text-blue-600">{plan.plan_difficulty}</span>}
                    </div>
                  )}

                  <h3 className="font-bold text-gray-900 flex items-center gap-2"><Calendar size={18} className="text-indigo-500" /> Weekly Training Schedule</h3>

                  {plan.weekly_schedule && (
                    <div className="space-y-2">
                      {Object.entries(plan.weekly_schedule).map(([day, data]) => (
                        <DayCard key={day} day={day} data={data} />
                      ))}
                    </div>
                  )}

                  {/* Key Focus Areas */}
                  {plan.key_focus_areas?.length > 0 && (
                    <div>
                      <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2"><Target size={18} className="text-red-500" /> Key Focus Areas</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {plan.key_focus_areas.map((area, i) => {
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {plan.warmup?.length > 0 && (
                      <div className="p-4 bg-orange-50 rounded-xl border border-orange-100">
                        <h4 className="font-bold text-orange-800 mb-2 flex items-center gap-2"><Flame size={16} /> Warm-Up</h4>
                        {plan.warmup.map((w, i) => {
                          const item = typeof w === 'string' ? { exercise: w } : w;
                          return (
                            <div key={i} className="flex items-center gap-2 mb-1">
                              <span className="text-xs">🔥</span>
                              <p className="text-xs text-orange-700">{item.exercise || w}</p>
                              {item.duration && <span className="text-[10px] bg-orange-100 text-orange-600 px-1 py-0.5 rounded">{item.duration}</span>}
                            </div>
                          );
                        })}
                      </div>
                    )}
                    {plan.cooldown?.length > 0 && (
                      <div className="p-4 bg-cyan-50 rounded-xl border border-cyan-100">
                        <h4 className="font-bold text-cyan-800 mb-2 flex items-center gap-2">❄️ Cool-Down</h4>
                        {plan.cooldown.map((c, i) => {
                          const item = typeof c === 'string' ? { exercise: c } : c;
                          return (
                            <div key={i} className="flex items-center gap-2 mb-1">
                              <span className="text-xs">❄️</span>
                              <p className="text-xs text-cyan-700">{item.exercise || c}</p>
                              {item.duration && <span className="text-[10px] bg-cyan-100 text-cyan-600 px-1 py-0.5 rounded">{item.duration}</span>}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ─── NUTRITION TAB ─── */}
              {activeTab === 'nutrition' && (
                <div className="space-y-6">
                  {plan.nutrition_plan && typeof plan.nutrition_plan === 'object' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {plan.nutrition_plan.pre_workout && (
                        <div className="p-4 bg-green-50 rounded-xl border border-green-100">
                          <h4 className="font-bold text-green-800 mb-2">🥗 Pre-Workout</h4>
                          <p className="text-sm text-green-700">{plan.nutrition_plan.pre_workout}</p>
                        </div>
                      )}
                      {plan.nutrition_plan.post_workout && (
                        <div className="p-4 bg-yellow-50 rounded-xl border border-yellow-100">
                          <h4 className="font-bold text-yellow-800 mb-2">🍌 Post-Workout</h4>
                          <p className="text-sm text-yellow-700">{plan.nutrition_plan.post_workout}</p>
                        </div>
                      )}
                      {plan.nutrition_plan.hydration && (
                        <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                          <h4 className="font-bold text-blue-800 mb-2">💧 Hydration</h4>
                          <p className="text-sm text-blue-700">{plan.nutrition_plan.hydration}</p>
                        </div>
                      )}
                      {plan.nutrition_plan.supplements && (
                        <div className="p-4 bg-purple-50 rounded-xl border border-purple-100">
                          <h4 className="font-bold text-purple-800 mb-2">💊 Supplements</h4>
                          <p className="text-sm text-purple-700">{plan.nutrition_plan.supplements}</p>
                        </div>
                      )}
                      {plan.nutrition_plan.daily_diet && (
                        <div className="md:col-span-2 p-4 bg-orange-50 rounded-xl border border-orange-100">
                          <h4 className="font-bold text-orange-800 mb-2">🍽️ Daily Diet</h4>
                          <p className="text-sm text-orange-700">{plan.nutrition_plan.daily_diet}</p>
                        </div>
                      )}
                      {plan.nutrition_plan.foods_to_avoid && (
                        <div className="md:col-span-2 p-4 bg-red-50 rounded-xl border border-red-100">
                          <h4 className="font-bold text-red-800 mb-2">🚫 Foods to Avoid</h4>
                          <p className="text-sm text-red-700">{plan.nutrition_plan.foods_to_avoid}</p>
                        </div>
                      )}
                    </div>
                  ) : plan.nutrition_advice ? (
                    <div className="p-4 bg-green-50 rounded-xl">
                      <h4 className="font-bold text-green-800 mb-2">🥗 Nutrition Guidance</h4>
                      <p className="text-sm text-green-700">{typeof plan.nutrition_advice === 'string' ? plan.nutrition_advice : JSON.stringify(plan.nutrition_advice)}</p>
                    </div>
                  ) : null}

                  {/* Recovery Tips from plan */}
                  {plan.recovery_tips && typeof plan.recovery_tips === 'object' && (
                    <div>
                      <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2"><Heart size={18} className="text-pink-500" /> Recovery</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {plan.recovery_tips.sleep && (
                          <div className="p-3 bg-indigo-50 rounded-xl border border-indigo-100">
                            <p className="text-xs font-bold text-indigo-800 mb-1">😴 Sleep</p>
                            <p className="text-xs text-indigo-700">{plan.recovery_tips.sleep}</p>
                          </div>
                        )}
                        {plan.recovery_tips.stretching && (
                          <div className="p-3 bg-teal-50 rounded-xl border border-teal-100">
                            <p className="text-xs font-bold text-teal-800 mb-1">🧘 Stretching</p>
                            <p className="text-xs text-teal-700">{plan.recovery_tips.stretching}</p>
                          </div>
                        )}
                        {plan.recovery_tips.rest_days && (
                          <div className="p-3 bg-blue-50 rounded-xl border border-blue-100">
                            <p className="text-xs font-bold text-blue-800 mb-1">📅 Rest Schedule</p>
                            <p className="text-xs text-blue-700">{plan.recovery_tips.rest_days}</p>
                          </div>
                        )}
                        {plan.recovery_tips.injury_prevention && (
                          <div className="p-3 bg-pink-50 rounded-xl border border-pink-100">
                            <p className="text-xs font-bold text-pink-800 mb-1">🩹 Injury Prevention</p>
                            <p className="text-xs text-pink-700">{plan.recovery_tips.injury_prevention}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ─── PROGRESS TAB ─── */}
              {activeTab === 'progress' && (
                <div className="space-y-6">
                  {/* Progress Milestones */}
                  {coaching.progress_milestones?.length > 0 && (
                    <div>
                      <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2"><Trophy size={18} className="text-yellow-500" /> Progress Milestones</h3>
                      <div className="relative">
                        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gradient-to-b from-yellow-400 to-green-400"></div>
                        <div className="space-y-4">
                          {coaching.progress_milestones.map((m, i) => {
                            const milestone = typeof m === 'string' ? { milestone: m } : m;
                            return (
                              <div key={i} className="flex items-start gap-4 pl-1">
                                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center flex-shrink-0 shadow-md z-10">
                                  <span className="text-white text-xs font-bold">{i + 1}</span>
                                </div>
                                <div className="flex-1 p-3 bg-yellow-50 rounded-xl border border-yellow-100">
                                  <p className="font-semibold text-yellow-900 text-sm">{milestone.milestone}</p>
                                  {milestone.timeline && <p className="text-[10px] text-yellow-600 mt-1">⏰ {milestone.timeline}</p>}
                                  {milestone.indicator && <p className="text-xs text-yellow-700 mt-1">📊 {milestone.indicator}</p>}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Weekly Targets */}
                  {plan.weekly_targets?.length > 0 && (
                    <div>
                      <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2"><Target size={18} className="text-blue-500" /> Weekly Targets</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {plan.weekly_targets.map((t, i) => {
                          const target = typeof t === 'string' ? { target: t } : t;
                          return (
                            <div key={i} className="p-3 bg-blue-50 rounded-xl border border-blue-100">
                              <p className="font-semibold text-blue-900 text-sm">{target.target}</p>
                              {target.metric && <p className="text-[10px] text-blue-600 mt-1">📏 Metric: {target.metric}</p>}
                              {(target.current && target.goal) && (
                                <div className="flex items-center gap-2 mt-1">
                                  <span className="text-[10px] text-blue-600">{target.current}</span>
                                  <span className="text-[10px] text-gray-400">→</span>
                                  <span className="text-[10px] text-green-600 font-bold">{target.goal}</span>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Weekly Goals */}
                  {plan.weekly_goals?.length > 0 && (
                    <div>
                      <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2"><Star size={18} className="text-amber-500" /> Weekly Goals</h3>
                      <div className="space-y-2">
                        {plan.weekly_goals.map((g, i) => {
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
                    </div>
                  )}

                  {/* Motivational Message */}
                  {(plan.motivational_message || coaching.motivation) && (
                    <div className="p-4 bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 rounded-xl border border-indigo-100">
                      <p className="text-sm font-bold text-indigo-900 text-center">
                        {plan.motivational_message || coaching.motivation}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </motion.div>

            <button onClick={() => setSelectedResult(null)} className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1">
              ✕ Close Results
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══ Video History ═══ */}
      <div className="card p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Video size={20} /> My Videos ({videos.length})
        </h2>
        {videos.length > 0 ? (
          <div className="space-y-3">
            {videos.map((v) => {
              const rawResult = typeof v.analysis_result === 'string'
                ? (() => { try { return JSON.parse(v.analysis_result); } catch { return v.analysis_result; } })()
                : v.analysis_result;
              const rawFeedback = typeof v.feedback === 'string'
                ? (() => { try { return JSON.parse(v.feedback); } catch { return v.feedback; } })()
                : v.feedback;
              const rawPlan = typeof v.training_plan === 'string'
                ? (() => { try { return JSON.parse(v.training_plan); } catch { return v.training_plan; } })()
                : v.training_plan;

              const result = rawResult
                ? {
                    performance_analysis: rawResult.performance_analysis || rawResult,
                    coaching_feedback: rawResult.coaching_feedback || rawFeedback,
                    training_plan: rawResult.training_plan || rawPlan,
                  }
                : null;
              const score = result?.performance_analysis?.overall_score;
              const isExpanded = expandedVideo === v.id;
              return (
                <div key={v.id} className="border border-gray-200 rounded-xl overflow-hidden">
                  <div className="flex items-center gap-4 p-4 cursor-pointer hover:bg-gray-50"
                    onClick={() => setExpandedVideo(isExpanded ? null : v.id)}>
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      v.status === 'analyzed' ? 'bg-green-100' : 'bg-gray-100'}`}>
                      {v.status === 'analyzed' ? <CheckCircle className="text-green-500" size={20} /> : <Video className="text-gray-400" size={20} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">{v.original_name}</p>
                      <p className="text-xs text-gray-500">{v.sport} • {new Date(v.uploaded_at).toLocaleDateString()}</p>
                    </div>
                    {score && (
                      <span className="text-lg font-bold" style={{ color: getScoreColor(score) }}>
                        {Math.round(score)}%
                      </span>
                    )}
                    {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </div>
                  {isExpanded && (
                    <div className="border-t p-4 bg-gray-50 space-y-3">
                      {result ? (
                        <button onClick={() => { setSelectedResult(result); setActiveTab('overview'); }}
                          className="btn-primary text-sm flex items-center gap-2">
                          <BarChart3 size={16} /> View Full Analysis
                        </button>
                      ) : (
                        <button onClick={() => handleAnalyze(v.id)} disabled={analyzing}
                          className="btn-primary text-sm flex items-center gap-2 disabled:opacity-50">
                          {analyzing ? <Loader2 className="animate-spin" size={16} /> : <Zap size={16} />}
                          Analyze Now
                        </button>
                      )}
                      <button onClick={() => handleDelete(v.id)}
                        className="text-sm text-red-500 hover:text-red-700 flex items-center gap-1">
                        <Trash2 size={14} /> Delete
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <Video className="mx-auto text-gray-300 mb-3" size={48} />
            <p className="text-gray-400">No videos uploaded yet</p>
            <p className="text-sm text-gray-400 mt-1">Upload your first training video above to get started!</p>
          </div>
        )}
      </div>
    </div>
  );
}
