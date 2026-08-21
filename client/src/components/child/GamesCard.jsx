import React, { useState, useEffect } from 'react';
import { Puzzle, ArrowRight, RotateCcw, Check, X, Star, Trophy, Home, LogOut } from 'lucide-react';
import ReactConfetti from 'react-confetti';
import { playPopSound, playCorrectSound, playWrongSound, playWinSound } from '../../utils/audioUtils';

// --- Shared Components ---

const WinPopup = ({ onPlayAgain, onExit }) => {
    useEffect(() => {
        playWinSound();
    }, []);

    return (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in p-4 overflow-hidden">
            {/* Confetti Background */}
            <ReactConfetti width={window.innerWidth} height={window.innerHeight} />

            <div className="relative bg-white p-8 rounded-3xl shadow-2xl border-8 border-yellow-400 flex flex-col items-center animate-bounce-slow w-full max-w-sm z-10">
                <div className="flex gap-2 mb-4">
                    <Star className="w-12 h-12 text-yellow-400 fill-yellow-400 animate-spin-slow" />
                    <Trophy className="w-16 h-16 text-yellow-500 drop-shadow-md" />
                    <Star className="w-12 h-12 text-yellow-400 fill-yellow-400 animate-spin-slow" />
                </div>
                <h2 className="text-4xl font-black text-purple-600 mb-2 font-comic text-center tracking-wide">YOU WON!</h2>
                <p className="text-xl text-gray-500 font-bold mb-8 text-center">Great job, Superstar! 🌟</p>

                <div className="flex flex-col gap-3 w-full">
                    <button onClick={onPlayAgain} className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-2xl text-xl shadow-lg transform active:scale-95 transition-all flex items-center justify-center gap-2 border-b-4 border-green-700">
                        <RotateCcw /> Play Again
                    </button>
                    <button onClick={onExit} className="bg-red-400 hover:bg-red-500 text-white font-bold py-3 px-6 rounded-2xl text-xl shadow-lg transform active:scale-95 transition-all flex items-center justify-center gap-2 border-b-4 border-red-600">
                        <Home /> Exit Game
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- Sub-Game Components ---

const MemoryGame = ({ onExit, onWin }) => {
    const emojis = ['🐶', '🐱', '🐭', '🐹', '🐶', '🐱', '🐭', '🐹']; // 4 pairs

    const [cards, setCards] = useState([]);
    const [selected, setSelected] = useState(null);
    const [isWin, setIsWin] = useState(false);

    useEffect(() => {
        resetGame();
    }, []);

    const resetGame = () => {
        setCards(emojis.sort(() => Math.random() - 0.5).map((e, i) => ({ id: i, content: e, flipped: false, solved: false })));
        setSelected(null);
        setIsWin(false);
    };

    const handleCardClick = (card) => {
        if (card.flipped || card.solved || isWin) return;
        playPopSound();

        const newCards = cards.map(c => c.id === card.id ? { ...c, flipped: true } : c);
        setCards(newCards);

        if (!selected) {
            setSelected(card);
        } else {
            if (selected.content === card.content) {
                // Match!
                const updated = newCards.map(c => (c.id === card.id || c.id === selected.id) ? { ...c, solved: true, flipped: true } : c);
                setCards(updated);
                setSelected(null);

                if (updated.every(c => c.solved)) {
                    setIsWin(true);
                    if (onWin) onWin();
                } else {
                    playCorrectSound();
                }
            } else {
                // No match
                playWrongSound();
                setTimeout(() => {
                    setCards(prev => prev.map(c => (c.id === card.id || c.id === selected.id) ? { ...c, flipped: false } : c));
                    setSelected(null);
                }, 1000);
            }
        }
    };

    return (
        <div className="flex flex-col items-center justify-center h-full w-full relative">
            <h2 className="text-3xl font-bold mb-6 text-purple-600 font-comic">Find the Pairs!</h2>
            <div className="grid grid-cols-4 gap-3 sm:gap-4">
                {cards.map(card => (
                    <button
                        key={card.id}
                        onClick={() => handleCardClick(card)}
                        className={`w-16 h-20 sm:w-20 sm:h-24 rounded-xl text-4xl flex items-center justify-center transition-all transform duration-500 ${card.flipped || card.solved ? 'bg-white shadow-xl rotate-y-180 border-4 border-purple-200' : 'bg-purple-400 shadow-md border-4 border-white/50'
                            }`}
                        disabled={card.flipped || card.solved}
                    >
                        <span className={card.flipped || card.solved ? "block rotate-y-180" : "hidden"}>
                            {(card.flipped || card.solved) ? card.content : ''}
                        </span>
                        {!(card.flipped || card.solved) && <span className="opacity-50 text-white">?</span>}
                    </button>
                ))}
            </div>
            {isWin && <WinPopup onPlayAgain={resetGame} onExit={onExit} />}
        </div>
    );
};

const MathGame = ({ onExit, onWin }) => {
    const [score, setScore] = useState(0);
    const GOAL = 5;

    const generateQ = () => {
        const a = Math.floor(Math.random() * 5) + 1;
        const b = Math.floor(Math.random() * 5) + 1;
        return { a, b, ans: a + b };
    };
    const [q, setQ] = useState(generateQ());
    const [feedback, setFeedback] = useState(null);
    const [isWin, setIsWin] = useState(false);

    const resetGame = () => {
        setScore(0);
        setIsWin(false);
        setQ(generateQ());
        setFeedback(null);
    };

    const check = (val) => {
        if (isWin) return;
        playPopSound();
        if (val === q.ans) {
            setFeedback('correct');
            const newScore = score + 1;
            setScore(newScore);

            if (newScore >= GOAL) {
                setTimeout(() => {
                    setIsWin(true);
                    if (onWin) onWin();
                }, 500);
            } else {
                playCorrectSound();
                setTimeout(() => {
                    setFeedback(null);
                    setQ(generateQ());
                }, 1000);
            }
        } else {
            playWrongSound();
            setFeedback('wrong');
            setTimeout(() => setFeedback(null), 1000);
        }
    };

    const options = [q.ans, q.ans + 1, Math.max(1, q.ans - 1)].sort(() => Math.random() - 0.5);

    return (
        <div className="flex flex-col items-center justify-center h-full w-full relative">
            <h2 className="text-3xl font-bold mb-4 text-green-600 font-comic">Math Fun!</h2>
            <div className="flex gap-1 mb-6">
                {[...Array(GOAL)].map((_, i) => (
                    <Star key={i} size={32} className={i < score ? "text-yellow-400 fill-yellow-400 animate-bounce" : "text-gray-300"} />
                ))}
            </div>
            <div className="text-6xl font-black text-gray-700 mb-8 bg-white p-8 rounded-3xl shadow-lg border-4 border-green-200">
                {q.a} + {q.b} = ?
            </div>
            <div className="flex gap-6">
                {[...new Set(options)].map(opt => (
                    <button
                        key={opt}
                        onClick={() => check(opt)}
                        className="w-24 h-24 rounded-full bg-green-400 text-white text-4xl font-bold hover:bg-green-500 shadow-xl transform active:scale-90 transition-all border-4 border-white/30"
                    >
                        {opt}
                    </button>
                ))}
            </div>
            {feedback === 'correct' && !isWin && <div className="absolute bottom-10 text-5xl animate-bounce drop-shadow-lg">🌟 Correct!</div>}
            {feedback === 'wrong' && <div className="absolute bottom-10 text-4xl text-red-500 animate-shake font-bold bg-white/80 p-2 rounded-xl">Try again!</div>}
            {isWin && <WinPopup onPlayAgain={resetGame} onExit={onExit} />}
        </div>
    );
};

const ABCGame = ({ onExit, onWin }) => {
    const [score, setScore] = useState(0);
    const GOAL = 5;
    const [isWin, setIsWin] = useState(false);

    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
    const objects = {
        'A': '🍎', 'B': '⚽', 'C': '🐱', 'D': '🐶', 'E': '🐘',
        'F': '🦊', 'G': '🍇', 'H': '🐴', 'I': '🍦', 'J': '🧃',
        'K': '🪁', 'L': '🦁', 'M': '🐵', 'N': '🥜', 'O': '🦉',
        'P': '🐧', 'Q': '👑', 'R': '🐰', 'S': '☀️', 'T': '🐅',
        'U': '🦄', 'V': '🌋', 'W': '🍉', 'X': '🎹', 'Y': '🧶',
        'Z': '🦓'
    };

    const pickRandom = () => letters[Math.floor(Math.random() * letters.length)];
    const [current, setCurrent] = useState(() => pickRandom());

    const resetGame = () => {
        setScore(0);
        setIsWin(false);
        setCurrent(pickRandom());
    };

    const check = (obj) => {
        if (isWin) return;
        playPopSound();
        if (objects[current] === obj) {
            const newScore = score + 1;
            setScore(newScore);
            if (newScore >= GOAL) {
                setIsWin(true);
                if (onWin) onWin();
            } else {
                playCorrectSound();
                let next = pickRandom();
                while (next === current) next = pickRandom();
                setCurrent(next);
            }
        } else {
            playWrongSound();
        }
    };

    const allObjs = Object.values(objects).filter(o => o !== objects[current]);
    const displayOptions = [objects[current], ...allObjs.sort(() => Math.random() - 0.5).slice(0, 3)].sort(() => Math.random() - 0.5);

    return (
        <div className="flex flex-col items-center justify-center h-full w-full relative">
            <h2 className="text-3xl font-bold mb-4 text-blue-600 font-comic">Match Letter!</h2>
            <div className="flex gap-1 mb-4">
                {[...Array(GOAL)].map((_, i) => (
                    <Star key={i} size={28} className={i < score ? "text-yellow-400 fill-yellow-400 animate-pulse" : "text-gray-300"} />
                ))}
            </div>
            <div className="text-8xl font-black text-blue-500 mb-8 animate-bounce-slow bg-white p-6 rounded-2xl shadow-md border-4 border-blue-100 min-w-[140px] text-center">
                {current}
            </div>
            <div className="grid grid-cols-2 gap-6">
                {displayOptions.map(obj => (
                    <button
                        key={obj}
                        onClick={() => check(obj)}
                        className="text-6xl p-6 bg-white rounded-2xl shadow-lg hover:scale-110 transition-transform border-4 border-blue-50 hover:border-blue-300 active:bg-blue-100"
                    >
                        {obj}
                    </button>
                ))}
            </div>
            {isWin && <WinPopup onPlayAgain={resetGame} onExit={onExit} />}
        </div>
    );
};

const ShapeGame = ({ onExit, onWin }) => {
    const shapes = [
        { name: 'Circle', class: 'rounded-full' },
        { name: 'Square', class: 'rounded-none' },
        { name: 'Rounded', class: 'rounded-2xl' },
    ];

    const [score, setScore] = useState(0);
    const GOAL = 3;
    const [isWin, setIsWin] = useState(false);
    const [target, setTarget] = useState(shapes[0]);

    const resetGame = () => {
        setScore(0);
        setIsWin(false);
        setTarget(shapes[Math.floor(Math.random() * shapes.length)]);
    };

    const check = (s) => {
        if (isWin) return;
        playPopSound();
        if (s.name === target.name) {
            const newScore = score + 1;
            setScore(newScore);
            if (newScore >= GOAL) {
                setIsWin(true);
                if (onWin) onWin();
            } else {
                playCorrectSound();
                let next = shapes[Math.floor(Math.random() * shapes.length)];
                while (next.name === target.name) next = shapes[Math.floor(Math.random() * shapes.length)];
                setTarget(next);
            }
        } else {
            playWrongSound();
        }
    };

    return (
        <div className="flex flex-col items-center justify-center h-full w-full relative">
            <h2 className="text-3xl font-bold mb-4 text-orange-600 font-comic">Find the {target.name}!</h2>
            <div className="flex gap-1 mb-8">
                {[...Array(GOAL)].map((_, i) => (
                    <Star key={i} size={28} className={i < score ? "text-yellow-400 fill-yellow-400 animate-pulse" : "text-gray-300"} />
                ))}
            </div>
            <div className="flex gap-6 mt-4">
                {shapes.map(s => (
                    <button
                        key={s.name}
                        onClick={() => check(s)}
                        className={`w-28 h-28 bg-orange-400 ${s.class} shadow-xl border-4 border-white transition-transform hover:rotate-6 active:scale-95`}
                    />
                ))}
            </div>
            {isWin && <WinPopup onPlayAgain={resetGame} onExit={onExit} />}
        </div>
    );
};

const GamesCard = ({ onBack, onLogActivity }) => {
    const [activeGame, setActiveGame] = useState(null);

    const menu = [
        { id: 'puzzle', label: 'Puzzle', icon: <Puzzle size={40} />, color: 'bg-purple-200' },
        { id: 'math', label: 'Math', icon: <span>1+2</span>, color: 'bg-green-200' },
        { id: 'abc', label: 'ABC', icon: <span>Abc</span>, color: 'bg-blue-200' },
        { id: 'shape', label: 'Shapes', icon: <span>🔵</span>, color: 'bg-orange-200' },
    ];

    const handleGameExit = () => {
        setActiveGame(null);
    };

    const renderGame = () => {
        switch (activeGame) {
            case 'puzzle': return <MemoryGame onExit={handleGameExit} onWin={() => onLogActivity?.('game', 'Won Memory Game', 'Completed all pairs!')} />;
            case 'math': return <MathGame onExit={handleGameExit} onWin={() => onLogActivity?.('game', 'Won Math Fun', 'Solved all math problems!')} />;
            case 'abc': return <ABCGame onExit={handleGameExit} onWin={() => onLogActivity?.('game', 'Won ABC Match', 'Matched all letters and objects!')} />;
            case 'shape': return <ShapeGame onExit={handleGameExit} onWin={() => onLogActivity?.('game', 'Won Shapes Game', 'Identified all shapes correctly!')} />;
            default: return null;
        }
    };

    return (
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border-4 border-green-300 flex flex-col h-[70vh]">
            <div className="bg-green-300 p-4 flex items-center gap-3 shadow-md z-10 relative">
                <div className="text-4xl">🎮</div>
                <div className="flex-1">
                    <h3 className="font-comic font-bold text-2xl text-green-900">
                        {activeGame ? 'Game Time!' : 'Choose a Game'}
                    </h3>
                </div>
                <button
                    onClick={activeGame ? handleGameExit : onBack}
                    className="bg-red-400 text-white p-2 px-4 rounded-xl font-bold hover:bg-red-500 transition-transform transform active:scale-95 shadow-lg flex items-center gap-2 border-2 border-red-300"
                >
                    <LogOut size={20} />
                    {activeGame ? 'Exit Game' : 'Exit'}
                </button>
            </div>

            <div className="flex-1 p-6 bg-green-50 overflow-y-auto">
                {!activeGame ? (
                    <div className="grid grid-cols-2 gap-6 h-full content-center">
                        {menu.map(m => (
                            <button
                                key={m.id}
                                onClick={() => {
                                    playPopSound();
                                    setActiveGame(m.id);
                                    if (onLogActivity) {
                                        onLogActivity('game', `Started playing ${m.label}`, `Playing the ${m.label} game.`);
                                    }
                                }}
                                className={`${m.color} h-40 rounded-3xl shadow-lg hover:shadow-xl transform hover:-translate-y-2 transition-all flex flex-col items-center justify-center gap-2 border-4 border-white/40`}
                            >
                                <div className="text-5xl font-bold text-gray-700">{m.icon}</div>
                                <span className="text-xl font-bold text-gray-800">{m.label}</span>
                            </button>
                        ))}
                    </div>
                ) : (
                    <div className="h-full flex items-center justify-center">
                        {renderGame()}
                    </div>
                )}
            </div>
        </div>
    );
};

export default GamesCard;
