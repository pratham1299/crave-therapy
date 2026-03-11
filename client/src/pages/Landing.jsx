import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Landing() {
    const { user, isAdmin, isStaff, loading } = useAuth();
    const navigate = useNavigate();

    // Redirect staff/admin to their respective home pages
    useEffect(() => {
        if (loading) return;

        if (isAdmin) {
            navigate('/admin', { replace: true });
        } else if (isStaff) {
            navigate('/counter', { replace: true });
        }
    }, [user, isAdmin, isStaff, loading, navigate]);

    // Show nothing while redirecting
    if (loading || isStaff) {
        return (
            <div className="min-h-[calc(100vh-64px)] flex items-center justify-center">
                <div className="spinner" />
            </div>
        );
    }

    return (
        <div className="min-h-[calc(100vh-64px)] flex flex-col items-center justify-center p-4">
            {/* Floating Pills Animation */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <span className="absolute top-20 left-10 text-4xl animate-float opacity-30">💊</span>
                <span className="absolute top-40 right-20 text-3xl animate-float opacity-30" style={{ animationDelay: '0.5s' }}>💉</span>
                <span className="absolute bottom-40 left-20 text-5xl animate-float opacity-30" style={{ animationDelay: '1s' }}>🩹</span>
                <span className="absolute bottom-20 right-10 text-4xl animate-float opacity-30" style={{ animationDelay: '1.5s' }}>🏥</span>
            </div>

            {/* Main Content */}
            <div className="text-center z-10 animate-slide-up">
                {/* Logo */}
                <div className="mb-8">
                    <div className="inline-block relative">
                        <img src="/logo.png" alt="Crave Therapy Logo" className="w-24 h-24 md:w-32 md:h-32 object-contain animate-heartbeat block mx-auto" />
                        {/* Approved Stamp */}
                        <div className="absolute -right-8 -top-4 transform rotate-12">
                            <span className="stamp text-xs">APPROVED</span>
                        </div>
                    </div>
                </div>

                {/* Title */}
                <h1 className="text-5xl md:text-7xl font-typewriter text-therapy-dark mb-4">
                    Crave Therapy
                </h1>
                <p className="text-xl md:text-2xl font-handwritten text-gray-600 mb-2">
                    Food for Moods
                </p>
                <p className="text-sm text-gray-500 font-typewriter mb-8">
                    Open for Consultations: 11 AM - 11 PM
                </p>

                {/* Prescription Box */}
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 max-w-md mx-auto mb-8 border-2 border-therapy-teal shadow-xl">
                    <div className="flex items-center justify-center gap-2 mb-4">
                        <span className="text-2xl">📋</span>
                        <h2 className="font-typewriter text-lg text-therapy-dark">PATIENT DIAGNOSIS</h2>
                    </div>
                    <p className="text-gray-600 font-typewriter text-sm leading-relaxed">
                        Feeling off? Our certified food therapists are ready to prescribe
                        the perfect meal for your mood. No appointment necessary!
                    </p>
                </div>

                {/* CTA Button */}
                <Link
                    to="/symptoms"
                    className="group inline-flex items-center gap-3 px-8 py-4 bg-therapy-teal text-white rounded-full font-typewriter text-xl hover:bg-therapy-dark transition-all transform hover:scale-105 shadow-lg hover:shadow-xl"
                >
                    <span>Check My Symptoms</span>
                    <span className="text-2xl group-hover:animate-wiggle">🩺</span>
                </Link>

                {/* Subtext */}
                <p className="mt-6 text-xs text-gray-500 font-typewriter">
                    ⚠️ Warning: Food may cause extreme happiness. Addiction is possible.
                </p>
            </div>

            {/* Decorative Bottom */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-4 text-gray-400 font-typewriter text-xs">
                <span>Rx</span>
                <span>•</span>
                <span>Est. 2024</span>
                <span>•</span>
                <span>@CraveTherapy</span>
            </div>
        </div>
    );
}
