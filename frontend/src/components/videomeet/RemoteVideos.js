import React, { useEffect, useRef } from "react";
import styles from "../../styles/videoComponant.module.css";

export default function RemoteVideos({ videos, userNames }) {
  return (
    <div className={styles.conferenceView}>
      {videos.map((video) => (
        <RemoteVideoItem key={video.socketId} video={video} username={userNames?.[video.socketId]} />
      ))}
    </div>
  );
}

function RemoteVideoItem({ video, username }) {
  const videoRef = useRef();

  useEffect(() => {
    if (videoRef.current && video.stream) {
      videoRef.current.srcObject = video.stream;
    }
  }, [video.stream]);

  return (
    <div>
   
      <video ref={videoRef} autoPlay playsInline></video>
    </div>
  );
}
