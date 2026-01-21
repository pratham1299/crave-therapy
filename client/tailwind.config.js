/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                'therapy-teal': '#5D9B9B',
                'therapy-dark': '#3D7A7A',
                'therapy-light': '#E8F4F4',
                'paper': '#F5F5DC',
                'grid-line': '#D4E5E5',
                'heartbroken': '#FF6B9D',
                'angry': '#FF4444',
                'stressed': '#6B5B95',
                'hyper': '#FFB347',
            },
            fontFamily: {
                'typewriter': ['"Special Elite"', '"Courier New"', 'Courier', 'monospace'],
                'handwritten': ['"Caveat"', 'cursive'],
            },
            animation: {
                'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                'bounce-in': 'bounceIn 0.5s ease-out',
                'slide-up': 'slideUp 0.4s ease-out',
                'fade-in': 'fadeIn 0.3s ease-out',
                'pill-drop': 'pillDrop 0.6s ease-out',
                'heartbeat': 'heartbeat 1.5s ease-in-out infinite',
                'float': 'float 3s ease-in-out infinite',
                'wiggle': 'wiggle 0.5s ease-in-out',
            },
            keyframes: {
                bounceIn: {
                    '0%': { transform: 'scale(0.3)', opacity: '0' },
                    '50%': { transform: 'scale(1.05)' },
                    '70%': { transform: 'scale(0.9)' },
                    '100%': { transform: 'scale(1)', opacity: '1' },
                },
                slideUp: {
                    '0%': { transform: 'translateY(20px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                },
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                pillDrop: {
                    '0%': { transform: 'translateY(-50px) rotate(-10deg)', opacity: '0' },
                    '60%': { transform: 'translateY(10px) rotate(5deg)' },
                    '100%': { transform: 'translateY(0) rotate(0)', opacity: '1' },
                },
                heartbeat: {
                    '0%, 100%': { transform: 'scale(1)' },
                    '50%': { transform: 'scale(1.1)' },
                },
                float: {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-10px)' },
                },
                wiggle: {
                    '0%, 100%': { transform: 'rotate(-3deg)' },
                    '50%': { transform: 'rotate(3deg)' },
                },
            },
            backgroundImage: {
                'graph-paper': `
          linear-gradient(#D4E5E5 1px, transparent 1px),
          linear-gradient(90deg, #D4E5E5 1px, transparent 1px)
        `,
            },
            backgroundSize: {
                'graph': '20px 20px',
            },
        },
    },
    plugins: [],
}
