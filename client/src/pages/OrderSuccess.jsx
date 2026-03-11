import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../utils/api';

export default function OrderSuccess() {
    const { orderId } = useParams();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showPaymentSlider, setShowPaymentSlider] = useState(false);
    const [copied, setCopied] = useState(false);

    const SUPPORT_UPI_ID = 'cravetherapy@oksbi';

    useEffect(() => {
        fetchOrder();
    }, [orderId]);

    useEffect(() => {
        if (order && !order.isPaid) {
            // Delay the slider opening slightly for effect
            const timer = setTimeout(() => setShowPaymentSlider(true), 1500);
            return () => clearTimeout(timer);
        }
    }, [order]);

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

    const handleCopyUpi = () => {
        navigator.clipboard.writeText(SUPPORT_UPI_ID);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleUpiClick = () => {
        if (!order) return;
        const upiString = `upi://pay?pa=${SUPPORT_UPI_ID}&pn=Crave%20Therapy&am=${order.total}&cu=INR`;
        window.location.href = upiString;
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

                {/* Main page payment reminder */}
                {order && !order.isPaid && (
                    <div className="mb-6 p-4 bg-orange-50 border-2 border-orange-200 rounded-lg max-w-md mx-auto relative group">
                        <span className="text-xl inline-block mb-1">👈</span>
                        <p className="font-typewriter text-orange-800 font-bold">
                            Don't forget to pay!
                        </p>
                        <p className="font-typewriter text-sm text-orange-600">
                            Pay via counter or UPI
                        </p>
                        <button
                            onClick={() => setShowPaymentSlider(true)}
                            className="mt-3 px-4 py-2 bg-orange-200 hover:bg-orange-300 text-orange-900 rounded font-typewriter text-sm font-bold transition-colors"
                        >
                            View Payment Options
                        </button>
                    </div>
                )}

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

            {/* Payment Slider (for unpaid orders) */}
            {order && !order.isPaid && (
                <>
                    {/* Backdrop */}
                    <div
                        className={`fixed inset-0 bg-black/60 z-40 transition-opacity duration-300 ${showPaymentSlider ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                        onClick={() => setShowPaymentSlider(false)}
                    />

                    {/* Sliding Drawer */}
                    <div
                        className={`fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.2)] z-50 transform transition-transform duration-500 ease-out ${showPaymentSlider ? 'translate-y-0' : 'translate-y-full'}`}
                        style={{ maxHeight: '90vh', overflowY: 'auto' }}
                    >
                        <div className="p-6 md:p-8 max-w-md mx-auto relative text-center">
                            {/* Drag Handle */}
                            <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mb-6" />

                            <h2 className="text-2xl font-typewriter font-bold text-therapy-dark mb-2">
                                💳 Payment Required
                            </h2>
                            <p className="text-gray-600 font-typewriter text-sm mb-6">
                                Please complete your payment to start therapy
                            </p>

                            {/* QR Code */}
                            <div className="bg-gray-50 p-4 rounded-xl border-2 border-dashed border-gray-300 inline-block mb-4 hover:border-therapy-teal transition-colors duration-300 cursor-pointer" onClick={handleUpiClick}>
                                <img
                                    src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=upi://pay?pa=${SUPPORT_UPI_ID}%26pn=Crave%20Therapy%26am=${order.total}%26cu=INR`}
                                    alt="UPI QR Code"
                                    className="w-48 h-48 sm:w-56 sm:h-56 mx-auto object-contain mix-blend-multiply"
                                />
                            </div>

                            {/* UPI Details */}
                            <div className="bg-therapy-light rounded-lg p-3 mb-6 relative group">
                                <p className="text-xs text-therapy-teal font-bold mb-1 uppercase tracking-wider">UPI ID</p>
                                <div className="flex items-center justify-between font-mono bg-white px-3 py-2 rounded border border-teal-100">
                                    <span className="text-lg text-gray-800">{SUPPORT_UPI_ID}</span>
                                    <button
                                        onClick={handleCopyUpi}
                                        className="text-therapy-teal hover:text-therapy-dark p-2 rounded-md hover:bg-therapy-light transition-colors"
                                        title="Copy UPI ID"
                                    >
                                        {copied ? '✅' : '📋'}
                                    </button>
                                </div>
                                <p className="text-xs text-gray-500 mt-2 font-typewriter">
                                    Amount to pay: <span className="font-bold text-therapy-dark">₹{order.total}</span>
                                </p>
                            </div>

                            {/* Actions */}
                            <div className="space-y-3 font-typewriter">
                                <button
                                    onClick={handleUpiClick}
                                    className="w-full py-4 bg-therapy-teal text-white rounded-xl font-bold text-lg hover:bg-therapy-dark shadow-lg shadow-teal-500/30 transition-all active:scale-[0.98]"
                                >
                                    PAY VIA UPI APP
                                </button>

                                <button
                                    onClick={() => setShowPaymentSlider(false)}
                                    className="w-full py-4 bg-orange-100 text-orange-700 rounded-xl font-bold text-lg hover:bg-orange-200 transition-colors border-2 border-orange-200"
                                >
                                    PAY AT COUNTER 🏥
                                </button>
                            </div>

                            <p className="mt-4 text-xs text-gray-400 font-typewriter">
                                Show this screen at the counter if paying by cash
                            </p>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
