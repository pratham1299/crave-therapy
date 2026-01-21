import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';

export default function OrderManager() {
    const { isAdmin } = useAuth();
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        if (!isAdmin) {
            navigate('/');
            return;
        }
        fetchOrders();
    }, [isAdmin]);

    const fetchOrders = async () => {
        try {
            const { data } = await api.get('/admin/orders');
            setOrders(data.data);
        } catch (error) {
            console.error('Failed to fetch orders:', error);
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (orderId, status) => {
        try {
            await api.put(`/admin/orders/${orderId}/status`, { status });
            fetchOrders();
        } catch (error) {
            console.error('Failed to update status:', error);
        }
    };

    const statusColors = {
        pending: 'bg-yellow-100 text-yellow-800',
        confirmed: 'bg-blue-100 text-blue-800',
        preparing: 'bg-purple-100 text-purple-800',
        ready: 'bg-green-100 text-green-800',
        delivered: 'bg-gray-100 text-gray-800',
        cancelled: 'bg-red-100 text-red-800'
    };

    const statusEmoji = {
        pending: '⏳',
        confirmed: '✅',
        preparing: '👨‍🍳',
        ready: '🔔',
        delivered: '✓',
        cancelled: '❌'
    };

    const filteredOrders = filter === 'all'
        ? orders
        : orders.filter(o => o.status === filter);

    if (!isAdmin) return null;

    return (
        <div className="min-h-[calc(100vh-64px)] p-4 md:p-8">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
                    <div className="flex items-center gap-4">
                        <Link to="/admin" className="text-2xl hover:scale-110 transition-transform">←</Link>
                        <h1 className="text-2xl font-typewriter text-therapy-dark">📦 Order Manager</h1>
                    </div>

                    {/* Filter */}
                    <div className="flex gap-2 flex-wrap">
                        {['all', 'pending', 'confirmed', 'preparing', 'ready', 'delivered'].map(status => (
                            <button
                                key={status}
                                onClick={() => setFilter(status)}
                                className={`px-3 py-1 rounded-full text-sm font-typewriter capitalize ${filter === status
                                        ? 'bg-therapy-teal text-white'
                                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                    }`}
                            >
                                {status}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Orders List */}
                {loading ? (
                    <div className="flex justify-center py-12">
                        <div className="spinner" />
                    </div>
                ) : filteredOrders.length === 0 ? (
                    <div className="text-center py-12">
                        <span className="text-5xl mb-4 block">📭</span>
                        <p className="font-typewriter text-gray-600">No orders found</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredOrders.map((order) => (
                            <div key={order._id} className="prescription-card">
                                <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <code className="bg-therapy-light px-2 py-1 rounded font-mono text-sm">
                                                #{order._id.slice(-6).toUpperCase()}
                                            </code>
                                            <span className={`px-3 py-1 rounded-full text-sm font-typewriter ${statusColors[order.status]}`}>
                                                {statusEmoji[order.status]} {order.status}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-500 font-typewriter">
                                            {new Date(order.createdAt).toLocaleString()}
                                        </p>
                                    </div>

                                    <div className="text-right">
                                        <p className="font-typewriter font-bold text-xl text-therapy-dark">
                                            ₹{order.total}
                                        </p>
                                        {order.tableNumber && (
                                            <p className="text-sm text-gray-500">Table: {order.tableNumber}</p>
                                        )}
                                    </div>
                                </div>

                                {/* Customer Info */}
                                <div className="bg-gray-50 rounded-lg p-3 mb-4">
                                    <p className="font-typewriter text-sm">
                                        <strong>Patient:</strong>{' '}
                                        {order.user?.name || order.guestInfo?.name || 'Guest'}
                                    </p>
                                    {(order.user?.email || order.guestInfo?.email) && (
                                        <p className="text-sm text-gray-600">
                                            {order.user?.email || order.guestInfo?.email}
                                        </p>
                                    )}
                                    {order.guestInfo?.phone && (
                                        <p className="text-sm text-gray-600">📞 {order.guestInfo.phone}</p>
                                    )}
                                </div>

                                {/* Items */}
                                <div className="mb-4">
                                    <h4 className="font-typewriter font-bold text-sm mb-2">Prescription:</h4>
                                    <div className="space-y-1">
                                        {order.items.map((item, index) => (
                                            <div key={index} className="flex justify-between text-sm font-typewriter">
                                                <span>{item.name} × {item.quantity}</span>
                                                <span>₹{item.price * item.quantity}</span>
                                            </div>
                                        ))}
                                    </div>
                                    {order.couponCode && (
                                        <div className="flex justify-between text-sm font-typewriter text-green-600 mt-2">
                                            <span>Coupon: {order.couponCode}</span>
                                            <span>-₹{order.discount}</span>
                                        </div>
                                    )}
                                </div>

                                {order.notes && (
                                    <div className="bg-yellow-50 rounded-lg p-2 mb-4">
                                        <p className="text-sm font-typewriter">📝 {order.notes}</p>
                                    </div>
                                )}

                                {/* Status Actions */}
                                {order.status !== 'delivered' && order.status !== 'cancelled' && (
                                    <div className="flex gap-2 flex-wrap">
                                        {order.status === 'pending' && (
                                            <>
                                                <button
                                                    onClick={() => updateStatus(order._id, 'confirmed')}
                                                    className="pill-button bg-blue-500 text-white text-sm"
                                                >
                                                    ✅ Confirm
                                                </button>
                                                <button
                                                    onClick={() => updateStatus(order._id, 'cancelled')}
                                                    className="pill-button bg-red-500 text-white text-sm"
                                                >
                                                    ❌ Cancel
                                                </button>
                                            </>
                                        )}
                                        {order.status === 'confirmed' && (
                                            <button
                                                onClick={() => updateStatus(order._id, 'preparing')}
                                                className="pill-button bg-purple-500 text-white text-sm"
                                            >
                                                👨‍🍳 Start Preparing
                                            </button>
                                        )}
                                        {order.status === 'preparing' && (
                                            <button
                                                onClick={() => updateStatus(order._id, 'ready')}
                                                className="pill-button bg-green-500 text-white text-sm"
                                            >
                                                🔔 Mark Ready
                                            </button>
                                        )}
                                        {order.status === 'ready' && (
                                            <button
                                                onClick={() => updateStatus(order._id, 'delivered')}
                                                className="pill-button bg-gray-700 text-white text-sm"
                                            >
                                                ✓ Delivered
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
