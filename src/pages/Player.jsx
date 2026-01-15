import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Play, Pause, SkipBack, SkipForward, Edit3, Check, X, Volume2 } from 'lucide-react';
import { useSpeech } from '../hooks/useSpeech';

const Player = ({ categories, updateCategory }) => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { speak, cancel } = useSpeech();

    const category = categories.find(c => c.id === id);

    // State
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isEditing, setIsEditing] = useState(false);
    const [editText, setEditText] = useState('');

    // Derived state: lines to speak
    const lines = useMemo(() => {
        if (!category?.content) return [];
        return category.content.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    }, [category?.content]);

    // Handle category not found
    useEffect(() => {
        if (!category) navigate('/');
    }, [category, navigate]);

    // --- Playback Logic ---
    const timeoutRef = useRef(null);

    // Cleanup
    useEffect(() => {
        return () => {
            cancel();
            clearTimeout(timeoutRef.current);
        };
    }, [cancel]);

    // The Loop
    useEffect(() => {
        if (!isPlaying) {
            cancel();
            clearTimeout(timeoutRef.current);
            return;
        }

        if (currentIndex >= lines.length) {
            // End of list, reset or stop? Let's stop.
            setIsPlaying(false);
            setCurrentIndex(0);
            return;
        }

        const textToSpeak = lines[currentIndex];

        // Speak
        speak(textToSpeak, 'fr-FR', 1.0, () => {
            // On End, wait 1 second then go to next
            timeoutRef.current = setTimeout(() => {
                if (isPlaying) { // Check if still playing after waiting
                    setCurrentIndex(prev => prev + 1);
                }
            }, 1000);
        });

    }, [isPlaying, currentIndex, lines, speak]);


    // --- Event Handlers ---

    const togglePlay = () => {
        if (lines.length === 0) return;
        setIsPlaying(prev => !prev);
    };

    const handleNext = () => {
        cancel();
        clearTimeout(timeoutRef.current);
        if (currentIndex < lines.length - 1) {
            setCurrentIndex(prev => prev + 1);
        } else {
            // Loop to start
            setCurrentIndex(0);
        }
    };

    const handlePrev = () => {
        cancel();
        clearTimeout(timeoutRef.current);
        if (currentIndex > 0) {
            setCurrentIndex(prev => prev - 1);
        } else {
            setCurrentIndex(lines.length - 1);
        }
    };

    const handleEditOpen = () => {
        setIsPlaying(false);
        cancel();
        setEditText(category.content || '');
        setIsEditing(true);
    };

    const handleEditSave = () => {
        updateCategory(id, { content: editText });
        setIsEditing(false);
        setCurrentIndex(0); // Reset progress on edit
    };

    if (!category) return null;

    // --- Edit Mode UI ---
    if (isEditing) {
        return (
            <div className="flex flex-col h-screen bg-slate-950 p-6">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-white">Edit Content</h2>
                    <button onClick={() => setIsEditing(false)} className="p-2 bg-slate-800 rounded-full text-slate-400">
                        <X size={24} />
                    </button>
                </div>
                <div className="text-slate-400 text-sm mb-2">
                    Format: One sentence per line. End with a dot.
                </div>
                <textarea
                    className="flex-1 bg-slate-900 border border-slate-700 rounded-2xl p-4 text-slate-100 text-lg leading-relaxed outline-none focus:border-indigo-500 font-mono resize-none"
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    placeholder="Bonjour. Hello.&#10;Comment ça va? How are you?"
                />
                <button
                    onClick={handleEditSave}
                    className="mt-6 w-full py-4 bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98] rounded-2xl font-bold text-xl text-white shadow-xl shadow-indigo-500/20 flex items-center justify-center gap-2 transition-all"
                >
                    <Check size={24} />
                    Save Changes
                </button>
            </div>
        );
    }

    // --- Player UI ---
    return (
        <div className="h-screen flex flex-col bg-slate-950 relative overflow-hidden">
            {/* Header */}
            <header className="p-6 flex items-center justify-between z-10">
                <button onClick={() => navigate('/')} className="p-3 bg-slate-800/50 hover:bg-slate-800 rounded-xl text-slate-300 transition-colors">
                    <ArrowLeft size={24} />
                </button>
                <h1 className="text-lg font-semibold text-slate-400 uppercase tracking-widest truncate max-w-[200px] text-center">
                    {category.name}
                </h1>
                <button onClick={handleEditOpen} className="p-3 bg-slate-800/50 hover:bg-slate-800 rounded-xl text-indigo-400 transition-colors">
                    <Edit3 size={24} />
                </button>
            </header>

            {/* Main Content (Display Current Sentence) */}
            <main className="flex-1 flex flex-col items-center justify-center p-6 text-center z-10 relative">
                <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/5 to-transparent pointer-events-none" />

                {lines.length > 0 ? (
                    <div className="w-full max-w-xl">
                        {/* Previous line faint */}
                        {currentIndex > 0 && (
                            <p className="text-slate-600 text-lg mb-8 font-medium transition-all transform scale-95 opacity-50 blur-[1px]">
                                {lines[currentIndex - 1]}
                            </p>
                        )}

                        {/* Current line prominent */}
                        <div className="relative py-8">
                            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white leading-tight drop-shadow-2xl">
                                {lines[currentIndex]}
                            </h2>
                        </div>

                        {/* Next line faint */}
                        {currentIndex < lines.length - 1 && (
                            <p className="text-slate-600 text-lg mt-8 font-medium transition-all transform scale-95 opacity-50 blur-[1px]">
                                {lines[currentIndex + 1]}
                            </p>
                        )}

                        <p className="mt-12 text-slate-500 font-mono text-xs tracking-widest uppercase">
                            Line {currentIndex + 1} of {lines.length}
                        </p>
                    </div>
                ) : (
                    <div className="text-slate-500">
                        <p className="mb-4">No content yet.</p>
                        <button onClick={handleEditOpen} className="text-indigo-400 underline decoration-indigo-500/30 underline-offset-4">Add some sentences</button>
                    </div>
                )}
            </main>

            {/* Controls */}
            <div className="p-8 pb-12 z-20 bg-gradient-to-t from-slate-950 via-slate-950 to-transparent">
                <div className="flex items-center justify-center gap-8 max-w-md mx-auto">
                    {/* Back Button */}
                    <button
                        onClick={handlePrev}
                        className="p-4 rounded-full bg-slate-800 text-white hover:bg-slate-700 active:scale-95 transition-all shadow-lg border border-white/5"
                        aria-label="Previous sentence"
                    >
                        <SkipBack size={28} fill="currentColor" className="opacity-80" />
                    </button>

                    {/* Play/Pause Button - Prominent */}
                    <button
                        onClick={togglePlay}
                        disabled={lines.length === 0}
                        className={`p-8 rounded-[2rem] transition-all active:scale-95 shadow-2xl shadow-indigo-500/20 relative group ${isPlaying
                                ? 'bg-rose-500 text-white hover:bg-rose-400'
                                : 'bg-indigo-600 text-white hover:bg-indigo-500'
                            }`}
                    >
                        <div className="relative z-10">
                            {isPlaying ? (
                                <Pause size={48} fill="currentColor" />
                            ) : (
                                <Play size={48} fill="currentColor" className="ml-1" />
                            )}
                        </div>
                    </button>

                    {/* Next Button */}
                    <button
                        onClick={handleNext}
                        className="p-4 rounded-full bg-slate-800 text-white hover:bg-slate-700 active:scale-95 transition-all shadow-lg border border-white/5"
                        aria-label="Next sentence"
                    >
                        <SkipForward size={28} fill="currentColor" className="opacity-80" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Player;
