import React, { useState } from 'react';
import { LogOut } from 'lucide-react';
import { playPopSound } from '../../utils/audioUtils';

const LearnCard = ({ onBack, onLogActivity }) => {
    // A-Z
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
    const [selectedLetter, setSelectedLetter] = useState(null);
    const [exampleIndex, setExampleIndex] = useState(0);
    const bgMusicRef = React.useRef(null);
    const wordAudioRef = React.useRef(null);

    React.useEffect(() => {
        // Initialize background music - using the user provided "6-happy" track
        bgMusicRef.current = new Audio('/audio/6-Happy-Commercial-Piano(chosic.com).mp3');
        bgMusicRef.current.loop = true;
        bgMusicRef.current.volume = 0.3; // Increased volume slightly

        // Try to play music - browsers might block this until interaction
        const playPromise = bgMusicRef.current.play();
        if (playPromise !== undefined) {
            playPromise.catch(error => {
                console.log("Audio playback prevented by browser policy:", error);
            });
        }

        return () => {
            if (bgMusicRef.current) {
                bgMusicRef.current.pause();
                bgMusicRef.current = null;
            }
            if (wordAudioRef.current) {
                wordAudioRef.current.pause();
                wordAudioRef.current = null;
            }
            window.speechSynthesis.cancel();
        };
    }, []);

    // Data for words - 3 examples per letter
    const getWords = (char) => {
        const words = {
            'A': [
                { word: 'Apple', emoji: '🍎', image: '/assets/images/coloring/apple_template.png', type: 'side-by-side', outlineSide: 'right' },
                { word: 'Ant', emoji: '🐜' },
                { word: 'Astronaut', emoji: '👨‍🚀' }
            ],
            'B': [
                { word: 'Banana', emoji: '🍌', image: '/assets/images/coloring/banana_template.png', type: 'side-by-side', outlineSide: 'left' },
                { word: 'Butterfly', emoji: '🦋', image: '/assets/images/coloring/butterfly_template.jpg', type: 'side-by-side', outlineSide: 'left' },
                { word: 'Ball', emoji: '⚽', image: '/assets/images/coloring/ball_template.png', type: 'single' }
            ],
            'C': [
                { word: 'Cat', emoji: '🐱' },
                { word: 'Car', emoji: '🚗' },
                { word: 'Cake', emoji: '🍰' }
            ],
            'D': [
                { word: 'Dog', emoji: '🐶' },
                { word: 'Duck', emoji: '🦆' },
                { word: 'Dolphin', emoji: '🐬' }
            ],
            'E': [
                { word: 'Elephant', emoji: '🐘' },
                { word: 'Egg', emoji: '🥚' },
                { word: 'Eagle', emoji: '🦅' }
            ],
            'F': [
                { word: 'Fish', emoji: '🐟' },
                { word: 'Frog', emoji: '🐸' },
                { word: 'Flower', emoji: '🌸' }
            ],
            'G': [
                { word: 'Grapes', emoji: '🍇' },
                { word: 'Giraffe', emoji: '🦒' },
                { word: 'Guitar', emoji: '🎸' }
            ],
            'H': [
                { word: 'House', emoji: '🏡', image: '/assets/images/coloring/house_template.jpg', type: 'side-by-side', outlineSide: 'right' },
                { word: 'Horse', emoji: '🐎' },
                { word: 'Hat', emoji: '🎩' }
            ],
            'I': [
                { word: 'Ice Cream', emoji: '🍦', image: '/assets/images/coloring/icecream_template.png', type: 'side-by-side', outlineSide: 'right' },
                { word: 'Igloo', emoji: '🏘️' },
                { word: 'Island', emoji: '🏝️' }
            ],
            'J': [
                { word: 'Juice', emoji: '🧃' },
                { word: 'Jellyfish', emoji: '🪼' },
                { word: 'Jeep', emoji: '🚙' }
            ],
            'K': [
                { word: 'Kite', emoji: '🪁' },
                { word: 'Kangaroo', emoji: '🦘' },
                { word: 'Key', emoji: '🔑' }
            ],
            'L': [
                { word: 'Lion', emoji: '🦁' },
                { word: 'Leaf', emoji: '🍃' },
                { word: 'Lamp', emoji: '💡' }
            ],
            'M': [
                { word: 'Moon', emoji: '🌙' },
                { word: 'Monkey', emoji: '🐒' },
                { word: 'Mouse', emoji: '🐭' }
            ],
            'N': [
                { word: 'Nest', emoji: '🪺' },
                { word: 'Nose', emoji: '👃' },
                { word: 'Net', emoji: '🕸️' }
            ],
            'O': [
                { word: 'Orange', emoji: '🍊', image: '/assets/images/coloring/orange_template.png', type: 'side-by-side', outlineSide: 'right' },
                { word: 'Owl', emoji: '🦉' },
                { word: 'Ocean', emoji: '🌊' }
            ],
            'P': [
                { word: 'Pizza', emoji: '🍕' },
                { word: 'Panda', emoji: '🐼', image: '/assets/images/coloring/panda_template.jpg', type: 'side-by-side', outlineSide: 'right' },
                { word: 'Penguin', emoji: '🐧' }
            ],
            'Q': [
                { word: 'Queen', emoji: '👑' },
                { word: 'Question', emoji: '❓' },
                { word: 'Quilt', emoji: '🧵' }
            ],
            'R': [
                { word: 'Rainbow', emoji: '🌈' },
                { word: 'Rabbit', emoji: '🐰' },
                { word: 'Rocket', emoji: '🚀' }
            ],
            'S': [
                { word: 'Star', emoji: '⭐' },
                { word: 'Sun', emoji: '☀️' },
                { word: 'Snake', emoji: '🐍' }
            ],
            'T': [
                { word: 'Train', emoji: '🚂' },
                { word: 'Tiger', emoji: '🐯' },
                { word: 'Turtle', emoji: '🐢' }
            ],
            'U': [
                { word: 'Umbrella', emoji: '☂️' },
                { word: 'Unicorn', emoji: '🦄' },
                { word: 'Up', emoji: '⬆️' }
            ],
            'V': [
                { word: 'Volcano', emoji: '🌋' },
                { word: 'Violin', emoji: '🎻' },
                { word: 'Vegetables', emoji: '🥦' }
            ],
            'W': [
                { word: 'Watermelon', emoji: '🍉' },
                { word: 'Whale', emoji: '🐋' },
                { word: 'Watch', emoji: '⌚' }
            ],
            'X': [
                { word: 'Xylophone', emoji: '🎹' },
                { word: 'X-ray', emoji: '🩻' },
                { word: 'Xmas Tree', emoji: '🎄' }
            ],
            'Y': [
                { word: 'Yo-Yo', emoji: '🪀' },
                { word: 'Yak', emoji: '🐂' },
                { word: 'Yellow', emoji: '🟡' }
            ],
            'Z': [
                { word: 'Zebra', emoji: '🦓' },
                { word: 'Zoo', emoji: '🏢' },
                { word: 'Zip', emoji: '🤐' }
            ],
        };
        return words[char] || [{ word: char, emoji: char }];
    };

    const speak = (text, wordData) => {
        window.speechSynthesis.cancel();

        // Pause background music while speaking
        if (bgMusicRef.current) {
            bgMusicRef.current.pause();
        }

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.8;

        utterance.onend = () => {
            // After TTS, try to play the word sound
            if (wordData && wordData.sound) {
                console.log(`Attempting to play sound: ${wordData.sound}`);
                const sound = new Audio(wordData.sound);
                wordAudioRef.current = sound;

                sound.onended = () => {
                    // Resume background music after word sound ends
                    if (bgMusicRef.current) {
                        bgMusicRef.current.play().catch(e => console.log("Resume bg music failed:", e));
                    }
                };

                sound.onerror = () => {
                    console.log(`Sound file not found: ${wordData.sound}, resuming music.`);
                    // If sound file missing, resume background music immediately
                    if (bgMusicRef.current) {
                        bgMusicRef.current.play().catch(e => console.log("Resume bg music failed:", e));
                    }
                };

                sound.play().catch(e => {
                    console.log("Play word sound failed:", e);
                    // Also resume on error
                    if (bgMusicRef.current) {
                        bgMusicRef.current.play().catch(e => console.log("Resume bg music failed:", e));
                    }
                });
            } else {
                // No sound file configured, resume background music immediately
                if (bgMusicRef.current) {
                    bgMusicRef.current.play().catch(e => console.log("Resume bg music failed:", e));
                }
            }
        };

        window.speechSynthesis.speak(utterance);
    };

    const handleLetterClick = (char) => {
        playPopSound();
        const words = getWords(char);
        setSelectedLetter(char);
        setExampleIndex(0);
        speak(`${char}. ${words[0].word}`, words[0]);
        if (onLogActivity) {
            onLogActivity('learn', `Started learning letter ${char}`, `Word: ${words[0].word}`);
        }
    };

    const handleNextExample = () => {
        playPopSound();
        const words = getWords(selectedLetter);
        const nextIndex = (exampleIndex + 1) % words.length;
        setExampleIndex(nextIndex);
        speak(words[nextIndex].word, words[nextIndex]);
        if (onLogActivity) {
            onLogActivity('learn', `Switched example for ${selectedLetter}`, `Word: ${words[nextIndex].word}`);
        }
    };

    const handlePrevExample = () => {
        playPopSound();
        const words = getWords(selectedLetter);
        const prevIndex = (exampleIndex - 1 + words.length) % words.length;
        setExampleIndex(prevIndex);
        speak(words[prevIndex].word, words[prevIndex]);
        if (onLogActivity) {
            onLogActivity('learn', `Switched example for ${selectedLetter}`, `Word: ${words[prevIndex].word}`);
        }
    };

    const handleBackToGrid = () => {
        window.speechSynthesis.cancel();
        if (wordAudioRef.current) {
            wordAudioRef.current.pause();
        }
        setSelectedLetter(null);
        setExampleIndex(0);
        // Ensure music is playing when going back to grid
        if (bgMusicRef.current && bgMusicRef.current.paused) {
            bgMusicRef.current.play().catch(e => console.log("Resume bg music failed:", e));
        }
    };

    return (
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border-4 border-blue-300 flex flex-col h-[70vh]">
            <div className="bg-blue-300 p-4 flex items-center gap-3">
                <div className="text-4xl">📘</div>
                <div className="flex-1">
                    <h3 className="font-comic font-bold text-2xl text-blue-900">Learn ABCs</h3>
                </div>
                <button
                    onClick={onBack}
                    className="bg-red-400 text-white p-2 px-4 rounded-xl font-bold hover:bg-red-500 transition-transform transform active:scale-95 shadow-lg flex items-center gap-2 border-2 border-red-300"
                >
                    <LogOut size={20} />
                    Exit
                </button>
            </div>

            <div className="flex-1 p-4 bg-blue-50 overflow-y-auto">
                {selectedLetter ? (
                    <div className="h-full flex flex-col items-center justify-center animate-zoom-in relative">
                        <div className="w-64 h-64 sm:w-80 sm:h-80 mb-6 flex items-center justify-center bg-white rounded-3xl shadow-lg border-4 border-blue-100 overflow-hidden relative flex-shrink-0">
                            {getWords(selectedLetter)[exampleIndex].image ? (
                                <div className="w-full h-full relative overflow-hidden bg-white p-4">
                                    <img
                                        src={getWords(selectedLetter)[exampleIndex].image}
                                        alt={getWords(selectedLetter)[exampleIndex].word}
                                        className="absolute h-full w-full object-contain"
                                        style={{
                                            width: getWords(selectedLetter)[exampleIndex].type === 'side-by-side' ? '200%' : '100%',
                                            maxWidth: 'none',
                                            left: getWords(selectedLetter)[exampleIndex].type === 'side-by-side'
                                                ? (getWords(selectedLetter)[exampleIndex].outlineSide === 'right' ? '0' : '-100%')
                                                : '0',
                                            top: '0'
                                        }}
                                    />
                                </div>
                            ) : (
                                <span className="text-[10rem] drop-shadow-lg">
                                    {getWords(selectedLetter)[exampleIndex].emoji}
                                </span>
                            )}
                        </div>
                        <h1 className="text-4xl sm:text-5xl font-black text-blue-600 mb-6 tracking-wide uppercase text-center">
                            {getWords(selectedLetter)[exampleIndex].word}
                        </h1>

                        <div className="flex gap-4 mb-6">
                            <button
                                onClick={handlePrevExample}
                                className="bg-yellow-400 text-white w-12 h-12 rounded-full flex items-center justify-center shadow-lg hover:bg-yellow-500 transition-all border-b-4 border-yellow-600 active:translate-y-1 active:border-b-0"
                            >
                                <span className="text-xl">⬅️</span>
                            </button>
                            <button
                                onClick={handleNextExample}
                                className="bg-yellow-400 text-white w-12 h-12 rounded-full flex items-center justify-center shadow-lg hover:bg-yellow-500 transition-all border-b-4 border-yellow-600 active:translate-y-1 active:border-b-0"
                            >
                                <span className="text-xl">➡️</span>
                            </button>
                        </div>

                        <button
                            onClick={handleBackToGrid}
                            className="bg-blue-500 text-white px-8 py-3 rounded-2xl text-xl font-black shadow-lg hover:bg-blue-600 transition-all border-b-4 border-blue-700 active:translate-y-1 active:border-b-0"
                        >
                            MORE LETTERS
                        </button>

                        <div className="absolute top-0 right-0 text-3xl font-black text-blue-200 opacity-50">
                            {selectedLetter}
                        </div>

                    </div>
                ) : (
                    <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
                        {alphabet.map(char => (
                            <button
                                key={char}
                                onClick={() => handleLetterClick(char)}
                                className="aspect-square bg-white rounded-2xl shadow-md border-2 border-blue-100 flex items-center justify-center text-3xl font-bold text-blue-500 hover:bg-yellow-300 hover:text-white hover:scale-110 transition-all"
                            >
                                {char}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default LearnCard;
