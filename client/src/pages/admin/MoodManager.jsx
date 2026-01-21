import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';

export default function MoodManager() {
    const { isAdmin } = useAuth();
    const navigate = useNavigate();
    const [moods, setMoods] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingMood, setEditingMood] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        slug: '',
        emoji: '😊',
        title: '',
        treatment: '',
        color: '#FF6B9D',
        bgColor: '#FFF0F5',
        order: 1,
        isActive: true
    });

    const emojis = ['💔', '😤', '😰', '⚡', '😊', '🤩', '😴', '🥳', '😋', '🤯', '😎', '🥺'];
    const colorPresets = [
        { color: '#FF6B9D', bg: '#FFF0F5', name: 'Pink' },
        { color: '#FF4444', bg: '#FFF5F5', name: 'Red' },
        { color: '#6B5B95', bg: '#F5F0FF', name: 'Purple' },
        { color: '#FFB347', bg: '#FFFAF0', name: 'Orange' },
        { color: '#4CAF50', bg: '#F0FFF0', name: 'Green' },
        { color: '#2196F3', bg: '#F0F8FF', name: 'Blue' },
    ];

    useEffect(() => {
        if (!isAdmin) {
            navigate('/');
            return;
        }
        fetchMoods();
    }, [isAdmin]);

    const fetchMoods = async () => {
        try {
            const { data } = await api.get('/admin/moods');
            setMoods(data.data);
        } catch (error) {
            console.error('Failed to fetch moods:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                ...formData,
                slug: formData.slug || formData.name.toLowerCase().replace(/\s+/g, '-'),
                title: formData.title || `Symptom: ${formData.name}`
            };

            if (editingMood) {
                await api.put(`/admin/moods/${editingMood._id}`, payload);
            } else {
                await api.post('/admin/moods', payload);
            }
            fetchMoods();
            resetForm();
        } catch (error) {
            console.error('Failed to save:', error);
            alert(error.response?.data?.message || 'Failed to save mood');
        }
    };

    const handleEdit = (mood) => {
        setEditingMood(mood);
        setFormData({
            name: mood.name,
            slug: mood.slug,
            emoji: mood.emoji,
            title: mood.title,
            treatment: mood.treatment,
            color: mood.color,
            bgColor: mood.bgColor,
            order: mood.order,
            isActive: mood.isActive
        });
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (!confirm('Delete this mood? Menu items linked to it will remain but lose the mood reference.')) return;
        try {
            await api.delete(`/admin/moods/${id}`);
            fetchMoods();
        } catch (error) {
            console.error('Failed to delete:', error);
        }
    };

    const resetForm = () => {
        setShowForm(false);
        setEditingMood(null);
        setFormData({
            name: '',
            slug: '',
            emoji: '😊',
            title: '',
            treatment: '',
            color: '#FF6B9D',
            bgColor: '#FFF0F5',
            order: moods.length + 1,
            isActive: true
        });
    };

    const selectColorPreset = (preset) => {
        setFormData({ ...formData, color: preset.color, bgColor: preset.bg });
    };

    if (!isAdmin) return null;

    return (
        <div className="min-h-[calc(100vh-64px)] p-4 md:p-8">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <Link to="/admin" className="text-2xl hover:scale-110 transition-transform">←</Link>
                        <h1 className="text-2xl font-typewriter text-therapy-dark">🎭 Mood Manager</h1>
                    </div>
                    <button
                        onClick={() => setShowForm(!showForm)}
                        className="pill-button bg-therapy-teal text-white"
                    >
                        {showForm ? 'Cancel' : '+ Add Mood'}
                    </button>
                </div>

                {/* Form */}
                {showForm && (
                    <form onSubmit={handleSubmit} className="prescription-card mb-6 animate-slide-up">
                        <h3 className="font-typewriter font-bold mb-4">
                            {editingMood ? 'Edit Mood' : 'Create New Mood'}
                        </h3>
                        <div className="grid sm:grid-cols-2 gap-4">
                            <input
                                type="text"
                                placeholder="Mood Name (e.g., Heartbroken)"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="px-3 py-2 border-2 border-gray-300 rounded-lg font-typewriter"
                                required
                            />
                            <input
                                type="text"
                                placeholder="Slug (auto-generated if empty)"
                                value={formData.slug}
                                onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                                className="px-3 py-2 border-2 border-gray-300 rounded-lg font-typewriter"
                            />
                            <input
                                type="text"
                                placeholder="Title (e.g., Symptom: Heartbroken)"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                className="px-3 py-2 border-2 border-gray-300 rounded-lg font-typewriter"
                            />
                            <input
                                type="number"
                                placeholder="Display Order"
                                value={formData.order}
                                onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 1 })}
                                className="px-3 py-2 border-2 border-gray-300 rounded-lg font-typewriter"
                                min="1"
                            />
                            <textarea
                                placeholder="Treatment description (e.g., Treatment for: Sadness and loneliness)"
                                value={formData.treatment}
                                onChange={(e) => setFormData({ ...formData, treatment: e.target.value })}
                                className="px-3 py-2 border-2 border-gray-300 rounded-lg font-typewriter sm:col-span-2"
                                rows={2}
                                required
                            />
                        </div>

                        {/* Emoji Selector */}
                        <div className="mt-4">
                            <label className="font-typewriter text-sm text-gray-600">Emoji:</label>
                            <div className="flex flex-wrap gap-2 mt-2">
                                {emojis.map(emoji => (
                                    <button
                                        key={emoji}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, emoji })}
                                        className={`w-10 h-10 text-2xl rounded-lg border-2 transition-all ${formData.emoji === emoji ? 'border-therapy-teal bg-therapy-light scale-110' : 'border-gray-200 hover:border-gray-400'
                                            }`}
                                    >
                                        {emoji}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Color Presets */}
                        <div className="mt-4">
                            <label className="font-typewriter text-sm text-gray-600">Color Theme:</label>
                            <div className="flex flex-wrap gap-3 mt-2">
                                {colorPresets.map(preset => (
                                    <button
                                        key={preset.name}
                                        type="button"
                                        onClick={() => selectColorPreset(preset)}
                                        className={`flex items-center gap-2 px-3 py-2 rounded-lg border-2 transition-all ${formData.color === preset.color ? 'border-therapy-teal' : 'border-gray-200'
                                            }`}
                                        style={{ backgroundColor: preset.bg }}
                                    >
                                        <div className="w-4 h-4 rounded-full" style={{ backgroundColor: preset.color }} />
                                        <span className="text-sm font-typewriter">{preset.name}</span>
                                    </button>
                                ))}
                            </div>
                            <div className="flex gap-4 mt-3">
                                <div>
                                    <label className="text-xs text-gray-500">Text Color</label>
                                    <input
                                        type="color"
                                        value={formData.color}
                                        onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                                        className="block w-12 h-8 cursor-pointer"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-gray-500">Background</label>
                                    <input
                                        type="color"
                                        value={formData.bgColor}
                                        onChange={(e) => setFormData({ ...formData, bgColor: e.target.value })}
                                        className="block w-12 h-8 cursor-pointer"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Preview */}
                        <div className="mt-4 p-4 rounded-2xl" style={{ backgroundColor: formData.bgColor }}>
                            <p className="text-xs text-gray-500 mb-2">Preview:</p>
                            <div className="flex items-center gap-3">
                                <span className="text-4xl">{formData.emoji}</span>
                                <div>
                                    <h3 className="font-typewriter font-bold" style={{ color: formData.color }}>
                                        {formData.title || `Symptom: ${formData.name || 'New Mood'}`}
                                    </h3>
                                    <p className="text-sm text-gray-600">{formData.treatment || 'Treatment description...'}</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 mt-4">
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
                                {editingMood ? 'Update Mood' : 'Create Mood'}
                            </button>
                            <button type="button" onClick={resetForm} className="pill-button bg-gray-200">
                                Cancel
                            </button>
                        </div>
                    </form>
                )}

                {/* Moods List */}
                {loading ? (
                    <div className="flex justify-center py-12">
                        <div className="spinner" />
                    </div>
                ) : moods.length === 0 ? (
                    <div className="text-center py-12">
                        <span className="text-5xl mb-4 block">🎭</span>
                        <p className="font-typewriter text-gray-600">No moods yet. Create your first mood!</p>
                    </div>
                ) : (
                    <div className="grid sm:grid-cols-2 gap-4">
                        {moods.sort((a, b) => a.order - b.order).map((mood) => (
                            <div
                                key={mood._id}
                                className="rounded-2xl p-4 border-2 transition-all hover:shadow-lg"
                                style={{ backgroundColor: mood.bgColor, borderColor: mood.color }}
                            >
                                <div className="flex items-start justify-between mb-2">
                                    <div className="flex items-center gap-3">
                                        <span className="text-4xl">{mood.emoji}</span>
                                        <div>
                                            <h3 className="font-typewriter font-bold" style={{ color: mood.color }}>
                                                {mood.name}
                                            </h3>
                                            <p className="text-xs text-gray-500">/{mood.slug}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-1">
                                        <span className="text-xs bg-white/50 px-2 py-0.5 rounded">#{mood.order}</span>
                                        {!mood.isActive && (
                                            <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded">Inactive</span>
                                        )}
                                    </div>
                                </div>
                                <p className="text-sm text-gray-600 mb-3">{mood.treatment}</p>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleEdit(mood)}
                                        className="px-3 py-1 bg-white/80 rounded-lg text-sm hover:bg-white transition-colors"
                                    >
                                        ✏️ Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(mood._id)}
                                        className="px-3 py-1 bg-red-100 text-red-600 rounded-lg text-sm hover:bg-red-200 transition-colors"
                                    >
                                        🗑️ Delete
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
