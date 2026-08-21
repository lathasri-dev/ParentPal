import React from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Baby, Sparkles } from 'lucide-react';

const Landing = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 flex flex-col items-center justify-center p-6">
            <div className="text-center mb-12">
                <div className="flex items-center justify-center gap-3 mb-4">
                    <Sparkles className="w-10 h-10 text-indigo-600" />
                    <h1 className="text-5xl font-extrabold text-indigo-900 tracking-tight">ParentPal</h1>
                </div>
                <p className="text-xl text-gray-600 max-w-lg mx-auto">
                    Your AI-powered companion for parenting insights and magical storytelling.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl w-full">
                {/* Parent Mode Card */}
                <button
                    onClick={() => navigate('/parent')}
                    className="group relative bg-white rounded-3xl shadow-xl p-8 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 text-left border-2 border-transparent hover:border-indigo-200"
                >
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <User className="w-32 h-32 text-indigo-600" />
                    </div>
                    <div className="bg-indigo-100 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 font-bold text-indigo-600">
                        <User className="w-8 h-8" />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-800 mb-2">Parent Mode</h2>
                    <p className="text-gray-500 text-lg">
                        Access developmental insights, generate activities, and manage profiles.
                    </p>
                    <div className="mt-8 flex items-center text-indigo-600 font-semibold group-hover:gap-2 transition-all">
                        Enter Dashboard <span>→</span>
                    </div>
                </button>

                {/* Child Mode Card */}
                <button
                    onClick={() => navigate('/child-login')}
                    className="group relative bg-white rounded-3xl shadow-xl p-8 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 text-left border-2 border-transparent hover:border-pink-200"
                >
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Baby className="w-32 h-32 text-pink-500" />
                    </div>
                    <div className="bg-pink-100 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 text-pink-500">
                        <Baby className="w-8 h-8" />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-800 mb-2">Child Mode</h2>
                    <p className="text-gray-500 text-lg">
                        A safe, magical place for stories, chatting with Professor Owl, and learning.
                    </p>
                    <div className="mt-8 flex items-center text-pink-500 font-semibold group-hover:gap-2 transition-all">
                        Start Playing <span>→</span>
                    </div>
                </button>
            </div>

            <div className="mt-12 text-gray-400 text-sm">
                Powered by Google Gemini • RAG Architecture
            </div>
        </div>
    );
};

export default Landing;
