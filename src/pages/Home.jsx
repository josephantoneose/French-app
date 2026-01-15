import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Edit2, Check, ChevronRight } from 'lucide-react';

const Home = ({ categories, updateCategory }) => {
    const navigate = useNavigate();
    const [editingId, setEditingId] = useState(null);
    const [editName, setEditName] = useState('');

    const handleEditClick = (e, cat) => {
        e.stopPropagation();
        setEditingId(cat.id);
        setEditName(cat.name);
    };

    const handleSaveClick = (e, cat) => {
        e.stopPropagation();
        if (editName.trim()) {
            updateCategory(cat.id, { name: editName });
        }
        setEditingId(null);
    };

    return (
        <div className="max-w-md mx-auto min-h-screen flex flex-col p-6 pb-20">
            <header className="mb-8 pt-4">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                    Conversation Topics
                </h1>
                <p className="text-slate-400 mt-2">Select a category to start listening.</p>
            </header>

            <div className="grid gap-4">
                {categories.map((cat) => (
                    <div
                        key={cat.id}
                        onClick={() => editingId !== cat.id && navigate(`/player/${cat.id}`)}
                        className="group relative bg-slate-900/50 hover:bg-slate-800 border border-white/5 hover:border-indigo-500/50 rounded-2xl p-4 transition-all active:scale-[0.98] cursor-pointer"
                    >
                        <div className="flex items-center justify-between gap-4">
                            <div className="flex-1 min-w-0">
                                {editingId === cat.id ? (
                                    <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                                        <input
                                            type="text"
                                            className="bg-slate-950 border border-indigo-500 rounded px-3 py-2 text-lg font-semibold w-full outline-none focus:ring-2 ring-indigo-500/20"
                                            value={editName}
                                            onChange={(e) => setEditName(e.target.value)}
                                            autoFocus
                                            onClick={e => e.stopPropagation()}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') handleSaveClick(e, cat);
                                            }}
                                        />
                                        <button
                                            onClick={(e) => handleSaveClick(e, cat)}
                                            className="p-2 bg-emerald-500 rounded-lg text-white shadow-lg shadow-emerald-500/20"
                                        >
                                            <Check size={20} />
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-3">
                                        <h2 className="text-xl font-semibold text-slate-100 truncate">{cat.name}</h2>
                                        <button
                                            onClick={(e) => handleEditClick(e, cat)}
                                            className="p-1.5 text-slate-500 hover:text-indigo-400 hover:bg-indigo-400/10 rounded-lg transition-colors opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
                                            aria-label="Edit category name"
                                        >
                                            <Edit2 size={16} />
                                        </button>
                                    </div>
                                )}
                                {!editingId && (
                                    <div className="text-slate-500 text-sm mt-1 truncate">
                                        {cat.content ? cat.content.split('\n').filter(l => l.trim()).length : 0} items
                                    </div>
                                )}
                            </div>

                            {editingId !== cat.id && (
                                <ChevronRight className="text-slate-600 group-hover:text-indigo-400 transition-colors" />
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Home;
