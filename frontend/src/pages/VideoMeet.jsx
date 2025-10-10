import React, { useEffect, useRef, useState, useCallback } from "react";
import io from "socket.io-client";
import { Box } from "@chakra-ui/react";
import { Badge, IconButton, TextField, Button } from "@mui/material";
import VideocamIcon from "@mui/icons-material/Videocam";
import VideocamOffIcon from "@mui/icons-material/VideocamOff";
import styles from "../styles/videoComponant.module.css";
import CallEndIcon from "@mui/icons-material/CallEnd";
import MicIcon from "@mui/icons-material/Mic";
import MicOffIcon from "@mui/icons-material/MicOff";
import ScreenShareIcon from "@mui/icons-material/ScreenShare";
import StopScreenShareIcon from "@mui/icons-material/StopScreenShare";
import ChatIcon from "@mui/icons-material/Chat";
import server from "../environment";
import CodeEditor from "../components/CodeEditor.jsx";
import CodeIcon from "@mui/icons-material/Code";
import ResponsiveControlBar from "../components/ResponsiveControlBar.jsx";

const server_url = server;
var connections = {};

const peerConfigConnections = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
};

// Dummy functions for black/silence streams
const silence = () => {
  let ctx = new AudioContext();
  let oscillator = ctx.createOscillator();
  let dst = oscillator.connect(ctx.createMediaStreamDestination());
  oscillator.start();
  ctx.resume();
  return Object.assign(dst.stream.getAudioTracks()[0], { enabled: false });
};

const black = ({ width = 640, height = 480 } = {}) => {
  let canvas = Object.assign(document.createElement("canvas"), {
    width,
    height,
  });
  canvas.getContext("2d").fillRect(0, 0, width, height);
  let stream = canvas.captureStream();
  return Object.assign(stream.getVideoTracks()[0], { enabled: false });
};

const blackSilence = (...args) => new MediaStream([black(...args), silence()]);

export default function VideoMeetComponent() {
  var socketRef = useRef();
  let socketIdRef = useRef();
  let localVideoref = useRef();
  const [isSharingCodeEditor, setIsSharingCodeEditor] = useState(false);
  let [videoAvailable, setVideoAvailable] = useState(true);
  let [audioAvailable, setAudioAvailable] = useState(true);
  let [video, setVideo] = useState(true); // Default to on
  let [audio, setAudio] = useState(true); // Default to on
  let [screenAvailable, setScreenAvailable] = useState(false);
  let [showModal, setModal] = useState(false); // Default to false for main view
  let [messages, setMessages] = useState([]);
  let [message, setMessage] = useState("");
  let [newMessages, setNewMessages] = useState(0);
  let [askForUsername, setAskForUsername] = useState(true);
  let [username, setUsername] = useState("");
  let [isCodingMode, setIsCodingMode] = useState(false);
  const videoRef = useRef([]);
  let [videos, setVideos] = useState([]);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  let screenTrack = null;
  let cameraStreamRef = useRef(null); // To store the original camera stream

  // --- Chat Message Handler (Use useCallback for stable function reference) ---
  const addMessage = useCallback((data, sender, socketIdSender) => {
    setMessages((prevMessages) => [
      ...prevMessages,
      { sender: sender, data: data },
    ]);
    // NOTE: Console log यहाँ से हटा दिया गया है ताकि render phase में side effects न हों
    if (socketIdSender !== socketIdRef.current && showModal === false) {
      setNewMessages((prevNewMessages) => prevNewMessages + 1);
    }
  }, [showModal]); 

  // --- WebRTC Signaling Handler (Use useCallback) ---
  const gotMessageFromServer = useCallback((fromId, message) => {
    if (!connections[fromId]) return;

    let signal = JSON.parse(message);

    if (signal.ice) {
      connections[fromId]
        .addIceCandidate(new RTCIceCandidate(signal.ice))
        .catch((e) => console.log("ICE Error:", e));
    } else if (signal.sdp) {
      connections[fromId]
        .setRemoteDescription(new RTCSessionDescription(signal.sdp))
        .then(() => {
          if (signal.sdp.type === "offer") {
            connections[fromId]
              .createAnswer()
              .then((description) => {
                connections[fromId]
                  .setLocalDescription(description)
                  .then(() => {
                    socketRef.current.emit(
                      "signal",
                      fromId,
                      JSON.stringify({
                        sdp: connections[fromId].localDescription,
                      })
                    );
                  })
                  .catch((e) => console.log("SetLocalDescription Error:", e));
              })
              .catch((e) => console.log("CreateAnswer Error:", e));
          }
        })
        .catch((e) => console.log("SetRemoteDescription Error:", e));
    }
  }, []); 

  // Utility to get initial media
  const getPermissions = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      window.localStream = stream;
      cameraStreamRef.current = stream; 
      setVideoAvailable(true);
      setAudioAvailable(true);

      if (localVideoref.current) {
        localVideoref.current.srcObject = stream;
      }
      if (navigator.mediaDevices.getDisplayMedia) {
        setScreenAvailable(true);
      }
    } catch (error) {
      console.error("Error getting initial media:", error);
      setVideoAvailable(false);
      setAudioAvailable(false);
      window.localStream = blackSilence();
      if (navigator.mediaDevices.getDisplayMedia) {
        setScreenAvailable(true);
      }
    }
  }, []);

  // --- useEffect 1: Initial Permissions ---
  useEffect(() => {
    getPermissions();
  }, [getPermissions]);

  // --- useEffect 2: Local Video Autoplay (Lobby) ---
  useEffect(() => {
    if (
      askForUsername === false &&
      localVideoref.current &&
      window.localStream
    ) {
      localVideoref.current.srcObject = window.localStream;
      localVideoref.current.play().catch((e) => {
        console.log("Local video autoplay was blocked or failed:", e);
      });
    }
  }, [askForUsername]);


  // --- FIX: useEffect 3: Socket Connection and Cleanup ---
  useEffect(() => {
    if (askForUsername === false && !socketRef.current) {
      // 1. Initial Media tracks enable/disable 
      if (window.localStream) {
        window.localStream.getVideoTracks().forEach((track) => (track.enabled = videoAvailable));
        window.localStream.getAudioTracks().forEach((track) => (track.enabled = audioAvailable));
      }
        
      // 2. Connect to Socket Server
      const socket = io.connect(server_url, { secure: false });
      socketRef.current = socket;

      // 3. Attach Listeners and Join Call
      socket.on("signal", gotMessageFromServer);
      
      // ✅ CHAT FIX: chat-message लिसनर केवल यहाँ एक बार अटैच करें
      socket.on("chat-message", addMessage); 

      socket.on("connect", () => {
        socket.emit("join-call", window.location.href);
        socketIdRef.current = socket.id;

        socket.on("user-left", (id) => {
          setVideos((videos) => videos.filter((video) => video.socketId !== id));
          delete connections[id];
        });

        socket.on("user-joined", (id, clients) => {
          clients.forEach((socketListId) => {
            if (socketListId === socket.id) return; 

            connections[socketListId] = new RTCPeerConnection(
              peerConfigConnections
            );

            connections[socketListId].onicecandidate = function (event) {
              if (event.candidate != null) {
                socket.emit(
                  "signal",
                  socketListId,
                  JSON.stringify({ ice: event.candidate })
                );
              }
            };

            connections[socketListId].ontrack = (event) => {
              let remoteStream = event.streams[0];
              let newVideo = {
                socketId: socketListId,
                stream: remoteStream,
                autoplay: true,
                playsinline: true,
              };

              setVideos((videos) => {
                if (videos.some((v) => v.socketId === socketListId))
                  return videos;
                const updatedVideos = [...videos, newVideo];
                videoRef.current = updatedVideos;
                return updatedVideos;
              });
            };

            const streamToSend = window.localStream || blackSilence();
            streamToSend.getTracks().forEach((track) => {
              connections[socketListId].addTrack(track, streamToSend);
            });

            if (id === socket.id) {
              connections[socketListId]
                .createOffer()
                .then((description) => {
                  connections[socketListId]
                    .setLocalDescription(description)
                    .then(() => {
                      socket.emit(
                        "signal",
                        socketListId,
                        JSON.stringify({
                          sdp: connections[socketListId].localDescription,
                        })
                      );
                    })
                    .catch((e) => console.log(e));
                })
                .catch((e) => console.log(e));
            }
          });
        });
      });

      // 4. Cleanup Function: StrictMode और अनमाउंट पर लिसनर्स को हटाता है
      return () => {
        if (socket) {
            socket.off("signal", gotMessageFromServer);
            socket.off("chat-message", addMessage); // ✅ FIX: लिसनर हटा दिया गया
            socket.off("connect"); 
            socket.off("user-left");
            socket.off("user-joined");
            socket.disconnect();
            socketRef.current = null;
            // connections ऑब्जेक्ट को भी साफ करें
            for (let id in connections) {
                if (connections[id]) {
                    connections[id].close();
                }
                delete connections[id];
            }
        }
      };
    }
  }, [askForUsername, videoAvailable, audioAvailable, gotMessageFromServer, addMessage]); 
  
  // Function to replace the video track for all connections
  const replaceVideoTrack = (newTrack, stream) => {
    for (let id in connections) {
      const sender = connections[id]
        .getSenders()
        .find((s) => s.track && s.track.kind === "video");

      if (sender) {
        sender.replaceTrack(newTrack);
      }
    } 

    if (localVideoref.current) {
      localVideoref.current.srcObject = stream;
      window.localStream = stream;
    }
  }; 

  // --- Screen Sharing Logic (No change needed) ---
  const stopScreenShare = useCallback(async () => {
    if (screenTrack) {
      screenTrack.stop();
      screenTrack = null;
    } 

    if (cameraStreamRef.current) {
      const cameraTrack = cameraStreamRef.current.getVideoTracks()[0];
      const audioTracks = cameraStreamRef.current.getAudioTracks();
      const newStream = new MediaStream([cameraTrack, ...audioTracks]);

      replaceVideoTrack(cameraTrack, newStream); 
      if (!video && cameraTrack) {
        cameraTrack.enabled = false;
      }
    } else {
      const silentStream = blackSilence();
      const silentTrack = silentStream.getVideoTracks()[0];
      replaceVideoTrack(silentTrack, silentStream);
    }

    setIsScreenSharing(false);
  }, [video]);

  const toggleScreenShare = useCallback(
    async (forceOn = false) => {
      if (isScreenSharing && !forceOn) {
        await stopScreenShare();
        return; 
      } else if (!isScreenSharing || forceOn) {
        try {
          const screenStream = await navigator.mediaDevices.getDisplayMedia({
            video: true,
            audio: true,
          });

          screenTrack = screenStream.getVideoTracks()[0]; 
          screenTrack.onended = () => {
            stopScreenShare();
          };

          replaceVideoTrack(screenTrack, screenStream);

          setIsScreenSharing(true);
        } catch (err) {
          console.error("Screen share error:", err);
        }
      }
    },
    [isScreenSharing, stopScreenShare]
  );

  // --- Code Editor Logic (No change needed) ---
  const toggleCodeEditor = useCallback(() => {
    setIsCodingMode((prevMode) => !prevMode);
  }, []); 

  // --- REMOVED: connectToSocketServer and getMedia (Logic is now in useEffect) ---

  let handleVideo = () => {
    const nextVideoState = !video;
    setVideo(nextVideoState);
    if (window.localStream) {
      window.localStream.getVideoTracks().forEach((track) => {
        track.enabled = nextVideoState;
      });
    }
  };

  let handleAudio = () => {
    const nextAudioState = !audio;
    setAudio(nextAudioState);
    if (window.localStream) {
      window.localStream.getAudioTracks().forEach((track) => {
        track.enabled = nextAudioState;
      });
    }
  };

  let handleEndCall = () => {
    try {
      if (window.localStream) {
        window.localStream.getTracks().forEach((track) => track.stop());
      }
    } catch (e) {}

    if (socketRef.current) {
      socketRef.current.disconnect();
    }

    window.location.href = "/";
  };

  // --- UPDATED: connect function (Now just updates state to trigger useEffect) ---
  let connect = () => {
    if (username.trim() === "") {
      alert("Please enter a username.");
      return;
    }
    setAskForUsername(false);
  };

  let sendMessage = () => {
    if (message.trim() === "") return;

    // सुनिश्चित करें कि socketRef.current मौजूद है
    if (socketRef.current) {
        socketRef.current.emit("chat-message", message, username);
    } else {
        console.error("Socket not connected, cannot send message.");
    }
    
    setMessage("");
  };

  return (
    <div>
      {askForUsername === true ? (
        <div className={styles.mainloddy}>
          <h2>Join a room</h2>
          <div className={styles.entervideo}>
            <div className={styles.sidebar}>
              <TextField
                id="outlined-basic"
                label="Enter Full_Name"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                variant="outlined"
              />
              <Button variant="contained" onClick={connect}>
                Connect
              </Button>
            </div>
            {/* lobby video  */}
            <div id="rightvideo">
              <video ref={localVideoref} autoPlay muted></video>
            </div>
          </div>
        </div>
      ) : (
        <div className={styles.meetVideoContainer}>
          {showModal ? (
            <div className={styles.chatRoom}>
              <div className={styles.chatContainer}>
                <h1>Chat</h1>
                <div className={styles.chattingDisplay}>
                  {messages.length !== 0 ? (
                    messages.map((item, index) => {
                      // console.log(messages); // REMOVED console.log
                      return (
                        <div style={{ marginBottom: "20px" }} key={index}>
                          <p style={{ fontWeight: "bold" }}>{item.sender}</p>
                          <p>{item.data}</p>
                        </div>
                      );
                    })
                  ) : (
                    <p>No Messages Yet</p>
                  )}
                </div>

                <div className={styles.chattingArea}>
                  <TextField
                    className={styles.TextField}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={(e) => { // Added Enter key handler
                        if (e.key === 'Enter') sendMessage();
                    }}
                    id="outlined-basic"
                    label="Enter Your chat"
                    variant="outlined"
                  />
                  <Button variant="contained" onClick={sendMessage}>
                    Send
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <></>
          )}

          {/* --- Control Bar --- */}
          <ResponsiveControlBar
            video={video}
            handleVideo={handleVideo}
            handleEndCall={handleEndCall}
            audio={audio}
            handleAudio={handleAudio}
            screenAvailable={screenAvailable}
            toggleScreenShare={toggleScreenShare}
            isScreenSharing={isScreenSharing}
            isCodingMode={isCodingMode}
            toggleCodeEditor={toggleCodeEditor}
            newMessages={newMessages}
            showModal={showModal}
            setModal={setModal}
            styles={styles}
          />

          {isCodingMode ? (
            <div className={styles.codeEditorView}>
              <Box minH="100vh" bg="#0f0a19" color="gray.500" px={6} py={8}>
                <CodeEditor
                  socket={socketRef.current}
                  roomId={window.location.href}
                />
              </Box>
            </div>
          ) : (
            <div className={styles.conferenceView}>
              {videos.map((video) => (
                <div key={video.socketId}>
                  <video
                    data-socket={video.socketId}
                    ref={(ref) => {
                      if (ref && video.stream) {
                        ref.srcObject = video.stream;
                      }
                    }}
                    autoPlay
                  ></video>
                </div>
              ))}
            </div>
          )}

          <video
            className={styles.meetUserVideo}
            ref={localVideoref}
            autoPlay
            muted
          ></video>
        </div>
      )}
    </div>
  );
}