import { useState, useEffect, useRef, useCallback } from 'react';

// Simple heuristic language detector
const detectLanguage = (text) => {
    const t = text.trim().toLowerCase();

    // Strong French indicators (accents, unique words)
    // excluding common shared words or ambiguous ones
    const frPattern = /[éèàùçâêîôûëïü]|(\b(le|la|les|un|une|des|du|est|sont|il|elle|ils|elles|je|tu|nous|vous|c'est|pas|mais|ou|et|donc|or|ni|car|que|qui|quoi|où|quand|comment|pourquoi|avec|dans|sur|sous)\b)/i;

    // Strong English indicators
    const enPattern = /\b(the|a|an|is|are|was|were|has|have|had|he|she|it|we|they|my|your|his|her|its|our|their|this|that|these|those|there|where|when|why|how|what|who|which)\b/i;

    const frScore = (t.match(frPattern) || []).length;
    // 'th' is very english
    const enScore = (t.match(enPattern) || []).length + (t.includes('th') ? 1 : 0);

    if (frScore > enScore) return 'fr-FR';
    if (enScore > frScore) return 'en-US';

    return null; // Indeterminate
};

export const useSpeech = () => {
    const [voices, setVoices] = useState([]);
    const synth = window.speechSynthesis;

    const activeUtteranceRef = useRef(null);
    const timeoutRef = useRef(null);
    const isCancelledRef = useRef(false);
    const speakRequestIdRef = useRef(0);

    useEffect(() => {
        const updateVoices = () => {
            const vs = synth.getVoices();
            setVoices(vs);
        };
        updateVoices();
        synth.onvoiceschanged = updateVoices;
        return () => { synth.onvoiceschanged = null; };
    }, [synth]);

    const cancel = useCallback(() => {
        isCancelledRef.current = true;
        speakRequestIdRef.current++; // Invalidate any ongoing speak process
        synth.cancel();
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }
        activeUtteranceRef.current = null;
    }, [synth]);

    const speak = useCallback((text, defaultLang = 'fr-FR', rate = 1.0, onEnd, gender = null) => {
        // 1. Reset state
        cancel();
        isCancelledRef.current = false;
        const currentRequestId = speakRequestIdRef.current;

        if (!synth || !text) {
            if (onEnd) onEnd();
            return;
        }

        // 2. Parse text for tags like <2>, <3> (seconds delay)
        // and split by sentences for polyglot support

        // Step A: Split by Wait Tags
        const rawSegments = text.split(/<(\d+)>/).map((part, i) => {
            if (i % 2 === 1) { // Captured digit -> Wait
                const seconds = parseInt(part, 10);
                return { type: 'wait', value: seconds * 1000 };
            }
            if (!part.trim()) return null;
            return { type: 'text', value: part };
        }).filter(Boolean);

        // Step B: Expand Text segments into Sentences (for Lang Detection)
        const finalQueue = [];

        // Intl.Segmenter is best for sentence splitting (modern browsers)
        const segmenter = typeof Intl !== 'undefined' && Intl.Segmenter
            ? new Intl.Segmenter('fr', { granularity: 'sentence' })
            : null;

        rawSegments.forEach(seg => {
            if (seg.type === 'wait') {
                finalQueue.push(seg);
            } else {
                // Split text into sentences
                let sentences = [];
                if (segmenter) {
                    sentences = Array.from(segmenter.segment(seg.value)).map(s => s.segment);
                } else {
                    // Fallback regex split (basic)
                    sentences = seg.value.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [seg.value];
                }

                sentences.forEach(s => {
                    if (!s.trim()) return;
                    const detected = detectLanguage(s);
                    // Use detected lang, or fallback to default (usually fr-FR from props), 
                    // BUT if default is FR and we explicitly detect EN words, swap.
                    // If indeterminate, stick to default.
                    const langToUse = detected || defaultLang;
                    finalQueue.push({ type: 'speak', value: s.trim(), lang: langToUse, gender });
                });
            }
        });

        if (finalQueue.length === 0) {
            if (onEnd) onEnd();
            return;
        }

        // 3. Process Queue
        let currentIndex = 0;

        const processNext = () => {
            // Check both cancelled flag AND request ID consistency
            if (isCancelledRef.current || speakRequestIdRef.current !== currentRequestId) return;

            // check if done
            if (currentIndex >= finalQueue.length) {
                activeUtteranceRef.current = null;
                if (onEnd) onEnd();
                return;
            }

            const item = finalQueue[currentIndex];
            currentIndex++;

            if (item.type === 'wait') {
                timeoutRef.current = setTimeout(processNext, item.value);
            } else {
                // Speak
                const utterance = new SpeechSynthesisUtterance(item.value);
                const lang = item.lang;
                const itemGender = item.gender;

                // Voice selection logic
                if (lang.startsWith('fr')) {
                    let frenchVoice = null;
                    if (itemGender === 'male') {
                        frenchVoice = voices.find(v => (v.name.includes('Thomas') || v.name.includes('Nicolas') || v.name.includes('Paul') || v.name.includes('Jacques') || v.name.includes('Male')) && v.lang.includes('fr'));
                        if (!frenchVoice && itemGender) {
                            // Fallback with pitch
                            frenchVoice = voices.find(v => v.lang.includes('fr'));
                            utterance.pitch = 0.85;
                        }
                    } else if (itemGender === 'female') {
                        frenchVoice = voices.find(v => (v.name.includes('Amelie') || v.name.includes('Audrey') || v.name.includes('Marie') || v.name.includes('Google') || v.name.includes('Female')) && v.lang.includes('fr'));
                        if (!frenchVoice && itemGender) {
                            // Fallback with pitch
                            frenchVoice = voices.find(v => v.lang.includes('fr'));
                            utterance.pitch = 1.15;
                        }
                    }

                    // Default fallback if no specific gender voice found/requested
                    if (!frenchVoice) {
                        frenchVoice = voices.find(v => v.name.includes('Google') && v.lang.includes('fr'))
                            || voices.find(v => v.lang.includes('fr'));
                    }

                    if (frenchVoice) utterance.voice = frenchVoice;

                } else if (lang.startsWith('en')) {
                    const englishVoice = voices.find(v => v.name.includes('Google') && v.lang.includes('en-US'))
                        || voices.find(v => v.name.includes('Samantha'))
                        || voices.find(v => v.lang.includes('en'));
                    if (englishVoice) utterance.voice = englishVoice;
                }
                // else let browser default

                utterance.lang = lang;
                utterance.rate = rate;

                utterance.onend = () => {
                    if (!isCancelledRef.current && speakRequestIdRef.current === currentRequestId) {
                        processNext();
                    }
                };

                utterance.onerror = (e) => {
                    // Check ID before proceeding
                    if (!isCancelledRef.current && speakRequestIdRef.current === currentRequestId) {
                        processNext();
                    }
                };

                activeUtteranceRef.current = utterance;
                synth.speak(utterance);
            }
        };

        // Start
        processNext();

    }, [voices, synth, cancel]);

    return { speak, cancel, voices };
};
