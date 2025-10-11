import React, { useState } from 'react';
import { Box, Typography, Button, Menu, MenuItem } from '@mui/material';
import { LANGUAGE_VERSIONS } from "../constants";

const languages = Object.entries(LANGUAGE_VERSIONS);
const ACTIVE_COLOR = "#38bdf8"; // skyblue

const LanguageSelector = ({ language, onSelect }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);
  const handleSelect = (lang) => {
    onSelect(lang);
    handleClose();
  };

  return (
    <Box mb={2}>
      <Typography
        mb={1}
        sx={{
          color: "#EAEAEA",
          fontWeight: 600,
          fontFamily: "Poppins, sans-serif",
          fontSize: "0.95rem",
        }}
      >
        Language:
      </Typography>

      <Button
        variant="contained"
        onClick={handleClick}
        sx={{
          background: "linear-gradient(90deg, #3b82f6, #2563eb)",
          color: "#fff",
          textTransform: "none",
          fontWeight: 600,
          borderRadius: "8px",
          fontSize: "0.9rem",
          px: 2,
          boxShadow: "0 4px 10px rgba(59,130,246,0.4)",
          "&:hover": {
            background: "linear-gradient(90deg, #2563eb, #3b82f6)",
            boxShadow: "0 6px 14px rgba(59,130,246,0.6)",
          },
        }}
      >
        {language}
      </Button>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        PaperProps={{
          sx: {
            backgroundColor: "#0f172a",
            color: "white",
            border: "1px solid #1e293b",
            borderRadius: "8px",
            mt: 1,
            boxShadow: "0 8px 20px rgba(0,0,0,0.5)",
          },
        }}
      >
        {languages.map(([lang, version]) => (
          <MenuItem
            key={lang}
            onClick={() => handleSelect(lang)}
            sx={{
              fontFamily: "JetBrains Mono, monospace",
              color: lang === language ? ACTIVE_COLOR : "#E5E7EB",
              backgroundColor:
                lang === language ? "rgba(56,189,248,0.15)" : "transparent",
              fontSize: "0.85rem",
              "&:hover": {
                backgroundColor: "rgba(56,189,248,0.25)",
                color: ACTIVE_COLOR,
              },
            }}
          >
            {lang}
            <Typography
              component="span"
              sx={{
                color: "#9ca3af",
                fontSize: "0.75rem",
                ml: 1,
              }}
            >
              ({version})
            </Typography>
          </MenuItem>
        ))}
      </Menu>
    </Box>
  );
};

export default LanguageSelector;
