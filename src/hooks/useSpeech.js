import { useState, useEffect, useRef, useCallback } from 'react';

export const useSpeech = () => {
  const [voices, setVoices] = useState([]);
  const synth = window.speechSynthesis;
  const activeUtteranceRef = useRef(null);

  useEffect(() => {
    const updateVoices = () => setVoices(synth.getVoices());
    updateVoices();
    synth.onvoiceschanged = updateVoices;
    return () => { synth.onvoiceschanged = null; };
  }, [synth]);

  const speak = useCallback((text, lang = 'fr-FR', rate = 1.0, onEnd) => {
    if (!synth || !text) {
      if (onEnd) onEnd();
      return;
    }

    // Cancel any current speech
    synth.cancel();

    const utterance = new SpeechSynthesisUtterance(text);

    // Prefer a French voice if requested
    if (lang.startsWith('fr')) {
      // Try to find a high-quality google voice first if available, otherwise any french
      const frenchVoice = voices.find(v => v.name.includes('Google') && v.lang.includes('fr')) || voices.find(v => v.lang.includes('fr'));
      if (frenchVoice) utterance.voice = frenchVoice;
    }

    utterance.lang = lang;
    utterance.rate = rate;
    activeUtteranceRef.current = utterance;

    utterance.onend = () => {
       activeUtteranceRef.current = null;
       if (onEnd) onEnd();
    };

    utterance.onerror = (e) => {
      console.error("Speech error", e);
      activeUtteranceRef.current = null;
      if (onEnd) onEnd();
    };

    synth.speak(utterance);
  }, [voices, synth]);

  const cancel = useCallback(() => {
    synth.cancel();
    activeUtteranceRef.current = null;
  }, [synth]);

  return { speak, cancel, voices };
};
