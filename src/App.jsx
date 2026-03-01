import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { HashRouter, Routes, Route } from 'react-router-dom'; // Keep HashRouter for GitHub Pages!
import Home from './pages/Home';
import Player from './pages/Player';
import {
  loadLocalCategories,
  saveLocalCategories,
  fetchCloudCategories,
  saveCloudCategories
} from './utils/storage';
import { supabase } from './utils/supabaseClient';

function App() {
  // 1. Initial Load: Try Local Storage first (Instant)
  const [categories, setCategories] = useState(loadLocalCategories);
  const [isSyncing, setIsSyncing] = useState(false);
  const [speechSpeed, setSpeechSpeed] = useState(() => {
    const saved = localStorage.getItem('speechSpeed');
    return saved ? parseFloat(saved) : 1.0;
  });

  useEffect(() => {
    localStorage.setItem('speechSpeed', speechSpeed);
  }, [speechSpeed]);

  // 2. On Mount: Fetch from Cloud (if available) and merge/override
  useEffect(() => {
    if (!supabase) return; // Skip if no cloud config

    const syncFromCloud = async () => {
      setIsSyncing(true);
      const cloudData = await fetchCloudCategories();
      if (cloudData) {
        // We found data in the cloud!
        // Strategy: Cloud is "Truth". Or newest? 
        // For simple personal app, let's assume Cloud overwrites Local on load.
        setCategories(cloudData);
        saveLocalCategories(cloudData); // Update local cache
      } else {
        // No cloud data yet? Maybe initialize cloud with our local data
        await saveCloudCategories(categories);
      }
      setIsSyncing(false);
    };

    syncFromCloud();
  }, []); // Run once on mount

  // 3. Update Handler: Update State -> Local -> Cloud
  const updateCategory = async (id, updates) => {
    // A. Optimistic Update (Instant UI)
    const newCategories = categories.map(cat =>
      cat.id === id ? { ...cat, ...updates } : cat
    );
    setCategories(newCategories);

    // B. Save Local
    saveLocalCategories(newCategories);

    // C. Save Cloud (Debounced or Fire-and-forget)
    if (supabase) {
      setIsSyncing(true);
      await saveCloudCategories(newCategories);
      setIsSyncing(false);
    }
  };

  const createCategory = async (name = "New Topic") => {
    const newCategory = {
      id: uuidv4(),
      name,
      content: ''
    };

    // Add to the top
    const newCategories = [newCategory, ...categories];
    setCategories(newCategories);
    saveLocalCategories(newCategories);

    if (supabase) {
      setIsSyncing(true);
      await saveCloudCategories(newCategories);
      setIsSyncing(false);
    }

    return newCategory.id;
  };

  return (
    <HashRouter>
      <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500/30">
        <Routes>
          <Route path="/" element={
            <Home
              categories={categories}
              updateCategory={updateCategory}
              createCategory={createCategory}
              isSyncing={isSyncing}
              hasCloud={!!supabase}
              speechSpeed={speechSpeed}
              setSpeechSpeed={setSpeechSpeed}
            />
          } />
          <Route path="/player/:id" element={
            <Player categories={categories} updateCategory={updateCategory} speechSpeed={speechSpeed} />
          } />
        </Routes>
      </div>
    </HashRouter>
  );
}

export default App;
