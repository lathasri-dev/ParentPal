/**
 * KEYBOARD SOUND ENHANCEMENTS
 * This script adds playful sound effects to key presses in Child Mode.
 * Uses Web Audio API (Synthesized sounds) for zero-latency and no external assets.
 */

(function () {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    let isMuted = false;

    // Higher Volume Gain Node (Increased for better feedback)
    const mainGain = audioCtx.createGain();
    mainGain.gain.setValueAtTime(0.25, audioCtx.currentTime); // Louder, more audible volume
    mainGain.connect(audioCtx.destination);

    function playNote(frequency, type = 'sine', duration = 0.2) {
        if (isMuted || audioCtx.state === 'suspended') return;

        const osc = audioCtx.createOscillator();
        const decay = audioCtx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(frequency, audioCtx.currentTime);

        decay.gain.setValueAtTime(1, audioCtx.currentTime);
        decay.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);

        osc.connect(decay);
        decay.connect(mainGain);

        osc.start();
        osc.stop(audioCtx.currentTime + duration);
    }

    const soundMap = {
        // Space bar: Deep Bubble
        ' ': () => playNote(150, 'sine', 0.4),
        // Arrows: Quick Taps
        'ArrowUp': () => playNote(500, 'square', 0.05),
        'ArrowDown': () => playNote(400, 'square', 0.05),
        'ArrowLeft': () => playNote(450, 'square', 0.05),
        'ArrowRight': () => playNote(550, 'square', 0.05),
        // Enter: Bell
        'Enter': () => playNote(880, 'sine', 0.8),
        // Escape: Toggle Mute (Internal check)
        'm': () => {
            isMuted = !isMuted;
            console.log(isMuted ? "🔇 Sounds Muted" : "🔊 Sounds Enabled");
        }
    };

    // Alphanumeric keys: Random playful notes
    const playRandomNote = (key) => {
        const charCode = key.toLowerCase().charCodeAt(0);
        const freq = 200 + (charCode % 12) * 50; // Map char to a musical interval
        playNote(freq, 'triangle', 0.15);
    };

    window.addEventListener('keydown', (e) => {
        // Resume context on first interaction (Browser policy)
        if (audioCtx.state === 'suspended') {
            audioCtx.resume();
        }

        // Play mapped sound
        if (soundMap[e.key]) {
            soundMap[e.key]();
        } else if (/^[a-z0-9]$/i.test(e.key)) {
            playRandomNote(e.key);
        }
    });

    console.log("🎹 Keyboard Sound Effects Initialized (Press 'M' to mute)");
})();
