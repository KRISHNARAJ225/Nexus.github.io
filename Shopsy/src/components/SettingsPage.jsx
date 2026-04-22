import React, { useState, useEffect } from 'react';
import {
  User, Palette, ZoomIn, Bell, Globe, Shield, Monitor,
  Check, RotateCcw, Moon, Sun, Sliders
} from 'lucide-react';

const ACCENT_COLORS = [
  { name: 'Navy',   value: '#1b2559' },
  { name: 'Indigo', value: '#4318FF' },
  { name: 'Violet', value: '#7c3aed' },
  { name: 'Rose',   value: '#e11d48' },
  { name: 'Teal',   value: '#0d9488' },
  { name: 'Amber',  value: '#d97706' },
];

const SettingsPage = ({ currentUser, onSettingsChange }) => {
  const [accentColor, setAccentColor]   = useState(() => localStorage.getItem('accentColor')   || '#1b2559');
  const [zoomLevel, setZoomLevel]       = useState(() => parseInt(localStorage.getItem('zoomLevel')    || '100', 10));
  const [notifEnabled, setNotifEnabled] = useState(() => localStorage.getItem('notifEnabled') !== 'false');
  const [language, setLanguage]         = useState(() => localStorage.getItem('language') || 'en');
  const [saved, setSaved]               = useState(false);

  // Propagate to Layout
  useEffect(() => {
    onSettingsChange?.({ accentColor, zoomLevel });
  }, [accentColor, zoomLevel]);

  const saveSettings = () => {
    localStorage.setItem('accentColor',   accentColor);
    localStorage.setItem('zoomLevel',     String(zoomLevel));
    localStorage.setItem('notifEnabled',  String(notifEnabled));
    localStorage.setItem('language',      language);
    onSettingsChange?.({ accentColor, zoomLevel });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const resetZoom = () => setZoomLevel(100);

  const SectionCard = ({ icon: Icon, title, children }) => (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-50 overflow-hidden">
      <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-50">
        <div className="p-2 rounded-xl" style={{ backgroundColor: `${accentColor}15` }}>
          <Icon className="w-5 h-5" style={{ color: accentColor }} />
        </div>
        <h2 className="text-base font-bold text-gray-800">{title}</h2>
      </div>
      <div className="px-6 py-5">{children}</div>
    </div>
  );

  return (
    <div className="space-y-8 max-w-3xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-400">Settings</h1>
          <p className="text-sm text-gray-400">Customize your workspace preferences</p>
        </div>
        <button
          onClick={saveSettings}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-semibold shadow-md transition-all hover:opacity-90 active:scale-[0.97]"
          style={{ backgroundColor: accentColor }}
        >
          {saved ? <Check className="w-4 h-4" /> : <Sliders className="w-4 h-4" />}
          {saved ? 'Saved!' : 'Save Settings'}
        </button>
      </div>

      {/* Profile Section */}
      <SectionCard icon={User} title="Profile Information">
        <div className="flex items-center gap-4">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-md"
            style={{ background: `linear-gradient(135deg, ${accentColor}, ${accentColor}99)` }}
          >
            {(currentUser?.name || 'U').charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 space-y-1">
            <p className="text-lg font-bold text-gray-900">{currentUser?.name || '—'}</p>
            <p className="text-sm text-gray-500">{currentUser?.email || '—'}</p>
            <span
              className="inline-block px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide text-white"
              style={{ backgroundColor: accentColor }}
            >
              {currentUser?.role || 'user'}
            </span>
          </div>
        </div>
      </SectionCard>

      {/* Appearance */}
      <SectionCard icon={Palette} title="Appearance & Theme Color">
        <p className="text-sm text-gray-500 mb-4">Choose an accent color for the sidebar and interactive elements.</p>
        <div className="flex flex-wrap gap-3">
          {ACCENT_COLORS.map(c => (
            <button
              key={c.value}
              title={c.name}
              onClick={() => setAccentColor(c.value)}
              className="w-10 h-10 rounded-xl flex items-center justify-center transition-all hover:scale-110 shadow-sm border-2"
              style={{
                backgroundColor: c.value,
                borderColor: accentColor === c.value ? c.value : 'transparent',
                boxShadow: accentColor === c.value ? `0 0 0 3px ${c.value}40` : undefined,
              }}
            >
              {accentColor === c.value && <Check className="w-4 h-4 text-white" />}
            </button>
          ))}
        </div>
        <div className="mt-4 flex items-center gap-3">
          <span className="text-sm text-gray-500">Custom color:</span>
          <input
            type="color"
            value={accentColor}
            onChange={(e) => setAccentColor(e.target.value)}
            className="w-10 h-10 rounded-xl border-none cursor-pointer"
            title="Pick custom color"
          />
          <span className="text-xs font-mono text-gray-400">{accentColor}</span>
        </div>
      </SectionCard>

      {/* Zoom / Magnifier */}
      <SectionCard icon={ZoomIn} title="Zoom & Magnifier">
        <p className="text-sm text-gray-500 mb-4">Adjust the page zoom level for better readability.</p>
        <div className="flex items-center gap-4">
          <span className="text-xs font-bold text-gray-400 w-8">80%</span>
          <input
            type="range"
            min={80}
            max={150}
            step={5}
            value={zoomLevel}
            onChange={(e) => setZoomLevel(Number(e.target.value))}
            className="flex-1 accent-current h-2 cursor-pointer"
            style={{ accentColor }}
          />
          <span className="text-xs font-bold text-gray-400 w-10">150%</span>
          <div
            className="px-3 py-1.5 rounded-lg text-white text-sm font-bold min-w-[56px] text-center"
            style={{ backgroundColor: accentColor }}
          >
            {zoomLevel}%
          </div>
          <button
            onClick={resetZoom}
            className="p-2 rounded-lg text-gray-400 hover:bg-gray-50 transition-colors"
            title="Reset zoom"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* Live preview */}
        <div className="mt-4 p-4 bg-gray-50 rounded-xl text-sm text-gray-600 font-medium">
          <span className="text-xs text-gray-400 block mb-1">Live preview text at {zoomLevel}%</span>
          <span style={{ fontSize: `${zoomLevel / 100}em` }}>
            This is how content will appear at {zoomLevel}% zoom.
          </span>
        </div>
      </SectionCard>

      {/* Notifications */}
      <SectionCard icon={Bell} title="Notifications">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-gray-700">Activity notifications</p>
            <p className="text-xs text-gray-400 mt-0.5">Show toast alerts when items are added or updated</p>
          </div>
          <button
            onClick={() => setNotifEnabled(!notifEnabled)}
            className="w-11 h-6 rounded-full relative transition-colors duration-300 flex-shrink-0"
            style={{ backgroundColor: notifEnabled ? accentColor : '#e2e8f0' }}
          >
            <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform duration-300 shadow-sm ${notifEnabled ? 'translate-x-5' : 'translate-x-0.5'}`} />
          </button>
        </div>
      </SectionCard>

      {/* Language */}
      <SectionCard icon={Globe} title="Language & Region">
        <div className="flex items-center gap-4">
          <label className="text-sm font-semibold text-gray-700 w-32">Display Language</label>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 text-sm font-medium text-gray-700 bg-gray-50"
            style={{ focusRingColor: accentColor }}
          >
            <option value="en">English</option>
            <option value="ta">Tamil</option>
            <option value="hi">Hindi</option>
            <option value="te">Telugu</option>
            <option value="kn">Kannada</option>
            <option value="ml">Malayalam</option>
          </select>
        </div>
      </SectionCard>

      {/* System Info */}
      <SectionCard icon={Monitor} title="System Info">
        <div className="grid grid-cols-2 gap-3 text-sm">
          {[
            ['App Version', 'StockFlow v1.0.0'],
            ['Browser', navigator.userAgent.includes('Chrome') ? 'Google Chrome' : navigator.userAgent.includes('Firefox') ? 'Firefox' : 'Other'],
            ['Screen Resolution', `${window.screen.width} × ${window.screen.height}`],
            ['Current Zoom', `${zoomLevel}%`],
          ].map(([label, value]) => (
            <div key={label} className="p-3 bg-gray-50 rounded-xl">
              <p className="text-xs text-gray-400 font-medium">{label}</p>
              <p className="font-semibold text-gray-700 mt-0.5">{value}</p>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
};

export default SettingsPage;
