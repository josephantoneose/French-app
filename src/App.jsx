import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, HashRouter } from 'react-router-dom';
import Home from './pages/Home';
import Player from './pages/Player';
import { loadCategories, saveCategories } from './utils/storage';

function App() {
  const [categories, setCategories] = useState(loadCategories);

  useEffect(() => {
    saveCategories(categories);
  }, [categories]);

  const updateCategory = (id, updates) => {
    setCategories(prev => prev.map(cat => cat.id === id ? { ...cat, ...updates } : cat));
  };

  return (
    <HashRouter>
      <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500/30">
        <Routes>
          <Route path="/" element={<Home categories={categories} updateCategory={updateCategory} />} />
          <Route path="/player/:id" element={<Player categories={categories} updateCategory={updateCategory} />} />
        </Routes>
      </div>
    </HashRouter>
  );
}

export default App;
