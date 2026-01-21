import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';

export default function AdminDashboard() {
    const { user, isAdmin } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!isAdmin) {
            navigate('/');
            return;
        }
        fetchStats();
    }, [isAdmin]);

    const fetchStats = async () => {
        try {
            const { data } = await api.get('/admin/dashboard');
            setStats(data.data);
        } catch (error) {
            console.error('Failed to fetch stats:', error);
        } finally {
            setLoading(false);
        }
    };

    if (!isAdmin) return null;

    return (
        <div className="min-h-[calc(100vh-64px)] p-4 md:p-8">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-typewriter text-therapy-dark flex items-center gap-2">
                            <span>🏥</span> Admin Dashboard
                        </h1>
                        <p className="text-gray-600 font-typewriter">Welcome, Dr. {user?.name}</p>
                    </div>
                    <Link to="/" className="pill-button bg-gray-200 text-gray-700">
                        ← Back to Site
                    </Link>
                </div>

                {/* Stats Cards */}
                {loading ? (
                    <div className="flex justify-center py-12">
                        <div className="spinner" />
                    </div>
                ) : (
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                        <div className="prescription-card text-center">
                            <span className="text-4xl mb-2 block">📋</span>
                            <p className="text-3xl font-typewriter font-bold text-therapy-dark">
                                {stats?.totalOrders || 0}
                            </p>
                            <p className="text-gray-600 text-sm">Total Orders</p>
                        </div>
                        <div className="prescription-card text-center">
                            <span className="text-4xl mb-2 block">💰</span>
                            <p className="text-3xl font-typewriter font-bold text-green-600">
                                ₹{stats?.totalRevenue || 0}
                            </p>
                            <p className="text-gray-600 text-sm">Total Revenue</p>
                        </div>
                        <div className="prescription-card text-center">
                            <span className="text-4xl mb-2 block">👥</span>
                            <p className="text-3xl font-typewriter font-bold text-therapy-dark">
                                {stats?.totalUsers || 0}
                            </p>
                            <p className="text-gray-600 text-sm">Registered Patients</p>
                        </div>
                        <div className="prescription-card text-center">
                            <span className="text-4xl mb-2 block">📦</span>
                            <p className="text-3xl font-typewriter font-bold text-orange-500">
                                {stats?.todayOrders || 0}
                            </p>
                            <p className="text-gray-600 text-sm">Today's Orders</p>
                        </div>
                    </div>
                )}

                {/* Quick Actions */}
                <h2 className="text-xl font-typewriter text-therapy-dark mb-4">Quick Actions</h2>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <Link
                        to="/admin/menu"
                        className="prescription-card hover:border-therapy-dark flex items-center gap-4"
                    >
                        <span className="text-4xl">🍔</span>
                        <div>
                            <h3 className="font-typewriter font-bold">Menu Manager</h3>
                            <p className="text-sm text-gray-600">Add, edit, delete menu items</p>
                        </div>
                    </Link>

                    <Link
                        to="/admin/coupons"
                        className="prescription-card hover:border-therapy-dark flex items-center gap-4"
                    >
                        <span className="text-4xl">🎫</span>
                        <div>
                            <h3 className="font-typewriter font-bold">Coupon Manager</h3>
                            <p className="text-sm text-gray-600">Manage discount codes</p>
                        </div>
                    </Link>

                    <Link
                        to="/admin/moods"
                        className="prescription-card hover:border-therapy-dark flex items-center gap-4"
                    >
                        <span className="text-4xl">🎭</span>
                        <div>
                            <h3 className="font-typewriter font-bold">Mood Manager</h3>
                            <p className="text-sm text-gray-600">Create and edit mood categories</p>
                        </div>
                    </Link>

                    <Link
                        to="/admin/orders"
                        className="prescription-card hover:border-therapy-dark flex items-center gap-4"
                    >
                        <span className="text-4xl">📦</span>
                        <div>
                            <h3 className="font-typewriter font-bold">Order Manager</h3>
                            <p className="text-sm text-gray-600">View and update orders</p>
                        </div>
                    </Link>
                </div>
            </div>
        </div>
    );
}
