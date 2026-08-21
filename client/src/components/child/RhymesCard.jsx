import React, { useState, useRef } from 'react';
import { Play, Pause, Music, LogOut } from 'lucide-react';
import { playPopSound } from '../../utils/audioUtils';

const RhymesCard = ({ onBack, onLogActivity }) => {
    // Mock Audio Data
    const rhymes = [
        { id: 1, title: 'Twinkle Twinkle', icon: '✨', src: '/audio/twinkle twinkle little star.mp3' },
        { id: 2, title: 'Johny-Johny-Yes-Papa', icon: '👶', src: '/audio/johny johny yes papa.mp3' },
        { id: 3, title: 'Baby Shark', icon: '🦈', src: '/audio/baby-shark.mp3' },
    ];

    const [playing, setPlaying] = useState(null); // id
    const audioRef = useRef(new Audio());

    const togglePlay = (rhyme) => {
        if (playing === rhyme.id) {
            audioRef.current.pause();
            setPlaying(null);
        } else {
            audioRef.current.src = rhyme.src;
            audioRef.current.play();
            setPlaying(rhyme.id);
        }
    };

    // Cleanup
    React.useEffect(() => {
        const audio = audioRef.current;
        return () => audio.pause();
    }, []);

    return (
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border-4 border-orange-300 flex flex-col h-[70vh]">
            <div className="bg-orange-300 p-4 flex items-center gap-3">
                <div className="text-4xl">🎵</div>
                <div className="flex-1">
                    <h3 className="font-comic font-bold text-2xl text-orange-900">Nursery Rhymes</h3>
                </div>
                <button
                    onClick={onBack}
                    className="bg-red-400 text-white p-2 px-4 rounded-xl font-bold hover:bg-red-500 transition-transform transform active:scale-95 shadow-lg flex items-center gap-2 border-2 border-red-300"
                >
                    <LogOut size={20} />
                    Exit
                </button>
            </div>

            <div className="flex-1 p-6 bg-orange-50 overflow-y-auto space-y-4">
                {rhymes.map(r => (
                    <div
                        key={r.id}
                        className={`p-4 rounded-2xl flex items-center gap-4 shadow-md transition-all ${playing === r.id ? 'bg-orange-200 scale-105 border-2 border-orange-400' : 'bg-white hover:bg-orange-100'
                            }`}
                    >
                        <div className="text-4xl">{r.icon}</div>
                        <div className="flex-1">
                            <h4 className="text-xl font-bold text-gray-800">{r.title}</h4>
                            {playing === r.id && <div className="text-orange-600 text-sm animate-pulse">Now Playing... 🎵</div>}
                        </div>
                        <button
                            onClick={() => {
                                playPopSound();
                                togglePlay(r);
                                if (playing !== r.id && onLogActivity) {
                                    onLogActivity('rhyme', `Listening to ${r.title}`, `Started listening to the ${r.title} nursery rhyme.`);
                                }
                            }}
                            className="w-14 h-14 rounded-full bg-orange-500 text-white flex items-center justify-center hover:bg-orange-600 shadow-lg"
                        >
                            {playing === r.id ? <Pause fill="white" /> : <Play fill="white" className="ml-1" />}
                        </button>
                    </div>
                ))}

                {/* Simple Visualizer Mock */}
                {playing && (
                    <div className="mt-8 flex justify-center items-end gap-2 h-24">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                            <div
                                key={i}
                                className="w-4 bg-orange-500 rounded-t-full animate-bounce"
                                style={{
                                    height: '60%',
                                    animationDuration: `${Math.random() * 0.5 + 0.3}s`
                                }}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default RhymesCard;
