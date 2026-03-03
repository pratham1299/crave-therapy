import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

export default function OrderHistory() {
    const { user, loading: authLoading } = useAuth();
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState(null);

    useEffect(() => {
        if (!authLoading && !user) {
            navigate('/');
            return;
        }
        if (user) {
            fetchOrders();
        }
    }, [user, authLoading]);

    const fetchOrders = async () => {
        try {
            const { data } = await api.get('/orders/my-orders');
            setOrders(data.data);
        } catch (error) {
            console.error('Failed to fetch orders:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        const colors = {
            pending: 'bg-yellow-100 text-yellow-800',
            confirmed: 'bg-blue-100 text-blue-800',
            preparing: 'bg-orange-100 text-orange-800',
            ready: 'bg-green-100 text-green-800',
            delivered: 'bg-gray-100 text-gray-800',
            cancelled: 'bg-red-100 text-red-800'
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (authLoading || loading) {
        return (
            <div className="min-h-[calc(100vh-64px)] flex items-center justify-center">
                <div className="spinner" />
            </div>
        );
    }

    if (!user) return null;

    return (
        <div className="min-h-[calc(100vh-64px)] p-4 md:p-8">
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-3xl font-typewriter text-therapy-dark flex items-center gap-2">
                        <span>📜</span> My Prescriptions
                    </h1>
                    <Link
                        to="/symptoms"
                        className="pill-button bg-therapy-teal text-white"
                    >
                        + New Order
                    </Link>
                </div>

                {orders.length === 0 ? (
                    <div className="prescription-card text-center py-12">
                        <span className="text-6xl block mb-4">📋</span>
                        <h2 className="text-xl font-typewriter text-therapy-dark mb-2">No orders yet!</h2>
                        <p className="text-gray-600 font-typewriter mb-6">
                            Start your therapy journey with some comfort food.
                        </p>
                        <Link
                            to="/symptoms"
                            className="pill-button bg-therapy-teal text-white inline-block"
                        >
                            Check My Symptoms
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {orders.map((order) => (
                            <div
                                key={order._id}
                                className="prescription-card cursor-pointer hover:border-therapy-teal transition-colors"
                                onClick={() => setSelectedOrder(selectedOrder?._id === order._id ? null : order)}
                            >
                                {/* Order Header */}
                                <div className="flex items-start justify-between mb-3">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="font-typewriter font-bold">
                                                Order #{order._id.slice(-6).toUpperCase()}
                                            </span>
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${getStatusColor(order.status)}`}>
                                                {order.status.toUpperCase()}
                                            </span>
                                            {order.isPaid && (
                                                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-800">
                                                    ✓ PAID
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-sm text-gray-500 font-typewriter">
                                            {formatDate(order.createdAt)}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-typewriter font-bold text-lg text-therapy-dark">
                                            ₹{order.total}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {order.items.length} item{order.items.length > 1 ? 's' : ''}
                                        </p>
                                    </div>
                                </div>

                                {/* Quick Preview */}
                                <p className="text-sm text-gray-600 font-typewriter">
                                    {order.items.slice(0, 3).map(i => i.name).join(', ')}
                                    {order.items.length > 3 && ` +${order.items.length - 3} more`}
                                </p>

                                {/* Expanded Details */}
                                {selectedOrder?._id === order._id && (
                                    <div className="mt-4 pt-4 border-t border-gray-200 animate-slide-up">
                                        <h4 className="font-typewriter font-bold mb-2">Items:</h4>
                                        <div className="space-y-2 mb-4">
                                            {order.items.map((item, index) => (
                                                <div key={index} className="flex justify-between text-sm">
                                                    <span className="text-gray-700">
                                                        {item.name} × {item.quantity}
                                                    </span>
                                                    <span className="font-typewriter">₹{item.price * item.quantity}</span>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="space-y-1 pt-3 border-t border-gray-200">
                                            <div className="flex justify-between text-sm">
                                                <span>Subtotal</span>
                                                <span>₹{order.subtotal}</span>
                                            </div>
                                            {order.discount > 0 && (
                                                <div className="flex justify-between text-sm text-green-600">
                                                    <span>Discount {order.couponCode && `(${order.couponCode})`}</span>
                                                    <span>-₹{order.discount}</span>
                                                </div>
                                            )}
                                            <div className="flex justify-between font-bold pt-2 border-t">
                                                <span>Total</span>
                                                <span>₹{order.total}</span>
                                            </div>
                                        </div>

                                        {order.tableNumber && (
                                            <p className="text-sm text-gray-500 mt-3">
                                                <span className="font-bold">Table:</span> {order.tableNumber}
                                            </p>
                                        )}
                                        {order.notes && (
                                            <p className="text-sm text-gray-500 mt-1">
                                                <span className="font-bold">Notes:</span> {order.notes}
                                            </p>
                                        )}
                                    </div>
                                )}

                                {/* Expand/Collapse indicator */}
                                <div className="text-center mt-2">
                                    <span className="text-xs text-gray-400">
                                        {selectedOrder?._id === order._id ? '▲ Click to collapse' : '▼ Click to expand'}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
