import React, { useState, useEffect } from 'react';
import { ShoppingCart, Plus, Edit2, Trash2, Eye, Search, X, Calendar, MapPin, CreditCard, Package, User } from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';
import { useData } from '../contexts/DataContext';
import { getOrderByCode } from '../Service.js/OrderService.js';
import Pagination from './Pagination';

const OrdersPage = () => {
  const { orders, orderPageData, fetchOrdersPage, addOrder, updateOrder, deleteOrder, customers, products, updateProduct, updateOrderStatus, updateOrderPaymentStatus, addNotification } = useData();

  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);
  const [viewingOrder, setViewingOrder] = useState(null);
  const [qrOrderDetails, setQrOrderDetails] = useState(null);
  const [qrLoading, setQrLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState(null);

  const emptyForm = {
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    shippingAddress: '',
    shippingDate: new Date().toISOString().split('T')[0],
    paymentStatus: 'PENDING',
    orderStatus: 'PENDING',
    customerId: '',
    productId: '',
    products: [{ name: '', quantity: 1, price: 0, discountPercentage: 0 }],
    gst: '0.00',
    tax: '0.00',
    globalDiscountPercentage: 0,
    discount: '0.00'
  };

  const [formData, setFormData] = useState(emptyForm);
  const [errors, setErrors] = useState({});

  const validate = (data) => {
    const e = {};
    if (!data.customerId) e.customerId = 'Customer selection is required';
    if (!data.customerName?.trim()) e.customerName = 'Customer name is required';
    if (!data.shippingAddress?.trim()) e.shippingAddress = 'Shipping address is required';
    
    const validProducts = data.products.filter(p => p.productId && p.name);
    if (validProducts.length === 0) {
      e.products = 'At least one valid product is required';
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const controller = new AbortController();
    fetchOrdersPage(currentPage - 1, itemsPerPage, searchTerm, controller.signal);
    return () => controller.abort();
  }, [currentPage, searchTerm, fetchOrdersPage]);

  const paymentStatuses = ['PENDING', 'SUCCESS'];
  const orderStatuses = ['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

  // Automatically recalculate GST, Tax, and Discount when products or quantity change
  useEffect(() => {
    const subtotal = formData.products.reduce((sum, p) => sum + (p.quantity * parseFloat(p.price || 0)), 0);

    // GST Formula (18%)
    const calculatedGst = subtotal * 0.18;
    // Tax Formula (5%)
    const calculatedTax = subtotal * 0.05;
    // Discount based on individual product discount percentages
    const calculatedDiscount = formData.products.reduce((sum, p) => {
        const itemTotal = p.quantity * parseFloat(p.price || 0);
        const itemDiscount = itemTotal * (parseFloat(p.discountPercentage || 0) / 100);
        return sum + itemDiscount;
    }, 0);

    setFormData(prev => {
      const subtotalForGlobal = prev.products.reduce((sum, p) => sum + (p.quantity * parseFloat(p.price || 0)), 0);
      const globalDiscountAmount = subtotalForGlobal * (parseFloat(prev.globalDiscountPercentage || 0) / 100);
      const totalCalculatedDiscount = calculatedDiscount + globalDiscountAmount;

      const currentGst = prev.gst;
      const currentTax = prev.tax;
      const currentDiscount = prev.discount;
      
      const newGst = calculatedGst.toFixed(2);
      const newTax = calculatedTax.toFixed(2);
      // Auto-update if there's any calculated discount (product-level or global %)
      const newDiscount = totalCalculatedDiscount > 0 ? totalCalculatedDiscount.toFixed(2) : currentDiscount;

      if (
        currentGst === newGst &&
        currentTax === newTax &&
        currentDiscount === newDiscount
      ) {
        return prev;
      }
      return {
        ...prev,
        gst: newGst,
        tax: newTax,
        discount: newDiscount
      };
    });
  }, [formData.products, formData.globalDiscountPercentage]);

  const displayedOrders = orderPageData.content.filter(order => {
    const s = searchTerm.toLowerCase();
    return (
      (order.customerName || '').toLowerCase().includes(s) ||
      (order.customerEmail || '').toLowerCase().includes(s) ||
      String(order.id || '').includes(s) ||
      (order.paymentStatus || '').toLowerCase().includes(s) ||
      (order.orderStatus || '').toLowerCase().includes(s)
    );
  });

  const calculateDisplayBreakdown = (order) => {
    const products = order.products || order.orderItems || [];
    const subtotal = products.reduce((sum, p) => sum + ((p.price || 0) * (p.quantity || 1)), 0);
    const gst = parseFloat(order.gst) > 0 ? parseFloat(order.gst) : subtotal * 0.18;
    const tax = parseFloat(order.tax) > 0 ? parseFloat(order.tax) : subtotal * 0.05;
    // Sum discounts from individual products if top-level discount is 0
    const discount = parseFloat(order.discount) > 0 ? parseFloat(order.discount) : products.reduce((sum, p) => sum + (parseFloat(p.discount) || 0), 0);
    const total = subtotal + gst + tax - discount;
    return { subtotal, gst, tax, discount, total };
  };

  const calculateDisplayTotal = (order) => calculateDisplayBreakdown(order).total;

  const calcTotal = (fd) => {
    const subtotal = fd.products.reduce((sum, p) => sum + (p.quantity * parseFloat(p.price || 0)), 0);
    // Total = Subtotal + GST + Tax - Discount
    const total = subtotal + parseFloat(fd.gst || 0) + parseFloat(fd.tax || 0) - parseFloat(fd.discount || 0);
    return total;
  };

  const buildPayload = (fd) => {
    const cid = fd.customerId;
    const orderItems = fd.products
      .filter(p => p.productId)
      .map(p => {
        const itemTotal = (p.quantity || 1) * parseFloat(p.price || 0);
        const productDisc = itemTotal * (parseFloat(p.discountPercentage || 0) / 100);
        const globalDisc = itemTotal * (parseFloat(fd.globalDiscountPercentage || 0) / 100);
        return {
          productId: Number(p.productId),
          quantity: Number(p.quantity) || 1,
          discount: productDisc + globalDisc,
          gstPercentage: 18
        };
      });

    return {
      customerId: Number(cid) || cid,
      customerName: fd.customerName,
      customerEmail: fd.customerEmail,
      customerPhone: fd.customerPhone,
      shippingAddress: fd.shippingAddress,
      shippingDate: fd.shippingDate,
      paymentStatus: fd.paymentStatus,
      orderStatus: fd.orderStatus,
      gst: parseFloat(fd.gst || 0),
      tax: parseFloat(fd.tax || 0),
      discount: parseFloat(fd.discount || 0),
      totalAmount: calcTotal(fd),
      orderItems: orderItems.length > 0 ? orderItems : []
    };
  };

  const handleAddOrder = async () => {
    if (!validate(formData)) return;

    setIsSubmitting(true);
    try {
      const validProducts = formData.products.filter(p => p.productId && p.name);
      // Use first valid product's ID for the top-level productId if missing
      const finalFormData = {
        ...formData,
        productId: formData.productId || validProducts[0].productId
      };

      await addOrder({ ...buildPayload(finalFormData), orderDate: new Date().toISOString().split('T')[0] });
      addNotification('Transaction added successfully');
      setFormData(emptyForm);
      setShowAddModal(false);
      setErrors({});
    } catch (e) {
      addNotification('Failed to add transaction: ' + e.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditOrder = (order) => {
    setEditingOrder(order);
    setErrors({});
    setFormData({
      customerName: order.customerName || '',
      customerEmail: order.customerEmail || '',
      customerPhone: order.customerPhone || '',
      shippingAddress: order.shippingAddress || '',
      shippingDate: order.shippingDate || '',
      paymentStatus: order.paymentStatus || 'PENDING',
      orderStatus: order.orderStatus || 'PENDING',
      customerId: order.customerId || '',
      productId: order.productId || '',
      products: order.products?.length ? [...order.products] : [{ name: '', quantity: 1, price: '', discountPercentage: 0 }],
      gst: order.gst || 0,
      tax: order.tax || 0,
      discount: order.discount || 0
    });
  };

  const handleUpdateOrder = async () => {
    if (!validate(formData)) return;
    
    setIsSubmitting(true);
    try {
      const res = await updateOrder(editingOrder.id, buildPayload(formData));
      if (res !== null) {
        addNotification('Order Updated Successfully');
      } else {
        addNotification('Failed to update order');
      }
      setEditingOrder(null);
      setFormData(emptyForm);
      setErrors({});
    } catch (e) {
      addNotification('Error updating order');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteOrder = async (id) => {
    setOrderToDelete(id);
  };

  const confirmDeleteOrder = async () => {
    const id = orderToDelete;
    const order = orders.find(o => String(o.id) === String(id));
    if (order && order.products) {
      for (const item of order.products) {
        const product = products.find(p => String(p.id) === String(item.productId));
        if (product) {
          const newQty = parseInt(product.quantity || 0) + parseInt(item.quantity || 0);
          await updateProduct(product.id, { ...product, quantity: newQty }, { localOnly: true });
        }
      }
    }
    await deleteOrder(id);
    setOrderToDelete(null);
  };

  const handleCustomerSelect = (e) => {
    const custName = e.target.value;
    const customer = customers.find(c => c.name === custName);
    if (customer) {
      setFormData(prev => ({
        ...prev,
        customerId: customer.id,
        customerName: customer.name,
        customerEmail: customer.email,
        customerPhone: customer.phone,
        shippingAddress: customer.address ? `${customer.address}, ${customer.state || ''} ${customer.pincode || ''}`.trim() : ''
      }));
    } else {
      setFormData(prev => ({ ...prev, customerName: custName }));
    }
  };

  const handleCustomerIdSelect = (e) => {
    const val = e.target.value;
    if (!val) {
      setFormData(prev => ({ ...prev, customerId: '', customerName: '', customerEmail: '', customerPhone: '', shippingAddress: '' }));
      return;
    }
    const customer = customers.find(c => String(c.id) === String(val));
    if (customer) {
      const name = customer.name || '';
      const email = customer.email || '';
      const phone = customer.phone || '';
      const addressParts = [customer.address, customer.state, customer.pincode].filter(p => p && p.trim());
      const fullAddress = addressParts.join(', ');

      setFormData(prev => ({
        ...prev,
        customerId: val,
        customerName: name,
        customerEmail: email,
        customerPhone: phone,
        shippingAddress: fullAddress
      }));
      setErrors(prev => ({ ...prev, customerId: '', customerName: '', shippingAddress: '' }));
    } else {
      setFormData(prev => ({ ...prev, customerId: val }));
    }
  };

  const handleProductIdSelect = (e) => {
    const val = e.target.value;
    const product = products.find(p =>
      String(p.id || '') === String(val) ||
      String(p.productId || '') === String(val) ||
      String(p.product_id || '') === String(val)
    );
    if (product) {
      const productName = product.name || product.productName || '';
      const productPrice = product.price || product.unitPrice || product.sellingPrice || 0;
      const productDiscount = product.discountPercentage || 0;
      setFormData(prev => {
        // Check if this product is already in the list
        const exists = prev.products.some(p => String(p.productId) === String(val));
        if (exists) return prev;

        // If the first row is empty, use it. Otherwise add new row.
        const isFirstEmpty = !prev.products[0]?.name && !prev.products[0]?.productId;
        if (isFirstEmpty) {
          return {
            ...prev,
            productId: val,
            products: [{ name: productName, quantity: 1, price: productPrice, discountPercentage: productDiscount, productId: val }, ...prev.products.slice(1)]
          };
        }
        return {
          ...prev,
          productId: val,
          products: [...prev.products, { name: productName, quantity: 1, price: productPrice, discountPercentage: productDiscount, productId: val }]
        };
      });
      setErrors(prev => ({ ...prev, products: '' }));
    } else {
      setFormData(prev => ({ ...prev, productId: val }));
    }
  };

  const handleViewOrder = async (order) => {
    setViewingOrder(order);
    setQrOrderDetails(null);
    if (order.orderCode) {
      setQrLoading(true);
      try {
        const details = await getOrderByCode(order.orderCode);
        setQrOrderDetails(details);
      } catch (e) {
        console.error('Failed to fetch order details for QR', e);
      } finally {
        setQrLoading(false);
      }
    }
  };

  const buildQrPayload = (order, details) => {
    const base = details || order;
    const custArr = Array.isArray(base.customer) ? base.customer[0] : (base.customer || {});
    const prods = base.products || order.products || [];
    return JSON.stringify({
      orderCode: base.orderCode || order.orderCode || '',
      orderId: order.id,
      orderDate: base.orderDate || order.orderDate || '',
      customer: {
        id: custArr?.id || order.customerId || '',
        name: custArr?.name || order.customerName || '',
        email: custArr?.email || order.customerEmail || '',
        address: custArr?.address || order.shippingAddress || '',
        state: custArr?.state || '',
        pincode: custArr?.pincode || '',
      },
      products: prods.map(p => ({
        productId: p.productId,
        name: p.productName || p.name || '',
        qty: p.quantity,
        price: p.price,
        total: p.totalPrice || (p.price * p.quantity),
      })),
      totalAmount: base.finalAmount || base.totalAmount || order.totalAmount || 0,
      paymentStatus: order.paymentStatus,
      orderStatus: order.orderStatus,
    });
  };

  const addProductField = () => {
    setFormData({
      ...formData,
      products: [...formData.products, { name: '', quantity: 1, price: '' }]
    });
  };

  const updateProductField = (index, field, value) => {
    setFormData(prev => {
      const updatedProducts = [...prev.products];
      updatedProducts[index] = { ...updatedProducts[index], [field]: value };
      return { ...prev, products: updatedProducts };
    });
  };

  const removeProductField = (index) => {
    const updatedProducts = formData.products.filter((_, i) => i !== index);
    setFormData({ ...formData, products: updatedProducts });
  };

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case 'SUCCESS': return 'green';
      case 'PENDING': return 'red';
      default: return 'gray';
    }
  };

  const getOrderStatusColor = (status) => {
    switch (status) {
      case 'DELIVERED': return 'green';
      case 'CONFIRMED': return 'blue';
      case 'PENDING': return 'yellow';
      case 'CANCELLED': return 'red';
      case 'SHIPPED': return 'orange'
      default: return 'gray';
    }
  };

  return (
    <div className="space-y-8">
      {/* Page Header Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Transactions</h1>
          <p className="text-sm text-gray-400 dark:text-slate-500">Manage your order transactions</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-blue-900 text-white px-6 py-3 rounded-xl hover:shadow-lg transform active:scale-[0.98] transition-all flex items-center gap-2 font-semibold text-sm cursor-pointer"
          >
            <Plus className="w-5 h-5 font-bold" />
            Add Transaction
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-[#151521] p-6 rounded-2xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-slate-100/50 dark:border-slate-800 flex items-center justify-between hover:-translate-y-1 hover:shadow-lg hover:shadow-blue-500/20 hover:border-blue-200 transition-all duration-300 group cursor-pointer w-full">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl group-hover:bg-blue-600 transition-colors">
                <ShoppingCart className="w-6 h-6 text-blue-600 group-hover:text-white transition-colors" />
              </div>
            </div>
            <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 mb-1 group-hover:text-blue-500 transition-colors">Total Transactions</p>
            <h3 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight group-hover:text-blue-600 transition-colors">{orders.length.toLocaleString()}</h3>
          </div>
        </div>

        <div className="bg-white dark:bg-[#151521] p-6 rounded-2xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-slate-100/50 dark:border-slate-800 flex items-center justify-between hover:-translate-y-1 hover:shadow-lg hover:shadow-orange-500/20 hover:border-orange-200 transition-all duration-300 group cursor-pointer w-full">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-xl group-hover:bg-orange-600 transition-colors">
                <Calendar className="w-6 h-6 text-orange-600 group-hover:text-white transition-colors" />
              </div>
            </div>
            <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 mb-1 group-hover:text-orange-500 transition-colors">Pending Orders</p>
            <h3 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight group-hover:text-orange-600 transition-colors">{orders.filter(o => (o.orderStatus || '').toUpperCase() === 'PENDING').length.toLocaleString()}</h3>
          </div>
        </div>

        <div className="bg-white dark:bg-[#151521] p-6 rounded-2xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-slate-100/50 dark:border-slate-800 flex items-center justify-between hover:-translate-y-1 hover:shadow-lg hover:shadow-emerald-500/20 hover:border-emerald-200 transition-all duration-300 group cursor-pointer w-full">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl group-hover:bg-emerald-600 transition-colors">
                <CreditCard className="w-6 h-6 text-emerald-600 group-hover:text-white transition-colors" />
              </div>
            </div>
            <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 mb-1 group-hover:text-emerald-500 transition-colors">Paid Orders</p>
            <h3 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight group-hover:text-emerald-600 transition-colors">{orders.filter(o => o.paymentStatus === 'SUCCESS').length.toLocaleString()}</h3>
          </div>
        </div>

        <div className="bg-white dark:bg-[#151521] p-6 rounded-2xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-slate-100/50 dark:border-slate-800 flex items-center justify-between hover:-translate-y-1 hover:shadow-lg hover:shadow-purple-500/20 hover:border-purple-200 transition-all duration-300 group cursor-pointer w-full">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-xl group-hover:bg-purple-600 transition-colors">
                <Package className="w-6 h-6 text-purple-600 group-hover:text-white transition-colors" />
              </div>
            </div>
            <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 mb-1 group-hover:text-purple-500 transition-colors">Total Revenue</p>
            <h3 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight group-hover:text-purple-600 transition-colors">
              ${orders.reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h3>
          </div>
        </div>
      </div>

      {/* Main Table Section */}
      <div className="bg-white dark:bg-[#151521] rounded-2xl shadow-sm border border-gray-50 dark:border-slate-800 overflow-hidden">
        <div className="p-6 border-b border-gray-50 dark:border-slate-800">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search transactions..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-10 pr-4 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white rounded-lg w-80 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 text-sm transition-colors"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-gray-400 dark:text-slate-500 text-xs uppercase tracking-wider">
                <th className="px-6 py-4 font-semibold">Order ID</th>
                <th className="px-6 py-4 font-semibold">Customer ID</th>
                <th className="px-6 py-4 font-semibold">Customer Name</th>
                <th className="px-6 py-4 font-semibold">Product ID</th>
                <th className="px-6 py-4 font-semibold">Date</th>
                <th className="px-6 py-4 font-semibold">Product Name</th>
                <th className="px-6 py-4 font-semibold">Payment Status</th>
                <th className="px-6 py-4 font-semibold">Order Status</th>
                <th className="px-6 py-4 font-semibold">Amount</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>

            </thead>
            <tbody className="text-sm divide-y divide-gray-50 dark:divide-slate-800">
              {displayedOrders.map((order) => (
                <tr key={order.id} className="hover:bg-blue-50/50 dark:hover:bg-blue-900/10 hover:outline hover:outline-2 hover:outline-blue-400 hover:-translate-y-0.5 transition-all text-sm group cursor-pointer">
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300">
                      #ORD-{String(order.id).padStart(4, '0')}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-gray-900 dark:text-slate-300 font-medium">{order.customerId || 'N/A'}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-gray-900 dark:text-slate-300 font-medium">{order.customerName || 'N/A'}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-gray-900 dark:text-slate-300 font-medium">{order.productId || (order.products && order.products[0]?.productId) || 'N/A'}</span>
                  </td>
                  <td className="px-6 py-4 text-gray-500 dark:text-slate-400">
                    {order.orderDate ? new Date(order.orderDate).toLocaleDateString() : 'N/A'}
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-gray-900 dark:text-slate-300 font-medium">
                      {(order.products && order.products[0]?.name) || (order.products && order.products[0]?.productName) || 'Product'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <select
                      value={order.paymentStatus || 'PENDING'}
                      onChange={(e) => updateOrderPaymentStatus(order.id, e.target.value)}
                      className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border-none focus:ring-2 focus:ring-offset-2 cursor-pointer transition-all ${
                        (order.paymentStatus || 'PENDING') === 'SUCCESS' 
                          ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 focus:ring-emerald-500' 
                          : 'bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 focus:ring-amber-500'
                      }`}
                    >
                      <option value="PENDING">PENDING</option>
                      <option value="SUCCESS">SUCCESS</option>
                    </select>
                  </td>
                  <td className="px-6 py-4">
                    <select
                      value={order.orderStatus || 'PENDING'}
                      onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                      className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border-none focus:ring-2 focus:ring-offset-2 cursor-pointer transition-all ${
                        (order.orderStatus || 'PENDING') === 'DELIVERED'
                          ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 focus:ring-blue-500'
                          : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 focus:ring-slate-500'
                      }`}
                    >
                      <option value="PENDING">PENDING</option>
                      <option value="PROCESSING">PROCESSING</option>
                      <option value="SHIPPED">SHIPPED</option>
                      <option value="DELIVERED">DELIVERED</option>
                      <option value="CANCELLED">CANCELLED</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 font-bold text-gray-900 dark:text-white">
                    ${calculateDisplayTotal(order).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => handleViewOrder(order)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all cursor-pointer">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleEditOrder(order)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all cursor-pointer">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDeleteOrder(order.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all cursor-pointer">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination
          currentPage={currentPage}
          totalItems={orderPageData.totalElements}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
        />
      </div>

      {/* Add Order Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-start justify-center z-50 overflow-y-auto py-8">
          <div className="bg-white dark:bg-[#151521] rounded-lg p-6 w-full max-w-2xl mx-4 border dark:border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-800 dark:text-white">Add New Order</h2>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-400 mb-1">Customer ID <span className="text-red-500">*</span></label>
                  <select
                    value={formData.customerId}
                    onChange={handleCustomerIdSelect}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 bg-white dark:bg-slate-800 text-gray-900 dark:text-white ${errors.customerId ? 'border-red-500 focus:ring-red-500' : 'border-gray-200 dark:border-slate-700 focus:ring-orange-500'}`}
                  >
                    <option value="">Select Customer</option>
                    {customers.map((c) => {
                      const cid = c.id;
                      const cname = c.name || 'Unknown';
                      return <option key={cid} value={cid}>{cname} (ID: {cid})</option>;
                    })}
                  </select>
                  {errors.customerId && <p className="text-red-500 text-xs mt-1">{errors.customerId}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-400 mb-1">Product ID <span className="text-red-500">*</span></label>
                  <select
                    value={formData.productId}
                    onChange={handleProductIdSelect}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white dark:bg-slate-800 text-gray-900 dark:text-white border-gray-200 dark:border-slate-700"
                  >
                    <option value="">Select Product</option>
                    {products.map((p) => {
                      const pid = p.id || p.productId || p.product_id || p._id || '';
                      const pname = p.name || p.productName || 'Unknown';
                      const pprice = p.price || p.unitPrice || p.sellingPrice || '';
                      return <option key={String(pid || pname)} value={String(pid)}>{pname} (ID: {pid}) {pprice ? `- $${pprice}` : ''}</option>;
                    })}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-400 mb-1">Customer Name</label>
                  <input
                    type="text"
                    value={formData.customerName}
                    readOnly
                    className={`w-full px-3 py-2 border rounded-lg bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white cursor-not-allowed ${errors.customerName ? 'border-red-500' : 'border-gray-200 dark:border-slate-700'}`}
                    placeholder="Auto-filled from Customer ID"
                  />
                  {errors.customerName && <p className="text-red-500 text-xs mt-1">{errors.customerName}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-400 mb-1">Customer Email</label>
                  <input
                    type="email"
                    value={formData.customerEmail}
                    readOnly
                    className="w-full px-3 py-2 border rounded-lg bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white cursor-not-allowed border-gray-200 dark:border-slate-700"
                    placeholder="Auto-filled from Customer ID"
                     required minLength={1}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-400 mb-1">Shipping Address <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={formData.shippingAddress}
                  readOnly
                  className={`w-full px-3 py-2 border rounded-lg bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white cursor-not-allowed ${errors.shippingAddress ? 'border-red-500' : 'border-gray-200 dark:border-slate-700'}`}
                  placeholder="Auto-filled from Customer ID"
                />
                {errors.shippingAddress && <p className="text-red-500 text-xs mt-1">{errors.shippingAddress}</p>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-400 mb-1">Order Date</label>
                  <input
                    type="date"
                    value={formData.shippingDate}
                    onChange={(e) => setFormData({ ...formData, shippingDate: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white dark:bg-slate-800 text-gray-900 dark:text-white border-gray-200 dark:border-slate-700"
                  required minLength={1}
                 />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-400">
                    Products
                  </label>
                  {errors.products && <p className="text-red-500 text-xs">{errors.products}</p>}
                  <button
                    type="button"
                    onClick={addProductField}
                    className="text-orange-600 hover:text-orange-800 text-sm flex items-center gap-1"
                  >
                    <Plus className="w-4 h-4  text-gray-400" />
                    Add Product
                  </button>
                </div>
                {formData.products.map((product, index) => (
                  <div key={index} className="grid grid-cols-12 gap-2 mb-2 items-center">
                    <div className="col-span-3">
                      <select
                        value={product.productId || ''}
                        onChange={(e) => {
                          const pid = e.target.value;
                          const p = products.find(prod => String(prod.id) === String(pid));
                          if (p) {
                            setFormData(prev => {
                              const updatedProducts = [...prev.products];
                              updatedProducts[index] = { 
                                ...updatedProducts[index], 
                                name: p.name,
                                price: p.price,
                                productId: p.id,
                                discountPercentage: p.discountPercentage || 0,
                                uom: p.uom || ''
                              };
                              return { ...prev, products: updatedProducts };
                            });
                          }
                        }}
                        className="w-full px-2 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white dark:bg-slate-800 text-gray-900 dark:text-white border-gray-200 dark:border-slate-700 text-xs"
                      >
                        <option value="">Select Product...</option>
                        {products.map(p => (
                          <option key={p.id} value={p.id}>{p.name} (${p.price})</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-span-2">
                      <input
                        type="number"
                        value={product.quantity}
                        onChange={(e) => updateProductField(index, 'quantity', parseInt(e.target.value) || 1)}
                        className="w-full px-2 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500  bg-white dark:bg-slate-800 text-gray-900 dark:text-white border-gray-200 dark:border-slate-700 text-sm"
                        placeholder="Qty"
                      />
                    </div>
                    <div className="col-span-2">
                      <input
                        type="number"
                        step="0.01"
                        value={product.price}
                        onChange={(e) => updateProductField(index, 'price', e.target.value)}
                        className="w-full px-2 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500  bg-white dark:bg-slate-800 text-gray-900 dark:text-white border-gray-200 dark:border-slate-700 text-sm"
                        placeholder="Price"
                      />
                    </div>
                    <div className="col-span-2">
                      <input
                        type="number"
                        step="0.1"
                        value={product.discountPercentage || 0}
                        onChange={(e) => updateProductField(index, 'discountPercentage', parseFloat(e.target.value) || 0)}
                        className="w-full px-2 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500  bg-white dark:bg-slate-800 text-gray-900 dark:text-white border-gray-200 dark:border-slate-700 text-sm"
                        placeholder="Disc %"
                      />
                    </div>
                    <div className="col-span-2">
                      <div className="px-2 py-2 border rounded-lg bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white font-bold text-center border-gray-200 dark:border-slate-700 text-sm">
                        ${((product.quantity || 0) * parseFloat(product.price || 0)).toFixed(2)}
                      </div>
                    </div>
                    <div className="col-span-1">
                      {formData.products.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeProductField(index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-3 gap-4 border-t dark:border-slate-700 pt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-400 mb-1">
                    GST ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.gst}
                    readOnly
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white border-gray-200 dark:border-slate-700 cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-400 mb-1">
                    Tax ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.tax}
                    readOnly
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white border-gray-200 dark:border-slate-700 cursor-not-allowed"
                  />
                </div>
                <div className="col-span-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-400 mb-1">
                    Global Disc %
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.globalDiscountPercentage}
                    onChange={(e) => setFormData({ ...formData, globalDiscountPercentage: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-800 text-gray-900 dark:text-white border-gray-300 dark:border-slate-600"
                    placeholder="%"
                  />
                </div>
                <div className="col-span-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-400 mb-1">
                    Discount ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.discount || ''}
                    onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-800 text-gray-900 dark:text-white border-gray-300 dark:border-slate-600"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleAddOrder}
                  disabled={isSubmitting}
                  className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : 'Add Order'}
                </button>
                <button
                  onClick={() => setShowAddModal(false)}
                  disabled={isSubmitting}
                  className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Order Modal */}
      {editingOrder && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-white dark:bg-[#151521] rounded-lg p-6 w-full max-w-2xl m-4 border dark:border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-800 dark:text-white">Edit Order #{editingOrder.id}</h2>
              <button onClick={() => { setEditingOrder(null); setFormData(emptyForm); }} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-400 mb-1">Customer ID</label>
                  <select
                    value={formData.customerId}
                    onChange={handleCustomerIdSelect}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white dark:bg-slate-800 text-gray-900 dark:text-white border-gray-200 dark:border-slate-700"
                  >
                    <option value="">Select Customer</option>
                    {customers.map((c) => {
                      const cid = c.id || c.customerId || c.customer_id || c._id || c.cid || '';
                      const cname = c.name || c.customerName || c.fullName || 'Unknown';
                      return <option key={String(cid || cname)} value={String(cid)}>{cname} (ID: {cid})</option>;
                    })}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-400 mb-1">Product ID</label>
                  <select
                    value={formData.productId}
                    onChange={handleProductIdSelect}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white dark:bg-slate-800 text-gray-900 dark:text-white border-gray-200 dark:border-slate-700"
                  >
                    <option value="">Select Product</option>
                    {products.map((p) => {
                      const pid = p.id || p.productId || p.product_id || p._id || '';
                      const pname = p.name || p.productName || 'Unknown';
                      const pprice = p.price || p.unitPrice || p.sellingPrice || '';
                      return <option key={String(pid || pname)} value={String(pid)}>{pname} (ID: {pid}) {pprice ? `- $${pprice}` : ''}</option>;
                    })}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-400 mb-1">Customer Name</label>
                  <input type="text" list="edit-customer-suggestions" value={formData.customerName} onChange={handleCustomerSelect}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 bg-white dark:bg-slate-800 text-gray-900 dark:text-white ${errors.customerName ? 'border-red-500 focus:ring-red-500' : 'border-gray-200 dark:border-slate-700 focus:ring-orange-500'}`} />
                  <datalist id="edit-customer-suggestions">{customers.map(c => <option key={c.id} value={c.name} />)}</datalist>
                  {errors.customerName && <p className="text-red-500 text-xs mt-1">{errors.customerName}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-400 mb-1">Customer Email</label>
                  <input type="email" value={formData.customerEmail} onChange={(e) => setFormData(prev => ({ ...prev, customerEmail: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white dark:bg-slate-800 text-gray-900 dark:text-white border-gray-200 dark:border-slate-700" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-400 mb-1">Shipping Address</label>
                <input type="text" value={formData.shippingAddress} onChange={(e) => { setFormData(prev => ({ ...prev, shippingAddress: e.target.value })); if (errors.shippingAddress) setErrors(prev => ({ ...prev, shippingAddress: '' })); }}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 bg-white dark:bg-slate-800 text-gray-900 dark:text-white ${errors.shippingAddress ? 'border-red-500 focus:ring-red-500' : 'border-gray-200 dark:border-slate-700 focus:ring-orange-500'}`} />
                {errors.shippingAddress && <p className="text-red-500 text-xs mt-1">{errors.shippingAddress}</p>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-400 mb-1">Shipping Date</label>
                  <input type="date" value={formData.shippingDate} onChange={(e) => setFormData(prev => ({ ...prev, shippingDate: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white dark:bg-slate-800 text-gray-900 dark:text-white border-gray-200 dark:border-slate-700" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-400 mb-1">Payment Status</label>
                  <select value={formData.paymentStatus} onChange={(e) => setFormData(prev => ({ ...prev, paymentStatus: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white dark:bg-slate-800 text-gray-900 dark:text-white border-gray-200 dark:border-slate-700">
                    {paymentStatuses.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-400 mb-1">Order Status</label>
                  <select value={formData.orderStatus} onChange={(e) => setFormData(prev => ({ ...prev, orderStatus: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white dark:bg-slate-800 text-gray-900 dark:text-white border-gray-200 dark:border-slate-700">
                    {orderStatuses.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">Products</label>
                  {errors.products && <p className="text-red-500 text-xs">{errors.products}</p>}
                  <button type="button" onClick={addProductField} className="text-orange-600 hover:text-orange-800 text-sm flex items-center gap-1">
                    <Plus className="w-4 h-4 text-gray-400" /> Add Product
                  </button>
                </div>
                <datalist id="edit-product-suggestions">{products.map(p => <option key={p.id} value={p.name} />)}</datalist>
                {formData.products.map((product, index) => (
                  <div key={index} className="grid grid-cols-12 gap-2 mb-2 items-center">
                    <div className="col-span-3">
                      <input type="text" list="edit-product-suggestions" value={product.name}
                        onChange={(e) => { 
                          const val = e.target.value; 
                          const m = products.find(p => p.name === val); 
                          if (m) {
                            setFormData(prev => {
                              const updatedProducts = [...prev.products];
                              updatedProducts[index] = { 
                                ...updatedProducts[index], 
                                name: m.name,
                                price: m.price,
                                productId: m.id,
                                discountPercentage: m.discountPercentage || 0,
                                uom: m.uom || ''
                              };
                              return { ...prev, products: updatedProducts };
                            });
                          } else {
                            updateProductField(index, 'name', val);
                          }
                        }}
                        className="w-full px-2 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white dark:bg-slate-800 text-gray-900 dark:text-white border-gray-200 dark:border-slate-700 text-xs" placeholder="Product" />
                    </div>
                    <div className="col-span-2">
                      <input type="number" value={product.quantity} onChange={(e) => updateProductField(index, 'quantity', parseInt(e.target.value) || 1)}
                        className="w-full px-2 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white dark:bg-slate-800 text-gray-900 dark:text-white border-gray-200 dark:border-slate-700 text-sm" placeholder="Qty" />
                    </div>
                    <div className="col-span-2">
                      <input type="number" step="0.01" value={product.price} onChange={(e) => updateProductField(index, 'price', e.target.value)}
                        className="w-full px-2 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white dark:bg-slate-800 text-gray-900 dark:text-white border-gray-200 dark:border-slate-700 text-sm" placeholder="Price" />
                    </div>
                    <div className="col-span-2">
                      <input type="number" step="0.1" value={product.discountPercentage || 0} onChange={(e) => updateProductField(index, 'discountPercentage', parseFloat(e.target.value) || 0)}
                        className="w-full px-2 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white dark:bg-slate-800 text-gray-900 dark:text-white border-gray-200 dark:border-slate-700 text-sm" placeholder="Disc %" />
                    </div>
                    <div className="col-span-2">
                      <div className="px-2 py-2 border rounded-lg bg-gray-50 dark:bg-slate-900 text-gray-700 dark:text-slate-300 font-bold text-center border-gray-200 dark:border-slate-700 text-sm">
                        ${((product.quantity || 0) * parseFloat(product.price || 0)).toFixed(2)}
                      </div>
                    </div>
                    <div className="col-span-1">
                      {formData.products.length > 1 && (
                        <button type="button" onClick={() => removeProductField(index)} className="text-red-600 hover:text-red-800"><Trash2 className="w-4 h-4" /></button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-3 gap-4 border-t dark:border-slate-700 pt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-400 mb-1">GST ($)</label>
                  <input type="number" step="0.01" value={formData.gst} readOnly
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none bg-gray-50 dark:bg-slate-900 text-gray-400 dark:text-slate-500 border-gray-200 dark:border-slate-700 cursor-not-allowed" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-400 mb-1">Tax ($)</label>
                  <input type="number" step="0.01" value={formData.tax} readOnly
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none bg-gray-50 dark:bg-slate-900 text-gray-400 dark:text-slate-500 border-gray-200 dark:border-slate-700 cursor-not-allowed" />
                </div>
                <div className="col-span-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-400 mb-1">Global Disc %</label>
                  <input type="number" step="0.1" value={formData.globalDiscountPercentage} 
                    onChange={(e) => setFormData({ ...formData, globalDiscountPercentage: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-800 text-gray-900 dark:text-white border-gray-300 dark:border-slate-600" placeholder="%" />
                </div>
                <div className="col-span-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-400 mb-1">Discount ($)</label>
                  <input type="number" step="0.01" value={formData.discount || ''} 
                    onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-800 text-gray-900 dark:text-white border-gray-300 dark:border-slate-600" />
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button 
                  onClick={handleUpdateOrder} 
                  disabled={isSubmitting}
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? 'Updating...' : 'Update Order'}
                </button>
                <button 
                  onClick={() => { setEditingOrder(null); setFormData(emptyForm); }} 
                  disabled={isSubmitting}
                  className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Order Modal */}
      {viewingOrder && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-white dark:bg-[#151521] rounded-lg p-6 w-full max-w-2xl m-4 border dark:border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-800 dark:text-white">Order Details</h2>
              <button
                onClick={() => { setViewingOrder(null); setQrOrderDetails(null); }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-400 mb-1">Order ID</label>
                  <p className="text-gray-900 dark:text-blue-400 font-mono font-bold text-blue-900">#ORD-{String(viewingOrder.id).padStart(4, '0')}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-400 mb-1">Order Date</label>
                  <p className="text-gray-900 dark:text-slate-300">{viewingOrder.orderDate}</p>
                </div>
                {viewingOrder.customerId && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-400 mb-1">Customer ID</label>
                    <p className="text-gray-900 dark:text-slate-300">{viewingOrder.customerId}</p>
                  </div>
                )}
                {viewingOrder.productId && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-400 mb-1">Product ID</label>
                    <p className="text-gray-900 dark:text-slate-300">{viewingOrder.productId}</p>
                  </div>
                )}
              </div>

              <div className="border-t dark:border-slate-700 pt-4">
                <h3 className="font-medium text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Customer Information
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-400 mb-1">Name</label>
                    <p className="text-gray-900 dark:text-slate-300">{viewingOrder.customerName}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-400 mb-1">Email</label>
                    <p className="text-gray-900 dark:text-slate-300">{viewingOrder.customerEmail}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-400 mb-1">Phone</label>
                    <p className="text-gray-900 dark:text-slate-300">{viewingOrder.customerPhone}</p>
                  </div>
                </div>
              </div>

              <div className="border-t dark:border-slate-700 pt-4">
                <h3 className="font-medium text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Shipping Information
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-400 mb-1">Shipping Address</label>
                    <p className="text-gray-900 dark:text-slate-300">{viewingOrder.shippingAddress}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-400 mb-1">Shipping Date</label>
                    <p className="text-gray-900 dark:text-slate-300">{viewingOrder.shippingDate}</p>
                  </div>
                </div>
              </div>

              <div className="border-t dark:border-slate-700 pt-4">
                <h3 className="font-medium text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                  <Package className="w-4 h-4" />
                  Products
                </h3>
                <div className="space-y-2">
                  {viewingOrder.products.map((product, index) => (
                    <div key={index} className="flex justify-between items-center p-2 bg-gray-50 dark:bg-slate-900 rounded">
                      <div>
                        <p className="font-medium dark:text-slate-200">{product.name}</p>
                        <p className="text-sm text-gray-600 dark:text-slate-400">Qty: {product.quantity} {product.uom || ''}</p>
                      </div>
                      <p className="font-medium dark:text-slate-200">${(product.price * product.quantity).toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t dark:border-slate-700 pt-4 space-y-2">
                {(() => {
                  const bd = calculateDisplayBreakdown(viewingOrder);
                  return (
                    <>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600 dark:text-slate-400">Subtotal</span>
                        <span className="font-medium text-gray-900 dark:text-slate-200">
                          ${bd.subtotal.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600 dark:text-slate-400">GST (18%)</span>
                        <span className="font-medium text-gray-900 dark:text-slate-200">
                          ${bd.gst.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600 dark:text-slate-400">Tax (5%)</span>
                        <span className="font-medium text-gray-900 dark:text-slate-200">
                          ${bd.tax.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600 dark:text-slate-400">Discount</span>
                        <span className="font-medium text-red-600">
                          -${bd.discount.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center pt-2 border-t dark:border-slate-700 mt-2">
                        <h3 className="font-medium text-gray-900 dark:text-white">Total Amount</h3>
                        <p className="text-xl font-bold text-gray-900 dark:text-white">${bd.total.toFixed(2)}</p>
                      </div>
                    </>
                  );
                })()}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-400 mb-1">Payment Status</label>
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-${getPaymentStatusColor(viewingOrder.paymentStatus)}-100 text-${getPaymentStatusColor(viewingOrder.paymentStatus)}-800`}>
                      {viewingOrder.paymentStatus}
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-400 mb-1">Order Status</label>
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-${getOrderStatusColor(viewingOrder.orderStatus)}-100 text-${getOrderStatusColor(viewingOrder.orderStatus)}-800`}>
                      {viewingOrder.orderStatus}
                    </span>
                  </div>
                </div>

                {/* QR Code for SUCCESS transactions — encodes full order details */}
                {viewingOrder.paymentStatus === 'SUCCESS' && (
                  <div className="mt-6 pt-6 border-t border-dashed flex flex-col items-center gap-2 bg-slate-50 p-4 rounded-xl">
                    {qrLoading ? (
                      <div className="w-40 h-40 flex items-center justify-center">
                        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                      </div>
                    ) : (
                      <QRCodeCanvas
                        value={`${window.location.origin}/receipt/${viewingOrder.orderCode}`}
                        size={160}
                        level={"H"}
                        includeMargin={true}
                      />
                    )}
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Order Verification QR</p>
                    {viewingOrder.orderCode && (
                      <p className="text-xs text-slate-500 font-mono">{viewingOrder.orderCode}</p>
                    )}
                  </div>
                )}

                <div className="pt-4">
                  <button
                    onClick={() => { setViewingOrder(null); setQrOrderDetails(null); }}
                    className="w-full bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {orderToDelete && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[60]">
          <div className="bg-white dark:bg-[#151521] rounded-2xl p-6 w-full max-w-sm m-4 border dark:border-slate-800 shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-4">
                <Trash2 className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Confirm Delete</h3>
              <p className="text-gray-500 dark:text-slate-400 mb-6 text-sm">Are you sure you want to delete this transaction? This action cannot be undone and stock will be reverted.</p>
              <div className="flex gap-3 w-full">
                <button
                  onClick={() => setOrderToDelete(null)}
                  className="flex-1 px-4 py-2.5 bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300 rounded-xl font-semibold hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDeleteOrder}
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

export default OrdersPage;
