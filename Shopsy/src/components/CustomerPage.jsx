import React, { useState, useEffect } from 'react';
import { Users, Plus, Edit2, Trash2, Eye, Search, X, Save, Mail, Phone, Calendar, MapPin, Filter, Download, Globe } from 'lucide-react';
import { useData } from '../contexts/DataContext';
import Pagination from './Pagination';

const COUNTRIES = [
  'Afghanistan','Albania','Algeria','Andorra','Angola','Argentina','Armenia','Australia','Austria','Azerbaijan',
  'Bahamas','Bahrain','Bangladesh','Belarus','Belgium','Belize','Benin','Bhutan','Bolivia','Bosnia and Herzegovina',
  'Botswana','Brazil','Brunei','Bulgaria','Burkina Faso','Burundi','Cambodia','Cameroon','Canada','Chad',
  'Chile','China','Colombia','Congo','Costa Rica','Croatia','Cuba','Cyprus','Czech Republic','Denmark',
  'Djibouti','Dominican Republic','Ecuador','Egypt','El Salvador','Estonia','Ethiopia','Fiji','Finland','France',
  'Gabon','Georgia','Germany','Ghana','Greece','Guatemala','Guinea','Haiti','Honduras','Hungary',
  'Iceland','India','Indonesia','Iran','Iraq','Ireland','Israel','Italy','Jamaica','Japan',
  'Jordan','Kazakhstan','Kenya','Kuwait','Kyrgyzstan','Laos','Latvia','Lebanon','Libya','Lithuania',
  'Luxembourg','Madagascar','Malaysia','Maldives','Mali','Malta','Mexico','Moldova','Monaco','Mongolia',
  'Montenegro','Morocco','Mozambique','Myanmar','Namibia','Nepal','Netherlands','New Zealand','Nicaragua','Niger',
  'Nigeria','North Korea','Norway','Oman','Pakistan','Palestine','Panama','Paraguay','Peru','Philippines',
  'Poland','Portugal','Qatar','Romania','Russia','Rwanda','Saudi Arabia','Senegal','Serbia','Singapore',
  'Slovakia','Slovenia','Somalia','South Africa','South Korea','Spain','Sri Lanka','Sudan','Sweden','Switzerland',
  'Syria','Taiwan','Tajikistan','Tanzania','Thailand','Tunisia','Turkey','Turkmenistan','Uganda','Ukraine',
  'United Arab Emirates','United Kingdom','United States','Uruguay','Uzbekistan','Venezuela','Vietnam','Yemen','Zambia','Zimbabwe'
];

const CustomerPage = () => {
  const { customers, customerPageData, fetchCustomersPage, addCustomer, updateCustomer, deleteCustomer } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [viewingCustomer, setViewingCustomer] = useState(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    name: '', email: '', address: '', state: '', pincode: '', country: 'India'
  });

  const emptyForm = { name: '', email: '', address: '', state: '', pincode: '', country: 'India' };

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchCustomersPage(currentPage - 1, itemsPerPage, searchTerm);
  }, [currentPage, searchTerm]);

  const validate = (data) => {
    const e = {};
    if (!data.name?.trim()) e.name = 'Full name is required';
    else if (data.name.trim().length < 3) e.name = 'Name must be at least 3 characters';
    else if (/[^a-zA-Z\s]/.test(data.name.trim())) e.name = 'Name must contain alphabets only';
    if (!data.email?.trim()) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(data.email)) e.email = 'Enter a valid email address';
    if (!data.address?.trim()) e.address = 'Address is required';
    if (!data.state?.trim()) e.state = 'State is required';
    if (!data.country?.trim()) e.country = 'Country is required';
    if (!data.pincode?.trim()) e.pincode = 'PIN code is required';
    else if (!/^\d{6}$/.test(data.pincode.trim())) e.pincode = 'PIN code must be 6 digits';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const displayedCustomers = customerPageData.content.filter(c =>
    (c.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.email || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddCustomer = () => {
    if (!validate(formData)) return;
    addCustomer(formData);
    setFormData(emptyForm);
    setErrors({});
    setShowAddModal(false);
    setCurrentPage(1); // Go to first page to see new customer
  };

  const handleEditCustomer = (customer) => {
    setEditingCustomer(customer);
    setFormData({
      name: customer.name || '',
      email: customer.email || '',
      address: customer.address || '',
      state: customer.state || '',
      pincode: customer.pincode || '',
      country: customer.country || 'India',
    });
    setErrors({});
  };

  const handleUpdateCustomer = () => {
    updateCustomer(editingCustomer.id, formData);
    setEditingCustomer(null);
    setFormData(emptyForm);
  };

  const closeAdd = () => { setShowAddModal(false); setFormData(emptyForm); setErrors({}); };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-8">
      <div className="space-y-8">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
            <p className="text-sm text-gray-400">Manage your customer database</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-xl transition-all duration-300">
              <Download className="w-4 h-4" />
              <span className="font-medium text-sm">Export</span>
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-blue-900 text-white px-6 py-3 rounded-xl hover:shadow-lg transform active:scale-[0.98] transition-all flex items-center gap-2 font-semibold text-sm cursor-pointer"
            >
              <Plus className="w-5 h-5" />
              Add Customer
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-50">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-50 rounded-xl">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <p className="text-xs font-medium text-gray-400">Total Customers</p>
            <h3 className="text-xl font-bold text-gray-900">{customers.length}</h3>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-50 overflow-hidden">
          <div className="p-6 border-b border-gray-50 flex items-center justify-between">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search customers..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-10 pr-4 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-lg w-80 focus:outline-none focus:ring-2 focus:ring-blue-900/10 focus:border-blue-900 dark:text-white text-sm"
              />
            </div>
            <button className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-xl transition-all duration-300">
              <Filter className="w-4 h-4" />
              <span className="font-medium text-sm">Filter</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-gray-400 text-xs uppercase tracking-wider">
                  <th className="px-6 py-4 font-semibold">Name</th>
                  <th className="px-6 py-4 font-semibold">Email</th>       
                  <th className="px-6 py-4 font-semibold">Country</th>
                   <th className="px-6 py-4 font-semibold">State</th>
                  <th className="px-6 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-gray-50">
                {displayedCustomers.length === 0 ? (
                  <tr><td colSpan={5} className="py-8 text-center text-gray-400 text-sm">No customers found</td></tr>
                ) : (
                  displayedCustomers.map((customer) => (
                    <tr key={customer.id} className="hover:bg-blue-50/50 hover:outline hover:outline-2 hover:outline-blue-400 hover:-translate-y-0.5 transition-all cursor-pointer">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-xs uppercase">
                            {(customer.name || '?').charAt(0)}
                          </div>
                          <span className="font-medium text-gray-900">{customer.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-500">{customer.email}</td>

                      <td className="px-6 py-4">
                        <span className="px-2 py-1 rounded-full bg-blue-50 text-blue-600 text-[10px] font-bold uppercase tracking-wider">{customer.country || 'India'}</span>
                      </td>
                       <td className="px-6 py-4">
                        <span className="px-2 py-1 rounded-full bg-blue-50 text-blue-600 text-[10px] font-bold uppercase tracking-wider">{customer.state || 'Tamilnadu'}</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => setViewingCustomer(customer)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all cursor-pointer">
                            <Eye className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleEditCustomer(customer)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all cursor-pointer">
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button onClick={() => deleteCustomer(customer.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all cursor-pointer">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <Pagination
            currentPage={currentPage}
            totalItems={customerPageData.totalElements}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>

      {/* ── Add Customer Modal ── */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md transform transition-all">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 rounded-xl"><Plus className="w-5 h-5 text-blue-600" /></div>
                  <h2 className="text-xl font-bold text-gray-900">Add New Customer</h2>
                </div>
                <button onClick={closeAdd} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-xl transition-all duration-300">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              {/* Full Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^a-zA-Z\s]/g, '');
                    setFormData({ ...formData, name: val });
                    if (errors.name) setErrors({ ...errors, name: '' });
                  }}
                  onBlur={() => validate(formData)}
                  className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:border-transparent bg-gray-50/50 dark:bg-slate-800 dark:text-white transition-colors ${errors.name ? 'border-red-500 focus:ring-red-500' : 'border-gray-200 dark:border-slate-700 focus:ring-blue-500'}`}
                  placeholder="Enter customer name"
                />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
              </div>

              {/* Email Address */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => {
                    setFormData({ ...formData, email: e.target.value });
                    if (errors.email) setErrors({ ...errors, email: '' });
                  }}
                  onBlur={() => validate(formData)}
                  className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:border-transparent bg-gray-50/50 dark:bg-slate-800 dark:text-white transition-colors ${errors.email ? 'border-red-500 focus:ring-red-500' : 'border-gray-200 dark:border-slate-700 focus:ring-blue-500'}`}
                  placeholder="Enter email address"
                />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
              </div>

              {/* Country */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Country</label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none z-10" />
                  <select
                    value={formData.country}
                    onChange={(e) => {
                      setFormData({ ...formData, country: e.target.value });
                      if (errors.country) setErrors({ ...errors, country: '' });
                    }}
                    onBlur={() => validate(formData)}
                    className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:border-transparent bg-gray-50/50 dark:bg-slate-800 dark:text-white transition-colors ${errors.country ? 'border-red-500 focus:ring-red-500' : 'border-gray-200 dark:border-slate-700 focus:ring-blue-500'}`}
                  >
                    <option value="">Select Country</option>
                    {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                {errors.country && <p className="text-red-500 text-xs mt-1">{errors.country}</p>}
              </div>

              {/* Address */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Address</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => {
                    setFormData({ ...formData, address: e.target.value });
                    if (errors.address) setErrors({ ...errors, address: '' });
                  }}
                  onBlur={() => validate(formData)}
                  className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:border-transparent bg-gray-50/50 dark:bg-slate-800 dark:text-white transition-colors ${errors.address ? 'border-red-500 focus:ring-red-500' : 'border-gray-200 dark:border-slate-700 focus:ring-blue-500'}`}
                  placeholder="Enter address"
                />
                {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
              </div>

              {/* State & PIN Code */}
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">State</label>
                  <select
                    value={formData.state}
                    onChange={(e) => {
                      setFormData({ ...formData, state: e.target.value });
                      if (errors.state) setErrors({ ...errors, state: '' });
                    }}
                    onBlur={() => validate(formData)}
                    className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:border-transparent bg-gray-50/50 dark:bg-slate-800 dark:text-white transition-colors ${errors.state ? 'border-red-500 focus:ring-red-500' : 'border-gray-200 dark:border-slate-700 focus:ring-blue-500'}`}
                  >
                    <option value="">Select State</option>
                    <option value="Tamilnadu">Tamilnadu</option>
                    <option value="Kerala">Kerala</option>
                    <option value="Andhra Pradesh">Andhra Pradesh</option>
                    <option value="Karnataka">Karnataka</option>
                    <option value="Maharashtra">Maharashtra</option>
                    <option value="Madhya Pradesh">Madhya Pradesh</option>
                    <option value="Puducherry">Puducherry</option>
                    <option value="Andaman and Nicobar Islands">Andaman and Nicobar Islands</option>
                    <option value="Telangana">Telangana</option>
                    <option value="Delhi">Delhi</option>
                    <option value="Lakshadweep">Lakshadweep</option>
                    <option value="Bihar">Bihar</option>
                  </select>
                  {errors.state && <p className="text-red-500 text-xs mt-1">{errors.state}</p>}
                </div>

                <div className="flex-1">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">PIN Code</label>
                  <input
                    type="text"
                    value={formData.pincode}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                      setFormData({ ...formData, pincode: val });
                      if (errors.pincode) setErrors({ ...errors, pincode: '' });
                    }}
                    onBlur={() => validate(formData)}
                    className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:border-transparent bg-gray-50/50 dark:bg-slate-800 dark:text-white transition-colors ${errors.pincode ? 'border-red-500 focus:ring-red-500' : 'border-gray-200 dark:border-slate-700 focus:ring-blue-500'}`}
                    placeholder="Enter PIN code"
                    maxLength={6}
                  />
                  {errors.pincode && <p className="text-red-500 text-xs mt-1">{errors.pincode}</p>}
                </div>
              </div>

              {/* Add Customer Button */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleAddCustomer}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-xl hover:shadow-lg transition-all duration-300 font-semibold"
                >
                  Add Customer
                </button>
                <button
                  onClick={closeAdd}
                  className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl hover:bg-gray-200 transition-all duration-300 font-semibold"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Edit Customer Modal ── */}
      {editingCustomer && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md transform transition-all">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-50 rounded-xl"><Edit2 className="w-5 h-5 text-green-600" /></div>
                  <h2 className="text-xl font-bold text-gray-900">Edit Customer</h2>
                </div>
                <button onClick={() => setEditingCustomer(null)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-xl transition-all duration-300">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-gray-50/50 dark:bg-slate-800 dark:text-white transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-gray-50/50 dark:bg-slate-800 dark:text-white transition-colors"
                />
              </div>              {/* Country */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Country</label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none z-10" />
                  <select
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-gray-50/50 dark:bg-slate-800 dark:text-white transition-colors"
                  >
                    <option value="">Select Country</option>
                    {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Address</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-gray-50/50 dark:bg-slate-800 dark:text-white transition-colors"
                />
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">State</label>
                  <select
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-gray-50/50 dark:bg-slate-800 dark:text-white transition-colors"
                  >
                    <option value="">Select State</option>
                    <option value="Tamilnadu">Tamilnadu</option>
                    <option value="Kerala">Kerala</option>
                    <option value="Andhra Pradesh">Andhra Pradesh</option>
                    <option value="Karnataka">Karnataka</option>
                    <option value="Maharashtra">Maharashtra</option>
                    <option value="Madhya Pradesh">Madhya Pradesh</option>
                    <option value="Puducherry">Puducherry</option>
                    <option value="Andaman and Nicobar Islands">Andaman and Nicobar Islands</option>
                    <option value="Telangana">Telangana</option>
                    <option value="Delhi">Delhi</option>
                    <option value="Lakshadweep">Lakshadweep</option>
                    <option value="Bihar">Bihar</option>
                  </select>
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">PIN Code</label>
                  <input
                    type="text"
                    value={formData.pincode}
                    onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-gray-50/50 dark:bg-slate-800 dark:text-white transition-colors"
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleUpdateCustomer}
                  className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 rounded-xl hover:shadow-lg transition-all duration-300 font-semibold flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Update Customer
                </button>
                <button
                  onClick={() => setEditingCustomer(null)}
                  className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl hover:bg-gray-200 transition-all duration-300 font-semibold"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── View Customer Modal ── */}
      {viewingCustomer && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md transform transition-all">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 rounded-xl"><Eye className="w-5 h-5 text-blue-600" /></div>
                  <h2 className="text-xl font-bold text-gray-900">Customer Details</h2>
                </div>
                <button onClick={() => setViewingCustomer(null)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-xl transition-all duration-300">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                  {(viewingCustomer.name || '?').charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-lg">{viewingCustomer.name}</h3>
                  <p className="text-sm text-gray-500">Customer</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <Globe className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Country</p>
                    <p className="font-medium text-gray-900">{viewingCustomer.country || 'India'}</p>
                  </div>

                 
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <Mail className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-medium text-gray-900">{viewingCustomer.email || '—'}</p>
                  </div>
                </div>
                {viewingCustomer.address && (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                    <MapPin className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Address Details</p>
                      <p className="font-medium text-gray-900">
                        {viewingCustomer.address}
                        {(viewingCustomer.state || viewingCustomer.pincode) && ', '}
                        {viewingCustomer.state} {viewingCustomer.pincode}
                      </p>
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Created At</p>
                    <p className="font-medium text-gray-900">
                      {viewingCustomer.createdAt || viewingCustomer.created_at
                        ? new Date(viewingCustomer.createdAt || viewingCustomer.created_at).toLocaleString()
                        : 'Not available'}
                    </p>
                  </div>
                </div>
              </div>
              <div className="pt-4">
                <button
                  onClick={() => setViewingCustomer(null)}
                  className="w-full bg-gray-100 text-gray-700 py-3 rounded-xl hover:bg-gray-200 transition-all duration-300 font-semibold"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CustomerPage;