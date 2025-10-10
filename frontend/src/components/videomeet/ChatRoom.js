// src/components/videomeet/ChatRoom.js
import React from "react";
import { Button, TextField, IconButton } from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';
import styles from "../../styles/videoComponant.module.css"; // Import the styles

export default function ChatRoom({ messages, message, setMessage, sendMessage, closeChat }) {
    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    };

    return (
        <div className={styles.chatRoom}>
            <div className={styles.chatContainer}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h1>Chat</h1>
                    <IconButton onClick={closeChat}>
                        <CloseIcon />
                    </IconButton>
                </div>

                <div className={styles.chattingDisplay}>
                    {messages.length !== 0 ? (
                        messages.map((item, index) => (
                            <div style={{ marginBottom: "20px" }} key={index}>
                                <p style={{ fontWeight: "bold" }}>{item.sender}</p>
                                <p>{item.data}</p>
                            </div>
                        ))
                    ) : (
                        <p>No Messages Yet</p>
                    )}
                </div>

                <div className={styles.chattingArea}>
                    <TextField
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyDown={handleKeyDown}
                        id="outlined-basic"
                        label="Enter Your chat"
                        variant="outlined"
                        fullWidth
                    />
                    <Button variant="contained" onClick={sendMessage} style={{ marginLeft: '10px' }}>
                        Send
                    </Button>
                </div>
            </div>
        </div>
    );
}