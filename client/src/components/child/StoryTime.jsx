import React, { useState } from 'react';
import { API_BASE_URL } from '../../config';
import { BookOpen, Play, Pause, Sparkles, RefreshCcw } from 'lucide-react';

const StoryTime = ({ childProfile }) => {
    const [theme, setTheme] = useState('');
    const [story, setStory] = useState('');
    const [loading, setLoading] = useState(false);
    const [isReading, setIsReading] = useState(false);

    const handleGenerate = async () => {
        if (!theme) return;
        setLoading(true);
        setStory('');
        setIsReading(false);
        window.speechSynthesis.cancel();

        try {
            const res = await fetch(`${API_BASE_URL}/api/story`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ childId: childProfile._id, theme })
            });
            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || `Server Error: ${res.status}`);
            }
            const data = await res.json();
            setStory(data.story);
        } catch (err) {
            console.error(err);
            alert(`Story Error: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    const toggleRead = () => {
        if (isReading) {
            window.speechSynthesis.pause();
            setIsReading(false);
        } else {
            if (window.speechSynthesis.paused) {
                window.speechSynthesis.resume();
            } else {
                const utterance = new SpeechSynthesisUtterance(story);
                utterance.rate = 0.85;
                // utterance.pitch = 1.1;
                utterance.onend = () => setIsReading(false);
                window.speechSynthesis.speak(utterance);
            }
            setIsReading(true);
        }
    };

    return (
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border-4 border-pink-300 flex flex-col relative h-[500px]">

            <div className="bg-pink-300 p-4 flex items-center gap-3">
                <span className="text-4xl">📚</span>
                <h3 className="font-comic font-bold text-2xl text-pink-900">Magic Story Time</h3>
            </div>

            <div className="p-6 flex-1 overflow-y-auto">
                {!story ? (
                    <div className="text-center space-y-6 mt-8">
                        <p className="text-gray-500 text-xl font-comic">What should the story be about?</p>
                        <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto">
                            {['Space', 'Dinosaurs', 'Princesses', 'Superheroes'].map(t => (
                                <button
                                    key={t}
                                    onClick={() => setTheme(t)}
                                    className={`p-4 rounded-xl font-bold text-lg transition-all ${theme === t ? 'bg-pink-500 text-white scale-105 shadow-lg' : 'bg-pink-50 text-pink-600 hover:bg-pink-100'
                                        }`}
                                >
                                    {t}
                                </button>
                            ))}
                        </div>
                        {theme && (
                            <button
                                onClick={handleGenerate}
                                disabled={loading}
                                className="w-full max-w-sm bg-gradient-to-r from-purple-500 to-pink-500 text-white py-4 rounded-full font-bold text-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all flex items-center justify-center gap-2"
                            >
                                {loading ? <RefreshCcw className="animate-spin" /> : <Sparkles />}
                                {loading ? 'Writing Magic...' : 'Create Story!'}
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="space-y-6">
                        <div className="bg-pink-50 p-6 rounded-2xl text-lg leading-relaxed font-serif text-gray-800 border-2 border-pink-100 max-h-[300px] overflow-y-auto">
                            {story}
                        </div>

                        <div className="flex gap-4 justify-center">
                            <button
                                onClick={toggleRead}
                                className="flex items-center gap-2 px-8 py-3 bg-purple-600 text-white rounded-full font-bold text-lg hover:bg-purple-700 transition shadow-lg"
                            >
                                {isReading ? <Pause /> : <Play />}
                                {isReading ? 'Pause' : 'Read to Me'}
                            </button>
                            <button
                                onClick={() => { setStory(''); setIsReading(false); window.speechSynthesis.cancel(); }}
                                className="flex items-center gap-2 px-6 py-3 bg-gray-200 text-gray-700 rounded-full font-bold text-lg hover:bg-gray-300 transition"
                            >
                                New Story
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StoryTime;
