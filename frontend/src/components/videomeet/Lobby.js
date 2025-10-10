// src/components/videomeet/Lobby.js
import React from "react";
import { Button, TextField } from "@mui/material";

export default function Lobby({ localVideoref, username, setUsername, connect }) {
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      connect();
    }
  };

  return (
    <div>
      <h2>Enter into Lobby </h2>
      <TextField
        id="outlined-basic"
        label="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        onKeyDown={handleKeyDown}
        variant="outlined"
        margin="normal"
      />
      <Button variant="contained" onClick={connect} style={{ marginLeft: '10px' }}>
        Connect
      </Button>

      <div style={{ marginTop: '20px' }}>
        <video ref={localVideoref} autoPlay muted style={{ width: '300px', height: 'auto', border: '1px solid gray' }}></video>
        <p>Your camera preview</p>
      </div>
    </div>
  );
}