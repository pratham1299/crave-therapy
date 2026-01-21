import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useCart } from '../context/CartContext';
import { moodMusic } from '../utils/audio';

export default function MoodSelect() {
    const [moods, setMoods] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedMood, setSelectedMood] = useState(null);
    const navigate = useNavigate();
    const { setCurrentMood } = useCart();

    useEffect(() => {
        fetchMoods();
        return () => moodMusic.stop();
    }, []);

    const fetchMoods = async () => {
        try {
            const { data } = await api.get('/moods');
            setMoods(data.data);
        } catch (error) {
            console.error('Failed to fetch moods:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleMoodClick = (mood) => {
        setSelectedMood(mood);
        setCurrentMood(mood);

        // Play mood music
        moodMusic.play(mood.slug);

        // Navigate after animation
        setTimeout(() => {
            navigate(`/menu/${mood.slug}`);
        }, 800);
    };

    const getMoodStyle = (slug) => {
        const styles = {
            heartbroken: 'from-pink-400 to-red-300 hover:from-pink-500 hover:to-red-400',
            angry: 'from-red-500 to-orange-400 hover:from-red-600 hover:to-orange-500',
            stressed: 'from-purple-400 to-indigo-400 hover:from-purple-500 hover:to-indigo-500',
            hyper: 'from-yellow-400 to-orange-300 hover:from-yellow-500 hover:to-orange-400',
        };
        return styles[slug] || styles.stressed;
    };

    if (loading) {
        return (
            <div className="min-h-[calc(100vh-64px)] flex items-center justify-center">
                <div className="text-center">
                    <div className="spinner mx-auto mb-4" />
                    <p className="font-typewriter text-gray-600">Preparing diagnosis room...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-[calc(100vh-64px)] p-4 md:p-8">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="text-center mb-10 animate-slide-up">
                    <span className="text-5xl mb-4 block">🩺</span>
                    <h1 className="text-3xl md:text-4xl font-typewriter text-therapy-dark mb-2">
                        Pick Your Symptom
                    </h1>
                    <p className="text-gray-600 font-typewriter text-sm">
                        (Instead of 'Main Course', we call it Symptoms)
                    </p>
                </div>

                {/* Mood Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {moods.map((mood, index) => (
                        <button
                            key={mood._id}
                            onClick={() => handleMoodClick(mood)}
                            className={`mood-card bg-gradient-to-br ${getMoodStyle(mood.slug)} text-white text-left
                ${selectedMood?._id === mood._id ? 'scale-110 z-10' : ''}`}
                            style={{ animationDelay: `${index * 0.1}s` }}
                        >
                            {/* Emoji */}
                            <span className="text-5xl mb-3 block animate-float">
                                {mood.emoji}
                            </span>

                            {/* Title */}
                            <h2 className="text-2xl font-typewriter font-bold mb-2">
                                SYMPTOM: {mood.name.toUpperCase()}
                            </h2>

                            {/* Treatment Description */}
                            <p className="text-white/90 text-sm font-typewriter">
                                {mood.treatment}
                            </p>

                            {/* Item Count */}
                            <div className="mt-4 flex items-center gap-2 text-white/80 text-xs">
                                <span>💊</span>
                                <span>{mood.items?.length || 0} prescriptions available</span>
                            </div>

                            {/* Decorative Pulse */}
                            {selectedMood?._id === mood._id && (
                                <div className="absolute inset-0 bg-white/30 animate-pulse rounded-2xl" />
                            )}
                        </button>
                    ))}
                </div>

                {/* Help Text */}
                <div className="text-center mt-10 font-typewriter text-sm text-gray-500">
                    <p>🎵 Tap a mood to hear your therapy music!</p>
                    <p className="mt-1">Each mood comes with its own prescription playlist.</p>
                </div>
            </div>
        </div>
    );
}
