import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getOrderByCode } from '../Service.js/OrderService';
import { User, MapPin, Package, CreditCard, Printer, Download } from 'lucide-react';
import PremiumLoader from './PremiumLoader';

const ReceiptPage = () => {
  const { orderCode } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    const fetchOrder = async () => {
      try {
        const data = await getOrderByCode(orderCode);
        if (!cancelled) setOrder(data);
      } catch (err) {
        console.error('Failed to fetch order details:', err);
        if (!cancelled) setError('Order not found or invalid QR code.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchOrder();
    return () => { cancelled = true; };
  }, [orderCode]);

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

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return <PremiumLoader variant="receipt" />;
  }

  if (error || !order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white p-8 rounded-2xl shadow-lg max-w-sm w-full text-center border border-gray-100">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <CreditCard className="w-8 h-8 text-red-400" />
          </div>
          <h2 className="text-lg font-bold text-gray-900 mb-2">Receipt Not Found</h2>
          <p className="text-red-500 font-medium text-sm">{error || 'Order not found'}</p>
          <p className="text-gray-400 text-xs mt-3">The order code may be invalid or expired.</p>
        </div>
      </div>
    );
  }

  const customerName = Array.isArray(order.customer) ? order.customer[0]?.name : (order.customer?.name || order.customerName);
  const customerEmail = Array.isArray(order.customer) ? order.customer[0]?.email : (order.customer?.email || order.customerEmail);
  const customerPhone = Array.isArray(order.customer) ? order.customer[0]?.phone : (order.customer?.phone || order.customerPhone);
  const shippingAddress = Array.isArray(order.customer) ? order.customer[0]?.address : (order.customer?.address || order.shippingAddress);
  
  const products = order.products || [];

  const payColor = getPaymentStatusColor(order.paymentStatus);
  const ordColor = getOrderStatusColor(order.orderStatus);

  const calculateDisplayBreakdown = (o) => {
    const prods = o.products || o.orderItems || [];
    const subtotal = prods.reduce((sum, p) => sum + ((p.price || 0) * (p.quantity || p.qty || 1)), 0);
    const gst = parseFloat(o.gst) > 0 ? parseFloat(o.gst) : subtotal * 0.18;
    const tax = parseFloat(o.tax) > 0 ? parseFloat(o.tax) : subtotal * 0.05;
    const discount = parseFloat(o.discount) > 0 ? parseFloat(o.discount) : prods.reduce((sum, p) => sum + (parseFloat(p.discount) || 0), 0);
    const total = subtotal + gst + tax - discount;
    return { subtotal, gst, tax, discount, total };
  };

  return (
    <div className="min-h-screen py-8 px-4 flex justify-center items-start" style={{ background: 'linear-gradient(135deg, #f8fafc 0%, #eef2ff 50%, #f0f4ff 100%)' }}>
      <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 w-full max-w-2xl border border-gray-100" style={{ animation: 'fadeInUp 0.5s ease' }}>
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-4" style={{ background: 'linear-gradient(135deg, #eef2ff, #dbeafe)' }}>
            <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)' }}>
              <CreditCard className="w-7 h-7 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Transaction Receipt</h1>
          <p className="text-gray-400 mt-2 text-sm font-medium">Thank you for your order!</p>
          
          {/* Print button */}
          <button
            onClick={handlePrint}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors print:hidden"
          >
            <Printer className="w-3.5 h-3.5" />
            Print Receipt
          </button>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl">
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Order ID</label>
              <p className="text-gray-900 font-mono font-bold text-blue-900">#ORD-{String(order.id).padStart(4, '0')}</p>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Order Date</label>
              <p className="text-gray-900 font-medium">{order.orderDate}</p>
            </div>
            <div>
               <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Order Code</label>
               <p className="text-gray-900 font-mono text-sm">{order.orderCode}</p>
            </div>
          </div>

          <div className="border border-gray-100 rounded-xl overflow-hidden">
            <div className="bg-gray-50 px-4 py-3 border-b border-gray-100 flex items-center gap-2">
              <User className="w-4 h-4 text-gray-500" />
              <h3 className="font-semibold text-gray-900">Customer Information</h3>
            </div>
            <div className="p-4 grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Name</label>
                <p className="text-gray-900 font-medium">{customerName || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Email</label>
                <p className="text-gray-900">{customerEmail || 'N/A'}</p>
              </div>
              {customerPhone && (
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-gray-500 mb-1">Phone</label>
                  <p className="text-gray-900">{customerPhone}</p>
                </div>
              )}
            </div>
          </div>

          <div className="border border-gray-100 rounded-xl overflow-hidden">
            <div className="bg-gray-50 px-4 py-3 border-b border-gray-100 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-gray-500" />
              <h3 className="font-semibold text-gray-900">Shipping Information</h3>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Address</label>
                <p className="text-gray-900">{shippingAddress || 'N/A'}</p>
              </div>
            </div>
          </div>

          <div className="border border-gray-100 rounded-xl overflow-hidden">
            <div className="bg-gray-50 px-4 py-3 border-b border-gray-100 flex items-center gap-2">
              <Package className="w-4 h-4 text-gray-500" />
              <h3 className="font-semibold text-gray-900">Order Items</h3>
            </div>
            <div className="p-4">
              <div className="space-y-3">
                {products.map((product, index) => {
                  const qty = product.quantity || product.qty || 1;
                  const price = product.price || 0;
                  const name = product.name || product.productName || 'Unknown Product';
                  const uom = product.uom || '';
                  return (
                    <div key={index} className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
                      <div>
                        <p className="font-medium text-gray-900">{name}</p>
                        <p className="text-sm text-gray-500">Qty: {qty} {uom} × ${(price).toFixed(2)}</p>
                      </div>
                      <p className="font-bold text-gray-900">${(price * qty).toFixed(2)}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-xl p-4 space-y-3">
            {(() => {
              const bd = calculateDisplayBreakdown(order);
              return (
                <>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium text-gray-900">
                      ${bd.subtotal.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">GST (18%)</span>
                    <span className="font-medium text-gray-900">${bd.gst.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Tax (5%)</span>
                    <span className="font-medium text-gray-900">${bd.tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Discount</span>
                    <span className="font-medium text-red-600">-${bd.discount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center pt-3 border-t border-gray-200 mt-3">
                    <h3 className="font-semibold text-gray-900">Total Amount</h3>
                    <p className="text-2xl font-bold text-blue-600">${bd.total.toFixed(2)}</p>
                  </div>
                </>
              );
            })()}
          </div>

          {/* Payment and Order Status removed as per requirement to not reflect updates on receipt */}
          
        </div>
      </div>

      {/* Print-only styles */}
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @media print {
          body { background: white !important; }
          .print\\:hidden { display: none !important; }
        }
      `}</style>
    </div>
  );
};

export default ReceiptPage;
