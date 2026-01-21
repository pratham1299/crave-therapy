import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export default function Checkout() {
    const { items, subtotal, updateQuantity, removeItem, clearCart } = useCart();
    const { user } = useAuth();
    const navigate = useNavigate();

    const [couponCode, setCouponCode] = useState('');
    const [couponApplied, setCouponApplied] = useState(null);
    const [discount, setDiscount] = useState(0);
    const [couponError, setCouponError] = useState('');
    const [guestInfo, setGuestInfo] = useState({ name: '', phone: '', email: '' });
    const [notes, setNotes] = useState('');
    const [tableNumber, setTableNumber] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const total = subtotal - discount;

    const applyCoupon = async () => {
        setCouponError('');
        try {
            const { data } = await api.post('/coupons/validate', {
                code: couponCode,
                subtotal
            });
            setCouponApplied(data.data.coupon);
            setDiscount(data.data.discount);
        } catch (err) {
            setCouponError(err.response?.data?.message || 'Invalid coupon');
            setCouponApplied(null);
            setDiscount(0);
        }
    };

    const removeCoupon = () => {
        setCouponApplied(null);
        setDiscount(0);
        setCouponCode('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        // Validate guest info if not logged in
        if (!user && (!guestInfo.name || !guestInfo.phone)) {
            setError('Please enter your name and phone number');
            setLoading(false);
            return;
        }

        try {
            const orderData = {
                items: items.map(item => ({
                    menuItem: item._id,
                    name: item.name,
                    price: item.price,
                    quantity: item.quantity
                })),
                guestInfo: user ? null : guestInfo,
                couponCode: couponApplied?.code,
                notes,
                tableNumber
            };

            const { data } = await api.post('/orders', orderData);
            clearCart();
            navigate(`/order-success/${data.data._id}`);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to place order');
        } finally {
            setLoading(false);
        }
    };

    if (items.length === 0) {
        return (
            <div className="min-h-[calc(100vh-64px)] flex flex-col items-center justify-center p-4">
                <span className="text-6xl mb-4">🛒</span>
                <h1 className="text-2xl font-typewriter text-therapy-dark mb-2">Your cart is empty!</h1>
                <p className="text-gray-600 font-typewriter mb-6">Time to check your symptoms and get some food therapy.</p>
                <button
                    onClick={() => navigate('/symptoms')}
                    className="pill-button bg-therapy-teal text-white"
                >
                    Check My Symptoms
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-[calc(100vh-64px)] p-4 md:p-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-typewriter text-therapy-dark mb-6 flex items-center gap-2">
                    <span>📋</span> Your Prescription
                </h1>

                <div className="grid md:grid-cols-3 gap-6">
                    {/* Cart Items */}
                    <div className="md:col-span-2 space-y-4">
                        {items.map((item, index) => (
                            <div
                                key={item._id}
                                className="prescription-card flex items-center gap-4 animate-slide-up"
                                style={{ animationDelay: `${index * 0.1}s` }}
                            >
                                <div className="flex-1">
                                    <h3 className="font-typewriter font-bold">{item.name}</h3>
                                    <p className="text-sm text-gray-500">₹{item.price} each</p>
                                </div>

                                {/* Quantity Controls */}
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => updateQuantity(item._id, item.quantity - 1)}
                                        className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 font-bold"
                                    >
                                        -
                                    </button>
                                    <span className="font-typewriter w-8 text-center">{item.quantity}</span>
                                    <button
                                        onClick={() => updateQuantity(item._id, item.quantity + 1)}
                                        className="w-8 h-8 rounded-full bg-therapy-teal text-white hover:bg-therapy-dark font-bold"
                                    >
                                        +
                                    </button>
                                </div>

                                <div className="text-right">
                                    <p className="font-typewriter font-bold text-lg">₹{item.price * item.quantity}</p>
                                    <button
                                        onClick={() => removeItem(item._id)}
                                        className="text-red-500 text-sm hover:underline"
                                    >
                                        Remove
                                    </button>
                                </div>
                            </div>
                        ))}

                        {/* Coupon Section */}
                        <div className="prescription-card">
                            <h3 className="font-typewriter font-bold mb-3 flex items-center gap-2">
                                <span>🎫</span> Apply Prescription Code
                            </h3>

                            {couponApplied ? (
                                <div className="flex items-center justify-between bg-green-100 p-3 rounded-lg">
                                    <div>
                                        <p className="font-typewriter font-bold text-green-800">
                                            {couponApplied.icon} {couponApplied.name} applied!
                                        </p>
                                        <p className="text-sm text-green-600">You save ₹{discount}</p>
                                    </div>
                                    <button
                                        onClick={removeCoupon}
                                        className="text-red-500 hover:underline text-sm"
                                    >
                                        Remove
                                    </button>
                                </div>
                            ) : (
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={couponCode}
                                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                                        placeholder="Enter code"
                                        className="flex-1 px-4 py-2 border-2 border-therapy-teal rounded-lg font-typewriter uppercase"
                                    />
                                    <button
                                        onClick={applyCoupon}
                                        disabled={!couponCode}
                                        className="pill-button bg-therapy-teal text-white disabled:opacity-50"
                                    >
                                        Apply
                                    </button>
                                </div>
                            )}
                            {couponError && (
                                <p className="text-red-500 text-sm mt-2 font-typewriter">{couponError}</p>
                            )}
                        </div>
                    </div>

                    {/* Order Summary & Guest Info */}
                    <div className="space-y-4">
                        {/* Guest Info if not logged in */}
                        {!user && (
                            <div className="prescription-card">
                                <h3 className="font-typewriter font-bold mb-3">Patient Details</h3>
                                <div className="space-y-3">
                                    <input
                                        type="text"
                                        placeholder="Your Name *"
                                        value={guestInfo.name}
                                        onChange={(e) => setGuestInfo({ ...guestInfo, name: e.target.value })}
                                        className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg font-typewriter"
                                        required
                                    />
                                    <input
                                        type="tel"
                                        placeholder="Phone Number *"
                                        value={guestInfo.phone}
                                        onChange={(e) => setGuestInfo({ ...guestInfo, phone: e.target.value })}
                                        className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg font-typewriter"
                                        required
                                    />
                                    <input
                                        type="email"
                                        placeholder="Email (optional)"
                                        value={guestInfo.email}
                                        onChange={(e) => setGuestInfo({ ...guestInfo, email: e.target.value })}
                                        className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg font-typewriter"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Table & Notes */}
                        <div className="prescription-card">
                            <h3 className="font-typewriter font-bold mb-3">Additional Info</h3>
                            <input
                                type="text"
                                placeholder="Table Number (if dining in)"
                                value={tableNumber}
                                onChange={(e) => setTableNumber(e.target.value)}
                                className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg font-typewriter mb-3"
                            />
                            <textarea
                                placeholder="Special instructions..."
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg font-typewriter resize-none"
                                rows={3}
                            />
                        </div>

                        {/* Summary */}
                        <div className="prescription-card bg-therapy-light">
                            <h3 className="font-typewriter font-bold mb-4">Bill Summary</h3>
                            <div className="space-y-2 font-typewriter">
                                <div className="flex justify-between">
                                    <span>Subtotal</span>
                                    <span>₹{subtotal}</span>
                                </div>
                                {discount > 0 && (
                                    <div className="flex justify-between text-green-600">
                                        <span>Discount</span>
                                        <span>-₹{discount}</span>
                                    </div>
                                )}
                                <hr className="border-therapy-teal" />
                                <div className="flex justify-between text-xl font-bold">
                                    <span>Total</span>
                                    <span>₹{total}</span>
                                </div>
                            </div>

                            {error && (
                                <p className="text-red-500 text-sm mt-3 font-typewriter">{error}</p>
                            )}

                            <button
                                onClick={handleSubmit}
                                disabled={loading}
                                className="w-full mt-4 py-3 bg-therapy-teal text-white rounded-lg font-typewriter font-bold hover:bg-therapy-dark transition-colors disabled:opacity-50"
                            >
                                {loading ? 'Processing...' : '🏥 Confirm Prescription'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
