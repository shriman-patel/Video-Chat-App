// src/components/videomeet/RemoteVideos.js
import React, { useEffect, useRef } from "react";
import styles from "../../styles/videoComponant.module.css"; // Import the styles

export default function RemoteVideos({ videos }) {

  return (
    <div className={styles.conferenceView}>
      {videos.map((video) => (
        <div key={video.socketId}>
          <video
            data-socket={video.socketId}
            // Use a ref callback to assign the stream when the component mounts or updates
            ref={(ref) => {
              if (ref && video.stream) {
                ref.srcObject = video.stream;
              }
            }}
            autoPlay
            playsInline
          ></video>
        </div>
      ))}
    </div>
  );
}