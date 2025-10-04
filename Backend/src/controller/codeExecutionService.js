// Backend/src/services/codeExecutionService.js

// 🚨 सुनिश्चित करें कि यह पाथ सही है, जो codeExecutionController.js को दर्शाता है
import { executeCode } from './codeExecutionController.js'; 
// (पाथ को अपनी फ़ाइल संरचना के अनुसार बदलें)

/**
 * Socket.IO कनेक्शन पर कोड एग्जीक्यूशन और शेयरिंग लिसनर्स को जोड़ता है।
 * @param {Socket} socket - वर्तमान क्लाइंट कनेक्शन सॉकेट ऑब्जेक्ट।
 * @param {Server} io - मुख्य Socket.IO सर्वर इंस्टेंस।
 */
// ✅ फ़ंक्शन का नाम बदला गया है (जैसा कि हमने socketManager में इम्पोर्ट किया है)
export function registerCodeListeners(socket, io) { 
    
    // 1. कोड रन करने पर
    socket.on("run-code", async ({ roomId, code, language }) => {
        console.log(`[EXECUTION_SERVICE]: Run Code event received for Room: ${roomId}.`);
        
        // क्लाइंट को तुरंत संदेश भेजें
        io.to(roomId).emit('code-output', { output: "Running code..." });

        try {
            // executeCodeController से असली फ़ंक्शन कॉल करें
            const outputText = await executeCode(code, language); 
            
            // आउटपुट सभी क्लाइंट्स को भेजें
            io.to(roomId).emit('code-output', { output: outputText });
            console.log(`[EXECUTION_SERVICE]: Code executed successfully. Output sent to room ${roomId}.`);

        } catch (error) {
            console.error("[EXECUTION_SERVICE]: Error during code execution:", error);
            // एरर को क्लाइंट को भेजें
            io.to(roomId).emit('code-output', { 
                output: `Server Execution Error: ${error.message}. Check Backend logs for details.` 
            });
        }
    });

    // 2. रियल-टाइम शेयरिंग
    socket.on("code-change", (data) => {
        // भेजने वाले को छोड़कर रूम में सभी को कोड भेजें
        socket.to(data.roomId).emit("receive-code-change", data);
    });

    // ❌ io.on("connection", ...) ब्लॉक हटा दिया गया है
}