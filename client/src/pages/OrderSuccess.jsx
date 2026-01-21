import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../utils/api';

export default function OrderSuccess() {
    const { orderId } = useParams();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchOrder();
    }, [orderId]);

    const fetchOrder = async () => {
        try {
            const { data } = await api.get(`/orders/${orderId}`);
            setOrder(data.data);
        } catch (error) {
            console.error('Failed to fetch order:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-[calc(100vh-64px)] flex items-center justify-center">
                <div className="spinner" />
            </div>
        );
    }

    if (!order) {
        return (
            <div className="min-h-[calc(100vh-64px)] flex flex-col items-center justify-center p-4">
                <span className="text-6xl mb-4">😕</span>
                <h1 className="text-2xl font-typewriter text-therapy-dark">Order not found</h1>
            </div>
        );
    }

    return (
        <div className="min-h-[calc(100vh-64px)] flex flex-col items-center justify-center p-4">
            <div className="text-center animate-bounce-in">
                {/* Success Animation */}
                <div className="relative inline-block mb-6">
                    <span className="text-8xl">✅</span>
                    <span className="absolute -top-2 -right-2 text-4xl animate-float">🎉</span>
                </div>

                <h1 className="text-3xl md:text-4xl font-typewriter text-therapy-dark mb-2">
                    Prescription Confirmed!
                </h1>
                <p className="text-gray-600 font-typewriter mb-6">
                    Your food therapy is being prepared
                </p>

                {/* Order Details Card */}
                <div className="prescription-card max-w-md mx-auto text-left mb-8">
                    <div className="flex justify-between items-center mb-4">
                        <span className="text-sm text-gray-500 font-typewriter">Order ID</span>
                        <code className="bg-therapy-light px-3 py-1 rounded font-mono text-sm">
                            {order._id.slice(-8).toUpperCase()}
                        </code>
                    </div>

                    <hr className="mb-4" />

                    {/* Items */}
                    <div className="space-y-2 mb-4">
                        {order.items.map((item, index) => (
                            <div key={index} className="flex justify-between font-typewriter text-sm">
                                <span>{item.name} × {item.quantity}</span>
                                <span>₹{item.price * item.quantity}</span>
                            </div>
                        ))}
                    </div>

                    <hr className="mb-4" />

                    {/* Totals */}
                    <div className="space-y-1 font-typewriter">
                        <div className="flex justify-between text-sm">
                            <span>Subtotal</span>
                            <span>₹{order.subtotal}</span>
                        </div>
                        {order.discount > 0 && (
                            <div className="flex justify-between text-sm text-green-600">
                                <span>Discount ({order.couponCode})</span>
                                <span>-₹{order.discount}</span>
                            </div>
                        )}
                        <div className="flex justify-between font-bold text-lg pt-2">
                            <span>Total</span>
                            <span>₹{order.total}</span>
                        </div>
                    </div>

                    {/* Status */}
                    <div className="mt-6 p-3 bg-yellow-100 rounded-lg text-center">
                        <span className="font-typewriter text-yellow-800">
                            📍 Status: <strong>{order.status.toUpperCase()}</strong>
                        </span>
                    </div>

                    {order.tableNumber && (
                        <p className="text-center mt-3 text-sm text-gray-600 font-typewriter">
                            Table: {order.tableNumber}
                        </p>
                    )}
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Link
                        to="/symptoms"
                        className="pill-button bg-therapy-teal text-white"
                    >
                        Order More
                    </Link>
                    <Link
                        to="/"
                        className="pill-button bg-white text-therapy-dark border-2 border-therapy-teal"
                    >
                        Back to Home
                    </Link>
                </div>

                {/* Fun Footer */}
                <p className="mt-8 text-xs text-gray-500 font-typewriter">
                    ⚕️ Your mood therapy is on its way!<br />
                    Thank you for choosing Crave Therapy
                </p>
            </div>
        </div>
    );
}
