import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon, Clock, X, CheckCircle2, Circle } from 'lucide-react';

const CalendarPage = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDateFilter, setSelectedDateFilter] = useState('');
  const [events, setEvents] = useState(() => {
    const saved = localStorage.getItem('calendarEvents');
    return saved ? JSON.parse(saved) : [
      { id: 1, date: new Date().toISOString().split('T')[0], title: 'Team Sync', type: 'Meeting', time: '10:00 AM', completed: false }
    ];
  });

  // Save events to localStorage whenever they change
  React.useEffect(() => {
    localStorage.setItem('calendarEvents', JSON.stringify(events));
  }, [events]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [formData, setFormData] = useState({ title: '', type: 'Event', time: '' });

  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };
  
  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  
  const getFormattedDateString = (day) => {
    const d = new Date(year, month, day);
    const offset = d.getTimezoneOffset();
    return new Date(d.getTime() - (offset*60*1000)).toISOString().split('T')[0];
  };

  const handleDateClick = (day) => {
    const dateStr = getFormattedDateString(day);
    if (selectedDateFilter === dateStr) {
      // open add modal if double clicked, or just select it. Let's make it select to filter, and add a specific "add" button.
      setSelectedDate(dateStr);
      setShowAddModal(true);
    } else {
      setSelectedDateFilter(dateStr);
      setSelectedDate(dateStr);
    }
  };

  const handleAddEvent = (e) => {
    e.preventDefault();
    if (formData.title) {
      setEvents([...events, { id: Date.now(), date: selectedDate, ...formData, completed: false }]);
      setFormData({ title: '', type: 'Event', time: '' });
      setShowAddModal(false);
    }
  };

  const toggleEventCompleted = (id) => {
    setEvents(events.map(ev => ev.id === id ? { ...ev, completed: !ev.completed } : ev));
  };

  const deleteEvent = (id) => {
    setEvents(events.filter(ev => ev.id !== id));
  };

  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  // Filter out events if a date is selected, otherwise show upcoming
  const displayEvents = selectedDateFilter 
    ? events.filter(e => e.date === selectedDateFilter)
    : [...events].sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <div className="space-y-8 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-400">Calendar</h1>
          <p className="text-sm text-gray-400">Manage your events and meetings</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setSelectedDate(new Date().toISOString().split('T')[0]);
              setShowAddModal(true);
            }}
            className="bg-blue-600 dark:bg-blue-500 text-white px-5 py-2.5 rounded-xl hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors flex items-center gap-2 font-bold text-sm shadow-md shadow-blue-500/20"
          >
            <Plus className="w-4 h-4" />
            Add Event
          </button>
        </div>
      </div>

      {/* Calendar Grid Container */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100 dark:border-slate-700">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xl font-bold text-slate-800 dark:text-white">
            {monthNames[month]} {year}
          </h2>
          <div className="flex items-center gap-2">
            <button onClick={handlePrevMonth} className="p-2 border border-slate-200 dark:border-slate-600 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-slate-600 dark:text-slate-300">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button onClick={() => { setCurrentDate(new Date()); setSelectedDateFilter(''); }} className="px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-sm font-bold text-slate-600 dark:text-slate-300">
              Today
            </button>
            <button onClick={handleNextMonth} className="p-2 border border-slate-200 dark:border-slate-600 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-slate-600 dark:text-slate-300">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-y-4 gap-x-2">
          {/* Days Header */}
          {days.map(day => (
            <div key={day} className="text-center text-xs font-bold text-slate-400 uppercase tracking-wider pb-2">
              {day}
            </div>
          ))}

          {/* Empty cells for offset */}
          {Array.from({ length: firstDay }).map((_, index) => (
            <div key={`empty-${index}`} className="h-24 md:h-32 rounded-xl bg-slate-50/50 dark:bg-slate-800/20 border border-transparent"></div>
          ))}

          {/* Days of month */}
          {Array.from({ length: daysInMonth }).map((_, index) => {
            const day = index + 1;
            const dateStr = getFormattedDateString(day);
            const isToday = dateStr === new Date().toISOString().split('T')[0];
            const isSelected = selectedDateFilter === dateStr;
            const dayEvents = events.filter(e => e.date === dateStr);

            return (
              <div 
                key={day} 
                onClick={() => handleDateClick(day)}
                className={`h-24 md:h-32 rounded-xl border p-2 flex flex-col cursor-pointer transition-all ${
                  isSelected 
                    ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-500/10 ring-2 ring-blue-500/20' 
                    : isToday 
                    ? 'border-indigo-200 dark:border-indigo-500/50 bg-indigo-50/30 dark:bg-indigo-500/10 hover:border-indigo-300' 
                    : 'border-slate-100 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-500'
                }`}
              >
                <div className="flex justify-between items-start mb-1">
                  <span className={`text-sm font-bold w-7 h-7 flex items-center justify-center rounded-full ${
                    isToday ? 'bg-indigo-500 text-white shadow-sm shadow-indigo-500/30' : 'text-slate-700 dark:text-slate-300'
                  }`}>
                    {day}
                  </span>
                  {dayEvents.length > 0 && (
                    <span className="text-[10px] font-bold bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-1.5 py-0.5 rounded-md">
                      {dayEvents.length}
                    </span>
                  )}
                </div>
                
                <div className="flex-1 overflow-y-auto custom-scrollbar space-y-1 mt-1">
                  {dayEvents.slice(0, 3).map(ev => (
                    <div key={ev.id} className={`text-[10px] px-1.5 py-1 rounded truncate font-medium ${
                      ev.type === 'Meeting' ? 'bg-pink-100 text-pink-700 dark:bg-pink-500/20 dark:text-pink-300' : 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300'
                    }`}>
                      {ev.time && <span className="mr-1">{ev.time}</span>}
                      {ev.title}
                    </div>
                  ))}
                  {dayEvents.length > 3 && (
                    <div className="text-[10px] text-slate-400 font-medium pl-1">+{dayEvents.length - 3} more</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* To-Do List Below Calendar */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100 dark:border-slate-700">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white">
            {selectedDateFilter ? `To-Do List for ${new Date(selectedDateFilter).toLocaleDateString()}` : 'Upcoming To-Do List'}
          </h3>
          {selectedDateFilter && (
            <button 
              onClick={() => setSelectedDateFilter('')}
              className="text-sm font-bold text-blue-600 dark:text-blue-400 hover:underline"
            >
              Show All
            </button>
          )}
        </div>
        
        {displayEvents.length > 0 ? (
          <div className="space-y-3">
            {displayEvents.map((ev) => (
              <div key={ev.id} className={`flex items-center p-4 rounded-2xl border transition-colors ${
                ev.completed 
                  ? 'bg-slate-50 border-transparent dark:bg-slate-800/50 opacity-60' 
                  : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 hover:border-blue-200 dark:hover:border-blue-500/50'
              }`}>
                <button onClick={() => toggleEventCompleted(ev.id)} className="mr-4 text-slate-400 hover:text-blue-600 transition-colors">
                  {ev.completed ? <CheckCircle2 className="w-6 h-6 text-green-500" /> : <Circle className="w-6 h-6" />}
                </button>
                <div className={`flex-1 ${ev.completed ? 'line-through text-slate-500 dark:text-slate-400' : 'text-slate-800 dark:text-slate-200'}`}>
                  <h4 className="font-bold text-sm tracking-wide">{ev.title}</h4>
                  <div className="flex items-center gap-3 mt-1">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                      ev.type === 'Meeting' ? 'bg-pink-100 text-pink-700 dark:bg-pink-500/20 dark:text-pink-400' : 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400'
                    }`}>
                      {ev.type}
                    </span>
                    <span className="flex items-center text-xs font-medium text-slate-500 dark:text-slate-400">
                      <CalendarIcon className="w-3 h-3 mr-1" />
                      {new Date(ev.date).toLocaleDateString()}
                    </span>
                    {ev.time && (
                      <span className="flex items-center text-xs font-medium text-slate-500 dark:text-slate-400">
                        <Clock className="w-3 h-3 mr-1" />
                        {ev.time}
                      </span>
                    )}
                  </div>
                </div>
                <button onClick={() => deleteEvent(ev.id)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors ml-4">
                  <X className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 px-4 border-2 border-dashed border-slate-100 dark:border-slate-700 rounded-2xl">
            <div className="w-16 h-16 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center mx-auto mb-4">
              <CalendarIcon className="w-8 h-8 text-slate-300 dark:text-slate-600" />
            </div>
            <p className="text-sm font-bold text-slate-600 dark:text-slate-300">No events found</p>
            <p className="text-xs text-slate-400 mt-1">Looks like your schedule is clear for this timeframe.</p>
          </div>
        )}
      </div>

      {/* Add Event Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[70] p-4">
          <div className="bg-white dark:bg-[#151521] rounded-2xl p-6 w-full max-w-sm shadow-2xl border border-slate-100 dark:border-slate-700">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-slate-800 dark:text-white">Add New Event</h2>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddEvent} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Date</label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-sm font-medium dark:text-white transition-all"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Task / Event Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Weekly Sync"
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-sm font-medium dark:text-white transition-all"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-sm font-medium dark:text-white transition-all"
                  >
                    <option value="Event">Event</option>
                    <option value="Meeting">Meeting</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Time (Optional)</label>
                  <input
                    type="time"
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-sm font-medium dark:text-white transition-all"
                  />
                </div>
              </div>
              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-2.5 text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors border border-slate-200 dark:border-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 text-sm font-bold text-white bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-600 rounded-xl shadow-md shadow-blue-500/20 transition-all"
                >
                  Save Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarPage;
