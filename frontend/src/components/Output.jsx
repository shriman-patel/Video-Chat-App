import React, { useState } from "react";
import { Box, Button, Typography, Alert, Snackbar } from "@mui/material";
import { executeCode } from "../api";

const Output = ({ editorRef, language }) => {
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("error");
  const [output, setOutput] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);

  const showSnackbar = (message, severity = "error") => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const runCode = async () => {
    const sourceCode = editorRef.current.getValue();
    if (!sourceCode) return;
    try {
      setIsLoading(true);
      const { run: result } = await executeCode(language, sourceCode);
      setOutput(result.output.split("\n"));
      result.stderr ? setIsError(true) : setIsError(false);

      if (!result.stderr) {
        showSnackbar("✅ Code executed successfully!", "success");
      }
    } catch (error) {
      console.log(error);
      showSnackbar(error.message || "Unable to run code", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === "clickaway") return;
    setSnackbarOpen(false);
  };

  return (
    <Box
      sx={{
        width: "50%", // 👈 same position, same width
        background: "linear-gradient(135deg, #1e1b2e, #2b2540)", // dark premium background
        borderRadius: "12px",
        padding: "1.5rem",
        boxShadow: "0 8px 20px rgba(0, 0, 0, 0.4)",
        color: "#fff",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-start",
      }}
    >
      {/* Heading */}
      <Typography
        variant="h6"
        mb={2}
        sx={{
          fontWeight: 600,
          color: "#EAEAEA",
          fontFamily: "Poppins, sans-serif",
          fontSize: "1.1rem",
        }}
      >
        Output
      </Typography>

      {/* Run Button */}
      <Button
        variant="contained"
        color="success"
        sx={{
          mb: 3,
          alignSelf: "flex-start",
          background: "linear-gradient(90deg, #22c55e, #16a34a)",
          fontWeight: 600,
          textTransform: "none",
          fontSize: "0.9rem",
          boxShadow: "0 4px 12px rgba(34, 197, 94, 0.4)",
          "&:hover": {
            background: "linear-gradient(90deg, #16a34a, #22c55e)",
            boxShadow: "0 6px 16px rgba(34, 197, 94, 0.6)",
          },
        }}
        disabled={isLoading}
        onClick={runCode}
      >
        {isLoading ? "Running..." : "Run Code"}
      </Button>

      {/* Output Box */}
      <Box
        sx={{
          height: "75vh",
          p: 2,
          border: `1px solid ${isError ? "#ef4444" : "#4ade80"}`,
          borderRadius: "8px",
          backgroundColor: "#0f172a", // dark navy like editor
          overflow: "auto",
          boxShadow: isError
            ? "0 0 12px rgba(239,68,68,0.3)"
            : "0 0 12px rgba(74,222,128,0.3)",
          transition: "all 0.3s ease",
        }}
      >
        {output ? (
          output.map((line, i) => (
            <Typography
              key={i}
              sx={{
                fontFamily: "JetBrains Mono, monospace",
                color: isError ? "#ef4444" : "#4ade80",
                fontSize: "0.9rem",
                whiteSpace: "pre-wrap",
              }}
            >
              {line}
            </Typography>
          ))
        ) : (
          <Typography sx={{ color: "#9ca3af", fontStyle: "italic" }}>
            💡 Click "Run Code" to see the output here
          </Typography>
        )}
      </Box>

      {/* Snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbarSeverity}
          sx={{
            width: "100%",
            backgroundColor:
              snackbarSeverity === "success" ? "#16a34a" : "#ef4444",
            color: "#fff",
            fontWeight: 500,
          }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Output;
