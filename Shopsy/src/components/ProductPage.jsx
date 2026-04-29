import React, { useState, useEffect } from 'react';
import { Package, Plus, Edit2, Trash2, Eye, Search, X, Save, DollarSign, Calendar, AlertTriangle } from 'lucide-react';
import { useData } from '../contexts/DataContext';
import Pagination from './Pagination';

const ProductPage = () => {
  const { products, productPageData, fetchProductsPage, addProduct, updateProduct, deleteProduct, categories } = useData();

  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('list'); // Default to list
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [viewingProduct, setViewingProduct] = useState(null);
  const [productToDelete, setProductToDelete] = useState(null);
  const emptyForm = {
    name: '',
    price: '',
    quantity: '',
    uom: 'kg',
    salableStock: '',
    unsaleableStock: '',
    expiryDate: '',
    divisionName: '',
    batchCode: ''
  };

  const [formData, setFormData] = useState(emptyForm);
  const [errors, setErrors] = useState({});

  const validate = (data) => {
    const e = {};
    if (!data.name?.trim()) e.name = 'Product name is required';
    if (!data.price) e.price = 'Price is required';
    else if (parseFloat(data.price) <= 0) e.price = 'Price must be greater than 0';
    if (!data.quantity) e.quantity = 'Quantity is required';
    else if (parseInt(data.quantity) <= 0) e.quantity = 'Quantity must be greater than 0';
    if (!data.uom) e.uom = 'UoM is required';
    if (!data.divisionName) e.divisionName = 'Division is required';
    
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchProductsPage(currentPage - 1, itemsPerPage, searchTerm);
  }, [currentPage, searchTerm]);

  const displayedProducts = productPageData.content.filter(product => {
    const s = searchTerm.toLowerCase();
    return (
      (product.name || '').toLowerCase().includes(s) ||
      String(product.price ?? '').includes(s) ||
      String(product.quantity ?? '').includes(s) ||
      (product.batchCode || '').toLowerCase().includes(s)
    );
  }).sort((a, b) => {
    // Sort by expiry date (nearest first)
    if (!a.expiryDate && !b.expiryDate) {
      const batchA = a.batchCode || '';
      const batchB = b.batchCode || '';
      return batchA.localeCompare(batchB);
    }
    if (!a.expiryDate) return 1;
    if (!b.expiryDate) return -1;
    return new Date(a.expiryDate) - new Date(b.expiryDate);
  });

  const handleAddProduct = () => {
    if (!validate(formData)) return;
    
    addProduct({
      name: formData.name,
      price: parseFloat(formData.price),
      quantity: parseInt(formData.quantity),
      uom: formData.uom,
      saleableStock: parseInt(formData.salableStock) || 0,
      nonSaleableStock: parseInt(formData.unsaleableStock) || 0,
      expiryDate: formData.expiryDate,
      divisionName: formData.divisionName,
      batchCode: formData.batchCode
    });
    setFormData(emptyForm);
    setShowAddModal(false);
    setErrors({});
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name || '',
      price: product.price ? product.price.toString() : '',
      quantity: product.quantity ? product.quantity.toString() : '',
      uom: product.uom || 'kg',
      salableStock: product.salableStock ? product.salableStock.toString() : '',
      unsaleableStock: product.unsaleableStock ? product.unsaleableStock.toString() : '',
      expiryDate: product.expiryDate || '',
      divisionName: product.divisionName || '',
      batchCode: product.batchCode || ''
    });
    setErrors({});
  };

  const handleUpdateProduct = () => {
    if (!validate(formData)) return;

    updateProduct(editingProduct.id, {
      name: formData.name,
      price: parseFloat(formData.price),
      quantity: parseInt(formData.quantity),
      uom: formData.uom,
      saleableStock: parseInt(formData.salableStock) || 0,
      nonSaleableStock: parseInt(formData.unsaleableStock) || 0,
      expiryDate: formData.expiryDate,
      divisionName: formData.divisionName,
      batchCode: formData.batchCode
    });
    setEditingProduct(null);
    setFormData(emptyForm);
    setErrors({});
  };

  const handleDeleteProduct = (id) => {
    setProductToDelete(id);
  };

  const confirmDeleteProduct = () => {
    deleteProduct(productToDelete);
    setProductToDelete(null);
  };

  const handleViewProduct = (product) => {
    setViewingProduct(product);
  };

  const getTotalValue = () => {
    return products.reduce((total, product) => total + (product.price * product.quantity), 0);
  };

  const getStockStatus = (quantity) => {
    if (quantity < 20) return { color: 'red', text: 'Low Stock' };
    if (quantity < 50) return { color: 'yellow', text: 'Medium Stock' };
    return { color: 'green', text: 'In Stock' };
  };

  return (
    <div className="space-y-8">
      {/* Page Header Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold  text-gray-400">Products</h1>
          <p className="text-sm text-gray-400">Manage your product inventory</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-blue-900 text-white px-6 py-3 rounded-xl hover:shadow-lg transform active:scale-[0.98] transition-all flex items-center gap-2 font-semibold text-sm"
          >
            <Plus className="w-5 h-5" />
            Add Product
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-[#151521] p-6 rounded-2xl shadow-sm border border-gray-50 dark:border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
              <Package className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <p className="text-xs font-medium text-gray-400 dark:text-slate-500">Total Products</p>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">{products.length}</h3>
        </div>
        <div className="bg-white dark:bg-[#151521] p-6 rounded-2xl shadow-sm border border-gray-50 dark:border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl">
              <DollarSign className="w-6 h-6 text-emerald-600" />
            </div>
          </div>
          <p className="text-xs font-medium text-gray-400 dark:text-slate-500">Inventory Value</p>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">${getTotalValue().toLocaleString()}</h3>
        </div>
      </div>

      {/* Main Table Section */}
      <div className="bg-white dark:bg-[#151521] rounded-2xl shadow-sm border border-gray-50 dark:border-slate-800 overflow-hidden">
        <div className="p-6 border-b border-gray-50 dark:border-slate-800 flex items-center justify-between">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-10 pr-4 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg w-80 focus:outline-none focus:ring-2 focus:ring-green-900/10 focus:border-green-900 dark:text-white text-sm transition-colors"
            />
          </div>
          <div className="flex items-center gap-2 bg-gray-50 dark:bg-slate-800 p-1 rounded-xl border border-gray-100 dark:border-slate-700">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <Package className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <Search className="w-4 h-4" />
            </button>
          </div>
        </div>

        {viewMode === 'list' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-gray-400 dark:text-slate-500 text-xs uppercase tracking-wider">
                  <th className="px-6 py-4 font-semibold">Product Name</th>
                  <th className="px-6 py-4 font-semibold">Price</th>
                  <th className="px-6 py-4 font-semibold">Stock</th>
                  <th className="px-6 py-4 font-semibold">Batch Code</th>
                  <th className="px-6 py-4 font-semibold">Expiry Date</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-gray-50 dark:divide-slate-800">
                {displayedProducts.map((product) => {
                  const status = getStockStatus(product.quantity);
                  return (
                    <tr key={product.id} className="hover:bg-green-50/50 dark:hover:bg-green-900/20 hover:outline hover:outline-2 hover:outline-green-400 hover:-translate-y-0.5 transition-all text-sm">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-gray-50 dark:bg-slate-800 flex items-center justify-center text-gray-400 font-bold text-xs uppercase border border-gray-100 dark:border-slate-700">
                            {product.name.charAt(0)}
                          </div>
                          <span className="font-medium text-gray-900 dark:text-slate-200">{product.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-500 dark:text-slate-400 font-medium">${product.price.toFixed(2)}</td>
                      <td className="px-6 py-4 text-gray-500 dark:text-slate-400">{product.quantity}</td>
                      <td className="px-6 py-4 text-gray-500 dark:text-slate-400">{product.batchCode || 'N/A'}</td>
                      <td className="px-6 py-4 text-gray-500 dark:text-slate-400">{product.expiryDate || 'N/A'}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full bg-${status.color}-50 text-${status.color}-600 text-[10px] font-bold uppercase tracking-wider`}>
                          {status.text}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => handleEditProduct(product)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all">
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDeleteProduct(product.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            {displayedProducts.map((product) => {
              const status = getStockStatus(product.quantity);
              return (
                <div key={product.id} className="group bg-white dark:bg-[#151521] p-6 rounded-2xl border border-slate-100/50 dark:border-slate-800 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] hover:-translate-y-2 hover:shadow-2xl hover:shadow-green-500/10 hover:border-green-500/30 transition-all duration-300 cursor-pointer relative overflow-hidden">
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-3 bg-green-50 rounded-xl group-hover:bg-green-600 transition-colors">
                      <Package className="w-6 h-6 text-green-600 group-hover:text-white transition-colors" />
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => handleEditProduct(product)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all">
                        <Edit2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-1">{product.name}</h4>
                    <p className="text-xs text-slate-400 mb-4">{product.division || 'Uncategorized'}</p>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-slate-400">Price</p>
                        <p className="text-lg font-bold text-slate-900 dark:text-slate-200">${product.price.toFixed(2)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-slate-400">Stock</p>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${status.color === 'green' ? 'bg-green-50 text-green-600' :
                          status.color === 'yellow' ? 'bg-yellow-50 text-yellow-600' : 'bg-red-50 text-red-600'
                          }`}>
                          {product.quantity} {product.uom}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        <Pagination
          currentPage={currentPage}
          totalItems={productPageData.totalElements}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
        />
      </div>

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-800">Add New Product</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Product Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => { setFormData({ ...formData, name: e.target.value }); if(errors.name) setErrors({...errors, name: ''}); }}
                  className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 bg-gray-50/50 dark:bg-slate-800 dark:text-white transition-colors ${errors.name ? 'border-red-500 focus:ring-red-500' : 'border-gray-200 dark:border-slate-700 focus:ring-green-500'}`}
                  placeholder="Enter product name"
                />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => { setFormData({ ...formData, price: e.target.value }); if(errors.price) setErrors({...errors, price: ''}); }}
                  className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 bg-gray-50/50 dark:bg-slate-800 dark:text-white transition-colors ${errors.price ? 'border-red-500 focus:ring-red-500' : 'border-gray-200 dark:border-slate-700 focus:ring-green-500'}`}
                  placeholder="Enter price"
                />
                {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quantity <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={formData.quantity}
                  onChange={(e) => { setFormData({ ...formData, quantity: e.target.value }); if(errors.quantity) setErrors({...errors, quantity: ''}); }}
                  className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 bg-gray-50/50 dark:bg-slate-800 dark:text-white transition-colors ${errors.quantity ? 'border-red-500 focus:ring-red-500' : 'border-gray-200 dark:border-slate-700 focus:ring-green-500'}`}
                  placeholder="Enter quantity"
                />
                {errors.quantity && <p className="text-red-500 text-xs mt-1">{errors.quantity}</p>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    UoM <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.uom}
                    onChange={(e) => { setFormData({ ...formData, uom: e.target.value }); if(errors.uom) setErrors({...errors, uom: ''}); }}
                    className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 bg-gray-50/50 dark:bg-slate-800 dark:text-white transition-colors ${errors.uom ? 'border-red-500 focus:ring-red-500' : 'border-gray-200 dark:border-slate-700 focus:ring-green-500'}`}
                 >
                    <option value="kg">kg</option>
                    <option value="ml">ml</option>
                    <option value="pcs">pcs</option>
                  </select>
                  {errors.uom && <p className="text-red-500 text-xs mt-1">{errors.uom}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Division <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.divisionName}
                    onChange={(e) => { 
                      const selName = e.target.value;
                      const selDiv = categories.find(c => c.name === selName);
                      setFormData({ 
                        ...formData, 
                        divisionName: selName,
                        batchCode: selDiv?.batchCode || formData.batchCode
                      }); 
                      if(errors.divisionName) setErrors({...errors, divisionName: ''}); 
                    }}
                    className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 bg-gray-50/50 dark:bg-slate-800 dark:text-white transition-colors ${errors.divisionName ? 'border-red-500 focus:ring-red-500' : 'border-gray-200 dark:border-slate-700 focus:ring-green-500'}`}
                  >
                    <option value="">Select division...</option>
                    {categories.map(category => (
                      <option key={category.id} value={category.name}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Salable Stock
                  </label>
                  <input
                    type="number"
                    value={formData.salableStock}
                    onChange={(e) => setFormData({ ...formData, salableStock: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-gray-50/50 dark:bg-slate-800 dark:text-white transition-colors"
                    placeholder="0"required minLength={1}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Unsaleable Stock
                  </label>
                  <input
                    type="number"
                    value={formData.unsaleableStock}
                    onChange={(e) => setFormData({ ...formData, unsaleableStock: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-gray-50/50 dark:bg-slate-800 dark:text-white transition-colors"
                    placeholder="0" 
                    required minLength={1}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Expiry Date
                </label>
                <input
                  type="date"
                  value={formData.expiryDate}
                  onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-gray-50/50 dark:bg-slate-800 dark:text-white transition-colors"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleAddProduct}
                  className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors"
                >
                  Add Product
                </button>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Product Modal */}
      {editingProduct && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-800">Edit Product</h2>
              <button
                onClick={() => setEditingProduct(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Product Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => { setFormData({ ...formData, name: e.target.value }); if(errors.name) setErrors({...errors, name: ''}); }}
                  className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 bg-gray-50/50 dark:bg-slate-800 dark:text-white transition-colors ${errors.name ? 'border-red-500 focus:ring-red-500' : 'border-gray-200 dark:border-slate-700 focus:ring-green-500'}`}
                />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => { setFormData({ ...formData, price: e.target.value }); if(errors.price) setErrors({...errors, price: ''}); }}
                  className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 bg-gray-50/50 dark:bg-slate-800 dark:text-white transition-colors ${errors.price ? 'border-red-500 focus:ring-red-500' : 'border-gray-200 dark:border-slate-700 focus:ring-green-500'}`}
                />
                {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quantity <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={formData.quantity}
                  onChange={(e) => { setFormData({ ...formData, quantity: e.target.value }); if(errors.quantity) setErrors({...errors, quantity: ''}); }}
                  className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 bg-gray-50/50 dark:bg-slate-800 dark:text-white transition-colors ${errors.quantity ? 'border-red-500 focus:ring-red-500' : 'border-gray-200 dark:border-slate-700 focus:ring-green-500'}`}
                />
                {errors.quantity && <p className="text-red-500 text-xs mt-1">{errors.quantity}</p>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    UoM <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.uom}
                    onChange={(e) => { setFormData({ ...formData, uom: e.target.value }); if(errors.uom) setErrors({...errors, uom: ''}); }}
                    className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 bg-gray-50/50 dark:bg-slate-800 dark:text-white transition-colors ${errors.uom ? 'border-red-500 focus:ring-red-500' : 'border-gray-200 dark:border-slate-700 focus:ring-green-500'}`}
                  >
                    <option value="kg">kg</option>
                    <option value="ml">ml</option>
                    <option value="pcs">pcs</option>
                  </select>
                  {errors.uom && <p className="text-red-500 text-xs mt-1">{errors.uom}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Division <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.divisionName}
                    onChange={(e) => { 
                      const selName = e.target.value;
                      const selDiv = categories.find(c => c.name === selName);
                      setFormData({ 
                        ...formData, 
                        divisionName: selName,
                        batchCode: selDiv?.batchCode || formData.batchCode
                      }); 
                      if(errors.divisionName) setErrors({...errors, divisionName: ''}); 
                    }}
                    className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 bg-gray-50/50 dark:bg-slate-800 dark:text-white transition-colors ${errors.divisionName ? 'border-red-500 focus:ring-red-500' : 'border-gray-200 dark:border-slate-700 focus:ring-green-500'}`}
                  >
                    <option value="">Select division...</option>
                    {categories.map(category => (
                      <option key={category.id} value={category.name}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                  {errors.divisionName && <p className="text-red-500 text-xs mt-1">{errors.divisionName}</p>}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Salable Stock
                  </label>
                  <input
                    type="number"
                    value={formData.salableStock}
                    onChange={(e) => setFormData({ ...formData, salableStock: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-gray-50/50 dark:bg-slate-800 dark:text-white transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Unsaleable Stock
                  </label>
                  <input
                    type="number"
                    value={formData.unsaleableStock}
                    onChange={(e) => setFormData({ ...formData, unsaleableStock: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-gray-50/50 dark:bg-slate-800 dark:text-white transition-colors"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Expiry Date
                  </label>
                  <input
                    type="date"
                    value={formData.expiryDate}
                    onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-gray-50/50 dark:bg-slate-800 dark:text-white transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Batch Code
                  </label>
                  <input
                    type="text"
                    value={formData.batchCode}
                    onChange={(e) => setFormData({ ...formData, batchCode: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-gray-50/50 dark:bg-slate-800 dark:text-white transition-colors"
                    placeholder="Auto-generated if empty"
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleUpdateProduct}
                  className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Update Product
                </button>
                <button
                  onClick={() => setEditingProduct(null)}
                  className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Product Modal */}
      {viewingProduct && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-800">Product Details</h2>
              <button
                onClick={() => setViewingProduct(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Product ID
                </label>
                <p className="text-gray-900">#{viewingProduct.id}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Product Name
                </label>
                <p className="text-gray-900">{viewingProduct.name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price
                </label>
                <p className="text-gray-900">${viewingProduct.price.toFixed(2)}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quantity
                </label>
                <p className="text-gray-900">{viewingProduct.quantity}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Stock Status
                </label>
                <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStockStatus(viewingProduct.quantity).color === 'red'
                  ? 'bg-red-100 text-red-800'
                  : getStockStatus(viewingProduct.quantity).color === 'yellow'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-green-100 text-green-800'
                  }`}>
                  {getStockStatus(viewingProduct.quantity).text}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    UoM
                  </label>
                  <p className="text-gray-900 uppercase">{viewingProduct.uom || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Division
                  </label>
                  <p className="text-gray-900">{viewingProduct.divisionName || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                    Salable
                  </label>
                  <p className="text-gray-900">{viewingProduct.salableStock || 0}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                    Unsaleable <AlertTriangle className="w-3 h-3 text-red-500" />
                  </label>
                  <p className="text-gray-900">{viewingProduct.unsaleableStock || 0}</p>
                </div>
              </div>
              {viewingProduct.expiryDate && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    Expiry Date
                  </label>
                  <p className="text-gray-900">{new Date(viewingProduct.expiryDate).toLocaleDateString()}</p>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Total Value
                </label>
                <p className="text-gray-900 font-medium">
                  ${(viewingProduct.price * viewingProduct.quantity).toFixed(2)}
                </p>
              </div>
              <div className="pt-4">
                <button
                  onClick={() => setViewingProduct(null)}
                  className="w-full bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {productToDelete && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[60]">
          <div className="bg-white dark:bg-[#151521] rounded-2xl p-6 w-full max-w-sm m-4 border dark:border-slate-800 shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-4">
                <Trash2 className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Delete Product</h3>
              <p className="text-gray-500 dark:text-slate-400 mb-6 text-sm">Are you sure you want to delete this product? This action cannot be undone.</p>
              <div className="flex gap-3 w-full">
                <button
                  onClick={() => setProductToDelete(null)}
                  className="flex-1 px-4 py-2.5 bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300 rounded-xl font-semibold hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDeleteProduct}
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
};

export default ProductPage;
