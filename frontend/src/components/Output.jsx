import React, { useState } from "react";
// MUI imports
import { Box, Button, Typography, Alert, Snackbar } from "@mui/material"; 
// Note: useToast is a Chakra-specific hook, so we'll use MUI Snackbar/Alert for messaging.
import { executeCode } from "../api";

const Output = ({ editorRef, language }) => {
    // MUI Snackbar state for showing messages (like a toast)
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
            
            // Success message on successful run (optional)
            if (!result.stderr) {
                showSnackbar("Code executed successfully!", "success");
            }

        } catch (error) {
            console.log(error);
            // Chakra toast logic replaced with MUI Snackbar/Alert
            showSnackbar(error.message || "Unable to run code", "error");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSnackbarClose = (event, reason) => {
        if (reason === 'clickaway') return;
        setSnackbarOpen(false);
    };

    return (
        <Box sx={{ width: "50%" }}>
            {/* Chakra Text को Typography से बदला गया */}
            <Typography variant="h6" mb={2} color="#fff">
                Output
            </Typography>
            
            {/* Chakra Button को MUI Button से बदला गया */}
            <Button
                variant="outlined" // variant="outline" के समान
                color="success" // colorScheme="green" के समान
                sx={{ mb: 4 }}
                disabled={isLoading} // MUI में isLoading के बजाय disabled का उपयोग करें
                onClick={runCode}
            >
                {isLoading ? "Running..." : "Run Code"}
            </Button>
            
            {/* Output Box */}
            <Box
                sx={{
                    height: "75vh",
                    p: 2,
                    // Error color handling
                    color: isError ? "red" : "lime", // red.400 के समान
                    border: '1px solid',
                    borderRadius: 1, // borderRadius={4} के समान
                    borderColor: isError ? "red" : "#333", // red.500 के समान
                    overflow: 'auto' // सुनिश्चित करें कि आउटपुट स्क्रॉल होता रहे
                }}
            >
                {output
                    ? output.map((line, i) => (
                        // Chakra Text को Typography से बदला गया
                        <Typography
                            key={i}
                            // Successful output color is now handled by the parent Box's color prop
                            sx={{ color: isError ? "red" : "lime" }} 
                        >
                            {line}
                        </Typography>
                    ))
                    : (
                        <Typography color="gray.400">
                            'Click "Run Code" to see the output here'
                        </Typography>
                    )
                }
            </Box>

            {/* MUI Snackbar for showing "toasts" */}
            <Snackbar
                open={snackbarOpen}
                autoHideDuration={6000}
                onClose={handleSnackbarClose}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%' }}>
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </Box>
    );
};
export default Output;