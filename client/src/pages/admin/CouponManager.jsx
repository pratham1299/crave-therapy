import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';

export default function CouponManager() {
    const { isAdmin } = useAuth();
    const navigate = useNavigate();
    const [coupons, setCoupons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingCoupon, setEditingCoupon] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        code: '',
        description: '',
        type: 'percent',
        value: '',
        minOrder: 0,
        maxDiscount: '',
        isExclusive: false,
        icon: '💊',
        isActive: true
    });

    useEffect(() => {
        if (!isAdmin) {
            navigate('/');
            return;
        }
        fetchCoupons();
    }, [isAdmin]);

    const fetchCoupons = async () => {
        try {
            const { data } = await api.get('/admin/coupons');
            setCoupons(data.data);
        } catch (error) {
            console.error('Failed to fetch coupons:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                ...formData,
                code: formData.code.toUpperCase(),
                maxDiscount: formData.maxDiscount || null
            };

            if (editingCoupon) {
                await api.put(`/admin/coupons/${editingCoupon._id}`, payload);
            } else {
                await api.post('/admin/coupons', payload);
            }
            fetchCoupons();
            resetForm();
        } catch (error) {
            console.error('Failed to save:', error);
            alert(error.response?.data?.message || 'Failed to save coupon');
        }
    };

    const handleEdit = (coupon) => {
        setEditingCoupon(coupon);
        setFormData({
            name: coupon.name,
            code: coupon.code,
            description: coupon.description,
            type: coupon.type,
            value: coupon.value,
            minOrder: coupon.minOrder,
            maxDiscount: coupon.maxDiscount || '',
            isExclusive: coupon.isExclusive,
            icon: coupon.icon,
            isActive: coupon.isActive
        });
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (!confirm('Delete this coupon?')) return;
        try {
            await api.delete(`/admin/coupons/${id}`);
            fetchCoupons();
        } catch (error) {
            console.error('Failed to delete:', error);
        }
    };

    const resetForm = () => {
        setShowForm(false);
        setEditingCoupon(null);
        setFormData({
            name: '',
            code: '',
            description: '',
            type: 'percent',
            value: '',
            minOrder: 0,
            maxDiscount: '',
            isExclusive: false,
            icon: '💊',
            isActive: true
        });
    };

    const icons = ['💊', '💉', '🩹', '📝', '🏥', '⚕️', '🎫', '🎁'];

    if (!isAdmin) return null;

    return (
        <div className="min-h-[calc(100vh-64px)] p-4 md:p-8">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <Link to="/admin" className="text-2xl hover:scale-110 transition-transform">←</Link>
                        <h1 className="text-2xl font-typewriter text-therapy-dark">🎫 Coupon Manager</h1>
                    </div>
                    <button
                        onClick={() => setShowForm(!showForm)}
                        className="pill-button bg-therapy-teal text-white"
                    >
                        {showForm ? 'Cancel' : '+ Add Coupon'}
                    </button>
                </div>

                {/* Form */}
                {showForm && (
                    <form onSubmit={handleSubmit} className="prescription-card mb-6 animate-slide-up">
                        <h3 className="font-typewriter font-bold mb-4">
                            {editingCoupon ? 'Edit Coupon' : 'Add New Coupon'}
                        </h3>
                        <div className="grid sm:grid-cols-2 gap-4">
                            <input
                                type="text"
                                placeholder="Coupon Name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="px-3 py-2 border-2 border-gray-300 rounded-lg font-typewriter"
                                required
                            />
                            <input
                                type="text"
                                placeholder="CODE"
                                value={formData.code}
                                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                className="px-3 py-2 border-2 border-gray-300 rounded-lg font-typewriter uppercase"
                                required
                            />
                            <textarea
                                placeholder="Description"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="px-3 py-2 border-2 border-gray-300 rounded-lg font-typewriter sm:col-span-2"
                                rows={2}
                            />
                            <select
                                value={formData.type}
                                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                className="px-3 py-2 border-2 border-gray-300 rounded-lg font-typewriter"
                            >
                                <option value="percent">Percentage (%)</option>
                                <option value="fixed">Fixed Amount (₹)</option>
                                <option value="bogo">Buy One Get One</option>
                            </select>
                            <input
                                type="number"
                                placeholder={formData.type === 'percent' ? 'Percentage (e.g., 20)' : 'Amount (e.g., 100)'}
                                value={formData.value}
                                onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                                className="px-3 py-2 border-2 border-gray-300 rounded-lg font-typewriter"
                                required
                            />
                            <input
                                type="number"
                                placeholder="Min. Order Amount (₹)"
                                value={formData.minOrder}
                                onChange={(e) => setFormData({ ...formData, minOrder: e.target.value })}
                                className="px-3 py-2 border-2 border-gray-300 rounded-lg font-typewriter"
                            />
                            {formData.type === 'percent' && (
                                <input
                                    type="number"
                                    placeholder="Max Discount (₹)"
                                    value={formData.maxDiscount}
                                    onChange={(e) => setFormData({ ...formData, maxDiscount: e.target.value })}
                                    className="px-3 py-2 border-2 border-gray-300 rounded-lg font-typewriter"
                                />
                            )}
                        </div>

                        {/* Icon Selector */}
                        <div className="mt-4">
                            <label className="font-typewriter text-sm text-gray-600">Icon:</label>
                            <div className="flex gap-2 mt-2">
                                {icons.map(icon => (
                                    <button
                                        key={icon}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, icon })}
                                        className={`w-10 h-10 text-2xl rounded-lg border-2 ${formData.icon === icon ? 'border-therapy-teal bg-therapy-light' : 'border-gray-200'
                                            }`}
                                    >
                                        {icon}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-4 mt-4">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.isExclusive}
                                    onChange={(e) => setFormData({ ...formData, isExclusive: e.target.checked })}
                                    className="w-4 h-4"
                                />
                                <span className="font-typewriter text-sm">🔒 Exclusive (logged-in only)</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.isActive}
                                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                    className="w-4 h-4"
                                />
                                <span className="font-typewriter text-sm">✅ Active</span>
                            </label>
                        </div>

                        <div className="mt-4 flex gap-2">
                            <button type="submit" className="pill-button bg-therapy-teal text-white">
                                {editingCoupon ? 'Update' : 'Add Coupon'}
                            </button>
                            <button type="button" onClick={resetForm} className="pill-button bg-gray-200">
                                Cancel
                            </button>
                        </div>
                    </form>
                )}

                {/* Coupons List */}
                {loading ? (
                    <div className="flex justify-center py-12">
                        <div className="spinner" />
                    </div>
                ) : (
                    <div className="grid sm:grid-cols-2 gap-4">
                        {coupons.map((coupon) => (
                            <div
                                key={coupon._id}
                                className={`coupon-card p-4 ${coupon.isExclusive ? 'border-yellow-400 bg-yellow-50' : ''}`}
                            >
                                <div className="flex items-start justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <span className="text-2xl">{coupon.icon}</span>
                                        <div>
                                            <h3 className="font-typewriter font-bold">{coupon.name}</h3>
                                            <code className="bg-therapy-light px-2 py-0.5 rounded text-sm">{coupon.code}</code>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        {coupon.isExclusive && (
                                            <span className="text-xs bg-yellow-400 text-gray-900 px-2 py-0.5 rounded-full">VIP</span>
                                        )}
                                        {!coupon.isActive && (
                                            <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">Inactive</span>
                                        )}
                                    </div>
                                </div>
                                <p className="text-sm text-gray-600 mb-2">{coupon.description}</p>
                                <div className="text-sm font-typewriter text-therapy-dark">
                                    {coupon.type === 'percent' ? `${coupon.value}% OFF` : `₹${coupon.value} OFF`}
                                    {coupon.minOrder > 0 && ` (min ₹${coupon.minOrder})`}
                                </div>
                                <div className="flex gap-2 mt-3">
                                    <button
                                        onClick={() => handleEdit(coupon)}
                                        className="text-blue-500 hover:underline text-sm"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(coupon._id)}
                                        className="text-red-500 hover:underline text-sm"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
