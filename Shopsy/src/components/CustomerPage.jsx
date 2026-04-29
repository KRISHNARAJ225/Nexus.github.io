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
  const [customerToDelete, setCustomerToDelete] = useState(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    name: '', email: '', address: '', state: '', pincode: '', country: 'India', address2: '', state2: ''
  });

  const emptyForm = { name: '', email: '', address: '', state: '', pincode: '', country: 'India', address2: '', state2: '' };

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
    const payload = {
      ...formData,
      address: formData.address + (formData.address2 ? ` | ${formData.address2}` : ''),
      state: formData.state + (formData.state2 ? ` | ${formData.state2}` : '')
    };
    addCustomer(payload);
    setFormData(emptyForm);
    setErrors({});
    setShowAddModal(false);
    setCurrentPage(1); // Go to first page to see new customer
  };

  const handleEditCustomer = (customer) => {
    setEditingCustomer(customer);
    const [addr1, addr2] = (customer.address || '').split(' | ');
    const [st1, st2] = (customer.state || '').split(' | ');
    setFormData({
      name: customer.name || '',
      email: customer.email || '',
      address: addr1 || '',
      address2: addr2 || '',
      state: st1 || '',
      state2: st2 || '',
      pincode: customer.pincode || '',
      country: customer.country || 'India',
    });
    setErrors({});
  };

  const handleUpdateCustomer = () => {
    const payload = {
      ...formData,
      address: formData.address + (formData.address2 ? ` | ${formData.address2}` : ''),
      state: formData.state + (formData.state2 ? ` | ${formData.state2}` : '')
    };
    updateCustomer(editingCustomer.id, payload);
    setEditingCustomer(null);
    setFormData(emptyForm);
  };

  const closeAdd = () => { setShowAddModal(false); setFormData(emptyForm); setErrors({}); };

  return (
    <div className="min-h-screen bg-[#f4f7fe] dark:bg-[#1e1e2d] p-8 transition-colors duration-300">
      <div className="space-y-8">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Customers</h1>
            <p className="text-sm text-gray-400 dark:text-slate-500">Manage your customer database</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2 text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800 rounded-xl transition-all duration-300 cursor-pointer">
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-[#151521] p-6 rounded-2xl shadow-sm border border-gray-50 dark:border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <p className="text-xs font-medium text-gray-400 dark:text-slate-500">Total Customers</p>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">{customers.length}</h3>
          </div>
        </div>

        <div className="bg-white dark:bg-[#151521] rounded-2xl shadow-sm border border-gray-50 dark:border-slate-800 overflow-hidden">
          <div className="p-6 border-b border-gray-50 dark:border-slate-800 flex items-center justify-between">
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
            <button className="flex items-center gap-2 px-4 py-2 text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800 rounded-xl transition-all duration-300 cursor-pointer">
              <Filter className="w-4 h-4" />
              <span className="font-medium text-sm">Filter</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-gray-400 dark:text-slate-500 text-xs uppercase tracking-wider">
                  <th className="px-6 py-4 font-semibold">Name</th>
                  <th className="px-6 py-4 font-semibold">Email</th>       
                  <th className="px-6 py-4 font-semibold">Country</th>
                   <th className="px-6 py-4 font-semibold">State</th>
                  <th className="px-6 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-gray-50 dark:divide-slate-800">
                {displayedCustomers.length === 0 ? (
                  <tr><td colSpan={5} className="py-8 text-center text-gray-400 dark:text-slate-500 text-sm">No customers found</td></tr>
                ) : (
                  displayedCustomers.map((customer) => (
                    <tr key={customer.id} className="hover:bg-blue-50/50 dark:hover:bg-blue-900/10 hover:outline hover:outline-2 hover:outline-blue-400 hover:-translate-y-0.5 transition-all cursor-pointer">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-xs uppercase">
                            {(customer.name || '?').charAt(0)}
                          </div>
                          <span className="font-medium text-gray-900 dark:text-slate-200">{customer.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-500 dark:text-slate-400">{customer.email}</td>

                      <td className="px-6 py-4">
                        <span className="px-2 py-1 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-[10px] font-bold uppercase tracking-wider">{customer.country || 'India'}</span>
                      </td>
                       <td className="px-6 py-4">
                        <span className="px-2 py-1 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-[10px] font-bold uppercase tracking-wider">{customer.state || 'Tamilnadu'}</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => setViewingCustomer(customer)} className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all cursor-pointer">
                            <Eye className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleEditCustomer(customer)} className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all cursor-pointer">
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button onClick={() => setCustomerToDelete(customer.id)} className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all cursor-pointer">
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
          <div className="bg-white dark:bg-[#151521] rounded-2xl shadow-2xl w-full max-w-md transform transition-all border border-gray-100 dark:border-slate-800">
            <div className="p-6 border-b border-gray-100 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-xl"><Plus className="w-5 h-5 text-blue-600 dark:text-blue-400" /></div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Add New Customer</h2>
                </div>
                <button onClick={closeAdd} className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800 rounded-xl transition-all duration-300 cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              {/* Full Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-slate-400 mb-2">Full Name</label>
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
                <label className="block text-sm font-semibold text-gray-700 dark:text-slate-400 mb-2">Email Address</label>
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
                <label className="block text-sm font-semibold text-gray-700 dark:text-slate-400 mb-2">Country</label>
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
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-slate-400 mb-2">Primary Address</label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => {
                      setFormData({ ...formData, address: e.target.value });
                      if (errors.address) setErrors({ ...errors, address: '' });
                    }}
                    className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:border-transparent bg-gray-50/50 dark:bg-slate-800 dark:text-white transition-colors ${errors.address ? 'border-red-500 focus:ring-red-500' : 'border-gray-200 dark:border-slate-700 focus:ring-blue-500'}`}
                    placeholder="Enter primary address"
                  />
                  {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-slate-400 mb-2">Secondary Address (Optional)</label>
                  <input
                    type="text"
                    value={formData.address2}
                    onChange={(e) => setFormData({ ...formData, address2: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50/50 dark:bg-slate-800 dark:text-white transition-colors"
                    placeholder="Enter secondary address"
                  />
                </div>
              </div>

              {/* State & PIN Code */}
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-slate-400 mb-2">State</label>
                  <select
                    value={formData.state}
                    onChange={(e) => {
                      setFormData({ ...formData, state: e.target.value });
                      if (errors.state) setErrors({ ...errors, state: '' });
                    }}
                    className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:border-transparent bg-gray-50/50 dark:bg-slate-800 dark:text-white transition-colors ${errors.state ? 'border-red-500 focus:ring-red-500' : 'border-gray-200 dark:border-slate-700 focus:ring-blue-500'}`}
                  >
                    <option value="">Primary State</option>
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
                  <label className="block text-sm font-semibold text-gray-700 dark:text-slate-400 mb-2">Secondary State</label>
                  <select
                    value={formData.state2}
                    onChange={(e) => setFormData({ ...formData, state2: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50/50 dark:bg-slate-800 dark:text-white transition-colors"
                  >
                    <option value="">Secondary State</option>
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
              </div>

              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-slate-400 mb-2">PIN Code</label>
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
                  className="flex-1 bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300 py-3 rounded-xl hover:bg-gray-200 dark:hover:bg-slate-700 transition-all duration-300 font-semibold cursor-pointer"
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
          <div className="bg-white dark:bg-[#151521] rounded-2xl shadow-2xl w-full max-w-md transform transition-all border border-gray-100 dark:border-slate-800">
            <div className="p-6 border-b border-gray-100 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-50 dark:bg-emerald-900/20 rounded-xl"><Edit2 className="w-5 h-5 text-green-600 dark:text-emerald-400" /></div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Edit Customer</h2>
                </div>
                <button onClick={() => setEditingCustomer(null)} className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800 rounded-xl transition-all duration-300 cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-slate-400 mb-2">Full Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-gray-50/50 dark:bg-slate-800 dark:text-white transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-slate-400 mb-2">Email Address</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-gray-50/50 dark:bg-slate-800 dark:text-white transition-colors"
                />
              </div>              {/* Country */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-slate-400 mb-2">Country</label>
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
                <label className="block text-sm font-semibold text-gray-700 dark:text-slate-400 mb-2">Address</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-gray-50/50 dark:bg-slate-800 dark:text-white transition-colors"
                />
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-slate-400 mb-2">State</label>
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
                  <label className="block text-sm font-semibold text-gray-700 dark:text-slate-400 mb-2">PIN Code</label>
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
                  className="flex-1 bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300 py-3 rounded-xl hover:bg-gray-200 dark:hover:bg-slate-700 transition-all duration-300 font-semibold cursor-pointer"
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
          <div className="bg-white dark:bg-[#151521] rounded-2xl shadow-2xl w-full max-w-md transform transition-all border border-gray-100 dark:border-slate-800">
            <div className="p-6 border-b border-gray-100 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-xl"><Eye className="w-5 h-5 text-blue-600 dark:text-blue-400" /></div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Customer Details</h2>
                </div>
                <button onClick={() => setViewingCustomer(null)} className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800 rounded-xl transition-all duration-300 cursor-pointer">
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
                  <h3 className="font-bold text-gray-900 dark:text-white text-lg">{viewingCustomer.name}</h3>
                  <p className="text-sm text-gray-500 dark:text-slate-400">Customer</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-slate-800/50 rounded-xl">
                  <Globe className="w-5 h-5 text-gray-400 dark:text-slate-500" />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-slate-400">Country</p>
                    <p className="font-medium text-gray-900 dark:text-white">{viewingCustomer.country || 'India'}</p>
                  </div>

                 
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-slate-800/50 rounded-xl">
                  <Mail className="w-5 h-5 text-gray-400 dark:text-slate-500" />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-slate-400">Email</p>
                    <p className="font-medium text-gray-900 dark:text-white">{viewingCustomer.email || '—'}</p>
                  </div>
                </div>
                {viewingCustomer.address && (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-slate-800/50 rounded-xl">
                    <MapPin className="w-5 h-5 text-gray-400 dark:text-slate-500" />
                    <div className="flex-1">
                      <p className="text-sm text-gray-600 dark:text-slate-400">Address Details</p>
                      <div className="font-medium text-gray-900 dark:text-white space-y-1">
                        {viewingCustomer.address.split(' | ').map((addr, idx) => (
                          <div key={idx} className={idx > 0 ? "pt-1 border-t border-gray-100 dark:border-slate-700 mt-1" : ""}>
                            <p className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-tighter mb-0.5">Address {idx + 1}</p>
                            {addr}
                          </div>
                        ))}
                        <p className="pt-2 text-xs text-gray-500">
                          State: {viewingCustomer.state} | PIN: {viewingCustomer.pincode}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-slate-800/50 rounded-xl">
                  <Calendar className="w-5 h-5 text-gray-400 dark:text-slate-500" />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-slate-400">Created At</p>
                    <p className="font-medium text-gray-900 dark:text-white">
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
                  className="w-full bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300 py-3 rounded-xl hover:bg-gray-200 dark:hover:bg-slate-700 transition-all duration-300 font-semibold cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {customerToDelete && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[60]">
          <div className="bg-white dark:bg-[#151521] rounded-2xl p-6 w-full max-w-sm m-4 border dark:border-slate-800 shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-4">
                <Trash2 className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Delete Customer</h3>
              <p className="text-gray-500 dark:text-slate-400 mb-6 text-sm">Are you sure you want to delete this customer? This action cannot be undone.</p>
              <div className="flex gap-3 w-full">
                <button
                  onClick={() => setCustomerToDelete(null)}
                  className="flex-1 px-4 py-2.5 bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300 rounded-xl font-semibold hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => { deleteCustomer(customerToDelete); setCustomerToDelete(null); }}
                  className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 shadow-lg shadow-red-500/30 transition-colors"
                >
                  Delete
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