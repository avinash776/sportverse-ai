// ==================================================
// SportVerse AI - Google OAuth Callback Handler
// ==================================================

import { Loader2, Zap } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AuthCallback() {
  const [searchParams] = useSearchParams();
  const { handleGoogleCallback } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      handleGoogleCallback(token).then((result) => {
        if (result.success) {
          navigate('/dashboard');
        } else {
          setError(result.error || 'Authentication failed');
          setTimeout(() => navigate('/login'), 3000);
        }
      });
    } else {
      setError('No authentication token received');
      setTimeout(() => navigate('/login'), 3000);
    }
  }, []); // eslint-disable-line

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-sport-blue flex items-center justify-center mx-auto mb-6">
          <Zap className="text-white" size={32} />
        </div>
        {error ? (
          <>
            <h2 className="text-xl font-bold text-red-600 mb-2">Authentication Error</h2>
            <p className="text-gray-500">{error}</p>
            <p className="text-sm text-gray-400 mt-2">Redirecting to login...</p>
          </>
        ) : (
          <>
            <Loader2 className="animate-spin text-primary-500 mx-auto mb-4" size={32} />
            <h2 className="text-xl font-bold text-gray-900 mb-2">Authenticating...</h2>
            <p className="text-gray-500">Please wait while we verify your account.</p>
          </>
        )}
      </div>
    </div>
  );
}
