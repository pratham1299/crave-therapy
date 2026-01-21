import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function AuthModal({ mode, onClose, onSwitchMode }) {
    const { login, register } = useAuth();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (mode === 'login') {
                await login(formData.email, formData.password);
            } else {
                await register(formData.name, formData.email, formData.phone, formData.password);
            }
            onClose();
        } catch (err) {
            setError(err.response?.data?.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div
                className="bg-paper bg-graph-paper rounded-2xl p-8 max-w-md w-full shadow-2xl animate-bounce-in"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="text-center mb-6">
                    <span className="text-5xl mb-2 block animate-float">
                        {mode === 'login' ? '🩺' : '📋'}
                    </span>
                    <h2 className="text-2xl font-typewriter text-therapy-dark">
                        {mode === 'login' ? 'Patient Login' : 'New Patient Registration'}
                    </h2>
                    <p className="text-gray-600 text-sm mt-1">
                        {mode === 'login' ? 'Welcome back to therapy!' : 'Join the mood healing club!'}
                    </p>
                </div>

                {/* Error */}
                {error && (
                    <div className="bg-red-100 border-2 border-red-400 text-red-700 px-4 py-2 rounded-lg mb-4 font-typewriter text-sm">
                        ⚠️ {error}
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    {mode === 'register' && (
                        <div>
                            <label className="block text-sm font-typewriter text-gray-700 mb-1">
                                Patient Name
                            </label>
                            <input
                                type="text"
                                required
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                className="w-full px-4 py-2 border-2 border-therapy-teal rounded-lg font-typewriter focus:outline-none focus:ring-2 focus:ring-therapy-dark"
                                placeholder="Your name"
                            />
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-typewriter text-gray-700 mb-1">
                            Email Address
                        </label>
                        <input
                            type="email"
                            required
                            value={formData.email}
                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                            className="w-full px-4 py-2 border-2 border-therapy-teal rounded-lg font-typewriter focus:outline-none focus:ring-2 focus:ring-therapy-dark"
                            placeholder="your@email.com"
                        />
                    </div>

                    {mode === 'register' && (
                        <div>
                            <label className="block text-sm font-typewriter text-gray-700 mb-1">
                                Phone Number
                            </label>
                            <input
                                type="tel"
                                value={formData.phone}
                                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                className="w-full px-4 py-2 border-2 border-therapy-teal rounded-lg font-typewriter focus:outline-none focus:ring-2 focus:ring-therapy-dark"
                                placeholder="+91 98765 43210"
                            />
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-typewriter text-gray-700 mb-1">
                            Password
                        </label>
                        <input
                            type="password"
                            required
                            value={formData.password}
                            onChange={e => setFormData({ ...formData, password: e.target.value })}
                            className="w-full px-4 py-2 border-2 border-therapy-teal rounded-lg font-typewriter focus:outline-none focus:ring-2 focus:ring-therapy-dark"
                            placeholder="••••••••"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 bg-therapy-teal text-white rounded-lg font-typewriter text-lg hover:bg-therapy-dark transition-colors disabled:opacity-50"
                    >
                        {loading ? (
                            <span className="flex items-center justify-center gap-2">
                                <span className="spinner" />
                                Processing...
                            </span>
                        ) : (
                            mode === 'login' ? '🔓 Login' : '📝 Register'
                        )}
                    </button>
                </form>

                {/* Switch Mode */}
                <p className="text-center mt-4 text-sm text-gray-600">
                    {mode === 'login' ? "Don't have an account?" : "Already a patient?"}{' '}
                    <button
                        onClick={onSwitchMode}
                        className="text-therapy-teal font-bold hover:underline"
                    >
                        {mode === 'login' ? 'Register here' : 'Login here'}
                    </button>
                </p>

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 text-2xl"
                >
                    ×
                </button>
            </div>
        </div>
    );
}
