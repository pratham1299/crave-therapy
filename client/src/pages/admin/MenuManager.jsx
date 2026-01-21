import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';

export default function MenuManager() {
    const { isAdmin } = useAuth();
    const navigate = useNavigate();
    const [items, setItems] = useState([]);
    const [moods, setMoods] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        category: 'main',
        mood: '',
        isVeg: true,
        isSpicy: false,
        isPopular: false,
        isActive: true
    });

    useEffect(() => {
        if (!isAdmin) {
            navigate('/');
            return;
        }
        fetchData();
    }, [isAdmin]);

    const fetchData = async () => {
        try {
            const [itemsRes, moodsRes] = await Promise.all([
                api.get('/admin/menu'),
                api.get('/admin/moods')
            ]);
            setItems(itemsRes.data.data);
            setMoods(moodsRes.data.data);
        } catch (error) {
            console.error('Failed to fetch data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingItem) {
                await api.put(`/admin/menu/${editingItem._id}`, formData);
            } else {
                await api.post('/admin/menu', formData);
            }
            fetchData();
            resetForm();
        } catch (error) {
            console.error('Failed to save:', error);
        }
    };

    const handleEdit = (item) => {
        setEditingItem(item);
        setFormData({
            name: item.name,
            description: item.description,
            price: item.price,
            category: item.category,
            mood: item.mood?._id || item.mood,
            isVeg: item.isVeg,
            isSpicy: item.isSpicy,
            isPopular: item.isPopular,
            isActive: item.isActive
        });
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (!confirm('Delete this item?')) return;
        try {
            await api.delete(`/admin/menu/${id}`);
            fetchData();
        } catch (error) {
            console.error('Failed to delete:', error);
        }
    };

    const resetForm = () => {
        setShowForm(false);
        setEditingItem(null);
        setFormData({
            name: '',
            description: '',
            price: '',
            category: 'main',
            mood: '',
            isVeg: true,
            isSpicy: false,
            isPopular: false,
            isActive: true
        });
    };

    if (!isAdmin) return null;

    return (
        <div className="min-h-[calc(100vh-64px)] p-4 md:p-8">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <Link to="/admin" className="text-2xl hover:scale-110 transition-transform">←</Link>
                        <h1 className="text-2xl font-typewriter text-therapy-dark">🍔 Menu Manager</h1>
                    </div>
                    <button
                        onClick={() => setShowForm(!showForm)}
                        className="pill-button bg-therapy-teal text-white"
                    >
                        {showForm ? 'Cancel' : '+ Add Item'}
                    </button>
                </div>

                {/* Form */}
                {showForm && (
                    <form onSubmit={handleSubmit} className="prescription-card mb-6 animate-slide-up">
                        <h3 className="font-typewriter font-bold mb-4">
                            {editingItem ? 'Edit Item' : 'Add New Item'}
                        </h3>
                        <div className="grid sm:grid-cols-2 gap-4">
                            <input
                                type="text"
                                placeholder="Item Name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="px-3 py-2 border-2 border-gray-300 rounded-lg font-typewriter"
                                required
                            />
                            <input
                                type="number"
                                placeholder="Price (₹)"
                                value={formData.price}
                                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                className="px-3 py-2 border-2 border-gray-300 rounded-lg font-typewriter"
                                required
                            />
                            <textarea
                                placeholder="Description"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="px-3 py-2 border-2 border-gray-300 rounded-lg font-typewriter sm:col-span-2"
                                rows={2}
                                required
                            />
                            <select
                                value={formData.mood}
                                onChange={(e) => setFormData({ ...formData, mood: e.target.value })}
                                className="px-3 py-2 border-2 border-gray-300 rounded-lg font-typewriter"
                                required
                            >
                                <option value="">Select Mood</option>
                                {moods.map(mood => (
                                    <option key={mood._id} value={mood._id}>
                                        {mood.emoji} {mood.name}
                                    </option>
                                ))}
                            </select>
                            <select
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                className="px-3 py-2 border-2 border-gray-300 rounded-lg font-typewriter"
                            >
                                <option value="main">Main</option>
                                <option value="side">Side</option>
                                <option value="drink">Drink</option>
                                <option value="dessert">Dessert</option>
                            </select>
                        </div>
                        <div className="flex flex-wrap gap-4 mt-4">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.isVeg}
                                    onChange={(e) => setFormData({ ...formData, isVeg: e.target.checked })}
                                    className="w-4 h-4"
                                />
                                <span className="font-typewriter text-sm">🟢 Vegetarian</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.isSpicy}
                                    onChange={(e) => setFormData({ ...formData, isSpicy: e.target.checked })}
                                    className="w-4 h-4"
                                />
                                <span className="font-typewriter text-sm">🌶️ Spicy</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.isPopular}
                                    onChange={(e) => setFormData({ ...formData, isPopular: e.target.checked })}
                                    className="w-4 h-4"
                                />
                                <span className="font-typewriter text-sm">⭐ Popular</span>
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
                                {editingItem ? 'Update' : 'Add Item'}
                            </button>
                            <button type="button" onClick={resetForm} className="pill-button bg-gray-200">
                                Cancel
                            </button>
                        </div>
                    </form>
                )}

                {/* Items List */}
                {loading ? (
                    <div className="flex justify-center py-12">
                        <div className="spinner" />
                    </div>
                ) : (
                    <div className="space-y-3">
                        {items.map((item) => (
                            <div key={item._id} className="prescription-card flex items-center justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-typewriter font-bold">{item.name}</h3>
                                        {item.mood?.emoji && <span>{item.mood.emoji}</span>}
                                        {item.isVeg && <span className="text-green-600">●</span>}
                                        {item.isSpicy && <span>🌶️</span>}
                                        {item.isPopular && <span>⭐</span>}
                                        {!item.isActive && <span className="text-xs bg-red-100 text-red-600 px-2 rounded">Inactive</span>}
                                    </div>
                                    <p className="text-sm text-gray-600">{item.description}</p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className="font-typewriter font-bold text-therapy-dark">₹{item.price}</span>
                                    <button
                                        onClick={() => handleEdit(item)}
                                        className="text-blue-500 hover:underline text-sm"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(item._id)}
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
