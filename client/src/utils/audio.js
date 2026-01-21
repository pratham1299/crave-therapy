// Audio utility for mood-based music
class MoodMusic {
    constructor() {
        this.audioContext = null;
        this.oscillator = null;
        this.gainNode = null;
        this.isPlaying = false;
    }

    init() {
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
    }

    // Generate mood-based tones
    getMoodConfig(moodSlug) {
        const configs = {
            heartbroken: {
                // Melancholic minor key
                frequencies: [220, 261.63, 293.66, 329.63],
                tempo: 0.8,
                waveType: 'sine'
            },
            angry: {
                // Aggressive high tempo
                frequencies: [329.63, 392, 440, 493.88],
                tempo: 2,
                waveType: 'sawtooth'
            },
            stressed: {
                // Calm, slow frequencies
                frequencies: [196, 220, 246.94, 261.63],
                tempo: 0.5,
                waveType: 'sine'
            },
            hyper: {
                // Upbeat, fast tempo
                frequencies: [349.23, 392, 440, 523.25],
                tempo: 2.5,
                waveType: 'triangle'
            }
        };
        return configs[moodSlug] || configs.stressed;
    }

    play(moodSlug) {
        this.init();
        this.stop();

        const config = this.getMoodConfig(moodSlug);
        let noteIndex = 0;

        const playNote = () => {
            if (!this.isPlaying) return;

            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();

            oscillator.type = config.waveType;
            oscillator.frequency.value = config.frequencies[noteIndex % config.frequencies.length];

            gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.5);

            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);

            oscillator.start();
            oscillator.stop(this.audioContext.currentTime + 0.5);

            noteIndex++;

            setTimeout(() => {
                if (this.isPlaying) playNote();
            }, 500 / config.tempo);
        };

        this.isPlaying = true;
        playNote();
    }

    stop() {
        this.isPlaying = false;
        if (this.oscillator) {
            try {
                this.oscillator.stop();
            } catch (e) { }
            this.oscillator = null;
        }
    }

    setVolume(volume) {
        if (this.gainNode) {
            this.gainNode.gain.value = volume;
        }
    }
}

export const moodMusic = new MoodMusic();
