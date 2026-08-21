// Web Audio API context for synthesized sounds
let audioCtx = null;

const getAudioCtx = () => {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    return audioCtx;
};

const playSynthNote = (freq, type, duration, volume = 0.1) => {
    const ctx = getAudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);

    gain.gain.setValueAtTime(volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + duration);
};

export const playPopSound = () => {
    playSynthNote(400, 'sine', 0.1, 0.2);
};

export const playCorrectSound = () => {
    // Upward arpeggio for "Correct"
    playSynthNote(523.25, 'triangle', 0.1, 0.15); // C5
    setTimeout(() => playSynthNote(659.25, 'triangle', 0.3, 0.15), 100); // E5
};

export const playWrongSound = () => {
    // Downward buzzy sound for "Wrong"
    playSynthNote(200, 'sawtooth', 0.2, 0.1);
    setTimeout(() => playSynthNote(150, 'sawtooth', 0.3, 0.1), 100);
};

export const playWinSound = () => {
    // Happy fanfare
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    notes.forEach((freq, i) => {
        setTimeout(() => playSynthNote(freq, 'sine', 0.4, 0.2), i * 150);
    });
};
