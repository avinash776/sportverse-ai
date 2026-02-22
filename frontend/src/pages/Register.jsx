// ==================================================
// SportVerse AI - Registration Page
// ==================================================

import { motion } from 'framer-motion';
import { Eye, EyeOff, Lock, Mail, User, Zap } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('player');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password.length < 6) {
      return;
    }
    setLoading(true);
    const result = await register(email, password, name, role);
    if (result.success) navigate('/dashboard');
    setLoading(false);
  };

  const handleGoogleSignup = async () => {
    setLoading(true);
    const result = await loginWithGoogle();
    if (result.success) navigate('/dashboard');
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side  */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-sport-green via-sport-blue to-primary-600 items-center justify-center p-12 relative overflow-hidden">
        {/* Background sport image */}
        <div className="absolute inset-0 opacity-15">
          <img src="https://images.unsplash.com/photo-1517466787929-bc90951d0974?w=800&h=1000&fit=crop" alt="" className="w-full h-full object-cover" />
        </div>
        <div className="relative z-10 text-white text-center">
          <Zap size={60} className="mx-auto mb-6 animate-float" />
          <h2 className="text-4xl font-bold font-display mb-4">Join the Revolution!</h2>
          <p className="text-lg opacity-90 max-w-md">
            Start your AI-powered sports training journey today. Free forever for basic features.
          </p>
          <div className="mt-8 grid grid-cols-2 gap-4 max-w-sm mx-auto text-sm">
            {['AI Video Analysis', 'Custom Training Plans', 'Community Access', 'Coach Connections'].map((f) => (
              <div key={f} className="bg-white/10 rounded-xl px-3 py-2">{f}</div>
            ))}
          </div>
        </div>
      </div>

      {/* Right side - form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <motion.div
          className="w-full max-w-md"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <div className="text-center mb-8">
            <div className="lg:hidden flex items-center justify-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-sport-blue flex items-center justify-center">
                <Zap className="text-white" size={22} />
              </div>
              <span className="text-2xl font-bold font-display gradient-text">SportVerse AI</span>
            </div>
            <h1 className="text-3xl font-bold font-display text-gray-900">Create Account</h1>
            <p className="text-gray-500 mt-2">Start your training journey today</p>
          </div>

          {/* Google Sign Up Button */}
          <button
            onClick={handleGoogleSignup}
            disabled={loading}
            className="flex items-center justify-center gap-3 w-full py-3 px-4 border-2 border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all font-medium text-gray-700 mb-6 disabled:opacity-50"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Sign up with Google
          </button>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200"></div></div>
            <div className="relative flex justify-center text-sm"><span className="px-3 bg-white text-gray-500">or register with email</span></div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                  placeholder="Your full name" className="input-field pl-10" required />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com" className="input-field pl-10" required />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input type={showPassword ? 'text' : 'password'} value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 6 characters" className="input-field pl-10 pr-10" required minLength={6} />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Role Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">I am a...</label>
              <div className="flex gap-3">
                <button type="button" onClick={() => setRole('player')}
                  className={`flex-1 py-3 px-4 rounded-xl border-2 text-sm font-semibold transition-all ${
                    role === 'player' ? 'border-sport-green bg-sport-green/10 text-sport-green' : 'border-gray-200 text-gray-500 hover:border-gray-300'
                  }`}>
                  🏃 Player
                </button>
                <button type="button" onClick={() => setRole('coach')}
                  className={`flex-1 py-3 px-4 rounded-xl border-2 text-sm font-semibold transition-all ${
                    role === 'coach' ? 'border-sport-orange bg-sport-orange/10 text-sport-orange' : 'border-gray-200 text-gray-500 hover:border-gray-300'
                  }`}>
                  🏆 Coach
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full py-3 disabled:opacity-50">
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-600 font-semibold hover:underline">Sign in</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
