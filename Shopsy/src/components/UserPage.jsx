import React, { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { Search, User, Mail, Phone, Shield, Calendar, X, Eye, Edit2, Trash2, Check, AlertTriangle, Plus } from 'lucide-react';
import Pagination from './Pagination';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper 
} from '@mui/material';

const UserPage = () => {
  const { registeredUsers, fetchUsersPage, updateUser, deleteUser, registerUser } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [viewingUser, setViewingUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', email: '', phone: '', role: '', username: '' });
  const [editLoading, setEditLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm, setAddForm] = useState({ name: '', email: '', phone: '', role: 'user', username: '', password: '' });
  const [addLoading, setAddLoading] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Fetch users on mount to ensure list is populated
  React.useEffect(() => {
    const controller = new AbortController();
    fetchUsersPage(0, 1000, '', controller.signal);
    return () => controller.abort();
  }, [fetchUsersPage]);

  const filteredUsers = (registeredUsers || []).filter(user =>
    (user.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.username || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openViewModal = (user) => {
    setViewingUser(user);
    setIsEditing(false);
    setShowDeleteConfirm(false);
    setSuccessMsg('');
    setEditForm({
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || '',
      role: user.role || 'user',
      username: user.username || '',
    });
  };

  const handleRegisterNewUser = async () => {
    if (!addForm.name || !addForm.email || !addForm.username || !addForm.password) {
      alert('Please fill in required fields (Name, Username, Email, Password)');
      return;
    }
    setAddLoading(true);
    try {
      await registerUser(addForm);
      setShowAddModal(false);
      setAddForm({ name: '', email: '', phone: '', role: 'user', username: '', password: '' });
      setSuccessMsg('User registered successfully!');
      setTimeout(() => setSuccessMsg(''), 2500);
      fetchUsersPage(0, 1000, '');
    } catch (err) {
      alert('Failed to register user: ' + (err.message || 'Unknown error'));
    } finally {
      setAddLoading(false);
    }
  };

  const handleStartEdit = () => {
    setIsEditing(true);
    setShowDeleteConfirm(false);
    setSuccessMsg('');
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    if (viewingUser) {
      setEditForm({
        name: viewingUser.name || '',
        email: viewingUser.email || '',
        phone: viewingUser.phone || '',
        role: viewingUser.role || 'user',
        username: viewingUser.username || '',
      });
    }
  };

  const handleSaveEdit = async () => {
    if (!editForm.name.trim() || !editForm.email.trim()) {
      alert('Name and Email are required.');
      return;
    }
    if (!viewingUser?.id) {
      alert('Error: User ID is missing. Cannot update.');
      return;
    }
    setEditLoading(true);
    try {
      const success = await updateUser(viewingUser.id, editForm);
      if (success) {
        // Update the viewing user with new data
        setViewingUser(prev => ({ ...prev, ...editForm }));
        setIsEditing(false);
        setSuccessMsg('User updated successfully!');
        setTimeout(() => setSuccessMsg(''), 2500);
      } else {
        alert('Failed to update user. Please try again.');
      }
    } catch (err) {
      console.error('Failed to update user:', err);
      alert('An error occurred while saving changes.');
    } finally {
      setEditLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    setDeleteLoading(true);
    try {
      await deleteUser(viewingUser.id);
      setViewingUser(null);
      setShowDeleteConfirm(false);
    } catch (err) {
      console.error('Failed to delete user:', err);
    } finally {
      setDeleteLoading(false);
    }
  };

  const closeModal = () => {
    setViewingUser(null);
    setIsEditing(false);
    setShowDeleteConfirm(false);
    setSuccessMsg('');
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-400">User Management</h1>
          <p className="text-sm text-gray-400">View registered users and their details</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-blue-900 text-white px-6 py-3 rounded-xl hover:shadow-lg transform active:scale-[0.98] transition-all flex items-center gap-2 font-semibold text-sm cursor-pointer"
        >
          <Plus className="w-5 h-5 font-bold" />
          Add User
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-50 flex items-center gap-4 hover:border-blue-200 transition-all group cursor-pointer">
          <div className="p-3 bg-blue-50 rounded-xl group-hover:bg-blue-600 transition-colors">
            <User className="w-6 h-6 text-blue-600 group-hover:text-white" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 mb-1 uppercase tracking-wider">Total Users</p>
            <h3 className="text-2xl font-bold text-slate-800">{registeredUsers?.length || 0}</h3>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-50 overflow-hidden">
        <div className="p-6 border-b border-gray-50">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-10 pr-4 py-2 bg-white border border-gray-200 text-gray-900 rounded-lg w-80 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 text-sm shadow-sm"
            />
          </div>
        </div>

        <TableContainer component={Paper} elevation={0} sx={{ background: 'transparent', border: 'none', borderRadius: 0 }}>
          <Table sx={{ minWidth: 650 }} aria-label="users table">
            <TableHead>
              <TableRow sx={{ '& th': { borderBottom: '1px solid rgb(249, 250, 251)', py: 2, px: 3 } }}>
                <TableCell sx={{ color: 'rgb(156, 163, 175)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>User Details</TableCell>
                <TableCell sx={{ color: 'rgb(156, 163, 175)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Contact Info</TableCell>
                <TableCell align="center" sx={{ color: 'rgb(156, 163, 175)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Role</TableCell>
                <TableCell sx={{ color: 'rgb(156, 163, 175)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Registered At</TableCell>
                <TableCell align="right" sx={{ color: 'rgb(156, 163, 175)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredUsers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((user) => (
                <TableRow 
                  key={user.id} 
                  hover
                  onClick={() => openViewModal(user)}
                  sx={{ 
                    cursor: 'pointer',
                    '&:hover': { backgroundColor: 'rgba(239, 246, 255, 0.3) !important' },
                    transition: 'all 0.2s',
                    '& td': { borderBottom: '1px solid rgb(249, 250, 251)', py: 2, px: 3 }
                  }}
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm uppercase">
                        {(user.name || user.username || 'U').charAt(0)}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-gray-900">{user.name || user.username}</span>
                        <span className="text-xs text-gray-400">@{user.username || 'n/a'}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Mail className="w-3.5 h-3.5 text-gray-400" />
                        <span>{user.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Phone className="w-3.5 h-3.5 text-gray-400" />
                        <span>{user.phone || 'N/A'}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell align="center">
                    <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-[10px] font-bold uppercase tracking-widest border border-blue-100">
                      {user.role || 'user'}
                    </span>
                  </TableCell>
                  <TableCell className="text-gray-500 font-medium">
                    {user.registeredAt ? new Date(user.registeredAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A'}
                  </TableCell>
                  <TableCell align="right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); openViewModal(user); }}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                        title="View"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); openViewModal(user); setTimeout(() => setIsEditing(true), 100); }}
                        className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                        title="Edit"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); openViewModal(user); setTimeout(() => setShowDeleteConfirm(true), 100); }}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filteredUsers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 10, color: 'rgb(156, 163, 175)', fontStyle: 'italic', border: 'none' }}>
                    No users found matching your search.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <Pagination
          currentPage={currentPage}
          totalItems={filteredUsers.length}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
        />
      </div>

      {/* ─── User Profile Modal with Edit/Delete ─── */}
      {viewingUser && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={closeModal}>
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
            style={{ animation: 'modalSlideIn 0.3s ease' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #2563eb, #1d4ed8, #1e40af)' }}>
              {/* Decorative circles */}
              <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full" style={{ background: 'rgba(255,255,255,0.08)' }} />
              <div className="absolute -bottom-6 -left-6 w-24 h-24 rounded-full" style={{ background: 'rgba(255,255,255,0.05)' }} />
              
              <div className="p-6 text-white relative z-10">
                <button
                  onClick={closeModal}
                  className="absolute right-4 top-4 p-1.5 rounded-full hover:bg-white/20 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
                <div className="flex flex-col items-center">
                  <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm text-white flex items-center justify-center text-3xl font-bold uppercase mb-4 border-4 border-white/30 shadow-lg">
                    {(viewingUser.name || viewingUser.username || 'U').charAt(0)}
                  </div>
                  {!isEditing ? (
                    <>
                      <h2 className="text-xl font-bold">{viewingUser.name || viewingUser.username}</h2>
                      <p className="text-blue-200 text-sm">@{viewingUser.username || 'n/a'}</p>
                    </>
                  ) : (
                    <div className="text-center">
                      <p className="text-sm font-medium text-blue-200">Editing Profile</p>
                      <h2 className="text-xl font-bold">{editForm.name || 'User'}</h2>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Success Message */}
            {successMsg && (
              <div className="mx-6 mt-4 flex items-center gap-2 px-4 py-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-sm font-medium" style={{ animation: 'modalSlideIn 0.2s ease' }}>
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                {successMsg}
              </div>
            )}

            {/* Delete Confirmation */}
            {showDeleteConfirm && (
              <div className="mx-6 mt-4 p-4 bg-red-50 border border-red-200 rounded-xl" style={{ animation: 'modalSlideIn 0.2s ease' }}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-red-100 rounded-full">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-red-900 text-sm">Delete this user?</h4>
                    <p className="text-red-600 text-xs">This action cannot be undone.</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleDeleteUser}
                    disabled={deleteLoading}
                    className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-sm rounded-lg transition-colors disabled:opacity-60"
                  >
                    {deleteLoading ? 'Deleting...' : 'Yes, Delete'}
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="flex-1 py-2 bg-white hover:bg-gray-50 text-gray-700 font-bold text-sm rounded-lg transition-colors border border-gray-200"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Modal Body */}
            <div className="p-6 space-y-5">
              {!isEditing ? (
                /* ── View Mode ── */
                <div className="space-y-4">
                  {[
                    { icon: Mail, label: 'Email Address', value: viewingUser.email },
                    { icon: Phone, label: 'Phone Number', value: viewingUser.phone || 'Not provided' },
                    { icon: Shield, label: 'Account Role', value: (viewingUser.role || 'user').toUpperCase(), isBadge: true },
                    { icon: Calendar, label: 'Joined On', value: viewingUser.registeredAt 
                      ? new Date(viewingUser.registeredAt).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) 
                      : 'N/A' 
                    },
                  ].map(({ icon: Icon, label, value, isBadge }) => (
                    <div key={label} className="flex items-center gap-4 group">
                      <div className="p-2.5 bg-slate-50 rounded-lg text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">{label}</label>
                        {isBadge ? (
                          <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-100">{value}</span>
                        ) : (
                          <p className="text-slate-700 font-medium">{value}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                /* ── Edit Mode ── */
                <div className="space-y-4" style={{ animation: 'modalSlideIn 0.25s ease' }}>
                  {[
                    { key: 'name', label: 'Full Name', type: 'text', icon: User, required: true },
                    { key: 'username', label: 'Username', type: 'text', icon: User, required: false },
                    { key: 'email', label: 'Email Address', type: 'email', icon: Mail, required: true },
                    { key: 'phone', label: 'Phone Number', type: 'tel', icon: Phone, required: false },
                  ].map(({ key, label, type, icon: Icon, required }) => (
                    <div key={key} className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-600 ml-1 flex items-center gap-1.5">
                        <Icon className="w-3.5 h-3.5 text-gray-400" />
                        {label}
                        {required && <span className="text-red-400">*</span>}
                      </label>
                      <input
                        type={type}
                        value={editForm[key]}
                        onChange={(e) => setEditForm(prev => ({ ...prev, [key]: e.target.value }))}
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 focus:bg-white transition-all text-sm font-medium text-gray-800"
                        placeholder={`Enter ${label.toLowerCase()}`}
                        required={required}
                      />
                    </div>
                  ))}

                  {/* Role Selector */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-600 ml-1 flex items-center gap-1.5">
                      <Shield className="w-3.5 h-3.5 text-gray-400" />
                      Role
                    </label>
                    <select
                      value={editForm.role}
                      onChange={(e) => setEditForm(prev => ({ ...prev, role: e.target.value }))}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 focus:bg-white transition-all text-sm font-medium text-gray-800"
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                      <option value="moderator">Moderator</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-2 space-y-2">
                {!isEditing ? (
                  /* View mode buttons */
                  <div className="flex gap-2">
                    <button
                      onClick={handleStartEdit}
                      className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2 text-sm"
                    >
                      <Edit2 className="w-4 h-4" />
                      Edit Profile
                    </button>
                    <button
                      onClick={() => setShowDeleteConfirm(true)}
                      className="py-3 px-4 bg-red-50 hover:bg-red-100 text-red-600 font-bold rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2 text-sm border border-red-200"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={closeModal}
                      className="py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-xl transition-all active:scale-95 text-sm"
                    >
                      Close
                    </button>
                  </div>
                ) : (
                  /* Edit mode buttons */
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleSaveEdit}
                      disabled={editLoading || !editForm.name.trim() || !editForm.email.trim()}
                      className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2 text-sm disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      <Check className="w-4 h-4" />
                      {editLoading ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-xl transition-all active:scale-95 text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all" style={{ animation: 'modalSlideIn 0.3s ease' }}>
            <div className="p-6 border-b border-gray-100 bg-black flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 rounded-xl">
                  <Plus className="w-5 h-5 text-blue-600 font-bold" />
                </div>
                <h2 className="text-xl font-bold text-white uppercase tracking-tight">Add New User</h2>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-xl transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4 bg-white">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-600 ml-1">Full Name *</label>
                  <input
                    type="text"
                    value={addForm.name}
                    onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 text-sm font-medium"
                    placeholder="John Doe"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-600 ml-1">Username *</label>
                  <input
                    type="text"
                    value={addForm.username}
                    onChange={(e) => setAddForm({ ...addForm, username: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 text-sm font-medium"
                    placeholder="johndoe"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-600 ml-1">Email Address *</label>
                <input
                  type="email"
                  value={addForm.email}
                  onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 text-sm font-medium"
                  placeholder="john@example.com"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-600 ml-1">Password *</label>
                <input
                  type="password"
                  value={addForm.password}
                  onChange={(e) => setAddForm({ ...addForm, password: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 text-sm font-medium"
                  placeholder="••••••••"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-600 ml-1">Phone</label>
                  <input
                    type="tel"
                    value={addForm.phone}
                    onChange={(e) => setAddForm({ ...addForm, phone: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 text-sm font-medium"
                    placeholder="+1 234..."
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-600 ml-1">Role</label>
                  <select
                    value={addForm.role}
                    onChange={(e) => setAddForm({ ...addForm, role: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 text-sm font-medium"
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                    <option value="moderator">Moderator</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleRegisterNewUser}
                  disabled={addLoading}
                  className="flex-1 bg-blue-900 text-white py-3 rounded-xl hover:shadow-lg transition-all font-bold text-sm disabled:opacity-60 transform active:scale-[0.98]"
                >
                  {addLoading ? 'Registering...' : 'Add User'}
                </button>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl hover:bg-gray-200 transition-all font-bold text-sm transform active:scale-[0.98]"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal animation keyframes */}
      <style>{`
        @keyframes modalSlideIn {
          from { opacity: 0; transform: translateY(12px) scale(0.97); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
};

export default UserPage;
