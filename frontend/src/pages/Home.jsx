// ==================================================
// SportVerse AI - Landing Page
// ==================================================

import { motion } from 'framer-motion';
import { ArrowRight, Brain, CheckCircle, Shield, Star, UserCircle, Users, Video, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

const features = [
  { icon: Video, title: 'Video Analysis', description: 'Upload your sports videos and get AI-powered pose estimation and performance analysis with detailed feedback.', color: 'from-blue-500 to-cyan-500' },
  { icon: Brain, title: 'AI Trainer', description: 'Get personalized training plans, drill suggestions, and weekly timetables tailored to your sport and goals.', color: 'from-purple-500 to-pink-500' },
  { icon: Users, title: 'Community', description: 'Connect with players near you, join groups, chat in real-time, and find games to join.', color: 'from-green-500 to-emerald-500' },
  { icon: Shield, title: 'Coach Portal', description: 'Verified coaches can create tournaments, host events, recruit players, and post announcements.', color: 'from-orange-500 to-red-500' },
  { icon: UserCircle, title: 'Player Profile', description: 'AI-updated performance stats, training history, achievements, and public profile for recruitment.', color: 'from-indigo-500 to-blue-500' },
  { icon: Zap, title: 'Smart Insights', description: 'ML-powered movement analysis converts raw metrics into actionable coaching advice and motivational feedback.', color: 'from-yellow-500 to-orange-500' },
];

const sports = ['🏏 Cricket', '⚽ Football', '🏸 Badminton', '🏀 Basketball', '🎾 Tennis', '🏐 Volleyball'];

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 relative overflow-hidden">
      {/* Background sport decorations */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 text-8xl opacity-[0.04] rotate-12">⚽</div>
        <div className="absolute top-40 right-20 text-7xl opacity-[0.04] -rotate-12">🏏</div>
        <div className="absolute bottom-40 left-1/4 text-9xl opacity-[0.03] rotate-6">🏀</div>
        <div className="absolute top-1/3 right-1/4 text-6xl opacity-[0.04] -rotate-6">🎾</div>
        <div className="absolute bottom-20 right-10 text-8xl opacity-[0.03] rotate-12">🏸</div>
        <div className="absolute top-2/3 left-10 text-7xl opacity-[0.04]">🏐</div>
      </div>
      <div className="absolute inset-0 bg-sport-mesh pointer-events-none"></div>
      {/* Header */}
      <header className="fixed top-0 w-full z-50 glass border-b border-gray-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-sport-blue flex items-center justify-center">
              <Zap className="text-white" size={20} />
            </div>
            <span className="text-xl font-bold font-display gradient-text">SportVerse AI</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login" className="btn-secondary text-sm py-2 px-4">Sign In</Link>
            <Link to="/register" className="btn-primary text-sm py-2 px-4">Get Started</Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 overflow-hidden">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-50 border border-primary-200 text-primary-700 text-sm font-medium mb-6">
              <Star size={14} fill="currentColor" /> AI-Powered Sports Training Platform
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold font-display leading-tight mb-6">
              Train Smarter with{' '}
              <span className="gradient-text">AI-Powered</span>{' '}
              Sports Coaching
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8 leading-relaxed">
              Upload your training videos, get instant AI feedback, personalized training plans, 
              and connect with coaches and players — all in one platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register" className="btn-primary text-lg py-3 px-8 flex items-center gap-2 justify-center">
                Start Training Free <ArrowRight size={20} />
              </Link>
              <Link to="/login" className="btn-secondary text-lg py-3 px-8">
                Sign In
              </Link>
            </div>
          </motion.div>

          {/* Sports Tags */}
          <motion.div 
            className="flex flex-wrap justify-center gap-3 mt-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            {sports.map((sport) => (
              <span key={sport} className="px-4 py-2 bg-gray-50 rounded-full text-sm font-medium text-gray-700 border border-gray-200 hover:border-primary-300 hover:bg-primary-50 transition-all cursor-default">
                {sport}
              </span>
            ))}
          </motion.div>

          {/* Hero Image Placeholder */}
          <motion.div
            className="mt-16 max-w-5xl mx-auto"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            <div className="relative rounded-2xl bg-gradient-to-br from-primary-100 via-blue-50 to-green-50 p-8 shadow-2xl border border-gray-200 overflow-hidden">
              {/* Subtle sport background in hero card */}
              <div className="absolute inset-0 opacity-[0.03]">
                <div className="absolute top-4 right-8 text-6xl">🏏</div>
                <div className="absolute bottom-4 left-8 text-5xl">⚽</div>
                <div className="absolute top-1/2 right-1/3 text-4xl">🏸</div>
              </div>
              <div className="grid grid-cols-3 gap-4 h-64 relative z-10">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex flex-col justify-center items-center overflow-hidden">
                  <img src="https://images.unsplash.com/photo-1461896836934-bd45ba8bfb5a?w=300&h=200&fit=crop" alt="Sports Training" className="w-full h-24 object-cover rounded-lg mb-2" />
                  <p className="text-sm font-semibold text-gray-800">Video Analysis</p>
                  <p className="text-xs text-gray-500 mt-1">AI Pose Detection</p>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex flex-col justify-center items-center">
                  <div className="text-5xl mb-3">📊</div>
                  <p className="text-sm font-semibold text-gray-800">Score: 78/100</p>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div className="bg-gradient-to-r from-sport-green to-sport-blue h-2 rounded-full" style={{ width: '78%' }}></div>
                  </div>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex flex-col justify-center items-center overflow-hidden">
                  <img src="https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=300&h=200&fit=crop" alt="Fitness Training" className="w-full h-24 object-cover rounded-lg mb-2" />
                  <p className="text-sm font-semibold text-gray-800">AI Training Plan</p>
                  <p className="text-xs text-gray-500 mt-1">Custom Weekly Schedule</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-gray-50/80 to-white/60 backdrop-blur-sm relative">
        <div className="absolute inset-0 bg-sport-pattern opacity-40 pointer-events-none"></div>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold font-display mb-4">Everything You Need to <span className="gradient-text">Excel</span></h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              From AI video analysis to community features, SportVerse AI provides a complete training ecosystem.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                className="card-hover p-6"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4`}>
                  <feature.icon className="text-white" size={22} />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-r from-primary-600 via-sport-blue to-sport-green rounded-3xl p-12 text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4xKSIvPjwvc3ZnPg==')] opacity-30"></div>
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-bold font-display mb-4">Ready to Level Up Your Game?</h2>
              <p className="text-lg opacity-90 mb-8 max-w-2xl mx-auto">
                Join thousands of athletes using AI to improve their technique, connect with coaches, and achieve their fitness goals.
              </p>
              <div className="flex flex-wrap gap-4 justify-center mb-8">
                {['Free AI Analysis', 'Personalized Plans', 'Community Access', 'Coach Connection'].map((item) => (
                  <span key={item} className="flex items-center gap-1.5 text-sm">
                    <CheckCircle size={16} /> {item}
                  </span>
                ))}
              </div>
              <Link to="/register" className="inline-flex items-center gap-2 bg-white text-primary-700 font-bold py-3 px-8 rounded-xl hover:bg-gray-100 transition-colors shadow-lg">
                Get Started Free <ArrowRight size={20} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Zap className="text-primary-400" size={20} />
            <span className="text-white font-bold font-display">SportVerse AI</span>
          </div>
          <p className="text-sm mb-4">AI-Powered Sports Training Platform</p>
          <p className="text-xs">© 2026 SportVerse AI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
