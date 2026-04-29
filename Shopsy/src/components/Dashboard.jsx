import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar
} from 'recharts';
import {
  Users, ReceiptText, Briefcase, DollarSign, MoreHorizontal, ChevronDown
} from 'lucide-react';
import { useData } from '../contexts/DataContext';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const DAYS   = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
const CY     = new Date().getFullYear();
const PY     = CY - 1;

const PIE_COLORS = { 'E-Wallet': '#1B2559', 'Cash': '#828DF8', 'QRIS': '#E0E5F2', 'Debit Card': '#4318FF' };

const Dashboard = () => {
  const { customers, orders, products, customerPageData, orderPageData } = useData();
  const navigate = useNavigate();
  const [revenueView, setRevenueView]   = useState('weekly');
  const [year2, setYear2] = useState(CY);
  const year1 = year2 - 1;
  const [openDropdown2, setOpenDropdown2] = useState(false);
  const dropdown2Ref = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdown2Ref.current && !dropdown2Ref.current.contains(event.target)) {
        setOpenDropdown2(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ── Stat cards ─────────────────────────────────────────────────────────────
  const totalCustomers    = customerPageData.totalElements || customers.length;
  const totalTransactions = orderPageData.totalElements || orders.length;
  const totalSales        = products.reduce((sum, p) => sum + (Number(p.quantity) || 0), 0);
  const totalIncome       = orders.reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0);

  // ── Sales Performance area chart — real order amounts grouped by month/year ─
  const salesMap = {};
  MONTHS.forEach(m => { salesMap[m] = { month: m, [year1]: 0, [year2]: 0 }; });
  orders.forEach(o => {
    const d = new Date(o.orderDate || o.createdAt);
    if (isNaN(d)) return;
    const yr = d.getFullYear();
    const mo = MONTHS[d.getMonth()];
    if (yr === year2 || yr === year1) salesMap[mo][yr] = (salesMap[mo][yr] || 0) + (Number(o.totalAmount) || 0);
  });
  const salesPerformanceData = Object.values(salesMap);

  // ── Payment methods pie chart (Replaced with Custom Metrics) ──
  const totalPaid = orders.filter(o => o.paymentStatus === 'Paid').length;
  const metricsData = [
    { name: 'Total Customer', value: totalCustomers, color: '#4318FF' },
    { name: 'Total Transaction', value: totalTransactions, color: '#FF2E93' },
    { name: 'Total Paid', value: totalPaid, color: '#05CD99' }
  ];
  const metricsSum = (totalCustomers + totalTransactions + totalPaid) || 1;
  const pieData = metricsData.map(m => ({
    ...m,
    percent: Math.round((m.value / metricsSum) * 100)
  }));

  // ── Revenue bar chart — weekly or monthly from real orders ─────────────────
  const buildWeekly = () => {
    const map = {};
    DAYS.forEach(d => { map[d] = { name: d, TargetRevenue: 0, ActualRevenue: 0 }; });
    const now = new Date();
    const weekStart = new Date(now); weekStart.setDate(now.getDate() - now.getDay());
    orders.forEach(o => {
      const d = new Date(o.orderDate || o.createdAt);
      if (isNaN(d) || d < weekStart) return;
      const day = DAYS[d.getDay()];
      map[day].ActualRevenue += Number(o.totalAmount) || 0;
      map[day].TargetRevenue  = Math.round(map[day].ActualRevenue * 1.2);
    });
    return Object.values(map);
  };

  const buildMonthly = () => {
    const map = {};
    MONTHS.forEach(m => { map[m] = { name: m, TargetRevenue: 0, ActualRevenue: 0 }; });
    orders.forEach(o => {
      const d = new Date(o.orderDate || o.createdAt);
      if (isNaN(d) || d.getFullYear() !== CY) return;
      const mo = MONTHS[d.getMonth()];
      map[mo].ActualRevenue += Number(o.totalAmount) || 0;
      map[mo].TargetRevenue  = Math.round(map[mo].ActualRevenue * 1.2);
    });
    return Object.values(map);
  };

  const currentRevenueData = revenueView === 'weekly' ? buildWeekly() : buildMonthly();

  // ── Top transactions table — latest 6 orders ───────────────────────────────
  const topTransactions = [...orders]
    .sort((a, b) => new Date(b.orderDate || b.createdAt) - new Date(a.orderDate || a.createdAt))
    .slice(0, 6)
    .map(o => ({
      id:       `#ORD-${String(o.id).padStart(4, '0')}`,
      customer: o.customerName || (typeof o.customer === 'object' ? o.customer?.name : o.customer) || '—',
      date:     o.orderDate    || o.createdAt || '—',
      items:    Array.isArray(o.products)
                  ? o.products.reduce((acc, p) => acc + (Number(p.quantity) || 0), 0)
                  : (Number(o.itemCount) || 0),
      purchase: `$${(Number(o.totalAmount) || 0).toFixed(2)}`,
    }));

  return (
    <div className="space-y-6">
      {/* 1. Top Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-[#151521] rounded-2xl p-6 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-slate-100/50 dark:border-slate-800 flex items-center justify-between hover:-translate-y-1 hover:shadow-lg hover:shadow-blue-500/20 hover:border-blue-200 transition-all duration-300 group cursor-pointer">
          <div>
            <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 mb-1 group-hover:text-blue-500 transition-colors">Total Customers</p>
            <h3 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight group-hover:text-blue-600 transition-colors">{totalCustomers.toLocaleString()}</h3>
          </div>
          <div className="w-12 h-12 bg-[#F4F7FE] dark:bg-blue-900/20 rounded-full flex items-center justify-center text-[#4318FF] group-hover:scale-110 group-hover:bg-[#4318FF] group-hover:text-white transition-all duration-300">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-[#151521] rounded-2xl p-6 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-slate-100/50 dark:border-slate-800 flex items-center justify-between hover:-translate-y-1 hover:shadow-lg hover:shadow-pink-500/20 hover:border-pink-200 transition-all duration-300 group cursor-pointer">
          <div>
            <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 mb-1 group-hover:text-pink-500 transition-colors">Total Transaction</p>
            <h3 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight group-hover:text-pink-600 transition-colors">{totalTransactions.toLocaleString()}</h3>
          </div>
          <div className="w-12 h-12 bg-[#FFF3F8] dark:bg-pink-900/20 rounded-full flex items-center justify-center text-[#FF2E93] group-hover:scale-110 group-hover:bg-[#FF2E93] group-hover:text-white transition-all duration-300">
            <ReceiptText className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-[#151521] rounded-2xl p-6 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-slate-100/50 dark:border-slate-800 flex items-center justify-between hover:-translate-y-1 hover:shadow-lg hover:shadow-orange-500/20 hover:border-orange-200 transition-all duration-300 group cursor-pointer">
          <div>
            <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 mb-1 group-hover:text-orange-500 transition-colors">Total Sales</p>
            <h3 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight group-hover:text-orange-500 transition-colors">{totalSales.toLocaleString()}</h3>
          </div>
          <div className="w-12 h-12 bg-[#FFF6EE] dark:bg-orange-900/20 rounded-full flex items-center justify-center text-[#FF9E4A] group-hover:scale-110 group-hover:bg-[#FF9E4A] group-hover:text-white transition-all duration-300">
            <Briefcase className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-[#151521] rounded-2xl p-6 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-slate-100/50 dark:border-slate-800 flex items-center justify-between hover:-translate-y-1 hover:shadow-lg hover:shadow-emerald-500/20 hover:border-emerald-200 transition-all duration-300 group cursor-pointer">
          <div>
            <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 mb-1 group-hover:text-emerald-500 transition-colors">Total Income</p>
            <h3 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight group-hover:text-emerald-600 transition-colors">
              $ {totalIncome.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h3>
          </div>
          <div className="w-12 h-12 bg-[#E1FDE5] dark:bg-emerald-900/20 rounded-full flex items-center justify-center text-[#05CD99] group-hover:scale-110 group-hover:bg-[#05CD99] group-hover:text-white transition-all duration-300">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* 2. Middle Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Performance Area Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-[#151521] p-6 rounded-2xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-slate-100/50 dark:border-slate-800 relative">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">Sales Performance</h3>
              <p className="text-xs font-medium text-slate-400 dark:text-slate-500 mt-1">See how your sales grow month by month in {year1} and {year2}</p>
            </div>
            <div className="flex items-center gap-3">
              <div ref={dropdown2Ref} className="relative">
                <button onClick={() => setOpenDropdown2(!openDropdown2)} className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                  <div className="w-2 h-2 rounded-full bg-[#05CD99]"></div>
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Compare: {year2} vs {year1}</span>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </button>
                {openDropdown2 && (
                  <div className="absolute top-full right-0 mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-lg rounded-lg z-10 min-w-[120px]">
                    {[2024, 2025, 2026].map(y => (
                      <div key={y} onClick={() => { setYear2(y); setOpenDropdown2(false); }} className="px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer">
                        {y} vs {y - 1}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <button className="text-slate-400 ml-2"><MoreHorizontal className="w-5 h-5" /></button>
            </div>
          </div>
          <div className="h-72 mt-8">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesPerformanceData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCY" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#05CD99" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#05CD99" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorPY" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#1B2559" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#1B2559" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 500 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 500 }} dx={-10} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Area type="monotone" dataKey={String(year2)} stroke="#05CD99" strokeWidth={3} fillOpacity={1} fill="url(#colorCY)" />
                <Area type="monotone" dataKey={String(year1)} stroke="#1B2559" strokeWidth={3} fillOpacity={1} fill="url(#colorPY)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-1 bg-white dark:bg-[#151521] p-6 rounded-2xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-slate-100/50 dark:border-slate-800 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">KPIS Overview</h3>
            <button className="text-slate-400"><MoreHorizontal className="w-5 h-5" /></button>
          </div>
          <div className="flex-1 flex flex-col items-center justify-center relative">
            <div className="h-56 w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} innerRadius={65} outerRadius={95} paddingAngle={2} dataKey="value" stroke="none">
                    {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip formatter={(v, name, props) => [`${v} (${props.payload.percent}%)`, name]} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
                <p className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight">{totalTransactions.toLocaleString()}</p>
                <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">Total Items</p>
              </div>
              {/* Dynamic Percent Labels */}
              <div className="absolute top-[25%] left-[10%] bg-white dark:bg-slate-800 px-2 py-1 rounded text-[10px] font-bold text-slate-600 dark:text-slate-300 shadow-sm border border-slate-100 dark:border-slate-700">{pieData[0]?.percent}%</div>
              <div className="absolute top-[20%] right-[15%] bg-white dark:bg-slate-800 px-2 py-1 rounded text-[10px] font-bold text-slate-600 dark:text-slate-300 shadow-sm border border-slate-100 dark:border-slate-700">{pieData[1]?.percent}%</div>
              <div className="absolute bottom-[35%] right-[10%] bg-white dark:bg-slate-800 px-2 py-1 rounded text-[10px] font-bold text-slate-600 dark:text-slate-300 shadow-sm border border-slate-100 dark:border-slate-700">{pieData[2]?.percent}%</div>
            </div>
            <div className="grid grid-cols-2 gap-x-6 gap-y-3 mt-6 w-full px-4">
              {pieData.map((p, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-3 h-1.5 rounded-full" style={{ backgroundColor: p.color }}></div>
                  <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">{p.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Revenue Performance Bar Chart */}
        <div className="lg:col-span-5 bg-white dark:bg-[#151521] p-6 rounded-2xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-slate-100/50 dark:border-slate-800">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">Revenue Performance</h3>
              <div className="flex items-center gap-4 mt-2">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-[#E0E5F2] dark:bg-slate-700"></div>
                  <span className="text-xs font-medium text-slate-400">Target Revenue</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-[#4318FF]"></div>
                  <span className="text-xs font-medium text-slate-400">Actual Revenue</span>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setRevenueView(v => v === 'weekly' ? 'monthly' : 'weekly')}
                className="flex items-center gap-2 text-sm font-bold text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 px-3 py-1.5 rounded-lg transition-colors"
              >
                {revenueView === 'weekly' ? 'Weekly' : 'Monthly'} <ChevronDown className="w-4 h-4 ml-1" />
              </button>
              <button className="text-slate-400 p-1.5 hover:bg-slate-50 rounded-lg transition-colors">
                <MoreHorizontal className="w-5 h-5" />
              </button>
            </div>
          </div>
          <div className="h-64 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={currentRevenueData} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 500 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 500 }} tickFormatter={v => `$${v}`} dx={-10} />
                <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="TargetRevenue" fill="#E0E5F2" radius={[4,4,4,4]} barSize={12} />
                <Bar dataKey="ActualRevenue" fill="#6956E5" radius={[4,4,4,4]} barSize={12} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Transaction Table */}
        <div className="lg:col-span-7 bg-white dark:bg-[#151521] p-6 rounded-2xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-slate-100/50 dark:border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">Top Transaction</h3>
              <p className="text-xs font-medium text-slate-400 dark:text-slate-500 mt-1">Highlights of the highest transactions made this week</p>
            </div>
            <button onClick={() => navigate('/orders')} className="text-sm font-bold text-[#4318FF] hover:underline cursor-pointer">See All</button>
          </div>
          <div className="overflow-x-auto mt-6">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#f8fafc]/50 dark:bg-slate-800/50">
                  <th className="py-4 px-4 text-xs font-bold text-slate-500 dark:text-slate-400 rounded-l-xl">Transaction ID</th>
                  <th className="py-4 px-4 text-xs font-bold text-slate-500 dark:text-slate-400">Customer ID</th>
                  <th className="py-4 px-4 text-xs font-bold text-slate-500 dark:text-slate-400">Date</th>
                  <th className="py-4 px-4 text-xs font-bold text-slate-500 dark:text-slate-400 text-center">Items</th>
                  <th className="py-4 px-4 text-xs font-bold text-slate-500 dark:text-slate-400 rounded-r-xl">Purchase</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {topTransactions.length === 0 ? (
                  <tr><td colSpan={5} className="py-8 text-center text-slate-400 text-sm">No transactions yet</td></tr>
                ) : (
                  topTransactions.map((trx, idx) => (
                    <tr key={idx} className="border-b border-slate-50 dark:border-slate-800 last:border-0 hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="py-3 px-4 font-bold text-slate-800 dark:text-slate-200">{trx.id}</td>
                      <td className="py-3 px-4 font-bold text-slate-600 dark:text-slate-400">{trx.customer}</td>
                      <td className="py-3 px-4 font-medium text-slate-500 dark:text-slate-500">{trx.date}</td>
                      <td className="py-3 px-4 font-medium text-slate-500 dark:text-slate-500 text-center">{trx.items}</td>
                      <td className="py-3 px-4 font-bold text-slate-800 dark:text-slate-200">{trx.purchase}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
