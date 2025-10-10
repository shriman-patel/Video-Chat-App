import { useRef, useState } from "react";
import { Box, Stack } from "@mui/material"; 
import { Editor } from "@monaco-editor/react";
import LanguageSelector from "./LanguageSelector";
import { CODE_SNIPPETS } from "../constants";
import Output from "./Output";

const CodeEditor = () => {
    const editorRef = useRef();

    const [value, setValue] = useState(""); 
    const [language, setLanguage] = useState("javascript");

    const onMount = (editor) => {
        editorRef.current = editor;
        editor.focus();
    };

    const onSelect = (language) => {
        setLanguage(language);
        setValue(CODE_SNIPPETS[language]);
    };

    return (
        <Box> 
        
            <Stack direction="row" spacing={4}> 
                <Box sx={{ width: "50%" }}>
                    <LanguageSelector language={language} onSelect={onSelect} />
                    <Editor
                        options={{
                            minimap: {
                                enabled: false,
                            },
                        }}
                        height="75vh"
                        theme="vs-dark"
                        language={language}
                        defaultValue={CODE_SNIPPETS[language]}
                        onMount={onMount}
                        value={value}
                        onChange={(value) => setValue(value)}
                    />
                </Box>
                <Output editorRef={editorRef} language={language} />
            </Stack>
        </Box>
    );
};
export default CodeEditor;