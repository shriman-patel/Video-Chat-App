// src/components/videomeet/VideoMeet.js

import React, { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import server from "../../environment";
import styles from "../../styles/videoComponant.module.css";
import Lobby from "./Lobby";
import Controls from "./Controls";
import ChatRoom from "./ChatRoom";
import RemoteVideos from "./RemoteVideos";
import LocalVideo from "./LocalVideo";

const server_url = server;
var connections = {};

const peerConfigConnections = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
};

export default function VideoMeetComponent() {
  // === Refs and State ===
  var socketRef = useRef();
  let socketIdRef = useRef();
  let localVideoref = useRef();
  const videoRef = useRef([]); // A ref for the current state of videos array

  let [videoAvailable, setVideoAvailable] = useState(true);
  let [audioAvailable, setAudioAvailable] = useState(true);
  let [video, setVideo] = useState(false); // Initial state should likely be false until 'connect' is clicked
  let [audio, setAudio] = useState(false); // Initial state should likely be false until 'connect' is clicked
  let [screenAvailable, setScreenAvailable] = useState(false);
  let [isScreenSharing, setIsScreenSharing] = useState(false);
let [videos, setVideos] = useState([]);
  let [showChat, setShowChat] = useState(false); // Renamed from showModal for clarity
  let [messages, setMessages] = useState([]);
  let [message, setMessage] = useState("");
  let [newMessages, setNewMessages] = useState(0); // Set to 0 initially
  let [askForUsername, setAskForUsername] = useState(true);
  let [username, setUsername] = useState("");

  let screenTrack = null; // Stored here for screen sharing logic

  // === Utility Functions for WebRTC/Media ===

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

  const getPermissions = async () => {
    try {
      // Check video permission
      const videoPermission = await navigator.mediaDevices.getUserMedia({ video: true }).catch(() => null);
      setVideoAvailable(!!videoPermission);

      // Check audio permission
      const audioPermission = await navigator.mediaDevices.getUserMedia({ audio: true }).catch(() => null);
      setAudioAvailable(!!audioPermission);

      // Check screen sharing support
      setScreenAvailable(!!navigator.mediaDevices.getDisplayMedia);

      // Set initial local stream (muted on lobby)
      if (videoPermission || audioPermission) {
        const userMediaStream = await navigator.mediaDevices.getUserMedia({
          video: !!videoPermission,
          audio: !!audioPermission,
        });
        window.localStream = userMediaStream;
        if (localVideoref.current) {
          localVideoref.current.srcObject = userMediaStream;
        }
      }
    } catch (error) {
      console.error("Error getting permissions:", error);
    }
  };

  const getUserMediaSuccess = (stream) => {
    // 1. Stop old tracks
    try {
      if (window.localStream) {
        window.localStream.getTracks().forEach((track) => track.stop());
      }
    } catch (e) {
      console.log(e);
    }

    window.localStream = stream;
    if (localVideoref.current) {
        localVideoref.current.srcObject = stream;
    }

    // 2. Add stream to all existing connections and send new offer
    for (let id in connections) {
      if (id === socketIdRef.current) continue;
      
      // Update tracks in RTCPeerConnection for existing peers
      stream.getTracks().forEach(track => {
          connections[id].getSenders().forEach(sender => {
              if (sender.track && sender.track.kind === track.kind) {
                  sender.replaceTrack(track);
              }
          });
      });

      connections[id].createOffer().then((description) => {
        connections[id].setLocalDescription(description).then(() => {
          socketRef.current.emit(
            "signal",
            id,
            JSON.stringify({ sdp: connections[id].localDescription })
          );
        });
      }).catch((e) => console.error("Error creating offer:", e));
    }

    // 3. Handle stream ending (e.g., user clicked stop sharing in the browser dialog)
    stream.getTracks().forEach(
      (track) => (track.onended = () => {
        setVideo(false);
        setAudio(false);
        
        // Replace with black/silent stream
        window.localStream = new MediaStream([black(), silence()]);
        if (localVideoref.current) {
            localVideoref.current.srcObject = window.localStream;
        }

        // Send new stream info to all peers (simplified signaling)
        for (let id in connections) {
            window.localStream.getTracks().forEach(track => {
                connections[id].getSenders().forEach(sender => {
                    if (sender.track && sender.track.kind === track.kind) {
                        sender.replaceTrack(track);
                    }
                });
            });

            connections[id].createOffer().then((description) => {
                connections[id].setLocalDescription(description).then(() => {
                    socketRef.current.emit(
                        "signal",
                        id,
                        JSON.stringify({ sdp: connections[id].localDescription })
                    );
                });
            });
        }
      })
    );
  };

  const getUserMedia = async (forceVideo, forceAudio) => {
    const videoState = forceVideo !== undefined ? forceVideo : video;
    const audioState = forceAudio !== undefined ? forceAudio : audio;

    if ((videoState && videoAvailable) || (audioState && audioAvailable)) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: videoState,
          audio: audioState,
        });
        getUserMediaSuccess(stream);
      } catch (e) {
        console.error("Error getting user media:", e);
      }
    } else {
      // If both are turned off, stop local stream tracks
      try {
        if (window.localStream) {
            window.localStream.getTracks().forEach((track) => track.stop());
        }
      } catch (e) {
        console.error("Error stopping tracks:", e);
      }
    }
  };

  // === Toggle Handlers ===

  const handleVideo = () => {
    const nextVideoState = !video;
    setVideo(nextVideoState);
    if (window.localStream) {
      const videoTracks = window.localStream.getVideoTracks();
      if (videoTracks.length > 0) {
        videoTracks.forEach((track) => {
          track.enabled = nextVideoState;
        });
      }
    }
  };

  const handleAudio = () => {
    const nextAudioState = !audio;
    setAudio(nextAudioState);

    if (window.localStream) {
      const audioTracks = window.localStream.getAudioTracks();
      if (audioTracks.length > 0) {
        audioTracks.forEach((track) => {
          track.enabled = nextAudioState;
        });
      }
    }
  };

  const toggleScreenShare = async () => {
    if (!isScreenSharing) {
      try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: true, // You may want audio too
        });
        const newScreenTrack = screenStream.getVideoTracks()[0];
        screenTrack = newScreenTrack; // Store the new track reference

        // Replace track in all peer connections
        for (let id in connections) {
          const sender = connections[id]
            .getSenders()
            .find((s) => s.track && s.track.kind === "video");
          if (sender) {
            await sender.replaceTrack(screenTrack);
          }
        }

        // Update local video element
        if (localVideoref.current) {
          localVideoref.current.srcObject = screenStream;
        }

        // Update local stream reference (important for new connections)
        window.localStream = screenStream;

        // User manually stops screen sharing via browser button
        screenTrack.onended = () => {
          stopScreenShare();
        };

        setIsScreenSharing(true);
        setVideo(false); // Visually indicate local camera is off/replaced
      } catch (err) {
        console.error("Screen share error:", err);
      }
    } else {
      stopScreenShare();
    }
  };

  const stopScreenShare = async () => {
    try {
        // Stop the screen track
        if (screenTrack) {
            screenTrack.stop();
        }

        // Get camera stream back
        const cameraStream = await navigator.mediaDevices.getUserMedia({
            video: videoAvailable,
            audio: audioAvailable,
        });

        // Get the audio tracks from the original localStream (if they exist)
        const audioTracks = window.localStream ? window.localStream.getAudioTracks() : [];
        const cameraTrack = cameraStream.getVideoTracks()[0];

        // Create a new stream with camera video and current audio tracks
        const newStream = new MediaStream([cameraTrack, ...audioTracks]);

        // Replace back with camera track in all peer connections
        for (let id in connections) {
            const sender = connections[id]
                .getSenders()
                .find((s) => s.track && s.track.kind === "video");
            if (sender) await sender.replaceTrack(cameraTrack);
        }

        // Update local video element and window.localStream
        if (localVideoref.current) {
            localVideoref.current.srcObject = newStream;
        }
        window.localStream = newStream;

        setIsScreenSharing(false);
        setVideo(true); // Visually indicate local camera is back on
    } catch (err) {
      console.error("Error stopping screen share:", err);
    }
  };

  const handleEndCall = () => {
    try {
      if (window.localStream) {
        window.localStream.getTracks().forEach((track) => track.stop());
      }
    } catch (e) {
      console.error("Error stopping local tracks on end call:", e);
    }
    // Disconnect socket
    if (socketRef.current) {
        socketRef.current.disconnect();
    }
    window.location.href = "/";
  };

  // === Chat Handlers ===

  const addMessage = (data, sender, socketIdSender) => {
    setMessages((prevMessages) => [
      ...prevMessages,
      { sender: sender, data: data },
    ]);
    if (socketIdSender !== socketIdRef.current && !showChat) {
      setNewMessages((prevNewMessages) => prevNewMessages + 1);
    }
  };

  const handleSendMessage = () => {
    if (message.trim()) {
      socketRef.current.emit("chat-message", message, username);
      setMessage("");
      // Add the message to the local list immediately
      addMessage(message, username, socketIdRef.current);
    }
  };
  
  const handleChatToggle = () => {
      setShowChat((prev) => {
          if (!prev) setNewMessages(0); // Reset new message count when opening chat
          return !prev;
      });
  };

  // === Socket & WebRTC Signaling Logic ===

  let gotMessageFromServer = (fromId, message) => {
    var signal = JSON.parse(message);

    if (fromId !== socketIdRef.current) {
      const pc = connections[fromId];
      if (!pc) return; // Should not happen if user-joined is handled correctly

      if (signal.sdp) {
        pc.setRemoteDescription(new RTCSessionDescription(signal.sdp)).then(() => {
          if (signal.sdp.type === "offer") {
            pc.createAnswer().then((description) => {
              pc.setLocalDescription(description).then(() => {
                socketRef.current.emit(
                  "signal",
                  fromId,
                  JSON.stringify({ sdp: pc.localDescription })
                );
              });
            });
          }
        });
      }

      if (signal.ice) {
        pc.addIceCandidate(new RTCIceCandidate(signal.ice));
      }
    }
  };

  let connectToSocketServer = () => {
    socketRef.current = io.connect(server_url, { secure: false });

    socketRef.current.on("signal", gotMessageFromServer);

    socketRef.current.on("connect", () => {
      socketRef.current.emit("join-call", window.location.href);
      socketIdRef.current = socketRef.current.id;

      socketRef.current.on("chat-message", addMessage);

      socketRef.current.on("user-left", (id) => {
        setVideos((videos) => videos.filter((video) => video.socketId !== id));
        delete connections[id];
      });

      socketRef.current.on("user-joined", (id, clients) => {
        clients.forEach((socketListId) => {
          if (socketListId === socketIdRef.current) return;
          
          // 1. Create RTCPeerConnection
          connections[socketListId] = new RTCPeerConnection(peerConfigConnections);

          // 2. Handle ICE Candidates
          connections[socketListId].onicecandidate = function (event) {
            if (event.candidate != null) {
              socketRef.current.emit(
                "signal",
                socketListId,
                JSON.stringify({ ice: event.candidate })
              );
            }
          };

          // 3. Handle incoming stream
          connections[socketListId].onaddstream = (event) => {
            const stream = event.stream;
            
            // Function to update the videos state
            setVideos((currentVideos) => {
                let updatedVideos;
                let videoExists = currentVideos.find(v => v.socketId === socketListId);

                if (videoExists) {
                    // Update existing stream
                    updatedVideos = currentVideos.map(v =>
                        v.socketId === socketListId ? { ...v, stream: stream } : v
                    );
                } else {
                    // Create new video object
                    const newVideo = {
                        socketId: socketListId,
                        stream: stream,
                    };
                    updatedVideos = [...currentVideos, newVideo];
                }
                
                // Update ref for immediate access
                videoRef.current = updatedVideos; 
                return updatedVideos;
            });
          };

          // 4. Add the local stream (camera/screen share)
          const streamToAdd = window.localStream || new MediaStream([black(), silence()]);
          connections[socketListId].addStream(streamToAdd);
        });

        // 5. Send Offer to newly joined users (if I'm the one who just joined)
        if (id === socketIdRef.current) {
          clients.forEach(id2 => {
            if (id2 === socketIdRef.current) return;

            connections[id2].createOffer().then((description) => {
              connections[id2].setLocalDescription(description).then(() => {
                socketRef.current.emit(
                  "signal",
                  id2,
                  JSON.stringify({ sdp: connections[id2].localDescription })
                );
              });
            }).catch((e) => console.error("Error creating initial offer:", e));
          });
        }
      });
    });
  };

  // === Initial Setup and Lobby Connection ===

  useEffect(() => {
    getPermissions();
  }, []);

  let connect = () => {
    if (!username.trim()) return;
    setAskForUsername(false);
    setVideo(videoAvailable); // Set initial media states based on permissions
    setAudio(audioAvailable);
    getUserMedia(videoAvailable, audioAvailable); // Get the media stream for real
    connectToSocketServer();
  };

  // === Render ===

  if (askForUsername) {
    return (
      <Lobby
        localVideoref={localVideoref}
        username={username}
        setUsername={setUsername}
        connect={connect}
      />
    );
  }

  return (
    <div className={styles.meetVideoContainer}>
      {showChat && (
        <ChatRoom
          messages={messages}
          message={message}
          setMessage={setMessage}
          sendMessage={handleSendMessage}
          closeChat={handleChatToggle}
        />
      )}

      <Controls
        video={video}
        audio={audio}
        isScreenSharing={isScreenSharing}
        screenAvailable={screenAvailable}
        newMessages={newMessages}
        handleVideo={handleVideo}
        handleAudio={handleAudio}
        handleEndCall={handleEndCall}
        toggleScreenShare={toggleScreenShare}
        handleChatToggle={handleChatToggle}
      />

      <LocalVideo localVideoref={localVideoref} />

      <RemoteVideos videos={videoRef.current} />
    </div>
  );
}