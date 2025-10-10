// src/components/videomeet/Controls.js

import React, { useState } from "react"; // ✅ useState इंपोर्ट करें
import { Badge, IconButton, Menu, MenuItem } from "@mui/material"; // ✅ Menu, MenuItem और IconButton इंपोर्ट करें
import VideocamIcon from "@mui/icons-material/Videocam";
import VideocamOffIcon from "@mui/icons-material/VideocamOff";
import CallEndIcon from "@mui/icons-material/CallEnd";
import MicIcon from "@mui/icons-material/Mic";
import MicOffIcon from "@mui/icons-material/MicOff";
import ScreenShareIcon from "@mui/icons-material/ScreenShare";
import StopScreenShareIcon from "@mui/icons-material/StopScreenShare";
import ChatIcon from "@mui/icons-material/Chat";
import CodeIcon from '@mui/icons-material/Code';
import CloseFullscreenIcon from '@mui/icons-material/CloseFullscreen';
import MoreVertIcon from '@mui/icons-material/MoreVert'; // ✅ More Options Icon
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile'; // 📁 के बजाय MUI File Icon
import styles from "../../styles/videoComponant.module.css"; 

export default function Controls({
  video, audio, isScreenSharing, screenAvailable, newMessages, 
  isCodingMode, toggleCodeEditor, handleVideo, handleAudio, 
  handleEndCall, toggleScreenShare, handleChatToggle, 
  handleFileSelect, isSharingActive, 
}) {
  
  // 1. मेनू स्टेट: मेनू के एंकर एलिमेंट को ट्रैक करें
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };
  
  // File Share बटन के क्लिक हैंडलर को मेनू क्लोज करने के लिए अपडेट करें
  const handleFileShareClick = () => {
      document.getElementById('file-share-input').click();
      handleMenuClose(); // मेनू बंद करें
  }
  
  // Chat Toggle हैंडलर को मेनू क्लोज करने के लिए अपडेट करें
  const handleChatToggleAndClose = () => {
      handleChatToggle();
      handleMenuClose(); // मेनू बंद करें
  }

  // Code Editor हैंडलर को मेनू क्लोज करने के लिए अपडेट करें
  const handleCodeToggleAndClose = () => {
      toggleCodeEditor();
      handleMenuClose(); // मेनू बंद करें
  }
  
  // Screen Share हैंडलर को मेनू क्लोज करने के लिए अपडेट करें
  const handleScreenShareToggleAndClose = () => {
      toggleScreenShare();
      handleMenuClose(); // मेनू बंद करें
  }

  return (
    <div className={styles.buttonContainers}>
      
      {/* 🔴 1. हमेशा दिखने वाले बटन */}

      {/* Video Toggle */}
      <IconButton onClick={handleVideo} style={{ color: "white" }}>
        {video === true ? <VideocamIcon /> : <VideocamOffIcon />}
      </IconButton>

      {/* Audio Toggle */}
      <IconButton onClick={handleAudio} style={{ color: "white" }}>
        {audio === true ? <MicIcon /> : <MicOffIcon />}
      </IconButton>
      
      {/* End Call (हमेशा लाल) */}
      <IconButton onClick={handleEndCall} style={{ color: "red" }}>
        <CallEndIcon />
      </IconButton>

      
      {/* More Options बटन */}
      <IconButton 
        onClick={handleMenuClick} 
        aria-controls={open ? 'basic-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
        style={{ color: "yellow" }}
      >
        <MoreVertIcon />
      </IconButton>
      
      {/* 🔴 3. छिपी हुई इनपुट (File Share के लिए) */}
      <input 
        type="file" 
        id="file-share-input" 
        onChange={handleFileSelect} 
        style={{ display: 'none' }}
        accept="image/*,application/pdf,.pptx,.ppt"
        disabled={isSharingActive} 
      />

      {/* 🔴 4. मेनू कंपोनेंट */}
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleMenuClose}
      >
        
        {/* File Share (📁) */}
        <MenuItem 
            onClick={handleFileShareClick} 
            disabled={isSharingActive}
        >
            <InsertDriveFileIcon style={{ marginRight: '8px' }}/>
            {isSharingActive ? "Sharing..." : "Share File"}
        </MenuItem>

        {/* Screen Share Toggle */}
        {screenAvailable === true && (
          <MenuItem onClick={handleScreenShareToggleAndClose}>
            {isScreenSharing ? <StopScreenShareIcon style={{ color: "yellow", marginRight: '8px' }}/> : <ScreenShareIcon style={{ marginRight: '8px' }}/>}
            {isScreenSharing ? "Stop Screen Share" : "Share Screen"}
          </MenuItem>
        )}
        
        {/* Code Editor Toggle */}
        <MenuItem onClick={handleCodeToggleAndClose}>
            {isCodingMode ? <CloseFullscreenIcon style={{ color: "#33aaff", marginRight: '8px' }}/> : <CodeIcon style={{ marginRight: '8px' }}/>}
            {isCodingMode ? "Close Code Editor" : "Code Editor"}
        </MenuItem>

        {/* Chat Toggle */}
        <MenuItem onClick={handleChatToggleAndClose}>
            <Badge badgeContent={newMessages} color="secondary">
                <ChatIcon style={{ marginRight: '8px' }}/>
            </Badge>
            Chat
        </MenuItem>
        
      </Menu>
    </div>
  );
}