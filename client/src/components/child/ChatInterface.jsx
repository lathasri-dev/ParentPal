import React, { useState, useRef, useEffect } from 'react';
import { API_BASE_URL } from '../../config';
import { Send, Mic } from 'lucide-react';

const ChatInterface = ({ childProfile }) => {
    const [messages, setMessages] = useState([
        { sender: 'owl', text: `Hoot hoot! Hello ${childProfile.name}! I'm Professor Owl. Ask me anything!` }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages]);

    const speak = (text) => {
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(text);
            // Try to find a friendly voice
            const voices = window.speechSynthesis.getVoices();
            const preferredVoice = voices.find(v => v.name.includes('Google US English')) || voices[0];
            utterance.voice = preferredVoice;
            utterance.pitch = 1.2; // Slightly higher pitch for friendliness
            utterance.rate = 0.9;
            window.speechSynthesis.speak(utterance);
        }
    };

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMsg = input;
        setMessages(prev => [...prev, { sender: 'me', text: userMsg }]);
        setInput('');
        setLoading(true);

        try {
            const res = await fetch(`${API_BASE_URL}/api/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: userMsg, age: childProfile.age })
            });
            const data = await res.json();

            const owlReply = data.reply || "Hoot! I didn't verify that. Can you say it again?";
            setMessages(prev => [...prev, { sender: 'owl', text: owlReply }]);
            speak(owlReply);

        } catch (error) {
            setMessages(prev => [...prev, { sender: 'owl', text: "Opps, my feathers are ruffled! (Network Error)" }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border-4 border-yellow-300 flex flex-col h-[500px]">
            {/* Header */}
            <div className="bg-yellow-300 p-4 flex items-center gap-3">
                <div className="text-4xl">🦉</div>
                <div>
                    <h3 className="font-comic font-bold text-2xl text-yellow-900">Professor Owl</h3>
                    <p className="text-yellow-800 text-sm">Always kind & safe</p>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-sky-50">
                {messages.map((msg, i) => (
                    <div key={i} className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] rounded-2xl p-4 text-lg ${msg.sender === 'me'
                                ? 'bg-blue-500 text-white rounded-tr-none'
                                : 'bg-white border-2 border-gray-200 text-gray-800 rounded-tl-none shadow-sm'
                            }`}>
                            {msg.text}
                        </div>
                    </div>
                ))}
                {loading && <div className="text-center text-gray-400 animate-pulse">Professor Owl is thinking... 🦉</div>}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSend} className="p-4 bg-white border-t border-gray-100 flex gap-2">
                <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Type here..."
                    className="flex-1 text-lg p-4 rounded-full border-2 border-gray-200 focus:border-yellow-400 focus:outline-none bg-gray-50"
                />
                <button
                    type="submit"
                    disabled={loading}
                    className="bg-green-500 hover:bg-green-600 text-white p-4 rounded-full transition-all transform hover:scale-105 shadow-md flex items-center justify-center"
                >
                    <Send className="w-6 h-6" />
                </button>
            </form>
        </div>
    );
};

export default ChatInterface;
