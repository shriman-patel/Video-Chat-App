import { useRef, useState, useEffect } from "react";
import { Box, Stack } from "@mui/material";
import Editor, { loader } from "@monaco-editor/react";
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

  // ✅ Custom Premium Theme
  useEffect(() => {
    loader.init().then((monaco) => {
      monaco.editor.defineTheme("premium-dracula", {
        base: "vs-dark",
        inherit: true,
        rules: [
          { token: "", foreground: "EAEAEA", background: "0f172a" },
          { token: "keyword", foreground: "7aa2f7", fontStyle: "bold" },
          { token: "string", foreground: "a6e3a1" },
          { token: "number", foreground: "f5c2e7" },
          { token: "comment", foreground: "7f849c", fontStyle: "italic" },
          { token: "function", foreground: "89b4fa" },
          { token: "variable", foreground: "f38ba8" },
        ],
        colors: {
          "editor.background": "#0f172a",
          "editor.foreground": "#EAEAEA",
          "editorCursor.foreground": "#7aa2f7",
          "editor.lineHighlightBackground": "#1e293b80",
          "editor.selectionBackground": "#334155",
          "editorLineNumber.foreground": "#64748b",
          "editorLineNumber.activeForeground": "#cbd5e1",
          "editorIndentGuide.background": "#1e293b",
          "editor.selectionHighlightBackground": "#3b82f650",
        },
      });
    });
  }, []);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #0f172a, #1e293b)",
        padding: "2rem",
        fontFamily: "Poppins, sans-serif",
      }}
    >
      <Stack
        direction="row"
        spacing={4}
        sx={{
          flexWrap: "nowrap", // ✅ Row fix
          justifyContent: "flex-start", // ✅ Left align
          alignItems: "flex-start",
          gap: "2rem",
        }}
      >
        {/* ✅ Left Side (Editor - Fixed 50%) */}
        <Box
          sx={{
            width: "50%",
            background: "linear-gradient(135deg, #1e1b2e, #2b2540)",
            borderRadius: "12px",
            padding: "1rem",
            boxShadow: "0 8px 20px rgba(0,0,0,0.4)",
          }}
        >
          <LanguageSelector language={language} onSelect={onSelect} />
          <Editor
            options={{
              minimap: { enabled: false },
              fontSize: 15,
              fontFamily: "JetBrains Mono, monospace",
              lineHeight: 22,
              smoothScrolling: true,
              scrollBeyondLastLine: false,
              automaticLayout: true,
            }}
            height="75vh"
            theme="premium-dracula"
            language={language}
            defaultValue={CODE_SNIPPETS[language]}
            onMount={onMount}
            value={value}
            onChange={(value) => setValue(value)}
          />
        </Box>

        {/* ✅ Right Side (Output) */}
        <Output editorRef={editorRef} language={language} />
      </Stack>
    </Box>
  );
};

export default CodeEditor;
