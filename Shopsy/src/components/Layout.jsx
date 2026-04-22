import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Tag,
  Package,
  ReceiptText,
  Users,
  User,
  Moon,
  Settings,
  HelpCircle,
  Search,
  Bell,
  LogOut,
  ChevronRight,
  Plus,
  Menu,
  Maximize,
  Sun,
  Calendar,
  Eye,
  EyeOff,
  Lock,
  X,
  Check,
  Mail,
  Phone,
  AtSign,
  Edit2,
  ShieldCheck,
  Shield,
  AlertCircle,
} from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { changePassword } from '../Service.js/AuthService';
// import { updateUser } from '../Service.js/UserService'; // Removed redundant import to use context version

const Layout = ({ children, activePage, navigate, onLogout, currentUser, onUserUpdate, accentColor = '#1b2559', zoomLevel = 100 }) => {
  const [darkMode, setDarkMode] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [toast, setToast] = useState(null);

  // User Profile Modal state
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileTab, setProfileTab] = useState('info'); // 'info' or 'password'
  const [pwdForm, setPwdForm] = useState({ current: '', next: '', confirm: '' });
  const [showPwd, setShowPwd] = useState({ current: false, next: false, confirm: false });
  const [pwdLoading, setPwdLoading] = useState(false);
  const [pwdError, setPwdError] = useState('');
  const [pwdSuccess, setPwdSuccess] = useState(false);

  // Edit Profile state
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({ name: '', phone: '', email: '', username: '' });
  const [updateLoading, setUpdateLoading] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);

  const { products, customers, notifications, token, addNotification, registeredUsers, fetchUsersPage, updateUser } = useData();

  useEffect(() => {
    if (notifications?.length > 0) {
      setToast(notifications[0]);
      const timer = setTimeout(() => setToast(null), 10000); // 10s timeout as requested
      return () => clearTimeout(timer);
    }
  }, [notifications]);

  // Close notifications after 10s
  useEffect(() => {
    let timer;
    if (showNotifications) {
      timer = setTimeout(() => setShowNotifications(false), 10000);
    }
    return () => clearTimeout(timer);
  }, [showNotifications]);

  // Close profile menu on outside click
  useEffect(() => {
    const handler = (e) => {
      if (!e.target.closest('#profile-menu-root')) setShowProfileMenu(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setShowSearchDropdown(e.target.value.length > 0);
  };

  const filteredSearchMap = {
    products: products.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 3),
    customers: customers.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 3),
  };

  const handleSearchResultClick = (type, item) => {
    setSearchQuery(item.name);
    setShowSearchDropdown(false);
    navigate(type === 'product' ? '/products' : '/customer');
  };

  // Change password handler
  const handleChangePwd = async (e) => {
    e.preventDefault();
    setPwdError('');
    if (pwdForm.next !== pwdForm.confirm) {
      setPwdError('New passwords do not match.');
      return;
    }
    if (pwdForm.next.length < 6) {
      setPwdError('New password must be at least 6 characters.');
      return;
    }
    setPwdLoading(true);
    try {
      await changePassword(token, pwdForm.current, pwdForm.next);
      setPwdSuccess(true);
      addNotification('Password changed successfully');
      setTimeout(() => {
        setPwdForm({ current: '', next: '', confirm: '' });
        setPwdSuccess(false);
      }, 1800);
    } catch (err) {
      setPwdError(err.message || 'Failed to change password. Please check your current password.');
    } finally {
      setPwdLoading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();

    // Try to resolve user ID from multiple sources
    if (!userId) {
      // Robust resolution: check registeredUsers carefully
      const matched = registeredUsers?.find(u =>
        String(u.id) === String(currentUser?.id) ||
        (u.email && u.email?.toLowerCase() === currentUser?.email?.toLowerCase()) ||
        (u.username && u.username?.toLowerCase() === currentUser?.name?.toLowerCase()) ||
        (u.name && u.name?.toLowerCase() === currentUser?.name?.toLowerCase())
      );
      userId = matched?.id;
    }

    if (!userId) {
      // One last try: if there's only one user and we are logged in, maybe that's us?
      if (registeredUsers?.length === 1) {
         userId = registeredUsers[0].id;
      }
    }

    if (!userId) {
      addNotification('Error: User ID not found. Please refresh or contact admin.');
      setUpdateLoading(false);
      return;
    }

    setUpdateLoading(true);
    try {
      await updateUser(userId, profileForm);
      const updatedUser = { ...currentUser, ...profileForm, id: userId };
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
      if (onUserUpdate) onUserUpdate(updatedUser);
      addNotification('Profile updated successfully');
      setIsEditingProfile(false);
      setProfileSaved(true);
      setTimeout(() => setProfileSaved(false), 3000);
    } catch (err) {
      addNotification('Failed to update profile: ' + (err?.message || 'Please try again.'));
    } finally {
      setUpdateLoading(false);
    }
  };

  const openProfileModal = (tab = 'info') => {
    setShowProfileMenu(false);
    setProfileTab(tab);
    setProfileForm({
      name: currentUser?.name || '',
      phone: currentUser?.phone || '',
      email: currentUser?.email || '',
      username: currentUser?.username || ''
    });
    setIsEditingProfile(false);
    setProfileSaved(false);
    setShowProfileModal(true);
    // Ensure registeredUsers is populated so we can resolve userId
    fetchUsersPage();
  };

  const isAdmin = ['meera', 'krishh'].includes(currentUser?.name?.toLowerCase()) || currentUser?.role?.toLowerCase() === 'admin';

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    ...(isAdmin ? [
      { id: 'division', label: 'Division', icon: Tag },
    ] : []),
    { id: 'products', label: 'Product', icon: Package },
    { id: 'orders', label: 'Transaction', icon: ReceiptText },
    { id: 'stocks', label: 'Stocks', icon: Package },
  ];

  const othersItems = [
    { id: 'customer', label: 'Customer', icon: Users },
    ...(isAdmin ? [{ id: 'user', label: 'User', icon: User }] : []),
  ];

  const preferenceItems = [
    ...(isAdmin ? [
      { id: 'calendar', label: 'Calendar', icon: Calendar },
      { id: 'settings', label: 'Settings', icon: Settings },
    ] : []),
  ];

  // Sidebar nav button helper
  const NavBtn = ({ item, onClickOverride }) => {
    const Icon = item.icon;
    const isActive = activePage === item.id;
    return (
      <button
        key={item.id}
        onClick={onClickOverride || (() => navigate(`/${item.id}`))}
        className={`w-full flex items-center ${isSidebarCollapsed ? 'justify-center' : 'justify-between'} px-4 py-3 rounded-xl transition-all duration-200 group cursor-pointer ${isActive
            ? 'text-white shadow-md'
            : darkMode
              ? 'text-slate-400 hover:bg-slate-800 hover:text-white'
              : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
          }`}
        style={isActive ? { backgroundColor: accentColor } : {}}
      >
        <div className="flex items-center gap-3">
          <Icon className={`w-5 h-5 transition-colors duration-200 ${isActive ? 'text-white' : 'group-hover:text-current'}`} />
          {!isSidebarCollapsed && <span className="text-[14px] font-medium tracking-wide whitespace-nowrap">{item.label}</span>}
        </div>
      </button>
    );
  };

  const pwdInputStyle = `w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 text-sm font-medium transition-colors ${darkMode ? 'bg-slate-800 border-slate-600 text-white focus:ring-blue-500/30' : 'bg-[#f8fafc] border-transparent text-gray-800 focus:ring-black/5 focus:bg-white'
    }`;

  return (
    <div className={`flex min-h-screen ${darkMode ? 'bg-[#1e1e2d] text-white' : 'bg-[#f4f7fe] text-slate-800'}`}>
      {/* Sidebar */}
      <aside className={`${isSidebarCollapsed ? 'w-20' : 'w-[260px]'} flex flex-col fixed h-full z-30 transition-all duration-300 ${darkMode ? 'bg-[#151521] border-slate-800' : 'bg-white border-slate-100 border-r shadow-sm'}`}>
        <div className={`relative h-20 flex items-center border-b border-transparent overflow-hidden ${isSidebarCollapsed ? 'justify-center' : 'px-0'}`}>
          <div className={`flex items-center h-full w-full ${isSidebarCollapsed ? 'hidden' : 'block'}`}>
            <div className="relative group cursor-pointer w-full h-full overflow-hidden">
              <img 
                src="/sidbar.png" 
                alt="Logo" 
                className="transition-all duration-700 logo-wave w-full h-full object-cover"
              />
            </div>
          </div>


          <button
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className={`absolute right-4 p-2 rounded-lg ${darkMode ? 'text-white/70 hover:bg-white/10 hover:text-white' : 'text-slate-500 hover:bg-slate-100'} transition-colors z-10 shadow-sm backdrop-blur-sm bg-white/5`}
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>


        <div className="flex-1 overflow-y-auto py-6 px-4 custom-scrollbar">
          {/* MENU */}
          <div className="mb-8">
            {!isSidebarCollapsed && <p className="px-4 text-[11px] font-semibold text-slate-400 uppercase tracking-widest mb-3">MENU</p>}
            <div className="space-y-1">
              {menuItems.map(item => <NavBtn key={item.id} item={item} />)}
            </div>
          </div>

          {/* OTHERS */}
          <div className="mb-8">
            {!isSidebarCollapsed && <p className="px-4 text-[11px] font-semibold text-slate-400 uppercase tracking-widest mb-3">OTHERS</p>}
            <div className="space-y-1">
              {othersItems.map(item => <NavBtn key={item.id} item={item} />)}
            </div>
          </div>

          {/* PREFERENCES */}
          <div>
            {!isSidebarCollapsed && <p className="px-4 text-[11px] font-semibold text-slate-400 uppercase tracking-widest mb-3">PREFERENCES</p>}
            <div className="space-y-1">
              {preferenceItems.map(item => <NavBtn key={item.id} item={item} />)}
              {/* Dark Mode Toggle */}
              <div
                onClick={() => isSidebarCollapsed && setDarkMode(!darkMode)}
                className={`w-full flex items-center ${isSidebarCollapsed ? 'justify-center cursor-pointer' : 'justify-between'} px-4 py-3 rounded-xl group ${darkMode ? 'hover:bg-slate-800' : 'hover:bg-slate-50'} transition-all duration-200`}
              >
                <div className={`flex items-center gap-3 ${darkMode ? 'text-slate-400 group-hover:text-white' : 'text-slate-500 group-hover:text-slate-800'}`}>
                  <Moon className="w-5 h-5 group-hover:text-current" />
                  {!isSidebarCollapsed && <span className="text-[14px] font-medium tracking-wide">Dark Mode</span>}
                </div>
                {!isSidebarCollapsed && (
                  <button
                    onClick={() => setDarkMode(!darkMode)}
                    className={`w-9 h-5 rounded-full relative transition-colors duration-300`}
                    style={{ backgroundColor: darkMode ? accentColor : '#e2e8f0' }}
                  >
                    <div className={`w-4 h-4 rounded-full bg-white absolute top-0.5 transition-transform duration-300 shadow-sm ${darkMode ? 'translate-x-[18px]' : 'left-0.5'}`}></div>
                  </button>
                )}
              </div>


              <button
                onClick={() => navigate('/help')}
                className={`w-full flex items-center ${isSidebarCollapsed ? 'justify-center' : 'justify-between'} px-4 py-3 rounded-xl transition-all duration-200 group cursor-pointer ${darkMode ? 'text-slate-400 hover:bg-slate-800 hover:text-white' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'}`}
              >
                <div className="flex items-center gap-3">
                  <HelpCircle className="w-5 h-5 group-hover:text-current" />
                  {!isSidebarCollapsed && <span className="text-[14px] font-medium tracking-wide whitespace-nowrap">Help</span>}
                </div>
              </button>

              <button
                onClick={onLogout}
                className={`w-full flex items-center ${isSidebarCollapsed ? 'justify-center' : 'justify-between'} px-4 py-3 rounded-xl transition-all duration-200 group ${darkMode ? 'text-red-400 hover:bg-slate-800 hover:text-red-300' : 'text-red-500 hover:bg-red-50'}`}
              >
                <div className="flex items-center gap-3">
                  <LogOut className="w-5 h-5 group-hover:text-current" />
                  {!isSidebarCollapsed && <span className="text-[14px] font-medium tracking-wide whitespace-nowrap">Log Out</span>}
                </div>
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className={`flex-1 ${isSidebarCollapsed ? 'ml-20' : 'ml-[260px]'} flex flex-col min-h-screen transition-all duration-300`}>
        {/* Top Header */}
        <header className={`h-20 transition-all duration-300 ${darkMode ? 'bg-[#1e1e2d]/90' : 'bg-[#f4f7fe]/90'} backdrop-blur-xl px-8 flex items-center justify-between sticky top-0 z-20`}>
          <div className="flex items-center gap-12">
            <div>
              <p className="text-xs text-slate-400 font-medium">Welcome,</p>
              <h2 className="text-2xl font-black tracking-tight bg-clip-text text-transparent animate-pulse"
                style={{ backgroundImage: `linear-gradient(to right, ${accentColor}, ${accentColor}99)` }}>
                {currentUser?.name || 'Admin User'}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-6">
            {/* Search Bar */}
            <div className={`hidden lg:flex items-center rounded-xl shadow-sm border px-4 py-2.5 w-80 relative ${darkMode ? 'bg-[#151521] border-slate-700' : 'bg-white border-slate-100'}`}>
              <Search className="w-4 h-4 text-slate-400 mr-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="Search anything"
                className={`bg-transparent border-none outline-none text-sm w-full font-medium ${darkMode ? 'text-white' : 'text-slate-600'}`}
              />
              {showSearchDropdown && (
                <div className={`absolute top-full left-0 right-0 mt-2 rounded-xl shadow-lg border overflow-hidden z-50 ${darkMode ? 'bg-[#151521] border-slate-700' : 'bg-white border-slate-100'}`}>
                  {filteredSearchMap.products.length > 0 && (
                    <div className="py-2">
                      <p className="px-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Products</p>
                      {filteredSearchMap.products.map(p => (
                        <div key={p.id} onClick={() => handleSearchResultClick('product', p)} className={`px-4 py-2 text-sm cursor-pointer transition-colors ${darkMode ? 'hover:bg-slate-800 text-slate-200' : 'hover:text-white text-slate-700'}`} style={{ '--hover-bg': accentColor }} onMouseEnter={e => e.currentTarget.style.backgroundColor = accentColor} onMouseLeave={e => e.currentTarget.style.backgroundColor = ''}>
                          {p.name}
                        </div>
                      ))}
                    </div>
                  )}
                  {filteredSearchMap.customers.length > 0 && (
                    <div className={`py-2 border-t ${darkMode ? 'border-slate-800' : 'border-slate-100'}`}>
                      <p className="px-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Customers</p>
                      {filteredSearchMap.customers.map(c => (
                        <div key={c.id} onClick={() => handleSearchResultClick('customer', c)} className={`px-4 py-2 text-sm cursor-pointer transition-colors ${darkMode ? 'hover:bg-slate-800 text-slate-200' : 'text-slate-700'}`} onMouseEnter={e => e.currentTarget.style.backgroundColor = accentColor} onMouseLeave={e => e.currentTarget.style.backgroundColor = ''}>
                          {c.name}
                        </div>
                      ))}
                    </div>
                  )}
                  {filteredSearchMap.products.length === 0 && filteredSearchMap.customers.length === 0 && (
                    <div className="px-4 py-4 text-sm text-slate-500 text-center">No results found</div>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center gap-4">
              <button onClick={() => setDarkMode(!darkMode)} className={`relative p-2 rounded-full transition-all ${darkMode ? 'text-yellow-400 hover:bg-slate-800' : 'text-slate-400 hover:bg-slate-100'}`}>
                {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              <button
                onClick={() => !document.fullscreenElement ? document.documentElement.requestFullscreen() : document.exitFullscreen()}
                className={`hidden md:block relative p-2 rounded-full transition-all ${darkMode ? 'text-slate-400 hover:bg-slate-800' : 'text-slate-400 hover:bg-slate-100'}`}
              >
                <Maximize className="w-5 h-5" />
              </button>

              {/* Notifications */}
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className={`relative p-2 rounded-full transition-all ${darkMode ? 'text-slate-400 hover:bg-slate-800' : 'text-slate-400 hover:bg-slate-100'}`}
                >
                  <Bell className="w-5 h-5" />
                  {notifications?.length > 0 && (
                    <span className="absolute top-1 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-[#f4f7fe]"></span>
                  )}
                </button>
                {showNotifications && (
                  <div className={`absolute right-0 mt-3 w-72 rounded-xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] border py-2 z-50 ${darkMode ? 'bg-[#151521] border-slate-700' : 'bg-white border-slate-100'}`}>
                    <div className={`px-4 py-2 border-b ${darkMode ? 'border-slate-700' : 'border-slate-100'}`}>
                      <h3 className={`text-sm font-bold tracking-tight ${darkMode ? 'text-white' : 'text-slate-800'}`}>Notifications</h3>
                    </div>
                    <div className="max-h-64 overflow-y-auto custom-scrollbar">
                      {notifications?.length > 0 ? notifications.map(n => (
                        <div key={n.id} className={`px-4 py-3 border-b last:border-0 ${darkMode ? 'border-slate-800 hover:bg-slate-800/50' : 'border-slate-50 hover:bg-slate-50'} transition-colors`}>
                          <p className={`text-xs font-semibold ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>{n.message}</p>
                          <p className="text-[10px] font-medium text-slate-400 mt-1">{new Date(n.date).toLocaleDateString()} {new Date(n.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                        </div>
                      )) : (
                        <div className="px-4 py-6 text-center text-sm text-slate-400 font-medium">No new notifications</div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Profile */}
              <div className="relative" id="profile-menu-root">
                <div
                  className="flex items-center gap-3 pl-4 ml-1 border-l border-slate-200 cursor-pointer group"
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                >
                  <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-white shadow-sm group-hover:shadow-md transition-all">
                    <img
                      src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                      alt={currentUser?.name || 'User'}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="hidden sm:block">
                    <p className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-slate-800'} transition-colors`}>{currentUser?.name?.split(' ')[0] || 'Admin'}</p>
                  </div>
                </div>

                {showProfileMenu && (
                  <div className={`absolute right-0 mt-3 w-64 rounded-xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] border py-2 z-50 ${darkMode ? 'bg-[#151521] border-slate-700' : 'bg-white border-slate-100'}`}>
                    <div className={`px-4 py-3 border-b ${darkMode ? 'border-slate-700' : 'border-slate-100'} bg-slate-50/50`}>
                      <p className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-slate-800'}`}>{currentUser?.name || 'Admin User'}</p>
                      <p className={`text-xs font-medium ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{currentUser?.email || 'admin@example.com'}</p>
                      {currentUser?.phone && <p className="text-xs font-medium mt-1" style={{ color: accentColor }}>{currentUser.phone}</p>}
                    </div>
                    <div className="py-2">
                      <button
                        onClick={() => openProfileModal('info')}
                        className={`w-full text-left px-4 py-2.5 text-sm font-bold flex items-center gap-2 ${darkMode ? 'text-slate-300 hover:bg-slate-800 hover:text-white' : 'text-slate-600 hover:text-white'} transition-colors`}
                        onMouseEnter={e => e.currentTarget.style.backgroundColor = accentColor}
                        onMouseLeave={e => e.currentTarget.style.backgroundColor = ''}
                      >
                        <User className="w-4 h-4" />
                        My Profile
                      </button>
                      <button
                        onClick={() => openProfileModal('password')}
                        className={`w-full text-left px-4 py-2.5 text-sm font-bold flex items-center gap-2 ${darkMode ? 'text-slate-300 hover:bg-slate-800 hover:text-white' : 'text-slate-600 hover:text-white'} transition-colors`}
                        onMouseEnter={e => e.currentTarget.style.backgroundColor = accentColor}
                        onMouseLeave={e => e.currentTarget.style.backgroundColor = ''}
                      >
                        <Lock className="w-4 h-4" />
                        Change Password
                      </button>
                    </div>
                    <div className={`py-2 border-t ${darkMode ? 'border-slate-700' : 'border-slate-100'}`}>
                      <button
                        onClick={onLogout}
                        className={`w-full flex items-center gap-2 px-4 py-2.5 text-sm font-bold ${darkMode ? 'text-red-400 hover:bg-red-500/10' : 'text-red-600 hover:bg-red-50'} transition-colors`}
                      >
                        <LogOut className="w-4 h-4" />
                        Log Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content — zoom applied here */}
        <main className="flex-1 p-8" style={{ zoom: `${zoomLevel}%` }}>
          <div className="max-w-7xl mx-auto w-full">
            {children}
          </div>
        </main>
      </div>

      {/* ─── Premium User Profile Modal ─────────────────────────────────────────── */}
      {showProfileModal && (
        <div className="fixed inset-0 flex items-center justify-center z-[70] p-4 transition-all duration-300 backdrop-blur-md bg-black/60 animate-in fade-in duration-300">
          <div className={`relative w-full max-w-lg rounded-[32px] shadow-2xl overflow-hidden transform scale-100 transition-all duration-500 ${darkMode ? 'bg-[#151521] border border-slate-800' : 'bg-white border border-slate-100'} animate-in zoom-in-95 duration-300`}>
            {/* Accent Top Gradient */}
            <div className="h-2 w-full bg-gradient-to-r" style={{ backgroundImage: `linear-gradient(to right, ${accentColor}, #8A2BE2, ${accentColor})` }} />

            <div className="p-8">
              {/* Header */}
              <div className="flex items-start justify-between mb-8">
                <div className="flex items-center gap-5">
                  <div className="relative group shrink-0">
                    <div className="w-20 h-20 rounded-3xl overflow-hidden border-4 bg-white/10 relative z-10 transition-transform duration-500 group-hover:scale-105" style={{ borderColor: `${accentColor}30` }}>
                      <img
                        src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                        alt={currentUser?.name || 'User'}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    {/* Decorative backdrop */}
                    <div className="absolute -inset-1 rounded-3xl blur-md opacity-20 group-hover:opacity-40 transition-opacity duration-500" style={{ backgroundColor: accentColor }}></div>
                  </div>
                  <div>
                    <h2 className={`text-2xl font-black tracking-tight ${darkMode ? 'text-white' : 'text-slate-900'}`}>{currentUser?.name || 'Account Owner'}</h2>
                    <p className={`text-sm font-bold opacity-60 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{currentUser?.email || 'admin@example.com'}</p>
                    <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border shadow-sm" style={{ backgroundColor: `${accentColor}10`, color: accentColor, borderColor: `${accentColor}20` }}>
                      <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: accentColor }}></div>
                      {currentUser?.role || 'User'}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => { setShowProfileModal(false); setPwdError(''); setPwdForm({ current: '', next: '', confirm: '' }); setIsEditingProfile(false); }}
                  className={`p-2 rounded-2xl transition-all ${darkMode ? 'text-slate-400 hover:bg-slate-800 hover:text-white' : 'text-gray-400 hover:bg-gray-100 hover:text-slate-900'}`}
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Simplified Single View Structure */}
              <div className="flex flex-col gap-8">
                {/* User Details Section */}
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className={`text-sm font-black uppercase tracking-widest ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Account Information</h3>
                    {!isEditingProfile && (
                      <button 
                         onClick={() => setIsEditingProfile(true)}
                         className="text-xs font-bold flex items-center gap-1.5 transition-all"
                         style={{ color: accentColor }}
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        Edit Details
                      </button>
                    )}
                  </div>

                  {!isEditingProfile ? (
                    <div className={`grid grid-cols-2 gap-4 rounded-3xl p-6 border ${darkMode ? 'bg-slate-800/20 border-slate-700/50' : 'bg-slate-50/50 border-slate-100/50 shadow-inner'}`}>
                      {[
                        { label: 'Full Name', value: currentUser?.name || '---', icon: User },
                        { label: 'Username', value: currentUser?.username || '---', icon: AtSign },
                        { label: 'Email', value: currentUser?.email || '---', icon: Mail, full: true },
                        { label: 'Phone', value: currentUser?.phone || '---', icon: Phone },
                      ].map((item, idx) => (
                        <div key={idx} className={item.full ? 'col-span-2' : ''}>
                          <p className={`text-[10px] uppercase font-black tracking-[0.1em] mb-1.5 ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                            {item.label}
                          </p>
                          <div className="flex items-center gap-2">
                            {item.icon && React.createElement(item.icon, { className: "w-3.5 h-3.5 opacity-40" })}
                            <p className={`font-bold text-sm truncate ${darkMode ? 'text-white' : 'text-slate-900'}`}>{item.value}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <form onSubmit={handleUpdateProfile} className="space-y-4 animate-in zoom-in-95 duration-200">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className={`text-xs font-black uppercase tracking-widest ${darkMode ? 'text-slate-400' : 'text-gray-500'} ml-1`}>Display Name</label>
                          <input
                            type="text"
                            value={profileForm.name}
                            onChange={(e) => setProfileForm({...profileForm, name: e.target.value})}
                            className={pwdInputStyle}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <label className={`text-xs font-black uppercase tracking-widest ${darkMode ? 'text-slate-400' : 'text-gray-500'} ml-1`}>Phone</label>
                          <input
                            type="text"
                            value={profileForm.phone}
                            onChange={(e) => setProfileForm({...profileForm, phone: e.target.value})}
                            className={pwdInputStyle}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className={`text-xs font-black uppercase tracking-widest ${darkMode ? 'text-slate-400' : 'text-gray-500'} ml-1`}>Email</label>
                        <input
                          type="email"
                          value={profileForm.email}
                          onChange={(e) => setProfileForm({...profileForm, email: e.target.value})}
                          className={pwdInputStyle}
                          required
                        />
                      </div>
                      <div className="flex gap-3 pt-2">
                        <button 
                          type="button"
                          onClick={() => setIsEditingProfile(false)}
                          className={`flex-1 py-3 font-black rounded-2xl transition-all text-xs border ${darkMode ? 'bg-slate-800/40 border-slate-700 text-slate-400 hover:text-white' : 'bg-slate-100 border-transparent text-slate-600 hover:bg-slate-200'}`}
                        >
                          Discard
                        </button>
                        <button 
                          type="submit"
                          disabled={updateLoading}
                          className="flex-1 py-3 text-white font-black rounded-2xl transition-all shadow-xl text-xs disabled:opacity-60 flex items-center justify-center gap-2"
                          style={{ backgroundColor: accentColor }}
                        >
                          {updateLoading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : profileSaved ? '✓ Saved!' : 'Save Changes'}
                        </button>
                      </div>
                    </form>
                  )}
                </div>

                {/* Password Change Section (Traditional Style) */}
                <div className="pt-6 border-t border-slate-100 dark:border-slate-800 animate-in fade-in slide-in-from-bottom-4 duration-700">
                  <h3 className={`text-sm font-black uppercase tracking-widest mb-4 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Security Settings</h3>
                  
                  {pwdSuccess ? (
                    <div className="flex items-center gap-3 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-sm font-bold">
                       <Check className="w-5 h-5" />
                       Password updated successfully!
                    </div>
                  ) : (
                    <form onSubmit={handleChangePwd} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2 col-span-2">
                          <input
                            type="password"
                            value={pwdForm.current}
                            onChange={(e) => setPwdForm({ ...pwdForm, current: e.target.value })}
                            className={pwdInputStyle}
                            placeholder="Current Password"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <input
                            type="password"
                            value={pwdForm.next}
                            onChange={(e) => setPwdForm({ ...pwdForm, next: e.target.value })}
                            className={pwdInputStyle}
                            placeholder="New Password"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <input
                            type="password"
                            value={pwdForm.confirm}
                            onChange={(e) => setPwdForm({ ...pwdForm, confirm: e.target.value })}
                            className={pwdInputStyle}
                            placeholder="Verify Password"
                            required
                          />
                        </div>
                      </div>

                      {pwdError && (
                        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-bold text-center">
                          {pwdError}
                        </div>
                      )}

                      <button
                        type="submit"
                        disabled={pwdLoading}
                        className="w-full text-white py-3.5 rounded-2xl font-black text-xs transition-all shadow-lg active:scale-[0.98] disabled:opacity-60 flex items-center justify-center gap-2"
                        style={{ backgroundColor: accentColor }}
                      >
                        {pwdLoading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : 'Update Security Password'}
                      </button>
                    </form>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-[60] shadow-2xl transition-all duration-300">
          <div className={`rounded-xl border p-4 flex items-center gap-4 w-80 relative overflow-hidden ${darkMode ? 'bg-[#151521] border-slate-700' : 'bg-white border-slate-100'}`}>
            <div className="absolute top-0 left-0 w-1 h-full" style={{ backgroundColor: accentColor }}></div>
            <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: `${accentColor}18` }}>
              <Bell className="w-5 h-5" style={{ color: accentColor }} />
            </div>
            <div className="flex-1">
              <h4 className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-slate-800'}`}>New Update</h4>
              <p className={`text-xs font-medium mt-0.5 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{toast.message}</p>
            </div>
            <button onClick={() => setToast(null)} className={`p-1 hover:bg-slate-100 rounded-full transition-colors ${darkMode ? 'text-slate-400' : 'text-slate-400'}`}>
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Layout;
