import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
    Paintbrush,
    Eraser,
    Square,
    Circle,
    Triangle,
    Star,
    Undo2,
    Redo2,
    Layers,
    Trash2,
    Download,
    LogOut,
    Minus,
    Plus,
    Sparkles,
    Pencil,
    Highlighter,
    CloudRain
} from 'lucide-react';
import { playPopSound } from '../../utils/audioUtils';

const PaintingPanel = ({ onBack, template, onLogActivity }) => {
    const canvasRef = useRef(null);
    const contextRef = useRef(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [color, setColor] = useState('#ff5722');
    const [brushSize, setBrushSize] = useState(5);
    const [tool, setTool] = useState('brush'); // brush, eraser, circle, square, triangle, star
    const [undoStack, setUndoStack] = useState([]);
    const [redoStack, setRedoStack] = useState([]);
    const [activeLayer, setActiveLayer] = useState(0);
    const [layers, setLayers] = useState([true, true, true]); // Visibility of 3 layers
    const [showReference, setShowReference] = useState(true);
    const [templateLoaded, setTemplateLoaded] = useState(false);
    const [hue, setHue] = useState(0); // For magic rainbow tool

    // Canvas Settings
    useEffect(() => {
        const canvas = canvasRef.current;
        canvas.width = canvas.offsetWidth * 2;
        canvas.height = canvas.offsetHeight * 2;
        canvas.style.width = `${canvas.offsetWidth}px`;
        canvas.style.height = `${canvas.offsetHeight}px`;

        const context = canvas.getContext('2d', { willReadFrequently: true });
        context.scale(2, 2);
        context.lineCap = 'round';
        context.lineJoin = 'round';
        contextRef.current = context;

        // Fill background white
        context.fillStyle = 'white';
        context.fillRect(0, 0, canvas.width, canvas.height);

        // Load template if provided
        if (template && template.image) {
            console.log("PaintingPanel: Loading template image:", template.image);
            const img = new Image();
            img.src = template.image;
            img.crossOrigin = "anonymous";
            img.onload = () => {
                console.log("PaintingPanel: Image loaded successfully:", template.image);
                const isSideBySide = template.type === 'side-by-side';
                const sourceX = isSideBySide ? (template.outlineSide === 'right' ? img.width / 2 : 0) : 0;
                const sourceW = isSideBySide ? img.width / 2 : img.width;

                // Draw template centered and scaled
                const scale = Math.min(canvas.width / (sourceW * 2), canvas.height / (img.height * 2)) * 0.9;
                const x = (canvas.width / 2 - (sourceW * scale)) / 2;
                const y = (canvas.height / 2 - (img.height * scale)) / 2;

                context.drawImage(img, sourceX, 0, sourceW, img.height, x, y, sourceW * scale, img.height * scale);
                setTemplateLoaded(true);
                saveState();
            };
            img.onerror = (err) => {
                console.error("PaintingPanel: Failed to load image:", template.image, err);
                saveState();
            };
        } else {
            saveState();
        }
    }, [template]);

    const saveState = () => {
        const canvas = canvasRef.current;
        setUndoStack(prev => [...prev.slice(-19), canvas.toDataURL()]);
        setRedoStack([]);
    };

    const undo = () => {
        if (undoStack.length <= 1) return;
        playPopSound();
        const prevState = undoStack[undoStack.length - 2];
        const current = undoStack[undoStack.length - 1];

        setRedoStack(prev => [...prev, current]);
        setUndoStack(prev => prev.slice(0, -1));

        const img = new Image();
        img.src = prevState;
        img.onload = () => {
            contextRef.current.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
            contextRef.current.drawImage(img, 0, 0, canvasRef.current.width / 2, canvasRef.current.height / 2);
        };
    };

    const redo = () => {
        if (redoStack.length === 0) return;
        playPopSound();
        const nextState = redoStack[redoStack.length - 1];

        setUndoStack(prev => [...prev, nextState]);
        setRedoStack(prev => prev.slice(0, -1));

        const img = new Image();
        img.src = nextState;
        img.onload = () => {
            contextRef.current.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
            contextRef.current.drawImage(img, 0, 0, canvasRef.current.width / 2, canvasRef.current.height / 2);
        };
    };

    const startDrawing = ({ nativeEvent }) => {
        const { offsetX, offsetY } = nativeEvent;
        contextRef.current.beginPath();
        contextRef.current.moveTo(offsetX, offsetY);
        contextRef.current.strokeStyle = tool === 'eraser' ? 'white' : color;
        contextRef.current.lineWidth = brushSize;
        setIsDrawing(true);
    };

    const draw = ({ nativeEvent }) => {
        if (!isDrawing) return;
        const { offsetX, offsetY } = nativeEvent;
        const ctx = contextRef.current;

        if (tool === 'brush' || tool === 'eraser') {
            ctx.lineTo(offsetX, offsetY);
            ctx.stroke();
        } else if (tool === 'rainbow') {
            ctx.strokeStyle = `hsl(${hue}, 100%, 50%)`;
            ctx.lineTo(offsetX, offsetY);
            ctx.stroke();
            setHue(prev => (prev + 5) % 360);
        } else if (tool === 'spray') {
            const density = brushSize * 2;
            ctx.fillStyle = color;
            for (let i = 0; i < density; i++) {
                const angle = Math.random() * Math.PI * 2;
                const radius = Math.random() * brushSize * 2;
                const x = offsetX + Math.cos(angle) * radius;
                const y = offsetY + Math.sin(angle) * radius;
                ctx.fillRect(x, y, 1, 1);
            }
        } else if (tool === 'crayon') {
            ctx.globalAlpha = 0.5;
            ctx.lineTo(offsetX + (Math.random() - 0.5) * 2, offsetY + (Math.random() - 0.5) * 2);
            ctx.stroke();
            ctx.globalAlpha = 1.0;
        } else if (tool === 'glow') {
            ctx.shadowBlur = brushSize;
            ctx.shadowColor = color;
            ctx.lineTo(offsetX, offsetY);
            ctx.stroke();
            ctx.shadowBlur = 0;
        }
    };

    const stopDrawing = ({ nativeEvent }) => {
        if (!isDrawing) return;

        if (tool !== 'brush' && tool !== 'eraser') {
            const { offsetX, offsetY } = nativeEvent;
            drawShape(offsetX, offsetY);
        }

        contextRef.current.closePath();
        setIsDrawing(false);
        saveState();
    };

    const drawShape = (x, y) => {
        // Simple shape drawing for now - captures start pos would be better but keeping it simple for MVP
        // In a real pro app, we'd store the mouseDown pos and draw preview
        const ctx = contextRef.current;
        ctx.fillStyle = color;
        ctx.strokeStyle = color;
        ctx.lineWidth = brushSize;

        const size = brushSize * 5;

        switch (tool) {
            case 'square':
                ctx.strokeRect(x - size / 2, y - size / 2, size, size);
                break;
            case 'circle':
                ctx.beginPath();
                ctx.arc(x, y, size / 2, 0, Math.PI * 2);
                ctx.stroke();
                break;
            case 'triangle':
                ctx.beginPath();
                ctx.moveTo(x, y - size / 2);
                ctx.lineTo(x - size / 2, y + size / 2);
                ctx.lineTo(x + size / 2, y + size / 2);
                ctx.closePath();
                ctx.stroke();
                break;
            case 'star':
                drawStar(x, y, 5, size, size / 2);
                break;
            default:
                break;
        }
    };

    const drawStar = (cx, cy, spikes, outerRadius, innerRadius) => {
        let rot = (Math.PI / 2) * 3;
        let x = cx;
        let y = cy;
        let step = Math.PI / spikes;

        const ctx = contextRef.current;
        ctx.beginPath();
        ctx.moveTo(cx, cy - outerRadius);
        for (let i = 0; i < spikes; i++) {
            x = cx + Math.cos(rot) * outerRadius;
            y = cy + Math.sin(rot) * outerRadius;
            ctx.lineTo(x, y);
            rot += step;

            x = cx + Math.cos(rot) * innerRadius;
            y = cy + Math.sin(rot) * innerRadius;
            ctx.lineTo(x, y);
            rot += step;
        }
        ctx.lineTo(cx, cy - outerRadius);
        ctx.closePath();
        ctx.stroke();
    };

    const clearCanvas = () => {
        playPopSound();
        if (window.confirm("Start a fresh drawing?")) {
            const canvas = canvasRef.current;
            contextRef.current.fillStyle = 'white';
            contextRef.current.fillRect(0, 0, canvas.width, canvas.height);

            if (template && template.image) {
                const img = new Image();
                img.src = template.image;
                img.crossOrigin = "anonymous";
                img.onload = () => {
                    const isSideBySide = template.type === 'side-by-side';
                    const sourceX = isSideBySide ? (template.outlineSide === 'right' ? img.width / 2 : 0) : 0;
                    const sourceW = isSideBySide ? img.width / 2 : img.width;

                    const scale = Math.min(canvasRef.current.width / (sourceW * 2), canvasRef.current.height / (img.height * 2)) * 0.9;
                    const x = (canvasRef.current.width / 2 - (sourceW * scale)) / 2;
                    const y = (canvasRef.current.height / 2 - (img.height * scale)) / 2;
                    contextRef.current.drawImage(img, sourceX, 0, sourceW, img.height, x, y, sourceW * scale, img.height * scale);
                    saveState();
                };
            } else {
                saveState();
            }
        }
    };

    const colors = [
        '#FF0000', '#FF7F00', '#FFFF00', '#00FF00', '#0000FF', // Red, Orange, Yellow, Green, Blue
        '#4B0082', '#9400D3', '#FFC0CB', '#FF1493', '#00FFFF', // Indigo, Violet, Pink, DeepPink, Cyan
        '#32CD32', '#FFD700', '#008080', '#00BFFF', '#800080', // Lime, Gold, Teal, DeepSkyBlue, Purple
        '#8B4513', '#808080', '#000000', '#FFFFFF', '#F5A623', // Brown, Grey, Black, White, Pumpkin
        '#7ED321', '#4A90E2', '#BD10E0', '#9013FE', '#50E3C2'  // Salad, Blueish, Orchid, Heliotrope, Aqua
    ];

    return (
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border-8 border-yellow-300 flex flex-col h-[75vh] w-full max-w-6xl mx-auto">
            {/* Header / Top Toolbar */}
            <div className="bg-yellow-300 p-3 flex items-center justify-between shadow-md">
                <div className="flex items-center gap-3">
                    <div className="text-4xl animate-bounce-slow">🎨</div>
                    <h3 className="font-comic font-black text-2xl text-yellow-900 hidden sm:block">Magic Painter</h3>
                </div>

                <div className="flex items-center gap-2 bg-white/40 p-1 px-3 rounded-2xl border-2 border-white/40">
                    <button onClick={undo} className="p-2 hover:bg-white rounded-xl transition" title="Undo"><Undo2 size={24} /></button>
                    <button onClick={redo} className="p-2 hover:bg-white rounded-xl transition" title="Redo"><Redo2 size={24} /></button>
                    <div className="w-px h-6 bg-yellow-600/20 mx-1" />
                    <button onClick={clearCanvas} className="p-2 hover:bg-red-100 text-red-600 rounded-xl transition" title="Clear"><Trash2 size={24} /></button>
                </div>

                <button
                    onClick={onBack}
                    className="bg-red-400 text-white p-2 px-4 rounded-xl font-bold hover:bg-red-500 transition-transform transform active:scale-95 shadow-lg flex items-center gap-2 border-2 border-red-300"
                >
                    <LogOut size={20} />
                    <span className="hidden sm:inline">Done</span>
                </button>
            </div>

            <div className="flex-1 flex overflow-hidden">
                {/* Left Toolbar - Tools */}
                <div className="w-20 bg-yellow-50 border-r-4 border-yellow-100 p-2 flex flex-col gap-3 items-center overflow-y-auto">
                    {[
                        { id: 'brush', icon: <Paintbrush />, label: 'Brush' },
                        { id: 'rainbow', icon: <Sparkles className="text-yellow-500" />, label: 'Magic' },
                        { id: 'crayon', icon: <Pencil className="text-orange-500" />, label: 'Crayon' },
                        { id: 'spray', icon: <CloudRain className="text-blue-500" />, label: 'Spray' },
                        { id: 'glow', icon: <Highlighter className="text-pink-500" />, label: 'Glow' },
                        { id: 'eraser', icon: <Eraser />, label: 'Eraser' },
                        { id: 'square', icon: <Square />, label: 'Box' },
                        { id: 'circle', icon: <Circle />, label: 'Ball' },
                        { id: 'triangle', icon: <Triangle />, label: 'Tent' },
                        { id: 'star', icon: <Star />, label: 'Star' },
                    ].map(t => (
                        <button
                            key={t.id}
                            onClick={() => { playPopSound(); setTool(t.id); }}
                            className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center transition-all border-b-4 flex-shrink-0 ${tool === t.id
                                ? 'bg-yellow-400 text-white border-yellow-600 scale-110 shadow-md'
                                : 'bg-white text-yellow-700 border-yellow-200 hover:bg-yellow-100'
                                }`}
                        >
                            {t.icon}
                            <span className="text-[9px] font-bold uppercase">{t.label}</span>
                        </button>
                    ))}

                    <div className="h-px w-10 bg-yellow-200 my-2" />

                    {/* Layers Mock (Kids friendly) */}
                    <button
                        onClick={() => { playPopSound(); }}
                        className="w-14 h-14 rounded-2xl bg-indigo-100 text-indigo-600 border-b-4 border-indigo-200 flex flex-col items-center justify-center"
                    >
                        <Layers size={20} />
                        <span className="text-[10px] font-bold">Layers</span>
                    </button>
                </div>

                {/* Main Content: Reference (Side) + Canvas */}
                <div className="flex-1 flex bg-gray-200 p-4 gap-4 overflow-hidden relative">
                    {/* Persistent Reference Panel */}
                    {template && template.image && (
                        <div className={`w-72 bg-white rounded-2xl shadow-xl border-4 border-yellow-300 overflow-hidden flex flex-col p-2 transition-all ${showReference ? 'flex' : 'hidden'}`}>
                            <div className="flex items-center justify-between mb-2 px-1">
                                <span className="text-xs font-black text-yellow-800 uppercase tracking-widest">Look & Draw</span>
                                <button onClick={() => setShowReference(false)} className="bg-red-100 text-red-500 p-1 rounded-full hover:bg-red-200 transition" title="Hide"><Minus size={12} /></button>
                            </div>
                            <div className="flex-1 relative overflow-hidden rounded-xl bg-gray-50 border-2 border-yellow-100 group">
                                <img
                                    src={template.image}
                                    alt="Reference"
                                    className="absolute h-full object-cover transition-transform group-hover:scale-105"
                                    style={{
                                        width: template.type === 'side-by-side' ? '200%' : '100%',
                                        maxWidth: 'none',
                                        left: template.type === 'side-by-side' ? (template.outlineSide === 'right' ? '0' : '-100%') : '0'
                                    }}
                                />
                                <div className="absolute inset-x-0 bottom-0 bg-black/30 backdrop-blur-sm p-1 text-center text-[8px] text-white font-bold">
                                    COLOR THE SAME!
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Show Reference Button (if hidden) */}
                    {template && !showReference && (
                        <button
                            onClick={() => { playPopSound(); setShowReference(true); }}
                            className="absolute bottom-6 left-6 bg-yellow-400 text-yellow-900 font-bold p-3 rounded-2xl shadow-lg border-b-4 border-yellow-600 hover:scale-105 transition-transform z-20 flex items-center gap-2 group"
                        >
                            <Layers size={20} className="group-hover:rotate-12 transition-transform" />
                            <span>Show Reference Image</span>
                        </button>
                    )}

                    {/* Drawing Area */}
                    <div className="flex-1 relative bg-white rounded-2xl shadow-inner border-4 border-white overflow-hidden">
                        <canvas
                            onMouseDown={startDrawing}
                            onMouseUp={stopDrawing}
                            onMouseMove={draw}
                            onMouseLeave={stopDrawing}
                            ref={canvasRef}
                            className="w-full h-full cursor-crosshair touch-none"
                        />
                    </div>
                </div>

                {/* Right Toolbar - Options */}
                <div className="w-24 bg-yellow-50 border-l-4 border-yellow-100 p-2 flex flex-col gap-4 items-center overflow-y-auto">
                    {/* Color Palette */}
                    <div className="grid grid-cols-2 gap-2">
                        {colors.map(c => (
                            <button
                                key={c}
                                onClick={() => { playPopSound(); setColor(c); if (tool === 'eraser') setTool('brush'); }}
                                className={`w-8 h-8 rounded-full border-2 transition-transform shadow-sm ${color === c && tool !== 'eraser' ? 'scale-125 border-yellow-600 border-4' : 'border-white'
                                    }`}
                                style={{ backgroundColor: c }}
                            />
                        ))}
                    </div>

                    <div className="h-px w-10 bg-yellow-200 my-2" />

                    {/* Brush Size Slider */}
                    <div className="flex flex-col items-center gap-2 w-full px-2">
                        <span className="text-[10px] font-black text-yellow-800 uppercase">Size</span>
                        <input
                            type="range"
                            min="1"
                            max="100"
                            value={brushSize}
                            onChange={(e) => setBrushSize(parseInt(e.target.value))}
                            className="w-full h-8 accent-yellow-400 cursor-pointer"
                        />
                        <div className="flex items-center gap-2">
                            <button onClick={() => { playPopSound(); setBrushSize(s => Math.max(1, s - 5)); }} className="p-1 bg-white rounded-lg border-b-2 border-yellow-200 text-yellow-700"><Minus size={16} /></button>
                            <div className="font-comic font-black text-lg text-yellow-900 w-8 text-center">{brushSize}</div>
                            <button onClick={() => { playPopSound(); setBrushSize(s => Math.min(100, s + 5)); }} className="p-1 bg-white rounded-lg border-b-2 border-yellow-200 text-yellow-700"><Plus size={16} /></button>
                        </div>
                    </div>

                    <div className="mt-auto mb-2">
                        <button
                            onClick={() => {
                                playPopSound();
                                const link = document.createElement('a');
                                link.download = 'my-painting.png';
                                link.href = canvasRef.current.toDataURL();
                                link.click();
                                if (onLogActivity) {
                                    onLogActivity('paint', 'Saved a painting', template ? `Used template: ${template.id}` : 'Free drawing');
                                }
                            }}
                            className="p-3 bg-green-500 text-white rounded-2xl border-b-4 border-green-700 hover:bg-green-600 transition shadow-lg flex flex-col items-center"
                        >
                            <Download size={24} />
                            <span className="text-[10px] font-bold">Save</span>
                        </button>
                    </div>
                </div>
            </div>
        </div >
    );
};

export default PaintingPanel;
