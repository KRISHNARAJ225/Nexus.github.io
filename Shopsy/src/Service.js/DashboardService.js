import apiFetch from './apiClient.js';
import { getCustomers } from './CustomerService.js';
import { getOrders } from './OrderService.js';
import { getProducts } from './ProductService.js';
import { getCategories } from './CategoryService.js';

// Fetch all dashboard data in parallel
export const getDashboardData = async () => {
  const [customers, orders, products, categories] = await Promise.allSettled([
    getCustomers(),
    getOrders(),
    getProducts(),
    getCategories(),
  ]);

  return {
    customers: customers.status === 'fulfilled' ? (customers.value ?? []) : [],
    orders:    orders.status    === 'fulfilled' ? (orders.value    ?? []) : [],
    products:  products.status  === 'fulfilled' ? (products.value  ?? []) : [],
    categories:categories.status=== 'fulfilled' ? (categories.value?? []) : [],
  };
};

// Build stat cards from real data
export const getDashboardStats = (customers = [], orders = [], products = []) => {
  const totalCustomers    = customers.length;
  const totalTransactions = orders.length;
  const totalSales        = products.reduce((sum, p) => sum + (p.quantity || 0), 0);
  const totalIncome       = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  return { totalCustomers, totalTransactions, totalSales, totalIncome };
};

// Build monthly sales performance chart data from orders
export const getSalesPerformanceData = (orders = []) => {
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const currentYear  = new Date().getFullYear();
  const previousYear = currentYear - 1;

  const map = {};
  months.forEach((m, i) => { map[m] = { name: m, [previousYear]: 0, [currentYear]: 0 }; });

  orders.forEach(order => {
    const date = new Date(order.orderDate);
    if (isNaN(date)) return;
    const month = months[date.getMonth()];
    const year  = date.getFullYear();
    if (year === currentYear || year === previousYear) {
      map[month][year] = (map[month][year] || 0) + (order.totalAmount || 0);
    }
  });

  return Object.values(map);
};

// Build revenue bar chart data from orders grouped by day/month
export const getRevenueData = (orders = [], view = 'weekly') => {
  if (view === 'weekly') {
    const days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
    const map  = {};
    days.forEach(d => { map[d] = { name: d, TargetRevenue: 0, ActualRevenue: 0 }; });

    const now       = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());

    orders.forEach(order => {
      const date = new Date(order.orderDate);
      if (isNaN(date)) return;
      if (date >= weekStart) {
        const day = days[date.getDay()];
        map[day].ActualRevenue += order.totalAmount || 0;
        map[day].TargetRevenue  = map[day].ActualRevenue * 1.2; // 20% above actual as target
      }
    });
    return Object.values(map);
  }

  // Monthly
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const map    = {};
  months.forEach(m => { map[m] = { name: m, TargetRevenue: 0, ActualRevenue: 0 }; });

  const currentYear = new Date().getFullYear();
  orders.forEach(order => {
    const date = new Date(order.orderDate);
    if (isNaN(date) || date.getFullYear() !== currentYear) return;
    const month = months[date.getMonth()];
    map[month].ActualRevenue += order.totalAmount || 0;
    map[month].TargetRevenue  = map[month].ActualRevenue * 1.2;
  });
  return Object.values(map);
};

// Build payment methods pie chart from orders
export const getPaymentMethodsData = (orders = []) => {
  const colors = { 'E-Wallet': '#1B2559', 'Cash': '#828DF8', 'QRIS': '#E0E5F2', 'Debit Card': '#4318FF' };
  const map    = {};

  orders.forEach(order => {
    const method = order.paymentMethod || order.paymentStatus || 'Cash';
    map[method]  = (map[method] || 0) + 1;
  });

  const total = Object.values(map).reduce((s, v) => s + v, 0) || 1;
  return Object.entries(map).map(([name, value], i) => ({
    name,
    value: Math.round((value / total) * 100),
    color: colors[name] || ['#1B2559','#828DF8','#E0E5F2','#4318FF'][i % 4],
  }));
};

export default { getDashboardData, getDashboardStats, getSalesPerformanceData, getRevenueData, getPaymentMethodsData };
