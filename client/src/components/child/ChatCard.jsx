import React, { useState, useEffect, useRef } from 'react';
import { API_BASE_URL } from '../../config';
import { Send, Mic, MicOff, Volume2, StopCircle, LogOut } from 'lucide-react';

const ChatCard = ({ childProfile, onBack, onLogActivity }) => {
    const [messages, setMessages] = useState([
        { sender: 'owl', text: `Hoot hoot! Hello ${childProfile.name}! I'm Professor Owl. Ask me anything!` }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const messagesEndRef = useRef(null);

    // Speech Recognition Setup
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = SpeechRecognition ? new SpeechRecognition() : null;

    if (recognition) {
        recognition.continuous = false;
        recognition.lang = 'en-US';
        recognition.interimResults = false;
    }

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages]);

    const speak = (text) => {
        window.speechSynthesis.cancel();
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(text);
            // Try to find a friendly voice
            const voices = window.speechSynthesis.getVoices();
            const preferredVoice = voices.find(v => v.name.includes('Google US English')) || voices[0];
            utterance.voice = preferredVoice;
            utterance.pitch = 1.3; // Higher pitch for friendly owl
            utterance.rate = 0.9;
            window.speechSynthesis.speak(utterance);
        }
    };

    const handleSend = async (textToSend) => {
        if (!textToSend.trim()) return;

        const userMsg = textToSend;
        setMessages(prev => [...prev, { sender: 'me', text: userMsg }]);
        setInput('');
        setLoading(true);

        try {
            // Using existing API structure, but we might need to adjust the backend prompt if it's strictly set there.
            // Ideally, we pass "childMode: true" or similar to enforce the prompt.
            // For now, relying on the 'age' param to trigger child logic if the backend is smart enough, 
            // OR we'll assume the prompt engineering is handled by the "Professor Owl" context injection I will add to the body if possible.
            // Given constraints "Reuse existing Gemini APIs", I will send the prompt context in the message or hope the backend handles it.
            // Wait, the prompt requirements said: "Whenever Gemini is called in Child Mode, apply this system instruction..."
            // If I can't change backend, I have to prepend the system instruction to the message content sent to the API.

            const systemPrompt = `(System: You are Professor Owl, a friendly AI for a ${childProfile.age} year old. Simple, happy language. No fear/violence. Short response.)`;
            const fullPayload = `${systemPrompt} User says: ${userMsg}`;

            const res = await fetch(`${API_BASE_URL}/api/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: fullPayload, age: childProfile.age })
            });
            const data = await res.json();

            // The backend likely returns 'reply'
            const owlReply = data.reply || "Hoot! I heard you, but I'm sleepy. Say that again?";
            setMessages(prev => [...prev, { sender: 'owl', text: owlReply }]);
            speak(owlReply);

            if (onLogActivity) {
                onLogActivity('chat', 'Chatted with Professor Owl', `Child: "${userMsg}" | Owl: "${owlReply}"`);
            }

        } catch (error) {
            setMessages(prev => [...prev, { sender: 'owl', text: "Opps, connection flew away! 🍃" }]);
        } finally {
            setLoading(false);
        }
    };

    const toggleListening = () => {
        if (!recognition) {
            alert("Your browser doesn't support speech recognition.");
            return;
        }

        if (isListening) {
            recognition.stop();
            setIsListening(false);
        } else {
            recognition.start();
            setIsListening(true);
            recognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                setInput(transcript);
                handleSend(transcript); // Auto-send on voice
                setIsListening(false);
            };
            recognition.onerror = (event) => {
                console.error("Speech error", event.error);
                setIsListening(false);
            };
            recognition.onend = () => setIsListening(false);
        }
    };

    return (
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border-4 border-yellow-300 flex flex-col h-[70vh]">
            {/* Header */}
            <div className="bg-yellow-300 p-4 flex items-center gap-3 shadow-md">
                <div className="text-4xl">🦉</div>
                <div className="flex-1">
                    <h3 className="font-comic font-bold text-2xl text-yellow-900">Chat with Professor Owl</h3>
                </div>
                <button
                    onClick={onBack}
                    className="bg-red-400 text-white p-2 px-4 rounded-xl font-bold hover:bg-red-500 transition-transform transform active:scale-95 shadow-lg flex items-center gap-2 border-2 border-red-300"
                >
                    <LogOut size={20} />
                    Exit
                </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-sky-50">
                {messages.map((msg, i) => (
                    <div key={i} className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] rounded-3xl p-4 text-xl font-medium ${msg.sender === 'me'
                            ? 'bg-blue-400 text-white rounded-tr-none shadow-lg'
                            : 'bg-white border-2 border-yellow-200 text-gray-800 rounded-tl-none shadow-md'
                            }`}>
                            {msg.text}
                        </div>
                    </div>
                ))}
                {loading && (
                    <div className="flex justify-start">
                        <div className="bg-white border-2 border-yellow-200 rounded-3xl rounded-tl-none p-4 shadow-md">
                            <span className="animate-pulse text-2xl">🦉 Playing...</span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Controls */}
            <div className="p-4 bg-white border-t border-gray-100 grid grid-cols-[1fr,auto] gap-3 items-center">
                <form onSubmit={(e) => { e.preventDefault(); handleSend(input); }} className="relative">
                    <input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Say something..."
                        className="w-full text-xl p-5 pl-6 pr-14 rounded-full border-4 border-gray-200 focus:border-yellow-400 focus:outline-none bg-gray-50 transition-all"
                    />
                    <button
                        type="submit"
                        disabled={loading || !input.trim()}
                        className="absolute right-2 top-2 bottom-2 bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-full transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Send size={24} />
                    </button>
                </form>

                {/* Voice Button */}
                <button
                    onClick={toggleListening}
                    className={`p-5 rounded-full shadow-lg transition-all transform hover:scale-105 active:scale-95 ${isListening ? 'bg-red-500 animate-pulse text-white' : 'bg-yellow-400 text-yellow-900 hover:bg-yellow-500'
                        }`}
                >
                    {isListening ? <MicOff size={32} /> : <Mic size={32} />}
                </button>
            </div>
        </div>
    );
};

export default ChatCard;
