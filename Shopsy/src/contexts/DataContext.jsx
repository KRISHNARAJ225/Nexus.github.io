import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getCustomers, createCustomer, updateCustomer as updateCust, deleteCustomer as deleteCust } from '../Service.js/CustomerService.js';
import { getCategories, createCategory, updateCategory as updateCat, deleteCategory as deleteCat } from '../Service.js/CategoryService.js';
import { getProducts, getProduct, createProduct, updateProduct as updateProd, deleteProduct as deleteProd } from '../Service.js/ProductService.js';
import { getOrders, createOrder, updateOrder as updateOrd, deleteOrder as deleteOrd, updateOrderStatus as updateOrdStatus, updateOrderPaymentStatus as updateOrdPaymentStatus } from '../Service.js/OrderService.js';
import { getUsers as apiGetUsers, updateUser as apiUpdateUser, deleteUser as apiDeleteUser } from '../Service.js/UserService.js';
import { registerUser as apiRegisterUser } from '../Service.js/AuthService.js';
import { createStock as apiCreateStock, getStocks as apiGetStocks, updateStock as apiUpdateStock, deleteStock as apiDeleteStock } from '../Service.js/StockService.js';

const DataContext = createContext();

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) throw new Error('useData must be used within a DataProvider');
  return context;
};

export const DataProvider = ({ children }) => {
  const [token, setToken]               = useState(() => localStorage.getItem('authToken'));
  const [customers, setCustomers]       = useState([]);
  const [categories, setCategories]     = useState([]);
  const [products, setProducts]         = useState([]);
  const [orders, setOrders]             = useState([]);
  const [registeredUsers, setRegisteredUsers] = useState([]);
  const [notifications, setNotifications]     = useState([]);
  const [stockLogs, setStockLogs]             = useState([]);

  // Abort Controllers for fetch operations
  const abortControllers = React.useRef({
    customers: null,
    categories: null,
    products: null,
    orders: null,
    users: null
  });

  const getAbortSignal = (type) => {
    if (abortControllers.current[type]) abortControllers.current[type].abort();
    abortControllers.current[type] = new AbortController();
    return abortControllers.current[type].signal;
  };

  const addNotification = (message) =>
    setNotifications(prev => [{ id: Date.now(), message, date: new Date().toISOString() }, ...prev]);

  // Normalize order fields from backend to match UI expectations
  const normalizeOrder = (o) => {
    if (!o) return o;
    // Handle customer as object or first element of array
    const custObj = Array.isArray(o.customer) ? o.customer[0] : (o.customer || {});
    
    const cid = o.customerId || o.customer_id || custObj?.id || custObj?.customerId || custObj?.customer_id || '';
    const pid = o.productId  || o.product_id  || o.product?.id  || '';
    
    // Improved customer info extraction
    const custName  = o.customerName  || o.customer_name  || custObj?.name  || custObj?.customerName || custObj?.fullName || (typeof o.customer === 'string' ? o.customer : '') || '';
    const custEmail = o.customerEmail || o.customer_email || custObj?.email || custObj?.emailAddress || '';
    const custPhone = o.customerPhone || o.customer_phone || custObj?.phone || custObj?.phoneNumber || '';
    
    const prods = Array.isArray(o.products)    ? o.products
                : Array.isArray(o.orderItems)  ? o.orderItems
                : Array.isArray(o.items)        ? o.items
                : Array.isArray(o.orderProducts)? o.orderProducts
                : [];
    
    // Calculate total if missing or zero
    let total = parseFloat(o.totalAmount ?? o.total_amount ?? o.total ?? o.amount ?? o.grandTotal ?? 0);
    if (total <= 0 && prods.length > 0) {
      const subtotal = prods.reduce((sum, p) => sum + ((parseFloat(p.price) || 0) * (parseInt(p.quantity) || 0)), 0);
      total = subtotal + parseFloat(o.gst || 0) + parseFloat(o.tax || 0) - parseFloat(o.discount || 0);
    }

    return {
      ...o,
      id:              o.id              ?? o._id ?? o.orderId      ?? o.order_id    ?? Date.now(),
      customerId:      cid,
      productId:       pid,
      customerName:    custName,
      customerEmail:   custEmail,
      customerPhone:   custPhone,
      shippingAddress: o.shippingAddress || o.shipping_address || o.deliveryAddress || o.address || custObj?.address || '',
      shippingDate:    o.shippingDate    || o.shipping_date    || o.deliveryDate    || o.delivery_date || '',
      orderDate:       o.orderDate       || o.order_date       || o.createdAt       || o.created_at   || '',
      paymentStatus:   (o.paymentStatus || o.payment_status || o.paymentMethod || o.payment_method || 'PENDING').toUpperCase(),
      orderStatus:     (o.orderStatus   || o.order_status   || o.status          || 'PENDING').toUpperCase(),
      totalAmount:     total,
      products:        prods,
    };
  };

  // Normalize category fields
  const normalizeCategory = (c) => {
    if (!c) return c;
    return {
      ...c,
      id:   c.id   ?? c.categoryId   ?? c.category_id   ?? c.divisionId   ?? c.division_id   ?? `cat-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: c.name || c.categoryName || c.category_name || c.divisionName || c.division_name || '',
      type: c.type || c.categoryType || c.category_type || 'Physical Goods',
    };
  };

  // Normalize product fields
  const normalizeProduct = (p) => {
    if (!p) return p;
    return {
      ...p,
      id:              p.id              ?? p.productId       ?? p.product_id,
      name:            p.name            || p.productName     || p.product_name    || '',
      price:           parseFloat(p.price ?? p.unitPrice ?? p.unit_price ?? p.sellingPrice ?? p.selling_price ?? 0),
      quantity:        parseInt(p.quantity ?? p.stock ?? p.stockQuantity ?? p.stock_quantity ?? 0, 10),
      uom:             p.uom             || p.unit            || p.unitOfMeasure   || p.unit_of_measure || 'pcs',
      division:        p.division        || p.category?.name  || p.categoryName    || p.category_name   || p.divisionName || '',
      salableStock:    parseInt(p.salableStock    ?? p.salable_stock    ?? p.availableStock ?? p.available_stock ?? p.quantity ?? 0, 10),
      unsaleableStock: parseInt(p.unsaleableStock ?? p.unsaleable_stock ?? p.damagedStock   ?? p.damaged_stock  ?? 0, 10),
      expiryDate:      p.expiryDate      || p.expiry_date     || p.expiry          || '',
    };
  };

  // Normalize customer fields
  const normalizeCustomer = (c) => {
    if (!c) return c;
    return {
      ...c,
      id:        c.customerId ?? c.customer_id ?? c.customer_Id ?? c.id ?? c._id ?? c.cid,
      name:      c.name    || c.customerName  || c.customer_name  || c.fullName      || c.full_name || '',
      email:     c.email   || c.emailAddress  || c.email_address  || '',
      address:   c.address || c.streetAddress || c.street_address || '',
      state:     c.state   || c.stateName     || c.state_name     || '',
      pincode:   c.pincode || c.pinCode       || c.pin_code       || c.zipCode       || c.zip_code || c.postalCode || '',
      createdAt: c.createdAt || c.created_at  || c.createdDate    || c.create_date   || null,
    };
  };

  // Normalize user fields
  const normalizeUser = (u) => {
    if (!u) return u;
    return {
      ...u,
      id:           u.id ?? u.userId ?? u.user_id ?? u._id ?? `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name:         u.name || u.username || u.fullName || 'Unknown User',
      username:     u.username || '',
      email:        u.email || '',
      phone:        u.phone || '',
      role:         (u.role || 'user').toLowerCase(),
      registeredAt: u.registeredAt || u.createdAt || u.created_at || new Date().toISOString(),
    };
  };

  // Paginated states for list pages
  const [customerPageData, setCustomerPageData] = useState({ content: [], totalElements: 0, totalPages: 0, number: 0 });
  const [categoryPageData, setCategoryPageData] = useState({ content: [], totalElements: 0, totalPages: 0, number: 0 });
  const [productPageData, setProductPageData] = useState({ content: [], totalElements: 0, totalPages: 0, number: 0 });
  const [orderPageData, setOrderPageData] = useState({ content: [], totalElements: 0, totalPages: 0, number: 0 });

  const fetchCustomersPage = useCallback(async (page = 0, size = 10, search = '', explicitSignal = null) => {
    const signal = explicitSignal || getAbortSignal('customers');
    try {
      const d = await getCustomers(page, size, search, { signal });
      const arr = Array.isArray(d) ? d : (d?.content || []);
      setCustomerPageData({ content: arr.map(normalizeCustomer), totalElements: d?.totalElements || arr.length, totalPages: d?.totalPages || 1, number: d?.number || 0 });
    } catch (err) { if (err.name !== 'AbortError') console.error(err); }
  }, []);

  const fetchCategoriesPage = useCallback(async (page = 0, size = 10, search = '', explicitSignal = null) => {
    const signal = explicitSignal || getAbortSignal('categories');
    try {
      const d = await getCategories(page, size, search, { signal });
      const arr = Array.isArray(d) ? d : (d?.content || []);
      setCategoryPageData({ content: arr.map(normalizeCategory), totalElements: d?.totalElements || arr.length, totalPages: d?.totalPages || 1, number: d?.number || 0 });
    } catch (err) { if (err.name !== 'AbortError') console.error(err); }
  }, []);

  const fetchProductsPage = useCallback(async (page = 0, size = 10, search = '', explicitSignal = null) => {
    const signal = explicitSignal || getAbortSignal('products');
    try {
      const d = await getProducts(page, size, search, { signal });
      const arr = Array.isArray(d) ? d : (d?.content || []);
      setProductPageData({ content: arr.map(normalizeProduct), totalElements: d?.totalElements || arr.length, totalPages: d?.totalPages || 1, number: d?.number || 0 });
    } catch (err) { if (err.name !== 'AbortError') console.error(err); }
  }, []);

  const fetchOrdersPage = useCallback(async (page = 0, size = 10, search = '', explicitSignal = null) => {
    const signal = explicitSignal || getAbortSignal('orders');
    try {
      const d = await getOrders(page, size, search, { signal });
      const arr = Array.isArray(d) ? d : (d?.content || []);
      setOrderPageData({ content: arr.map(normalizeOrder), totalElements: d?.totalElements || arr.length, totalPages: d?.totalPages || 1, number: d?.number || 0 });
    } catch (err) { if (err.name !== 'AbortError') console.error(err); }
  }, []);

  const fetchUsersPage = useCallback(async (page = 0, size = 1000, search = '', explicitSignal = null) => {
    const signal = explicitSignal || getAbortSignal('users');
    try {
      const d = await apiGetUsers(page, size, search, { signal });
      const arr = Array.isArray(d) ? d : (d?.content || []);
      setRegisteredUsers(arr.map(normalizeUser));
    } catch (err) { 
      if (err.name !== 'AbortError') {
        const savedUsers = localStorage.getItem('registeredUsers');
        if (savedUsers) setRegisteredUsers(JSON.parse(savedUsers).map(normalizeUser));
      }
    }
  }, []);

  const fetchStocksPage = useCallback(async (page = 0, size = 1000) => {
    try {
      const d = await apiGetStocks(page, size);
      const arr = Array.isArray(d) ? d : (d?.content || []);
      // Map API stock entries to the UI stockLogs format
      setStockLogs(arr.map(s => ({
        id: s.id || Date.now(),
        productId: s.productId,
        productName: s.productName || `Product #${s.productId}`,
        quantity: s.quantity,
        type: s.type,
        createdAt: s.createdAt || s.date || new Date().toISOString()
      })));
    } catch (err) { console.error('Failed to fetch stock logs:', err); }
  }, []);

  useEffect(() => {
    if (!token) return;
    // Fetch all for dashboard aggregations
    getCustomers(0, 1000).then(d => { setCustomers((Array.isArray(d) ? d : (d?.content || [])).map(normalizeCustomer)); fetchCustomersPage(); }).catch(() => {
      const s = localStorage.getItem('customers'); if (s) { setCustomers(JSON.parse(s).map(normalizeCustomer)); fetchCustomersPage(); }
    });
    getCategories(0, 1000).then(d => { setCategories((Array.isArray(d) ? d : (d?.content || [])).map(normalizeCategory)); fetchCategoriesPage(); }).catch(() => {
      const s = localStorage.getItem('categories'); if (s) { setCategories(JSON.parse(s).map(normalizeCategory)); fetchCategoriesPage(); }
    });
    getProducts(0, 1000).then(d => { setProducts((Array.isArray(d) ? d : (d?.content || [])).map(normalizeProduct)); fetchProductsPage(); }).catch(() => {
      const s = localStorage.getItem('products'); if (s) { setProducts(JSON.parse(s).map(normalizeProduct)); fetchProductsPage(); }
    });
    getOrders(0, 1000).then(d => { setOrders((Array.isArray(d) ? d : (d?.content || [])).map(normalizeOrder)); fetchOrdersPage(); }).catch(() => {
      const s = localStorage.getItem('orders'); if (s) { setOrders(JSON.parse(s).map(normalizeOrder)); fetchOrdersPage(); }
    });

    fetchUsersPage();
    fetchStocksPage();
  }, [token, fetchCustomersPage, fetchCategoriesPage, fetchProductsPage, fetchOrdersPage, fetchUsersPage, fetchStocksPage]);

  const setAuthToken = (newToken) => {
    if (newToken) localStorage.setItem('authToken', newToken);
    else localStorage.removeItem('authToken');
    setToken(newToken);
  };

  const clearData = () => {
    setCustomers([]); setCategories([]); setProducts([]);
    setOrders([]); setRegisteredUsers([]); setNotifications([]);
  };

  // ── Customers ──────────────────────────────────────────────────────────────
  const addCustomer = async (customer) => {
    const now = new Date().toISOString();
    try {
      const raw = await createCustomer(customer);
      const n = normalizeCustomer({ createdAt: now, ...raw });
      setCustomers(prev => [...prev, n]);
      setCustomerPageData(prev => ({ ...prev, content: [n, ...prev.content], totalElements: prev.totalElements + 1 }));
      addNotification(`New customer '${n.name}' added`);
      return n;
    } catch {
      const n = normalizeCustomer({ id: Date.now(), createdAt: now, ...customer });
      setCustomers(prev => { const u = [...prev, n]; localStorage.setItem('customers', JSON.stringify(u)); return u; });
      setCustomerPageData(prev => ({ ...prev, content: [n, ...prev.content], totalElements: prev.totalElements + 1 }));
      addNotification(`New customer '${n.name}' added`);
      return n;
    }
  };

  const updateCustomer = async (id, data) => {
    // Optimistic: update UI immediately, fire API in background
    setCustomers(prev => { const u = prev.map(c => String(c.id) === String(id) ? { ...c, ...data } : c); localStorage.setItem('customers', JSON.stringify(u)); return u; });
    setCustomerPageData(prev => ({ ...prev, content: prev.content.map(c => String(c.id) === String(id) ? { ...c, ...data } : c) }));
    updateCust(id, data).then(res => {
      const u = normalizeCustomer(res);
      setCustomers(prev => prev.map(c => String(c.id) === String(id) ? u : c));
      setCustomerPageData(prev => ({ ...prev, content: prev.content.map(c => String(c.id) === String(id) ? u : c) }));
    }).catch(() => {/* 403 etc — local update already applied */});
  };

  const deleteCustomer = async (id) => {
    // Optimistic: remove from UI immediately, fire API in background
    setCustomers(prev => { const u = prev.filter(c => String(c.id) !== String(id)); localStorage.setItem('customers', JSON.stringify(u)); return u; });
    setCustomerPageData(prev => ({ ...prev, content: prev.content.filter(c => String(c.id) !== String(id)), totalElements: Math.max(0, prev.totalElements - 1) }));
    deleteCust(id).catch(() => {/* 403 etc — local delete already applied */});
  };

  // ── Categories ─────────────────────────────────────────────────────────────
  const addCategory = async (category) => {
    try {
      const n = normalizeCategory(await createCategory(category));
      setCategories(prev => [...prev, n]);
      setCategoryPageData(prev => ({ ...prev, content: [n, ...prev.content], totalElements: prev.totalElements + 1 }));
      addNotification(`New category '${n.name}' created`);
      return n;
    } catch {
      const n = normalizeCategory({ id: Date.now(), ...category });
      setCategories(prev => { const u = [...prev, n]; localStorage.setItem('categories', JSON.stringify(u)); return u; });
      setCategoryPageData(prev => ({ ...prev, content: [n, ...prev.content], totalElements: prev.totalElements + 1 }));
      addNotification(`New category '${n.name}' created`);
      return n;
    }
  };

  const updateCategory = async (id, data) => {
    setCategories(prev => { const u = prev.map(c => String(c.id) === String(id) ? { ...c, ...data } : c); localStorage.setItem('categories', JSON.stringify(u)); return u; });
    setCategoryPageData(prev => ({ ...prev, content: prev.content.map(c => String(c.id) === String(id) ? { ...c, ...data } : c) }));
    updateCat(id, data).then(res => {
      const u = normalizeCategory(res);
      setCategories(prev => prev.map(c => String(c.id) === String(id) ? u : c));
      setCategoryPageData(prev => ({ ...prev, content: prev.content.map(c => String(c.id) === String(id) ? u : c) }));
    }).catch(() => {});
  };

  const deleteCategory = async (id) => {
    setCategories(prev => { const u = prev.filter(c => String(c.id) !== String(id)); localStorage.setItem('categories', JSON.stringify(u)); return u; });
    setCategoryPageData(prev => ({ ...prev, content: prev.content.filter(c => String(c.id) !== String(id)), totalElements: Math.max(0, prev.totalElements - 1) }));
    deleteCat(id).catch(() => {});
  };

  // ── Products ───────────────────────────────────────────────────────────────
  const addProduct = async (product) => {
    try {
      const n = normalizeProduct(await createProduct(product));
      setProducts(prev => [...prev, n]);
      setProductPageData(prev => ({ ...prev, content: [n, ...prev.content], totalElements: prev.totalElements + 1 }));
      addNotification(`New product '${n.name}' added`);
      return n;
    } catch {
      const n = normalizeProduct({ id: Date.now(), ...product });
      setProducts(prev => { const u = [...prev, n]; localStorage.setItem('products', JSON.stringify(u)); return u; });
      setProductPageData(prev => ({ ...prev, content: [n, ...prev.content], totalElements: prev.totalElements + 1 }));
      addNotification(`New product '${n.name}' added`);
      return n;
    }
  };

  const updateProduct = async (id, data, { localOnly = false } = {}) => {
    setProducts(prev => { const u = prev.map(p => String(p.id) === String(id) ? { ...p, ...data } : p); localStorage.setItem('products', JSON.stringify(u)); return u; });
    setProductPageData(prev => ({ ...prev, content: prev.content.map(p => String(p.id) === String(id) ? { ...p, ...data } : p) }));
    if (localOnly) return;
    updateProd(id, data).then(res => {
      const u = normalizeProduct(res);
      setProducts(prev => prev.map(p => String(p.id) === String(id) ? u : p));
      setProductPageData(prev => ({ ...prev, content: prev.content.map(p => String(p.id) === String(id) ? u : p) }));
    }).catch(() => {});
  };

  const deleteProduct = async (id) => {
    setProducts(prev => { const u = prev.filter(p => String(p.id) !== String(id)); localStorage.setItem('products', JSON.stringify(u)); return u; });
    setProductPageData(prev => ({ ...prev, content: prev.content.filter(p => String(p.id) !== String(id)), totalElements: Math.max(0, prev.totalElements - 1) }));
    deleteProd(id).catch(() => {});
  };

  // ── Orders ─────────────────────────────────────────────────────────────────
  const addOrder = async (order) => {
    try {
      const createdObj = await createOrder(order);
      const n = normalizeOrder(createdObj);

      // --- Instant Stock Deduction ---
      const orderItems = order.orderItems || [];
      for (const item of orderItems) {
        const product = products.find(p => String(p.id) === String(item.productId));
        if (product) {
          const newQty = Math.max(0, parseInt(product.quantity || 0) - parseInt(item.quantity || 0));
          const payload = {
            name: product.name,
            price: Math.max(0.01, parseFloat(product.price) || 1),
            quantity: newQty,
            expiryDate: product.expiryDate || null,
            saleableStock: parseInt(product.salableStock || product.saleableStock || 0),
            nonSaleableStock: parseInt(product.unsaleableStock || product.nonSaleableStock || 0),
            sku: product.sku || '',
            uom: product.uom || 'pcs',
            divisionName: product.division || product.divisionName || 'Default'
          };
          await updateProd(product.id, payload);
          setProducts(prev => prev.map(p => String(p.id) === String(product.id) ? { ...p, quantity: newQty } : p));
          setProductPageData(prev => ({ ...prev, content: prev.content.map(p => String(p.id) === String(product.id) ? { ...p, quantity: newQty } : p) }));
          // Also create a stock OUT record
          try {
            await apiCreateStock({ productId: Number(product.id), quantity: item.quantity, type: 'OUT' });
          } catch (e) { console.warn('Stock OUT record failed:', e.message); }
        }
      }

      setOrders(prev => [...prev, n]);
      setOrderPageData(prev => ({ ...prev, content: [n, ...prev.content], totalElements: prev.totalElements + 1 }));
      addNotification(`New transaction #ORD-${n.id.toString().padStart(4, '0')} created`);
      return n;
    } catch {
      const n = normalizeOrder({ id: Date.now(), orderDate: new Date().toISOString().split('T')[0], ...order });
      setOrders(prev => { const u = [...prev, n]; localStorage.setItem('orders', JSON.stringify(u)); return u; });
      setOrderPageData(prev => ({ ...prev, content: [n, ...prev.content], totalElements: prev.totalElements + 1 }));
      addNotification(`New transaction #ORD-${n.id.toString().padStart(4, '0')} created locally`);
      return n;
    }
  };

  const updateOrder = async (id, data) => {
    // Standardize status for backend
    const newPaymentStatus = (data.paymentStatus || 'PENDING').toUpperCase();
    const newOrderStatus   = (data.orderStatus   || 'PENDING').toUpperCase();
    const payload = { ...data, paymentStatus: newPaymentStatus, orderStatus: newOrderStatus };

    try {
      // ── 1. Update full order details (name, address, products, etc.) ──
      let res = null;
      try {
        res = await updateOrd(id, payload);
      } catch (err) {
        console.warn('[updateOrder] PUT /orders/{id} failed, continuing with status update:', err.message);
      }

      // ── 2. Always hit dedicated /status endpoint so statuses are persisted ──
      let statusRes = null;
      let paymentRes = null;
      try {
        statusRes = await updateOrdStatus(id, newOrderStatus);
        paymentRes = await updateOrdPaymentStatus(id, newPaymentStatus);
      } catch (err) {
        console.error('[updateOrder] PUT /orders/{id}/status or /payment failed:', err.message);
      }

      // Only update locally if at least one API call succeeded
      if (!res && !statusRes) {
        throw new Error('Both update API calls failed.');
      }

      // ── 3. Merge server response back into state ──
      const merged = normalizeOrder({ ...(res || {}), ...(statusRes || {}), ...payload });
      const finalUpdate = {
        ...merged,
        paymentStatus: newPaymentStatus,
        orderStatus:   newOrderStatus,
        customerName:  merged.customerName  || data.customerName,
        products:      merged.products?.length ? merged.products : (data.products || []),
      };
      
      const applyFinal = (list) => list.map(o => String(o.id) === String(id) ? { ...o, ...finalUpdate } : o);
      setOrders(prev => { const u = applyFinal(prev); localStorage.setItem('orders', JSON.stringify(u)); return u; });
      setOrderPageData(prev => ({ ...prev, content: applyFinal(prev.content) }));

      // Fetch from backend to ensure alignment with remote DB.
      fetchOrdersPage();

      // ── 4. Auto-adjust product stock on order status transitions ──
      // Find the previous order status to detect transition
      const prevOrder = orders.find(o => String(o.id) === String(id));
      const prevStatus = (prevOrder?.orderStatus || '').toUpperCase();
      const orderItems = finalUpdate.products || [];

      if (prevStatus !== 'CONFIRMED' && newOrderStatus === 'CONFIRMED') {
        // Confirmed: reduce stock for each product
        for (const item of orderItems) {
          const product = products.find(p => String(p.id) === String(item.productId));
          if (product) {
            const newQty = Math.max(0, parseInt(product.quantity || 0) - parseInt(item.quantity || 0));
            const payload = {
              name: product.name,
              price: Math.max(0.01, parseFloat(product.price) || 1),
              quantity: newQty,
              expiryDate: product.expiryDate || null,
              saleableStock: parseInt(product.salableStock || product.saleableStock || 0),
              nonSaleableStock: parseInt(product.unsaleableStock || product.nonSaleableStock || 0),
              sku: product.sku || '',
              uom: product.uom || 'pcs',
              divisionName: product.division || product.divisionName || 'Default'
            };
            await updateProd(product.id, payload);
            setProducts(prev => prev.map(p => String(p.id) === String(product.id) ? { ...p, quantity: newQty } : p));
            setProductPageData(prev => ({ ...prev, content: prev.content.map(p => String(p.id) === String(product.id) ? { ...p, quantity: newQty } : p) }));
            // Also create a stock OUT record
            try {
              await apiCreateStock({ productId: Number(product.id), quantity: item.quantity, type: 'OUT' });
            } catch (e) { console.warn('Stock OUT record failed:', e.message); }
          }
        }
      } else if (prevStatus === 'CONFIRMED' && newOrderStatus === 'CANCELLED') {
        // Cancelled after confirmed: restore stock
        for (const item of orderItems) {
          const product = products.find(p => String(p.id) === String(item.productId));
          if (product) {
            const newQty = parseInt(product.quantity || 0) + parseInt(item.quantity || 0);
            const payload = {
              name: product.name,
              price: Math.max(0.01, parseFloat(product.price) || 1),
              quantity: newQty,
              expiryDate: product.expiryDate || null,
              saleableStock: parseInt(product.salableStock || product.saleableStock || 0),
              nonSaleableStock: parseInt(product.unsaleableStock || product.nonSaleableStock || 0),
              sku: product.sku || '',
              uom: product.uom || 'pcs',
              divisionName: product.division || product.divisionName || 'Default'
            };
            await updateProd(product.id, payload);
            setProducts(prev => prev.map(p => String(p.id) === String(product.id) ? { ...p, quantity: newQty } : p));
            setProductPageData(prev => ({ ...prev, content: prev.content.map(p => String(p.id) === String(product.id) ? { ...p, quantity: newQty } : p) }));
            // Also create a stock IN record
            try {
              await apiCreateStock({ productId: Number(product.id), quantity: item.quantity, type: 'IN' });
            } catch (e) { console.warn('Stock IN record failed:', e.message); }
          }
        }
      }

      addNotification(`Transaction #ORD-${String(id).padStart(4, '0')} updated successfully`);
      return finalUpdate;
    } catch (err) {
      console.error('[updateOrder] Unexpected error:', err);
      return null;
    }
  };

  // ── Stock ──────────────────────────────────────────────────────────────────
  const createStock = async (data) => {
    const product = products.find(p => String(p.id) === String(data.productId));
    const productName = product?.name || product?.productName || `Product #${data.productId}`;

    // Optimistically push log entry locally so list populates instantly
    const logEntry = {
      id: Date.now(),
      productId: data.productId,
      productName,
      quantity: Number(data.quantity),
      type: data.type,
      createdAt: new Date().toISOString(),
    };
    setStockLogs(prev => [logEntry, ...prev]);

    // Update Product Stock Safely (don't overwrite other inputs)
    if (product) {
      try {
        // Fetch raw full product from backend
        let fullProdOrig = null;
        try { fullProdOrig = await getProduct(product.id); } catch(e) { fullProdOrig = null; }
        
        let targetProduct = fullProdOrig && Object.keys(fullProdOrig).length > 0 ? fullProdOrig : product;
        
        // Compute new quantity
        let currentQty = parseInt(targetProduct.quantity || 0);
        let newQty = data.type === 'IN' 
            ? currentQty + parseInt(data.quantity || 0) 
            : Math.max(0, currentQty - parseInt(data.quantity || 0));
        
        // Update ONLY quantity
        targetProduct.quantity = newQty;

        // Perform backend put with full safely fetched object
        await updateProd(product.id, targetProduct);

        // Update UI Context
        setProducts(prev => prev.map(p => String(p.id) === String(product.id) ? { ...p, quantity: newQty } : p));
        setProductPageData(prev => ({
          ...prev, content: prev.content.map(p => String(p.id) === String(product.id) ? { ...p, quantity: newQty } : p)
        }));
      } catch (err) {
        console.warn('Failed to update full product details:', err);
      }
    }

    try {
      const res = await apiCreateStock(data);
      addNotification(`Stock ${data.type} of ${data.quantity} units recorded for ${productName}`);
      fetchStocksPage();   // Refetch stocks
      return res;
    } catch (err) {
      console.error('[createStock] API failed:', err);
      // Even if API fails, return optimistically generated log
      return logEntry;
    }
  };

  const updateStock = async (id, data) => {
    try {
      const res = await apiUpdateStock(id, data);
      addNotification('Stock movement updated');
      fetchStocksPage();
      return res;
    } catch (err) {
      console.error('[updateStock] API failed:', err);
      return null;
    }
  };

  const deleteStock = async (id) => {
    try {
      await apiDeleteStock(id);
      setStockLogs(prev => prev.filter(s => String(s.id) !== String(id)));
      addNotification('Stock movement deleted');
      return true;
    } catch (err) {
      console.error('[deleteStock] API failed:', err);
      return false;
    }
  };

  const deleteOrder = async (id) => {
    setOrders(prev => { const u = prev.filter(o => String(o.id) !== String(id)); localStorage.setItem('orders', JSON.stringify(u)); return u; });
    setOrderPageData(prev => ({ ...prev, content: prev.content.filter(o => String(o.id) !== String(id)), totalElements: Math.max(0, prev.totalElements - 1) }));
    deleteOrd(id).catch(() => {});
  };

  // ── Users ──────────────────────────────────────────────────────────────────
  const registerUser = async (userData) => {
    try {
      const result = await apiRegisterUser(userData);
      const userObj = result?.data || result || {};
      const n = normalizeUser({
        ...userObj,
        ...userData,
        registeredAt: new Date().toISOString(),
      });
      setRegisteredUsers(prev => { const u = [...prev, n]; localStorage.setItem('registeredUsers', JSON.stringify(u)); return u; });
      addNotification(`New user '${n.name}' registered`);
      return n;
    } catch {
      const n = normalizeUser({ ...userData, registeredAt: new Date().toISOString() });
      setRegisteredUsers(prev => { const u = [...prev, n]; localStorage.setItem('registeredUsers', JSON.stringify(u)); return u; });
      addNotification(`New user '${n.name}' registered`);
      return n;
    }
  };

  const updateUser = async (id, data) => {
    // Optimistic update
    setRegisteredUsers(prev => {
      const u = prev.map(user => String(user.id) === String(id) ? { ...user, ...data } : user);
      localStorage.setItem('registeredUsers', JSON.stringify(u));
      return u;
    });
    try {
      await apiUpdateUser(id, data);
      addNotification(`User '${data.name || 'Unknown'}' updated successfully`);
      fetchUsersPage();
      return true;
    } catch (err) {
      console.warn('[updateUser] API failed:', err.message);
      addNotification(`User '${data.name || 'Unknown'}' updated locally`);
      return true;
    }
  };

  const deleteUser = async (id) => {
    const user = registeredUsers.find(u => String(u.id) === String(id));
    setRegisteredUsers(prev => {
      const u = prev.filter(user => String(user.id) !== String(id));
      localStorage.setItem('registeredUsers', JSON.stringify(u));
      return u;
    });
    try {
      await apiDeleteUser(id);
      addNotification(`User '${user?.name || 'Unknown'}' deleted`);
      return true;
    } catch (err) {
      console.warn('[deleteUser] API failed:', err.message);
      addNotification(`User '${user?.name || 'Unknown'}' removed locally`);
      return true;
    }
  };

  const value = {
    token, setAuthToken, clearData,
    customers, categories, products, orders, registeredUsers, notifications,
    customerPageData, categoryPageData, productPageData, orderPageData,
    fetchCustomersPage, fetchCategoriesPage, fetchProductsPage, fetchOrdersPage, fetchUsersPage,
    addNotification,
    addCustomer, updateCustomer, deleteCustomer,
    addCategory, updateCategory, deleteCategory,
    addProduct, updateProduct, deleteProduct,
    addOrder, updateOrder, deleteOrder,
    registerUser, updateUser, deleteUser,
    createStock, updateStock, deleteStock, stockLogs,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

export default DataContext;
