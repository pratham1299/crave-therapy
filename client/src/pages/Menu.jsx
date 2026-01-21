import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../utils/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { moodMusic } from '../utils/audio';

export default function Menu() {
    const { moodSlug } = useParams();
    const [mood, setMood] = useState(null);
    const [items, setItems] = useState([]);
    const [coupons, setCoupons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isMusicPlaying, setIsMusicPlaying] = useState(true);
    const { addItem, items: cartItems, subtotal } = useCart();
    const { user } = useAuth();

    useEffect(() => {
        fetchMoodData();
        fetchCoupons();

        // Start music
        moodMusic.play(moodSlug);

        return () => moodMusic.stop();
    }, [moodSlug]);

    const fetchMoodData = async () => {
        try {
            const { data } = await api.get(`/moods/${moodSlug}`);
            setMood(data.data);
            setItems(data.data.items || []);
        } catch (error) {
            console.error('Failed to fetch mood:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchCoupons = async () => {
        try {
            const { data } = await api.get('/coupons');
            setCoupons(data.data);
        } catch (error) {
            console.error('Failed to fetch coupons:', error);
        }
    };

    const toggleMusic = () => {
        if (isMusicPlaying) {
            moodMusic.stop();
        } else {
            moodMusic.play(moodSlug);
        }
        setIsMusicPlaying(!isMusicPlaying);
    };

    const getItemQuantity = (itemId) => {
        const cartItem = cartItems.find(i => i._id === itemId);
        return cartItem?.quantity || 0;
    };

    const groupedItems = items.reduce((acc, item) => {
        const category = item.category || 'main';
        if (!acc[category]) acc[category] = [];
        acc[category].push(item);
        return acc;
    }, {});

    const categoryLabels = {
        main: '💊 Main Prescriptions',
        side: '⚡ Side Effects',
        drink: '💧 Liquid Prescriptions',
        dessert: '🍬 Sweet Relief'
    };

    if (loading) {
        return (
            <div className="min-h-[calc(100vh-64px)] flex items-center justify-center">
                <div className="text-center">
                    <div className="spinner mx-auto mb-4" />
                    <p className="font-typewriter text-gray-600">Preparing your prescription...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-[calc(100vh-64px)] pb-24">
            {/* Header */}
            <div
                className="sticky top-16 z-30 py-4 px-4 backdrop-blur-sm"
                style={{ backgroundColor: `${mood?.color}20` }}
            >
                <div className="max-w-4xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link to="/symptoms" className="text-2xl hover:scale-110 transition-transform">
                            ←
                        </Link>
                        <div>
                            <h1 className="text-xl font-typewriter font-bold" style={{ color: mood?.color }}>
                                {mood?.emoji} {mood?.title}
                            </h1>
                            <p className="text-sm text-gray-600 font-typewriter">{mood?.treatment}</p>
                        </div>
                    </div>

                    {/* Music Toggle */}
                    <button
                        onClick={toggleMusic}
                        className="flex items-center gap-2 px-3 py-2 rounded-full bg-white/80 shadow-md hover:shadow-lg transition-all"
                    >
                        {isMusicPlaying ? (
                            <>
                                <div className="flex items-end gap-0.5 h-6">
                                    <div className="music-bar" />
                                    <div className="music-bar" />
                                    <div className="music-bar" />
                                    <div className="music-bar" />
                                </div>
                                <span className="text-xs font-typewriter">ON</span>
                            </>
                        ) : (
                            <>
                                <span className="text-xl">🔇</span>
                                <span className="text-xs font-typewriter">OFF</span>
                            </>
                        )}
                    </button>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 pt-6">
                {/* Menu Items by Category */}
                {Object.entries(groupedItems).map(([category, categoryItems]) => (
                    <div key={category} className="mb-8">
                        <h2 className="text-xl font-typewriter text-therapy-dark mb-4 flex items-center gap-2">
                            {categoryLabels[category]}
                        </h2>

                        <div className="grid gap-4">
                            {categoryItems.map((item, index) => (
                                <div
                                    key={item._id}
                                    className="prescription-card animate-pill-drop flex flex-col sm:flex-row justify-between gap-4"
                                    style={{ animationDelay: `${index * 0.1}s` }}
                                >
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="font-typewriter font-bold text-lg text-gray-800">
                                                {item.name}
                                            </h3>
                                            {item.isSpicy && <span title="Spicy">🌶️</span>}
                                            {item.isPopular && <span title="Popular">⭐</span>}
                                            {item.isVeg && <span title="Vegetarian" className="text-green-600">●</span>}
                                        </div>
                                        <p className="text-gray-600 text-sm font-typewriter">
                                            {item.description}
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        <span className="font-typewriter font-bold text-xl" style={{ color: mood?.color }}>
                                            ₹{item.price}
                                        </span>

                                        {getItemQuantity(item._id) > 0 ? (
                                            <div className="flex items-center gap-2 bg-therapy-light rounded-full px-2">
                                                <span className="font-typewriter text-sm text-therapy-dark">
                                                    ✓ {getItemQuantity(item._id)} in cart
                                                </span>
                                            </div>
                                        ) : null}

                                        <button
                                            onClick={() => addItem(item)}
                                            className="pill-button bg-therapy-teal text-white hover:bg-therapy-dark"
                                        >
                                            + Add
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}

                {/* Coupons Section */}
                <div className="mt-12 mb-8">
                    <h2 className="text-xl font-typewriter text-therapy-dark mb-4 flex items-center gap-2">
                        🎫 Discount Prescriptions
                        {!user && (
                            <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                                Login for exclusive offers!
                            </span>
                        )}
                    </h2>

                    <div className="grid sm:grid-cols-2 gap-4">
                        {coupons.map((coupon, index) => (
                            <div
                                key={coupon._id}
                                className={`coupon-card p-4 animate-slide-up ${coupon.isExclusive ? 'border-yellow-400 bg-yellow-50' : ''}`}
                                style={{ animationDelay: `${index * 0.1}s` }}
                            >
                                <div className="flex items-start justify-between">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-2xl">{coupon.icon}</span>
                                            <h3 className="font-typewriter font-bold text-gray-800">{coupon.name}</h3>
                                            {coupon.isExclusive && (
                                                <span className="text-xs bg-yellow-400 text-gray-900 px-2 py-0.5 rounded-full">
                                                    VIP
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-gray-600 text-sm font-typewriter">{coupon.description}</p>
                                        {coupon.minOrder > 0 && (
                                            <p className="text-xs text-gray-500 mt-1">Min. order: ₹{coupon.minOrder}</p>
                                        )}
                                    </div>
                                    <div className="text-right">
                                        <code className="bg-therapy-light px-3 py-1 rounded font-typewriter text-therapy-dark font-bold">
                                            {coupon.code}
                                        </code>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Floating Cart Bar */}
            {cartItems.length > 0 && (
                <div className="fixed bottom-0 left-0 right-0 bg-therapy-dark/95 backdrop-blur-sm p-4 shadow-2xl animate-slide-up">
                    <div className="max-w-4xl mx-auto flex items-center justify-between">
                        <div className="text-white font-typewriter">
                            <span className="text-sm opacity-80">{cartItems.reduce((sum, i) => sum + i.quantity, 0)} items</span>
                            <span className="text-xl font-bold ml-3">₹{subtotal}</span>
                        </div>
                        <Link
                            to="/checkout"
                            className="px-6 py-3 bg-white text-therapy-dark rounded-full font-typewriter font-bold hover:bg-therapy-light transition-colors flex items-center gap-2"
                        >
                            Proceed to Checkout
                            <span>→</span>
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
}
