// src/controller/codeExecutionController.js

import axios from 'axios';

// 🚨🚨🚨 आवश्यक बदलाव 🚨🚨🚨
// आपको JDoodle पर एक निःशुल्क खाता बनाना होगा और अपनी कुंजियाँ यहाँ डालनी होंगी।
const JDOODLE_CLIENT_ID = "9fdd30556175b074f1b72b60dbc8f807"; 
const JDOODLE_CLIENT_SECRET = "677577a17bfcc525dc38324ead55c3fc0f2525a3b297ecce48227773cf096478"; 

// JDoodle API का बेस URL
const JDOODLE_API_URL = 'https://api.jdoodle.com/v1/execute';

/**
 * कोड को JDoodle API के माध्यम से एग्जीक्यूट करता है।
 * @param {string} code - चलाने के लिए कोड स्ट्रिंग
 * @param {string} language - कोड की भाषा (जैसे: 'javascript', 'python3', 'java')
 * @returns {Promise<string>} - आउटपुट स्ट्रिंग
 */
export async function executeCode(code, language) {
    
    // 1. JDoodle के लिए भाषा और वर्जन मैपिंग (JDoodle API Docs के अनुसार)
    const languageMap = {
        javascript: { lang: 'nodejs', version: '4' }, // JDoodle 'javascript' को 'nodejs' कहता है
        python: { lang: 'python3', version: '4' },
        java: { lang: 'java', version: '4' },
        // 'c', 'cpp', 'php' आदि भी उपलब्ध हैं।
    };

    const config = languageMap[language.toLowerCase()];

    if (!config) {
        return `Unsupported language: ${language}. Please select JavaScript, Python, or Java.`;
    }

    if (JDOODLE_CLIENT_ID === "YOUR_CLIENT_ID" || JDOODLE_CLIENT_SECRET === "YOUR_CLIENT_SECRET") {
        return "FATAL ERROR: Please set your JDoodle Client ID and Secret in codeExecutionController.js";
    }

    try {
        const payload = {
            clientId: JDOODLE_CLIENT_ID,
            clientSecret: JDOODLE_CLIENT_SECRET,
            script: code,
            language: config.lang,
            versionIndex: config.version,
            // stdin (इनपुट) को यहाँ जोड़ा जा सकता है
        };

        const response = await axios.post(JDOODLE_API_URL, payload);

        // JDoodle Response Structure: { output, statusCode, cpuTime, memory }

        const output = response.data.output;
        const statusCode = response.data.statusCode;
        
        if (statusCode !== 200) {
            // यदि API ने एरर कोड (जैसे कंपाइल एरर) वापस किया
            return `Execution Error (Status ${statusCode}):\n${output || 'Unknown error occurred.'}`;
        }
        
        return output;

    } catch (error) {
        console.error("JDoodle API Call Failed:", error.message);
        
        if (error.response) {
            // यदि नेटवर्क एरर या HTTP स्टेटस 4xx/5xx
            return `Compiler Service Error: Status ${error.response.status} - ${error.response.data.output || 'Unknown API Error'}`;
        } else {
            // यदि नेटवर्क एरर है (जैसे इंटरनेट कनेक्शन नहीं है या Axios इंस्टॉल नहीं है)
            return `Network Error: Could not connect to compiler service (${error.message}). Please check your internet/Axios installation.`;
        }
    }
}