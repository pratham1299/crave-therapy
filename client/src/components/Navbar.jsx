import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import AuthModal from './AuthModal';

export default function Navbar() {
    const { user, logout, isAdmin, isStaff } = useAuth();
    const { itemCount } = useCart();
    const [showAuth, setShowAuth] = useState(false);
    const [authMode, setAuthMode] = useState('login');

    const openLogin = () => {
        setAuthMode('login');
        setShowAuth(true);
    };

    const openRegister = () => {
        setAuthMode('register');
        setShowAuth(true);
    };

    return (
        <>
            <nav className="sticky top-0 z-40 bg-therapy-teal/95 backdrop-blur-sm shadow-md">
                <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
                    {/* Logo - different destination based on role */}
                    <Link
                        to={isAdmin ? '/admin' : (isStaff ? '/counter' : '/')}
                        className="flex items-center gap-2 group"
                    >
                        <img src="/logo.png" alt="Crave Therapy" className="w-12 h-12 object-cover rounded-full border-2 border-white/30 shadow-sm animate-pulse-slow bg-white/10" />
                        <div>
                            <h1 className="text-white font-typewriter text-xl font-bold tracking-tight">
                                Crave Therapy
                            </h1>
                            <p className="text-therapy-light text-xs">
                                {isAdmin ? 'Admin Panel' : (isStaff ? 'Staff Portal' : 'Food for Moods')}
                            </p>
                        </div>
                    </Link>

                    {/* Navigation */}
                    <div className="flex items-center gap-4">
                        {/* Cart - only show for customers, not staff/admin */}
                        {!isStaff && (
                            <Link
                                to="/checkout"
                                className="relative p-2 text-white hover:bg-white/20 rounded-full transition-colors"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                        d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                                    />
                                </svg>
                                {itemCount > 0 && (
                                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center animate-bounce-in">
                                        {itemCount}
                                    </span>
                                )}
                            </Link>
                        )}

                        {/* User Menu */}
                        {user ? (
                            <div className="flex items-center gap-3">
                                <span className="text-white text-sm hidden sm:block">
                                    👋 {user.name}
                                </span>
                                {/* My Orders - only for regular users */}
                                {!isStaff && (
                                    <Link
                                        to="/my-orders"
                                        className="px-3 py-1 bg-white/20 text-white rounded-full text-sm hover:bg-white/30 transition-colors"
                                    >
                                        📜 My Orders
                                    </Link>
                                )}
                                {isStaff && (
                                    <Link
                                        to="/counter"
                                        className="px-3 py-1 bg-green-500 text-white rounded-full text-sm font-bold hover:bg-green-600 transition-colors"
                                    >
                                        🧾 Counter
                                    </Link>
                                )}
                                {isAdmin && (
                                    <Link
                                        to="/admin"
                                        className="px-3 py-1 bg-yellow-400 text-gray-900 rounded-full text-sm font-bold hover:bg-yellow-300 transition-colors"
                                    >
                                        Admin
                                    </Link>
                                )}
                                <button
                                    onClick={logout}
                                    className="px-3 py-1 bg-white/20 text-white rounded-full text-sm hover:bg-white/30 transition-colors"
                                >
                                    Logout
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={openLogin}
                                    className="px-4 py-1.5 text-white hover:bg-white/20 rounded-full text-sm transition-colors"
                                >
                                    Login
                                </button>
                                <button
                                    onClick={openRegister}
                                    className="px-4 py-1.5 bg-white text-therapy-dark rounded-full text-sm font-bold hover:bg-therapy-light transition-colors"
                                >
                                    Sign Up
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </nav>

            {/* Auth Modal */}
            {showAuth && (
                <AuthModal
                    mode={authMode}
                    onClose={() => setShowAuth(false)}
                    onSwitchMode={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}
                />
            )}
        </>
    );
}
