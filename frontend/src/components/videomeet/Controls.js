// src/components/videomeet/Controls.js
import React from "react";
import { Badge, IconButton } from "@mui/material";
import VideocamIcon from "@mui/icons-material/Videocam";
import VideocamOffIcon from "@mui/icons-material/VideocamOff";
import CallEndIcon from "@mui/icons-material/CallEnd";
import MicIcon from "@mui/icons-material/Mic";
import MicOffIcon from "@mui/icons-material/MicOff";
import ScreenShareIcon from "@mui/icons-material/ScreenShare";
import StopScreenShareIcon from "@mui/icons-material/StopScreenShare";
import ChatIcon from "@mui/icons-material/Chat";
import styles from "../../styles/videoComponant.module.css"; // Import the styles

export default function Controls({
  video,
  audio,
  isScreenSharing,
  screenAvailable,
  newMessages,
  handleVideo,
  handleAudio,
  handleEndCall,
  toggleScreenShare,
  handleChatToggle,
}) {
  return (
    <div className={styles.buttonContainers}>
      {/* Video Toggle */}
      <IconButton onClick={handleVideo} style={{ color: "white" }}>
        {video === true ? <VideocamIcon /> : <VideocamOffIcon />}
      </IconButton>

      {/* End Call */}
      <IconButton onClick={handleEndCall} style={{ color: "red" }}>
        <CallEndIcon />
      </IconButton>

      {/* Audio Toggle */}
      <IconButton onClick={handleAudio} style={{ color: "white" }}>
        {audio === true ? <MicIcon /> : <MicOffIcon />}
      </IconButton>

      {/* Screen Share Toggle */}
      {screenAvailable === true && (
        <IconButton onClick={toggleScreenShare} style={{ color: "white" }}>
          {isScreenSharing ? <StopScreenShareIcon /> : <ScreenShareIcon />}
        </IconButton>
      )}

      {/* Chat Toggle */}
      <Badge badgeContent={newMessages} max={999} color="secondary" overlap="circular">
        <IconButton onClick={handleChatToggle} style={{ color: "white" }}>
          <ChatIcon />
        </IconButton>
      </Badge>
    </div>
  );
}