import React, { useState } from 'react';
import { Box, Typography, Button, Menu, MenuItem } from '@mui/material';
import { LANGUAGE_VERSIONS } from "../constants";

const languages = Object.entries(LANGUAGE_VERSIONS);
// Chakra ACTIVE_COLOR को MUI style के लिए उपयोग किया गया
const ACTIVE_COLOR = "skyblue"; // blue.400 के समान एक रंग

const LanguageSelector = ({ language, onSelect }) => {
    // MUI Menu को नियंत्रित करने के लिए State
    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleSelect = (lang) => {
        onSelect(lang);
        handleClose();
    };

    return (
        // Chakra Box (MUI Box के साथ समान)
        <Box ml={2} mb={4}>
            {/* Chakra Text को Typography से बदला गया */}
            <Typography mb={2} fontSize="lg">
                Language:
            </Typography>
            
            {/* Chakra MenuButton as={Button} को MUI Button से बदला गया */}
            <Button
                variant="outlined"
                color="primary"
                onClick={handleClick}
            >
                {language}
            </Button>
            
            {/* Chakra Menu और MenuList को MUI Menu से बदला गया */}
            <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                // MenuList bg="#110c1b" को PaperProps के माध्यम से सेट किया गया
                PaperProps={{
                    sx: {
                        backgroundColor: '#110c1b',
                        color: 'white',
                    },
                }}
            >
                {languages.map(([lang, version]) => (
                    <MenuItem
                        key={lang}
                        onClick={() => handleSelect(lang)}
                        // Chakra MenuItem को MUI MenuItem से बदला गया
                        // Styling को sx prop के माध्यम से सेट किया गया
                        sx={{
                            // Active color and background logic (color, bg)
                            color: lang === language ? ACTIVE_COLOR : 'white',
                            backgroundColor: lang === language ? '#333' : 'transparent', 
                            
                            // _hover logic
                            '&:hover': {
                                backgroundColor: '#333', // gray.900 के समान
                                color: ACTIVE_COLOR,
                            },
                        }}
                    >
                        {lang}
                        &nbsp;
                        {/* Chakra Text as="span" को MUI Typography से बदला गया */}
                        <Typography 
                            component="span" 
                            color="gray" // gray.600 के समान
                            fontSize="sm" 
                            sx={{ ml: 1 }}
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