// Frontend/src/components/CodeEditor.js

import React, { useState, useEffect } from 'react';
// @monaco-editor/react library ko install karna zaroori hai
import Editor from '@monaco-editor/react';

// NOTE: Yeh component assume karta hai ki aap isko 'socket' aur 'roomPath' props de rahe hain.

function CodeEditor({ socket, roomId }) {
    // 1. State for Code and Language (Shuruwat mein yeh code sabko milega)
    const [code, setCode] = useState('// Welcome to the collaborative editor!\nconsole.log("Hello World");');
    const [language, setLanguage] = useState('javascript');
    
    // Flag to handle initial code state (optional, advanced feature for later)
    // const [isEditorReady, setIsEditorReady] = useState(false);

    // 2. Real-time Code Receive Listener (useEffect)
    useEffect(() => {
        if (!socket) return;
        
        // Backend se 'receive-code-change' event sunna
        socket.on("receive-code-change", (data) => {
            console.log("Received code from colleague");
            
            // Received code aur language se local state update karna
            // Hum directly state ko update karte hain.
            setCode(data.code);
            // setLanguage(data.language); // Agar language change ki functionality hai to
        });

        // Cleanup: component remove hone par listener hata do
        return () => {
            socket.off("receive-code-change");
        };
    }, [socket]); // Dependency: socket object change hone par hi chalta hai


    // 3. Code Change Handler (Code Bhejna)
    const handleCodeChange = (value) => {
        // A. Local state turant update karo
        setCode(value);

        // B. Socket se dusron ko bhejo
        if (socket && roomId) {
            // 'code-change' event backend ko bhejo
            socket.emit("code-change", {
                // Backend mein matchingRoom ke liye roomPath (meeting ID) zaroori hai
                roomId: roomId, 
                code: value,
                language: language 
            });
        }
    };
    
    // 4. Monaco Editor ka UI
    return (
        <div style={{ height: '90vh', width: '100%', border: '1px solid #333', display: 'flex', flexDirection: 'column' }}>
            
            {/* Language Selector (Optional) */}
            <div style={{ padding: '5px', backgroundColor: '#252526' }}>
                <select 
                    value={language} 
                    onChange={(e) => setLanguage(e.target.value)}
                    style={{ background: '#3C3C3C', color: 'white', padding: '5px' }}
                >
                    <option value="javascript">JavaScript</option>
                    <option value="python">Python</option>
                    <option value="java">Java</option>
                    {/* Aur languages add karein */}
                </select>
            </div>
            
            <Editor
                height="100%"
                // Editor ki value state se aayegi
                value={code} 
                language={language} 
                theme="vs-dark"
                // onChange par data bhejne ka function call hoga
                onChange={handleCodeChange} 
                options={{
                    minimap: { enabled: false },
                    fontSize: 16
                }}
            />
        </div>
    );
}

export default CodeEditor;