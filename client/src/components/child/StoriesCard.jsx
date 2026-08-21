import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../../config';
import { Sparkles, Play, Pause, RefreshCw, ArrowLeft, LogOut } from 'lucide-react';
import { playPopSound } from '../../utils/audioUtils';

const StoriesCard = ({ childProfile, onBack, onLogActivity }) => {
    const [theme, setTheme] = useState(null);
    const [story, setStory] = useState('');
    const [loading, setLoading] = useState(false);
    const [isReading, setIsReading] = useState(false);
    const [error, setError] = useState(null);
    const [storyImage, setStoryImage] = useState(null);

    const categories = [
        { id: 'Space', icon: '🌌', label: 'Space', color: 'bg-indigo-900', text: 'text-white' },
        { id: 'Dinosaurs', icon: '🦖', label: 'Dinos', color: 'bg-green-600', text: 'text-white' },
        { id: 'Princesses', icon: '👑', label: 'Princesses', color: 'bg-pink-400', text: 'text-white' },
        { id: 'Superheroes', icon: '🦸', label: 'Superheroes', color: 'bg-red-500', text: 'text-white' },
    ];

    useEffect(() => {
        // Cleanup on unmount
        return () => window.speechSynthesis.cancel();
    }, []);

    const speak = (text) => {
        window.speechSynthesis.cancel();
        if (!text) return;

        const utterance = new SpeechSynthesisUtterance(text);
        const voices = window.speechSynthesis.getVoices();
        const preferredVoice = voices.find(v => v.name.includes('Google US English')) || voices[0];

        utterance.voice = preferredVoice;
        utterance.rate = 0.9;
        utterance.pitch = 1.1;

        utterance.onend = () => setIsReading(false);
        utterance.onerror = () => setIsReading(false);

        window.speechSynthesis.speak(utterance);
        setIsReading(true);
    };

    const stopReading = () => {
        window.speechSynthesis.cancel();
        setIsReading(false);
    };

    const handleGenerate = async (selectedTheme) => {
        setTheme(selectedTheme);
        setLoading(true);
        setStory('');
        setError(null);
        stopReading();
        setStoryImage(null); // Reset image initially

        // Set Image based on Theme
        if (selectedTheme === 'Dinosaurs') {
            const dinoImages = [
                '/assets/images/stories/dino1.jpg',
                '/assets/images/stories/dino2.jpg',
                '/assets/images/stories/dino3.jpg'
            ];
            const randomImage = dinoImages[Math.floor(Math.random() * dinoImages.length)];
            setStoryImage(randomImage);
        } else if (selectedTheme === 'Space') {
            const spaceImages = [
                '/assets/images/stories/space1.jpg',
                '/assets/images/stories/space2.jpg',
                '/assets/images/stories/space3.jpg'
            ];
            const randomImage = spaceImages[Math.floor(Math.random() * spaceImages.length)];
            setStoryImage(randomImage);
        } else if (selectedTheme === 'Princesses') {
            const princessImages = [
                '/assets/images/stories/princess1.jpg',
                '/assets/images/stories/princess2.jpg',
                '/assets/images/stories/princess3.jpg'
            ];
            const randomImage = princessImages[Math.floor(Math.random() * princessImages.length)];
            setStoryImage(randomImage);
        } else if (selectedTheme === 'Superheroes') {
            const superheroImages = [
                '/assets/images/stories/superhero1.jpg',
                '/assets/images/stories/superhero2.jpg',
                '/assets/images/stories/superhero3.jpg'
            ];
            const randomImage = superheroImages[Math.floor(Math.random() * superheroImages.length)];
            setStoryImage(randomImage);
        }

        try {
            // SAFE ID FALLBACK: Ensure we send a valid-looking 24-char hex ID if the profile is missing one
            // This prevents backend CastErrors (500)
            const safeId = childProfile._id || "000000000000000000000000";

            // SYSTEM PROMPT INJECTION + UNIQUENESS
            // Adding a timestamp to ensure the prompt is cryptographically unique to the AI's caching layer
            const systemPrompt = `(System: You are Professor Owl telling a fun, safe, original story to a ${childProfile.age}-year-old child named ${childProfile.name}. The story must be different every time. No violence, no fear, no personal data. Minimum 5 short paragraphs.)`;

            // We append a random seed to the prompt to force creativity
            const uniqueRequest = `Write a story about ${selectedTheme}. Random Seed: ${Date.now()}. ${systemPrompt}`;

            const res = await fetch(`${API_BASE_URL}/api/story`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    childId: safeId,
                    theme: uniqueRequest
                })
            });

            if (!res.ok) {
                // If 500 or 429, throw specific error to be caught below
                throw new Error(`Server status: ${res.status}`);
            }

            const data = await res.json();

            if (!data.story) {
                throw new Error("Empty story received");
            }

            setStory(data.story);
            speak(data.story);

            if (onLogActivity) {
                onLogActivity('story', `Created a ${selectedTheme} story`, `Theme: ${selectedTheme}`);
            }

        } catch (err) {
            console.error("Story Error:", err);
            // USER-FRIENDLY ERROR MESSAGE
            setError("Professor Owl is thinking... let’s try again!");
            // Optional: Speak the friendly error
            speak("Hoot! I am thinking super hard. Can you click again?");
        } finally {
            setLoading(false);
        }
    };

    const togglePlayback = () => {
        if (isReading) {
            window.speechSynthesis.pause();
            setIsReading(false);
        } else {
            if (window.speechSynthesis.paused) {
                window.speechSynthesis.resume();
                setIsReading(true);
            } else {
                speak(story);
            }
        }
    };

    return (
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border-4 border-pink-300 flex flex-col h-[70vh] relative">
            {/* Header */}
            <div className="bg-pink-300 p-4 flex items-center gap-3 shadow-md z-10">
                {/* Internal Back Button to Categories if Story is showing? */}
                {story && (
                    <button
                        onClick={() => { setStory(''); setTheme(null); stopReading(); }}
                        className="p-2 bg-white/30 hover:bg-white/50 rounded-full transition text-pink-900 mr-2"
                    >
                        <ArrowLeft size={32} />
                    </button>
                )}

                <div className="text-4xl">📚</div>
                <div className="flex-1">
                    <h3 className="font-comic font-bold text-2xl text-pink-900">Story Time</h3>
                </div>
                <button
                    onClick={onBack}
                    className="bg-red-400 text-white p-2 px-4 rounded-xl font-bold hover:bg-red-500 transition-transform transform active:scale-95 shadow-lg flex items-center gap-2 border-2 border-red-300"
                >
                    <LogOut size={20} />
                    Exit
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 bg-pink-50">
                {/* CATEGORY SELECTION (Only show if no story is active/loading) */}
                {!story && !loading && !error && (
                    <div className="h-full flex flex-col items-center justify-center gap-8 animate-fade-in">
                        <h2 className="text-3xl font-bold text-pink-800 text-center animate-bounce-slow">Pick a Magic World!</h2>
                        <div className="grid grid-cols-2 gap-6 w-full max-w-lg">
                            {categories.map((cat) => (
                                <button
                                    key={cat.id}
                                    onClick={() => {
                                        playPopSound();
                                        handleGenerate(cat.id);
                                    }}
                                    className={`${cat.color} ${cat.text} p-6 rounded-3xl shadow-lg transform hover:scale-105 transition-all flex flex-col items-center gap-2 border-4 border-white/20`}
                                >
                                    <span className="text-6xl filter drop-shadow-md">{cat.icon}</span>
                                    <span className="text-2xl font-black tracking-wider">{cat.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* LOADING STATE */}
                {loading && (
                    <div className="h-full flex flex-col items-center justify-center gap-6">
                        <div className="text-8xl animate-spin">✨</div>
                        <h2 className="text-3xl font-bold text-pink-600 animate-pulse">Professor Owl is writing...</h2>
                    </div>
                )}

                {/* ERROR STATE */}
                {error && (
                    <div className="h-full flex flex-col items-center justify-center gap-6 text-center px-8">
                        <div className="text-8xl grayscale opacity-50">🦉</div>
                        <h2 className="text-2xl font-bold text-pink-600">{error}</h2>
                        <button
                            onClick={() => { setError(null); setTheme(null); }}
                            className="bg-pink-500 text-white px-8 py-4 rounded-full text-xl font-bold shadow-lg hover:bg-pink-600 transition"
                        >
                            Try Again
                        </button>
                    </div>
                )}

                {/* STORY DISPLAY */}
                {story && !loading && (
                    <div className="max-w-3xl mx-auto space-y-6 pt-4 animate-slide-up">

                        {/* THEME IMAGE (If available) */}
                        {storyImage && (
                            <div className="flex justify-center mb-6">
                                <img
                                    src={storyImage}
                                    alt="Story Theme"
                                    className="rounded-3xl shadow-2xl border-4 border-white max-h-64 object-cover animate-fade-in"
                                />
                            </div>
                        )}

                        <div className="bg-white/80 p-8 rounded-3xl shadow-lg border-2 border-pink-100 text-2xl leading-relaxed text-gray-800 font-serif">
                            {story}
                        </div>

                        {/* CONTROLS */}
                        <div className="flex flex-wrap items-center justify-center gap-4">
                            <button
                                onClick={() => {
                                    playPopSound();
                                    togglePlayback();
                                }}
                                className="bg-purple-500 text-white p-4 rounded-full shadow-lg hover:bg-purple-600 transition-all transform hover:scale-105 flex items-center gap-2 text-xl font-bold px-8 min-w-[160px] justify-center"
                            >
                                {isReading ? <Pause size={32} /> : <Play size={32} />}
                                {isReading ? "Pause" : "Read"}
                            </button>

                            {isReading && (
                                <button
                                    onClick={stopReading}
                                    className="bg-red-400 text-white p-4 rounded-full shadow-lg hover:bg-red-500 transition-all flex items-center gap-2 text-xl font-bold px-6"
                                >
                                    Stop 🔇
                                </button>
                            )}

                            <button
                                onClick={() => { setStory(''); setTheme(null); stopReading(); setStoryImage(null); }}
                                className="bg-gray-200 text-gray-700 p-4 rounded-full shadow-lg hover:bg-gray-300 transition-all text-xl font-bold px-8 flex items-center gap-2"
                            >
                                <RefreshCw />
                                New Story
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StoriesCard;
