// Frontend/src/components/CodeEditor.jsx

import React, { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { Button } from '@mui/material'; 
import styles from "../styles/videoComponant.module.css";


function CodeEditor({ socket, roomId }) {
    
    const [code, setCode] = useState('console.log("Hello, Apka Code!");');
    const [language, setLanguage] = useState('javascript');
    const [output, setOutput] = useState('Output will appear here...');

    useEffect(() => {
        if (!socket) return;
        
        socket.on("code-output", (data) => {
            console.log("Received code output:", data.output);
            setOutput(data.output); 
        });
        
        return () => {
            socket.off("code-output");
        };
    }, [socket]);
    const handleCodeChange = (value) => {
        setCode(value);
    };
    
    const runCode = () => {
        if (!socket || !roomId) return;
        
        setOutput('Running code...'); 


        socket.emit("run-code", {
            roomId: roomId,
            code: code,
            language: language 
        });
        console.log("DEBUG: 'run-code' event emitted successfully.");
    };

    return (
        <div className={styles.codeEditorBox}>
            <div className={styles.mainScreen}>
                <div className={styles.navbarCodeeditor}>
                    <select 
                        value={language} 
                        onChange={(e) => setLanguage(e.target.value)}
                    >
                        <option value="javascript">JavaScript</option>
                         <option value="python">C</option>
                          <option value="python">C++</option>
                           <option value="python">JAVA</option>
                            <option value="python">HTML</option>
                             <option value="python">CSS</option>
                                <option value="python">Python</option>
                        <option value="python">Python</option>
                    </select>
                    
                    <Button variant="contained" color="success" onClick={runCode}>
                        Run Code
                    </Button>
                </div>
                
                <Editor
                    height="95%"
                    value={code} 
                    language={language} 
                    theme="vs-dark"
                    onChange={handleCodeChange} 
                />
            </div>
            <div className={styles.consoleoutput}>
                <h3>Output:</h3>
                <pre>
                    {output} 
                </pre>
            </div>
        </div>
    );
}

export default CodeEditor;