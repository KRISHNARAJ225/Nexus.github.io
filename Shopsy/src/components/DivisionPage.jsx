import React, { useState, useEffect } from 'react';
import { FolderOpen, Plus, Edit2, Trash2, Eye, Search, X, Save, Tag, Package, Box, Archive, Filter, Download, Upload, Grid3X3, List } from 'lucide-react';
import { useData } from '../contexts/DataContext';
import Pagination from './Pagination';

const DivisionPage = () => {
  const { categories: divisions, categoryPageData: divisionPageData, fetchCategoriesPage: fetchDivisionsPage, addCategory: addDivision, updateCategory: updateDivision, deleteCategory: deleteDivision, products } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingDivision, setEditingDivision] = useState(null);
  const [viewingDivision, setViewingDivision] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // grid or list
  const emptyForm = {
    name: '',
    type: 'Physical Goods',
    batchCode: ''
  };

  const [formData, setFormData] = useState(emptyForm);
  const [errors, setErrors] = useState({});

  const validate = (data) => {
    const e = {};
    if (!data.name?.trim()) e.name = 'Division name is required';
    if (!data.type) e.type = 'Division type is required';
    
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  useEffect(() => {
    fetchDivisionsPage(currentPage - 1, itemsPerPage, searchTerm);
  }, [currentPage, searchTerm, fetchDivisionsPage]);

  const divisionTypes = ['Physical Goods', 'Digital', 'Services'];

  const displayedDivisions = divisionPageData.content
    .filter(division =>
      (division.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (division.type || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (division.batchCode || '').toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      const codeA = a.batchCode || '';
      const codeB = b.batchCode || '';
      return codeA.localeCompare(codeB);
    });

  const handleAddDivision = () => {
    if (!validate(formData)) return;
    addDivision(formData);
    setFormData(emptyForm);
    setShowAddModal(false);
    setErrors({});
  };

  const handleEditDivision = (division) => {
    setEditingDivision(division);
    setFormData({
      name: division.name || '',
      type: division.type || 'Physical Goods',
      batchCode: division.batchCode || ''
    });
    setErrors({});
  };

  const handleUpdateDivision = () => {
    if (!validate(formData)) return;
    updateDivision(editingDivision.id, formData);
    setEditingDivision(null);
    setFormData(emptyForm);
    setErrors({});
  };

  const handleDeleteDivision = (id) => {
    deleteDivision(id);
  };

  const handleViewDivision = (division) => {
    setViewingDivision(division);
  };

  const getDivisionIcon = (type) => {
    switch(type) {
      case 'Physical Goods': return <Package className="w-5 h-5" />;
      case 'Digital': return <Box className="w-5 h-5" />;
      case 'Services': return <Archive className="w-5 h-5" />;
      default: return <Tag className="w-5 h-5" />;
    }
  };

  const getDivisionColor = (type) => {
    switch(type) {
      case 'Physical Goods': return 'blue';
      case 'Digital': return 'green';
      case 'Services': return 'purple';
      default: return 'gray';
    }
  };

  const getDivisionStats = (divisionName) => {
    const count = products.filter(p =>
      (p.division || '').toLowerCase() === (divisionName || '').toLowerCase()
    ).length;
    return { items: count, growth: count > 0 ? `+${count}` : '0' };
  };

  return (
    <div className="space-y-8">
      {/* Page Header Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Divisions</h1>
          <p className="text-sm text-gray-400">Manage your product divisions</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800 rounded-xl transition-all duration-300">
            <Download className="w-4 h-4" />
            <span className="font-medium text-sm">Export</span>
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-blue-900 text-white px-6 py-3 rounded-xl hover:shadow-lg transform active:scale-[0.98] transition-all flex items-center gap-2 font-semibold text-sm"
          >
            <Plus className="w-5 h-5" />
            Add Division
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-[#151521] p-6 rounded-2xl shadow-sm border border-gray-50 dark:border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
              <FolderOpen className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Total Divisions</p>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">{divisions.length}</h3>
        </div>
      </div>

      {/* Main Table Section */}
      <div className="bg-white dark:bg-[#151521] rounded-2xl shadow-sm border border-gray-50 dark:border-slate-800 overflow-hidden">
        <div className="p-6 border-b border-gray-50 dark:border-slate-800 flex items-center justify-between">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search divisions..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-10 pr-4 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-lg w-80 focus:outline-none focus:ring-2 focus:ring-blue-900/10 focus:border-blue-900 text-sm text-gray-900 dark:text-white"
            />
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-blue-900 text-white shadow-md' : 'text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800'}`}
            >
              <Grid3X3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-blue-900 text-white shadow-md' : 'text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800'}`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

        {viewMode === 'grid' ? (
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayedDivisions.map((division) => (
              <div key={division.id} className="group p-6 bg-white dark:bg-slate-800/40 rounded-2xl border border-slate-100/50 dark:border-slate-800/50 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] hover:-translate-y-2 hover:shadow-2xl hover:shadow-blue-500/10 hover:border-blue-500/30 transition-all duration-300 cursor-pointer">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 bg-${getDivisionColor(division.type)}-50 dark:bg-${getDivisionColor(division.type)}-900/20 text-${getDivisionColor(division.type)}-600 dark:text-${getDivisionColor(division.type)}-400 rounded-xl`}>
                    {getDivisionIcon(division.type)}
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleEditDivision(division)} className="p-1.5 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/30">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDeleteDivision(division.id)} className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-1">{division.name}</h4>
                <div className="flex items-center justify-between mt-1">
                  <p className="text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest">{division.type}</p>
                  <p className="text-[10px] font-mono bg-gray-100 dark:bg-slate-700 px-2 py-0.5 rounded text-gray-600 dark:text-slate-300">{division.batchCode || 'N/A'}</p>
                </div>
                <div className="mt-6 pt-6 border-t border-gray-100 dark:border-slate-700 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] text-gray-400 dark:text-slate-500 font-bold uppercase tracking-wider mb-1">Items</p>
                    <p className="text-sm font-bold text-gray-900 dark:text-white">{getDivisionStats(division.name).items}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-gray-400 dark:text-slate-500 font-bold uppercase tracking-wider mb-1">Products</p>
                    <p className="text-sm font-bold text-green-600 dark:text-green-400">{getDivisionStats(division.name).growth}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-gray-400 text-xs uppercase tracking-wider">
                  <th className="px-6 py-4 font-semibold">Name</th>
                  <th className="px-6 py-4 font-semibold">Batch Code</th>
                  <th className="px-6 py-4 font-semibold">Type</th>
                  <th className="px-6 py-4 font-semibold">Items</th>
                  <th className="px-6 py-4 font-semibold">Growth</th>
                  <th className="px-6 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-gray-50 dark:divide-slate-800">
                {displayedDivisions.map((division) => (
                  <tr key={division.id} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full bg-${getDivisionColor(division.type)}-50 dark:bg-${getDivisionColor(division.type)}-900/20 text-${getDivisionColor(division.type)}-600 dark:text-${getDivisionColor(division.type)}-400 flex items-center justify-center`}>
                          {getDivisionIcon(division.type)}
                        </div>
                        <span className="font-medium text-gray-900 dark:text-white">{division.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-500 dark:text-slate-400 font-mono text-xs">{division.batchCode || 'N/A'}</td>
                    <td className="px-6 py-4 text-gray-500 dark:text-slate-400 uppercase text-xs tracking-widest font-bold">{division.type}</td>
                    <td className="px-6 py-4 text-gray-500 dark:text-slate-400">{getDivisionStats(division.name).items}</td>
                    <td className="px-6 py-4 font-bold text-green-600 dark:text-green-400">{getDivisionStats(division.name).growth}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => handleEditDivision(division)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-all">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDeleteDivision(division.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-all">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <Pagination
          currentPage={currentPage}
          totalItems={divisionPageData.totalElements}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
        />
      </div>

      {/* Add Division Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-[#151521] rounded-2xl shadow-2xl w-full max-w-md transform transition-all border dark:border-slate-800">
            <div className="p-6 border-b border-gray-100 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-xl">
                    <Plus className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Add New Division</h2>
                </div>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-slate-800 rounded-xl transition-all duration-300"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2">
                  Division Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => { setFormData({ ...formData, name: e.target.value }); if(errors.name) setErrors({...errors, name: ''}); }}
                  className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 bg-gray-50/50 dark:bg-slate-800/50 text-gray-900 dark:text-white ${errors.name ? 'border-red-500 focus:ring-red-500' : 'border-gray-200 dark:border-slate-700 focus:ring-green-500'}`}
                  placeholder="Enter division name"
                />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleAddDivision}
                  className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 rounded-xl hover:shadow-lg transition-all duration-300 font-semibold"
                >
                  Add Division
                </button>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300 py-3 rounded-xl hover:bg-gray-200 dark:hover:bg-slate-700 transition-all duration-300 font-semibold"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Division Modal */}
      {editingDivision && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-[#151521] rounded-2xl shadow-2xl w-full max-w-md transform transition-all border dark:border-slate-800">
            <div className="p-6 border-b border-gray-100 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                    <Edit2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Edit Division</h2>
                </div>
                <button
                  onClick={() => setEditingDivision(null)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-xl transition-all duration-300"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2">
                  Division Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => { setFormData({ ...formData, name: e.target.value }); if(errors.name) setErrors({...errors, name: ''}); }}
                  className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 bg-gray-50/50 dark:bg-slate-800/50 text-gray-900 dark:text-white ${errors.name ? 'border-red-500 focus:ring-red-500' : 'border-gray-200 dark:border-slate-700 focus:ring-blue-500'}`}
                />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2">
                  Division Type <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => { setFormData({ ...formData, type: e.target.value }); if(errors.type) setErrors({...errors, type: ''}); }}
                  className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 bg-gray-50/50 dark:bg-slate-800/50 text-gray-900 dark:text-white ${errors.type ? 'border-red-500 focus:ring-red-500' : 'border-gray-200 dark:border-slate-700 focus:ring-blue-500'}`}
                >
                  {divisionTypes.map((type) => (
                    <option key={type} value={type} className="dark:bg-slate-900">{type}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                
                  onClick={handleUpdateDivision}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-xl hover:shadow-lg transition-all duration-300 font-semibold flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Update Division
                </button>
                <button
                  onClick={() => setEditingDivision(null)}
                  className="flex-1 bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300 py-3 rounded-xl hover:bg-gray-200 dark:hover:bg-slate-700 transition-all duration-300 font-semibold"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Division Modal */}
      {viewingDivision && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-[#151521] rounded-2xl shadow-2xl w-full max-w-md transform transition-all border dark:border-slate-800">
            <div className="p-6 border-b border-gray-100 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-xl">
                    <Eye className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Division Details</h2>
                </div>
                <button
                  onClick={() => setViewingDivision(null)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-xl transition-all duration-300"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-6">
              <div className="flex items-center gap-4">
                <div className={`p-4 bg-${getDivisionColor(viewingDivision.type)}-50 dark:bg-${getDivisionColor(viewingDivision.type)}-900/20 rounded-xl`}>
                  {getDivisionIcon(viewingDivision.type)}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">{viewingDivision.name}</h3>
                  <p className="text-gray-600 dark:text-slate-400">Division ID: #{viewingDivision.id}</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-slate-800/50 rounded-xl">
                  <Tag className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-slate-400">Type</p>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-${getDivisionColor(viewingDivision.type)}-100 dark:bg-${getDivisionColor(viewingDivision.type)}-900/40 text-${getDivisionColor(viewingDivision.type)}-800 dark:text-${getDivisionColor(viewingDivision.type)}-300 border border-${getDivisionColor(viewingDivision.type)}-200 dark:border-${getDivisionColor(viewingDivision.type)}-800`}>
                      {viewingDivision.type}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-slate-800/50 rounded-xl">
                  <Package className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-slate-400">Total Items</p>
                    <p className="font-medium text-gray-900 dark:text-white">{getDivisionStats(viewingDivision.name).items}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-slate-800/50 rounded-xl">
                  <Archive className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-slate-400">Products in Division</p>
                    <p className="font-medium text-green-600 dark:text-green-400">{getDivisionStats(viewingDivision.name).growth}</p>
                  </div>
                </div>
              </div>
              
              <div className="pt-4">
                <button
                  onClick={() => setViewingDivision(null)}
                  className="w-full bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300 py-3 rounded-xl hover:bg-gray-200 dark:hover:bg-slate-700 transition-all duration-300 font-semibold"
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
};

export default DivisionPage;
