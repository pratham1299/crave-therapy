import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';

export default function CounterPortal() {
    const { user, isStaff } = useAuth();
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [menuItems, setMenuItems] = useState([]);
    const [showAddItem, setShowAddItem] = useState(false);
    const [activeTab, setActiveTab] = useState('pending'); // 'pending' or 'completed'

    useEffect(() => {
        if (!user || !isStaff) {
            navigate('/');
            return;
        }
        fetchData();
    }, [user, isStaff]);

    useEffect(() => {
        fetchOrders();
    }, [activeTab]);

    const fetchData = async () => {
        try {
            const [statsRes, menuRes] = await Promise.all([
                api.get('/counter/stats'),
                api.get('/counter/menu')
            ]);
            setStats(statsRes.data.data);
            setMenuItems(menuRes.data.data);
            fetchOrders();
        } catch (error) {
            console.error('Failed to fetch:', error);
        }
    };

    const fetchOrders = async (searchQuery = '') => {
        setLoading(true);
        try {
            const showPaid = activeTab === 'completed' ? 'true' : 'false';
            const { data } = await api.get(`/counter/orders?showPaid=${showPaid}&search=${searchQuery}`);

            // For completed tab, filter to show only paid orders
            if (activeTab === 'completed') {
                setOrders(data.data.filter(o => o.isPaid));
            } else {
                setOrders(data.data.filter(o => !o.isPaid));
            }
        } catch (error) {
            console.error('Fetch orders failed:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = () => {
        fetchOrders(search);
    };

    const clearSearch = () => {
        setSearch('');
        fetchOrders('');
    };

    const selectOrder = async (orderId) => {
        try {
            const { data } = await api.get(`/counter/orders/${orderId}`);
            setSelectedOrder(data.data);
        } catch (error) {
            console.error('Failed to get order:', error);
        }
    };

    const addItemToOrder = async (menuItem) => {
        if (!selectedOrder) return;
        try {
            const { data } = await api.post(`/counter/orders/${selectedOrder._id}/add-item`, {
                menuItemId: menuItem._id,
                quantity: 1
            });
            setSelectedOrder(data.data);
            setShowAddItem(false);
            fetchData();
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to add item');
        }
    };

    const removeItem = async (itemIndex) => {
        if (!selectedOrder) return;
        try {
            const { data } = await api.delete(`/counter/orders/${selectedOrder._id}/remove-item/${itemIndex}`);
            setSelectedOrder(data.data);
            fetchData();
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to remove item');
        }
    };

    const updateItemQuantity = async (itemIndex, newQuantity) => {
        if (!selectedOrder || newQuantity < 1) return;
        const updatedItems = selectedOrder.items.map((item, idx) =>
            idx === itemIndex ? { ...item, quantity: newQuantity } : item
        );
        try {
            const { data } = await api.put(`/counter/orders/${selectedOrder._id}/items`, {
                items: updatedItems
            });
            setSelectedOrder(data.data);
            fetchData();
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to update');
        }
    };

    const markAsPaid = async () => {
        if (!selectedOrder) return;
        if (!confirm(`Mark order #${selectedOrder._id.slice(-6)} as PAID for ₹${selectedOrder.total}?`)) return;
        try {
            await api.put(`/counter/orders/${selectedOrder._id}/pay`);
            setSelectedOrder(null);
            fetchData();
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to process payment');
        }
    };

    const getCustomerInfo = (order) => {
        if (order.user) {
            return { name: order.user.name, phone: order.user.phone || 'N/A' };
        }
        return { name: order.guestInfo?.name || 'Guest', phone: order.guestInfo?.phone || 'N/A' };
    };

    const formatTime = (dateStr) => {
        const date = new Date(dateStr);
        return date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    };

    if (!user || !isStaff) return null;

    return (
        <div className="min-h-[calc(100vh-64px)] bg-gray-100">
            {/* Header */}
            <div className="bg-therapy-dark text-white p-4">
                <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-4">
                    <div className="flex items-center gap-4">
                        <div>
                            <h1 className="text-xl font-typewriter font-bold">🧾 Counter Portal</h1>
                            <p className="text-sm opacity-80">Staff: {user?.name}</p>
                        </div>
                    </div>

                    {/* Stats */}
                    {stats && (
                        <div className="flex gap-6 text-center">
                            <div>
                                <p className="text-2xl font-bold text-orange-300">{stats.todayPending}</p>
                                <p className="text-xs opacity-80">Pending</p>
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-green-300">{stats.todayPaid}</p>
                                <p className="text-xs opacity-80">Paid Today</p>
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-yellow-300">₹{stats.todayRevenue}</p>
                                <p className="text-xs opacity-80">Today's Revenue</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="max-w-7xl mx-auto p-4 grid lg:grid-cols-3 gap-4">
                {/* Left: Order List */}
                <div className="lg:col-span-1 bg-white rounded-xl shadow-lg overflow-hidden">
                    {/* Tabs */}
                    <div className="flex border-b">
                        <button
                            onClick={() => { setActiveTab('pending'); setSelectedOrder(null); }}
                            className={`flex-1 py-3 font-typewriter font-bold text-sm transition-colors ${activeTab === 'pending'
                                    ? 'bg-orange-100 text-orange-700 border-b-2 border-orange-500'
                                    : 'text-gray-500 hover:bg-gray-50'
                                }`}
                        >
                            🕐 Pending ({stats?.todayPending || 0})
                        </button>
                        <button
                            onClick={() => { setActiveTab('completed'); setSelectedOrder(null); }}
                            className={`flex-1 py-3 font-typewriter font-bold text-sm transition-colors ${activeTab === 'completed'
                                    ? 'bg-green-100 text-green-700 border-b-2 border-green-500'
                                    : 'text-gray-500 hover:bg-gray-50'
                                }`}
                        >
                            ✅ Completed ({stats?.todayPaid || 0})
                        </button>
                    </div>

                    {/* Search */}
                    <div className="p-4 border-b bg-gray-50">
                        <div className="flex gap-2">
                            <input
                                type="text"
                                placeholder="Search name, phone, table..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                className="flex-1 px-3 py-2 border-2 border-gray-300 rounded-lg font-typewriter text-sm focus:border-therapy-teal focus:outline-none"
                            />
                            <button
                                onClick={handleSearch}
                                className="px-4 py-2 bg-therapy-teal text-white rounded-lg hover:bg-therapy-dark transition-colors"
                            >
                                🔍
                            </button>
                            {search && (
                                <button
                                    onClick={clearSearch}
                                    className="px-3 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                                >
                                    ✕
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Order List */}
                    <div className="max-h-[calc(100vh-350px)] overflow-y-auto">
                        {loading ? (
                            <div className="flex justify-center py-8">
                                <div className="spinner" />
                            </div>
                        ) : orders.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                <span className="text-4xl block mb-2">
                                    {activeTab === 'pending' ? '📭' : '📋'}
                                </span>
                                <p className="font-typewriter">
                                    {activeTab === 'pending' ? 'No pending orders' : 'No completed orders today'}
                                </p>
                                {search && (
                                    <button onClick={clearSearch} className="text-therapy-teal text-sm mt-2 hover:underline">
                                        Clear search
                                    </button>
                                )}
                            </div>
                        ) : (
                            orders.map((order) => {
                                const customer = getCustomerInfo(order);
                                return (
                                    <div
                                        key={order._id}
                                        onClick={() => selectOrder(order._id)}
                                        className={`p-4 border-b cursor-pointer hover:bg-gray-50 transition-colors ${selectedOrder?._id === order._id
                                                ? 'bg-therapy-light border-l-4 border-l-therapy-teal'
                                                : ''
                                            }`}
                                    >
                                        <div className="flex justify-between items-start mb-1">
                                            <div>
                                                <p className="font-typewriter font-bold">{customer.name}</p>
                                                <p className="text-xs text-gray-500">📞 {customer.phone}</p>
                                            </div>
                                            <div className="text-right">
                                                <span className="font-typewriter font-bold text-therapy-dark">₹{order.total}</span>
                                                {order.isPaid && (
                                                    <span className="block text-xs text-green-600">✓ Paid</span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex justify-between items-center text-xs text-gray-500">
                                            <span>Table: {order.tableNumber || '-'}</span>
                                            <span>{formatTime(order.createdAt)} • #{order._id.slice(-4)}</span>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* Right: Order Details */}
                <div className="lg:col-span-2">
                    {selectedOrder ? (
                        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                            {/* Order Header */}
                            <div className={`p-4 ${selectedOrder.isPaid ? 'bg-green-500' : 'bg-therapy-teal'} text-white`}>
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h2 className="text-xl font-typewriter font-bold">
                                            {getCustomerInfo(selectedOrder).name}
                                        </h2>
                                        <p className="text-sm opacity-90">
                                            📞 {getCustomerInfo(selectedOrder).phone} | Table: {selectedOrder.tableNumber || '-'}
                                        </p>
                                        {selectedOrder.isPaid && (
                                            <p className="text-sm mt-1 opacity-90">
                                                ✅ Paid at {formatTime(selectedOrder.paidAt)}
                                            </p>
                                        )}
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs opacity-80">Order ID</p>
                                        <code className="bg-white/20 px-2 py-1 rounded text-sm">
                                            #{selectedOrder._id.slice(-6).toUpperCase()}
                                        </code>
                                    </div>
                                </div>
                            </div>

                            {/* Items */}
                            <div className="p-4">
                                <div className="flex justify-between items-center mb-3">
                                    <h3 className="font-typewriter font-bold">Order Items</h3>
                                    {!selectedOrder.isPaid && (
                                        <button
                                            onClick={() => setShowAddItem(true)}
                                            className="px-3 py-1 bg-green-500 text-white rounded-lg text-sm hover:bg-green-600"
                                        >
                                            + Add Item
                                        </button>
                                    )}
                                </div>

                                <div className="space-y-2 max-h-64 overflow-y-auto">
                                    {selectedOrder.items.map((item, index) => (
                                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                            <div className="flex-1">
                                                <p className="font-typewriter font-bold">{item.name}</p>
                                                <p className="text-sm text-gray-500">₹{item.price} each</p>
                                            </div>
                                            {!selectedOrder.isPaid ? (
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => updateItemQuantity(index, item.quantity - 1)}
                                                        className="w-8 h-8 bg-gray-200 rounded-full hover:bg-gray-300 font-bold"
                                                    >
                                                        -
                                                    </button>
                                                    <span className="w-8 text-center font-typewriter">{item.quantity}</span>
                                                    <button
                                                        onClick={() => updateItemQuantity(index, item.quantity + 1)}
                                                        className="w-8 h-8 bg-therapy-teal text-white rounded-full hover:bg-therapy-dark font-bold"
                                                    >
                                                        +
                                                    </button>
                                                    <span className="w-20 text-right font-typewriter font-bold">
                                                        ₹{item.price * item.quantity}
                                                    </span>
                                                    <button
                                                        onClick={() => removeItem(index)}
                                                        className="ml-2 text-red-500 hover:text-red-700"
                                                    >
                                                        🗑️
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="text-right">
                                                    <span className="text-gray-500 mr-3">×{item.quantity}</span>
                                                    <span className="font-typewriter font-bold">₹{item.price * item.quantity}</span>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                {/* Totals */}
                                <div className="mt-4 pt-4 border-t space-y-2 font-typewriter">
                                    <div className="flex justify-between">
                                        <span>Subtotal</span>
                                        <span>₹{selectedOrder.subtotal}</span>
                                    </div>
                                    {selectedOrder.discount > 0 && (
                                        <div className="flex justify-between text-green-600">
                                            <span>Discount ({selectedOrder.couponCode})</span>
                                            <span>-₹{selectedOrder.discount}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between text-2xl font-bold pt-2 border-t">
                                        <span>TOTAL</span>
                                        <span className="text-therapy-dark">₹{selectedOrder.total}</span>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="mt-6 flex gap-3">
                                    {!selectedOrder.isPaid ? (
                                        <button
                                            onClick={markAsPaid}
                                            className="flex-1 py-4 bg-green-500 text-white rounded-xl font-typewriter text-lg font-bold hover:bg-green-600 transition-colors"
                                        >
                                            💵 RECEIVE PAYMENT - ₹{selectedOrder.total}
                                        </button>
                                    ) : (
                                        <div className="flex-1 py-4 bg-green-100 text-green-700 rounded-xl font-typewriter text-lg font-bold text-center">
                                            ✅ PAID SUCCESSFULLY
                                        </div>
                                    )}
                                    <button
                                        onClick={() => setSelectedOrder(null)}
                                        className="px-6 py-4 bg-gray-200 rounded-xl hover:bg-gray-300"
                                    >
                                        ✕
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                            <span className="text-6xl block mb-4">
                                {activeTab === 'pending' ? '👈' : '📋'}
                            </span>
                            <h2 className="text-xl font-typewriter text-gray-600">
                                {activeTab === 'pending'
                                    ? 'Select an order to view details'
                                    : 'Select a completed order to view receipt'
                                }
                            </h2>
                            <p className="text-gray-400 mt-2">Click on any order from the list</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Add Item Modal */}
            {showAddItem && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
                        <div className="p-4 bg-therapy-teal text-white flex justify-between items-center">
                            <h3 className="font-typewriter font-bold">Add Item to Order</h3>
                            <button onClick={() => setShowAddItem(false)} className="text-2xl hover:opacity-80">&times;</button>
                        </div>
                        <div className="p-4 max-h-96 overflow-y-auto">
                            <div className="grid sm:grid-cols-2 gap-3">
                                {menuItems.map((item) => (
                                    <button
                                        key={item._id}
                                        onClick={() => addItemToOrder(item)}
                                        className="p-3 border-2 rounded-lg text-left hover:border-therapy-teal hover:bg-therapy-light transition-colors"
                                    >
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="font-typewriter font-bold">{item.name}</p>
                                                <p className="text-xs text-gray-500">{item.mood?.emoji} {item.mood?.name}</p>
                                            </div>
                                            <span className="font-typewriter font-bold text-therapy-dark">₹{item.price}</span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
