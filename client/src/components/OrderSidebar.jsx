import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { useNavigate } from 'react-router-dom';

export default function OrderSidebar({ isOpen, onClose }) {
    const { user } = useAuth();
    const navigate = useNavigate();
    
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    
    // Guest search state
    const [phone, setPhone] = useState('');
    const [hasSearched, setHasSearched] = useState(false);

    // Fetch orders if user is logged in
    useEffect(() => {
        if (isOpen && user) {
            fetchUserOrders();
        }
        // Reset state when opened/closed
        if (!isOpen) {
            setOrders([]);
            setPhone('');
            setHasSearched(false);
            setError('');
        }
    }, [isOpen, user]);

    const fetchUserOrders = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/orders/my-orders');
            setOrders(data.data);
            setHasSearched(true);
        } catch (err) {
            setError('Failed to fetch orders');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleGuestSearch = async (e) => {
        e.preventDefault();
        if (!phone.trim()) return;
        
        setLoading(true);
        setError('');
        try {
            const { data } = await api.get(`/orders/guest/${phone}`);
            setOrders(data.data);
            setHasSearched(true);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to find orders');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const getStatusStyle = (status) => {
        const styles = {
            pending: 'bg-yellow-100 text-yellow-800',
            confirmed: 'bg-blue-100 text-blue-800',
            preparing: 'bg-orange-100 text-orange-800',
            ready: 'bg-green-100 text-green-800',
            delivered: 'bg-gray-100 text-gray-800',
            cancelled: 'bg-red-100 text-red-800'
        };
        return styles[status] || 'bg-gray-100 text-gray-800';
    };

    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-IN', {
            day: '2-digit', month: 'short', 
            hour: '2-digit', minute: '2-digit'
        });
    };

    return (
        <>
            {/* Overlay */}
            {isOpen && (
                <div 
                    className="fixed inset-0 bg-black/50 z-40 transition-opacity"
                    onClick={onClose}
                />
            )}

            {/* Sidebar */}
            <div 
                className={`fixed top-0 right-0 h-full w-full md:w-[400px] bg-[#fdfbf7] shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${
                    isOpen ? 'translate-x-0' : 'translate-x-full'
                } flex flex-col`}
                style={{
                    backgroundImage: 'linear-gradient(rgba(93, 155, 155, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(93, 155, 155, 0.1) 1px, transparent 1px)',
                    backgroundSize: '20px 20px'
                }}
            >
                {/* Header */}
                <div className="p-4 bg-therapy-teal text-white flex justify-between items-center shadow-md">
                    <h2 className="font-typewriter text-xl font-bold flex items-center gap-2">
                        <span>📜</span> {user ? 'My Orders' : 'Track Order'}
                    </h2>
                    <button 
                        onClick={onClose}
                        className="p-1 hover:bg-white/20 rounded-full transition-colors font-bold"
                    >
                        ✕
                    </button>
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto p-4">
                    
                    {/* Guest Search Form */}
                    {!user && !hasSearched && (
                        <div className="bg-white p-4 rounded-xl border border-dashed border-therapy-teal shadow-sm mb-6 animate-slide-up">
                            <h3 className="font-typewriter font-bold mb-2">Guest Order Tracking</h3>
                            <p className="text-sm text-gray-500 mb-4 font-typewriter">
                                Enter the phone number you used during checkout to find your previous orders.
                            </p>
                            <form onSubmit={handleGuestSearch} className="flex gap-2">
                                <input 
                                    type="tel" 
                                    placeholder="Phone Number" 
                                    className="flex-1 px-3 py-2 border-2 border-gray-200 rounded-lg font-typewriter focus:border-therapy-teal outline-none"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    required
                                />
                                <button 
                                    type="submit"
                                    disabled={loading || !phone}
                                    className="bg-therapy-teal text-white px-4 py-2 rounded-lg font-typewriter font-bold disabled:opacity-50"
                                >
                                    {loading ? '...' : 'Search'}
                                </button>
                            </form>
                            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
                        </div>
                    )}

                    {/* Order List */}
                    {loading && hasSearched && (
                        <div className="flex justify-center py-8">
                            <div className="spinner" />
                        </div>
                    )}

                    {!loading && hasSearched && orders.length === 0 && (
                        <div className="text-center py-8 text-gray-500 font-typewriter">
                            <span className="text-4xl block mb-2">🤷‍♂️</span>
                            <p>No orders found.</p>
                            {!user && (
                                <button 
                                    onClick={() => setHasSearched(false)}
                                    className="text-therapy-teal underline mt-2 text-sm"
                                >
                                    Try another phone number
                                </button>
                            )}
                        </div>
                    )}

                    {!loading && orders.length > 0 && (
                        <div className="space-y-4">
                            {!user && (
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm font-typewriter font-bold text-gray-600">
                                        Orders for {phone}
                                    </span>
                                    <button 
                                        onClick={() => { setHasSearched(false); setPhone(''); }}
                                        className="text-xs text-therapy-teal underline"
                                    >
                                        Change Number
                                    </button>
                                </div>
                            )}

                            {orders.map(order => (
                                <div 
                                    key={order._id} 
                                    className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:border-therapy-teal transition-colors cursor-pointer"
                                    onClick={() => {
                                        onClose();
                                        navigate(`/order-success/${order._id}`);
                                    }}
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <p className="font-typewriter font-bold text-sm">
                                                Order #{order._id.slice(-6).toUpperCase()}
                                            </p>
                                            <p className="text-xs text-gray-500 font-typewriter">
                                                {formatDate(order.createdAt)}
                                            </p>
                                        </div>
                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${getStatusStyle(order.status)}`}>
                                            {order.status}
                                        </span>
                                    </div>
                                    
                                    <div className="text-sm text-gray-600 font-typewriter mb-3 line-clamp-1">
                                        {order.items.map(i => `${i.quantity}x ${i.name}`).join(', ')}
                                    </div>
                                    
                                    <div className="flex justify-between items-center pt-2 border-t border-dashed border-gray-200">
                                        <span className="font-bold text-therapy-dark font-typewriter">
                                            ₹{order.total}
                                        </span>
                                        {order.isPaid ? (
                                            <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded">✓ PAID</span>
                                        ) : (
                                            <span className="text-xs text-orange-500">Unpaid</span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-gray-200 bg-white">
                    <button 
                        onClick={() => {
                            onClose();
                            navigate('/symptoms');
                        }}
                        className="w-full py-2 bg-therapy-dark text-white rounded-lg font-typewriter font-bold hover:bg-opacity-90 transition-all shadow-sm"
                    >
                        Prescribe More Food
                    </button>
                </div>
            </div>
        </>
    );
}
