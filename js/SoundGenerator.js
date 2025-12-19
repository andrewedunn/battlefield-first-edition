// ABOUTME: Generates funny weapon sound effects using Web Audio API
// ABOUTME: Creates unique sounds for each silly weapon type

class SoundGenerator {
    constructor() {
        this.audioContext = null;
        this.sounds = {};
        this.enabled = true;
    }

    init() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.createAllSounds();
        } catch (e) {
            console.warn('Web Audio API not supported, sounds disabled');
            this.enabled = false;
        }
    }

    resumeContext() {
        if (this.audioContext && this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
    }

    createAllSounds() {
        // Pre-generate sound parameters for each weapon
        this.sounds = {
            'proj_banana': { type: 'boing', freq: 300, duration: 0.15 },
            'proj_balloon': { type: 'splash', freq: 200, duration: 0.2 },
            'proj_confetti': { type: 'pop', freq: 800, duration: 0.08 },
            'proj_chicken': { type: 'squeak', freq: 600, duration: 0.25 },
            'proj_pie': { type: 'splat', freq: 150, duration: 0.2 },
            'proj_bubble': { type: 'bloop', freq: 400, duration: 0.12 },
            'proj_snowball': { type: 'puff', freq: 100, duration: 0.15 },
            'proj_string': { type: 'spray', freq: 1000, duration: 0.1 },
            'proj_plunger': { type: 'plop', freq: 120, duration: 0.3 },
            'proj_tickle': { type: 'zap', freq: 500, duration: 0.15 }
        };
    }

    play(projectileType) {
        if (!this.enabled || !this.audioContext) return;

        this.resumeContext();

        const sound = this.sounds[projectileType];
        if (!sound) return;

        switch (sound.type) {
            case 'boing':
                this.playBoing(sound.freq, sound.duration);
                break;
            case 'splash':
                this.playSplash(sound.freq, sound.duration);
                break;
            case 'pop':
                this.playPop(sound.freq, sound.duration);
                break;
            case 'squeak':
                this.playSqueak(sound.freq, sound.duration);
                break;
            case 'splat':
                this.playSplat(sound.freq, sound.duration);
                break;
            case 'bloop':
                this.playBloop(sound.freq, sound.duration);
                break;
            case 'puff':
                this.playPuff(sound.freq, sound.duration);
                break;
            case 'spray':
                this.playSpray(sound.freq, sound.duration);
                break;
            case 'plop':
                this.playPlop(sound.freq, sound.duration);
                break;
            case 'zap':
                this.playZap(sound.freq, sound.duration);
                break;
        }
    }

    playBoing(freq, duration) {
        // Spring boing sound - frequency sweep up then down
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, this.audioContext.currentTime);
        osc.frequency.exponentialRampToValueAtTime(freq * 2, this.audioContext.currentTime + duration * 0.3);
        osc.frequency.exponentialRampToValueAtTime(freq * 0.5, this.audioContext.currentTime + duration);

        gain.gain.setValueAtTime(0.3, this.audioContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);

        osc.connect(gain);
        gain.connect(this.audioContext.destination);

        osc.start();
        osc.stop(this.audioContext.currentTime + duration);
    }

    playSplash(freq, duration) {
        // Water splash - noise burst with filter sweep
        const bufferSize = this.audioContext.sampleRate * duration;
        const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
        }

        const source = this.audioContext.createBufferSource();
        const filter = this.audioContext.createBiquadFilter();
        const gain = this.audioContext.createGain();

        source.buffer = buffer;
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(freq * 4, this.audioContext.currentTime);
        filter.frequency.exponentialRampToValueAtTime(freq, this.audioContext.currentTime + duration);

        gain.gain.setValueAtTime(0.4, this.audioContext.currentTime);

        source.connect(filter);
        filter.connect(gain);
        gain.connect(this.audioContext.destination);

        source.start();
    }

    playPop(freq, duration) {
        // Quick pop sound
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, this.audioContext.currentTime);
        osc.frequency.exponentialRampToValueAtTime(freq * 0.1, this.audioContext.currentTime + duration);

        gain.gain.setValueAtTime(0.4, this.audioContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);

        osc.connect(gain);
        gain.connect(this.audioContext.destination);

        osc.start();
        osc.stop(this.audioContext.currentTime + duration);
    }

    playSqueak(freq, duration) {
        // Rubber chicken squeak - wobbling frequency
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        const vibrato = this.audioContext.createOscillator();
        const vibratoGain = this.audioContext.createGain();

        vibrato.frequency.value = 30;
        vibratoGain.gain.value = 100;

        vibrato.connect(vibratoGain);
        vibratoGain.connect(osc.frequency);

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, this.audioContext.currentTime);

        gain.gain.setValueAtTime(0.2, this.audioContext.currentTime);
        gain.gain.setValueAtTime(0.3, this.audioContext.currentTime + duration * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);

        osc.connect(gain);
        gain.connect(this.audioContext.destination);

        vibrato.start();
        osc.start();
        osc.stop(this.audioContext.currentTime + duration);
        vibrato.stop(this.audioContext.currentTime + duration);
    }

    playSplat(freq, duration) {
        // Cream pie splat - low thud with noise
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, this.audioContext.currentTime);
        osc.frequency.exponentialRampToValueAtTime(freq * 0.3, this.audioContext.currentTime + duration);

        gain.gain.setValueAtTime(0.5, this.audioContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);

        osc.connect(gain);
        gain.connect(this.audioContext.destination);

        osc.start();
        osc.stop(this.audioContext.currentTime + duration);

        // Add noise component
        this.playSplash(freq, duration * 0.5);
    }

    playBloop(freq, duration) {
        // Bubble bloop - quick pitch drop
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq * 1.5, this.audioContext.currentTime);
        osc.frequency.exponentialRampToValueAtTime(freq * 0.5, this.audioContext.currentTime + duration);

        gain.gain.setValueAtTime(0.3, this.audioContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);

        osc.connect(gain);
        gain.connect(this.audioContext.destination);

        osc.start();
        osc.stop(this.audioContext.currentTime + duration);
    }

    playPuff(freq, duration) {
        // Soft puff sound - filtered noise
        const bufferSize = this.audioContext.sampleRate * duration;
        const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < bufferSize; i++) {
            const envelope = Math.sin((i / bufferSize) * Math.PI);
            data[i] = (Math.random() * 2 - 1) * envelope * 0.3;
        }

        const source = this.audioContext.createBufferSource();
        const filter = this.audioContext.createBiquadFilter();

        source.buffer = buffer;
        filter.type = 'lowpass';
        filter.frequency.value = freq * 2;

        source.connect(filter);
        filter.connect(this.audioContext.destination);

        source.start();
    }

    playSpray(freq, duration) {
        // Silly string spray - high pitched noise burst
        const bufferSize = this.audioContext.sampleRate * duration;
        const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * 0.2;
        }

        const source = this.audioContext.createBufferSource();
        const filter = this.audioContext.createBiquadFilter();
        const gain = this.audioContext.createGain();

        source.buffer = buffer;
        filter.type = 'bandpass';
        filter.frequency.value = freq;
        filter.Q.value = 5;

        gain.gain.setValueAtTime(0.3, this.audioContext.currentTime);

        source.connect(filter);
        filter.connect(gain);
        gain.connect(this.audioContext.destination);

        source.start();
    }

    playPlop(freq, duration) {
        // Plunger plop - low frequency pop
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, this.audioContext.currentTime);
        osc.frequency.exponentialRampToValueAtTime(freq * 3, this.audioContext.currentTime + duration * 0.1);
        osc.frequency.exponentialRampToValueAtTime(freq * 0.5, this.audioContext.currentTime + duration);

        gain.gain.setValueAtTime(0.5, this.audioContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);

        osc.connect(gain);
        gain.connect(this.audioContext.destination);

        osc.start();
        osc.stop(this.audioContext.currentTime + duration);
    }

    playZap(freq, duration) {
        // Tickle ray zap - oscillating frequency
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        const lfo = this.audioContext.createOscillator();
        const lfoGain = this.audioContext.createGain();

        lfo.frequency.value = 50;
        lfoGain.gain.value = 200;

        lfo.connect(lfoGain);
        lfoGain.connect(osc.frequency);

        osc.type = 'square';
        osc.frequency.setValueAtTime(freq, this.audioContext.currentTime);

        gain.gain.setValueAtTime(0.15, this.audioContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);

        osc.connect(gain);
        gain.connect(this.audioContext.destination);

        lfo.start();
        osc.start();
        osc.stop(this.audioContext.currentTime + duration);
        lfo.stop(this.audioContext.currentTime + duration);
    }

    playHit() {
        // Generic hit sound
        if (!this.enabled || !this.audioContext) return;
        this.resumeContext();

        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(300, this.audioContext.currentTime);
        osc.frequency.exponentialRampToValueAtTime(100, this.audioContext.currentTime + 0.1);

        gain.gain.setValueAtTime(0.3, this.audioContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);

        osc.connect(gain);
        gain.connect(this.audioContext.destination);

        osc.start();
        osc.stop(this.audioContext.currentTime + 0.1);
    }

    playEliminate() {
        // Player eliminated - descending tone
        if (!this.enabled || !this.audioContext) return;
        this.resumeContext();

        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(600, this.audioContext.currentTime);
        osc.frequency.exponentialRampToValueAtTime(100, this.audioContext.currentTime + 0.4);

        gain.gain.setValueAtTime(0.2, this.audioContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.4);

        osc.connect(gain);
        gain.connect(this.audioContext.destination);

        osc.start();
        osc.stop(this.audioContext.currentTime + 0.4);
    }

    playVictory() {
        // Victory fanfare
        if (!this.enabled || !this.audioContext) return;
        this.resumeContext();

        const notes = [523, 659, 784, 1047]; // C5, E5, G5, C6
        notes.forEach((freq, i) => {
            setTimeout(() => {
                const osc = this.audioContext.createOscillator();
                const gain = this.audioContext.createGain();

                osc.type = 'square';
                osc.frequency.value = freq;

                gain.gain.setValueAtTime(0.15, this.audioContext.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);

                osc.connect(gain);
                gain.connect(this.audioContext.destination);

                osc.start();
                osc.stop(this.audioContext.currentTime + 0.3);
            }, i * 150);
        });
    }

    playRatSqueak() {
        // High-pitched rat squeak
        if (!this.enabled || !this.audioContext) return;
        this.resumeContext();

        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(1200, this.audioContext.currentTime);
        osc.frequency.exponentialRampToValueAtTime(800, this.audioContext.currentTime + 0.1);
        osc.frequency.exponentialRampToValueAtTime(1000, this.audioContext.currentTime + 0.15);

        gain.gain.setValueAtTime(0.15, this.audioContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.15);

        osc.connect(gain);
        gain.connect(this.audioContext.destination);

        osc.start();
        osc.stop(this.audioContext.currentTime + 0.15);
    }
}

// Global sound generator instance
const soundGenerator = new SoundGenerator();
