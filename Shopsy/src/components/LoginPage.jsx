import React, { useState } from 'react';
import { Eye, EyeOff, XCircle, X } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import { loginUser, registerUser } from '../Service.js/AuthService';
import AnimatedBear from './AnimatedBear';

const LoginPage = ({ onLogin }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showForgotPwd, setShowForgotPwd] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotMsg, setForgotMsg] = useState({ type: '', text: '' });

  const handleGoogleSuccess = (credentialResponse) => {
    setGoogleLoading(true);
    try {
      const decoded = jwtDecode(credentialResponse.credential);
      const user = {
        token: credentialResponse.credential,
        username: decoded.name || decoded.email.split('@')[0],
        email: decoded.email,
        role: 'user',
        name: decoded.name,
        picture: decoded.picture
      };
      // For Google Login, we typically get the token and user info
      // If your backend needs to verify the token, do it here
      onLogin({ data: { 
        id: decoded.sub, // Added unique Google subject ID
        token: credentialResponse.credential, 
        username: decoded.name, 
        email: decoded.email, 
        role: 'user' 
      }});
    } catch (err) {
      console.error('Google decode error:', err);
      setError('Failed to authenticate with Google.');
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleGoogleError = () => {
    setError('Google Sign-In failed. Please try again.');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isRegistering) {
        if (email && password && name && regUsername) {
          await registerUser({ name, username: regUsername, email, phone, password });
          setIsRegistering(false);
          setPassword('');
          setRegUsername('');
          setName('');
          setPhone('');
          setEmail('');
          alert('Account created successfully! Please sign in.');
        }
      } else {
        if (username && password) {
          const user = await loginUser(username, password);
          onLogin(user);
        }
      }
    } catch (err) {
      if (err.message) {
        setError(err.message);
      } else {
        setError(isRegistering ? 'Registration failed. User already exists or invalid data.' : 'Invalid username or password. Please check your credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setForgotLoading(true);
    setForgotMsg({ type: '', text: '' });
    try {
      const res = await fetch('/api/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail })
      });
      const data = await res.json();
      if (res.ok) {
        setForgotMsg({ type: 'success', text: data.message });
        setTimeout(() => {
          setShowForgotPwd(false);
          setForgotEmail('');
          setForgotMsg({ type: '', text: '' });
        }, 3000);
      } else {
        setForgotMsg({ type: 'error', text: data.message || 'Something went wrong.' });
      }
    } catch (err) {
      setForgotMsg({ type: 'error', text: 'Failed to connect to server.' });
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f0f4f8] flex items-center justify-center p-4 font-sans">
      <div className="bg-white rounded-[24px] shadow-2xl w-full max-w-5xl flex overflow-hidden min-h-[600px]">
        {/* Left Side: Illustration */}
        <div className="hidden md:block w-1/2 relative bg-white p-2">
          <div className="w-full h-full rounded-[20px] overflow-hidden relative border border-slate-100 shadow-sm">
            <AnimatedBear color={isRegistering ? 'red' : 'white'} />
          </div>
        </div>

        {/* Right Side: Login/Register Form */}
        <div className="w-full md:w-1/2 p-8 md:p-16 flex flex-col items-center justify-center bg-white">
          <div className="w-full max-w-sm">
            {/* Logo */}
            <div className="flex flex-col items-center mb-8">
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center mb-2 shadow-sm border border-gray-100">
                <img src="/icons.svg" alt="Logo" className="w-6 h-6" onError={(e) => { e.target.style.display='none'; e.target.nextSibling.style.display='flex'; }} />
                <div className="w-6 h-6 bg-black rounded-lg hidden items-center justify-center transform rotate-45">
                  <div className="w-2.5 h-2.5 bg-white rounded-full"></div>
                </div>
              </div>
            </div>

            <div className="text-center mb-6">
              <h1 className="text-2xl font-black text-gray-900 mb-2 tracking-tight">
                {isRegistering ? "CREATE ACCOUNT" : "WELCOME BACK"}
              </h1>
              <p className="text-gray-400 text-xs font-medium">
                {isRegistering ? "Enter your details to create a new account" : "Enter your email and password to access your account"}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {isRegistering && (
                <>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-700 ml-1">Full Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-4 py-3 bg-[#f8fafc] border border-transparent rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 focus:bg-white transition-all text-sm font-medium"
                      placeholder="Enter your full name"
                      required={isRegistering}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-700 ml-1">Username</label>
                    <input
                      type="text"
                      value={regUsername}
                      onChange={(e) => setRegUsername(e.target.value)}
                      className="w-full px-4 py-3 bg-[#f8fafc] border border-transparent rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 focus:bg-white transition-all text-sm font-medium"
                      placeholder="Choose a username"
                      required={isRegistering}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-700 ml-1">Phone Number (Optional)</label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-4 py-3 bg-[#f8fafc] border border-transparent rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 focus:bg-white transition-all text-sm font-medium"
                      placeholder="Enter your phone number"
                    />
                  </div>
                </>
              )}

              {isRegistering ? (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700 ml-1">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 bg-[#f8fafc] border border-transparent rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 focus:bg-white transition-all text-sm font-medium"
                    placeholder="Enter your email"
                    required
                  />
                </div>
              ) : (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700 ml-1">Username</label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full px-4 py-3 bg-[#f8fafc] border border-transparent rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 focus:bg-white transition-all text-sm font-medium"
                    placeholder="Enter your username"
                    required
                  />
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700 ml-1">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-[#f8fafc] border border-transparent rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 focus:bg-white transition-all text-sm font-medium"
                    placeholder="Enter your password"
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

              {!isRegistering && (
                <div className="flex items-center justify-between px-1">
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <div className="relative flex items-center justify-center">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="peer appearance-none w-4 h-4 border-2 border-gray-200 rounded-md checked:bg-black checked:border-black transition-all"
                      />
                      <div className="absolute hidden peer-checked:block text-white text-[10px] font-bold">✓</div>
                    </div>
                    <span className="text-xs font-bold text-gray-500 group-hover:text-gray-800 transition-colors">Remember me</span>
                  </label>
                  <button 
                    type="button" 
                    onClick={() => setShowForgotPwd(true)} 
                    className="text-xs font-bold text-gray-900 hover:underline transition-colors cursor-pointer"
                  >
                    Forgot Password
                  </button>
                </div>
              )}

              <div className="space-y-3 pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#0a0a0a] text-white py-3.5 rounded-xl font-bold text-sm hover:bg-black transform active:scale-[0.98] transition-all shadow-md shadow-black/10 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? 'Please wait...' : isRegistering ? 'Create Account' : 'Sign In'}
                </button>
                
                {/* Divider */}
                <div className="flex items-center gap-3 py-1">
                  <div className="flex-1 h-px bg-gray-200"></div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">or continue with</span>
                  <div className="flex-1 h-px bg-gray-200"></div>
                </div>

                {/* Standard Google Login for Compatibility */}
                <div className="flex justify-center w-full transform hover:scale-[1.02] transition-transform">
                  <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={handleGoogleError}
                    theme="filled_black"
                    shape="pill"
                    width="100%"
                    text={isRegistering ? "signup_with" : "signin_with"}
                  />
                </div>
              </div>
            </form>

            {/* ERROR MODAL OVERLAY */}
            {error && (
              <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
                <div className="bg-white max-w-sm w-full rounded-2xl shadow-2xl overflow-hidden relative animate-in zoom-in-95 duration-200">
                  <div className="h-1.5 w-full bg-red-500"></div>
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="bg-red-100 p-2 rounded-full">
                          <XCircle className="w-6 h-6 text-red-600" />
                        </div>
                        <h3 className="font-bold text-gray-900 text-lg">Authentication Error</h3>
                      </div>
                      <button onClick={() => setError('')} className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-100">
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                    <p className="text-gray-600 text-sm font-medium leading-relaxed pl-1">
                      {error}
                    </p>
                    <button 
                      onClick={() => setError('')}
                      className="mt-6 w-full py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold rounded-xl transition-colors"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* FORGOT PASSWORD MODAL */}
            {showForgotPwd && (
              <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
                <div className="bg-white max-w-sm w-full rounded-[32px] shadow-2xl overflow-hidden relative animate-in zoom-in-95 duration-300 border border-gray-100">
                  <div className="h-2 w-full bg-gradient-to-r from-[#1b2559] via-[#2563eb] to-[#1b2559]"></div>
                  <div className="p-10">
                    <div className="flex items-center justify-between mb-8">
                      <div>
                        <h3 className="font-black text-gray-900 text-xl uppercase tracking-tighter">Recover Access</h3>
                        <div className="h-1 w-8 bg-blue-600 rounded-full mt-1"></div>
                      </div>
                      <button onClick={() => setShowForgotPwd(false)} className="p-2 text-gray-400 hover:text-gray-900 transition-colors bg-gray-50 rounded-xl">
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                    
                    <p className="text-gray-500 text-xs font-bold mb-8 leading-relaxed">
                      Lost your keys? Enter your registered email address and we'll transmit a secure reset link to your inbox.
                    </p>

                    <form onSubmit={handleForgotPassword} className="space-y-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Account Email</label>
                        <div className="relative group">
                          <input
                            type="email"
                            value={forgotEmail}
                            onChange={(e) => setForgotEmail(e.target.value)}
                            className="w-full pl-4 pr-4 py-4 bg-[#f8fafc] border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-600/10 focus:bg-white focus:border-blue-600/30 transition-all text-sm font-bold text-gray-800"
                            placeholder="name@example.com"
                            required
                          />
                        </div>
                      </div>

                      {forgotMsg.text && (
                        <div className={`p-4 rounded-2xl flex items-center justify-center gap-2 animate-in slide-in-from-top-2 duration-300 ${forgotMsg.type === 'success' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-red-50 text-red-500 border border-red-100'}`}>
                          <p className="text-xs font-black text-center">
                            {forgotMsg.text}
                          </p>
                        </div>
                      )}

                      <button
                        type="submit"
                        disabled={forgotLoading}
                        className="w-full bg-[#1b2559] text-white py-4 rounded-2xl font-black text-sm hover:bg-black transform active:scale-[0.98] transition-all shadow-xl shadow-blue-900/10 disabled:opacity-60 flex items-center justify-center gap-2"
                      >
                        {forgotLoading ? (
                           <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        ) : 'Transmit Reset Link'}
                      </button>
                      
                      <button
                        type="button"
                        onClick={() => setShowForgotPwd(false)}
                        className="w-full py-2 text-gray-400 hover:text-gray-900 font-bold text-xs transition-colors mt-2"
                      >
                        Return to sign in
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-8 text-center">
              <p className="text-xs text-gray-500 font-bold">
                {isRegistering ? "Already have an account?" : "Don't have an account?"} 
                <button 
                  type="button" 
                  onClick={() => setIsRegistering(!isRegistering)} 
                  className="text-black hover:underline underline-offset-4 ml-1"
                >
                  {isRegistering ? "Sign in" : "Sign up"}
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
