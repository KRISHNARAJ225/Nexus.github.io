import React, { useState } from 'react';
import { ShoppingCart, Eye, Search, Package, User, CreditCard, X, MapPin, Plus, ArrowDownCircle, ArrowUpCircle, Edit2, Trash2 } from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';
import { useData } from '../contexts/DataContext';
import { getOrderByCode } from '../Service.js/OrderService.js';
import Pagination from './Pagination';

const StocksPage = () => {
    const { orders, products, createStock, updateStock, deleteStock, stockLogs } = useData();
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [viewingOrder, setViewingOrder] = useState(null);
    const [qrOrderDetails, setQrOrderDetails] = useState(null);
    const [qrLoading, setQrLoading] = useState(false);
    const itemsPerPage = 10;

    // ── Add Stock modal state ──────────────────────────────────────────────
    const [showStockModal, setShowStockModal] = useState(false);
    const [stockForm, setStockForm] = useState({ productId: '', quantity: 1, type: 'IN' });
    const [stockSaving, setStockSaving] = useState(false);
    const [stockError, setStockError] = useState('');
    const [stockSuccess, setStockSuccess] = useState('');

    // ── Edit Stock modal state ─────────────────────────────────────────────
    const [editingStock, setEditingStock] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);

    // Filter only SUCCESS transactions from the full orders list (client-side, stable)
    const paidOrders = (orders || []).filter(order => order.paymentStatus === 'SUCCESS');

    // Apply search filter
    const filteredPaidOrders = paidOrders.filter(order => {
        const s = searchTerm.toLowerCase();
        return (
            (order.customerName || '').toLowerCase().includes(s) ||
            (order.customerEmail || '').toLowerCase().includes(s) ||
            String(order.id || '').includes(s)
        );
    });

    // Client-side pagination over filtered paid orders
    const totalPaidItems = filteredPaidOrders.length;
    const displayedPaidOrders = filteredPaidOrders.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    // Fetch full order details by orderCode for QR generation
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
        // Use the rich backend response shape
        const custArr = Array.isArray(base.customer) ? base.customer[0] : (base.customer || {});
        const prods = base.products || [];
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
            case 'SHIPPED': return 'orange';
            default: return 'gray';
        }
    };

    // ── Handle Create Stock ─────────────────────────────────────────────────
    const handleCreateStock = async () => {
        setStockError('');
        setStockSuccess('');
        if (!stockForm.productId) { setStockError('Please select a product.'); return; }
        if (!stockForm.quantity || Number(stockForm.quantity) <= 0) { setStockError('Quantity must be greater than 0.'); return; }
        setStockSaving(true);
        const res = await createStock({
            productId: Number(stockForm.productId),
            quantity:  Number(stockForm.quantity),
            type:      stockForm.type,
        });
        setStockSaving(false);
        if (res !== null) {
            setStockSuccess(`Stock ${stockForm.type} of ${stockForm.quantity} units recorded successfully!`);
            setStockForm({ productId: '', quantity: 1, type: 'IN' });
            setTimeout(() => { setShowStockModal(false); setStockSuccess(''); }, 1500);
        } else {
            setStockError('Failed to create stock entry. Please try again.');
        }
    };

    const handleEditStock = (log) => {
        setEditingStock(log);
        setStockForm({
            productId: log.productId,
            quantity: log.quantity,
            type: log.type
        });
        setShowEditModal(true);
    };

    const handleUpdateStock = async () => {
        setStockError('');
        setStockSuccess('');
        setStockSaving(true);
        const res = await updateStock(editingStock.id, {
            productId: Number(stockForm.productId),
            quantity:  Number(stockForm.quantity),
            type:      stockForm.type,
        });
        setStockSaving(false);
        if (res !== null) {
            setStockSuccess('Stock entry updated successfully!');
            setTimeout(() => { setShowEditModal(false); setEditingStock(null); setStockSuccess(''); }, 1500);
        } else {
            setStockError('Failed to update stock entry.');
        }
    };

    const handleDeleteStock = async (id) => {
        if (!window.confirm('Are you sure you want to delete this stock movement?')) return;
        const res = await deleteStock(id);
        if (res) addNotification('Stock entry removed');
    };

    return (
        <div className="space-y-8">
            {/* Page Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-400">Stocks (Paid List)</h1>
                    <p className="text-sm text-gray-400">View all successful transactions and inventory movements</p>
                </div>
                <button
                    onClick={() => { setShowStockModal(true); setStockError(''); setStockSuccess(''); }}
                    className="bg-emerald-700 text-white px-5 py-3 rounded-xl hover:shadow-lg transform active:scale-[0.98] transition-all flex items-center gap-2 font-semibold text-sm cursor-pointer"
                >
                    <Plus className="w-5 h-5" />
                    Add Stock
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100/50 flex items-center justify-between hover:border-emerald-200 transition-all group cursor-pointer">
                    <div>
                        <div className="p-3 bg-emerald-50 rounded-xl group-hover:bg-emerald-600 transition-colors mb-4">
                            <CreditCard className="w-6 h-6 text-emerald-600 group-hover:text-white" />
                        </div>
                        <p className="text-xs font-semibold text-slate-400 mb-1">Total Paid Orders</p>
                        <h3 className="text-2xl font-bold text-slate-800">{paidOrders.length}</h3>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100/50 flex items-center justify-between hover:border-blue-200 transition-all group cursor-pointer">
                    <div>
                        <div className="p-3 bg-blue-50 rounded-xl group-hover:bg-blue-600 transition-colors mb-4">
                            <Package className="w-6 h-6 text-blue-600 group-hover:text-white" />
                        </div>
                        <p className="text-xs font-semibold text-slate-400 mb-1">Total Items Paid</p>
                        <h3 className="text-2xl font-bold text-slate-800">
                            {paidOrders.reduce((sum, o) => sum + (o.products?.reduce((pSum, p) => pSum + (p.quantity || 0), 0) || 0), 0)}
                        </h3>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100/50 flex items-center justify-between hover:border-purple-200 transition-all group cursor-pointer">
                    <div>
                        <div className="p-3 bg-purple-50 rounded-xl group-hover:bg-purple-600 transition-colors mb-4">
                            <ShoppingCart className="w-6 h-6 text-purple-600 group-hover:text-white" />
                        </div>
                        <p className="text-xs font-semibold text-slate-400 mb-1">Total Revenue (Paid)</p>
                        <h3 className="text-2xl font-bold text-slate-800">
                            ${paidOrders.reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </h3>
                    </div>
                </div>
            </div>

            {/* Main Table Section */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-50 overflow-hidden">
                <div className="p-6 border-b border-gray-50">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search paid transactions..."
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="pl-10 pr-4 py-2 bg-gray-900 border border-gray-900 text-gray-400 rounded-lg w-80 focus:outline-none focus:ring-2 focus:ring-blue-900/10 focus:border-blue-900 text-sm"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="text-gray-400 text-xs uppercase tracking-wider">
                                <th className="px-6 py-4 font-semibold text-blue-900">Order ID</th>
                                <th className="px-6 py-4 font-semibold">Customer ID</th>
                                <th className="px-6 py-4 font-semibold">Customer Name</th>
                                <th className="px-6 py-4 font-semibold">Product ID</th>
                                <th className="px-6 py-4 font-semibold">Date</th>
                                <th className="px-6 py-4 font-semibold">Product Name</th>
                                <th className="px-6 py-4 font-semibold">Amount</th>
                                <th className="px-6 py-4 font-semibold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm divide-y divide-gray-50">
                            {displayedPaidOrders.map((order) => (
                                <tr key={order.id} className="hover:bg-emerald-50/50 transition-all text-sm group cursor-pointer" onClick={() => handleViewOrder(order)}>
                                    <td className="px-6 py-4">
                                        <span className="font-mono font-bold text-blue-900">
                                            #ORD-{String(order.id).padStart(4, '0')}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-gray-500 font-medium">{order.customerId || 'N/A'}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="font-medium text-gray-900">{order.customerName}</span>
                                            <span className="text-xs text-gray-400">{order.customerEmail}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-gray-500">{order.products?.[0]?.productId || order.productId || 'N/A'}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="text-gray-900">{order.orderDate?.split('T')[0]}</span>
                                            <span className="text-xs text-gray-400">{order.orderDate?.split('T')[1]?.substring(0, 5)}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="text-gray-900 font-medium">{order.products?.[0]?.name || order.products?.[0]?.productName || 'N/A'}</span>
                                            {order.products?.length > 1 && (
                                                <span className="text-[10px] text-blue-600 font-bold uppercase">+{order.products.length - 1} more items</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="font-bold text-gray-900">${(order.totalAmount || 0).toFixed(2)}</span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleViewOrder(order); }}
                                                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                            >
                                                <Eye className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {displayedPaidOrders.length === 0 && (
                                <tr>
                                    <td colSpan="8" className="px-6 py-10 text-center text-gray-400 italic">
                                        No paid transactions found in this view.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                <Pagination
                    currentPage={currentPage}
                    totalItems={totalPaidItems}
                    itemsPerPage={itemsPerPage}
                    onPageChange={setCurrentPage}
                />
            </div>

            {/* ── Stock Movements Table ─────────────────────────────────────────── */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-50 overflow-hidden">
                <div className="p-5 border-b border-gray-50 flex items-center justify-between">
                    <div>
                        <h2 className="text-base font-bold text-gray-800 flex items-center gap-2">
                            <ArrowDownCircle className="w-4 h-4 text-emerald-500" />
                            Stock Movements
                        </h2>
                        <p className="text-xs text-gray-400 mt-0.5">All manual stock IN / OUT entries</p>
                    </div>
                    <span className="text-xs font-semibold text-gray-400 bg-gray-100 px-2 py-1 rounded-full">
                        {stockLogs.length} entries
                    </span>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="text-gray-400 text-xs uppercase tracking-wider border-b border-gray-50">
                                <th className="px-6 py-3 font-semibold">#</th>
                                <th className="px-6 py-3 font-semibold">Product</th>
                                <th className="px-6 py-3 font-semibold">Product ID</th>
                                <th className="px-6 py-3 font-semibold">Quantity</th>
                                <th className="px-6 py-3 font-semibold">Type</th>
                                <th className="px-6 py-3 font-semibold">Date &amp; Time</th>
                                <th className="px-6 py-3 font-semibold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm divide-y divide-gray-50">
                            {stockLogs.length === 0 && (
                                <tr>
                                    <td colSpan="6" className="px-6 py-10 text-center text-gray-400 italic">
                                        No stock entries yet. Use "Add Stock" to record a movement.
                                    </td>
                                </tr>
                            )}
                            {stockLogs.map((log, idx) => (
                                <tr key={log.id} className="hover:bg-gray-50/50 transition-all">
                                    <td className="px-6 py-3 text-gray-400 text-xs">{idx + 1}</td>
                                    <td className="px-6 py-3">
                                        <span className="font-medium text-gray-900">{log.productName}</span>
                                    </td>
                                    <td className="px-6 py-3 text-gray-500 text-xs font-mono">{log.productId}</td>
                                    <td className="px-6 py-3">
                                        <span className={`font-bold ${ log.type === 'IN' ? 'text-emerald-600' : 'text-red-500' }`}>
                                            {log.type === 'IN' ? '+' : '-'}{log.quantity}
                                        </span>
                                    </td>
                                    <td className="px-6 py-3">
                                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold
                                            ${ log.type === 'IN'
                                                ? 'bg-emerald-100 text-emerald-700'
                                                : 'bg-red-100 text-red-700' }`}>
                                            { log.type === 'IN'
                                                ? <ArrowDownCircle className="w-3 h-3" />
                                                : <ArrowUpCircle className="w-3 h-3" /> }
                                            {log.type}
                                        </span>
                                    </td>
                                    <td className="px-6 py-3 text-gray-500 text-xs">
                                        {log.createdAt
                                            ? new Date(log.createdAt).toLocaleString()
                                            : '—'}
                                    </td>
                                    <td className="px-6 py-3 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button onClick={() => handleEditStock(log)} className="p-1.5 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-colors">
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => handleDeleteStock(log.id)} className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* View Order Modal */}
            {viewingOrder && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 overflow-y-auto">
                    <div className="bg-white rounded-lg p-6 w-full max-w-2xl m-4">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold text-gray-800">Transaction Details</h2>
                            <button onClick={() => { setViewingOrder(null); setQrOrderDetails(null); }} className="text-gray-400 hover:text-gray-600">
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Order ID</label>
                                    <p className="text-gray-900 font-mono font-bold text-blue-900">#ORD-{String(viewingOrder.id).padStart(4, '0')}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Order Date</label>
                                    <p className="text-gray-900">{viewingOrder.orderDate}</p>
                                </div>
                            </div>

                            <div className="border-t pt-4">
                                <h3 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                                    <User className="w-4 h-4" />
                                    Customer Information
                                </h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                                        <p className="text-gray-900">{viewingOrder.customerName}</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                        <p className="text-gray-900">{viewingOrder.customerEmail}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="border-t pt-4">
                                <h3 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                                    <Package className="w-4 h-4" />
                                    Products
                                </h3>
                                <div className="space-y-2">
                                    {viewingOrder.products.map((product, index) => (
                                        <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                                            <div>
                                                <p className="font-medium">{product.name || product.productName}</p>
                                                <p className="text-sm text-gray-600">Qty: {product.quantity} @ ${product.price}</p>
                                            </div>
                                            <p className="font-medium">${((product.price || 0) * (product.quantity || 0)).toFixed(2)}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="border-t pt-4 space-y-2">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-600">Subtotal</span>
                                    <span className="font-medium text-gray-900">
                                        ${viewingOrder.products.reduce((sum, p) => sum + ((p.price || 0) * (p.quantity || 0)), 0).toFixed(2)}
                                    </span>
                                </div>
                                {parseFloat(viewingOrder.gst || 0) > 0 && (
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-gray-600">GST</span>
                                        <span className="font-medium text-gray-900">${parseFloat(viewingOrder.gst).toFixed(2)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between items-center pt-2 border-t mt-2">
                                    <h3 className="font-medium text-gray-900">Total Amount</h3>
                                    <p className="text-xl font-bold text-gray-900">${viewingOrder.totalAmount?.toFixed(2)}</p>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Payment Status</label>
                                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-${getPaymentStatusColor(viewingOrder.paymentStatus)}-100 text-${getPaymentStatusColor(viewingOrder.paymentStatus)}-800`}>
                                            {viewingOrder.paymentStatus}
                                        </span>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Order Status</label>
                                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-${getOrderStatusColor(viewingOrder.orderStatus)}-100 text-${getOrderStatusColor(viewingOrder.orderStatus)}-800`}>
                                            {viewingOrder.orderStatus}
                                        </span>
                                    </div>
                                </div>

                                {/* QR Code for SUCCESS transactions — links to receipt page */}
                                {viewingOrder.paymentStatus === 'SUCCESS' && (
                                    <div className="mt-6 pt-6 border-t border-dashed flex flex-col items-center gap-2 bg-slate-50 p-4 rounded-xl">
                                        {qrLoading ? (
                                            <div className="w-32 h-32 flex items-center justify-center">
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
                                    <button onClick={() => { setViewingOrder(null); setQrOrderDetails(null); }} className="w-full bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300 transition-colors">
                                        Close
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Add Stock Modal ─────────────────────────────────────────────────── */}
            {showStockModal && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl">
                        <div className="flex items-center justify-between mb-5">
                            <div>
                                <h2 className="text-xl font-bold text-gray-800">Create Stock Entry</h2>
                                <p className="text-sm text-gray-400 mt-0.5">Record an inventory IN or OUT movement</p>
                            </div>
                            <button onClick={() => setShowStockModal(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            {/* Product selector */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Product <span className="text-red-500">*</span></label>
                                <select
                                    value={stockForm.productId}
                                    onChange={(e) => setStockForm(prev => ({ ...prev, productId: e.target.value }))}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white text-gray-800"
                                >
                                    <option value="">Select Product</option>
                                    {(products || []).map(p => {
                                        const pid = p.id || p.productId || '';
                                        const pname = p.name || p.productName || 'Unknown';
                                        return <option key={String(pid)} value={String(pid)}>{pname} (ID: {pid})</option>;
                                    })}
                                </select>
                            </div>

                            {/* Quantity */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Quantity <span className="text-red-500">*</span></label>
                                <input
                                    type="number"
                                    min="1"
                                    value={stockForm.quantity}
                                    onChange={(e) => setStockForm(prev => ({ ...prev, quantity: e.target.value }))}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white text-gray-800"
                                    placeholder="Enter quantity"
                                />
                            </div>

                            {/* Type dropdown */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Type <span className="text-red-500">*</span></label>
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setStockForm(prev => ({ ...prev, type: 'IN' }))}
                                        className={`flex items-center justify-center gap-2 py-2.5 rounded-lg border-2 font-semibold text-sm transition-all cursor-pointer
                                            ${ stockForm.type === 'IN'
                                                ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                                                : 'border-gray-200 text-gray-500 hover:border-emerald-300'}`}
                                    >
                                        <ArrowDownCircle className="w-4 h-4" /> IN (Stock In)
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setStockForm(prev => ({ ...prev, type: 'OUT' }))}
                                        className={`flex items-center justify-center gap-2 py-2.5 rounded-lg border-2 font-semibold text-sm transition-all cursor-pointer
                                            ${ stockForm.type === 'OUT'
                                                ? 'border-red-500 bg-red-50 text-red-700'
                                                : 'border-gray-200 text-gray-500 hover:border-red-300'}`}
                                    >
                                        <ArrowUpCircle className="w-4 h-4" /> OUT (Stock Out)
                                    </button>
                                </div>
                            </div>

                            {/* Error / Success messages */}
                            {stockError && (
                                <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-3 py-2">{stockError}</div>
                            )}
                            {stockSuccess && (
                                <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm rounded-lg px-3 py-2">{stockSuccess}</div>
                            )}

                            {/* Action buttons */}
                            <div className="flex gap-3 pt-2">
                                <button
                                    onClick={handleCreateStock}
                                    disabled={stockSaving}
                                    className="flex-1 bg-emerald-600 text-white py-2.5 rounded-lg hover:bg-emerald-700 transition-colors font-semibold disabled:opacity-60 cursor-pointer"
                                >
                                    {stockSaving ? 'Saving...' : 'Save Stock Entry'}
                                </button>
                                <button
                                    onClick={() => setShowStockModal(false)}
                                    className="flex-1 bg-gray-100 text-gray-800 py-2.5 rounded-lg hover:bg-gray-200 transition-colors font-semibold cursor-pointer"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Edit Stock Modal ─────────────────────────────────────────────────── */}
            {showEditModal && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl">
                        <div className="flex items-center justify-between mb-5">
                            <div>
                                <h2 className="text-xl font-bold text-gray-800">Edit Stock Entry</h2>
                                <p className="text-sm text-gray-400 mt-0.5">Update this inventory movement</p>
                            </div>
                            <button onClick={() => setShowEditModal(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Product <span className="text-red-500">*</span></label>
                                <select
                                    value={stockForm.productId}
                                    onChange={(e) => setStockForm(prev => ({ ...prev, productId: e.target.value }))}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-800"
                                >
                                    <option value="">Select Product</option>
                                    {(products || []).map(p => {
                                        const pid = p.id || p.productId || '';
                                        const pname = p.name || p.productName || 'Unknown';
                                        return <option key={String(pid)} value={String(pid)}>{pname} (ID: {pid})</option>;
                                    })}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Quantity <span className="text-red-500">*</span></label>
                                <input
                                    type="number"
                                    min="1"
                                    value={stockForm.quantity}
                                    onChange={(e) => setStockForm(prev => ({ ...prev, quantity: e.target.value }))}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-800"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Type <span className="text-red-500">*</span></label>
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setStockForm(prev => ({ ...prev, type: 'IN' }))}
                                        className={`flex items-center justify-center gap-2 py-2.5 rounded-lg border-2 font-semibold text-sm transition-all cursor-pointer
                                            ${ stockForm.type === 'IN'
                                                ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                                                : 'border-gray-200 text-gray-500 hover:border-emerald-300'}`}
                                    >
                                        <ArrowDownCircle className="w-4 h-4" /> IN
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setStockForm(prev => ({ ...prev, type: 'OUT' }))}
                                        className={`flex items-center justify-center gap-2 py-2.5 rounded-lg border-2 font-semibold text-sm transition-all cursor-pointer
                                            ${ stockForm.type === 'OUT'
                                                ? 'border-red-500 bg-red-50 text-red-700'
                                                : 'border-gray-200 text-gray-500 hover:border-red-300'}`}
                                    >
                                        <ArrowUpCircle className="w-4 h-4" /> OUT
                                    </button>
                                </div>
                            </div>

                            {stockError && (
                                <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-3 py-2">{stockError}</div>
                            )}
                            {stockSuccess && (
                                <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm rounded-lg px-3 py-2">{stockSuccess}</div>
                            )}

                            <div className="flex gap-3 pt-2">
                                <button
                                    onClick={handleUpdateStock}
                                    disabled={stockSaving}
                                    className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 transition-colors font-semibold disabled:opacity-60 cursor-pointer"
                                >
                                    {stockSaving ? 'updating...' : 'Update Entry'}
                                </button>
                                <button
                                    onClick={() => setShowEditModal(false)}
                                    className="flex-1 bg-gray-100 text-gray-800 py-2.5 rounded-lg hover:bg-gray-200 transition-colors font-semibold cursor-pointer"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StocksPage;
