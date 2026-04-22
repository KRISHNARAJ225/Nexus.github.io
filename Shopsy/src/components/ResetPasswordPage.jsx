import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, CheckCircle2, AlertCircle, ArrowLeft } from 'lucide-react';
import AnimatedBear from './AnimatedBear';

const ResetPasswordPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState({ type: '', message: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setResult({ type: 'error', message: 'Passwords do not match.' });
      return;
    }
    if (password.length < 6) {
      setResult({ type: 'error', message: 'Password must be at least 6 characters.' });
      return;
    }

    setLoading(true);
    setResult({ type: '', message: '' });
    try {
      const res = await fetch('/api/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword: password })
      });
      const data = await res.json();
      if (res.ok) {
        setResult({ type: 'success', message: 'Password reset successful! You can now log in.' });
        setTimeout(() => navigate('/'), 3000);
      } else {
        setResult({ type: 'error', message: data.message || 'Failed to reset password.' });
      }
    } catch (err) {
      setResult({ type: 'error', message: 'Failed to connect to server.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f0f4f8] flex items-center justify-center p-4 font-sans">
      <div className="bg-white rounded-[24px] shadow-2xl w-full max-w-lg overflow-hidden flex flex-col">
        <div className="h-2 w-full bg-[#1b2559]"></div>
        <div className="p-8 md:p-12">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-black text-gray-900 mb-2 tracking-tight uppercase">Reset Password</h1>
            <p className="text-gray-400 text-xs font-medium">Please enter your new password below</p>
          </div>

          {!result.message || result.type === 'error' ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700 ml-1">New Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-[#f8fafc] border border-transparent rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1b2559]/5 focus:bg-white transition-all text-sm font-medium"
                    placeholder="Min. 6 characters"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black transition-colors"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700 ml-1">Confirm New Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-[#f8fafc] border border-transparent rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1b2559]/5 focus:bg-white transition-all text-sm font-medium"
                  placeholder="Repeat new password"
                  required
                />
              </div>

              {result.type === 'error' && (
                <div className="flex items-center gap-2 p-3 bg-red-50 text-red-600 rounded-xl text-xs font-bold border border-red-100 animate-in fade-in slide-in-from-top-1">
                  <AlertCircle size={14} />
                  {result.message}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#1b2559] text-white py-4 rounded-xl font-bold text-sm hover:opacity-90 transform active:scale-[0.98] transition-all shadow-lg shadow-[#1b2559]/10 disabled:opacity-60"
              >
                {loading ? 'Updating Password...' : 'Save New Password'}
              </button>
            </form>
          ) : (
            <div className="flex flex-col items-center py-8 animate-in zoom-in-95 duration-300">
              <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mb-6">
                <CheckCircle2 size={40} className="text-emerald-500" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Success!</h2>
              <p className="text-gray-500 text-sm font-medium text-center px-6">
                {result.message}
              </p>
              <p className="text-gray-400 text-[10px] mt-8 uppercase tracking-widest font-bold">Redirecting you to login...</p>
            </div>
          )}

          <div className="mt-8 text-center border-t border-slate-50 pt-6">
            <button
              onClick={() => navigate('/')}
              className="flex items-center justify-center gap-2 text-xs font-bold text-gray-400 hover:text-[#1b2559] transition-colors mx-auto"
            >
              <ArrowLeft size={14} />
              Return to Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
