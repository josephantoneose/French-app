import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Trophy, Utensils, Plane, Volume2, ArrowRight, ArrowLeft,
  ChevronLeft, Sparkles, BookOpen, Edit3, Save, X,
  Play, Square, SkipForward
} from 'lucide-react';
import { categories as initialCategories } from './data';

// --- Speech Hook ---
const useSpeech = () => {
  const [voices, setVoices] = useState([]);
  const synth = window.speechSynthesis;
  // Track cancel state
  const isCancelled = useRef(false);
  // Keep reference to active utterance to prevent Garbage Collection (Chrome Bug)
  const activeUtteranceRef = useRef(null);

  useEffect(() => {
    const updateVoices = () => setVoices(synth.getVoices());
    updateVoices();
    synth.onvoiceschanged = updateVoices;
    return () => { synth.onvoiceschanged = null; };
  }, [synth]);

  const speak = useCallback((text, lang = 'fr-FR', rate = 0.9, onEnd) => {
    if (!synth || !text) {
      if (onEnd) onEnd();
      return;
    }

    // Safety: Clear active ref so pending onEnd/onError handlers don't fire for previous utterance
    activeUtteranceRef.current = null;

    // Cancel any current speech
    synth.cancel();
    isCancelled.current = false;

    const utterance = new SpeechSynthesisUtterance(text);

    // Select voice based on requested lang
    if (lang.startsWith('fr')) {
      const frenchVoice = voices.find(v => v.lang.includes('fr'));
      if (frenchVoice) utterance.voice = frenchVoice;
    } else {
      // For English or others, try to match or use default
      const targetVoice = voices.find(v => v.lang.startsWith(lang.split('-')[0]));
      if (targetVoice) utterance.voice = targetVoice;
    }

    utterance.lang = lang;
    utterance.rate = rate;

    // Store ref prevent GC and for validation
    activeUtteranceRef.current = utterance;

    utterance.onend = () => {
      // Only fire if this is still the active utterance (hasn't been cancelled/superseded)
      if (activeUtteranceRef.current === utterance && !isCancelled.current) {
        activeUtteranceRef.current = null;
        if (onEnd) onEnd();
      }
    };
    utterance.onerror = (e) => {
      console.error("Speech error", e);
      // Same check for error
      if (activeUtteranceRef.current === utterance && !isCancelled.current) {
        activeUtteranceRef.current = null;
        if (onEnd) onEnd();
      }
    };

    synth.speak(utterance);
  }, [voices, synth]);

  const cancel = useCallback(() => {
    isCancelled.current = true;
    synth.cancel();
    activeUtteranceRef.current = null;
  }, [synth]);

  return { speak, cancel };
};

const iconMap = {
  Trophy: Trophy,
  Utensils: Utensils,
  Plane: Plane,
};



// ... (keep usage of initialCategories as fallback while loading if needed, but best to replace state init)

function App() {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const { speak, cancel } = useSpeech();
  const [speechRate, setSpeechRate] = useState(0.9);

  // Load data from server
  useEffect(() => {
    fetch('/api/data')
      .then(res => res.json())
      .then(data => setCategories(data))
      .catch(err => {
        console.error("Failed to load data", err);
        // Fallback to local if server fails (optional)
        setCategories(initialCategories);
      });
  }, []);

  const handleUpdateCategory = (categoryId, newQuestions) => {
    // Optimistic update
    const updatedCats = categories.map(cat => {
      if (cat.id === categoryId) {
        return { ...cat, questions: newQuestions };
      }
      return cat;
    });
    setCategories(updatedCats);

    if (selectedCategory && selectedCategory.id === categoryId) {
      setSelectedCategory({ ...selectedCategory, questions: newQuestions });
    }

    // Persist to server
    fetch('/api/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ categoryId, questions: newQuestions })
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          console.log("Saved to server!");
        }
      })
      .catch(err => alert("Failed to save changes to server"));
  };

  return (
    <div className="h-screen w-full bg-[#0f172a] text-white font-sans selection:bg-indigo-500/30 flex flex-col overflow-hidden">
      {/* Header */}
      <header className="p-4 z-10 flex items-center justify-between bg-slate-900/50 backdrop-blur-md border-b border-white/5 h-16 shrink-0">
        <div className="flex items-center gap-2">
          {!selectedCategory && <>
            <Sparkles className="w-5 h-5 text-yellow-400" />
            <h1 className="text-xl font-bold tracking-tight bg-gradient-to-br from-white to-white/60 bg-clip-text text-transparent">French</h1>
          </>}
          {selectedCategory && (
            <button
              onClick={() => { cancel(); setSelectedCategory(null); }}
              className="p-2 rounded-full bg-white/10 active:scale-95 transition-all text-white mr-2"
            >
              <ChevronLeft size={24} />
            </button>
          )}
        </div>

        <div className="flex items-center gap-4">
          {/* Speed Slider */}
          <div className="flex items-center gap-2 bg-slate-800/50 px-3 py-1 rounded-full border border-white/5">
            <span className="text-xs text-slate-400 font-mono">Speed</span>
            <input
              type="range"
              min="0.5"
              max="1.2"
              step="0.1"
              value={speechRate}
              onChange={(e) => setSpeechRate(parseFloat(e.target.value))}
              className="w-16 md:w-24 accent-indigo-500 h-1 rounded-lg cursor-pointer"
            />
            <span className="text-xs text-white w-6">{speechRate}x</span>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full max-w-2xl mx-auto p-4 flex flex-col relative z-20 overflow-hidden">
        <AnimatePresence mode="wait">
          {!selectedCategory ? (
            <CategoryList
              categories={categories}
              onSelect={setSelectedCategory}
              key="list"
            />
          ) : (
            <QuizView
              category={selectedCategory}
              onUpdateQuestions={handleUpdateCategory}
              speak={speak}
              speechRate={speechRate}
              cancelSpeech={cancel}
              key="quiz"
            />
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

const CategoryList = ({ categories, onSelect }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="grid gap-4 mt-4"
    >
      <p className="text-2xl font-light text-center mb-6 text-indigo-200">Select a Topic</p>
      {categories.map((cat, index) => {
        const Icon = iconMap[cat.icon] || BookOpen;
        return (
          <motion.button
            key={cat.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            onClick={() => onSelect(cat)}
            className="w-full p-6 rounded-3xl bg-slate-800/50 border border-white/5 flex items-center gap-6 active:scale-95 transition-all shadow-xl"
          >
            <div className="w-16 h-16 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <Icon className="text-white w-8 h-8" />
            </div>
            <div className="flex-1 text-left">
              <h3 className="text-2xl font-bold text-white mb-1">{cat.name}</h3>
              <p className="text-slate-400 font-medium">{cat.questions.length} Questions</p>
            </div>
            <ArrowRight className="w-6 h-6 text-slate-500" />
          </motion.button>
        );
      })}
    </motion.div>
  );
};

const QuizView = ({ category, onUpdateQuestions, speak, cancelSpeech, speechRate }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [autoPlay, setAutoPlay] = useState(false);
  const [jumpInput, setJumpInput] = useState('');

  // Refs for managing timeout loops and preventing stale closures
  const timerRef = useRef(null);
  const loopIdRef = useRef(0);

  const question = category.questions[currentIndex];

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearTimeout(timerRef.current);
      cancelSpeech();
    };
  }, [cancelSpeech]);

  // --- Auto Play Logic ---
  const startAutoLoop = useCallback(() => {
    // Increment loop ID to invalidate any previous running loops
    const currentLoopId = loopIdRef.current + 1;
    loopIdRef.current = currentLoopId;

    const textToSpeakQ = question.audioText || question.content;
    const textToSpeakA = question.answer;
    const langA = 'fr-FR';

    // Helper to check validity
    const isValid = () => autoPlay && loopIdRef.current === currentLoopId;

    // Phase 1: Speak Question (1st time)
    speak(textToSpeakQ, 'fr-FR', speechRate, () => {
      if (!isValid()) return;

      // Wait 1s
      timerRef.current = setTimeout(() => {
        if (!isValid()) return;

        // Phase 2: Speak Question (2nd time)
        speak(textToSpeakQ, 'fr-FR', speechRate, () => {
          if (!isValid()) return;

          // Phase 3: Wait 2 seconds before answer
          timerRef.current = setTimeout(() => {
            if (!isValid()) return;

            // Phase 4: Reveal & Speak Answer
            setShowAnswer(true);
            speak(textToSpeakA, langA, speechRate, () => {
              if (!isValid()) return;

              // Phase 5: Wait 2 seconds before next question
              timerRef.current = setTimeout(() => {
                if (!isValid()) return;
                handleNext(true);
              }, 2000); // Fixed 2s delay between cards
            });

          }, 2000); // Fixed 2s delay thinking time
        });
      }, 1000); // Fixed 1s delay between repeats
    });
  }, [autoPlay, question, speak, speechRate]);

  useEffect(() => {
    if (autoPlay) {
      // Start a new loop sequence
      startAutoLoop();
    } else {
      // Stop everything
      clearTimeout(timerRef.current);
      cancelSpeech();
      loopIdRef.current++; // Invalidate current loop
    }
  }, [autoPlay, currentIndex, startAutoLoop]); // Re-run if index changes (next card) or loop logic changes


  // --- Navigation & Actions ---

  const handleNext = (isAuto = false) => {
    // If manual click, strictly stop autoplay? Or just reset?
    // User wants control. Let's keep autoplay active if it is active, but reset flow.
    // The useEffect dependency on `currentIndex` handles the restart of the loop automatically!
    // We just need to update index.
    if (!isAuto) {
      // If manual navigation, we might want to canceling pending speech immediately to feel snappy
      cancelSpeech();
    }
    setShowAnswer(false);
    setCurrentIndex(prev => (prev + 1) % category.questions.length);
  };

  const handlePrev = () => {
    cancelSpeech();
    setShowAnswer(false);
    setCurrentIndex(prev => (prev - 1 + category.questions.length) % category.questions.length);
  };

  const handleJump = (e) => {
    e.preventDefault();
    const num = parseInt(jumpInput);
    if (!isNaN(num) && num > 0 && num <= category.questions.length) {
      cancelSpeech();
      setShowAnswer(false);
      setCurrentIndex(num - 1);
      setJumpInput('');
    }
  };

  const toggleAutoPlay = () => {
    setAutoPlay(prev => !prev);
  };

  const manualSpeak = () => {
    // If autoplay is ON, clicking this shouldn't break the loop logic (ref check protects it),
    // but it might overlap audio. Let's force audio.
    speak(question.audioText || question.content, 'fr-FR', speechRate);
  };

  // --- Editor Parsers ---
  const [rawInput, setRawInput] = useState('');
  const parseAndSave = () => {
    let segments = rawInput.split(/\n+/);
    if (segments.length === 1 && segments[0].includes(',') && !segments[0].includes('.')) {
      // Comma fallback
    }

    const newQuestions = segments.map((seg, idx) => {
      const dotIndex = seg.indexOf('.');
      if (dotIndex === -1) return null;
      const qText = seg.substring(0, dotIndex).trim();
      const aText = seg.substring(dotIndex + 1).trim();
      if (!qText || !aText) return null;

      return {
        id: Date.now() + idx,
        type: 'meaning',
        content: qText,
        instruction: 'Translate / Meaning',
        answer: aText,
        audioText: qText
      };
    }).filter(Boolean);

    if (newQuestions.length > 0) {
      onUpdateQuestions(category.id, newQuestions);
      setIsEditing(false);
      setCurrentIndex(0);
      setShowAnswer(false);
      setAutoPlay(false);
    } else {
      alert("Invalid format. Use: Question. Answer (per line)");
    }
  };

  if (isEditing) {
    return (
      <div className="flex flex-col h-full space-y-4 pt-10">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Edit Questions</h2>
          <button onClick={() => setIsEditing(false)} className="bg-white/10 p-2 rounded-full"><X /></button>
        </div>
        <textarea
          value={rawInput}
          onChange={e => setRawInput(e.target.value)}
          className="flex-1 bg-slate-800 rounded-2xl p-4 text-lg border border-white/20 focus:border-indigo-500 outline-none"
          placeholder="Enter list here...&#10;Bonjour. Hello&#10;Merci. Thank you"
        />
        <button onClick={parseAndSave} className="bg-indigo-600 p-4 rounded-xl font-bold text-xl mb-8">
          Save & Update
        </button>
      </div>
    );
  }

  // --- Main Quiz UI (Optimized for Mobile Vertical Space) ---
  return (
    <div className="flex flex-col h-full relative px-4 pb-2">

      {/* Top Controls: Jump, Count, Edit, Play Toggle */}
      <div className="flex items-center justify-between mb-4 shrink-0 h-16">
        <div className="flex items-center gap-3">
          <form onSubmit={handleJump} className="flex items-center bg-slate-800 rounded-lg p-1 border border-white/10 h-10 shadow-sm">
            <span className="text-xs text-slate-400 pl-2">#</span>
            <input
              type="number"
              value={jumpInput}
              onChange={e => setJumpInput(e.target.value)}
              className="w-10 bg-transparent text-center text-white outline-none text-base"
              placeholder={currentIndex + 1}
            />
          </form>
          <div className="text-slate-400 text-sm font-mono tracking-widest hidden md:block">
            of {category.questions.length}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button onClick={() => setIsEditing(true)} className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/5 active:bg-white/10">
            <Edit3 size={24} />
          </button>

          {/* Prominent Play/Pause Toggle */}
          <button
            onClick={toggleAutoPlay}
            className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold shadow-xl transition-all active:scale-95 ${autoPlay
                ? 'bg-rose-500 hover:bg-rose-600 text-white'
                : 'bg-emerald-500 hover:bg-emerald-600 text-white'
              }`}
          >
            {autoPlay ? (
              <>
                <Square size={20} fill="currentColor" />
                <span className="uppercase text-sm tracking-wider font-extrabold">Stop</span>
              </>
            ) : (
              <>
                <Play size={20} fill="currentColor" />
                <span className="uppercase text-sm tracking-wider font-extrabold">Play</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Content Area - Maximized Space & Centered */}
      <div className="flex-1 flex flex-col items-center justify-center gap-8 py-4 relative w-full">

        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            className="w-full max-w-full text-center flex flex-col gap-6 px-1 break-words"
          >
            {/* Instruction */}
            <p className="text-indigo-300 text-xl font-medium tracking-wide opacity-80 uppercase text-sm">
              {question.instruction}
            </p>

            {/* Question Text - HUGE & WRAPPED */}
            <div
              onClick={manualSpeak}
              className="cursor-pointer active:scale-95 transition-transform select-none"
            >
              <h2 className="text-5xl xs:text-6xl md:text-8xl font-black text-white drop-shadow-2xl leading-tight tracking-tight px-1">
                {question.content}
              </h2>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Answer Section */}
        <div className="w-full text-center min-h-[140px] flex items-center justify-center">
          <AnimatePresence>
            {!showAnswer && !autoPlay ? (
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                onClick={() => { setShowAnswer(true); speak(question.answer, 'fr-FR', speechRate); }}
                className="px-10 py-5 bg-white/10 hover:bg-white/15 border border-white/20 rounded-3xl text-2xl font-bold backdrop-blur-sm"
              >
                Show Answer
              </motion.button>
            ) : showAnswer ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full"
              >
                <div className="text-5xl md:text-7xl font-bold text-emerald-400 drop-shadow-lg">
                  {question.answer}
                </div>
              </motion.div>
            ) : (
              /* Placeholder for layout stability during auto-play wait */
              <div className="h-10"></div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Bottom Nav Controls */}
      <div className="grid grid-cols-3 gap-6 pt-4 shrink-0 h-24">
        <button
          onClick={handlePrev}
          className="flex items-center justify-center rounded-3xl bg-slate-800/80 hover:bg-slate-800 text-white active:bg-slate-700 transition-colors border border-white/5"
        >
          <ArrowLeft size={36} />
        </button>

        {/* Replay Audio */}
        <button
          onClick={manualSpeak}
          className="flex items-center justify-center rounded-3xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 active:scale-95 transition-all"
        >
          <Volume2 size={40} />
        </button>

        <button
          onClick={() => handleNext(false)}
          className="flex items-center justify-center rounded-3xl bg-slate-800/80 hover:bg-slate-800 text-white active:bg-slate-700 transition-colors border border-white/5"
        >
          <ArrowRight size={36} />
        </button>
      </div>

    </div>
  );
};

export default App;
