// File: hooks/useCodeEditorState.js

import { useState, useEffect, useCallback } from 'react';

// हमने stopScreenShare आर्गुमेंट को हटा दिया है
const useCodeEditorState = (socketRef, roomPath) => { 
    const [isCodingMode, setIsCodingMode] = useState(false);

    // Code Editor को ऑन/ऑफ करने का मुख्य फ़ंक्शन
    const toggleCodeEditor = useCallback(async () => {
        const nextCodingMode = !isCodingMode;

        // **IMPORTANT:** यहाँ से स्क्रीन शेयरिंग को बंद करने का लॉजिक हटा दिया गया है। 
        // यह ज़िम्मेदारी अब toggleScreenShare फ़ंक्शन की है (जब screen share ON होता है)।

        // स्टेट अपडेट करें
        setIsCodingMode(nextCodingMode);

        // अन्य यूज़र्स को सूचित करने के लिए सॉकेट एमिट करें
        if (socketRef.current) {
            socketRef.current.emit("toggle-coding-mode", nextCodingMode);
        }
    }, [isCodingMode, socketRef]);


    // सॉकेट इवेंट को हैंडल करें जब कोई और कोड मोड को टॉगल करता है
    useEffect(() => {
        const socket = socketRef.current;
        if (!socket) return;

        const handleToggleCodingMode = (mode) => {
            setIsCodingMode(mode);
        };

        socket.on("toggle-coding-mode", handleToggleCodingMode);

        return () => {
            socket.off("toggle-coding-mode", handleToggleCodingMode);
        };
    }, [socketRef]);

    return {
        isCodingMode,
        setIsCodingMode, 
        toggleCodeEditor,
    };
};

export default useCodeEditorState;