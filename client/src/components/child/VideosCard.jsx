import React, { useState } from 'react';
import { Play, LogOut } from 'lucide-react';
import { playPopSound } from '../../utils/audioUtils';

const VideosCard = ({ onBack, onLogActivity }) => {
    // Mock Video Data (using sample MP4s if available or placeholders)
    // Using sample reliable video URLs for demo (e.g., standard testing videos or color placeholders)
    const videos = [
        { id: 1, title: 'Learn Colors', thumb: '🎨', url: '/video/learn colour.mp4' },
        { id: 2, title: 'Counting 1-10', thumb: '🔢', url: 'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4' },
        { id: 3, title: 'Animal Sounds', thumb: '🐮', url: '/video/animal sound.mp4' },
        { id: 4, title: 'Space Trip', thumb: '🚀', url: 'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4' },
    ];

    const [activeVideo, setActiveVideo] = useState(null);

    return (
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border-4 border-purple-300 flex flex-col h-[70vh]">
            <div className="bg-purple-300 p-4 flex items-center gap-3">
                <div className="text-4xl">🎬</div>
                <div className="flex-1">
                    <h3 className="font-comic font-bold text-2xl text-purple-900">Fun Videos</h3>
                </div>
                <button
                    onClick={onBack}
                    className="bg-red-400 text-white p-2 px-4 rounded-xl font-bold hover:bg-red-500 transition-transform transform active:scale-95 shadow-lg flex items-center gap-2 border-2 border-red-300"
                >
                    <LogOut size={20} />
                    Exit
                </button>
            </div>

            <div className="flex-1 p-4 bg-purple-50 overflow-y-auto">
                {activeVideo ? (
                    <div className="flex flex-col h-full">
                        <div className="bg-black rounded-xl overflow-hidden shadow-2xl flex-1 relative">
                            {activeVideo.url.includes('youtube.com') ? (
                                <iframe
                                    src={activeVideo.url}
                                    title={activeVideo.title}
                                    className="w-full h-full"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                />
                            ) : (
                                <video
                                    src={activeVideo.url}
                                    controls
                                    autoPlay
                                    className="w-full h-full object-contain"
                                />
                            )}
                            <button
                                onClick={() => setActiveVideo(null)}
                                className="absolute top-4 left-4 bg-white/20 hover:bg-white/40 text-white p-2 rounded-full backdrop-blur"
                            >
                                Close ✖
                            </button>
                        </div>
                        <h2 className="text-2xl font-bold text-center mt-4 text-purple-800">{activeVideo.title}</h2>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {videos.map(v => (
                            <button
                                key={v.id}
                                onClick={() => {
                                    playPopSound();
                                    setActiveVideo(v);
                                    if (onLogActivity) {
                                        onLogActivity('video', `Watching ${v.title}`, `Started watching the ${v.title} video.`);
                                    }
                                }}
                                className="bg-white p-4 rounded-3xl shadow-lg hover:shadow-2xl transition hover:scale-105 group"
                            >
                                <div className="aspect-video bg-gray-200 rounded-2xl mb-4 flex items-center justify-center text-6xl group-hover:bg-purple-100 transition relative">
                                    {v.thumb}
                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition bg-black/20 rounded-2xl">
                                        <Play className="text-white w-16 h-16 fill-current" />
                                    </div>
                                </div>
                                <h4 className="text-xl font-bold text-gray-700">{v.title}</h4>
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default VideosCard;
