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
  const [showRegSuccess, setShowRegSuccess] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  const loginImages = [
    '/product login 1.png',
    '/product login 2.png',
    '/product login 3.png'
  ];

  const registerImages = [
    '/register login 1.png',
    '/register login 2.png'
  ];

  const activeImages = isRegistering ? registerImages : loginImages;

  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % activeImages.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [activeImages.length]);

  const handleGoogleSuccess = (credentialResponse) => {
    setGoogleLoading(true);
    try {
      const decoded = jwtDecode(credentialResponse.credential);
      onLogin({
        data: {
          id: decoded.sub,
          token: credentialResponse.credential,
          username: decoded.name,
          email: decoded.email,
          role: 'user'
        }
      });
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
          setEmail('');
          setShowRegSuccess(true);
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
    <div 
      className="min-h-screen flex items-center justify-center p-4 font-sans text-white overflow-hidden relative"
      style={{
        backgroundImage: 'url("/background.png")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      <div className="bg-[#1e293b]/60 rounded-[40px] shadow-2xl w-full max-w-6xl flex overflow-hidden min-h-[700px] border border-white/20 relative z-10 backdrop-brightness-75">
        {/* Left Side: Carousel */}
        <div className="hidden md:flex w-[55%] relative overflow-hidden items-center justify-center bg-black/10">
          {activeImages.map((img, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-all duration-1000 ease-in-out transform ${
                index === currentSlide ? 'opacity-100 scale-100' : 'opacity-0 scale-110 pointer-events-none'
              } flex items-center justify-center`}
            >
              <img
                src={img}
                alt={`Slide ${index}`}
                className="w-full h-full object-cover object-center"
              />
            </div>
          ))}
          
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-10">
            {activeImages.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  index === currentSlide ? 'w-8 bg-blue-500' : 'w-2 bg-white/30 hover:bg-white/50'
                }`}
              />
            ))}
          </div>

          <div className="absolute top-8 left-8 z-10 bg-white/10 backdrop-blur-md border border-white/10 px-4 py-2 rounded-2xl flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
            <span className="text-xs font-bold tracking-widest uppercase">Premium Experience</span>
          </div>
        </div>

        {/* Right Side: Form Container */}
        <div className={`w-full md:w-[45%] flex flex-col items-center justify-center bg-transparent relative ${isRegistering ? 'p-6 md:p-8' : 'p-8 md:p-12'}`}>
          <div className="w-full max-w-md">
            <div className={`flex flex-col items-center ${isRegistering ? 'mb-4' : 'mb-10'}`}>
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-2 shadow-lg shadow-blue-500/20">
                <img src="/icons.svg" alt="Logo" className="w-8 h-8 brightness-0 invert" onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
                <div className="w-8 h-8 bg-white rounded-lg hidden items-center justify-center transform rotate-45">
                  <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                </div>
              </div>
            </div>

            <div className={`text-left ${isRegistering ? 'mb-4' : 'mb-8'}`}>
              <h1 className={`font-bold text-white tracking-tight ${isRegistering ? 'text-2xl mb-1' : 'text-4xl mb-3'}`}>
                {isRegistering ? "Join Us" : "Welcome Back"}
              </h1>
              <p className="text-slate-400 text-sm font-medium leading-relaxed">
                {isRegistering 
                  ? "Start your journey with our premium retail management platform." 
                  : "See your growth and get consulting support with our advanced dashboard."}
              </p>
            </div>

            <div className={isRegistering ? 'mb-4' : 'mb-8'}>
              <div className="flex justify-center w-full transform hover:scale-[1.01] transition-all duration-300">
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

            <div className={`relative flex items-center gap-4 ${isRegistering ? 'mb-4' : 'mb-8'}`}>
              <div className="flex-1 h-px bg-slate-700"></div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Or with email</span>
              <div className="flex-1 h-px bg-slate-700"></div>
            </div>

            <form onSubmit={handleSubmit} className={isRegistering ? "space-y-2.5" : "space-y-5"}>
              {isRegistering && (
                <>
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-slate-400 ml-4 uppercase tracking-wider">Full Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-6 py-3.5 bg-slate-800/50 border border-slate-700 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-slate-800 transition-all text-sm font-medium text-white placeholder:text-slate-500"
                      placeholder="Your full name"
                      required={isRegistering}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-slate-400 ml-4 uppercase tracking-wider">Username</label>
                    <input
                      type="text"
                      value={regUsername}
                      onChange={(e) => setRegUsername(e.target.value)}
                      className="w-full px-6 py-3.5 bg-slate-800/50 border border-slate-700 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-slate-800 transition-all text-sm font-medium text-white placeholder:text-slate-500"
                      placeholder="Choose a username"
                      required={isRegistering}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-slate-400 ml-4 uppercase tracking-wider">Phone Number</label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-6 py-3.5 bg-slate-800/50 border border-slate-700 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-slate-800 transition-all text-sm font-medium text-white placeholder:text-slate-500"
                      placeholder="Your phone number"
                    />
                  </div>
                </>
              )}

              {isRegistering ? (
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-400 ml-4 uppercase tracking-wider">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-6 py-3.5 bg-slate-800/50 border border-slate-700 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-slate-800 transition-all text-sm font-medium text-white placeholder:text-slate-500"
                    placeholder="mail@website.com"
                    required
                  />
                </div>
              ) : (
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-400 ml-4 uppercase tracking-wider">Username</label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full px-6 py-3.5 bg-slate-800/50 border border-slate-700 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-slate-800 transition-all text-sm font-medium text-white placeholder:text-slate-500"
                    placeholder="Enter your username"
                    required
                  />
                </div>
              )}

              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-400 ml-4 uppercase tracking-wider">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-6 py-3.5 bg-slate-800/50 border border-slate-700 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-slate-800 transition-all text-sm font-medium text-white placeholder:text-slate-500"
                    placeholder="Min. 8 character"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-500 hover:text-blue-400 transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {!isRegistering && (
                <div className="flex items-center justify-between px-2">
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <div className="relative flex items-center justify-center">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="peer appearance-none w-4 h-4 border border-slate-600 rounded-md checked:bg-blue-500 checked:border-blue-500 transition-all"
                      />
                      <div className="absolute hidden peer-checked:block text-white text-[10px] font-bold">✓</div>
                    </div>
                    <span className="text-xs font-semibold text-slate-400 group-hover:text-slate-300 transition-colors">Remember me</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowForgotPwd(true)}
                    className="text-xs font-bold text-blue-400 hover:text-blue-300 transition-colors cursor-pointer"
                  >
                    Forgot Password?
                  </button>
                </div>
              )}

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 text-white py-4 rounded-full font-bold text-sm hover:bg-blue-500 transform active:scale-[0.98] transition-all shadow-lg shadow-blue-600/20 disabled:opacity-60 disabled:cursor-not-allowed uppercase tracking-widest"
                >
                  {loading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Processing...</span>
                    </div>
                  ) : isRegistering ? 'Create Account' : 'Login'}
                </button>
              </div>
            </form>

            <div className={`${isRegistering ? 'mt-4 mb-10' : 'mt-12'} text-center`}>
              <p className="text-sm text-slate-400 font-medium">
                {isRegistering ? "Already have an account?" : "Don't have an account?"}
                <button
                  type="button"
                  onClick={() => {
                    setIsRegistering(!isRegistering);
                    setCurrentSlide(0);
                  }}
                  className="text-blue-400 hover:text-blue-300 ml-2 font-bold transition-colors relative z-20"
                >
                  {isRegistering ? "Sign in" : "Sign up"}
                </button>
              </p>
            </div>
          </div>
          
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-full text-center pointer-events-none">
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.3em]">
              ©2024 Shopsy Premium. All rights reserved.
            </p>
          </div>
        </div>

        {error && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
            <div className="bg-[#1e293b] max-w-sm w-full rounded-3xl shadow-2xl overflow-hidden relative border border-slate-700 animate-in fade-in zoom-in duration-300">
              <div className="h-1.5 w-full bg-red-500"></div>
              <div className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="bg-red-500/10 p-3 rounded-2xl">
                      <XCircle className="w-6 h-6 text-red-500" />
                    </div>
                    <h3 className="font-bold text-white text-lg tracking-tight">System Error</h3>
                  </div>
                  <button onClick={() => setError('')} className="text-slate-400 hover:text-white transition-colors p-2 rounded-xl hover:bg-white/5">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <p className="text-slate-400 text-sm font-medium leading-relaxed mb-8">
                  {error}
                </p>
                <button
                  onClick={() => setError('')}
                  className="w-full py-4 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-2xl transition-colors uppercase text-xs tracking-widest"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        )}

        {showForgotPwd && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[100] p-4">
            <div className="bg-[#1e293b] max-w-md w-full rounded-[40px] shadow-2xl overflow-hidden relative border border-slate-700 animate-in fade-in zoom-in duration-300">
              <div className="h-2 w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600"></div>
              <div className="p-10">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h3 className="font-bold text-white text-2xl tracking-tight">Recover Access</h3>
                    <div className="h-1 w-10 bg-blue-500 rounded-full mt-2"></div>
                  </div>
                  <button onClick={() => setShowForgotPwd(false)} className="p-3 text-slate-400 hover:text-white transition-colors bg-white/5 rounded-2xl">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <p className="text-slate-400 text-sm font-medium mb-10 leading-relaxed">
                  Enter your email address and we'll send you a secure link to reset your password.
                </p>

                <form onSubmit={handleForgotPassword} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.15em] ml-4">Email Address</label>
                    <input
                      type="email"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      className="w-full px-6 py-4 bg-slate-800/50 border border-slate-700 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-slate-800 focus:border-blue-500 transition-all text-sm font-medium text-white placeholder:text-slate-600"
                      placeholder="name@example.com"
                      required
                    />
                  </div>

                  {forgotMsg.text && (
                    <div className={`p-4 rounded-2xl text-center text-xs font-bold ${forgotMsg.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                      {forgotMsg.text}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={forgotLoading}
                    className="w-full bg-blue-600 text-white py-4 rounded-full font-bold text-sm hover:bg-blue-500 transform active:scale-[0.98] transition-all shadow-xl shadow-blue-900/20 disabled:opacity-60 flex items-center justify-center gap-3 uppercase tracking-widest"
                  >
                    {forgotLoading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    ) : 'Send Reset Link'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}

        {showRegSuccess && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 overflow-hidden">
            <div className="absolute inset-0 bg-[#0f172a]/60 backdrop-blur-xl animate-in fade-in duration-700"></div>
            
            {/* Falling Flowers & Leaves Animation */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden z-10">
              {[...Array(40)].map((_, i) => {
                const randomLeft = Math.random() * 100;
                const randomDuration = 5 + Math.random() * 5;
                const randomDelay = Math.random() * 5;
                const items = ['🌸', '🍂', '🍃', '🌺', '✨', '🌼'];
                const item = items[Math.floor(Math.random() * items.length)];
                
                return (
                  <div 
                    key={i} 
                    className="absolute top-[-10%] animate-falling-leaf"
                    style={{
                      left: `${randomLeft}%`,
                      animationDuration: `${randomDuration}s`,
                      animationDelay: `${randomDelay}s`,
                      fontSize: `${1 + Math.random() * 1.5}rem`,
                      opacity: 0.7 + Math.random() * 0.3
                    }}
                  >
                    {item}
                  </div>
                );
              })}
              <style>{`
                @keyframes falling-leaf {
                  0% { transform: translateY(-10vh) translateX(-20px) rotate(0deg); opacity: 1; }
                  50% { transform: translateY(50vh) translateX(20px) rotate(180deg); opacity: 1; }
                  100% { transform: translateY(110vh) translateX(-20px) rotate(360deg); opacity: 0; }
                }
                .animate-falling-leaf {
                  animation: falling-leaf linear infinite;
                }
              `}</style>
            </div>

            <div className="relative bg-[#1e293b] rounded-[48px] shadow-2xl border border-white/5 p-12 max-w-md w-full text-center animate-in zoom-in-95 duration-500 z-20">
              <div className="w-24 h-24 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-8 relative">
                <div className="absolute inset-0 bg-blue-500/20 rounded-full animate-ping opacity-20"></div>
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
              <h2 className="text-3xl font-bold text-white mb-4 tracking-tight">Welcome Aboard!</h2>
              <p className="text-slate-400 font-medium text-sm leading-relaxed mb-10 px-4">
                Your account has been successfully created. Get ready for a premium experience.
              </p>
              <button
                onClick={() => {
                  setShowRegSuccess(false);
                  setIsRegistering(false);
                }}
                className="w-full bg-blue-600 text-white py-5 rounded-3xl font-bold text-sm hover:bg-blue-500 transform active:scale-[0.95] transition-all shadow-xl shadow-blue-900/20 uppercase tracking-widest"
              >
                Start Exploring
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoginPage;
