// src/components/videomeet/Lobby.js
import React from "react";
import { Button, TextField } from "@mui/material";
import styles from "../../styles/videoComponant.module.css";
export default function Lobby({
  localVideoref,
  username,
  setUsername,
  connect,
}) {
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      connect();
    }
  };

  return (
    <div className={styles.lobbyContainer}>
      <h2 className={styles.lobbyHeader}>Enter into Lobby </h2>

      <div className={styles.lobbybox}>
          <div className={styles.leftcontent}>
              <div className={styles.textFieldWrapper}> 
          <TextField
            id="outlined-basic"
            label="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onKeyDown={handleKeyDown}
            variant="outlined"
            margin="normal"
          />
          </div>
          <Button
        variant="contained" 
            onClick={connect}

            disabled={!username.trim()}
            className={styles.connectButton}
          >
            Connect
          </Button>
          </div>

        <div className={styles.rightcontent}>
          <video ref={localVideoref} autoPlay muted></video>
          <p>Your camera preview</p>
        </div>
      </div>
    </div>
  );
}

<script></script>;
