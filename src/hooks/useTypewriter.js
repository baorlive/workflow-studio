import { useState, useEffect, useRef, useCallback } from 'react';

const useTypewriter = (phrases, options = {}) => {
    const {
        typingSpeed = 50,
        deletingSpeed = 30,
        pauseDuration = 2000,
        cursorChar = '|',
        enabled = true,
        loop = true
    } = options;

    const [text, setText] = useState('');
    const [isTyping, setIsTyping] = useState(false); // true = typing/deleting, false = idle
    const [cursorVisible, setCursorVisible] = useState(true);
    
    // Refs to keep track of state inside timeouts without dependencies issues
    const stateRef = useRef({
        phraseIndex: 0,
        charIndex: 0,
        isDeleting: false,
        isPaused: false
    });
    
    const timeoutRef = useRef(null);
    const cursorIntervalRef = useRef(null);

    const type = useCallback(() => {
        const currentPhrase = phrases[stateRef.current.phraseIndex];
        
        if (stateRef.current.isPaused || !enabled) return;

        setIsTyping(true);

        if (stateRef.current.isDeleting) {
            // Deleting
            if (stateRef.current.charIndex > 0) {
                stateRef.current.charIndex--;
                setText(currentPhrase.substring(0, stateRef.current.charIndex));
                timeoutRef.current = setTimeout(type, deletingSpeed);
            } else {
                // Finished deleting, move to next phrase
                stateRef.current.isDeleting = false;
                stateRef.current.phraseIndex = (stateRef.current.phraseIndex + 1) % phrases.length;
                
                // If not looping and reached the end, stop here (though requirements say continuous loop)
                if (!loop && stateRef.current.phraseIndex === 0) {
                    setIsTyping(false);
                    return;
                }
                
                timeoutRef.current = setTimeout(type, typingSpeed);
            }
        } else {
            // Typing
            if (stateRef.current.charIndex < currentPhrase.length) {
                stateRef.current.charIndex++;
                setText(currentPhrase.substring(0, stateRef.current.charIndex));
                
                // Randomize typing speed slightly for realism
                const randomSpeed = typingSpeed + (Math.random() * 50 - 25); 
                timeoutRef.current = setTimeout(type, Math.max(20, randomSpeed));
            } else {
                // Finished typing, pause before deleting
                stateRef.current.isDeleting = true;
                setIsTyping(false); // Technically idle waiting
                timeoutRef.current = setTimeout(type, pauseDuration);
            }
        }
    }, [phrases, typingSpeed, deletingSpeed, pauseDuration, enabled, loop]);

    // Start/Stop effect
    useEffect(() => {
        if (enabled) {
            timeoutRef.current = setTimeout(type, typingSpeed);
        } else {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        }

        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, [enabled, type, typingSpeed]);

    // Blinking cursor effect
    useEffect(() => {
        cursorIntervalRef.current = setInterval(() => {
            if (!stateRef.current.isDeleting && stateRef.current.charIndex === phrases[stateRef.current.phraseIndex]?.length) {
                 // Only blink when fully typed and waiting
                 setCursorVisible(v => !v);
            } else if (stateRef.current.isDeleting || stateRef.current.charIndex < phrases[stateRef.current.phraseIndex]?.length) {
                // Always show cursor while typing or deleting
                setCursorVisible(true);
            }
        }, 500);

        return () => {
            if (cursorIntervalRef.current) clearInterval(cursorIntervalRef.current);
        };
    }, [phrases]);

    const pause = useCallback(() => {
        stateRef.current.isPaused = true;
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        setIsTyping(false);
    }, []);

    const resume = useCallback(() => {
        if (stateRef.current.isPaused) {
            stateRef.current.isPaused = false;
            type();
        }
    }, [type]);

    return {
        text: `${text}${cursorVisible ? cursorChar : ''}`,
        isTyping,
        pause,
        resume
    };
};

export default useTypewriter;
