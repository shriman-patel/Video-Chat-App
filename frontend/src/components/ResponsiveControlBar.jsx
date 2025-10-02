import React, { useState } from 'react';
import { IconButton, Badge } from "@mui/material";
import VideocamIcon from "@mui/icons-material/Videocam";
import VideocamOffIcon from "@mui/icons-material/VideocamOff";
import CallEndIcon from "@mui/icons-material/CallEnd";
import MicIcon from "@mui/icons-material/Mic";
import MicOffIcon from "@mui/icons-material/MicOff";
import ScreenShareIcon from "@mui/icons-material/ScreenShare";
import StopScreenShareIcon from "@mui/icons-material/StopScreenShare";
import ChatIcon from "@mui/icons-material/Chat";
import CodeIcon from "@mui/icons-material/Code";
import MoreVertIcon from "@mui/icons-material/MoreVert";

const ResponsiveControlBar = ({
    video, handleVideo,
    handleEndCall,
    audio, handleAudio,
    screenAvailable, toggleScreenShare, isScreenSharing,
    isCodingMode, toggleCodeEditor,
    newMessages, showModal, setModal,
    styles // CSS classes
}) => {
     const [showMoreMenu, setShowMoreMenu] = useState(false);

    // Group 1: Buttons jo CHHOTI SCREEN par MENU mein jayenge (End Call, Screen Share, Code, Chat)
    const menuHiddenButtons = (
        <>
            {/* End Call */}
            <IconButton onClick={handleEndCall}  style={{ color: "red" }}>
                <CallEndIcon />
            </IconButton>
            
            {/* Screen Share */}
            {screenAvailable && (
                <IconButton onClick={toggleScreenShare}  disabled={!screenAvailable} style={{ color: "white" }}>
                    {isScreenSharing ? <StopScreenShareIcon /> : <ScreenShareIcon />}
                </IconButton>
            )}

            {/* Code Editor */}
            <IconButton
                onClick={toggleCodeEditor}
                style={{ color: isCodingMode ? "#33a0ff" : "white" }}
            >
                <CodeIcon />
            </IconButton>

            {/* Chat Button */}
            <Badge badgeContent={newMessages} max={999} color="orange">
                <IconButton onClick={() => setModal(!showModal)} style={{ color: "white" }}>
                    <ChatIcon />
                </IconButton>
            </Badge>
        </>
    );
    
    // Group 2: Buttons jo HAMESHA VISIBLE rahenge (Video aur Audio)
    const alwaysVisibleButtons = (
        <>
            <IconButton onClick={handleVideo} style={{ color: "white" }}>
                {video ? <VideocamIcon /> : <VideocamOffIcon />}
            </IconButton>
            <IconButton onClick={handleAudio} style={{ color: "white" }}>
                {audio ? <MicIcon /> : <MicOffIcon />}
            </IconButton>
        </>
    );


    return (
        // buttonContainers ab ek hi row mein sab ko dikhayega
        <div className={styles.buttonContainers}>
            
            {/* 1. Video aur Audio Buttons (Always Visible) */}
            {alwaysVisibleButtons}
            
            {/* 2. Hidden/Menu Buttons Container */}
            <div className={styles.menuWrapper}>
                
                {/* Badi Screen: Hidden buttons line mein dikhenge */}
                {/* Chhoti screen par yeh div CSS se chhip jayega */}
                <div className={styles.desktopVisible}>
                    {menuHiddenButtons}
                </div>

                {/* Chhoti Screen: Sirf '...' (More) button dikhega */}
                {/* Badi screen par yeh div CSS se chhip jayega */}
                <div className={styles.mobileMenu}>
                    <IconButton onClick={() => setShowMoreMenu(!showMoreMenu)} style={{ color: "white" }}>
                        <MoreVertIcon />
                    </IconButton>
                    
                    {/* Dropdown Content */}
                    {showMoreMenu && (
                        <div className={styles.moreMenuDropdown}>
                            {/* MENU me sirf hidden buttons dikhenge */}
                            {menuHiddenButtons} 
                        </div>
                    )}
                </div>
            </div>
            
        </div>
    );
};

export default ResponsiveControlBar;