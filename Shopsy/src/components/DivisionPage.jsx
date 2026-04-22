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
  const [formData, setFormData] = useState({
    name: '',
    type: 'Physical Goods'
  });

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  useEffect(() => {
    fetchDivisionsPage(currentPage - 1, itemsPerPage, searchTerm);
  }, [currentPage, searchTerm, fetchDivisionsPage]);

  const divisionTypes = ['Physical Goods', 'Digital', 'Services'];

  const displayedDivisions = divisionPageData.content.filter(division =>
    (division.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (division.type || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddDivision = () => {
    if (formData.name && formData.type) {
      addDivision(formData);
      setFormData({ name: '', type: 'Physical Goods' });
      setShowAddModal(false);
    }
  };

  const handleEditDivision = (division) => {
    setEditingDivision(division);
    setFormData({
      name: division.name,
      type: division.type
    });
  };

  const handleUpdateDivision = () => {
    updateDivision(editingDivision.id, formData);
    setEditingDivision(null);
    setFormData({ name: '', type: 'Physical Goods' });
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
          <h1 className="text-2xl font-bold  text-gray-400">Divisions</h1>
          <p className="text-sm text-gray-400">Manage your product divisions</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-xl transition-all duration-300">
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
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-50">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-50 rounded-xl">
              <FolderOpen className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <p className="text-xs font-medium text-gray-400">Total Divisions</p>
          <h3 className="text-xl font-bold text-gray-900">{divisions.length}</h3>
        </div>
      </div>

      {/* Main Table Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-50 overflow-hidden">
        <div className="p-6 border-b border-gray-50 flex items-center justify-between">
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
              className="pl-10 pr-4 py-2 bg-gray-50 border border-gray-100 rounded-lg w-80 focus:outline-none focus:ring-2 focus:ring-blue-900/10 focus:border-blue-900 text-sm"
            />
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-blue-900 text-white shadow-md' : 'text-gray-400 hover:bg-gray-50'}`}
            >
              <Grid3X3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-blue-900 text-white shadow-md' : 'text-gray-400 hover:bg-gray-50'}`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

        {viewMode === 'grid' ? (
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayedDivisions.map((division) => (
              <div key={division.id} className="group p-6 bg-white rounded-2xl border border-slate-100/50 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] hover:-translate-y-2 hover:shadow-2xl hover:shadow-blue-500/10 hover:border-blue-500/30 transition-all duration-300 cursor-pointer">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 bg-${getDivisionColor(division.type)}-50 text-${getDivisionColor(division.type)}-600 rounded-xl`}>
                    {getDivisionIcon(division.type)}
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleEditDivision(division)} className="p-1.5 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDeleteDivision(division.id)} className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <h4 className="text-lg font-bold text-gray-900 mb-1">{division.name}</h4>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{division.type}</p>
                <div className="mt-6 pt-6 border-t border-gray-100 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Items</p>
                    <p className="text-sm font-bold text-gray-900">{getDivisionStats(division.name).items}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Products</p>
                    <p className="text-sm font-bold text-green-600">{getDivisionStats(division.name).growth}</p>
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
                  <th className="px-6 py-4 font-semibold">Type</th>
                  <th className="px-6 py-4 font-semibold">Items</th>
                  <th className="px-6 py-4 font-semibold">Growth</th>
                  <th className="px-6 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-gray-50">
                {displayedDivisions.map((division) => (
                  <tr key={division.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full bg-${getDivisionColor(division.type)}-50 text-${getDivisionColor(division.type)}-600 flex items-center justify-center`}>
                          {getDivisionIcon(division.type)}
                        </div>
                        <span className="font-medium text-gray-900">{division.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-500 uppercase text-xs tracking-widest font-bold">{division.type}</td>
                    <td className="px-6 py-4 text-gray-500">{getDivisionStats(division.name).items}</td>
                    <td className="px-6 py-4 font-bold text-green-600">{getDivisionStats(division.name).growth}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => handleEditDivision(division)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDeleteDivision(division.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all">
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
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md transform transition-all">
            <div className="p-6 border-b border-gray-100 bg-black">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-50 rounded-xl">
                    <Plus className="w-5 h-5 text-green-600" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 text-white">Add New Division</h2>
                </div>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-xl transition-all duration-300"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4 bg-black">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 text-white">
                  Division Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-gray-50/50 text-white"
                  placeholder="Enter division name"
                />
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
                  className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl hover:bg-gray-200 transition-all duration-300 font-semibold"
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
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md transform transition-all">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 rounded-xl">
                    <Edit2 className="w-5 h-5 text-blue-600" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">Edit Division</h2>
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
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Division Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50/50"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Division Type
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50/50"
                >
                  {divisionTypes.map((type) => (
                    <option key={type} value={type}>{type}</option>
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
                  className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl hover:bg-gray-200 transition-all duration-300 font-semibold"
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
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md transform transition-all">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-50 rounded-xl">
                    <Eye className="w-5 h-5 text-green-600" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">Division Details</h2>
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
                <div className={`p-4 bg-${getDivisionColor(viewingDivision.type)}-50 rounded-xl`}>
                  {getDivisionIcon(viewingDivision.type)}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{viewingDivision.name}</h3>
                  <p className="text-gray-600">Division ID: #{viewingDivision.id}</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <Tag className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Type</p>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-${getDivisionColor(viewingDivision.type)}-100 text-${getDivisionColor(viewingDivision.type)}-800 border border-${getDivisionColor(viewingDivision.type)}-200`}>
                      {viewingDivision.type}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <Package className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Total Items</p>
                    <p className="font-medium text-gray-900">{getDivisionStats(viewingDivision.name).items}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <Archive className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Products in Division</p>
                    <p className="font-medium text-green-600">{getDivisionStats(viewingDivision.name).growth}</p>
                  </div>
                </div>
              </div>
              
              <div className="pt-4">
                <button
                  onClick={() => setViewingDivision(null)}
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
};

export default DivisionPage;
