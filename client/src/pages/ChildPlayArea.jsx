import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config';
import { MessageCircle, BookOpen, Gamepad2, GraduationCap, Video, Music, ArrowLeft, LogOut } from 'lucide-react';
import ChatCard from '../components/child/ChatCard';
import StoriesCard from '../components/child/StoriesCard';
import GamesCard from '../components/child/GamesCard';
import LearnCard from '../components/child/LearnCard';
import VideosCard from '../components/child/VideosCard';
import RhymesCard from '../components/child/RhymesCard';
import PaintingPanel from '../components/child/PaintingPanel';
import { Palette } from 'lucide-react';

const ChildPlayArea = () => {
    const navigate = useNavigate();
    // STATE: "entry" | "dashboard" | "feature"
    // But we can derive this:
    // !childData => Entry
    // childData && !activeFeature => Dashboard
    // childData && activeFeature => Feature

    const [childData, setChildData] = useState(() => {
        // Try to recover from session
        const saved = sessionStorage.getItem('childModeData');
        return saved ? JSON.parse(saved) : null;
    });

    const [activeFeature, setActiveFeature] = useState(null);
    const [profiles, setProfiles] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProfiles();
    }, []);

    const fetchProfiles = async () => {
        try {
            setLoading(true);
            const res = await fetch(`${API_BASE_URL}/api/profiles`);
            if (res.ok) {
                const data = await res.json();
                setProfiles(data);
            }
        } catch (err) {
            console.error("Error fetching profiles:", err);
        } finally {
            setLoading(false);
        }
    };

    const logActivity = async (type, activityName, details = "") => {
        const currentData = JSON.parse(sessionStorage.getItem('childModeData'));
        if (!currentData || !currentData._id) return;

        try {
            await fetch(`${API_BASE_URL}/api/activity`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    childId: currentData._id,
                    type,
                    activityName,
                    details
                })
            });
        } catch (error) {
            console.error("Failed to log activity:", error);
        }
    };

    const handleSelectProfile = (profile) => {
        const data = {
            name: profile.name,
            age: profile.age,
            _id: profile._id
        };

        setChildData(data);
        sessionStorage.setItem('childModeData', JSON.stringify(data));
        logActivity('system', 'Session Started', `Child logged in to their profile.`);
    };

    const handleExit = () => {
        // Stop all sound
        window.speechSynthesis.cancel();

        // Clear session data so next time we start fresh
        sessionStorage.removeItem('childModeData');

        // Force navigation to Landing Page
        // Using window.location.href ensures a full reset and avoids any router state issues
        window.location.href = '/';
    };

    const features = [
        { id: 'chat', label: 'Chat', icon: <MessageCircle size={48} />, color: 'bg-yellow-300', text: 'text-yellow-800' },
        { id: 'stories', label: 'Stories', icon: <BookOpen size={48} />, color: 'bg-pink-300', text: 'text-pink-800' },
        { id: 'games', label: 'Games', icon: <Gamepad2 size={48} />, color: 'bg-green-300', text: 'text-green-800' },
        { id: 'learn', label: 'Learn', icon: <GraduationCap size={48} />, color: 'bg-blue-300', text: 'text-blue-800' },
        { id: 'videos', label: 'Videos', icon: <Video size={48} />, color: 'bg-purple-300', text: 'text-purple-800' },
        { id: 'rhymes', label: 'Rhymes', icon: <Music size={48} />, color: 'bg-orange-300', text: 'text-orange-800' },
        { id: 'paint', label: 'Paint', icon: <Palette size={48} />, color: 'bg-yellow-300', text: 'text-yellow-800' },
    ];

    // RENDER: Entry Screen
    if (!childData) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-sky-300 to-green-300 flex items-center justify-center p-4 font-comic relative">
                <button
                    onClick={() => window.location.href = '/'}
                    className="absolute top-4 right-4 bg-white/50 hover:bg-white/80 p-3 rounded-full text-indigo-700 transition-colors"
                >
                    <LogOut size={28} />
                </button>

                <div className="bg-white/90 backdrop-blur rounded-[3rem] p-10 shadow-2xl text-center max-w-2xl w-full border-4 border-indigo-200 animate-fade-in-up">
                    <div className="text-8xl mb-6 animate-bounce-slow">🦉</div>
                    <h1 className="text-4xl font-bold text-indigo-700 mb-2">Welcome to ParentPal!</h1>

                    {loading ? (
                        <div className="py-12 flex flex-col items-center gap-4">
                            <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                            <p className="text-xl text-indigo-500 font-bold">Looking for your profile...</p>
                        </div>
                    ) : profiles.length === 0 ? (
                        <div className="py-8 space-y-6">
                            <div className="bg-orange-100 p-6 rounded-2xl border-2 border-orange-200">
                                <p className="text-2xl text-orange-700 font-bold mb-2">Whoops! 😮</p>
                                <p className="text-lg text-orange-600">
                                    No profiles found. Please ask your parent to set up your profile in <span className="font-extrabold underline">Parent Mode</span> first.
                                </p>
                            </div>
                            <button
                                onClick={() => window.location.href = '/'}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-full font-bold text-xl shadow-lg transition-transform active:scale-95"
                            >
                                Go Back
                            </button>
                        </div>
                    ) : (
                        <div className="py-6">
                            <p className="text-xl text-indigo-500 mb-8">Who is playing today? ✨</p>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                                {profiles.map(profile => (
                                    <button
                                        key={profile._id}
                                        onClick={() => handleSelectProfile(profile)}
                                        className="flex flex-col items-center gap-3 group"
                                    >
                                        <div className="w-24 h-24 bg-gradient-to-tr from-pink-300 to-indigo-300 rounded-3xl flex items-center justify-center text-4xl text-white shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all border-4 border-white">
                                            {profile.name.charAt(0).toUpperCase()}
                                        </div>
                                        <span className="text-xl font-bold text-indigo-800 group-hover:text-indigo-600 truncate w-full">
                                            {profile.name}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // RENDER: Dashboard or Feature
    return (
        <div className="min-h-screen bg-sky-100 font-comic p-4 select-none">
            {/* Top Bar / Professor Owl */}
            <div className="flex items-center justify-between mb-8 bg-white/50 p-4 rounded-3xl backdrop-blur-sm shadow-sm sticky top-2 z-10">
                <div className="flex items-center gap-4 overflow-hidden">
                    <div className="w-16 h-16 bg-gradient-to-tr from-yellow-300 to-orange-300 rounded-full flex items-center justify-center text-4xl border-4 border-white shadow-lg animate-bounce-slow flex-shrink-0">
                        🦉
                    </div>
                    <div className="min-w-0">
                        {/* GREETING LOGIC */}
                        <h1 className="text-2xl font-bold text-indigo-900 truncate">Hi, {childData.name}! 👋</h1>
                        <p className="text-indigo-600 truncate text-sm sm:text-base">Let's learn and play together!</p>
                    </div>
                </div>

                <div className="flex gap-3">
                    {/* BACK BUTTON (Only if in feature) */}
                    {activeFeature && (
                        <button
                            onClick={() => {
                                window.speechSynthesis.cancel();
                                setActiveFeature(null);
                            }}
                            className="bg-blue-400 text-white p-3 px-4 rounded-2xl font-bold hover:bg-blue-500 transition-transform transform active:scale-95 shadow-lg flex items-center gap-2"
                        >
                            <ArrowLeft size={24} /> <span className="hidden sm:inline">Back</span>
                        </button>
                    )}

                    {/* EXIT BUTTON (Global) */}
                    <button
                        onClick={handleExit}
                        className="bg-red-400 text-white p-3 px-4 rounded-2xl font-bold hover:bg-red-500 transition-transform transform active:scale-95 shadow-lg flex items-center gap-2"
                    >
                        <LogOut size={24} /> <span className="hidden sm:inline">Exit</span>
                    </button>
                </div>
            </div>

            {/* CONTENT AREA */}
            {!activeFeature ? (
                <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in-up">
                    {features.map((feat) => (
                        <button
                            key={feat.id}
                            onClick={() => setActiveFeature(feat.id)}
                            className={`${feat.color} h-64 rounded-3xl shadow-xl hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 flex flex-col items-center justify-center gap-4 group border-4 border-white/30`}
                        >
                            <div className={`p-6 bg-white/40 rounded-full shadow-inner group-hover:scale-110 transition-transform ${feat.text}`}>
                                {feat.icon}
                            </div>
                            <span className={`text-3xl font-extrabold ${feat.text} tracking-wide`}>{feat.label}</span>
                        </button>
                    ))}
                </div>
            ) : (
                <div className="max-w-5xl mx-auto animate-fade-in">
                    {/* Pass handleExit/Back implicitly via onBack, but handleExit is global */}
                    {activeFeature === 'chat' && <ChatCard childProfile={childData} onBack={() => setActiveFeature(null)} onLogActivity={logActivity} />}
                    {activeFeature === 'stories' && <StoriesCard childProfile={childData} onBack={() => setActiveFeature(null)} onLogActivity={logActivity} />}
                    {activeFeature === 'games' && <GamesCard onBack={() => setActiveFeature(null)} onLogActivity={logActivity} />}
                    {activeFeature === 'learn' && <LearnCard onBack={() => setActiveFeature(null)} onLogActivity={logActivity} />}
                    {activeFeature === 'videos' && <VideosCard onBack={() => setActiveFeature(null)} onLogActivity={logActivity} />}
                    {activeFeature === 'rhymes' && <RhymesCard onBack={() => setActiveFeature(null)} onLogActivity={logActivity} />}
                    {activeFeature === 'paint' && (
                        <PaintingPanel
                            onBack={() => setActiveFeature(null)}
                            onLogActivity={logActivity}
                            template={[
                                {
                                    id: 'apple',
                                    type: 'side-by-side',
                                    image: '/assets/images/coloring/apple_template.png',
                                    outlineSide: 'right'
                                },
                                {
                                    id: 'banana',
                                    type: 'side-by-side',
                                    image: '/assets/images/coloring/banana_template.png',
                                    outlineSide: 'left'
                                },
                                {
                                    id: 'icecream',
                                    type: 'side-by-side',
                                    image: '/assets/images/coloring/icecream_template.png',
                                    outlineSide: 'right'
                                },
                                {
                                    id: 'orange',
                                    type: 'side-by-side',
                                    image: '/assets/images/coloring/orange_template.png',
                                    outlineSide: 'right'
                                }
                            ][Math.floor(Math.random() * 4)]}
                        />
                    )}
                </div>
            )}
        </div>
    );
};

export default ChildPlayArea;
