 import React, { useEffect, useRef, useState, useCallback } from "react";

import io from "socket.io-client";

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

import CodeEditor from "../components/CodeEditor.js";

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



  // --- WebRTC Signaling Handler (ESLint FIX) ---

  let gotMessageFromServer = (fromId, message) => {

      if (!connections[fromId]) return; // Connection might not be established yet

     

      // JSON.parse message from string

      let signal = JSON.parse(message);



      // 1. Handle ICE Candidates

      if (signal.ice) {

          connections[fromId].addIceCandidate(new RTCIceCandidate(signal.ice)).catch((e) => console.log("ICE Error:", e));

      }

      // 2. Handle SDP Offer/Answer

      else if (signal.sdp) {

          connections[fromId].setRemoteDescription(new RTCSessionDescription(signal.sdp)).then(() => {

              // If it's an OFFER, send an ANSWER

              if (signal.sdp.type === "offer") {

                  connections[fromId].createAnswer().then((description) => {

                      connections[fromId].setLocalDescription(description).then(() => {

                          socketRef.current.emit(

                              "signal",

                              fromId,

                              JSON.stringify({ sdp: connections[fromId].localDescription })

                          );

                      }).catch((e) => console.log("SetLocalDescription Error:", e));

                  }).catch((e) => console.log("CreateAnswer Error:", e));

              }

          }).catch((e) => console.log("SetRemoteDescription Error:", e));

      }

  };

  // --- End WebRTC Signaling Handler ---





  // Utility to get initial media

  const getPermissions = useCallback(async () => {

    try {

      // Check permissions

      const stream = await navigator.mediaDevices.getUserMedia({

        video: true,

        audio: true,

      });



      window.localStream = stream;

      cameraStreamRef.current = stream; // Save the camera stream

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

      // Fallback for connections if no camera/mic

      window.localStream = blackSilence();

      if (navigator.mediaDevices.getDisplayMedia) {

        setScreenAvailable(true);

      }

    }

  }, []);



  useEffect(() => {

    getPermissions();

  }, [getPermissions]);



useEffect(() => {

    if (askForUsername === false && localVideoref.current && window.localStream) {

        localVideoref.current.srcObject = window.localStream;

        localVideoref.current.play().catch(e => {

            console.log("Local video autoplay was blocked or failed:", e);

        });

    }

},[askForUsername]);



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

   

    // Update local video element's source

    if (localVideoref.current) {

        localVideoref.current.srcObject = stream;

        window.localStream = stream;

    }

  };



  // --- Screen Sharing Logic ---

  const stopScreenShare = useCallback(async () => {

    if (screenTrack) {

        screenTrack.stop();

        screenTrack = null;

    }



    // Use the saved camera stream

    if (cameraStreamRef.current) {

      const cameraTrack = cameraStreamRef.current.getVideoTracks()[0];

      const audioTracks = cameraStreamRef.current.getAudioTracks();

      const newStream = new MediaStream([cameraTrack, ...audioTracks]);



      replaceVideoTrack(cameraTrack, newStream);

     

      // Re-enable camera track if it was off

      if (!video && cameraTrack) {

        cameraTrack.enabled = false;

      }



    } else {

        // Fallback to black/silence stream if camera wasn't available

        const silentStream = blackSilence();

        const silentTrack = silentStream.getVideoTracks()[0];

        replaceVideoTrack(silentTrack, silentStream);

    }

   

    setIsScreenSharing(false);

  }, [video]);





 const toggleScreenShare = useCallback( async(forceOn = false) => {

   

    // 1. If already sharing and not forcing on -> STOP (यहां स्क्रीन बंद होगी)

    if (isScreenSharing && !forceOn) {

        await stopScreenShare();

        return; // ✅ FIX: यहां 'return' लगाना ज़रूरी है

    }

    // 2. If not sharing or forcing on -> START (यहां स्क्रीन शेयर शुरू होगा)

    else if (!isScreenSharing || forceOn) {

        try {

            const screenStream = await navigator.mediaDevices.getDisplayMedia({

                video: true,

                audio: true,

            });

            screenTrack = screenStream.getVideoTracks()[0];  

           

            // onended listener: यह सुनिश्चित करता है कि जब यूजर ब्राउज़र बटन से बंद करे, तो भी State अपडेट हो।

            screenTrack.onended = () => {

                stopScreenShare();

            };



            replaceVideoTrack(screenTrack, screenStream);



            setIsScreenSharing(true);

        } catch (err) {

            console.error("Screen share error:", err);

        }

    }

}, [isScreenSharing, stopScreenShare]); // isCodingMode dependency यहां से हटा दी गई है



  // --- Code Editor Logic ---

  const toggleCodeEditor = useCallback(() => {

    // 💡 FIX: केवल लोकल State को टॉगल करें।

    // Screen Share को बंद न करें, और Peers को कोई सिग्नल न भेजें।

    setIsCodingMode(prevMode => !prevMode);

}, []); // Dependencies हटा दें





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

          connections[socketListId] = new RTCPeerConnection(peerConfigConnections);

         

          connections[socketListId].onicecandidate = function (event) {

            if (event.candidate != null) {

              socketRef.current.emit(

                "signal",

                socketListId,

                JSON.stringify({ ice: event.candidate })

              );

            }

          };



          // ✅ FIX 1: Using ontrack to receive streams (prevents duplication)

          connections[socketListId].ontrack = (event) => {

            // event.streams[0] is the remote MediaStream

            let remoteStream = event.streams[0];

           

            let newVideo = {

              socketId: socketListId,

              stream: remoteStream,

              autoplay: true,

              playsinline: true,

            };



            setVideos((videos) => {

              // Check if video already exists to prevent duplicate UI elements

              if (videos.some(v => v.socketId === socketListId)) return videos;

              const updatedVideos = [...videos, newVideo];

              videoRef.current = updatedVideos;

              return updatedVideos;

            });

          };

         

          // ✅ FIX 2: Using addTrack to send local stream (replaces addStream)

          const streamToSend = window.localStream || blackSilence();

          streamToSend.getTracks().forEach(track => {

            connections[socketListId].addTrack(track, streamToSend);

          });

         

          // If this is the newly joined user (who needs to send an offer)

          if (id === socketIdRef.current) {

            connections[socketListId].createOffer().then((description) => {

              connections[socketListId].setLocalDescription(description).then(() => {

                socketRef.current.emit(

                  "signal",

                  socketListId,

                  JSON.stringify({ sdp: connections[socketListId].localDescription })

                );

              }).catch((e) => console.log(e));

            }).catch((e) => console.log(e));

          }

        });

      });

    });

  };



  // Simplified initial media setup

  let getMedia = () => {

    setVideo(videoAvailable);

    setAudio(audioAvailable);

    // Ensure local stream tracks are enabled/disabled based on state

    if (window.localStream) {

        window.localStream.getVideoTracks().forEach(track => track.enabled = videoAvailable);

        window.localStream.getAudioTracks().forEach(track => track.enabled = audioAvailable);

    }

    connectToSocketServer();

  };





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



  let connect = () => {

    if (username.trim() === "") {

        alert("Please enter a username.");

        return;

    }

    setAskForUsername(false);

    getMedia(); // Start media and connect to socket

  };



  const addMessage = (data, sender, socketIdSender) => {

    setMessages((prevMessages) => [

      ...prevMessages,

      { sender: sender, data: data },

    ]);

    if (socketIdSender !== socketIdRef.current && showModal === false) {

      setNewMessages((prevNewMessages) => prevNewMessages + 1);

    }

  };

 

  let sendMessage = () => {

    if (message.trim() === "") return;

    socketRef.current.emit("chat-message", message, username);

    setMessage("");

  };





  return (

    <div>

       {askForUsername === true ? (

        <div>

          <h2>Enter into Lobby </h2>

          <TextField

            id="outlined-basic"

            label="Username"

            value={username}

            onChange={(e) => setUsername(e.target.value)}

            variant="outlined"

          />

          <Button variant="contained" onClick={connect}>

            Connect

          </Button>



          <div>

            <video ref={localVideoref} autoPlay muted></video>

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

                      console.log(messages);

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

                    value={message}

                    onChange={(e) => setMessage(e.target.value)}

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

                  <CodeEditor

                      socket={socketRef.current}

                     

                      roomId={window.location.href}

                  />

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