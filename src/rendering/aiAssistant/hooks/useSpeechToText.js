'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { toast } from '@/components/toast';

export function useSpeechToText({ onResult, onStart, onEnd, onError, lang = 'en-US' } = {}) {
    const [isListening, setIsListening] = useState(false);
    const [isSupported, setIsSupported] = useState(false);
    const recognitionRef = useRef(null);
    const isManualStopRef = useRef(false);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            if (SpeechRecognition) {
                setIsSupported(true);
            }
        }
    }, []);

    const stopListening = useCallback(() => {
        isManualStopRef.current = true;
        if (recognitionRef.current) {
            try {
                recognitionRef.current.stop();
            } catch (err) {
                // Ignore if already stopped
            }
        }
        setIsListening(false);
    }, []);

    const startListening = useCallback(() => {
        if (typeof window === 'undefined') return;

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            toast.error('Voice input is not supported in this browser. Please use Chrome, Edge, or Safari.');
            return;
        }

        try {
            if (recognitionRef.current) {
                try {
                    recognitionRef.current.abort();
                } catch (e) {
                    // Ignore abort error
                }
            }

            const recognition = new SpeechRecognition();
            recognition.continuous = true;
            recognition.interimResults = true;
            recognition.lang = lang;
            recognition.maxAlternatives = 1;

            isManualStopRef.current = false;

            recognition.onstart = () => {
                setIsListening(true);
                if (onStart) onStart();
            };

            recognition.onresult = (event) => {
                let currentTranscript = '';
                let isFinal = false;

                for (let i = event.resultIndex; i < event.results.length; i++) {
                    const result = event.results[i];
                    currentTranscript += result[0].transcript;
                    if (result.isFinal) {
                        isFinal = true;
                    }
                }

                if (onResult) {
                    onResult(currentTranscript, isFinal);
                }
            };

            recognition.onerror = (event) => {
                console.warn('Speech recognition error:', event.error);
                if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
                    toast.error('Microphone permission denied. Please allow microphone access in your browser.');
                    setIsListening(false);
                } else if (event.error === 'no-speech') {
                    // Benign silence timeout, no intrusive toast needed
                } else if (event.error === 'network') {
                    toast.error('Speech recognition network error. Please check your internet connection.');
                    setIsListening(false);
                }
                if (onError) onError(event);
            };

            recognition.onend = () => {
                setIsListening(false);
                if (onEnd) onEnd();
            };

            recognitionRef.current = recognition;
            recognition.start();
        } catch (err) {
            console.error('Failed to start speech recognition:', err);
            toast.error('Unable to start voice input. Please try again.');
            setIsListening(false);
        }
    }, [lang, onResult, onStart, onEnd, onError]);

    const toggleListening = useCallback(() => {
        if (isListening) {
            stopListening();
        } else {
            startListening();
        }
    }, [isListening, startListening, stopListening]);

    useEffect(() => {
        return () => {
            if (recognitionRef.current) {
                try {
                    recognitionRef.current.abort();
                } catch (e) {
                    // Cleanup
                }
            }
        };
    }, []);

    return {
        isListening,
        isSupported,
        startListening,
        stopListening,
        toggleListening
    };
}
